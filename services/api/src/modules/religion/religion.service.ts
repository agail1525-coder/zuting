import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateReligionDto } from './dto/create-religion.dto';
import { UpdateReligionDto } from './dto/update-religion.dto';

@Injectable()
export class ReligionService {
  private readonly logger = new Logger(ReligionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(page = 1, limit = 20) {
    const cacheKey = `religion:list:${page}:${limit}`;
    const cached = await this.redis.getJSON<{ items: unknown[]; total: number; page: number; limit: number }>(cacheKey);
    if (cached) return cached;

    const [items, total] = await Promise.all([
      this.prisma.religion.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.religion.count(),
    ]);
    const result = { items, total, page, limit };
    await this.redis.setJSON(cacheKey, result, 3600); // 1 hour — nearly static
    return result;
  }

  async findBySlug(slug: string) {
    const cacheKey = `religion:slug:${slug}`;
    const cached = await this.redis.getJSON(cacheKey);
    if (cached) return cached;

    const result = await this.prisma.religion.findUnique({
      where: { slug },
      include: {
        holySites: true,
        temples: true,
        patriarchs: true,
        teachings: true,
      },
    });
    if (result) {
      await this.redis.setJSON(cacheKey, result, 1800); // 30 min
    }
    return result;
  }

  async findById(id: string) {
    const cacheKey = `religion:id:${id}`;
    const cached = await this.redis.getJSON(cacheKey);
    if (cached) return cached;

    const result = await this.prisma.religion.findUnique({
      where: { id },
      include: {
        holySites: true,
        temples: true,
        patriarchs: true,
        teachings: true,
      },
    });
    if (result) {
      await this.redis.setJSON(cacheKey, result, 1800); // 30 min
    }
    return result;
  }

  async create(dto: CreateReligionDto) {
    const result = await this.prisma.religion.create({ data: dto });
    await this.invalidateCache();
    return result;
  }

  async update(id: string, dto: UpdateReligionDto) {
    const result = await this.prisma.religion.update({ where: { id }, data: dto });
    await this.invalidateCache(id);
    return result;
  }

  async remove(id: string) {
    const result = await this.prisma.religion.delete({ where: { id } });
    await this.invalidateCache(id);
    return result;
  }

  /** Invalidate all religion caches; optionally also a specific id/slug entry */
  private async invalidateCache(id?: string) {
    try {
      const client = this.redis.getClient();
      // Delete all list caches
      const listKeys = await client.keys('religion:list:*');
      if (listKeys.length > 0) await this.redis.del(...listKeys);
      // Delete specific entry caches
      if (id) {
        const entryKeys = await client.keys(`religion:id:${id}`);
        if (entryKeys.length > 0) await this.redis.del(...entryKeys);
      }
      // Delete all slug caches (slug may have changed on update)
      const slugKeys = await client.keys('religion:slug:*');
      if (slugKeys.length > 0) await this.redis.del(...slugKeys);
    } catch (err) {
      this.logger.warn('Failed to invalidate religion cache', err);
    }
  }
}
