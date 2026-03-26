import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url = this.config.get<string>(
      'REDIS_URL',
      'redis://localhost:6380',
    );
    this.client = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        return Math.min(times * 200, 5000);
      },
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis error', err.message);
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis disconnected');
    }
  }

  /** Get the raw ioredis client for advanced operations */
  getClient(): Redis {
    return this.client;
  }

  /** Get a value by key */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /** Set a value (no expiry) */
  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  /** Set a value with TTL in seconds */
  async setex(key: string, ttl: number, value: string): Promise<void> {
    await this.client.setex(key, ttl, value);
  }

  /** Delete one or more keys */
  async del(...keys: string[]): Promise<number> {
    return this.client.del(...keys);
  }

  /** Check if a key exists */
  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  /** Increment a key and return the new value */
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  /** Set expiry on an existing key (seconds) */
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  /** Get remaining TTL in seconds (-1 = no expiry, -2 = key missing) */
  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  /** Get JSON-parsed value */
  async getJSON<T = unknown>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /** Set a JSON-serializable value with optional TTL */
  async setJSON(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const str = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, str);
    } else {
      await this.client.set(key, str);
    }
  }
}
