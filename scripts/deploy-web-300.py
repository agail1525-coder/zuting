"""Deploy rebuilt Next.js Web (standalone) to prod for 60→300 copy fix.

Payload: apps/web/.next/standalone (server.js + node_modules)
       + apps/web/.next/static (client chunks)
       + apps/web/public

Target: /opt/zuting/web/standalone
Then:   systemctl restart zuting-web; verify 200 + body has "300+".
"""
import paramiko
import scp  # pip install scp; fallback to sftp if unavailable
import os
import subprocess
import time

HOST = "120.24.31.151"
USER = "root"
PWD = "y1234567890."

LOCAL_WEB = r"E:\ZUTING\apps\web"
ARCHIVE = r"E:\ZUTING\tmp\web-standalone-300.tar.gz"

def run(ssh, cmd, t=60):
    _, out, err = ssh.exec_command(cmd, timeout=t)
    return out.read().decode(errors="replace") + err.read().decode(errors="replace")

def main():
    os.makedirs(os.path.dirname(ARCHIVE), exist_ok=True)
    print("=== 1. Create tarball ===")
    # Use tar via git-bash/WSL-agnostic: pack from apps/web with relative paths
    # On Windows with bsdtar available (Windows 11 ships it), this works.
    cmd = [
        "tar", "-czf", ARCHIVE,
        "-C", LOCAL_WEB,
        ".next/standalone",
        ".next/static",
        "public",
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("tar failed:", r.stderr)
        raise SystemExit(1)
    size = os.path.getsize(ARCHIVE) / 1024 / 1024
    print(f"  archive size: {size:.1f} MB")

    print("=== 2. Upload + unpack ===")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PWD, timeout=20)

    sftp = ssh.open_sftp()
    remote_archive = "/tmp/web-300.tar.gz"
    sftp.put(ARCHIVE, remote_archive)
    sftp.close()
    print("  uploaded")

    # Overlay: keep /opt/zuting/web path structure (standalone-in-standalone)
    # Existing layout per memory: /opt/zuting/web/standalone/apps/web/server.js
    print("  unpacking into /opt/zuting/web/ (overlay)")
    # Clean stale .next then unpack fresh
    print(run(ssh, "mkdir -p /opt/zuting/web && cd /opt/zuting/web && rm -rf .next/standalone.new .next/static.new public.new"))
    print(run(ssh, f"cd /opt/zuting/web && tar -xzf {remote_archive}"))
    # The tar extracts .next/standalone/... etc directly. Move into place:
    print(run(ssh, "ls -la /opt/zuting/web/.next/ 2>&1 | head -20"))

    # Target layout: /opt/zuting/web/standalone/apps/web/server.js — check if it
    # already exists; if so, we extracted .next/standalone/apps/web -> we need to
    # sync that into /opt/zuting/web/standalone.
    print(run(
        ssh,
        "if [ -d /opt/zuting/web/.next/standalone/apps/web ]; then "
        "  rsync -a --delete "
        "    /opt/zuting/web/.next/standalone/apps/web/ "
        "    /opt/zuting/web/standalone/apps/web/ && "
        "  rsync -a --delete "
        "    /opt/zuting/web/.next/static/ "
        "    /opt/zuting/web/standalone/apps/web/.next/static/ && "
        "  if [ -d /opt/zuting/web/public ]; then "
        "    rsync -a /opt/zuting/web/public/ "
        "      /opt/zuting/web/standalone/apps/web/public/; "
        "  fi && "
        "  echo 'SYNC OK'; "
        "else echo 'unexpected layout'; fi",
        t=120,
    ))

    print("=== 3. Restart web via systemd ===")
    print(run(ssh, "systemctl restart zuting-web && sleep 3 && systemctl is-active zuting-web"))

    print("=== 4. Verify ===")
    time.sleep(2)
    print(run(
        ssh,
        "curl -sk --max-time 10 https://zuting.fszyl.top/ "
        "--resolve zuting.fszyl.top:443:127.0.0.1 | grep -oE '(60\\+|300\\+)[^<\"]{0,40}' | head -20",
        t=30,
    ))
    print("  (raw homepage byte count:)")
    print(run(
        ssh,
        "curl -sk -o /dev/null -w 'HTTP:%{http_code} BYTES:%{size_download}\\n' "
        "https://zuting.fszyl.top/ --resolve zuting.fszyl.top:443:127.0.0.1",
    ))

    ssh.close()


if __name__ == "__main__":
    main()
