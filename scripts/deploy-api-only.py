"""
ZUTING API-only 快速部署 — 小轻服务器
只部署 NestJS API (不重建 Web/Admin)
"""
import paramiko
import time
import os

SERVER = "120.24.31.151"
USER = "root"
PASSWORD = "y1234567890."
REMOTE_BASE = "/opt/zuting"
API_PORT = 3002

# Windows temp path for paramiko
TAR_PATH = os.path.join(os.environ.get("TEMP", "C:\\Temp"), "zuting-api.tar.gz")


def run(ssh, cmd, show=True):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if show and out:
        print(out)
    if err and "WARNING" not in err and "NOTICE" not in err and "npm warn" not in err.lower():
        print(f"  ERR: {err[:300]}")
    return out


def main():
    print("=" * 60)
    print("  ZUTING API 快速部署")
    print("=" * 60)

    # 0. 本地打包 (bash tar already done)
    if not os.path.exists(TAR_PATH):
        print(f"  找不到 {TAR_PATH}")
        print("  请先运行: cd services/api && tar czf $TEMP/zuting-api.tar.gz --force-local -C . dist prisma package.json")
        return

    print(f"\n[0] 包文件: {TAR_PATH} ({os.path.getsize(TAR_PATH) // 1024}KB)")

    # 1. 连接
    print("\n[1/4] 连接服务器...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    sftp = ssh.open_sftp()
    print("  OK")

    # 2. 上传+解压
    print("\n[2/4] 上传+部署...")
    run(ssh, f"rm -rf {REMOTE_BASE}/api && mkdir -p {REMOTE_BASE}/api", show=False)
    sftp.put(TAR_PATH, f"{REMOTE_BASE}/api.tar.gz")
    run(ssh, f"cd {REMOTE_BASE}/api && tar xzf ../api.tar.gz && rm -f ../api.tar.gz", show=False)

    # .env
    env = """DATABASE_URL="postgresql://zuoyelang:uoUSiW6cmCxrtKTY21bp@localhost:5434/zuting?schema=public"
REDIS_URL="redis://:CbFjnSKeIFi3dk7mzIRW@localhost:6379/2"
PORT=3002
NODE_ENV=production
JWT_SECRET="zuting-prod-jwt-s3cret-2026-k9x7m"
LLM_BASE_URL="http://120.24.31.151:18001/v1"
LLM_MODEL="/root/autodl-tmp/models/Qwen/Qwen3___5-122B-A10B-GPTQ-Int4"
LLM_API_KEY="zuoyelang2026"
"""
    with sftp.open(f"{REMOTE_BASE}/api/.env", "w") as f:
        f.write(env)
    print("  OK")

    # 3. npm install + prisma
    print("\n[3/4] 安装依赖 + Prisma...")
    run(ssh, f"cd {REMOTE_BASE}/api && npm install --legacy-peer-deps 2>&1 | tail -3")
    run(ssh, f"cd {REMOTE_BASE}/api && npx prisma generate 2>&1 | tail -3")
    run(ssh, f"cd {REMOTE_BASE}/api && npx prisma db push --accept-data-loss 2>&1 | tail -3")

    # 4. 重启
    print("\n[4/4] 重启API...")
    run(ssh, "fuser -k 3002/tcp 2>/dev/null; sleep 1", show=False)
    run(ssh, f"cd {REMOTE_BASE}/api && NODE_ENV=production PORT=3002 nohup node dist/main.js > /opt/zuting/api.log 2>&1 &", show=False)
    time.sleep(5)

    api_code = run(ssh, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3002/api/religions", show=False)
    print(f"  API :3002 -> HTTP {api_code}")

    test = run(ssh, "curl -s -o /dev/null -w '%{http_code}' 'http://localhost:3002/api/holy-sites?limit=20&religionId=test'", show=False)
    print(f"  holy-sites+religionId -> HTTP {test} (expect non-400)")

    if api_code != "200":
        print("\n  API log:")
        run(ssh, "tail -20 /opt/zuting/api.log")

    print("\n" + "=" * 60)
    if api_code == "200":
        print("  API 部署成功!")
    else:
        print("  !! 请检查日志")
    print("=" * 60)

    sftp.close()
    ssh.close()


if __name__ == "__main__":
    main()
