"""
ZUTING H5 部署脚本 — 小轻服务器 (120.24.31.151)
部署 Vite 构建的 H5 静态文件到 Nginx Docker 容器
"""

import paramiko
import tempfile
import subprocess
import time
from pathlib import Path

SERVER = "120.24.31.151"
USER = "root"
PASSWORD = "y1234567890."
REMOTE_BASE = "/opt/zuting"
H5_PORT = 3005
NGINX_CONTAINER = "zuoyelang-nginx"
NGINX_CONF_PATH = "/opt/zuoyelang/docker/nginx/nginx-standalone.conf"
PROJECT_ROOT = Path(__file__).parent.parent
H5_DIR = PROJECT_ROOT / "apps" / "h5"


def run(ssh, cmd, show=True):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if show and out:
        print(out)
    if err and "WARNING" not in err and "NOTICE" not in err:
        print(f"  ERR: {err[:300]}")
    return out


def main():
    print("=" * 60)
    print("  ZUTING H5 → 小轻部署")
    print("=" * 60)

    # ── 0. 本地构建 ──
    print("\n[0/5] 本地构建 H5...")
    dist_dir = H5_DIR / "dist"
    result = subprocess.run(
        ["pnpm", "--filter", "@zuting/h5", "build"],
        cwd=str(PROJECT_ROOT),
        capture_output=True, text=True,
        shell=True,
    )
    if result.returncode != 0:
        print(f"  构建失败: {result.stderr[:500]}")
        return
    print("  ✓ 构建成功")

    # 打包 dist/
    tmp = tempfile.gettempdir().replace("\\", "/")
    tar_path = f"{tmp}/zuting-h5.tar.gz"
    h5_posix = str(H5_DIR).replace("\\", "/")
    subprocess.run(
        f'tar czf "{tar_path}" --force-local -C "{h5_posix}" dist',
        check=True, shell=True,
    )
    print(f"  ✓ 打包完成")

    # ── 1. 连接服务器 ──
    print("\n[1/5] 连接服务器...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    sftp = ssh.open_sftp()
    print("  ✓ 已连接")

    # ── 2. 上传 ──
    print("\n[2/5] 上传 H5 构建包...")
    run(ssh, f"mkdir -p {REMOTE_BASE}/h5", show=False)
    sftp.put(tar_path, f"{REMOTE_BASE}/h5.tar.gz")
    run(ssh, f"cd {REMOTE_BASE}/h5 && rm -rf * && tar xzf ../h5.tar.gz && mv dist/* . && rmdir dist && rm -f ../h5.tar.gz && chmod -R 755 {REMOTE_BASE}/h5 && chown -R root:root {REMOTE_BASE}/h5", show=False)
    print("  ✓ 上传完成")

    # ── 3. 启动 Nginx 容器 ──
    print("\n[3/5] 启动 H5 Nginx 容器...")

    nginx_conf = """server {
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

    # Cache local static assets (only /assets/ from Vite build)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Proxy images to web server (public/images in Next.js)
    location /images/ {
        proxy_pass http://172.19.0.1:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Proxy uploads to backend
    location /uploads/ {
        proxy_pass http://172.19.0.1:3002;
        proxy_set_header Host $host;
        expires 7d;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://172.19.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 180s;
    }
}
"""

    with sftp.open(f"{REMOTE_BASE}/h5-nginx.conf", "w") as f:
        f.write(nginx_conf)

    # Stop old container if exists
    run(ssh, "docker stop zuting-h5-nginx 2>/dev/null; docker rm zuting-h5-nginx 2>/dev/null", show=False)

    # Start new container
    run(ssh, f"""docker run -d --name zuting-h5-nginx \
  -p {H5_PORT}:80 \
  -v /opt/zuting/h5:/usr/share/nginx/html:ro \
  -v /opt/zuting/h5-nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  --network bridge \
  --restart always \
  nginx:alpine""")
    print(f"  ✓ H5 容器启动: zuting-h5-nginx (port {H5_PORT})")

    time.sleep(2)

    # ── 4. 配置域名路由 ──
    print("\n[4/5] 配置 Nginx 域名路由...")

    # Check if h5.fszyl.top server block already exists
    existing = run(ssh, f"grep -c 'h5.fszyl.top' {NGINX_CONF_PATH} 2>/dev/null || echo 0", show=False)
    existing_count = 0
    try:
        existing_count = int(existing.strip().split('\n')[-1])
    except (ValueError, IndexError):
        pass

    if existing_count == 0:
        # Add h5 server block to main nginx config
        h5_block = """
    # ── H5 Mobile Web ──
    server {
        listen 80;
        server_name h5.fszyl.top;

        location / {
            proxy_pass http://172.19.0.1:3005;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
"""
        # Append before the last closing brace of http block
        with sftp.open(f"{REMOTE_BASE}/h5-route.conf", "w") as f:
            f.write(h5_block)

        # Insert before the last line of nginx config
        run(ssh, f"""
python3 -c "
conf = open('{NGINX_CONF_PATH}').read()
block = open('{REMOTE_BASE}/h5-route.conf').read()
# Find last '}}' (end of http block) and insert before it
last_brace = conf.rfind('}}')
if last_brace > 0:
    new_conf = conf[:last_brace] + block + conf[last_brace:]
    open('{NGINX_CONF_PATH}', 'w').write(new_conf)
    print('Inserted h5 server block')
else:
    # Append at end
    open('{NGINX_CONF_PATH}', 'a').write(block)
    print('Appended h5 server block')
"
""")
        run(ssh, f"rm -f {REMOTE_BASE}/h5-route.conf", show=False)
        run(ssh, f"docker exec {NGINX_CONTAINER} nginx -s reload 2>&1")
        print("  ✓ h5.fszyl.top 路由已添加")
    else:
        run(ssh, f"docker exec {NGINX_CONTAINER} nginx -s reload 2>&1")
        print("  ✓ h5.fszyl.top 路由已存在")

    # ── 5. 验证 ──
    print("\n[5/5] 验证...")
    h5_code = run(ssh, f"curl -s -o /dev/null -w '%{{http_code}}' http://localhost:{H5_PORT}", show=False)
    print(f"  H5 :{H5_PORT} → HTTP {h5_code}")

    if h5_code != "200":
        print("\n  容器日志:")
        run(ssh, "docker logs --tail 15 zuting-h5-nginx 2>&1")

    print("\n" + "=" * 60)
    if h5_code == "200":
        print("  ✅ H5 部署成功!")
    else:
        print("  ⚠️  请检查日志")
    print(f"  H5:     http://h5.fszyl.top")
    print(f"  直连:   http://120.24.31.151:{H5_PORT}")
    print("=" * 60)

    sftp.close()
    ssh.close()


if __name__ == "__main__":
    main()
