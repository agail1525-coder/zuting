import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * PriceReconcileService · 价格数据对齐 + 快照滚动
 *
 * 对应 PRD: M24-v2 §4.4
 * - reconcileRoutes: 每日 04:10, Route.priceFrom ↔ DestinationPackage.priceMin 偏差 >15% 写入 PackagePriceAlert
 * - extendSnapshots: 每日 04:20, 为所有 Route 补 +1 天 PriceSnapshot,删 >180 天老数据
 */
@Injectable()
export class PriceReconcileService {
  private readonly logger = new Logger(PriceReconcileService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 10 4 * * *', { name: 'price-reconcile-routes' })
  async reconcileRoutes(): Promise<void> {
    const startedAt = Date.now();
    const routes = await this.prisma.route.findMany({
      where: { priceFrom: { gt: 0 } },
      select: { id: true, priceFrom: true, title: true },
    });

    let aligned = 0;
    let flagged = 0;

    for (const route of routes) {
      try {
        const packages = await this.prisma.destinationPackage.findMany({
          where: { routeId: route.id, tier: { not: 'LUXURY' } },
          select: { id: true, priceMin: true },
          take: 50,
        });

        if (packages.length === 0) {
          aligned++;
          continue;
        }

        const minPackageFen = packages
          .map((p) => p.priceMin)
          .filter((v): v is number => typeof v === 'number' && v > 0)
          .reduce<number | null>((acc, v) => (acc === null || v < acc ? v : acc), null);

        if (minPackageFen === null) {
          aligned++;
          continue;
        }

        const routeFen = route.priceFrom * 100;
        const diff = Math.abs(minPackageFen - routeFen) / Math.max(routeFen, 1);

        if (diff > 0.15) {
          flagged++;
          const firstPkgId = packages[0].id;
          await this.prisma.packagePriceAlert.create({
            data: {
              packageId: firstPkgId,
              oldPriceMin: routeFen,
              newPriceMin: minPackageFen,
              changeRatio: (minPackageFen - routeFen) / routeFen,
              note: `reconcile: Route.priceFrom vs min(DestinationPackage) diff=${(diff * 100).toFixed(1)}%`,
            },
          });
        }
        aligned++;
      } catch (err) {
        this.logger.error(
          `route ${route.id} reconcile failed: ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(
      `reconcile: routes=${routes.length} aligned=${aligned} flagged=${flagged} elapsed=${Date.now() - startedAt}ms`,
    );
  }

  @Cron('0 20 4 * * *', { name: 'price-snapshot-extend' })
  async extendSnapshots(): Promise<void> {
    const startedAt = Date.now();
    const routes = await this.prisma.route.findMany({
      where: { priceFrom: { gt: 0 } },
      select: { id: true, priceFrom: true },
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const targetDate = new Date(today);
    targetDate.setUTCDate(targetDate.getUTCDate() + 30);

    let extended = 0;
    for (const route of routes) {
      try {
        const baseFen = route.priceFrom * 100;
        const price = this.deterministicPrice(baseFen, route.id, targetDate);

        await this.prisma.priceSnapshot.upsert({
          where: {
            entityType_entityId_date: {
              entityType: 'ROUTE',
              entityId: route.id,
              date: targetDate,
            },
          },
          create: {
            entityType: 'ROUTE',
            entityId: route.id,
            date: targetDate,
            price,
            currency: 'CNY',
          },
          update: { price, currency: 'CNY' },
        });
        extended++;
      } catch (err) {
        this.logger.warn(`extend ${route.id} failed: ${(err as Error).message}`);
      }
    }

    const cutoff = new Date(today);
    cutoff.setUTCDate(cutoff.getUTCDate() - 180);
    const deleted = await this.prisma.priceSnapshot.deleteMany({
      where: { date: { lt: cutoff } },
    });

    this.logger.log(
      `extend: routes=${routes.length} wrote=${extended} deleted_old=${deleted.count} elapsed=${Date.now() - startedAt}ms`,
    );
  }

  private deterministicPrice(baseFen: number, routeId: string, date: Date): number {
    const s = `${routeId}|${date.toISOString().slice(0, 10)}`;
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    const noise = ((h >>> 0) % 10000) / 10000 - 0.5;
    const start = new Date(date.getFullYear(), 0, 0);
    const doy = Math.floor((date.getTime() - start.getTime()) / 86400000);
    const seasonal = 1 + 0.1 * Math.sin((2 * Math.PI * doy) / 365);
    const weekday = date.getUTCDay();
    const weekend = weekday === 5 || weekday === 6 ? 1.05 : 1.0;
    return Math.max(100, Math.round(baseFen * seasonal * weekend * (1 + 0.05 * noise * 2)));
  }
}
