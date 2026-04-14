"""Run backfill (assumes dispatcher.js already deployed + API running)."""
import paramiko
import time

SERVER = "120.24.31.151"
USER = "root"
PASSWORD = "y1234567890."

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# wait a bit for API restart
time.sleep(8)

print("[health]", flush=True)
_, o, _ = client.exec_command("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3002/api/health", timeout=15)
print("  ", o.read().decode(), flush=True)

print("\n[backfill]", flush=True)
_, o, e = client.exec_command("cd /opt/zuting/api && node /tmp/backfill-youtube.cjs", timeout=120)
print(o.read().decode(), flush=True)
err = e.read().decode()
if err: print("STDERR:", err, flush=True)

print("\n[stats]", flush=True)
stats = (
    "cd /opt/zuting/api && node -e \""
    "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();"
    "(async()=>{"
    "const src=await p.crawlerSource.findUnique({where:{key:'youtube-rss-feed'}});"
    "const g=await p.crawlerItem.groupBy({by:['status','targetType'],where:{sourceId:src.id},_count:{id:true}});"
    "console.log(JSON.stringify(g));"
    "const samp=await p.crawlerItem.findMany({where:{sourceId:src.id,status:'DISPATCHED'},take:5,select:{title:true,targetType:true,targetId:true}});"
    "console.log(JSON.stringify(samp,null,2));"
    "await p.\\$disconnect();"
    "})();\""
)
_, o, e = client.exec_command(stats, timeout=30)
print(o.read().decode(), flush=True)
err = e.read().decode()
if err: print("STDERR:", err, flush=True)

client.close()
