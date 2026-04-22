"""
Re-deploy Next.js Web to 小轻 with correct monorepo directory structure.

Target structure on server (systemd zuting-web.service expects this exact layout):
/opt/zuting/web/standalone/         ← monorepo root (outputFileTracingRoot)
├── node_modules/                   ← shared deps from standalone trace
├── package.json
└── apps/web/                       ← app directory (systemd WorkingDirectory)
    ├── server.js                   ← ExecStart entry
    ├── package.json
    ├── node_modules/               ← app-specific deps
    └── .next/
        ├── BUILD_ID
        ├── server/
        ├── static/
        └── ...

systemd-managed: use `systemctl restart zuting-web` (NOT nohup + pkill).
"""
import paramiko
import json
import time
import tempfile
import subprocess
import os

SERVER = "120.24.31.151"
LOCAL_NEXT = "E:/ZUTING/apps/web/.next"

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


# Step 1: Create tarball locally — standalone already has the monorepo structure
print("=== 1. 打包 Web ===")
tmp = tempfile.gettempdir()
tar_path = os.path.join(tmp, "zuting-web2.tar.gz")

# The standalone dir already mirrors the monorepo:
#   standalone/node_modules/        → shared deps
#   standalone/apps/web/server.js   → entry
#   standalone/apps/web/node_modules → app deps
# We also need .next/static and .next/server etc.

# Create tar with standalone contents as root + .next build output under apps/web/
print("  Creating tarball...")
subprocess.run([
    "tar", "czf", tar_path,
    "-C", f"{LOCAL_NEXT}/standalone",
    "node_modules", "package.json", "apps",
], check=True)
print(f"  ✓ Standalone packed")

# Create separate tar for .next build output (server pages, static, etc.)
tar_next_path = os.path.join(tmp, "zuting-web-next.tar.gz")
subprocess.run([
    "tar", "czf", tar_next_path,
    "-C", LOCAL_NEXT,
    "BUILD_ID", "build-manifest.json", "app-build-manifest.json",
    "app-path-routes-manifest.json", "react-loadable-manifest.json",
    "required-server-files.json", "routes-manifest.json",
    "prerender-manifest.json", "images-manifest.json",
    "next-minimal-server.js.nft.json", "next-server.js.nft.json",
    "package.json", "export-marker.json",
    "server", "static",
], check=True)
# Create tar for public/ static assets (favicon, /images/*, manifest, sw.js)
# Next.js standalone build does NOT auto-copy public/, must sync manually
tar_public_path = os.path.join(tmp, "zuting-web-public.tar.gz")
subprocess.run([
    "tar", "czf", tar_public_path,
    "-C", "E:/ZUTING/apps/web",
    "public",
], check=True)

size1 = os.path.getsize(tar_path) // 1024
size2 = os.path.getsize(tar_next_path) // 1024
size3 = os.path.getsize(tar_public_path) // 1024
print(f"  ✓ .next packed ({size2}KB)")
print(f"  ✓ public packed ({size3}KB)")

# Step 2: Upload
print("\n=== 2. 上传到服务器 ===")
# systemd-managed: stop the unit instead of pkill
run('systemctl stop zuting-web 2>&1 | head -3', show=False)
# Reset standalone/ subtree (systemd's WorkingDirectory root), keep parent so unit file & timers untouched
run('rm -rf /opt/zuting/web/standalone && mkdir -p /opt/zuting/web/standalone', show=False)

sftp.put(tar_path, '/opt/zuting/web-standalone.tar.gz')
print(f"  ✓ Standalone ({size1}KB)")
sftp.put(tar_next_path, '/opt/zuting/web-next.tar.gz')
print(f"  ✓ .next build ({size2}KB)")
sftp.put(tar_public_path, '/opt/zuting/web-public.tar.gz')
print(f"  ✓ public ({size3}KB)")

# Step 3: Extract — standalone goes to /opt/zuting/web/standalone/ (systemd's expected root)
print("\n=== 3. 解压 ===")
run('cd /opt/zuting/web/standalone && tar xzf /opt/zuting/web-standalone.tar.gz', show=False)
# .next build output goes to standalone/apps/web/.next/
run('mkdir -p /opt/zuting/web/standalone/apps/web/.next && cd /opt/zuting/web/standalone/apps/web/.next && tar xzf /opt/zuting/web-next.tar.gz', show=False)
# public/ goes to standalone/apps/web/public/
run('cd /opt/zuting/web/standalone/apps/web && tar xzf /opt/zuting/web-public.tar.gz', show=False)
run('rm -f /opt/zuting/web-standalone.tar.gz /opt/zuting/web-next.tar.gz /opt/zuting/web-public.tar.gz', show=False)

# Verify structure
print("  Structure:")
run('echo "Standalone root:" && ls /opt/zuting/web/standalone/')
run('echo "Apps/web:" && ls /opt/zuting/web/standalone/apps/web/')
run('echo ".next:" && ls /opt/zuting/web/standalone/apps/web/.next/')

