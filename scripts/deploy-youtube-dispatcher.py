"""
部署增强版 dispatcher (YouTube 智能匹配) + 回填已有 PENDING 旧 YouTube items
清单:
  - dist/modules/crawler/dispatcher.service.js
  - 上传 backfill-youtube.cjs 并执行
  - restart API
"""
import paramiko
import posixpath

SERVER = "120.24.31.151"
USER = "root"
PASSWORD = "y1234567890."
REMOTE_BASE = "/opt/zuting"


BACKFILL_JS = r"""
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const CH2SLUG = {
  'UCYGbhLeLCvI4pwm2sknjKDw': 'buddhism',
  'UCQVlk-MxEj4O38usgxBm14w': 'buddhism',
  'UC7E-LYc1wivk33iyt5bR5zQ': 'christianity',
  'UCVfwlh9XpX2Y_tQfjeln9QA': 'christianity',
  'UCNB_OaI4524fASt8h0IL8dw': 'islam',
  'UC3vHW2h22WE-pNi5WJtRIjg': 'islam',
  'UCcYzLCs3zrQIBVHYA1sK2sw': 'hinduism',
  'UCiPJ_g02LuOgOG0ZNk5j1jA': 'tibetan-buddhism',
  'UCv-oUk8x6SGHMOLrCMDNrsw': 'tibetan-buddhism',
};

(async () => {
  const src = await p.crawlerSource.findUnique({ where: { key: 'youtube-rss-feed' } });
  if (!src) { console.log('no source'); return; }

  const items = await p.crawlerItem.findMany({
    where: { sourceId: src.id, status: 'PENDING' },
    select: { id: true, title: true, sanitizedTitle: true, description: true, sanitizedContent: true, raw: true },
  });
  console.log('items PENDING:', items.length);

  const sites = await p.holySite.findMany({ select: { id: true, name: true, nameEn: true } });
  const religions = await p.religion.findMany({ select: { id: true, slug: true } });
  const relBySlug = Object.fromEntries(religions.map(r => [r.slug, r.id]));

  let hitSite = 0, hitRel = 0, miss = 0;
  for (const it of items) {
    const title = ((it.sanitizedTitle || it.title || '') + '').toLowerCase();
    const desc = ((it.sanitizedContent || it.description || '') + '').toLowerCase();
    const hay = title + ' ' + desc;

    let best = null;
    for (const s of sites) {
      for (const cand of [s.name, s.nameEn].filter(Boolean)) {
        const c = cand.toLowerCase();
        if (c.length < 3) continue;
        if (hay.includes(c) && (!best || c.length > best.len)) {
          best = { id: s.id, len: c.length, name: cand };
        }
      }
    }

    let match = null;
    if (best) match = { targetType: 'holySite', targetId: best.id };
    else {
      const ch = it.raw && it.raw.channelId;
      const slug = ch ? CH2SLUG[ch] : null;
      const relId = slug ? relBySlug[slug] : null;
      if (relId) match = { targetType: 'religion', targetId: relId };
    }

    if (match) {
      await p.crawlerItem.update({
        where: { id: it.id },
        data: { status: 'DISPATCHED', targetType: match.targetType, targetId: match.targetId, dispatchedAt: new Date() },
      });
      if (match.targetType === 'holySite') hitSite++;
      else hitRel++;
    } else {
      miss++;
    }
  }
  console.log(`done. siteHit=${hitSite} religionHit=${hitRel} miss=${miss}`);
  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
"""


def put(sftp, local, remote):
    print(f"  [upload] {local} → {remote}", flush=True)
    sftp.put(local, remote)


def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(SERVER, username=USER, password=PASSWORD, timeout=15)
    sftp = client.open_sftp()

    put(sftp,
        "E:/ZUTING/services/api/dist/modules/crawler/dispatcher.service.js",
        posixpath.join(REMOTE_BASE, "api/dist/modules/crawler/dispatcher.service.js"))

    tmp_js = "/tmp/backfill-youtube.cjs"
    with sftp.open(tmp_js, "w") as f:
        f.write(BACKFILL_JS)
    sftp.close()

    print("\n[restart] killing 3002 + restart API...", flush=True)
    restart_cmd = (
        "fuser -k 3002/tcp 2>/dev/null; sleep 2; "
        "(cd /opt/zuting/api && setsid nohup env NODE_NO_COMPILE_CACHE=1 OUTBOUND_PROXY=http://127.0.0.1:7890 "
        "node dist/main.js > /var/log/zuting-api.log 2>&1 < /dev/null &) ; echo KICKED"
    )
    stdin, stdout, stderr = client.exec_command(restart_cmd, timeout=15)
    print(stdout.read().decode(), flush=True)

    print("\n[health] waiting 8s...", flush=True)
    stdin, stdout, stderr = client.exec_command("sleep 8 && curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3002/api/health")
    print("  /api/health →", stdout.read().decode(), flush=True)

    print("\n[backfill] running YouTube matcher on PENDING items...", flush=True)
    cmd = f"cd /opt/zuting/api && node {tmp_js}"
    stdin, stdout, stderr = client.exec_command(cmd, timeout=120)
    print(stdout.read().decode(), flush=True)
    err = stderr.read().decode()
    if err:
        print("STDERR:", err, flush=True)

    print("\n[stats] post-backfill status count...", flush=True)
    stats_cmd = (
        "cd /opt/zuting/api && node -e \""
        "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();"
        "(async()=>{"
        "const src=await p.crawlerSource.findUnique({where:{key:'youtube-rss-feed'}});"
        "const g=await p.crawlerItem.groupBy({by:['status','targetType'],where:{sourceId:src.id},_count:{id:true}});"
        "console.log(JSON.stringify(g,null,2));"
        "await p.\\$disconnect();"
        "})();\""
    )
    stdin, stdout, stderr = client.exec_command(stats_cmd, timeout=30)
    print(stdout.read().decode(), flush=True)

    client.close()
    print("\n[DONE]", flush=True)


if __name__ == "__main__":
    main()
