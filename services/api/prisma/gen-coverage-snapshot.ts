/**
 * 手动生成一次 CoverageSnapshot。
 * 用法: cd services/api && npx tsx prisma/gen-coverage-snapshot.ts
 */
import { PrismaClient } from '@prisma/client';

const DOMAINS = ['HOLY_SITE', 'MERCHANT', 'PRICE', 'GUIDE', 'NEWS'];
const CHANNELS = ['OFFICIAL', 'WIKI', 'OTA', 'MAP', 'UGC', 'MEDIA'];

function pickStatus(total: number, active: number, avgHealth: number): string {
  if (total === 0) return 'EMPTY';
  if (active === 0) return 'DISABLED';
  if (avgHealth >= 0.7) return 'HEALTHY';
  if (avgHealth >= 0.4) return 'WARNING';
  return 'CRITICAL';
}

async function main() {
  const prisma = new PrismaClient();
  const since = new Date(Date.now() - 24 * 3600 * 1000);
  const rows: Array<Record<string, unknown>> = [];
  for (const d of DOMAINS) {
    for (const c of CHANNELS) {
      const sources = await prisma.crawlerSource.findMany({
        where: { targetDomain: d, channel: c },
        select: { id: true, enabled: true, healthScore: true },
      });
      const active = sources.filter((s) => s.enabled).length;
      const avgHealth = sources.length === 0 ? 0 : sources.reduce((a, s) => a + s.healthScore, 0) / sources.length;
      const itemsLast24h =
        sources.length === 0
          ? 0
          : await prisma.crawlerItem.count({ where: { sourceId: { in: sources.map((s) => s.id) }, fetchedAt: { gte: since } } });
      rows.push({
        domain: d,
        channel: c,
        sourceCount: sources.length,
        activeCount: active,
        itemsLast24h,
        avgHealth,
        status: pickStatus(sources.length, active, avgHealth),
      });
    }
  }
  await prisma.crawlerCoverageSnapshot.createMany({ data: rows as never });
  console.log(`✓ coverage snapshot created: ${rows.length} grids`);
  const active = rows.filter((r) => r.activeCount && (r.activeCount as number) > 0);
  console.log(`  active grids: ${active.length}`);
  for (const r of active) console.log(`   • ${r.domain}/${r.channel} — ${r.activeCount} active, ${r.status}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
