"""
ZUTING 部署脚本 — 小轻服务器 (120.24.31.151)
部署 NestJS API + Next.js Web + Vite Admin
"""

import paramiko
import time
import tempfile
import subprocess
import os
from pathlib import Path

SERVER = "120.24.31.151"
USER = "root"
PASSWORD = "y1234567890."
REMOTE_BASE = "/opt/zuting"
API_PORT = 3002
WEB_PORT = 3003
ADMIN_PORT = 3004
DB_NAME = "zuting"
PG_CONTAINER = "zuoyelang-postgres"
PG_USER = "zuoyelang"
PROJECT_ROOT = Path(__file__).parent.parent


def run(ssh, cmd, show=True):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if show and out:
        print(out)
    if err and "WARNING" not in err and "NOTICE" not in err and "npm warn" not in err.lower():
        print(f"  ERR: {err[:300]}")
    return out


def pack_local():
    """本地打包 API / Web / Admin 构建产物"""
    tmp = tempfile.gettempdir()

    # API: dist/ + prisma/
    print("  打包 API...")
    api_dir = PROJECT_ROOT / "services" / "api"
    subprocess.run([
        "tar", "czf", f"{tmp}/zuting-api.tar.gz",
        "-C", str(api_dir),
        "dist", "prisma", "package.json",
    ], check=True)

    # Web: .next/standalone + .next/static
    print("  打包 Web...")
    web_dir = PROJECT_ROOT / "apps" / "web"
    next_dir = web_dir / ".next"
    subprocess.run([
        "tar", "czf", f"{tmp}/zuting-web.tar.gz",
        "-C", str(next_dir),
        "standalone", "static",
    ], check=True)

    # Admin: dist/
    print("  打包 Admin...")
    admin_dir = PROJECT_ROOT / "apps" / "admin"
    subprocess.run([
        "tar", "czf", f"{tmp}/zuting-admin.tar.gz",
        "-C", str(admin_dir),
        "dist",
    ], check=True)

    return tmp


