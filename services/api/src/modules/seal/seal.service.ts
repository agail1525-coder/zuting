import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SealSeries } from '@prisma/client';
import { CreateSealDto } from './dto/create-seal.dto';
import { UpdateSealDto } from './dto/update-seal.dto';

@Injectable()
export class SealService {
  private readonly logger = new Logger(SealService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(series?: SealSeries, page = 1, limit = 20) {
    const cacheKey = `seal:list:${series ?? 'all'}:${page}:${limit}`;
    const cached = await this.redis.getJSON<{ items: unknown[]; total: number; page: number; limit: number }>(cacheKey);
    if (cached) return cached;

    const where = series ? { series } : undefined;
    const [items, total] = await Promise.all([
      this.prisma.seal.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.seal.count({ where }),
    ]);
    const result = { items, total, page, limit };
    await this.redis.setJSON(cacheKey, result, 3600); // 1 hour — static content
    return result;
  }

  async findById(id: number) {
    const cacheKey = `seal:id:${id}`;
    const cached = await this.redis.getJSON(cacheKey);
    if (cached) return cached;

    const result = await this.prisma.seal.findUnique({ where: { id } });
    if (result) {
      await this.redis.setJSON(cacheKey, result, 3600); // 1 hour
    }
    return result;
  }

  async create(dto: CreateSealDto) {
    const result = await this.prisma.seal.create({
      data: {
        id: dto.id,
        name: dto.name,
        series: dto.series as SealSeries,
        poem: dto.poem,
        essence: dto.essence,
        practice: dto.practice,
        vow: dto.vow,
        color: dto.color,
      },
    });
    await this.invalidateCache();
    return result;
  }

  async update(id: number, dto: UpdateSealDto) {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.series !== undefined) data.series = dto.series as SealSeries;
    if (dto.poem !== undefined) data.poem = dto.poem;
    if (dto.essence !== undefined) data.essence = dto.essence;
    if (dto.practice !== undefined) data.practice = dto.practice;
    if (dto.vow !== undefined) data.vow = dto.vow;
    if (dto.color !== undefined) data.color = dto.color;
    const result = await this.prisma.seal.update({ where: { id }, data });
    await this.invalidateCache(id);
    return result;
  }

  async delete(id: number) {
    const result = await this.prisma.seal.delete({ where: { id } });
    await this.invalidateCache(id);
    return result;
  }

  private async invalidateCache(id?: number) {
    try {
      const client = this.redis.getClient();
      const listKeys = await client.keys('seal:list:*');
      if (listKeys.length > 0) await this.redis.del(...listKeys);
      if (id !== undefined) {
        await this.redis.del(`seal:id:${id}`);
      }
    } catch (err) {
      this.logger.warn('Failed to invalidate seal cache', err);
    }
  }
}
