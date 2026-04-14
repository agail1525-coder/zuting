"""Upload rebuilt crawler.service.js + dispatcher.service.js, restart, trigger run, backfill."""
import paramiko, posixpath, time

SERVER = "120.24.31.151"; USER = "root"; PASSWORD = "y1234567890."
REMOTE = "/opt/zuting/api/dist/modules/crawler"

c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(SERVER, username=USER, password=PASSWORD, timeout=15)
sf = c.open_sftp()
for name in ["crawler.service.js", "dispatcher.service.js"]:
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
try:
    ch.recv_exit_status()
except Exception:
    pass
ch.close()
print("  kicked")

time.sleep(12)
_, o, _ = c.exec_command("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3002/api/health", timeout=15)
print("[health]", o.read().decode())

print("\n[trigger crawler run]")
trig = (
    "cd /opt/zuting/api && node -e \""
    "const fetch=require('node-fetch').default||require('node-fetch');"
    "fetch('http://127.0.0.1:3002/api/crawlers/matrix/run',{method:'POST',headers:{'x-admin-token':process.env.ADMIN_TOKEN||''}})"
    ".then(r=>r.text()).then(t=>console.log(t.slice(0,500))).catch(e=>console.error(e.message));\""
)
# Simpler: just run the sourceId directly via prisma-driven manual call
# Use CrawlerService.runSource via a tiny script
tiny = """
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
(async () => {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error','warn','log'] });
  const { CrawlerService } = require('./dist/modules/crawler/crawler.service');
  const svc = app.get(CrawlerService);
  const { PrismaService } = require('./dist/prisma/prisma.service');
  const prisma = app.get(PrismaService);
  const src = await prisma.crawlerSource.findUnique({ where: { key: 'youtube-rss-feed' } });
  console.log('running source', src.id);
  const r = await svc.runSource(src.id, 'manual');
  console.log('run result:', JSON.stringify(r));
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
"""
sf = c.open_sftp()
with sf.open("/opt/zuting/api/trigger-yt-run.cjs", "w") as f:
    f.write(tiny)
sf.close()
_, o, e = c.exec_command("cd /opt/zuting/api && node trigger-yt-run.cjs", timeout=180)
print(o.read().decode())
err = e.read().decode()
if err: print("STDERR:", err[-1500:])

print("\n[backfill dispatch]")
_, o, e = c.exec_command("cd /opt/zuting/api && node backfill-youtube.cjs", timeout=120)
print(o.read().decode())
err = e.read().decode()
if err: print("STDERR:", err[-800:])

print("\n[stats]")
stats_js = """
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const src = await p.crawlerSource.findUnique({ where: { key: 'youtube-rss-feed' } });
  const g = await p.crawlerItem.groupBy({ by: ['status','targetType'], where: { sourceId: src.id }, _count: { id: true } });
  console.log('status counts:', JSON.stringify(g));
  const sites = await p.crawlerItem.findMany({ where: { sourceId: src.id, targetType: 'holySite' }, take: 10, select: { title: true, targetId: true } });
  console.log('site samples:', JSON.stringify(sites, null, 2));
  const rels = await p.crawlerItem.groupBy({ by: ['targetId'], where: { sourceId: src.id, targetType: 'religion' }, _count: { id: true } });
  console.log('religion counts:', JSON.stringify(rels));
  await p.$disconnect();
})();
"""
sf = c.open_sftp()
with sf.open("/opt/zuting/api/stats-yt.cjs", "w") as f:
    f.write(stats_js)
sf.close()
_, o, e = c.exec_command("cd /opt/zuting/api && node stats-yt.cjs", timeout=30)
print(o.read().decode())
err = e.read().decode()
if err: print("STDERR:", err[-500:])

c.close()
