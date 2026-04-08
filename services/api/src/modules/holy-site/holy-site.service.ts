import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateHolySiteDto } from './dto/create-holy-site.dto';
import { UpdateHolySiteDto } from './dto/update-holy-site.dto';
import { BulkCreateEnrichedHolySitesDto } from './dto/create-enriched-holy-site.dto';

@Injectable()
export class HolySiteService {
  private readonly logger = new Logger(HolySiteService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(religionId?: string, page = 1, limit = 20) {
    const cacheKey = `holy-site:list:${religionId ?? 'all'}:${page}:${limit}`;
    const cached = await this.redis.getJSON<{ items: unknown[]; total: number; page: number; limit: number }>(cacheKey);
    if (cached) return cached;

    const where = religionId ? { religionId } : undefined;
    const [items, total] = await Promise.all([
      this.prisma.holySite.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { religion: { select: { name: true, nameEn: true, slug: true, color: true } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.holySite.count({ where }),
    ]);

    // Batch-aggregate review stats and collection counts for all sites
    const siteIds = items.map(s => s.id);

    const [reviewStats, collectionCounts] = await Promise.all([
      siteIds.length > 0
        ? this.prisma.review.groupBy({
            by: ['targetId'],
            where: { targetType: 'SITE', targetId: { in: siteIds }, status: 'APPROVED' },
            _avg: { rating: true },
            _count: { _all: true },
          })
        : [],
      siteIds.length > 0
        ? this.prisma.collectionItem.groupBy({
            by: ['entityId'],
            where: { entityType: 'HOLY_SITE', entityId: { in: siteIds } },
            _count: { _all: true },
          })
        : [],
    ]);

    const reviewMap = new Map(
      reviewStats.map(r => [
        r.targetId,
        { averageRating: Math.round((r._avg.rating ?? 0) * 10) / 10, reviewCount: r._count._all },
      ]),
    );
    const collectionMap = new Map(
      collectionCounts.map(c => [c.entityId, c._count._all]),
    );

    const enrichedItems = items.map(item => ({
      ...item,
      reviewStats: reviewMap.get(item.id) ?? { averageRating: 0, reviewCount: 0 },
      collectionCount: collectionMap.get(item.id) ?? 0,
    }));

    const result = { items: enrichedItems, total, page, limit };
    await this.redis.setJSON(cacheKey, result, 1800); // 30 min
    return result;
  }

  async findById(id: string) {
    const cacheKey = `holy-site:id:${id}`;
    const cached = await this.redis.getJSON(cacheKey);
    if (cached) return cached;

    const site = await this.prisma.holySite.findUnique({
      where: { id },
      include: { religion: true },
    });
    if (!site) return null;

    const [collectionCount, reviewAgg] = await Promise.all([
      this.prisma.collectionItem.count({
        where: { entityType: 'HOLY_SITE', entityId: id },
      }),
      this.prisma.review.aggregate({
        where: { targetType: 'SITE', targetId: id, status: 'APPROVED' },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    const result = {
      ...site,
      collectionCount,
      reviewStats: {
        averageRating: Math.round((reviewAgg._avg.rating ?? 0) * 10) / 10,
        reviewCount: reviewAgg._count._all,
      },
    };
    await this.redis.setJSON(cacheKey, result, 900); // 15 min
    return result;
  }

  async create(dto: CreateHolySiteDto) {
    const result = await this.prisma.holySite.create({ data: dto });
    await this.invalidateCache();
    return result;
  }

  async update(id: string, dto: UpdateHolySiteDto) {
    const result = await this.prisma.holySite.update({ where: { id }, data: dto });
    await this.invalidateCache(id);
    return result;
  }

  /**
   * Bulk-create holy sites from AI-enriched data (used by trip planner Phase 1).
   * Idempotent: if a site with same name+country already exists with source=AI_KNOWLEDGE,
   * reuse it instead of creating a duplicate.
   *
   * Returns a map from extId → realId so the caller can update plan.siteIds in place.
   */
  async bulkCreateEnriched(dto: BulkCreateEnrichedHolySitesDto): Promise<Record<string, string>> {
    if (!dto.sites || dto.sites.length === 0) return {};

    // Resolve religionSlug → religionId once
    const slugs = [...new Set(dto.sites.map((s) => s.religionSlug))];
    const religions = await this.prisma.religion.findMany({
      where: { slug: { in: slugs } },
      select: { id: true, slug: true },
    });
    const religionIdBySlug = new Map(religions.map((r) => [r.slug, r.id]));

    const result: Record<string, string> = {};

    for (const site of dto.sites) {
      const religionId = religionIdBySlug.get(site.religionSlug);
      if (!religionId) {
        this.logger.warn(`Skipping enriched site "${site.name}" — unknown religion slug "${site.religionSlug}"`);
        continue;
      }

      // Idempotency: reuse existing AI_KNOWLEDGE site by name+country
      const existing = await this.prisma.holySite.findFirst({
        where: {
          name: site.name,
          country: site.country,
          source: 'AI_KNOWLEDGE',
        },
        select: { id: true },
      });

      if (existing) {
        result[site.extId] = existing.id;
        continue;
      }

      try {
        const created = await this.prisma.holySite.create({
          data: {
            name: site.name,
            nameEn: site.nameEn || site.name,
            country: site.country,
            latitude: site.latitude,
            longitude: site.longitude,
            utcOffset: this.guessUtcOffset(site.longitude),
            description: site.description,
            religionId,
            source: 'AI_KNOWLEDGE',
            status: 'PENDING_REVIEW',
          },
          select: { id: true },
        });
        result[site.extId] = created.id;
      } catch (err) {
        this.logger.error(`Failed to create enriched site "${site.name}": ${(err as Error).message}`);
      }
    }

    if (Object.keys(result).length > 0) {
      await this.invalidateCache();
    }
    return result;
  }

  /** Rough UTC offset estimate from longitude (15° per hour). Admin can correct later. */
  private guessUtcOffset(longitude: number): number {
    return Math.round(longitude / 15);
  }

  async remove(id: string) {
    const [tripSiteCount, routeSiteCount] = await Promise.all([
      this.prisma.tripSite.count({ where: { siteId: id } }),
      this.prisma.routeSite.count({ where: { siteId: id } }),
    ]);
    if (tripSiteCount > 0 || routeSiteCount > 0) {
      throw new ConflictException('Cannot delete holy site with associated trips or routes');
    }
    const result = await this.prisma.holySite.delete({ where: { id } });
    await this.invalidateCache(id);
    return result;
  }

  private async invalidateCache(id?: string) {
    try {
      const client = this.redis.getClient();
      // Use SCAN instead of KEYS to avoid O(N) blocking in production
      const stream = client.scanStream({ match: 'holy-site:list:*', count: 100 });
      await new Promise<void>((resolve, reject) => {
        stream.on('data', (keys: string[]) => {
          if (keys.length > 0) {
            const pipeline = client.pipeline();
            for (const key of keys) {
              pipeline.del(key);
            }
            pipeline.exec().catch((err) =>
              this.logger.warn('Pipeline exec failed during cache invalidation', err),
            );
          }
        });
        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
      });
      if (id) {
        await this.redis.del(`holy-site:id:${id}`);
      }
    } catch (err) {
      this.logger.warn('Failed to invalidate holy-site cache', err);
    }
  }
}
