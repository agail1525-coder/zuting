"""Deploy updated crawler.controller.js + crawler.service.js + restart + test endpoint."""
import paramiko, posixpath, time, json

SERVER = "120.24.31.151"; USER = "root"; PASSWORD = "y1234567890."
REMOTE = "/opt/zuting/api/dist/modules/crawler"

c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(SERVER, username=USER, password=PASSWORD, timeout=15)
sf = c.open_sftp()
for name in ["crawler.controller.js", "crawler.service.js"]:
    src = f"E:/ZUTING/services/api/dist/modules/crawler/{name}"
    print(f"[upload] {name}")
    sf.put(src, posixpath.join(REMOTE, name))
sf.close()

print("\n[restart]")
kick = (
    "fuser -k 3002/tcp 2>/dev/null; sleep 2; "
    "(cd /opt/zuting/api && setsid nohup env NODE_NO_COMPILE_CACHE=1 OUTBOUND_PROXY=http://127.0.0.1:7890 "
    "node dist/main.js > /var/log/zuting-api.log 2>&1 < /dev/null &) ; disown; exit 0"
)
ch = c.get_transport().open_session()
ch.exec_command(kick)
try: ch.recv_exit_status()
except: pass
ch.close()
time.sleep(10)

_, o, _ = c.exec_command("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3002/api/health", timeout=15)
print("[health]", o.read().decode())

print("\n[test endpoint] religion (buddhism)")
# cmn5w9up30000pxa3bu675uqf was seen in previous stats - let's find a real id
_, o, e = c.exec_command("cd /opt/zuting/api && node -e \"const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{const r=await p.religion.findUnique({where:{slug:'buddhism'},select:{id:true,name:true}});console.log(JSON.stringify(r));await p.\\$disconnect();})();\"", timeout=15)
rel = json.loads(o.read().decode().strip())
print("  religion:", rel)

_, o, _ = c.exec_command(f"curl -s 'http://127.0.0.1:3002/api/crawlers/videos?targetType=religion&targetId={rel['id']}&limit=5'", timeout=15)
print("  videos response:")
print(o.read().decode()[:2000])

print("\n[test endpoint] holySite (first dispatched)")
_, o, _ = c.exec_command("cd /opt/zuting/api && node -e \"const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{const it=await p.crawlerItem.findFirst({where:{targetType:'holySite',status:'DISPATCHED'},select:{targetId:true,title:true}});console.log(JSON.stringify(it));await p.\\$disconnect();})();\"", timeout=15)
site = json.loads(o.read().decode().strip())
print("  site target:", site)
_, o, _ = c.exec_command(f"curl -s 'http://127.0.0.1:3002/api/crawlers/videos?targetType=holySite&targetId={site['targetId']}&limit=5'", timeout=15)
print("  videos response:")
print(o.read().decode()[:1500])

c.close()
print("\n[DONE]")
