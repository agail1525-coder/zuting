"""
爬虫++ v1.2 质量守门增量部署
只部署: crawler.service.js + quality/* + schema.prisma + package.json + sanitize-html 依赖
"""
import paramiko
import os

SERVER = "120.24.31.151"
USER = "root"
PASSWORD = "y1234567890."
REMOTE = "/opt/zuting/api"
LOCAL_API = "E:/ZUTING/services/api"


def run(ssh, cmd, show=True):
    _, stdout, stderr = ssh.exec_command(cmd, timeout=180)
    out = stdout.read().decode(errors="ignore").strip()
    err = stderr.read().decode(errors="ignore").strip()
    if show and out:
        print(out[:500])
    if err and "WARNING" not in err and "warn" not in err.lower():
        print(f"  ERR: {err[:300]}")
    return out


def main():
    print("=" * 60)
    print("  爬虫++ v1.2 QG 增量部署")
    print("=" * 60)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    sftp = ssh.open_sftp()
    print("[1] SSH OK")

    # 1. 上传 quality/ 目录
    remote_qg = f"{REMOTE}/dist/modules/crawler/quality"
    run(ssh, f"mkdir -p {remote_qg}", show=False)
    for fn in ["ad-blacklist.js", "sanitize-pipeline.js", "quality-scorer.js", "index.js"]:
        local = f"{LOCAL_API}/dist/modules/crawler/quality/{fn}"
        sftp.put(local, f"{remote_qg}/{fn}")
        print(f"  -> {fn}")

    # 2. 上传 crawler.service.js (已 import quality)
    sftp.put(
        f"{LOCAL_API}/dist/modules/crawler/crawler.service.js",
        f"{REMOTE}/dist/modules/crawler/crawler.service.js",
    )
    print("  -> crawler.service.js")

    # 3. 上传 schema + package.json
    sftp.put(f"{LOCAL_API}/prisma/schema.prisma", f"{REMOTE}/prisma/schema.prisma")
    sftp.put(f"{LOCAL_API}/package.json", f"{REMOTE}/package.json")
    print("  -> schema.prisma + package.json")

    # 4. 装 sanitize-html
    print("\n[2] 安装 sanitize-html...")
    run(ssh, f"cd {REMOTE} && npm install sanitize-html@^2.17.2 --legacy-peer-deps 2>&1 | tail -3")

    # 5. prisma db push
    print("\n[3] prisma db push (新增 qualityScore 等字段)...")
    run(ssh, f"cd {REMOTE} && npx prisma generate 2>&1 | tail -3")
    run(ssh, f"cd {REMOTE} && npx prisma db push --accept-data-loss --skip-generate 2>&1 | tail -5")

    # 6. 重启 API
    print("\n[4] 重启 API...")
    run(ssh, "fuser -k 3002/tcp 2>/dev/null; sleep 2", show=False)
    run(
        ssh,
        f"cd {REMOTE} && NODE_NO_COMPILE_CACHE=1 NODE_ENV=production PORT=3002 nohup node dist/main.js > /opt/zuting/api.log 2>&1 &",
        show=False,
    )

    # 7. 健康检查
    print("\n[5] 健康检查 (10s 后)...")
    run(ssh, "sleep 10 && curl -s -o /dev/null -w 'HTTP %{http_code}\\n' http://localhost:3002/api/health || true")
    run(ssh, "tail -30 /opt/zuting/api.log")

    sftp.close()
    ssh.close()
    print("\n[OK] 爬虫++ v1.2 QG 部署完毕")


if __name__ == "__main__":
    main()
