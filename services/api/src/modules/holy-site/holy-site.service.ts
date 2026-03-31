import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateHolySiteDto } from './dto/create-holy-site.dto';
import { UpdateHolySiteDto } from './dto/update-holy-site.dto';

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
    const result = { items, total, page, limit };
    await this.redis.setJSON(cacheKey, result, 1800); // 30 min
    return result;
  }

  async findById(id: string) {
    const cacheKey = `holy-site:id:${id}`;
    const cached = await this.redis.getJSON(cacheKey);
    if (cached) return cached;

    const result = await this.prisma.holySite.findUnique({
      where: { id },
      include: { religion: true },
    });
    if (result) {
      await this.redis.setJSON(cacheKey, result, 900); // 15 min
    }
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

  async remove(id: string) {
    const result = await this.prisma.holySite.delete({ where: { id } });
    await this.invalidateCache(id);
    return result;
  }

  private async invalidateCache(id?: string) {
    try {
      const client = this.redis.getClient();
      const listKeys = await client.keys('holy-site:list:*');
      if (listKeys.length > 0) await this.redis.del(...listKeys);
      if (id) {
        await this.redis.del(`holy-site:id:${id}`);
      }
    } catch (err) {
      this.logger.warn('Failed to invalidate holy-site cache', err);
    }
  }
}
