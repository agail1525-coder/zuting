import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RecordViewDto } from './dto/record-view.dto';

interface EntityWithReligion {
  id: string;
  religionId?: string | null;
  country?: string | null;
}

type RecommendedItem = Record<string, unknown>;

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /** Related items — same religion/country first, highest-rated fallback */
  async getRelated(entityType: string, entityId: string, limit = 6): Promise<RecommendedItem[]> {
    const cacheKey = `rec:related:${entityType}:${entityId}`;
    const cached = await this.redis.getJSON<RecommendedItem[]>(cacheKey);
    if (cached) return cached;

    let current: EntityWithReligion | null = null;
    let results: RecommendedItem[] = [];

    if (entityType === 'SITE') {
      current = await this.prisma.holySite.findUnique({
        where: { id: entityId },
        select: { id: true, religionId: true, country: true },
      });
    } else if (entityType === 'TEMPLE') {
      current = await this.prisma.temple.findUnique({
        where: { id: entityId },
        select: { id: true, religionId: true, country: true },
      });
    }

    if (!current) {
      return [];
    }

    const { religionId, country } = current;

    if (entityType === 'SITE') {
      // Priority 1: same religion + same country
      const sameReligionCountry = await this.prisma.holySite.findMany({
        where: {
          id: { not: entityId },
          religionId: religionId ?? undefined,
          country: country ?? undefined,
        },
        include: { religion: { select: { name: true, nameEn: true, color: true } } },
        take: limit,
      });

      // Priority 2: same religion (fill remainder)
      const remaining1 = limit - sameReligionCountry.length;
      const sameReligion = remaining1 > 0 ? await this.prisma.holySite.findMany({
        where: {
          id: {
            not: entityId,
            notIn: sameReligionCountry.map((s) => s.id),
          },
          religionId: religionId ?? undefined,
        },
        include: { religion: { select: { name: true, nameEn: true, color: true } } },
        take: remaining1,
      }) : [];

      // Priority 3: same country (fill remainder)
      const alreadyIds = [...sameReligionCountry, ...sameReligion].map((s) => s.id);
      const remaining2 = limit - alreadyIds.length;
      const sameCountry = remaining2 > 0 ? await this.prisma.holySite.findMany({
        where: {
          id: { not: entityId, notIn: alreadyIds },
          country: country ?? undefined,
        },
        include: { religion: { select: { name: true, nameEn: true, color: true } } },
        take: remaining2,
      }) : [];

      // Fallback: highest rated (by name sort as proxy, since no avgRating field)
      const allIds = [...alreadyIds, ...sameCountry.map((s) => s.id)];
      const remaining3 = limit - allIds.length;
      const fallback = remaining3 > 0 ? await this.prisma.holySite.findMany({
        where: { id: { not: entityId, notIn: allIds } },
        include: { religion: { select: { name: true, nameEn: true, color: true } } },
        orderBy: { name: 'asc' },
        take: remaining3,
      }) : [];

      results = [...sameReligionCountry, ...sameReligion, ...sameCountry, ...fallback];
    } else if (entityType === 'TEMPLE') {
      const sameReligionCountry = await this.prisma.temple.findMany({
        where: {
          id: { not: entityId },
          religionId: religionId ?? undefined,
          country: country ?? undefined,
        },
        include: { religion: { select: { name: true, nameEn: true, color: true } } },
        take: limit,
      });

      const remaining1 = limit - sameReligionCountry.length;
      const sameReligion = remaining1 > 0 ? await this.prisma.temple.findMany({
        where: {
          id: {
            not: entityId,
            notIn: sameReligionCountry.map((t) => t.id),
          },
          religionId: religionId ?? undefined,
        },
        include: { religion: { select: { name: true, nameEn: true, color: true } } },
        take: remaining1,
      }) : [];

      const alreadyIds = [...sameReligionCountry, ...sameReligion].map((t) => t.id);
      const remaining2 = limit - alreadyIds.length;
      const sameCountry = remaining2 > 0 ? await this.prisma.temple.findMany({
        where: {
          id: { not: entityId, notIn: alreadyIds },
          country: country ?? undefined,
        },
        include: { religion: { select: { name: true, nameEn: true, color: true } } },
        take: remaining2,
      }) : [];

      const allIds = [...alreadyIds, ...sameCountry.map((t) => t.id)];
      const remaining3 = limit - allIds.length;
      const fallback = remaining3 > 0 ? await this.prisma.temple.findMany({
        where: { id: { not: entityId, notIn: allIds } },
        include: { religion: { select: { name: true, nameEn: true, color: true } } },
        orderBy: { name: 'asc' },
        take: remaining3,
      }) : [];

      results = [...sameReligionCountry, ...sameReligion, ...sameCountry, ...fallback];
    }

    await this.redis.setJSON(cacheKey, results, 3600);
    return results;
  }

  /** Popular items — ordered by review count + avg rating via aggregate */
  async getPopular(religionId?: string, limit = 10): Promise<RecommendedItem[]> {
    const cacheKey = `rec:popular:${religionId ?? 'all'}:${limit}`;
    const cached = await this.redis.getJSON<RecommendedItem[]>(cacheKey);
    if (cached) return cached;

    // Get holy sites with review counts
    const sites = await this.prisma.holySite.findMany({
      where: religionId ? { religionId } : undefined,
      include: {
        religion: { select: { name: true, nameEn: true, color: true } },
      },
      take: 100,
    });

    // Get review stats per site
    const siteIds = sites.map((s) => s.id);
    const reviewGroups = await this.prisma.review.groupBy({
      by: ['targetId'],
      where: { targetType: 'SITE', targetId: { in: siteIds } },
      _count: { _all: true },
      _avg: { rating: true },
      orderBy: { _count: { rating: 'desc' } },
    });

    const statsMap = new Map(
      reviewGroups.map((r) => [r.targetId, { count: r._count._all, avg: r._avg.rating ?? 0 }]),
    );

    const ranked = sites
      .map((site) => {
        const stats = statsMap.get(site.id) ?? { count: 0, avg: 0 };
        return { ...site, reviewCount: stats.count, avgRating: stats.avg, entityType: 'SITE' };
      })
      .sort((a, b) => b.reviewCount - a.reviewCount || b.avgRating - a.avgRating)
      .slice(0, limit);

    const result = ranked as unknown as RecommendedItem[];
    await this.redis.setJSON(cacheKey, result, 1800);
    return result;
  }

  /** Homepage recommendations — personalized if userId provided */
  async getHomepage(userId?: string, limit = 12): Promise<RecommendedItem[]> {
    const cacheKey = `rec:home:${userId ?? 'anon'}`;
    const cached = await this.redis.getJSON<RecommendedItem[]>(cacheKey);
    if (cached) return cached;

    let religionId: string | undefined;

    if (userId) {
      // Find the user's most-viewed religion from history
      const history = await this.prisma.userViewHistory.findMany({
        where: { userId, entityType: 'SITE' },
        orderBy: { viewedAt: 'desc' },
        take: 20,
      });

      if (history.length > 0) {
        const siteIds = history.map((h) => h.entityId);
        const sites = await this.prisma.holySite.findMany({
          where: { id: { in: siteIds } },
          select: { religionId: true },
        });
        // Count most frequent religion
        const freq = new Map<string, number>();
        for (const s of sites) {
          if (s.religionId) {
            freq.set(s.religionId, (freq.get(s.religionId) ?? 0) + 1);
          }
        }
        if (freq.size > 0) {
          religionId = [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];
        }
      }
    }

    const result = await this.getPopular(religionId, limit);
    await this.redis.setJSON(cacheKey, result, 1800);
    return result;
  }

  /** Record a view — dedupe same entity within 24h */
  async recordView(userId: string, dto: RecordViewDto): Promise<void> {
    const { entityType, entityId } = dto;
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const existing = await this.prisma.userViewHistory.findFirst({
      where: {
        userId,
        entityType,
        entityId,
        viewedAt: { gte: cutoff },
      },
    });

    if (existing) {
      await this.prisma.userViewHistory.update({
        where: { id: existing.id },
        data: { viewedAt: new Date() },
      });
    } else {
      await this.prisma.userViewHistory.create({
        data: { userId, entityType, entityId },
      });
    }

    // Increment view counter in Redis
    const counterKey = `entity:views:${entityType}:${entityId}`;
    await this.redis.incr(counterKey);
  }

  /** Get user's view history */
  async getViewHistory(userId: string, limit = 20): Promise<unknown[]> {
    const take = Math.min(limit, 100);
    return this.prisma.userViewHistory.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take,
    });
  }

  /** Clear all view history for a user */
  async clearViewHistory(userId: string): Promise<{ deleted: number }> {
    const result = await this.prisma.userViewHistory.deleteMany({ where: { userId } });
    return { deleted: result.count };
  }
}
