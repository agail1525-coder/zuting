import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export type SearchType =
  | 'all'
  | 'religion'
  | 'holy-site'
  | 'temple'
  | 'patriarch'
  | 'teaching'
  | 'seal';

export interface SearchResultItem {
  type: string;
  id: string | number;
  slug?: string;
  title: string;
  subtitle: string | null;
  descriptionSnippet: string | null;
  image: string | null;
  religion: { name: string; symbol: string | null; color: string | null } | null;
}

export interface SearchResponse {
  query: string;
  type: SearchType;
  page: number;
  limit: number;
  total: number;
  results: SearchResultItem[];
}

export interface MapSearchBounds {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

export interface MapSearchFilters {
  religionId?: string;
  type?: string;
}

export interface MapResultItem {
  type: 'holy-site' | 'temple';
  id: string;
  title: string;
  subtitle: string | null;
  latitude: number;
  longitude: number;
  image: string | null;
  religion: { name: string; symbol: string | null; color: string | null } | null;
}

const PER_TYPE_LIMIT = 20;
const SNIPPET_LENGTH = 120;
const HOT_KEYWORDS_KEY = 'search:hot';
const HISTORY_KEY_PREFIX = 'search:history:';
const HISTORY_MAX_LENGTH = 20;
const HOT_KEYWORDS_TOP = 10;

function snippet(text: string | null | undefined, maxLen = SNIPPET_LENGTH): string | null {
  if (!text) return null;
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
}

type SortOrder = 'asc' | 'desc';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // Main search
  // ─────────────────────────────────────────────────────────────

