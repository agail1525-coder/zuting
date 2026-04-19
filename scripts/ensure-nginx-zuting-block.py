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

# Insertion anchor strategy (first match wins; falls back to http-block close `}`)
# Robust to ZuoYeLang rewrites — keeps working even when their conf structure shifts.
INSERT_ANCHORS = [
    "    # ── SX",                                    # legacy auto-gen block
    "    # ── SSL Server (sx.fszyl.top)",             # current (2026-04) sx.fszyl.top block
    "# ── SSL Server (sx.fszyl.top)",                 # same, different indent
]

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

    # Try named anchors first (insert block immediately before the anchor line).
    chosen = None
    for anchor in INSERT_ANCHORS:
        if anchor in current:
            chosen = anchor
            break

    ts = int(time.time())
    bak = f"{CONF}.bak.zutingFix.{ts}"
    rc, out, err = run(ssh, f"cp {CONF} {bak}")
    if rc != 0:
        print(f"  ✗ Backup failed: {err}")
        return False
    print(f"  Backed up → {bak}")

    if chosen is not None:
        print(f"  Using anchor: {chosen!r}")
        new = current.replace(chosen, ZUTING_BLOCKS + "\n" + chosen, 1)
    else:
        # Fallback: inject before the last standalone `}` (http-block close).
        # Valid nginx configs always close the http { ... } block this way, so
        # this anchor is effectively permanent regardless of other projects'
        # rewrites to the conf above.
        lines = current.split("\n")
        http_close_idx = None
        for idx in range(len(lines) - 1, -1, -1):
            if lines[idx].strip() == "}":
                http_close_idx = idx
                break
        if http_close_idx is None:
            print("  ✗ Could not locate http-block close `}` — aborting")
            return False
        print(f"  Using fallback anchor: http-block close at line {http_close_idx + 1}")
        lines.insert(http_close_idx, ZUTING_BLOCKS)
        new = "\n".join(lines)

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


def ensure_mount_live(ssh):
    """Detect and repair the 'stale bind-mount' failure mode.

    Root cause observed 2026-04-20: zuoyelang-nginx bind-mounts the host file
    /opt/zuoyelang/docker/nginx/nginx-standalone.conf → /etc/nginx/nginx.conf.
    Bind mounts are inode-based — if something on the host replaces the file
    (mv + cp, or atomic-rename editors), the container keeps serving the old
    inode ("Links: 0", orphaned). nginx -s reload does nothing because the
    conf it reloads is the stale orphan, not what we just wrote.

    Fix: compare host inode vs. container inode. If they diverge, docker
    restart to rebind. This costs ~2s of downtime for ZuoYeLang's other
    vhosts, which is an acceptable price for keeping zuting.fszyl.top live.
    """
    rc, host_ino, _ = run(ssh, f"stat -c %i {CONF}")
    rc, cont_ino, _ = run(
        ssh, "docker exec zuoyelang-nginx stat -c %i /etc/nginx/nginx.conf"
    )
    rc, cont_links, _ = run(
        ssh, "docker exec zuoyelang-nginx stat -c %h /etc/nginx/nginx.conf"
    )
    host_ino = host_ino.strip()
    cont_ino = cont_ino.strip()
    cont_links = cont_links.strip()
    print(f"  host inode: {host_ino} | container inode: {cont_ino} | links: {cont_links}")
    if host_ino != cont_ino or cont_links == "0":
        print("  ✗ Bind mount is STALE (orphan inode) — restarting container to rebind")
        run(ssh, "docker restart zuoyelang-nginx", timeout=60)
        time.sleep(3)
        rc, new_ino, _ = run(
            ssh, "docker exec zuoyelang-nginx stat -c %i /etc/nginx/nginx.conf"
        )
        print(f"  ✓ post-restart container inode: {new_ino.strip()}")
        return True
    print("  ✓ Bind mount is live (host/container inodes match)")
    return False


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
        # After writing the host conf, verify the container is actually seeing
        # our change (bind mount can go stale — see ensure_mount_live docstring).
        ensure_mount_live(ssh)
        time.sleep(1)
        verify(ssh)
    ssh.close()
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
