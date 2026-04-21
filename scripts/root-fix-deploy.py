"""Root-fix deployment: install systemd-based self-healing for Zuting.

Step C: /opt/zuting/bin/ensure-nginx-zuting.sh + zuting-ensure-nginx.timer
        (server-side, every 5min, idempotent)
Step D: rewrite /opt/zuting/restart-{api,web}.sh to delegate to systemd
        and use fuser (not pkill) when falling back, so the zuoyelang-backend
        container is no longer collateral damage.

Safe to run repeatedly — every step is idempotent.
"""
import paramiko
import time

HOST = "120.24.31.151"
USER = "root"
PWD = "y1234567890."


ENSURE_NGINX_SCRIPT = r'''#!/bin/bash
# Idempotent — restores zuting.fszyl.top vhost if ZuoYeLang rewrites wipe it.
# Called by zuting-ensure-nginx.timer every 5 minutes.
set -u

CONF=/opt/zuoyelang/docker/nginx/nginx-standalone.conf
BRIDGE=172.19.0.1
LOG=/var/log/zuting-ensure-nginx.log

log() { echo "[$(date -Is)] $*" >> "$LOG"; }

[ -f "$CONF" ] || { log "CONF missing: $CONF"; exit 2; }

# Fast path: already present -> no-op (but still check bind-mount liveness)
if grep -q "zuting.fszyl.top" "$CONF"; then
  host_ino=$(stat -c %i "$CONF")
  cont_ino=$(docker exec zuoyelang-nginx stat -c %i /etc/nginx/nginx.conf 2>/dev/null)
  cont_links=$(docker exec zuoyelang-nginx stat -c %h /etc/nginx/nginx.conf 2>/dev/null)
  if [ -n "$cont_ino" ] && { [ "$host_ino" != "$cont_ino" ] || [ "$cont_links" = "0" ]; }; then
    log "STALE bind mount host=$host_ino cont=$cont_ino links=$cont_links -- restarting zuoyelang-nginx"
    docker restart zuoyelang-nginx >/dev/null 2>&1
  fi
  exit 0
fi

log "zuting.fszyl.top block MISSING -- injecting"
TS=$(date +%s)
cp "$CONF" "${CONF}.bak.autofix.${TS}" || { log "backup failed"; exit 3; }

BLOCK=$(cat << 'NGINXBLOCK'
    # -- ZUTING HTTP -> HTTPS redirect (auto-injected) --
    server {
        listen 80;
        server_name zuting.fszyl.top;
        return 301 https://$host$request_uri;
    }

    # -- ZUTING SSL Server (auto-injected) --
    server {
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

        location /api/ {
            proxy_pass http://__BRIDGE__:3002/api/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 600s;
            proxy_connect_timeout 10s;
            proxy_send_timeout 60s;
        }
        location ~* ^/api/.*/stream {
            proxy_pass http://__BRIDGE__:3002;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header Connection '';
            chunked_transfer_encoding off;
            proxy_buffering off;
            proxy_cache off;
            proxy_read_timeout 300s;
        }
        location /ws {
            proxy_pass http://__BRIDGE__:3002;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_read_timeout 3600s;
        }
        location /docs {
            proxy_pass http://__BRIDGE__:3002;
            proxy_set_header Host $host;
        }
        location / {
            proxy_pass http://__BRIDGE__:3003;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
    # -- END ZUTING --
NGINXBLOCK
)
BLOCK="${BLOCK//__BRIDGE__/$BRIDGE}"

# Pick an insertion anchor: first match wins, fallback to final `}` (http close)
INJECTED=0
for ANCHOR in \
    "    # -- SSL Server (sx.fszyl.top)" \
    "    # -- SSL Server (api.fszyl.top)" \
    "    # \xe2\x94\x80\xe2\x94\x80 SSL Server (sx.fszyl.top)" \
    "# \xe2\x94\x80\xe2\x94\x80 SSL Server (sx.fszyl.top)"; do
  if grep -qF "$ANCHOR" "$CONF"; then
    awk -v anchor="$ANCHOR" -v block="$BLOCK" '
      !done && index($0, anchor) { print block; print ""; done=1 }
      { print }
    ' "$CONF" > "$CONF.new"
    mv "$CONF.new" "$CONF"
    log "injected via anchor: $ANCHOR"
    INJECTED=1
    break
  fi
done

if [ "$INJECTED" -eq 0 ]; then
  # Fallback: inject before final `}` in http block
  awk -v block="$BLOCK" '
    { lines[NR] = $0 }
    END {
      last = 0
      for (i = NR; i >= 1; i--) {
        s = lines[i]; gsub(/^[ \t]+|[ \t]+$/, "", s)
        if (s == "}") { last = i; break }
      }
      for (i = 1; i <= NR; i++) {
        if (i == last) { print block; print "" }
        print lines[i]
      }
    }
  ' "$CONF" > "$CONF.new"
  mv "$CONF.new" "$CONF"
  log "injected via fallback (http close)"
fi

# Validate in container
if ! docker exec zuoyelang-nginx nginx -t >/dev/null 2>&1; then
  log "nginx -t FAILED -- rolling back"
  cp "${CONF}.bak.autofix.${TS}" "$CONF"
  exit 4
fi

# Check bind-mount liveness
host_ino=$(stat -c %i "$CONF")
cont_ino=$(docker exec zuoyelang-nginx stat -c %i /etc/nginx/nginx.conf 2>/dev/null)
cont_links=$(docker exec zuoyelang-nginx stat -c %h /etc/nginx/nginx.conf 2>/dev/null)
if [ "$host_ino" != "$cont_ino" ] || [ "$cont_links" = "0" ]; then
  log "STALE bind mount after inject -- restarting zuoyelang-nginx"
  docker restart zuoyelang-nginx >/dev/null 2>&1
else
  docker exec zuoyelang-nginx nginx -s reload >/dev/null 2>&1
  log "reloaded nginx"
fi

log "OK -- zuting.fszyl.top vhost restored"
'''