# Step 4: Fix Windows paths in server.js and required-server-files.json
print("\n=== 4. 修复 Windows 路径 ===")
fix_script = r'''
import json, os

base = "/opt/zuting/web/standalone/apps/web"

# Fix server.js
with open(f"{base}/server.js", "r") as f:
    s = f.read()

replacements = [
    ("E:\\\\ZUTING\\\\apps\\\\web\\\\", ""),
    ("E:\\\\ZUTING\\\\apps\\\\web", ""),
    ("E:\\\\ZUTING\\\\", "/opt/zuting/web/standalone/"),
    ("E:\\\\ZUTING", "/opt/zuting/web/standalone"),
    ("E:\\ZUTING\\apps\\web\\", ""),
    ("E:\\ZUTING\\apps\\web", ""),
    ("E:\\ZUTING\\", "/opt/zuting/web/standalone/"),
    ("E:\\ZUTING", "/opt/zuting/web/standalone"),
]
for old, new in replacements:
    s = s.replace(old, new)

with open(f"{base}/server.js", "w") as f:
    f.write(s)
count = s.count("ZUTING") + s.count("E:")
print(f"server.js: {count} remaining Windows refs")

# Fix required-server-files.json
rpath = f"{base}/.next/required-server-files.json"
with open(rpath, "r") as f:
    data = json.load(f)

data["appDir"] = "/opt/zuting/web/standalone/apps/web"
data["relativeAppDir"] = "apps/web"
data["files"] = [f.replace("\\", "/") for f in data["files"]]
config = data.get("config", {})
config["outputFileTracingRoot"] = "/opt/zuting/web/standalone"
data["config"] = config

with open(rpath, "w") as f:
    json.dump(data, f)
print(f"required-server-files.json: appDir={data['appDir']}, relativeAppDir={data['relativeAppDir']}")
'''
with sftp.open('/tmp/fix_paths.py', 'w') as f:
    f.write(fix_script)
run('python3 /tmp/fix_paths.py')

# Step 5: Ensure node_modules work (pnpm flat structure fix — scope-aware)
print("\n=== 5. 修复 node_modules ===")
# Scope-aware flatten: for @scope/pkg under .pnpm/*/node_modules/@scope/pkg,
# create node_modules/@scope/pkg → target. For unscoped, link at root.
flatten_sh = r"""
set -e
flatten_dir() {
  local root="$1"
  [ -d "$root/.pnpm" ] || return 0
  cd "$root"
  local linked=0
  for entry in .pnpm/*/node_modules/*; do
    [ -d "$entry" ] || continue
    local base
    base="$(basename "$entry")"
    if [[ "$base" == @* ]]; then
      for sub in "$entry"/*; do
        [ -d "$sub" ] || continue
        local subname
        subname="$base/$(basename "$sub")"
        if [ ! -e "$subname" ]; then
          mkdir -p "$base"
          ln -sf "$(pwd)/$sub" "$subname" 2>/dev/null && linked=$((linked+1))
        fi
      done
    else
      if [ ! -e "$base" ]; then
        ln -sf "$(pwd)/$entry" "$base" 2>/dev/null && linked=$((linked+1))
      fi
    fi
  done
  echo "  $(basename $(dirname "$root"))/$(basename "$root"): linked=$linked top-level=$(ls -1 | wc -l)"
}
flatten_dir /opt/zuting/web/standalone/node_modules
flatten_dir /opt/zuting/web/standalone/apps/web/node_modules
"""
run(flatten_sh)

# Safety net: always ensure critical runtime deps are installed
# (covers @swc/helpers and other transitive deps that pnpm isolated layout doesn't hoist)
print("  Installing runtime safety-net deps...")
run(
    'cd /opt/zuting/web/standalone && '
    'npm install --no-save --no-audit --no-fund --prefer-offline --loglevel=error '
    'next@15 react@19 react-dom@19 "@swc/helpers@^0.5" 2>&1 | tail -5'
)
# Verify key modules resolve
for mod in ['next/dist/server/next-server.js', '@swc/helpers/package.json', 'react/package.json']:
    ok = run(f'ls /opt/zuting/web/standalone/node_modules/{mod} 2>&1 | tail -1', show=False)
    mark = '✓' if 'No such' not in ok and ok else '✗'
    print(f"  {mark} {mod}")

# Step 6: Start via systemd (canonical path; unit manages env/port/cwd)
print("\n=== 6. systemctl start zuting-web ===")
run('systemctl daemon-reload 2>&1', show=False)
run('systemctl start zuting-web 2>&1 | head -3', show=False)
time.sleep(8)
run('systemctl status zuting-web --no-pager 2>&1 | head -12')

# Step 7: Test
print("\n=== 7. 测试 ===")
all_ok = True
# systemd unit may bind 3000 or 3003 — probe both
probe_port = None
for port in ('3000', '3003'):
    c = run(f'curl -s -o /dev/null -w "%{{http_code}}" http://localhost:{port}/', show=False)
    if c == '200':
        probe_port = port
        break
probe_port = probe_port or '3000'
print(f"  Probing port {probe_port}")

for p in ['/', '/religions', '/holy-sites', '/seals', '/temples', '/holy-sites/routes/lingnan-dao-chan-2026-may']:
    code = run(f'curl -s -o /dev/null -w "%{{http_code}}" http://localhost:{probe_port}{p}', show=False)
    status = "✓" if code == "200" else "✗"
    if code != "200":
        all_ok = False
    print(f"  {status} {p:50s} → HTTP {code}")

api_code = run('curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/religions', show=False)
print(f"\n  API /api/religions → HTTP {api_code}")

if not all_ok:
    print("\n=== systemd journal 最近 30 行 ===")
    run('journalctl -u zuting-web --no-pager -n 30 2>&1')

sftp.close()
ssh.close()

if all_ok:
    print("\n✅ Web 部署成功 (systemd-managed)")
else:
    print("\n⚠️  仍有问题,检查 journalctl 日志")