def main():
    print("=" * 60)
    print("  ZUTING → 小轻部署")
    print("=" * 60)

    # ── 0. 本地打包 ──
    print("\n[0/7] 本地打包构建产物...")
    tmp = pack_local()
    print("  ✓ 打包完成")

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    sftp = ssh.open_sftp()

    # ── 1. 目录 + 数据库 ──
    print("\n[1/7] 准备环境...")
    run(ssh, f"rm -rf {REMOTE_BASE}/api {REMOTE_BASE}/web {REMOTE_BASE}/admin && mkdir -p {REMOTE_BASE}/api {REMOTE_BASE}/web {REMOTE_BASE}/admin", show=False)

    out = run(ssh, f'docker exec {PG_CONTAINER} psql -U {PG_USER} -tc "SELECT 1 FROM pg_database WHERE datname=\'{DB_NAME}\'"', show=False)
    if "1" not in out:
        run(ssh, f'docker exec {PG_CONTAINER} psql -U {PG_USER} -c "CREATE DATABASE {DB_NAME};"', show=False)
        print("  ✓ 数据库 zuting 已创建")
    else:
        print("  ✓ 数据库已存在")

    # ── 2. 上传 tar 包 ──
    print("\n[2/7] 上传构建包...")
    sftp.put(f"{tmp}/zuting-api.tar.gz", f"{REMOTE_BASE}/api.tar.gz")
    print("  ✓ API (38KB)")
    sftp.put(f"{tmp}/zuting-web.tar.gz", f"{REMOTE_BASE}/web.tar.gz")
    print("  ✓ Web (37MB)")
    sftp.put(f"{tmp}/zuting-admin.tar.gz", f"{REMOTE_BASE}/admin.tar.gz")
    print("  ✓ Admin")

    # ── 3. 解压 + 配置 ──
    print("\n[3/7] 解压 + 配置...")
    run(ssh, f"cd {REMOTE_BASE}/api && tar xzf ../api.tar.gz", show=False)
    run(ssh, f"cd {REMOTE_BASE}/web && tar xzf ../web.tar.gz", show=False)
    run(ssh, f"cd {REMOTE_BASE}/admin && tar xzf ../admin.tar.gz && mv dist/* . 2>/dev/null; rmdir dist 2>/dev/null", show=False)

    # Move standalone contents to web root for cleaner structure
    run(ssh, f"""
cd {REMOTE_BASE}/web
mv standalone/node_modules . 2>/dev/null
mv standalone/apps/web/server.js . 2>/dev/null
mv standalone/apps/web/node_modules ./app_modules 2>/dev/null
mv standalone/apps/web/package.json ./app_package.json 2>/dev/null
mkdir -p .next
mv static .next/static 2>/dev/null
rm -rf standalone
""", show=False)

    # Create API .env
    db_url = f"postgresql://{PG_USER}:uoUSiW6cmCxrtKTY21bp@localhost:5434/{DB_NAME}?schema=public"
    env = f'DATABASE_URL="{db_url}"\nREDIS_URL="redis://localhost:6379/2"\nPORT={API_PORT}\nNODE_ENV=production\n'
    with sftp.open(f"{REMOTE_BASE}/api/.env", "w") as f:
        f.write(env)
    print("  ✓ 配置完成")

    # ── 4. 安装依赖 ──
    print("\n[4/7] 安装 API 依赖...")
    run(ssh, f"""cd {REMOTE_BASE}/api && npm install --legacy-peer-deps 2>&1 | tail -5""")

    # Generate Prisma + push schema
    print("\n  Prisma generate + db push...")
    run(ssh, f"cd {REMOTE_BASE}/api && npx prisma generate 2>&1 | tail -3")
    run(ssh, f"cd {REMOTE_BASE}/api && npx prisma db push --accept-data-loss 2>&1 | tail -3")

    # Seed data
    print("  Seeding...")
    run(ssh, f"cd {REMOTE_BASE}/api && npx tsx prisma/seed.ts 2>&1 | tail -5")

    # Fix web node_modules — create symlinks for pnpm flat structure
    print("\n  修复 Web node_modules 链接...")
    run(ssh, f"""cd {REMOTE_BASE}/web/node_modules
# Create symlinks from .pnpm packages to top-level
if [ -d .pnpm ]; then
    for pkg_dir in .pnpm/*/node_modules/*; do
        pkg_name=$(echo "$pkg_dir" | sed 's|.*node_modules/||')
        if [ ! -e "$pkg_name" ] && [ -d "$pkg_dir" ]; then
            # Handle scoped packages
            if [[ "$pkg_name" == @* ]]; then
                scope=$(echo "$pkg_name" | cut -d/ -f1)
                mkdir -p "$scope"
            fi
            ln -sf "$(pwd)/$pkg_dir" "$pkg_name" 2>/dev/null
        fi
    done
fi
echo "Symlinks created: $(ls -1 | wc -l) top-level packages"
""")

    # Also merge app_modules
    run(ssh, f"""cd {REMOTE_BASE}/web
if [ -d app_modules ]; then
    cp -rn app_modules/* node_modules/ 2>/dev/null
    if [ -d app_modules/.pnpm ]; then
        for pkg_dir in app_modules/.pnpm/*/node_modules/*; do
            pkg_name=$(echo "$pkg_dir" | sed 's|.*node_modules/||')
            if [ ! -e "node_modules/$pkg_name" ] && [ -d "$pkg_dir" ]; then
                if [[ "$pkg_name" == @* ]]; then
                    scope=$(echo "$pkg_name" | cut -d/ -f1)
                    mkdir -p "node_modules/$scope"
                fi
                ln -sf "$(pwd)/$pkg_dir" "node_modules/$pkg_name" 2>/dev/null
            fi
        done
    fi
fi
echo "Final: $(ls node_modules/ | wc -l) packages"
""")

    # ── 5. 启动服务 ──
    print("\n[5/7] 启动服务...")
    run(ssh, "pkill -f 'node.*zuting' 2>/dev/null; pkill -f 'node.*opt/zuting' 2>/dev/null; sleep 1", show=False)

    start_script = f"""#!/bin/bash
# Kill previous
pkill -f 'node /opt/zuting' 2>/dev/null
docker stop zuting-admin-nginx 2>/dev/null
docker rm zuting-admin-nginx 2>/dev/null
sleep 1

# Start API
cd /opt/zuting/api
export NODE_ENV=production PORT={API_PORT}
nohup node dist/main.js > /opt/zuting/api.log 2>&1 &
echo "API PID: $!"

# Start Web
cd /opt/zuting/web
export NODE_ENV=production PORT={WEB_PORT} HOSTNAME=0.0.0.0
export NEXT_PUBLIC_API_URL=http://localhost:{API_PORT}
export API_INTERNAL_URL=http://localhost:{API_PORT}
nohup node server.js > /opt/zuting/web.log 2>&1 &
echo "Web PID: $!"

# Start Admin (nginx container serving static files)
docker run -d --name zuting-admin-nginx \\
  -p {ADMIN_PORT}:80 \\
  -v /opt/zuting/admin:/usr/share/nginx/html:ro \\
  --restart always \\
  nginx:alpine
echo "Admin container: zuting-admin-nginx on port {ADMIN_PORT}"
"""
    with sftp.open(f"{REMOTE_BASE}/start.sh", "w") as f:
        f.write(start_script)
    run(ssh, f"chmod +x {REMOTE_BASE}/start.sh && bash {REMOTE_BASE}/start.sh")

    time.sleep(4)

    # Check
    api_code = run(ssh, f"curl -s -o /dev/null -w '%{{http_code}}' http://localhost:{API_PORT}/api/religions", show=False)
    web_code = run(ssh, f"curl -s -o /dev/null -w '%{{http_code}}' http://localhost:{WEB_PORT}", show=False)
    admin_code = run(ssh, f"curl -s -o /dev/null -w '%{{http_code}}' http://localhost:{ADMIN_PORT}", show=False)
    print(f"  API   :{API_PORT} → HTTP {api_code}")
    print(f"  Web   :{WEB_PORT} → HTTP {web_code}")
    print(f"  Admin :{ADMIN_PORT} → HTTP {admin_code}")

    if api_code != "200":
        print("\n  API日志:")
        run(ssh, f"tail -15 /opt/zuting/api.log")
    if web_code != "200":
        print("\n  Web日志:")
        run(ssh, f"tail -15 /opt/zuting/web.log")
    if admin_code != "200":
        print("\n  Admin日志:")
        run(ssh, f"docker logs --tail 15 zuting-admin-nginx 2>&1")

    # ── 6. Nginx ──
    # Domain routing (zuting.fszyl.top) is configured in the main nginx-standalone.conf
    # on the server. No need to inject conf.d files — ports 3080/3083 are not exposed
    # by the Docker nginx container. Access via domain or direct ports (3002/3003/3004).
    print("\n[6/7] Nginx域名路由已配置 (zuting.fszyl.top)")

    # ── 7. 上传 Admin nginx SPA 配置 ──
    print("\n[7/7] 配置 Admin SPA路由...")
    admin_nginx_conf = """server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types text/plain text/css text/javascript application/javascript application/json application/xml image/svg+xml font/woff2;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location ~* \\.(?:js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
"""
    with sftp.open(f"{REMOTE_BASE}/admin-nginx.conf", "w") as f:
        f.write(admin_nginx_conf)
    run(ssh, f"docker cp {REMOTE_BASE}/admin-nginx.conf zuting-admin-nginx:/etc/nginx/conf.d/default.conf && docker exec zuting-admin-nginx nginx -s reload 2>&1", show=False)
    print("  ✓ Admin SPA路由已配置")

    # Cleanup tarballs
    run(ssh, f"rm -f {REMOTE_BASE}/api.tar.gz {REMOTE_BASE}/web.tar.gz {REMOTE_BASE}/admin.tar.gz", show=False)

    print("\n" + "=" * 60)
    if api_code == "200" and web_code == "200" and admin_code == "200":
        print("  ✅ 部署成功!")
    else:
        print("  ⚠️  部分服务未就绪，请检查日志")
    print(f"  Web:     http://zuting.fszyl.top")
    print(f"  API:     http://zuting.fszyl.top/api/religions")
    print(f"  Swagger: http://zuting.fszyl.top/docs")
    print(f"  Admin:   http://120.24.31.151:{ADMIN_PORT}")
    print("=" * 60)

    sftp.close()
    ssh.close()


if __name__ == "__main__":
    main()