ENSURE_SERVICE = '''[Unit]
Description=Restore zuting.fszyl.top nginx vhost if missing
After=docker.service

[Service]
Type=oneshot
ExecStart=/opt/zuting/bin/ensure-nginx-zuting.sh
'''

ENSURE_TIMER = '''[Unit]
Description=Check zuting.fszyl.top nginx vhost every 5 minutes

[Timer]
OnBootSec=2min
OnUnitActiveSec=5min
Unit=zuting-ensure-nginx.service

[Install]
WantedBy=timers.target
'''

RESTART_API = '''#!/bin/bash
# Legacy manual restart -- prefer: systemctl restart zuting-api
# Uses fuser so zuoyelang-backend container is NOT affected by this restart.
set -e
if systemctl list-unit-files zuting-api.service --no-pager 2>/dev/null | grep -q zuting-api; then
  exec systemctl restart zuting-api.service
fi
fuser -k 3002/tcp 2>/dev/null || true
sleep 2
cd /opt/zuting/api
set -a; . ./.env; set +a
export NODE_NO_COMPILE_CACHE=1
setsid nohup node dist/main.js < /dev/null >> /opt/zuting/api.log 2>&1 &
disown
echo "API PID=$!"
'''

RESTART_WEB = '''#!/bin/bash
# Legacy manual restart -- prefer: systemctl restart zuting-web
set -e
if systemctl list-unit-files zuting-web.service --no-pager 2>/dev/null | grep -q zuting-web; then
  exec systemctl restart zuting-web.service
fi
fuser -k 3003/tcp 2>/dev/null || true
sleep 2
cd /opt/zuting/web/standalone/apps/web
export PORT=3003 NODE_ENV=production HOSTNAME=0.0.0.0
setsid nohup node server.js < /dev/null >> /opt/zuting/web.log 2>&1 &
disown
echo "Web PID=$!"
'''


def run(ssh, cmd, t=30):
    _, stdout, stderr = ssh.exec_command(cmd, timeout=t)
    return stdout.read().decode(errors="replace") + stderr.read().decode(errors="replace")


def put(sftp, path, content, mode=0o644):
    with sftp.open(path, "w") as f:
        f.write(content)
    sftp.chmod(path, mode)


def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PWD, timeout=20)
    sftp = ssh.open_sftp()

    print("=== C1. Write ensure-nginx-zuting.sh ===")
    run(ssh, "mkdir -p /opt/zuting/bin /var/log")
    put(sftp, "/opt/zuting/bin/ensure-nginx-zuting.sh", ENSURE_NGINX_SCRIPT, 0o755)
    print(run(ssh, "ls -l /opt/zuting/bin/ensure-nginx-zuting.sh"))

    print("=== C2. Dry-run (vhost currently present -> should no-op) ===")
    out = run(ssh, "/opt/zuting/bin/ensure-nginx-zuting.sh; echo exit=$?")
    print(out)
    print(run(ssh, "tail -5 /var/log/zuting-ensure-nginx.log 2>/dev/null || echo 'no log (expected on fast path)'"))

    print("=== C3. Write systemd service + timer ===")
    put(sftp, "/etc/systemd/system/zuting-ensure-nginx.service", ENSURE_SERVICE)
    put(sftp, "/etc/systemd/system/zuting-ensure-nginx.timer", ENSURE_TIMER)
    print(run(ssh, "systemctl daemon-reload && systemctl enable --now zuting-ensure-nginx.timer"))
    print(run(ssh, "systemctl list-timers zuting-ensure-nginx.timer --no-pager"))

    print("=== D1. Patch restart-api.sh + restart-web.sh ===")
    put(sftp, "/opt/zuting/restart-api.sh", RESTART_API, 0o755)
    put(sftp, "/opt/zuting/restart-web.sh", RESTART_WEB, 0o755)
    print(run(ssh, "head -5 /opt/zuting/restart-api.sh; echo ---; head -5 /opt/zuting/restart-web.sh"))

    print("=== FINAL: status + HTTP smoke ===")
    print(run(ssh, "systemctl is-active zuting-api zuting-web zuting-ensure-nginx.timer"))
    print(
        run(
            ssh,
            "curl -sk -o /dev/null -w 'prodWEB:%{http_code}\\n' https://zuting.fszyl.top/ --resolve zuting.fszyl.top:443:127.0.0.1; "
            "curl -sk -o /dev/null -w 'prodAPI:%{http_code}\\n' https://zuting.fszyl.top/api/religions?limit=1 --resolve zuting.fszyl.top:443:127.0.0.1",
        )
    )
    ssh.close()


if __name__ == "__main__":
    main()