  async search(
    q: string,
    type: SearchType = 'all',
    page = 1,
    limit = 20,
    religionId?: string,
    country?: string,
    sort = 'relevance',
    sortOrder: SortOrder = 'asc',
  ): Promise<SearchResponse> {
    const safeLimit = Math.min(limit, 50);
    const skip = (page - 1) * safeLimit;

    const searchTypes =
      type === 'all'
        ? ['religion', 'holy-site', 'temple', 'patriarch', 'teaching', 'seal']
        : [type];

    const promises = searchTypes.map((t) =>
      this.searchByType(t, q, PER_TYPE_LIMIT, religionId, country),
    );
    const allArrays = await Promise.all(promises);
    let allResults = allArrays.flat();

    // Apply sorting
    if (sort === 'name') {
      allResults = allResults.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title, 'zh-CN');
        return sortOrder === 'desc' ? -cmp : cmp;
      });
    }
    // 'relevance' and 'popular' retain natural DB order for now

    const total = allResults.length;
    const results = allResults.slice(skip, skip + safeLimit);

    // Record search keyword (fire-and-forget)
    if (q && q.trim()) {
      this.recordSearch(q.trim()).catch((err) =>
        this.logger.warn('Failed to record search keyword', err),
      );
    }

    return { query: q, type, page, limit: safeLimit, total, results };
  }

  private async searchByType(
    type: string,
    q: string,
    take: number,
    religionId?: string,
    country?: string,
  ): Promise<SearchResultItem[]> {
    switch (type) {
      case 'religion':
        return this.searchReligions(q, take);
      case 'holy-site':
        return this.searchHolySites(q, take, religionId, country);
      case 'temple':
        return this.searchTemples(q, take, religionId, country);
      case 'patriarch':
        return this.searchPatriarchs(q, take, religionId);
      case 'teaching':
        return this.searchTeachings(q, take, religionId);
      case 'seal':
        return this.searchSeals(q, take);
      default:
        return [];
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Suggestions (autocomplete)
  // ─────────────────────────────────────────────────────────────

  async suggestions(q: string): Promise<{ entities: SearchResultItem[]; keywords: string[] }> {
    const trimmed = q.trim();
    if (!trimmed) return { entities: [], keywords: [] };

    const LIMIT = 5;
    const allArrays = await Promise.all([
      this.searchReligions(trimmed, LIMIT),
      this.searchHolySites(trimmed, LIMIT),
      this.searchTemples(trimmed, LIMIT),
      this.searchPatriarchs(trimmed, LIMIT),
    ]);

    // Merge, keep top LIMIT across all types
    const entities = allArrays.flat().slice(0, LIMIT);

    // Also suggest from hot keywords that contain the query
    let keywords: string[] = [];
    try {
      const client = this.redis.getClient();
      const hot = await client.zrevrange(HOT_KEYWORDS_KEY, 0, 49);
      keywords = hot
        .filter((k) => k.includes(trimmed))
        .slice(0, 5);
    } catch (err) {
      this.logger.warn('Redis unavailable for keyword suggestions', err);
    }

    return { entities, keywords };
  }

  // ─────────────────────────────────────────────────────────────
  // Hot keywords
  // ─────────────────────────────────────────────────────────────

  async getHotKeywords(): Promise<Array<{ keyword: string; score: number }>> {
    try {
      const client = this.redis.getClient();
      // zrevrange with WITHSCORES returns [member, score, member, score, ...]
      const raw = await client.zrevrange(HOT_KEYWORDS_KEY, 0, HOT_KEYWORDS_TOP - 1, 'WITHSCORES');
      const result: Array<{ keyword: string; score: number }> = [];
      for (let i = 0; i < raw.length; i += 2) {
        result.push({ keyword: raw[i], score: parseFloat(raw[i + 1]) });
      }
      return result;
    } catch (err) {
      this.logger.warn('Redis unavailable for hot keywords', err);
      // Fallback to DB
      const stats = await this.prisma.searchStat.findMany({
        orderBy: { count: 'desc' },
        take: HOT_KEYWORDS_TOP,
      });
      return stats.map((s) => ({ keyword: s.keyword, score: s.count }));
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Record search keyword
  // ─────────────────────────────────────────────────────────────

  async recordSearch(keyword: string): Promise<void> {
    // Increment Redis sorted set
    try {
      const client = this.redis.getClient();
      await client.zincrby(HOT_KEYWORDS_KEY, 1, keyword);
    } catch (err) {
      this.logger.warn('Redis unavailable for recording search', err);
    }

    // Upsert SearchStat in DB
    try {
      await this.prisma.searchStat.upsert({
        where: { keyword },
        update: { count: { increment: 1 } },
        create: { keyword, count: 1 },
      });
    } catch (err) {
      this.logger.warn('Failed to upsert SearchStat', err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Map search
  // ─────────────────────────────────────────────────────────────

  async mapSearch(
    bounds: MapSearchBounds,
    filters: MapSearchFilters,
  ): Promise<MapResultItem[]> {
    const { swLat, swLng, neLat, neLng } = bounds;
    const { religionId, type = 'all' } = filters;

    const results: MapResultItem[] = [];

    if (type === 'all' || type === 'holy-site') {
      const sites = await this.prisma.holySite.findMany({
        where: {
          latitude: { gte: swLat, lte: neLat },
          longitude: { gte: swLng, lte: neLng },
          ...(religionId ? { religionId } : {}),
        },
        include: { religion: true },
        take: 100,
      });

      for (const s of sites) {
        results.push({
          type: 'holy-site',
          id: s.id,
          title: s.name,
          subtitle: s.nameEn ?? null,
          latitude: s.latitude,
          longitude: s.longitude,
          image: s.imageUrl ?? null,
          religion: {
            name: s.religion.name,
            symbol: s.religion.symbol,
            color: s.religion.color,
          },
        });
      }
    }

    if (type === 'all' || type === 'temple') {
      const temples = await this.prisma.temple.findMany({
        where: {
          latitude: { not: null, gte: swLat, lte: neLat },
          longitude: { not: null, gte: swLng, lte: neLng },
          ...(religionId ? { religionId } : {}),
        },
        include: { religion: true },
        take: 100,
      });

      for (const t of temples) {
        if (t.latitude == null || t.longitude == null) continue;
        results.push({
          type: 'temple',
          id: t.id,
          title: t.name,
          subtitle: t.nameEn ?? null,
          latitude: t.latitude,
          longitude: t.longitude,
          image: t.imageUrl ?? null,
          religion: {
            name: t.religion.name,
            symbol: t.religion.symbol,
            color: t.religion.color,
          },
        });
      }
    }

    return results;
  }

  // ─────────────────────────────────────────────────────────────
  // User search history (Redis)
  // ─────────────────────────────────────────────────────────────

  async getUserHistory(userId: string): Promise<string[]> {
    try {
      const client = this.redis.getClient();
      return client.lrange(`${HISTORY_KEY_PREFIX}${userId}`, 0, -1);
    } catch (err) {
      this.logger.warn('Redis unavailable for user history', err);
      return [];
    }
  }

  async addToHistory(userId: string, keyword: string): Promise<void> {
    try {
      const client = this.redis.getClient();
      const key = `${HISTORY_KEY_PREFIX}${userId}`;
      await client.lrem(key, 0, keyword); // remove duplicates first
      await client.lpush(key, keyword);
      await client.ltrim(key, 0, HISTORY_MAX_LENGTH - 1);
    } catch (err) {
      this.logger.warn('Redis unavailable for adding to history', err);
    }
  }

  async clearHistory(userId: string): Promise<void> {
    try {
      await this.redis.del(`${HISTORY_KEY_PREFIX}${userId}`);
    } catch (err) {
      this.logger.warn('Redis unavailable for clearing history', err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Type-specific search helpers
  // ─────────────────────────────────────────────────────────────

  private async searchReligions(q: string, take: number): Promise<SearchResultItem[]> {
    const results = await this.prisma.religion.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { nameEn: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
        ],
      },
      take,
    });

    return results.map((r) => ({
      type: 'religion',
      id: r.id,
      slug: r.slug,
      title: r.name,
      subtitle: r.nameEn,
      descriptionSnippet: null,
      image: null,
      religion: { name: r.name, symbol: r.symbol, color: r.color },
    }));
  }

  private async searchHolySites(
    q: string,
    take: number,
    religionId?: string,
    country?: string,
  ): Promise<SearchResultItem[]> {
    const results = await this.prisma.holySite.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { nameEn: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { country: { contains: q, mode: 'insensitive' } },
              { religion: { name: { contains: q, mode: 'insensitive' } } },
            ],
          },
          ...(religionId ? [{ religionId }] : []),
          ...(country ? [{ country: { contains: country, mode: 'insensitive' as const } }] : []),
        ],
      },
      include: { religion: true },
      take,
    });

    return results.map((s) => ({
      type: 'holy-site',
      id: s.id,
      title: s.name,
      subtitle: `${s.nameEn} - ${s.country}`,
      descriptionSnippet: snippet(s.description),
      image: s.imageUrl,
      religion: {
        name: s.religion.name,
        symbol: s.religion.symbol,
        color: s.religion.color,
      },
    }));
  }

  private async searchTemples(
    q: string,
    take: number,
    religionId?: string,
    country?: string,
  ): Promise<SearchResultItem[]> {
    const results = await this.prisma.temple.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { nameEn: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { country: { contains: q, mode: 'insensitive' } },
              { religion: { name: { contains: q, mode: 'insensitive' } } },
            ],
          },
          ...(religionId ? [{ religionId }] : []),
          ...(country ? [{ country: { contains: country, mode: 'insensitive' as const } }] : []),
        ],
      },
      include: { religion: true },
      take,
    });

    return results.map((t) => ({
      type: 'temple',
      id: t.id,
      title: t.name,
      subtitle: `${t.nameEn ?? ''} - ${t.country}`,
      descriptionSnippet: snippet(t.description),
      image: t.imageUrl,
      religion: {
        name: t.religion.name,
        symbol: t.religion.symbol,
        color: t.religion.color,
      },
    }));
  }

  private async searchPatriarchs(
    q: string,
    take: number,
    religionId?: string,
  ): Promise<SearchResultItem[]> {
    const results = await this.prisma.patriarch.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { nameEn: { contains: q, mode: 'insensitive' } },
              { biography: { contains: q, mode: 'insensitive' } },
              { coreTeaching: { contains: q, mode: 'insensitive' } },
              { title: { contains: q, mode: 'insensitive' } },
              { religion: { name: { contains: q, mode: 'insensitive' } } },
            ],
          },
          ...(religionId ? [{ religionId }] : []),
        ],
      },
      include: { religion: true },
      take,
    });

    return results.map((p) => ({
      type: 'patriarch',
      id: p.id,
      title: p.name,
      subtitle: p.title ?? p.nameEn,
      descriptionSnippet: snippet(p.biography),
      image: p.imageUrl,
      religion: {
        name: p.religion.name,
        symbol: p.religion.symbol,
        color: p.religion.color,
      },
    }));
  }

  private async searchTeachings(
    q: string,
    take: number,
    religionId?: string,
  ): Promise<SearchResultItem[]> {
    const results = await this.prisma.teaching.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { originalText: { contains: q, mode: 'insensitive' } },
              { sourceText: { contains: q, mode: 'insensitive' } },
              { translationCn: { contains: q, mode: 'insensitive' } },
              { religion: { name: { contains: q, mode: 'insensitive' } } },
            ],
          },
          ...(religionId ? [{ religionId }] : []),
        ],
      },
      include: { religion: true },
      take,
    });

    return results.map((t) => ({
      type: 'teaching',
      id: t.id,
      title: t.name,
      subtitle: t.sourceText,
      descriptionSnippet: snippet(t.originalText),
      image: null,
      religion: {
        name: t.religion.name,
        symbol: t.religion.symbol,
        color: t.religion.color,
      },
    }));
  }

  private async searchSeals(q: string, take: number): Promise<SearchResultItem[]> {
    const results = await this.prisma.seal.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { poem: { contains: q, mode: 'insensitive' } },
          { essence: { contains: q, mode: 'insensitive' } },
          { practice: { contains: q, mode: 'insensitive' } },
          { vow: { contains: q, mode: 'insensitive' } },
        ],
      },
      take,
    });

    return results.map((s) => ({
      type: 'seal',
      id: s.id,
      title: `第${s.id}印 · ${s.name}`,
      subtitle: s.series,
      descriptionSnippet: snippet(s.essence),
      image: null,
      religion: null,
    }));
  }
}
