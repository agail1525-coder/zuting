"""Idempotently ensure nginx-standalone.conf on the production server contains
the zuting.fszyl.top server block. Safe to run repeatedly as part of every
deploy — a no-op when the block is already present.

Background: on 2026-04-18 the zuting.fszyl.top server block disappeared from
/opt/zuoyelang/docker/nginx/nginx-standalone.conf (wiped by some prior edit).
Because it was missing, HTTPS requests for zuting.fszyl.top fell through to
the default 443 vhost (api.fszyl.top), which proxies / to ZuoYeLang's
webadmin container — users saw a 456-byte "web-admin" SPA instead of the
佳绩之旅 Next.js site. This script restores/keeps that routing.

Run manually:   python scripts/ensure-nginx-zuting-block.py
Deploy script:  called at the end of deploy-xiaoqing.py step [6/7].
"""
import paramiko
import time
import sys

HOST = "120.24.31.151"
USER = "root"
PWD = "y1234567890."
CONF = "/opt/zuoyelang/docker/nginx/nginx-standalone.conf"

# Docker bridge gateway IP as seen from INSIDE the zuoyelang-nginx container.
# Confirmed via `docker inspect zuoyelang-nginx` → NetworkSettings.Networks → Gateway.
BRIDGE = "172.19.0.1"

INSERT_MARKER = "    # ── SX"  # inject above the SX (auto-generated) block

ZUTING_BLOCKS = f"""
    # ── ZUTING HTTP → HTTPS redirect ──────────────────
    server {{
        listen 80;
        server_name zuting.fszyl.top;
        return 301 https://$host$request_uri;
    }}

    # ── ZUTING SSL Server (zuting.fszyl.top) ───────────
    server {{
        listen 443 ssl http2;
        server_name zuting.fszyl.top;

        ssl_certificate /etc/nginx/ssl/zuting.fszyl.top.pem;
        ssl_certificate_key /etc/nginx/ssl/zuting.fszyl.top.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        add_header X-Frame-Options SAMEORIGIN always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        client_max_body_size 20m;

        location /api/ {{
            proxy_pass http://{BRIDGE}:3002/api/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 600s;
            proxy_connect_timeout 10s;
            proxy_send_timeout 60s;
        }}

        location ~* ^/api/.*/stream {{
            proxy_pass http://{BRIDGE}:3002;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header Connection '';
            chunked_transfer_encoding off;
            proxy_buffering off;
            proxy_cache off;
            proxy_read_timeout 300s;
        }}

        location /ws {{
            proxy_pass http://{BRIDGE}:3002;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_read_timeout 3600s;
        }}

        location /docs {{
            proxy_pass http://{BRIDGE}:3002;
            proxy_set_header Host $host;
        }}

        location / {{
            proxy_pass http://{BRIDGE}:3003;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }}
    }}
    # ── END ZUTING ────────────────────────────────────
"""


def run(ssh, cmd, timeout=30):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    rc = stdout.channel.recv_exit_status()
    return rc, out, err


def ensure(ssh):
    sftp = ssh.open_sftp()
    with sftp.open(CONF, "r") as f:
        current = f.read().decode("utf-8")

    if "zuting.fszyl.top" in current:
        print("  ✓ zuting.fszyl.top block already present — no change")
        return True

    if INSERT_MARKER not in current:
        print(f"  ✗ Insert marker {INSERT_MARKER!r} not found in {CONF}")
        print("    Manual review needed — aborting to avoid clobbering unknown state")
        return False

    ts = int(time.time())
    bak = f"{CONF}.bak.zutingFix.{ts}"
    rc, out, err = run(ssh, f"cp {CONF} {bak}")
    if rc != 0:
        print(f"  ✗ Backup failed: {err}")
        return False
    print(f"  Backed up → {bak}")

    new = current.replace(INSERT_MARKER, ZUTING_BLOCKS + "\n" + INSERT_MARKER, 1)
    with sftp.open(CONF, "w") as f:
        f.write(new)

    rc, out, err = run(ssh, "docker exec zuoyelang-nginx nginx -t 2>&1")
    if "successful" not in (out + err):
        print(f"  ✗ nginx -t failed, rolling back:\n{out}{err}")
        run(ssh, f"cp {bak} {CONF}")
        return False

    run(ssh, "docker exec zuoyelang-nginx nginx -s reload 2>&1")
    print("  ✓ zuting.fszyl.top block restored and nginx reloaded")
    return True


def verify(ssh):
    for label, cmd in [
        (
            "root",
            "curl -sk -o /dev/null -w 'HTTP:%{http_code} SIZE:%{size_download}' "
            "https://zuting.fszyl.top/ --max-time 10 "
            "--resolve zuting.fszyl.top:443:127.0.0.1",
        ),
        (
            "api",
            "curl -sk -o /dev/null -w 'HTTP:%{http_code}' "
            "https://zuting.fszyl.top/api/religions --max-time 10 "
            "--resolve zuting.fszyl.top:443:127.0.0.1",
        ),
    ]:
        rc, out, err = run(ssh, cmd)
        print(f"  {label}: {out.strip()}")


def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PWD, timeout=20)
    print(f"[ensure-nginx-zuting-block] {time.strftime('%Y-%m-%d %H:%M:%S')}")
    ok = ensure(ssh)
    if ok:
        time.sleep(1)
        verify(ssh)
    ssh.close()
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
