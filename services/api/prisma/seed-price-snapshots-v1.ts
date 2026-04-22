/**
 * seed-price-snapshots-v1.ts
 *
 * 为所有 priceFrom > 0 的 Route 生成 PriceSnapshot 基线 (past 60d + future 30d)。
 * 确定性算法: 季节波形 + 周末上浮 + hash(routeId+date) 噪声,重跑结果一致。
 *
 * 对应: docs/prd/M24-v2-PRD-价格工具数据对齐重构.md §4.3
 * 规则 PRC-02: SimulatedBaseline 产物在 currency 维度标记 CNY,不混入真实采集数据。
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function hashNoise(routeId: string, dateStr: string): number {
  const s = `${routeId}|${dateStr}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return ((h >>> 0) % 10000) / 10000 - 0.5;
}

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

function computeBaselinePriceFen(baseFromYuanFen: number, routeId: string, date: Date): number {
  const seasonal = 1 + 0.1 * Math.sin((2 * Math.PI * dayOfYear(date)) / 365);
  const weekday = date.getUTCDay();
  const weekend = weekday === 5 || weekday === 6 ? 1.05 : 1.0;
  const noise = 1 + 0.05 * (hashNoise(routeId, date.toISOString().slice(0, 10)) * 2);
  return Math.max(100, Math.round(baseFromYuanFen * seasonal * weekend * noise));
}

async function main() {
  const routes = await prisma.route.findMany({
    where: { priceFrom: { gt: 0 } },
    select: { id: true, priceFrom: true, title: true },
  });

  if (routes.length === 0) {
    console.log('[seed-price-snapshots] no routes with priceFrom > 0, skip');
    return;
  }

  console.log(`[seed-price-snapshots] processing ${routes.length} routes × 91 days`);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let total = 0;
  let skipped = 0;

  for (const route of routes) {
    const baseFen = route.priceFrom * 100;
    for (let d = -60; d <= 30; d++) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() + d);
      const price = computeBaselinePriceFen(baseFen, route.id, date);

      try {
        await prisma.priceSnapshot.upsert({
          where: {
            entityType_entityId_date: {
              entityType: 'ROUTE',
              entityId: route.id,
              date,
            },
          },
          create: {
            entityType: 'ROUTE',
            entityId: route.id,
            date,
            price,
            currency: 'CNY',
          },
          update: {
            price,
            currency: 'CNY',
          },
        });
        total++;
      } catch (err) {
        skipped++;
        if (skipped <= 3) {
          console.warn(`  ! ${route.id} ${date.toISOString().slice(0, 10)}:`, (err as Error).message);
        }
      }
    }
  }

  console.log(`[seed-price-snapshots] wrote ${total} snapshots, skipped ${skipped}`);

  const count = await prisma.priceSnapshot.count({ where: { entityType: 'ROUTE' } });
  console.log(`[seed-price-snapshots] total ROUTE snapshots in DB: ${count}`);
}

main()
  .catch((e) => {
    console.error('[seed-price-snapshots] fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
