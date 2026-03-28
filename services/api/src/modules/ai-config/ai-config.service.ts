import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const CACHE_PREFIX = 'ai_config:';
const CACHE_TTL = 300; // 5 minutes

@Injectable()
export class AiConfigService {
  private readonly logger = new Logger(AiConfigService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getAll() {
    return this.prisma.aiConfig.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
  }

  async get(key: string): Promise<string | null> {
    // Try cache first
    const cached = await this.redis.get(`${CACHE_PREFIX}${key}`);
    if (cached !== null) return cached;

    const config = await this.prisma.aiConfig.findUnique({ where: { key } });
    if (!config) return null;

    // Cache it
    await this.redis.setex(`${CACHE_PREFIX}${key}`, CACHE_TTL, config.value);
    return config.value;
  }

  async getOrDefault(key: string, defaultValue: string): Promise<string> {
    const value = await this.get(key);
    return value ?? defaultValue;
  }

  async update(key: string, value: string) {
    const existing = await this.prisma.aiConfig.findUnique({ where: { key } });
    if (!existing) {
      throw new NotFoundException(`AI config key "${key}" not found`);
    }

    const updated = await this.prisma.aiConfig.update({
      where: { key },
      data: { value },
    });

    // Invalidate cache
    await this.redis.del(`${CACHE_PREFIX}${key}`);
    this.logger.log(`AI config "${key}" updated`);
    return updated;
  }

  /** Get multiple configs as a map */
  async getMap(keys: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    // Batch fetch from DB (cache misses are fine for batch)
    const configs = await this.prisma.aiConfig.findMany({
      where: { key: { in: keys } },
    });
    for (const c of configs) {
      result[c.key] = c.value;
    }
    return result;
  }
}
