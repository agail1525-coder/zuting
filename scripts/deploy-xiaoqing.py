"""
ZUTING 部署脚本 — 小轻服务器 (120.24.31.151)
部署 NestJS API + Next.js Web + Vite Admin
"""

import paramiko
import time
import tempfile
import subprocess
import sys
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


def build_local():
    """本地构建: API (nest build) + Web (next build) + Admin (vite build)"""
    print("  构建 API (nest build)...")
    subprocess.run(
        ["pnpm", "--filter", "@zuting/api", "build"],
        cwd=str(PROJECT_ROOT), check=True, shell=(os.name == "nt"),
    )
    print("  构建 Web (next build)...")
    subprocess.run(
        ["pnpm", "--filter", "@zuting/web", "build"],
        cwd=str(PROJECT_ROOT), check=True, shell=(os.name == "nt"),
    )
    print("  构建 Admin (vite build)...")
    subprocess.run(
        ["pnpm", "--filter", "@zuting/admin", "build"],
        cwd=str(PROJECT_ROOT), check=True, shell=(os.name == "nt"),
    )


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

    # Web: .next/standalone + .next/static + public/
    print("  打包 Web...")
    web_dir = PROJECT_ROOT / "apps" / "web"
    next_dir = web_dir / ".next"
    subprocess.run([
        "tar", "czf", f"{tmp}/zuting-web.tar.gz",
        "-C", str(next_dir), "standalone", "static",
        "-C", str(web_dir), "public",
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

    # ── 0a. 本地构建 ──
    print("\n[0/8] 本地构建 (API + Web + Admin)...")
    build_local()
    print("  ✓ 构建完成")

    # ── 0b. 本地打包 ──
    print("\n[1/8] 本地打包构建产物...")
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

    # Keep standalone structure intact — just wire in static + public
    run(ssh, f"""
cd {REMOTE_BASE}/web
# Move static assets into standalone's .next directory
mkdir -p standalone/apps/web/.next
mv static standalone/apps/web/.next/static 2>/dev/null
# Move public assets into standalone's app directory
mv public standalone/apps/web/public 2>/dev/null
echo "Static CSS: $(ls standalone/apps/web/.next/static/css/ 2>/dev/null | wc -l) files"
echo "Public images: $(find standalone/apps/web/public/images -type f 2>/dev/null | wc -l) files"
""", show=False)

    # Create API .env
    db_url = f"postgresql://{PG_USER}:uoUSiW6cmCxrtKTY21bp@localhost:5434/{DB_NAME}?schema=public"
    env = f"""DATABASE_URL="{db_url}"
REDIS_URL="redis://:CbFjnSKeIFi3dk7mzIRW@localhost:6379/2"
PORT={API_PORT}
NODE_ENV=production
JWT_SECRET="zuting-prod-jwt-s3cret-2026-k9x7m"
LLM_BASE_URL="http://120.24.31.151:18001/v1"
LLM_MODEL="/root/autodl-tmp/models/Qwen/Qwen3___5-122B-A10B-GPTQ-Int4"
LLM_API_KEY="zuoyelang2026"
"""
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

    # Seed team-culture (independent, idempotent — runs even if main seed aborted on FK)
    print("  Seeding team-culture (M32)...")
    run(ssh, f"cd {REMOTE_BASE}/api && npx tsx prisma/seed-team-culture.ts 2>&1 | tail -10")

    # Seed personal-growth (M34) and family-harmony (M35)
    print("  Seeding personal-growth (M34)...")
    run(ssh, f"cd {REMOTE_BASE}/api && npx tsx prisma/seed-personal-growth.ts 2>&1 | tail -10")
    print("  Seeding family-harmony (M35)...")
    run(ssh, f"cd {REMOTE_BASE}/api && npx tsx prisma/seed-family-harmony.ts 2>&1 | tail -10")

    # Seed faith-assessment (M36)
    print("  Seeding faith-assessment (M36)...")
    run(ssh, f"cd {REMOTE_BASE}/api && npx tsx prisma/seed-faith-assessment.ts 2>&1 | tail -10")

    # Seed cultivation (M37)
    print("  Seeding cultivation (M37)...")
    run(ssh, f"cd {REMOTE_BASE}/api && npx tsx prisma/seed-cultivation.ts 2>&1 | tail -10")

    # Seed culture-life (M40 文化与生命)
    print("  Seeding culture-life (M40)...")
    run(ssh, f"cd {REMOTE_BASE}/api && npx tsx prisma/seed-culture-life.ts 2>&1 | tail -10")

    # Seed scriptures v11-v29 (M38 经论++ incremental rounds, idempotent upsert)
    print("  Seeding scriptures v11-v29 (M38 经论大系统)...")
    run(ssh, f"cd {REMOTE_BASE}/api && for f in prisma/seed-scriptures-v*.ts; do echo \"→ $f\"; npx tsx \"$f\" 2>&1 | tail -3; done")

    # Seed destinations v2+ (目的地++ 真实目的地增量补丁, idempotent find-then-create)
    print("  Seeding destinations v2+ (目的地++)...")
    run(ssh, f"cd {REMOTE_BASE}/api && for f in prisma/seed-destinations-v*.ts; do echo \"→ $f\"; npx tsx \"$f\" 2>&1 | tail -5; done")

    # 目的地++ 图片兜底补丁 (必须在所有 seed-destinations-v*.ts 之后运行)
    print("  Backfilling holy-site images (pool fallback)...")
    run(ssh, f"cd {REMOTE_BASE}/api && npx tsx prisma/seed-destinations-images.ts 2>&1 | tail -10")

    # 目的地++ Wikipedia 真实图片替换 (覆盖 pool 图为 upload.wikimedia.org 真实图)
    print("  Fetching real Wikipedia images for all sites...")
    run(ssh, f"cd {REMOTE_BASE}/api && npx tsx prisma/seed-destinations-wiki-images.ts 2>&1 | tail -8")

    # 目的地++ 老站点落地信息补全 (60 famous ADMIN sites)
    print("  Enriching legacy ADMIN sites (hours/price/season/transport/tips)...")
    run(ssh, f"cd {REMOTE_BASE}/api && npx tsx prisma/seed-destinations-enrich-legacy.ts 2>&1 | tail -5")

    # 目的地++ 按气候回填 bestSeason (v4/v5 数据对象遗漏)
    print("  Backfilling bestSeason by country climate...")
    run(ssh, f"cd {REMOTE_BASE}/api && npx tsx prisma/seed-destinations-backfill-season.ts 2>&1 | tail -5")

    print("  Backfilling visitDuration by keyword heuristic...")
    run(ssh, f"cd {REMOTE_BASE}/api && npx tsx prisma/seed-destinations-visit-duration.ts 2>&1 | tail -5")

    print("  旅游配套++ TP seeds (v1/v2/v3-auto/v4-auto)...")
    run(ssh, f"cd {REMOTE_BASE}/api && for f in prisma/seed-packages-v*.ts; do echo \"→ $f\"; npx tsx \"$f\" 2>&1 | tail -3; done")

    print("  旅游配套++ 商家派生 (seed-merchants-from-tp)...")
    run(ssh, f"cd {REMOTE_BASE}/api && npx tsx prisma/seed-merchants-from-tp.ts 2>&1 | tail -5")

    print("  旅游配套++ 图片本地化 (seed-localize-images)...")
    run(ssh, f"mkdir -p /opt/zuting/static/images && chmod 755 /opt/zuting/static/images")
    run(ssh, f"cd {REMOTE_BASE}/api && TP_STATIC_DIR=/opt/zuting/static/images npx tsx prisma/seed-localize-images.ts 2>&1 | tail -10")

    # Fix ALL broken pnpm symlinks via Python script on server
    print("  修复 Web standalone pnpm symlinks...")
    fix_script = r'''
import os, re, subprocess

base = "/opt/zuting/web/standalone/node_modules"
pnpm_dir = os.path.join(base, ".pnpm")

# Step 1: Index all REAL (non-symlink) directories in .pnpm
pkg_map = {}  # "react" -> "/opt/.../node_modules/react", "@swc/helpers" -> "/opt/.../@swc/helpers"
for entry in os.listdir(pnpm_dir):
    nm = os.path.join(pnpm_dir, entry, "node_modules")
    if not os.path.isdir(nm):
        continue
    for item in os.listdir(nm):
        full = os.path.join(nm, item)
        if item.startswith("@") and os.path.isdir(full):
            for sub in os.listdir(full):
                sub_full = os.path.join(full, sub)
                if os.path.isdir(sub_full) and not os.path.islink(sub_full):
                    pkg_map[f"{item}/{sub}"] = sub_full
        elif os.path.isdir(full) and not os.path.islink(full):
            pkg_map[item] = full
print(f"Indexed {len(pkg_map)} real packages")

# Step 2: Find and fix ALL broken symlinks
result = subprocess.run(
    ["find", "/opt/zuting/web/standalone", "-type", "l", "-exec",
     "test", "!", "-e", "{}", ";", "-print"],
    capture_output=True, text=True
)
broken_links = [l.strip() for l in result.stdout.strip().split("\n") if l.strip()]
print(f"Found {len(broken_links)} broken symlinks")

fix_count = 0
unfixed = []
for link_path in broken_links:
    target = os.readlink(link_path)
    # Extract the LAST node_modules/<pkg> from the target
    # e.g. //?/E:/ZUTING/node_modules/.pnpm/react@19.2.4/node_modules/react
    parts = re.split(r"[/\\]node_modules[/\\]", target)
    if len(parts) >= 2:
        pkg_name = parts[-1].replace("\\", "/").rstrip("/")
        if pkg_name in pkg_map:
            os.remove(link_path)
            os.symlink(pkg_map[pkg_name], link_path)
            fix_count += 1
        else:
            unfixed.append(f"  {pkg_name} (not in .pnpm)")
    else:
        unfixed.append(f"  {target[:80]} (no node_modules in path)")
print(f"Fixed {fix_count} broken symlinks")
if unfixed:
    print(f"Could not fix {len(unfixed)}:")
    for u in unfixed[:5]:
        print(u)

# Step 3: Create top-level symlinks in node_modules/ for require() resolution
created = 0
for pkg_name, real_path in pkg_map.items():
    link_path = os.path.join(base, pkg_name)
    if not os.path.exists(link_path) and not os.path.islink(link_path):
        os.makedirs(os.path.dirname(link_path), exist_ok=True)
        os.symlink(real_path, link_path)
        created += 1
    elif os.path.islink(link_path) and not os.path.exists(link_path):
        os.remove(link_path)
        os.symlink(real_path, link_path)
        created += 1
print(f"Created {created} top-level symlinks")

# Step 4: Verify
result2 = subprocess.run(
    ["find", "/opt/zuting/web/standalone", "-type", "l", "-exec",
     "test", "!", "-e", "{}", ";", "-print"],
    capture_output=True, text=True
)
remaining = len([l for l in result2.stdout.strip().split("\n") if l.strip()])
print(f"Remaining broken: {remaining}")
'''
    with sftp.open(f"{REMOTE_BASE}/fix-symlinks.py", "w") as f:
        f.write(fix_script)
    run(ssh, f"python3 {REMOTE_BASE}/fix-symlinks.py")
    run(ssh, f"rm -f {REMOTE_BASE}/fix-symlinks.py", show=False)

    # ── 5. 启动服务 ──
    print("\n[5/7] 启动服务...")
    run(ssh, "pkill -f 'node.*zuting' 2>/dev/null; pkill -f 'node.*opt/zuting' 2>/dev/null; sleep 1", show=False)

    start_script = f"""#!/bin/bash
# Kill previous (match both old and new process patterns)
pkill -f 'node /opt/zuting' 2>/dev/null
pkill -f 'next-server' 2>/dev/null
fuser -k {WEB_PORT}/tcp 2>/dev/null
fuser -k {API_PORT}/tcp 2>/dev/null
docker stop zuting-admin-nginx 2>/dev/null
docker rm zuting-admin-nginx 2>/dev/null
sleep 2

# Start API (NODE_NO_COMPILE_CACHE=1 required — see [OPS-01] Node v20 + Prisma 6)
cd /opt/zuting/api
export NODE_ENV=production PORT={API_PORT} NODE_NO_COMPILE_CACHE=1
nohup node dist/main.js > /opt/zuting/api.log 2>&1 &
echo "API PID: $!"

# Start Web (standalone keeps monorepo path structure)
cd /opt/zuting/web/standalone
export NODE_ENV=production PORT={WEB_PORT} HOSTNAME=0.0.0.0
export NEXT_PUBLIC_API_URL=http://localhost:{API_PORT}
export API_INTERNAL_URL=http://localhost:{API_PORT}
nohup node apps/web/server.js > /opt/zuting/web.log 2>&1 &
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

    # Flush Redis caches AFTER API restart to clear stale entity IDs
    # Must run after restart — old API caches stale IDs during seed's deleteMany+create window
    print("  Flushing stale Redis entity caches...")
    flush_cmd = (
        "docker exec zuoyelang-redis sh -c \""
        "for prefix in holy-site temple patriarch teaching seal route religion scripture destination-package crawler merchant merchants; do "
        "  redis-cli -a 'CbFjnSKeIFi3dk7mzIRW' -n 2 --no-auth-warning --scan --pattern \\\"$prefix:*\\\" | "
        "  xargs -r redis-cli -a 'CbFjnSKeIFi3dk7mzIRW' -n 2 --no-auth-warning DEL; "
        "done\""
    )
    run(ssh, flush_cmd)

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
    # Domain routing (zuting.fszyl.top) lives in the main nginx-standalone.conf
    # (zuoyelang-nginx container). We do NOT own that file exclusively, and
    # 2026-04-18 an unrelated edit stripped the zuting server block, causing
    # HTTPS / to fall through to api.fszyl.top → ZuoYeLang web-admin SPA.
    # So: run the idempotent ensure-script on every deploy to restore it.
    print("\n[6/7] Nginx域名路由自愈 (zuting.fszyl.top)...")
    ensure_script = (Path(__file__).parent / "ensure-nginx-zuting-block.py").resolve()
    if ensure_script.exists():
        rc = subprocess.call([sys.executable, str(ensure_script)])
        if rc != 0:
            print("  ⚠️ ensure-nginx-zuting-block.py 返回非零，请手动检查 nginx-standalone.conf")
    else:
        print(f"  ⚠️ 未找到 {ensure_script}，跳过自愈（请手动确认域名路由）")

    # TP++ /static/ route is handled via Next.js rewrites → API:3002 (see apps/web/next.config.mjs)

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
