import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { CreateReplyDto } from './dto/create-reply.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create a review — one per user+target */
  async create(userId: string, dto: CreateReviewDto) {
    // Check for duplicate review
    const existing = await this.prisma.review.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: dto.targetType,
          targetId: dto.targetId,
        },
      },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this target');
    }

    // Validate ownership / visit based on target type
    if (dto.targetType === 'TRIP') {
      const trip = await this.prisma.trip.findUnique({
        where: { id: dto.targetId },
      });
      if (!trip) throw new NotFoundException(`Trip ${dto.targetId} not found`);
      if (trip.userId !== userId) {
        throw new ForbiddenException('You can only review your own trips');
      }
    }

    return this.prisma.review.create({
      data: {
        userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        rating: dto.rating,
        content: dto.content,
        images: dto.images ?? [],
      },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
  }

  /** List reviews for a given target with pagination */
  async findAll(params: {
    targetType: string;
    targetId: string;
    page?: number;
    limit?: number;
  }) {
    const { targetType, targetId, page = 1, limit = 20 } = params;
    const take = Math.min(limit, 100);
    const where: Prisma.ReviewWhereInput = {};
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
          replies: {
            include: { user: { select: { id: true, nickname: true, avatar: true } } },
            orderBy: { createdAt: 'asc' },
          },
          _count: { select: { votes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.review.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /** Admin: list all reviews with optional status filter */
  async findAllAdmin(params: {
    page?: number;
    limit?: number;
    targetType?: string;
    status?: string;
  }) {
    const { page = 1, limit = 20, targetType, status } = params;
    const take = Math.min(limit, 100);
    const where: Prisma.ReviewWhereInput = {};
    if (targetType) where.targetType = targetType;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
          replies: {
            include: { user: { select: { id: true, nickname: true, avatar: true } } },
            orderBy: { createdAt: 'asc' as const },
          },
          _count: { select: { votes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.review.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /** Admin: moderate a review (approve/reject/hide) */
  async moderate(id: string, dto: ModerateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException(`Review ${id} not found`);

    return this.prisma.review.update({
      where: { id },
      data: { status: dto.status },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
  }

  /** Get current user's reviews */
  async findMyReviews(userId: string, page = 1, limit = 20) {
    const take = Math.min(limit, 100);
    const where = { userId };

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.review.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /** Get stats: average rating + count by star */
  async getStats(targetType: string, targetId: string) {
    const where = { targetType, targetId };

    const [aggregate, groups] = await Promise.all([
      this.prisma.review.aggregate({
        where,
        _avg: { rating: true },
        _count: { _all: true },
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where,
        _count: { _all: true },
      }),
    ]);

    const totalCount = aggregate._count._all;
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const g of groups) {
      distribution[g.rating] = g._count._all;
    }

    return {
      averageRating: totalCount > 0
        ? Math.round((aggregate._avg.rating ?? 0) * 10) / 10
        : 0,
      totalCount,
      distribution,
    };
  }

  /** Update own review */
  async update(id: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException(`Review ${id} not found`);
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    return this.prisma.review.update({
      where: { id },
      data: dto,
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
  }

  /** Delete review — owner or admin */
  async remove(id: string, userId: string, isAdmin: boolean) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException(`Review ${id} not found`);
    if (!isAdmin && review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    return this.prisma.review.delete({ where: { id } });
  }

  /** Add a reply to a review */
  async addReply(reviewId: string, userId: string, dto: CreateReplyDto) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException(`Review ${reviewId} not found`);

    return this.prisma.reviewReply.create({
      data: {
        reviewId,
        userId,
        content: dto.content,
        isOfficial: dto.isOfficial ?? false,
      },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
  }

  /** Vote a review as "helpful" */
  async addVote(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException(`Review ${reviewId} not found`);

    const existing = await this.prisma.reviewVote.findUnique({
      where: { reviewId_userId: { reviewId, userId } },
    });
    if (existing) throw new ConflictException('You have already voted for this review');

    await this.prisma.$transaction([
      this.prisma.reviewVote.create({ data: { reviewId, userId } }),
      this.prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      }),
    ]);

    return { message: 'Vote recorded' };
  }

  /** Remove vote from a review */
  async removeVote(reviewId: string, userId: string) {
    const vote = await this.prisma.reviewVote.findUnique({
      where: { reviewId_userId: { reviewId, userId } },
    });
    if (!vote) throw new NotFoundException('Vote not found');

    await this.prisma.$transaction([
      this.prisma.reviewVote.delete({ where: { reviewId_userId: { reviewId, userId } } }),
      this.prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { decrement: 1 } },
      }),
    ]);

    return { message: 'Vote removed' };
  }
}
