import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RouteSiteItemDto } from './dto/replace-route-sites.dto';
import { RouteCategory, RouteDifficulty, RouteStatus } from '@prisma/client';

@Injectable()
export class RouteService {
  private readonly logger = new Logger(RouteService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private readonly includeRelations = {
    religion: { select: { name: true, nameEn: true, slug: true, color: true } },
    sites: {
      include: {
        site: { select: { id: true, name: true, nameEn: true, country: true, latitude: true, longitude: true, imageUrl: true } },
      },
      orderBy: [{ day: 'asc' as const }, { order: 'asc' as const }],
    },
    _count: { select: { bookings: true } },
  };

  async findAll(query: {
    category?: string;
    difficulty?: string;
    status?: string;
    religionId?: string;
    minDuration?: number;
    maxDuration?: number;
    page?: number;
    pageSize?: number;
    sort?: string;
  }) {
    const {
      category,
      difficulty,
      status,
      religionId,
      minDuration,
      maxDuration,
      page = 1,
      pageSize = 20,
      sort = 'createdAt',
    } = query;

    // Only cache default published-route queries (no custom status filter)
    const isDefaultPublished = !status;
    const cacheKey = isDefaultPublished
      ? `route:list:${category ?? ''}:${difficulty ?? ''}:${religionId ?? ''}:${minDuration ?? ''}:${maxDuration ?? ''}:${page}:${pageSize}:${sort}`
      : null;

    if (cacheKey) {
      const cached = await this.redis.getJSON(cacheKey);
      if (cached) return cached;
    }

    const where: Record<string, unknown> = {};
    if (category) where.category = category as RouteCategory;
    if (difficulty) where.difficulty = difficulty as RouteDifficulty;
    if (status) where.status = status as RouteStatus;
    else where.status = RouteStatus.PUBLISHED; // default to published
    if (religionId) where.religionId = religionId;
    if (minDuration || maxDuration) {
      where.duration = {};
      if (minDuration) (where.duration as Record<string, number>).gte = minDuration;
      if (maxDuration) (where.duration as Record<string, number>).lte = maxDuration;
    }

    const take = Math.min(pageSize, 50);
    const skip = (page - 1) * take;

    const orderBy: Record<string, string> = {};
    if (sort === 'price') orderBy.priceFrom = 'asc';
    else if (sort === 'rating') orderBy.rating = 'desc';
    else if (sort === 'duration') orderBy.duration = 'asc';
    else orderBy.createdAt = 'desc';

    const [items, total] = await Promise.all([
      this.prisma.route.findMany({
        where,
        include: this.includeRelations,
        orderBy,
        take,
        skip,
      }),
      this.prisma.route.count({ where }),
    ]);

    const result = { items, total, page, pageSize: take };
    if (cacheKey) {
      await this.redis.setJSON(cacheKey, result, 900); // 15 min
    }
    return result;
  }

  async findBySlug(slug: string) {
    const cacheKey = `route:slug:${slug}`;
    const cached = await this.redis.getJSON(cacheKey);
    if (cached) return cached;

    const route = await this.prisma.route.findUnique({
      where: { slug },
      include: this.includeRelations,
    });
    if (!route) throw new NotFoundException('Route not found');
    await this.redis.setJSON(cacheKey, route, 900); // 15 min
    return route;
  }

  async findFeatured(limit = 8) {
    const cacheKey = `route:featured:${limit}`;
    const cached = await this.redis.getJSON(cacheKey);
    if (cached) return cached;

    const result = await this.prisma.route.findMany({
      where: { status: RouteStatus.PUBLISHED },
      include: this.includeRelations,
      orderBy: [{ bookCount: 'desc' }, { rating: 'desc' }],
      take: Math.min(limit, 20),
    });
    await this.redis.setJSON(cacheKey, result, 900); // 15 min
    return result;
  }

  async findBySite(siteId: string) {
    const cacheKey = `route:site:${siteId}`;
    const cached = await this.redis.getJSON(cacheKey);
    if (cached) return cached;

    const result = await this.prisma.route.findMany({
      where: {
        status: RouteStatus.PUBLISHED,
        sites: { some: { siteId } },
      },
      include: this.includeRelations,
      take: 20,
    });
    await this.redis.setJSON(cacheKey, result, 900); // 15 min
    return result;
  }

  async create(dto: CreateRouteDto) {
    const result = await this.prisma.route.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        titleEn: dto.titleEn,
        subtitle: dto.subtitle,
        category: dto.category as RouteCategory,
        difficulty: dto.difficulty as RouteDifficulty,
        duration: dto.duration,
        nights: dto.nights,
        coverImage: dto.coverImage,
        images: dto.images ?? [],
        highlights: dto.highlights,
        description: dto.description,
        itinerary: dto.itinerary,
        priceFrom: dto.priceFrom,
        included: dto.included,
        excluded: dto.excluded,
        tips: dto.tips ?? [],
        season: dto.season,
        groupSize: dto.groupSize,
        status: (dto.status as RouteStatus) ?? RouteStatus.DRAFT,
        religionId: dto.religionId,
      },
    });
    await this.invalidateCache();
    return result;
  }

  async update(id: string, dto: UpdateRouteDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.category) data.category = dto.category as RouteCategory;
    if (dto.difficulty) data.difficulty = dto.difficulty as RouteDifficulty;
    if (dto.status) data.status = dto.status as RouteStatus;
    const result = await this.prisma.route.update({ where: { id }, data });
    await this.invalidateCache();
    return result;
  }

  /**
   * Replace all RouteSite entries for a route in one transaction.
   * Recomputes Route.duration and Route.nights from the max day.
   */
  async replaceSites(routeId: string, sites: RouteSiteItemDto[]) {
    const route = await this.prisma.route.findUnique({ where: { id: routeId }, select: { id: true } });
    if (!route) throw new NotFoundException('Route not found');

    // Validate all siteIds exist
    if (sites.length > 0) {
      const siteIds = [...new Set(sites.map((s) => s.siteId))];
      const found = await this.prisma.holySite.findMany({
        where: { id: { in: siteIds } },
        select: { id: true },
      });
      if (found.length !== siteIds.length) {
        const foundSet = new Set(found.map((f) => f.id));
        const missing = siteIds.filter((id) => !foundSet.has(id));
        throw new NotFoundException(`Holy sites not found: ${missing.join(', ')}`);
      }
    }

    const maxDay = sites.length > 0 ? Math.max(...sites.map((s) => s.day)) : 1;
    const nights = Math.max(0, maxDay - 1);

    await this.prisma.$transaction([
      this.prisma.routeSite.deleteMany({ where: { routeId } }),
      ...(sites.length > 0
        ? [
            this.prisma.routeSite.createMany({
              data: sites.map((s) => ({
                routeId,
                siteId: s.siteId,
                day: s.day,
                order: s.order,
                duration: s.duration != null ? String(s.duration) : null,
                note: s.note ?? null,
              })),
            }),
          ]
        : []),
      this.prisma.route.update({
        where: { id: routeId },
        data: { duration: maxDay, nights },
      }),
    ]);

    await this.invalidateCache();

    // Return refreshed route with sites
    return this.prisma.route.findUnique({
      where: { id: routeId },
      include: this.includeRelations,
    });
  }

  async remove(id: string) {
    const result = await this.prisma.route.delete({ where: { id } });
    await this.invalidateCache();
    return result;
  }

  private async invalidateCache() {
    try {
      const client = this.redis.getClient();
      const keys = await client.keys('route:*');
      if (keys.length > 0) await this.redis.del(...keys);
    } catch (err) {
      this.logger.warn('Failed to invalidate route cache', err);
    }
  }
}
