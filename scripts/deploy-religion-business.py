"""
部署 Religion 商业实践内容到线上:
1. 上传更新后的 schema.prisma
2. 服务器上 prisma db push 添加3个新字段
3. 服务器上跑独立 Node 脚本,把 RELIGION_BUSINESS_CONTENT 写入 DB
4. 刷 Redis 的 religion:* 缓存
5. 不重启 API (Prisma 查询不指定 select,新字段自动返回)
"""
import paramiko
import os
import re

SERVER = "120.24.31.151"
LOCAL_SCHEMA = "E:/ZUTING/services/api/prisma/schema.prisma"
LOCAL_CONTENT = "E:/ZUTING/services/api/prisma/seed-religion-business.ts"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username='root', password='y1234567890.')
sftp = ssh.open_sftp()


def run(cmd, show=True):
    _, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if show and out:
        print(out)
    if show and err and 'WARNING' not in err and 'NOTICE' not in err and 'Environment variables loaded' not in err:
        print(f"  STDERR: {err[:1000]}")
    return out


# Step 1: Upload schema.prisma
print("=== 1. Upload schema.prisma ===")
schema_path = run('find /opt/zuting -name "schema.prisma" -not -path "*/node_modules/*" 2>/dev/null | head -1', show=False)
print(f"  server schema: {schema_path}")
if not schema_path:
    run('mkdir -p /opt/zuting/api/prisma', show=False)
    schema_path = '/opt/zuting/api/prisma/schema.prisma'
sftp.put(LOCAL_SCHEMA, schema_path)
print(f"  uploaded schema.prisma")

# Step 2: Push schema
print("\n=== 2. Prisma db push ===")
api_dir = os.path.dirname(os.path.dirname(schema_path))
print(f"  api dir: {api_dir}")
run(f'cd {api_dir} && npx prisma db push --skip-generate --accept-data-loss 2>&1 | tail -20')

# Step 3: Regenerate prisma client
print("\n=== 3. Prisma generate ===")
run(f'cd {api_dir} && node ./node_modules/prisma/build/index.js generate 2>&1 | tail -5')

# Step 4: Parse seed-religion-business.ts and create JS seed script
print("\n=== 4. Prepare seed script ===")
with open(LOCAL_CONTENT, 'r', encoding='utf-8') as f:
    ts_content = f.read()

m = re.search(r'export const RELIGION_BUSINESS_CONTENT[^{]*=\s*(\{.*\n\});', ts_content, re.DOTALL)
if not m:
    print("  FAILED to parse RELIGION_BUSINESS_CONTENT")
    exit(1)

obj_literal = m.group(1)

seed_js = f"""
const {{ PrismaClient }} = require('@prisma/client');
const prisma = new PrismaClient();

const RELIGION_BUSINESS_CONTENT = {obj_literal};

async function main() {{
  let n = 0;
  for (const [slug, biz] of Object.entries(RELIGION_BUSINESS_CONTENT)) {{
    const r = await prisma.religion.updateMany({{
      where: {{ slug }},
      data: {{
        businessPhilosophy: biz.businessPhilosophy,
        businessValues: biz.businessValues,
        businessInsight: biz.businessInsight,
      }},
    }});
    console.log(`  ${{slug}}: ${{r.count}} updated`);
    n += r.count;
  }}
  console.log(`Total: ${{n}} religions updated`);
}}

main().catch(e => {{ console.error(e); process.exit(1); }}).finally(() => prisma.$disconnect());
"""

seed_path = f'{api_dir}/seed-religion-business.js'
with sftp.open(seed_path, 'w') as f:
    f.write(seed_js)
print(f"  seed script uploaded ({len(seed_js)} bytes)")

# Step 5: Run seed
print("\n=== 5. Execute seed ===")
run(f'cd {api_dir} && node seed-religion-business.js')

# Step 6: Flush Redis cache
print("\n=== 6. Flush Redis cache ===")
redis_cmd = run('docker ps --format "{{.Names}}" | grep -i redis | head -1', show=False)
print(f"  redis container: {redis_cmd}")
if redis_cmd:
    redis_url = run(f'grep -E "^REDIS_URL" {api_dir}/.env | head -1', show=False)
    # Extract password from redis://:<pw>@host:port/db
    pw_match = re.search(r'redis://:(.*?)@', redis_url) if redis_url else None
    redis_pw = pw_match.group(1) if pw_match else ''
    db_match = re.search(r'/(\d+)$', redis_url) if redis_url else None
    redis_db = db_match.group(1) if db_match else '0'
    auth = f'-a {redis_pw}' if redis_pw else ''
    run(f'docker exec {redis_cmd} redis-cli {auth} -n {redis_db} --scan --pattern "religion:*" | xargs -r -n1 docker exec -i {redis_cmd} redis-cli {auth} -n {redis_db} DEL 2>&1 | head -20')

# Step 7: Verify
print("\n=== 7. Verify ===")
verify_py = '''
import json, sys, urllib.request
d = json.loads(urllib.request.urlopen("http://localhost:3002/api/religions/buddhism").read())
print("  name:", d.get("name"))
print("  businessPhilosophy:", (d.get("businessPhilosophy") or "MISSING")[:60])
print("  businessValues:", len(d.get("businessValues") or []), "values")
print("  businessInsight:", len(d.get("businessInsight") or ""), "chars")
'''
with sftp.open('/tmp/verify_biz.py', 'w') as f:
    f.write(verify_py)
run('python3 /tmp/verify_biz.py')
run(f'rm -f /tmp/verify_biz.py {seed_path}', show=False)

sftp.close()
ssh.close()
print("\n Done")
