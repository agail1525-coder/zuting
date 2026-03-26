"""
Fix Next.js standalone deployment on 小轻 — recreate monorepo directory structure.

The standalone build was done in apps/web/ within the monorepo, so server.js
expects that relative path. We need to mirror this on the server:

/opt/zuting/web/                    ← outputFileTracingRoot (monorepo root)
├── node_modules/                   ← shared dependencies
└── apps/web/                       ← the actual app
    ├── server.js
    ├── package.json
    ├── node_modules/               ← app-specific deps
    └── .next/
        ├── server/
        ├── static/
        └── ...
"""
import paramiko
import json
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('120.24.31.151', username='root', password='y1234567890.')
sftp = ssh.open_sftp()


def run(cmd, show=True):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if show and out:
        print(out)
    if show and err and 'WARNING' not in err and 'NOTICE' not in err:
        print(f"  ERR: {err[:300]}")
    return out


# Step 1: Kill existing web process
print("=== 停止 Web 服务 ===")
run('pkill -9 -f "next-server" 2>/dev/null; pkill -9 -f "node /opt/zuting/web" 2>/dev/null; sleep 2', show=False)

# Step 2: Restructure to mirror monorepo layout
print("\n=== 重组目录结构 ===")
run("""
cd /opt/zuting

# Create temp workspace
rm -rf /tmp/zuting-restructure
mkdir -p /tmp/zuting-restructure/apps/web

# Move current files to temp
cp -r web/.next /tmp/zuting-restructure/apps/web/.next 2>/dev/null
cp web/server.js /tmp/zuting-restructure/apps/web/server.js 2>/dev/null
cp web/app_package.json /tmp/zuting-restructure/apps/web/package.json 2>/dev/null

# Move node_modules (root-level = monorepo shared deps)
if [ -d web/node_modules ]; then
    cp -r web/node_modules /tmp/zuting-restructure/node_modules
fi

# Move app-specific modules
if [ -d web/app_modules ]; then
    cp -r web/app_modules /tmp/zuting-restructure/apps/web/node_modules
fi

# Now replace the web directory
rm -rf web
mv /tmp/zuting-restructure web

echo "Done restructuring"
ls -la web/
echo "---"
ls -la web/apps/web/
""")

# Step 3: Fix required-server-files.json for the NEW structure
print("\n=== 修复 required-server-files.json ===")
try:
    with sftp.open('/opt/zuting/web/apps/web/.next/required-server-files.json', 'r') as f:
        data = json.load(f)

    # The monorepo root is /opt/zuting/web (mirrors E:\ZUTING)
    # The app dir is /opt/zuting/web/apps/web (mirrors E:\ZUTING\apps\web)
    data['appDir'] = '/opt/zuting/web/apps/web'
    data['relativeAppDir'] = 'apps/web'
    data['files'] = [f.replace("\\", '/') for f in data['files']]
    config = data.get('config', {})
    config['outputFileTracingRoot'] = '/opt/zuting/web'
    data['config'] = config

    with sftp.open('/opt/zuting/web/apps/web/.next/required-server-files.json', 'w') as f:
        f.write(json.dumps(data, indent=2))
    print("  ✓ appDir = /opt/zuting/web/apps/web")
    print("  ✓ relativeAppDir = apps/web")
    print("  ✓ outputFileTracingRoot = /opt/zuting/web")
except Exception as e:
    print(f"  ✗ Error: {e}")

