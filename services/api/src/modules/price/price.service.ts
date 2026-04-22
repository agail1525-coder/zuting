import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { CompareQueryDto } from './dto/compare-query.dto';
import { TrendQueryDto } from './dto/trend-query.dto';
import { CreateAlertDto } from './dto/create-alert.dto';

@Injectable()
export class PriceService {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────── 价格日历 ────────────────

  async getCalendar(dto: CalendarQueryDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('startDate 或 endDate 格式无效，请使用 YYYY-MM-DD');
    }

    const snapshots = await this.prisma.priceSnapshot.findMany({
      where: {
        entityType: dto.entityType,
        entityId: dto.entityId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
      take: 100,
    });

    const calendarMap: Record<string, { price: number; currency: string } | null> = {};
    let minPrice: number | null = null;
    let maxPrice: number | null = null;
    let priceSum = 0;
    let priceCount = 0;

    for (const snap of snapshots) {
      const dateKey = snap.date.toISOString().split('T')[0];
      calendarMap[dateKey] = { price: snap.price, currency: snap.currency };

      if (minPrice === null || snap.price < minPrice) minPrice = snap.price;
      if (maxPrice === null || snap.price > maxPrice) maxPrice = snap.price;
      priceSum += snap.price;
      priceCount++;
    }

    const avgPrice = priceCount > 0 ? Math.round(priceSum / priceCount) : null;

    return {
      entityType: dto.entityType,
      entityId: dto.entityId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      calendar: calendarMap,
      minPrice,
      maxPrice,
      avgPrice,
      currency: 'CNY',
    };
  }

  // ──────────────── 比价面板 ────────────────

