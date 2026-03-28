import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RouteCategory, RouteDifficulty, RouteStatus } from '@prisma/client';

@Injectable()
export class RouteService {
  constructor(private prisma: PrismaService) {}

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

    return { items, total, page, pageSize: take };
  }

  async findBySlug(slug: string) {
    const route = await this.prisma.route.findUnique({
      where: { slug },
      include: this.includeRelations,
    });
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  async findFeatured(limit = 8) {
    return this.prisma.route.findMany({
      where: { status: RouteStatus.PUBLISHED },
      include: this.includeRelations,
      orderBy: [{ bookCount: 'desc' }, { rating: 'desc' }],
      take: Math.min(limit, 20),
    });
  }

  async findBySite(siteId: string) {
    return this.prisma.route.findMany({
      where: {
        status: RouteStatus.PUBLISHED,
        sites: { some: { siteId } },
      },
      include: this.includeRelations,
      take: 20,
    });
  }

  async create(dto: CreateRouteDto) {
    return this.prisma.route.create({
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
  }

  async update(id: string, dto: UpdateRouteDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.category) data.category = dto.category as RouteCategory;
    if (dto.difficulty) data.difficulty = dto.difficulty as RouteDifficulty;
    if (dto.status) data.status = dto.status as RouteStatus;
    return this.prisma.route.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.route.delete({ where: { id } });
  }
}
