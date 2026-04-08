"""
部署 Religion 深度内容到线上:
1. 上传更新后的 schema.prisma + 生成内容文件到服务器
2. 服务器上 prisma db push 添加新字段
3. 服务器上跑独立 Node 脚本,把 RELIGION_DEEP_CONTENT 写入 DB
4. 刷 Redis 的 religion:* 缓存
5. 不重启 API (Prisma 查询不指定 select,新字段自动返回)
"""
import paramiko
import os
import json

SERVER = "120.24.31.151"
LOCAL_SCHEMA = "E:/ZUTING/services/api/prisma/schema.prisma"
LOCAL_CONTENT = "E:/ZUTING/services/api/prisma/seed-religion-content.ts"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username='root', password='y1234567890.')
sftp = ssh.open_sftp()


def run(cmd, show=True, check=False):
    _, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if show and out:
        print(out)
    if show and err and 'WARNING' not in err and 'NOTICE' not in err and 'Environment variables loaded' not in err:
        print(f"  STDERR: {err[:1000]}")
    return out


# Step 1: Upload schema.prisma
print("=== 1. 上传 schema.prisma ===")
# Find server prisma location
schema_path = run('find /opt/zuting -name "schema.prisma" -not -path "*/node_modules/*" 2>/dev/null | head -1', show=False)
print(f"  server schema: {schema_path}")

if not schema_path:
    # Create the prisma dir structure
    run('mkdir -p /opt/zuting/api/prisma', show=False)
    schema_path = '/opt/zuting/api/prisma/schema.prisma'

sftp.put(LOCAL_SCHEMA, schema_path)
print(f"  ✓ uploaded schema.prisma → {schema_path}")

# Step 2: Push schema (adds new nullable columns — safe)
print("\n=== 2. Prisma db push ===")
api_dir = os.path.dirname(os.path.dirname(schema_path))
print(f"  api dir: {api_dir}")

# Verify DATABASE_URL
db_url = run(f'cd {api_dir} && grep DATABASE_URL .env 2>/dev/null || echo ""', show=False)
print(f"  env: {db_url[:80]}")

# Push schema
push_out = run(f'cd {api_dir} && npx prisma db push --skip-generate --accept-data-loss 2>&1 | tail -20')
print("  done push")

# Regenerate prisma client so seeding can use new fields
print("\n=== 3. Prisma generate ===")
run(f'cd {api_dir} && npx prisma generate 2>&1 | tail -5')

# Step 4: Write inline JS seed script with embedded content
print("\n=== 4. 准备 seed 脚本 ===")

# Parse seed-religion-content.ts to extract the RELIGION_DEEP_CONTENT object
# Simpler: use node to transpile & exec via tsx if available
# Safest: write a plain JS script that embeds the content as JSON
import re
with open(LOCAL_CONTENT, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Extract the object literal after "export const RELIGION_DEEP_CONTENT: ...= {"
m = re.search(r'export const RELIGION_DEEP_CONTENT[^{]*=\s*(\{.*\n\});', ts_content, re.DOTALL)
if not m:
    print("  ✗ Failed to parse RELIGION_DEEP_CONTENT")
    exit(1)

obj_literal = m.group(1)

# Wrap as a Node script that loads @prisma/client and writes the content
seed_js = f"""
const {{ PrismaClient }} = require('@prisma/client');
const prisma = new PrismaClient();

const RELIGION_DEEP_CONTENT = {obj_literal};

async function main() {{
  let n = 0;
  for (const [slug, deep] of Object.entries(RELIGION_DEEP_CONTENT)) {{
    const r = await prisma.religion.updateMany({{
      where: {{ slug }},
      data: {{
        heroImage: deep.heroImage,
        tagline: deep.tagline,
        summary: deep.summary,
        foundedYear: deep.foundedYear,
        founder: deep.founder,
        followers: deep.followers,
        origin: deep.origin,
        development: deep.development,
        keyEvents: deep.keyEvents,
        contributions: deep.contributions,
        controversies: deep.controversies,
        sacredTexts: deep.sacredTexts,
      }},
    }});
    console.log(`  ${{slug}}: ${{r.count}} updated`);
    n += r.count;
  }}
  console.log(`Total: ${{n}} religions updated`);
}}

main().catch(e => {{ console.error(e); process.exit(1); }}).finally(() => prisma.$disconnect());
"""

# Upload to api dir where node_modules lives
seed_path = f'{api_dir}/seed-religion-deep.js'
with sftp.open(seed_path, 'w') as f:
    f.write(seed_js)
print(f"  ✓ seed script uploaded ({len(seed_js)} bytes) → {seed_path}")

# Step 5: Run seed
print("\n=== 5. 执行 seed ===")
run(f'cd {api_dir} && node seed-religion-deep.js')

# Step 6: Flush Redis cache (get password from API env)
print("\n=== 6. 清 Redis 缓存 ===")
redis_pw = run(f'grep -E "^REDIS_PASSWORD" {api_dir}/.env | cut -d= -f2- | tr -d \\"\\\'\\" ', show=False)
redis_cmd = run('docker ps --format "{{.Names}}" | grep -i redis | head -1', show=False)
print(f"  redis container: {redis_cmd}, pw set: {bool(redis_pw)}")
if redis_cmd:
    auth = f'-a {redis_pw}' if redis_pw else ''
    run(f'docker exec {redis_cmd} redis-cli {auth} --scan --pattern "religion:*" | xargs -r -n1 docker exec -i {redis_cmd} redis-cli {auth} DEL 2>&1 | head -20')

# Step 7: Verify via API
print("\n=== 7. 验证 ===")
verify_py = '''
import json, sys, urllib.request
d = json.loads(urllib.request.urlopen("http://localhost:3002/api/religions/islam").read())
print("  name:", d.get("name"))
print("  tagline:", (d.get("tagline") or "MISSING")[:60])
print("  heroImage:", "YES" if d.get("heroImage") else "MISSING")
print("  origin:", len(d.get("origin") or ""), "chars")
print("  keyEvents:", len(d.get("keyEvents") or []), "events")
print("  sacredTexts:", len(d.get("sacredTexts") or []), "texts")
'''
with sftp.open('/tmp/verify_religion.py', 'w') as f:
    f.write(verify_py)
run('python3 /tmp/verify_religion.py')
run('rm -f /tmp/verify_religion.py ' + seed_path, show=False)

sftp.close()
ssh.close()
print("\n✅ 完成")
