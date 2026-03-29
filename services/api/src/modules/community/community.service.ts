import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { PhotoQueryDto } from './dto/photo-query.dto';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  nickname: string;
  avatar: string | null;
  count: number;
}

export interface PhotoItem {
  id: string;
  url: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  entityType: string | null;
  entityId: string | null;
  createdAt: Date;
}

export interface TrendingResult {
  hotGuides: Array<{
    id: string;
    title: string;
    coverImage: string | null;
    viewCount: number;
    likeCount: number;
    score: number;
    userId: string;
    userName: string;
    userAvatar: string | null;
    publishedAt: Date | null;
  }>;
  hotQuestions: Array<{
    id: string;
    title: string;
    viewCount: number;
    answerCount: number;
    score: number;
    userId: string;
    userName: string;
    userAvatar: string | null;
    createdAt: Date;
  }>;
}

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getLeaderboard(query: LeaderboardQueryDto): Promise<LeaderboardEntry[]> {
    const type = query.type ?? 'guides';
    const period = query.period ?? 'all';
    const cacheKey = `community:leaderboard:${type}:${period}`;
    const ttl = 30 * 60; // 30 minutes

    const cached = await this.redis.getJSON<LeaderboardEntry[]>(cacheKey);
    if (cached) return cached;

    const periodFilter = this.buildPeriodFilter(period);

    let result: LeaderboardEntry[];

    if (type === 'guides') {
      result = await this.getGuideLeaderboard(periodFilter);
    } else if (type === 'reviews') {
      result = await this.getReviewLeaderboard(periodFilter);
    } else {
      result = await this.getTripLeaderboard(periodFilter);
    }

    await this.redis.setJSON(cacheKey, result, ttl);
    return result;
  }

  private buildPeriodFilter(period: string): Date | null {
    const now = new Date();
    if (period === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    if (period === 'month') {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return d;
    }
    return null; // 'all'
  }

  private async getGuideLeaderboard(since: Date | null): Promise<LeaderboardEntry[]> {
    const where: Record<string, unknown> = { status: 'PUBLISHED' };
    if (since) where['publishedAt'] = { gte: since };

    const rows = await this.prisma.guide.groupBy({
      by: ['userId'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    return this.enrichLeaderboardRows(rows, '_count', 'id');
  }

  private async getReviewLeaderboard(since: Date | null): Promise<LeaderboardEntry[]> {
    const where: Record<string, unknown> = {};
    if (since) where['createdAt'] = { gte: since };

    const rows = await this.prisma.review.groupBy({
      by: ['userId'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    return this.enrichLeaderboardRows(rows, '_count', 'id');
  }

  private async getTripLeaderboard(since: Date | null): Promise<LeaderboardEntry[]> {
    const where: Record<string, unknown> = { status: 'COMPLETED' };
    if (since) where['updatedAt'] = { gte: since };

    const rows = await this.prisma.trip.groupBy({
      by: ['userId'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    return this.enrichLeaderboardRows(rows, '_count', 'id');
  }

  private async enrichLeaderboardRows(
    rows: Array<{ userId: string; _count: { id: number } }>,
    _countKey: string,
    _idKey: string,
  ): Promise<LeaderboardEntry[]> {
    if (rows.length === 0) return [];

    const userIds = rows.map((r) => r.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, nickname: true, avatar: true },
      take: 50,
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return rows.map((row, index) => {
      const user = userMap.get(row.userId);
      return {
        rank: index + 1,
        userId: row.userId,
        nickname: user?.nickname ?? 'Unknown',
        avatar: user?.avatar ?? null,
        count: row._count.id,
      };
    });
  }

  async getTrending(): Promise<TrendingResult> {
    const cacheKey = 'community:trending';
    const ttl = 15 * 60; // 15 minutes

    const cached = await this.redis.getJSON<TrendingResult>(cacheKey);
    if (cached) return cached;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [rawGuides, rawQuestions] = await Promise.all([
      this.prisma.guide.findMany({
        where: { status: 'PUBLISHED', publishedAt: { gte: sevenDaysAgo } },
        select: {
          id: true,
          title: true,
          coverImage: true,
          viewCount: true,
          likeCount: true,
          publishedAt: true,
          userId: true,
          user: { select: { nickname: true, avatar: true } },
        },
        orderBy: { viewCount: 'desc' },
        take: 50,
      }),
      this.prisma.question.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: {
          id: true,
          title: true,
          viewCount: true,
          answerCount: true,
          createdAt: true,
          userId: true,
        },
        orderBy: { viewCount: 'desc' },
        take: 50,
      }),
    ]);

    // Batch-load users for questions (Question has no User relation)
    const questionUserIds = [...new Set(rawQuestions.map((q) => q.userId))];
    const questionUsers = await this.prisma.user.findMany({
      where: { id: { in: questionUserIds } },
      select: { id: true, nickname: true, avatar: true },
      take: 50,
    });
    const questionUserMap = new Map(questionUsers.map((u) => [u.id, u]));

    const hotGuides = rawGuides
      .map((g) => ({
        id: g.id,
        title: g.title,
        coverImage: g.coverImage,
        viewCount: g.viewCount,
        likeCount: g.likeCount,
        score: g.viewCount + g.likeCount * 3,
        userId: g.userId,
        userName: g.user.nickname,
        userAvatar: g.user.avatar,
        publishedAt: g.publishedAt,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const hotQuestions = rawQuestions
      .map((q) => {
        const u = questionUserMap.get(q.userId);
        return {
          id: q.id,
          title: q.title,
          viewCount: q.viewCount,
          answerCount: q.answerCount,
          score: q.viewCount + q.answerCount * 5,
          userId: q.userId,
          userName: u?.nickname ?? 'Unknown',
          userAvatar: u?.avatar ?? null,
          createdAt: q.createdAt,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const result: TrendingResult = { hotGuides, hotQuestions };
    await this.redis.setJSON(cacheKey, result, ttl);
    return result;
  }

  async getPhotos(query: PhotoQueryDto): Promise<{
    items: PhotoItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Filter by entity if provided
    if (query.entityType) {
      where['targetType'] = query.entityType;
    }
    if (query.entityId) {
      where['targetId'] = query.entityId;
    }

    // Reviews with non-empty images
    where['images'] = { isEmpty: false };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        select: {
          id: true,
          images: true,
          targetType: true,
          targetId: true,
          createdAt: true,
          userId: true,
          user: { select: { nickname: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    // Flatten review images into photo items
    const items: PhotoItem[] = reviews.flatMap((r) =>
      r.images.map((url, idx) => ({
        id: `${r.id}-${idx}`,
        url,
        userId: r.userId,
        userName: r.user.nickname,
        userAvatar: r.user.avatar,
        entityType: r.targetType,
        entityId: r.targetId,
        createdAt: r.createdAt,
      })),
    );

    return { items, total, page, limit };
  }

  async getFeaturedPhotos(): Promise<PhotoItem[]> {
    const reviews = await this.prisma.review.findMany({
      where: { images: { isEmpty: false } },
      select: {
        id: true,
        images: true,
        targetType: true,
        targetId: true,
        createdAt: true,
        userId: true,
        helpfulCount: true,
        user: { select: { nickname: true, avatar: true } },
      },
      orderBy: { helpfulCount: 'desc' },
      take: 20,
    });

    return reviews.flatMap((r) =>
      r.images.map((url, idx) => ({
        id: `${r.id}-${idx}`,
        url,
        userId: r.userId,
        userName: r.user.nickname,
        userAvatar: r.user.avatar,
        entityType: r.targetType,
        entityId: r.targetId,
        createdAt: r.createdAt,
      })),
    );
  }
}