  async compare(dto: CompareQueryDto) {
    const rawIds = dto.entityIds.split(',').map((id) => id.trim()).filter(Boolean);
    if (rawIds.length < 1 || rawIds.length > 4) {
      throw new BadRequestException('entityIds 需要1到4个ID（逗号分隔）');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const results = await Promise.all(
      rawIds.map(async (entityId) => {
        // Latest price: most recent snapshot
        const latest = await this.prisma.priceSnapshot.findFirst({
          where: { entityType: dto.entityType, entityId },
          orderBy: { date: 'desc' },
        });

        // 30-day aggregates
        const snapshots30d = await this.prisma.priceSnapshot.findMany({
          where: {
            entityType: dto.entityType,
            entityId,
            date: { gte: thirtyDaysAgo },
          },
          orderBy: { date: 'asc' },
          take: 100,
        });

        let minPrice30d: number | null = null;
        let maxPrice30d: number | null = null;
        let sum30d = 0;

        for (const snap of snapshots30d) {
          if (minPrice30d === null || snap.price < minPrice30d) minPrice30d = snap.price;
          if (maxPrice30d === null || snap.price > maxPrice30d) maxPrice30d = snap.price;
          sum30d += snap.price;
        }

        const avgPrice30d =
          snapshots30d.length > 0 ? Math.round(sum30d / snapshots30d.length) : null;

        return {
          entityId,
          latestPrice: latest?.price ?? null,
          latestDate: latest?.date?.toISOString().split('T')[0] ?? null,
          currency: latest?.currency ?? 'CNY',
          minPrice30d,
          maxPrice30d,
          avgPrice30d,
          priceCount: snapshots30d.length,
        };
      }),
    );

    return {
      entityType: dto.entityType,
      items: results,
    };
  }

  // ──────────────── 价格趋势 ────────────────

  async getTrend(dto: TrendQueryDto) {
    const days = dto.days ?? 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const snapshots = await this.prisma.priceSnapshot.findMany({
      where: {
        entityType: dto.entityType,
        entityId: dto.entityId,
        date: { gte: since },
      },
      orderBy: { date: 'asc' },
      take: 100,
    });

    const trend = snapshots.map((snap) => ({
      date: snap.date.toISOString().split('T')[0],
      price: snap.price,
    }));

    let minPrice: number | null = null;
    let maxPrice: number | null = null;
    let sum = 0;

    for (const snap of snapshots) {
      if (minPrice === null || snap.price < minPrice) minPrice = snap.price;
      if (maxPrice === null || snap.price > maxPrice) maxPrice = snap.price;
      sum += snap.price;
    }

    const avgPrice =
      snapshots.length > 0 ? Math.round(sum / snapshots.length) : null;

    const currentPrice =
      snapshots.length > 0 ? snapshots[snapshots.length - 1].price : null;

    const vsAvg =
      currentPrice !== null && avgPrice !== null && avgPrice > 0
        ? Math.round(((currentPrice - avgPrice) / avgPrice) * 10000) / 100
        : null;

    return {
      entityType: dto.entityType,
      entityId: dto.entityId,
      days,
      trend,
      stats: {
        minPrice,
        maxPrice,
        avgPrice,
        currentPrice,
        vsAvg,
      },
    };
  }

  // ──────────────── 价格提醒 ────────────────

  async createAlert(userId: string, dto: CreateAlertDto) {
    return this.prisma.priceAlert.create({
      data: {
        userId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        entityName: dto.entityName,
        targetPrice: dto.targetPrice,
        currentPrice: dto.currentPrice,
      },
    });
  }

  async getMyAlerts(userId: string) {
    return this.prisma.priceAlert.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async deleteAlert(id: string, userId: string) {
    const alert = await this.prisma.priceAlert.findUnique({ where: { id } });
    if (!alert) {
      throw new NotFoundException(`价格提醒 ${id} 不存在`);
    }
    if (alert.userId !== userId) {
      throw new ForbiddenException('无权操作他人的价格提醒');
    }

    await this.prisma.priceAlert.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: '提醒已删除' };
  }

  // ──────────────── 价格工具页 v3 · 控制台/洞察 ────────────────

  /** 系统状态 — 给 PricePulseBar:覆盖量/数据源混合/CRON时刻表 */
  async getSystemStatus() {
    const [baselineCount, distinctRouteIds, distinctDates] = await Promise.all([
      this.prisma.priceSnapshot.count({ where: { entityType: 'ROUTE' } }),
      this.prisma.priceSnapshot.findMany({
        where: { entityType: 'ROUTE' },
        distinct: ['entityId'],
        select: { entityId: true },
        take: 5000,
      }),
      this.prisma.priceSnapshot.findMany({
        where: { entityType: 'ROUTE' },
        distinct: ['date'],
        select: { date: true },
        take: 5000,
      }),
    ]);

    return {
      baselineCount,
      routeCount: distinctRouteIds.length,
      dayCount: distinctDates.length,
      sourceBreakdown: {
        baseline: baselineCount,
        crawler: 0,
        official: 0,
      },
      lastCronRun: {},
      cronSchedules: [
        { name: 'price-alert-scan', cron: '0 0 * * * *', label: '每小时扫告警' },
        { name: 'price-reconcile-routes', cron: '0 10 4 * * *', label: '日 04:10 校准' },
        { name: 'price-snapshot-extend', cron: '0 20 4 * * *', label: '日 04:20 延展' },
      ],
      asOf: new Date().toISOString(),
    };
  }

  /** 今日最低 Top N — 最新 snapshot 按价升序,带 24h 涨跌 */
  async getTodayLow(limit = 5) {
    const cap = Math.min(Math.max(limit, 1), 20);

    const latest = await this.prisma.priceSnapshot.findFirst({
      where: { entityType: 'ROUTE' },
      orderBy: { date: 'desc' },
      select: { date: true },
    });
    if (!latest) return { items: [], asOf: new Date().toISOString() };

    const todayDate = latest.date;
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    const todaySnaps = await this.prisma.priceSnapshot.findMany({
      where: { entityType: 'ROUTE', date: todayDate },
      orderBy: { price: 'asc' },
      take: cap,
    });
    if (todaySnaps.length === 0) return { items: [], asOf: new Date().toISOString() };

    const routeIds = todaySnaps.map((s) => s.entityId);
    const [routes, yesterdaySnaps] = await Promise.all([
      this.prisma.route.findMany({
        where: { id: { in: routeIds } },
        select: { id: true, slug: true, title: true },
      }),
      this.prisma.priceSnapshot.findMany({
        where: { entityType: 'ROUTE', entityId: { in: routeIds }, date: yesterdayDate },
      }),
    ]);
    const routeMap = new Map(routes.map((r) => [r.id, r]));
    const yMap = new Map(yesterdaySnaps.map((s) => [s.entityId, s.price]));

    const items = todaySnaps
      .map((s) => {
        const route = routeMap.get(s.entityId);
        if (!route) return null;
        const prev = yMap.get(s.entityId) ?? s.price;
        const changePercent24h = prev > 0 ? (s.price - prev) / prev : 0;
        return {
          routeId: route.id,
          slug: route.slug,
          title: route.title,
          priceFen: s.price,
          currency: s.currency,
          source: 'baseline' as const,
          date: s.date.toISOString().split('T')[0],
          changePercent24h,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    return { items, asOf: new Date().toISOString() };
  }

  /** 24h 涨跌榜 — 按绝对幅度降序 */
  async getTopMovers(limit = 5, windowDays = 1) {
    const cap = Math.min(Math.max(limit, 1), 20);
    const windowCap = Math.min(Math.max(windowDays, 1), 30);

    const latest = await this.prisma.priceSnapshot.findFirst({
      where: { entityType: 'ROUTE' },
      orderBy: { date: 'desc' },
      select: { date: true },
    });
    if (!latest) return { items: [], asOf: new Date().toISOString() };

    const todayDate = latest.date;
    const prevDate = new Date(todayDate);
    prevDate.setDate(prevDate.getDate() - windowCap);

    const [todaySnaps, prevSnaps] = await Promise.all([
      this.prisma.priceSnapshot.findMany({
        where: { entityType: 'ROUTE', date: todayDate },
        take: 1000,
      }),
      this.prisma.priceSnapshot.findMany({
        where: { entityType: 'ROUTE', date: prevDate },
        take: 1000,
      }),
    ]);

    const prevMap = new Map(prevSnaps.map((s) => [s.entityId, s.price]));

    const ranked = todaySnaps
      .map((s) => {
        const prev = prevMap.get(s.entityId);
        if (prev === undefined || prev <= 0) return null;
        const delta = s.price - prev;
        const pct = delta / prev;
        const dir: 'UP' | 'DOWN' | 'FLAT' =
          Math.abs(pct) < 0.001 ? 'FLAT' : pct > 0 ? 'UP' : 'DOWN';
        return {
          entityId: s.entityId,
          currentPriceFen: s.price,
          previousPriceFen: prev,
          changePercent: pct,
          changeDirection: dir,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, cap);

    if (ranked.length === 0) return { items: [], asOf: new Date().toISOString() };

    const routes = await this.prisma.route.findMany({
      where: { id: { in: ranked.map((r) => r.entityId) } },
      select: { id: true, slug: true, title: true },
    });
    const routeMap = new Map(routes.map((r) => [r.id, r]));

    const items = ranked
      .map((r) => {
        const route = routeMap.get(r.entityId);
        if (!route) return null;
        return {
          routeId: route.id,
          slug: route.slug,
          title: route.title,
          currentPriceFen: r.currentPriceFen,
          previousPriceFen: r.previousPriceFen,
          changePercent: r.changePercent,
          changeDirection: r.changeDirection,
          source: 'baseline' as const,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    return { items, asOf: new Date().toISOString() };
  }

  // ──────────────── Admin ────────────────

  async listSnapshots(page: number, pageSize: number, entityType?: string) {
    const where = entityType ? { entityType } : {};
    const [items, total] = await Promise.all([
      this.prisma.priceSnapshot.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.priceSnapshot.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async listAlerts(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      this.prisma.priceAlert.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.priceAlert.count(),
    ]);
    return { items, total, page, pageSize };
  }

  async adminDeleteAlert(id: string) {
    const alert = await this.prisma.priceAlert.findUnique({ where: { id } });
    if (!alert) {
      throw new NotFoundException(`价格提醒 ${id} 不存在`);
    }
    await this.prisma.priceAlert.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: '提醒已删除' };
  }
}
