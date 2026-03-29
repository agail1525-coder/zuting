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
}
