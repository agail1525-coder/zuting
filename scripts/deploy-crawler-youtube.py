"""
增量部署 爬虫++ YouTube RSS 适配器到小轻 120.24.31.151
文件清单:
  - dist/modules/crawler/adapters/{http-util.js, index.js, youtube-rss-adapter.js}
  - scripts/crawler/sources.json
  - scripts/crawler/feeds/youtube/channel-ids.txt
  - upsert DB 源记录 (via node -e)
  - restart API (NODE_NO_COMPILE_CACHE=1)
"""
import paramiko
import posixpath
import sys

SERVER = "120.24.31.151"
USER = "root"
PASSWORD = "y1234567890."
REMOTE_BASE = "/opt/zuting"


def put(sftp, local, remote):
    print(f"  [upload] {local} → {remote}", flush=True)
    sftp.put(local, remote)


def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(SERVER, username=USER, password=PASSWORD, timeout=15)
    sftp = client.open_sftp()

    adapters_remote = posixpath.join(REMOTE_BASE, "api/dist/modules/crawler/adapters")
    for name in ["http-util.js", "index.js", "youtube-rss-adapter.js"]:
        put(sftp, f"E:/ZUTING/services/api/dist/modules/crawler/adapters/{name}",
            posixpath.join(adapters_remote, name))

    put(sftp, "E:/ZUTING/scripts/crawler/sources.json",
        posixpath.join(REMOTE_BASE, "scripts/crawler/sources.json"))

    feeds_remote = posixpath.join(REMOTE_BASE, "scripts/crawler/feeds/youtube")
    try:
        sftp.stat(feeds_remote)
    except FileNotFoundError:
        print(f"  [mkdir] {feeds_remote}", flush=True)
        sftp.mkdir(feeds_remote)
    put(sftp, "E:/ZUTING/scripts/crawler/feeds/youtube/channel-ids.txt",
        posixpath.join(feeds_remote, "channel-ids.txt"))

    sftp.close()

    print("\n[seed] upserting youtube-rss-feed source via Prisma...", flush=True)
    seed_cmd = (
        "cd /opt/zuting/api && "
        "node -e \""
        "const {PrismaClient}=require('@prisma/client');"
        "const p=new PrismaClient();"
        "(async()=>{"
        "const r=await p.crawlerSource.upsert({"
        "where:{key:'youtube-rss-feed'},"
        "update:{enabled:true,baseUrl:'https://www.youtube.com/feeds/videos.xml',"
        "rateLimitMs:2000,schedule:'0 14 * * *',priority:3,notes:'YouTube RSS — CW-YT'},"
        "create:{key:'youtube-rss-feed',name:'YouTube RSS — 文化/旅行频道',"
        "baseUrl:'https://www.youtube.com/feeds/videos.xml',type:'GUIDE',"
        "targetDomain:'GUIDE',channel:'MEDIA',priority:3,schedule:'0 14 * * *',"
        "parser:'youtube-rss',strategy:'API',rateLimitMs:2000,enabled:true,"
        "notes:'CW-YT YouTube RSS, OUTBOUND_PROXY 绕 GFW, channel-ids.txt 投喂'}});"
        "console.log('upserted:',r.key,r.id);"
        "await p.\\$disconnect();"
        "})();\""
    )
    stdin, stdout, stderr = client.exec_command(seed_cmd, timeout=30)
    print(stdout.read().decode(), flush=True)
    err = stderr.read().decode()
    if err:
        print("STDERR:", err, flush=True)

    print("\n[restart] killing 3002 and restarting API...", flush=True)
    restart_cmd = (
        "fuser -k 3002/tcp 2>/dev/null; sleep 2; "
        "cd /opt/zuting/api && "
        "setsid nohup env NODE_NO_COMPILE_CACHE=1 OUTBOUND_PROXY=http://127.0.0.1:7890 "
        "node dist/main.js > /var/log/zuting-api.log 2>&1 < /dev/null &"
    )
    stdin, stdout, stderr = client.exec_command(restart_cmd, timeout=15)
    stdout.read()

    print("\n[health] waiting 8s then checking...", flush=True)
    stdin, stdout, stderr = client.exec_command("sleep 8 && curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3002/api/health")
    print("  /api/health →", stdout.read().decode(), flush=True)

    client.close()
    print("\n[DONE] youtube-rss deployed. Trigger matrix run via admin or curl POST /api/crawlers/matrix/run", flush=True)


if __name__ == "__main__":
    main()
