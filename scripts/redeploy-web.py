"""
Re-deploy Next.js Web to 小轻 with correct monorepo directory structure.

Target structure on server:
/opt/zuting/web/                    ← monorepo root (outputFileTracingRoot)
├── node_modules/                   ← shared deps from standalone trace
├── package.json
└── apps/web/                       ← app directory
    ├── server.js                   ← entry point
    ├── package.json
    ├── node_modules/               ← app-specific deps
    └── .next/
        ├── BUILD_ID
        ├── server/
        ├── static/
        └── ...
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
ssh.connect(SERVER, username='root', password='y1234567890.')
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
size1 = os.path.getsize(tar_path) // 1024
size2 = os.path.getsize(tar_next_path) // 1024
print(f"  ✓ .next packed ({size2}KB)")

# Step 2: Upload
print("\n=== 2. 上传到服务器 ===")
run('pkill -9 -f "next-server" 2>/dev/null; pkill -9 -f "node /opt/zuting/web" 2>/dev/null', show=False)
run('rm -rf /opt/zuting/web && mkdir -p /opt/zuting/web', show=False)

sftp.put(tar_path, '/opt/zuting/web-standalone.tar.gz')
print(f"  ✓ Standalone ({size1}KB)")
sftp.put(tar_next_path, '/opt/zuting/web-next.tar.gz')
print(f"  ✓ .next build ({size2}KB)")

# Step 3: Extract — standalone goes to /opt/zuting/web/ directly
print("\n=== 3. 解压 ===")
run('cd /opt/zuting/web && tar xzf /opt/zuting/web-standalone.tar.gz', show=False)
# .next build output goes to apps/web/.next/
run('mkdir -p /opt/zuting/web/apps/web/.next && cd /opt/zuting/web/apps/web/.next && tar xzf /opt/zuting/web-next.tar.gz', show=False)
run('rm -f /opt/zuting/web-standalone.tar.gz /opt/zuting/web-next.tar.gz', show=False)

# Verify structure
print("  Structure:")
run('echo "Root:" && ls /opt/zuting/web/')
run('echo "Apps/web:" && ls /opt/zuting/web/apps/web/')
run('echo ".next:" && ls /opt/zuting/web/apps/web/.next/')

# Step 4: Fix Windows paths in server.js and required-server-files.json
print("\n=== 4. 修复 Windows 路径 ===")
fix_script = r'''
import json, os

base = "/opt/zuting/web/apps/web"

# Fix server.js
with open(f"{base}/server.js", "r") as f:
    s = f.read()

replacements = [
    ("E:\\\\ZUTING\\\\apps\\\\web\\\\", ""),
    ("E:\\\\ZUTING\\\\apps\\\\web", ""),
    ("E:\\\\ZUTING\\\\", "/opt/zuting/web/"),
    ("E:\\\\ZUTING", "/opt/zuting/web"),
    ("E:\\ZUTING\\apps\\web\\", ""),
    ("E:\\ZUTING\\apps\\web", ""),
    ("E:\\ZUTING\\", "/opt/zuting/web/"),
    ("E:\\ZUTING", "/opt/zuting/web"),
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

data["appDir"] = "/opt/zuting/web/apps/web"
data["relativeAppDir"] = "apps/web"
data["files"] = [f.replace("\\", "/") for f in data["files"]]
config = data.get("config", {})
config["outputFileTracingRoot"] = "/opt/zuting/web"
data["config"] = config

with open(rpath, "w") as f:
    json.dump(data, f)
print(f"required-server-files.json: appDir={data['appDir']}, relativeAppDir={data['relativeAppDir']}")
'''
with sftp.open('/tmp/fix_paths.py', 'w') as f:
    f.write(fix_script)
run('python3 /tmp/fix_paths.py')

# Step 5: Ensure node_modules work (pnpm flat structure fix)
print("\n=== 5. 修复 node_modules ===")
run("""cd /opt/zuting/web/node_modules
if [ -d .pnpm ]; then
    for pkg_dir in .pnpm/*/node_modules/*; do
        pkg_name=$(echo "$pkg_dir" | sed 's|.*node_modules/||')
        if [ ! -e "$pkg_name" ] && [ -d "$pkg_dir" ]; then
            if [[ "$pkg_name" == @* ]]; then
                scope=$(echo "$pkg_name" | cut -d/ -f1)
                mkdir -p "$scope"
            fi
            ln -sf "$(pwd)/$pkg_dir" "$pkg_name" 2>/dev/null
        fi
    done
fi
echo "Root node_modules: $(ls -1 | wc -l) packages"
""")

# Also fix app-level node_modules
run("""cd /opt/zuting/web/apps/web/node_modules 2>/dev/null
if [ -d .pnpm ]; then
    for pkg_dir in .pnpm/*/node_modules/*; do
        pkg_name=$(echo "$pkg_dir" | sed 's|.*node_modules/||')
        if [ ! -e "$pkg_name" ] && [ -d "$pkg_dir" ]; then
            if [[ "$pkg_name" == @* ]]; then
                scope=$(echo "$pkg_name" | cut -d/ -f1)
                mkdir -p "$scope"
            fi
            ln -sf "$(pwd)/$pkg_dir" "$pkg_name" 2>/dev/null
        fi
    done
fi
echo "App node_modules: $(ls -1 2>/dev/null | wc -l) packages"
""")

# Check if next module is resolvable
has_next = run('ls /opt/zuting/web/node_modules/next/dist/server/next-server.js 2>/dev/null', show=False)
if not has_next:
    print("  ⚠ next not properly resolved, installing via npm...")
    run('cd /opt/zuting/web && npm install next@15 react@19 react-dom@19 --no-save 2>&1 | tail -3')
else:
    print("  ✓ next module resolved")

# Step 6: Start
print("\n=== 6. 启动 Web ===")
run("""cd /opt/zuting/web/apps/web && \
    NODE_ENV=production \
    PORT=3003 \
    HOSTNAME=0.0.0.0 \
    NEXT_PUBLIC_API_URL=http://localhost:3002 \
    API_INTERNAL_URL=http://localhost:3002 \
    nohup node server.js > /opt/zuting/web.log 2>&1 &""", show=False)
time.sleep(6)

# Step 7: Test
print("\n=== 7. 测试 ===")
all_ok = True
for p in ['/', '/religions', '/holy-sites', '/seals', '/temples']:
    code = run(f'curl -s -o /dev/null -w "%{{http_code}}" http://localhost:3003{p}', show=False)
    status = "✓" if code == "200" else "✗"
    if code != "200":
        all_ok = False
    print(f"  {status} {p:20s} → HTTP {code}")

api_code = run('curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/religions', show=False)
print(f"\n  API /api/religions → HTTP {api_code}")

if not all_ok:
    print("\n=== Web 日志 ===")
    run('tail -20 /opt/zuting/web.log')

# Update start.sh
start_script = """#!/bin/bash
pkill -f 'node /opt/zuting' 2>/dev/null
sleep 1

# API
cd /opt/zuting/api
export NODE_ENV=production API_PORT=3002
nohup node dist/main.js > /opt/zuting/api.log 2>&1 &
echo "API PID: $!"

# Web
cd /opt/zuting/web/apps/web
export NODE_ENV=production PORT=3003 HOSTNAME=0.0.0.0
export NEXT_PUBLIC_API_URL=http://localhost:3002
export API_INTERNAL_URL=http://localhost:3002
nohup node server.js > /opt/zuting/web.log 2>&1 &
echo "Web PID: $!"
"""
with sftp.open('/opt/zuting/start.sh', 'w') as f:
    f.write(start_script)
run('chmod +x /opt/zuting/start.sh', show=False)

sftp.close()
ssh.close()

if all_ok:
    print("\n✅ Web 部署成功!")
else:
    print("\n⚠️  仍有问题，请检查日志")
