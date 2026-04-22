"""
Minimal hot-patch for guide.service.ts — ships computeInlineImages
and restarts zuting-api via systemctl.
"""
import os
import paramiko
import tempfile
import subprocess

SERVER = "120.24.31.151"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

_KEY_PATH = os.path.expanduser('~/.ssh/xiaoqing_deploy_ed25519')
try:
    ssh.connect(SERVER, username='root', key_filename=_KEY_PATH, timeout=15)
    print(f"[auth] key: {_KEY_PATH}")
except Exception as _ke:
    print(f"[auth] key failed ({_ke}); fallback to password")
    ssh.connect(SERVER, username='root', password='y1234567890.', timeout=15)
    print("[auth] password OK")

sftp = ssh.open_sftp()


def run(cmd, show=True):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if show and out:
        print(out)
    if show and err and 'WARNING' not in err and 'NOTICE' not in err:
        print(f"  STDERR: {err[:500]}")
    return out


print("=== 1. Local build API ===")
rc = subprocess.call("pnpm --filter @zuting/api build", shell=True, cwd="E:/ZUTING")
if rc != 0:
    raise SystemExit(f"build failed rc={rc}")

print("\n=== 2. Pack dist ===")
tmp = tempfile.gettempdir()
tar_path = os.path.join(tmp, "zuting-api-guide.tar.gz")
subprocess.check_call(
    ["tar", "czf", tar_path, "-C", "E:/ZUTING/services/api", "dist"],
)
print(f"tar: {tar_path} ({os.path.getsize(tar_path)/1024:.1f} KB)")

print("\n=== 3. Upload ===")
sftp.put(tar_path, "/tmp/zuting-api-guide.tar.gz")
print("uploaded")

print("\n=== 4. Unpack + restart ===")
run("cd /opt/zuting/api && tar xzf /tmp/zuting-api-guide.tar.gz")
run("systemctl restart zuting-api")
run("sleep 3 && systemctl status zuting-api --no-pager | head -20")

print("\n=== 5. Verify inlineImages in response ===")
run("curl -s http://localhost:3002/api/community/trending | python3 -c 'import sys,json; d=json.load(sys.stdin); g=d.get(\"guides\") or d.get(\"data\",{}).get(\"guides\") or []; print(\"guide count:\", len(g)); print(\"first id:\", g[0][\"id\"] if g else \"none\")'")

ssh.close()
print("\n[done]")
