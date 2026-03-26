"""Fix web node_modules on 小轻 — replace pnpm structure with flat npm install"""
import paramiko
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('120.24.31.151', username='root', password='y1234567890.')


def run(cmd, show=True):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if show and out:
        print(out)
    if show and err and 'WARNING' not in err and 'NOTICE' not in err and 'npm warn' not in err.lower():
        print(f"  ERR: {err[:500]}")
    return out


# Kill web
print("=== 停止 Web ===")
run('pkill -9 -f "next-server" 2>/dev/null; pkill -9 -f "node /opt/zuting/web" 2>/dev/null', show=False)

# Check what's actually missing
print("\n=== 查看错误详情 ===")
run('head -30 /opt/zuting/web.log')

# The pnpm node_modules structure doesn't work in standalone mode.
# Replace with flat npm install of the key packages.
print("\n=== 替换 node_modules (npm flat install) ===")
run('rm -rf /opt/zuting/web/node_modules', show=False)

# Install at monorepo root level
print("  Installing at /opt/zuting/web/ (monorepo root)...")
run('cd /opt/zuting/web && npm init -y 2>&1 | tail -1', show=False)
run("""cd /opt/zuting/web && npm install \
    next@15 react@19 react-dom@19 \
    styled-jsx \
    @next/env \
    sharp \
    2>&1 | tail -5""")

# Also ensure app-level can resolve
print("\n  Linking app node_modules to root...")
run('rm -rf /opt/zuting/web/apps/web/node_modules', show=False)
run('ln -sf /opt/zuting/web/node_modules /opt/zuting/web/apps/web/node_modules')

# Start web
print("\n=== 启动 Web ===")
run("""cd /opt/zuting/web/apps/web && \\
    NODE_ENV=production \\
    PORT=3003 \\
    HOSTNAME=0.0.0.0 \\
    NEXT_PUBLIC_API_URL=http://localhost:3002 \\
    API_INTERNAL_URL=http://localhost:3002 \\
    nohup node server.js > /opt/zuting/web.log 2>&1 &""", show=False)
time.sleep(6)

# Test
print("\n=== 测试 ===")
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
    run('tail -30 /opt/zuting/web.log')
else:
    print("\n✅ Web 部署成功!")

ssh.close()
