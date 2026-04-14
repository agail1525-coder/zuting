import paramiko, textwrap

JS = textwrap.dedent("""
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const src = await p.crawlerSource.findUnique({ where: { key: 'youtube-rss-feed' } });
  const items = await p.crawlerItem.findMany({
    where: { sourceId: src.id },
    take: 8,
    select: { title: true, raw: true, sanitizedTitle: true },
  });
  for (const it of items) {
    console.log('---');
    console.log('title:', it.title);
    console.log('sanitized:', it.sanitizedTitle);
    console.log('raw.channelId:', it.raw && it.raw.channelId);
    console.log('raw.channelTitle:', it.raw && it.raw.channelTitle);
  }
  await p.$disconnect();
})();
""")

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("120.24.31.151", username="root", password="y1234567890.", timeout=15)
sf = c.open_sftp()
with sf.open("/opt/zuting/api/inspect-yt.cjs", "w") as f:
    f.write(JS)
sf.close()
_, o, e = c.exec_command("cd /opt/zuting/api && node inspect-yt.cjs", timeout=30)
print(o.read().decode())
err = e.read().decode()
if err: print("STDERR:", err)
c.close()