# Step 4: Fix server.js — replace Windows paths
print("\n=== 修复 server.js 路径 ===")
fix_py = r'''
import re

with open("/opt/zuting/web/apps/web/server.js", "r") as f:
    s = f.read()

# Replace all forms of Windows paths
# E:\\ZUTING\\apps\\web\\ -> (empty, since we're already in apps/web)
# E:\\ZUTING\\ -> /opt/zuting/web/
# E:\\ZUTING -> /opt/zuting/web

# Handle various escape levels
for bs in ['\\\\\\\\', '\\\\']:
    s = s.replace(f'E:{bs}ZUTING{bs}apps{bs}web{bs}', '')
    s = s.replace(f'E:{bs}ZUTING{bs}apps{bs}web', '')
    s = s.replace(f'E:{bs}ZUTING{bs}', '/opt/zuting/web/')
    s = s.replace(f'E:{bs}ZUTING', '/opt/zuting/web')

# Also handle JSON-escaped paths (double-escaped backslashes)
s = s.replace('E:\\\\ZUTING\\\\apps\\\\web\\\\', '')
s = s.replace('E:\\\\ZUTING\\\\apps\\\\web', '')
s = s.replace('E:\\\\ZUTING\\\\', '/opt/zuting/web/')
s = s.replace('E:\\\\ZUTING', '/opt/zuting/web')

with open("/opt/zuting/web/apps/web/server.js", "w") as f:
    f.write(s)

# Verify no Windows paths remain
count = s.count('ZUTING') + s.count('E:')
print(f"Remaining Windows refs: {count}")
'''
with sftp.open('/tmp/fix_server2.py', 'w') as f:
    f.write(fix_py)
run('python3 /tmp/fix_server2.py')

# Step 5: Ensure node_modules are in place
print("\n=== 检查依赖 ===")
# Check if next is available at root level
has_next = run('ls /opt/zuting/web/node_modules/next/package.json 2>/dev/null | head -1', show=False)
if not has_next:
    print("  Installing next/react at root node_modules...")
    run('cd /opt/zuting/web && npm install next@15 react@19 react-dom@19 2>&1 | tail -3')
else:
    print("  ✓ next found in root node_modules")

# Also check app-level
has_app_next = run('ls /opt/zuting/web/apps/web/node_modules/next/package.json 2>/dev/null | head -1', show=False)
if not has_app_next:
    print("  Symlinking app node_modules...")
    run('mkdir -p /opt/zuting/web/apps/web/node_modules && ln -sf /opt/zuting/web/node_modules/next /opt/zuting/web/apps/web/node_modules/next 2>/dev/null')
    run('ln -sf /opt/zuting/web/node_modules/react /opt/zuting/web/apps/web/node_modules/react 2>/dev/null')
    run('ln -sf /opt/zuting/web/node_modules/react-dom /opt/zuting/web/apps/web/node_modules/react-dom 2>/dev/null')

# Step 6: Start web from the correct directory
print("\n=== 启动 Web ===")
start_cmd = """cd /opt/zuting/web/apps/web && \\
    NODE_ENV=production \\
    PORT=3003 \\
    HOSTNAME=0.0.0.0 \\
    NEXT_PUBLIC_API_URL=http://localhost:3002 \\
    API_INTERNAL_URL=http://localhost:3002 \\
    nohup node server.js > /opt/zuting/web.log 2>&1 &"""
run(start_cmd, show=False)
time.sleep(5)

# Step 7: Test
print("\n=== 测试页面 ===")
for p in ['/', '/religions', '/holy-sites', '/seals', '/temples']:
    code = run(f'curl -s -o /dev/null -w "%{{http_code}}" http://localhost:3003{p}', show=False)
    status = "✓" if code == "200" else "✗"
    print(f"  {status} {p:20s} → HTTP {code}")

# Also test API
api_code = run('curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/religions', show=False)
print(f"\n  API /api/religions → HTTP {api_code}")

# Step 8: Show logs if any 404s
print("\n=== Web 日志 ===")
run('tail -10 /opt/zuting/web.log')

# Update start.sh to use the correct path
print("\n=== 更新 start.sh ===")
start_script = """#!/bin/bash
# Kill previous
pkill -f 'node /opt/zuting' 2>/dev/null
sleep 1

# Start API
cd /opt/zuting/api
export NODE_ENV=production API_PORT=3002
nohup node dist/main.js > /opt/zuting/api.log 2>&1 &
echo "API PID: $!"

# Start Web (must run from apps/web to match monorepo structure)
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
print("  ✓ start.sh 已更新")

sftp.close()
ssh.close()
print("\n=== 完成 ===")
