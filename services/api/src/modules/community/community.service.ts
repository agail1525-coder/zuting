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

    // ===== Review 来源 =====
    const reviewWhere: Record<string, unknown> = { images: { isEmpty: false } };
    if (query.entityType) reviewWhere['targetType'] = query.entityType;
    if (query.entityId) reviewWhere['targetId'] = query.entityId;

    // ===== Guide 来源（coverImage 非空的已发布游记）=====
    const guideWhere: Record<string, unknown> = {
      status: 'PUBLISHED',
      coverImage: { not: null },
    };
    if (query.entityType) guideWhere['entityType'] = query.entityType;
    if (query.entityId) guideWhere['entityId'] = query.entityId;

    // 并行查两张表（每表取 page*limit 条，合并后再分页）
    const fetchCount = page * limit;
    const [reviews, guides, reviewCount, guideCount] = await Promise.all([
      this.prisma.review.findMany({
        where: reviewWhere,
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
        take: fetchCount,
      }),
      this.prisma.guide.findMany({
        where: guideWhere,
        select: {
          id: true,
          coverImage: true,
          entityType: true,
          entityId: true,
          createdAt: true,
          userId: true,
          user: { select: { nickname: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: fetchCount,
      }),
      this.prisma.review.count({ where: reviewWhere }),
      this.prisma.guide.count({ where: guideWhere }),
    ]);

    // 合并为 PhotoItem 流
    const reviewItems: PhotoItem[] = reviews.flatMap((r) =>
      r.images.map((url, idx) => ({
        id: `r-${r.id}-${idx}`,
        url,
        userId: r.userId,
        userName: r.user.nickname,
        userAvatar: r.user.avatar,
        entityType: r.targetType,
        entityId: r.targetId,
        createdAt: r.createdAt,
      })),
    );
    const guideItems: PhotoItem[] = guides
      .filter((g) => !!g.coverImage)
      .map((g) => ({
        id: `g-${g.id}`,
        url: g.coverImage as string,
        userId: g.userId,
        userName: g.user.nickname,
        userAvatar: g.user.avatar,
        entityType: g.entityType,
        entityId: g.entityId,
        createdAt: g.createdAt,
      }));

    // 合并 + 按时间倒序 + 分页
    const merged = [...reviewItems, ...guideItems].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const start = (page - 1) * limit;
    const items = merged.slice(start, start + limit);

    return {
      items,
      total: reviewCount + guideCount,
      page,
      limit,
    };
  }

  async getFeaturedPhotos(): Promise<PhotoItem[]> {
    // Top-20 by helpfulCount (reviews) + top-20 by likeCount (guides)
    const [reviews, guides] = await Promise.all([
      this.prisma.review.findMany({
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
      }),
      this.prisma.guide.findMany({
        where: {
          status: 'PUBLISHED',
          coverImage: { not: null },
        },
        select: {
          id: true,
          coverImage: true,
          entityType: true,
          entityId: true,
          createdAt: true,
          userId: true,
          likeCount: true,
          user: { select: { nickname: true, avatar: true } },
        },
        orderBy: { likeCount: 'desc' },
        take: 20,
      }),
    ]);

    const reviewItems: PhotoItem[] = reviews.flatMap((r) =>
      r.images.map((url, idx) => ({
        id: `r-${r.id}-${idx}`,
        url,
        userId: r.userId,
        userName: r.user.nickname,
        userAvatar: r.user.avatar,
        entityType: r.targetType,
        entityId: r.targetId,
        createdAt: r.createdAt,
      })),
    );
    const guideItems: PhotoItem[] = guides
      .filter((g) => !!g.coverImage)
      .map((g) => ({
        id: `g-${g.id}`,
        url: g.coverImage as string,
        userId: g.userId,
        userName: g.user.nickname,
        userAvatar: g.user.avatar,
        entityType: g.entityType,
        entityId: g.entityId,
        createdAt: g.createdAt,
      }));

    return [...reviewItems, ...guideItems].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
}
