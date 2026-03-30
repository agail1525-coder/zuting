import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface TrendDataPoint {
  date: string;
  orders: number;
  trips: number;
  users: number;
}

export interface FunnelLevel {
  name: string;
  nameEn: string;
  count: number;
  rate: number;
}

export interface TopContentItem {
  rank: number;
  entityType: string;
  entityId: string;
  count: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      totalUsers,
      totalTrips,
      totalOrders,
      revenueResult,
      totalReviews,
      totalGuides,
      totalMerchants,
      totalShares,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.trip.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { paidAmount: true },
        where: { status: 'PAID' },
      }),
      this.prisma.review.count(),
      this.prisma.guide.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.merchant.count({ where: { status: 'APPROVED' } }),
      this.prisma.share.count(),
    ]);

    return {
      totalUsers,
      totalTrips,
      totalOrders,
      totalRevenue: revenueResult._sum.paidAmount ?? 0,
      totalReviews,
      totalGuides,
      totalMerchants,
      totalShares,
    };
  }

  async getTrends(days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [orders, trips, users] = await Promise.all([
      this.prisma.order.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
        take: 10000,
      }),
      this.prisma.trip.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
        take: 10000,
      }),
      this.prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
        take: 10000,
      }),
    ]);

    // Build date map for the range
    const dateMap = new Map<string, TrendDataPoint>();
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dateMap.set(key, { date: key, orders: 0, trips: 0, users: 0 });
    }

    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      const point = dateMap.get(key);
      if (point) point.orders++;
    }

    for (const t of trips) {
      const key = t.createdAt.toISOString().slice(0, 10);
      const point = dateMap.get(key);
      if (point) point.trips++;
    }

    for (const u of users) {
      const key = u.createdAt.toISOString().slice(0, 10);
      const point = dateMap.get(key);
      if (point) point.users++;
    }

    const data = Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    return { days, data };
  }

  async getFunnel() {
    const totalUsers = await this.prisma.user.count();

    // Users who have at least 1 trip
    const usersWithTrips = await this.prisma.user.count({
      where: { trips: { some: {} } },
    });

    // Users who have at least 1 order
    const usersWithOrders = await this.prisma.user.count({
      where: { orders: { some: {} } },
    });

    // Users who have at least 1 paid order
    const usersWithPaidOrders = await this.prisma.user.count({
      where: { orders: { some: { status: 'PAID' } } },
    });

    const levels: FunnelLevel[] = [
      {
        name: '注册用户',
        nameEn: 'Registered Users',
        count: totalUsers,
        rate: 1.0,
      },
      {
        name: '创建行程',
        nameEn: 'With Trips',
        count: usersWithTrips,
        rate: totalUsers > 0 ? Number((usersWithTrips / totalUsers).toFixed(3)) : 0,
      },
      {
        name: '创建订单',
        nameEn: 'With Orders',
        count: usersWithOrders,
        rate: totalUsers > 0 ? Number((usersWithOrders / totalUsers).toFixed(3)) : 0,
      },
      {
        name: '完成支付',
        nameEn: 'Paid',
        count: usersWithPaidOrders,
        rate: totalUsers > 0 ? Number((usersWithPaidOrders / totalUsers).toFixed(3)) : 0,
      },
    ];

    return { levels };
  }

  async getTopContent(dimension: string, limit: number) {
    let items: TopContentItem[] = [];

    switch (dimension) {
      case 'views': {
        const results = await this.prisma.userViewHistory.groupBy({
          by: ['entityType', 'entityId'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: limit,
        });
        items = results.map((row, i) => ({
          rank: i + 1,
          entityType: row.entityType,
          entityId: row.entityId,
          count: row._count.id,
        }));
        break;
      }
      case 'shares': {
        const results = await this.prisma.share.groupBy({
          by: ['entityType', 'entityId'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: limit,
        });
        items = results.map((row, i) => ({
          rank: i + 1,
          entityType: row.entityType,
          entityId: row.entityId,
          count: row._count.id,
        }));
        break;
      }
      case 'reviews': {
        const results = await this.prisma.review.groupBy({
          by: ['targetType', 'targetId'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: limit,
        });
        items = results.map((row, i) => ({
          rank: i + 1,
          entityType: row.targetType,
          entityId: row.targetId,
          count: row._count.id,
        }));
        break;
      }
      default:
        break;
    }

    return { dimension, items };
  }
}
