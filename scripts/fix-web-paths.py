"""Fix Windows paths in Next.js standalone build on 小轻"""
import paramiko
import json
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('120.24.31.151', username='root', password='y1234567890.')
sftp = ssh.open_sftp()


def run(cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode().strip()
    if out:
        print(out)
    return out


# 1. Fix required-server-files.json
print("=== Fix required-server-files.json ===")
with sftp.open('/opt/zuting/web/.next/required-server-files.json', 'r') as f:
    data = json.load(f)

data['appDir'] = '/opt/zuting/web'
data['relativeAppDir'] = ''
data['files'] = [f.replace("\\", '/') for f in data['files']]
config = data.get('config', {})
config['outputFileTracingRoot'] = '/opt/zuting/web'
data['config'] = config

with sftp.open('/opt/zuting/web/.next/required-server-files.json', 'w') as f:
    f.write(json.dumps(data))
print("  Done")

# 2. Fix server.js on remote
print("\n=== Fix server.js ===")
fix_py = '''
with open("/opt/zuting/web/server.js","r") as f:
    s = f.read()
s = s.replace("E:\\\\\\\\ZUTING\\\\\\\\","/opt/zuting/web/")
s = s.replace("E:\\\\\\\\ZUTING","/opt/zuting/web")
s = s.replace("apps\\\\\\\\web\\\\\\\\","")
s = s.replace("apps\\\\\\\\web","")
with open("/opt/zuting/web/server.js","w") as f:
    f.write(s)
print("fixed")
'''
with sftp.open('/tmp/fix_server.py', 'w') as f:
    f.write(fix_py)
run('python3 /tmp/fix_server.py')

# 3. Restart web
print("\n=== Restart Web ===")
run('pkill -9 -f "next-server" 2>/dev/null; sleep 2')
run('cd /opt/zuting/web && PORT=3003 NODE_ENV=production HOSTNAME=0.0.0.0 nohup node server.js > /opt/zuting/web.log 2>&1 &')
time.sleep(5)

# 4. Test
print("\n=== Test pages ===")
for p in ['/', '/religions', '/holy-sites', '/seals']:
    code = run(f'curl -s -o /dev/null -w "%{{http_code}}" http://localhost:3003{p}')

# 5. Log
print("\n=== Web log ===")
run('tail -5 /opt/zuting/web.log')

sftp.close()
ssh.close()
