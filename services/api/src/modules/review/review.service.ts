import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

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
    const where: any = {};
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /** Get current user's reviews */
  async findMyReviews(userId: string, page = 1, limit = 20) {
    const where = { userId };

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /** Get stats: average rating + count by star */
  async getStats(targetType: string, targetId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { targetType, targetId },
      select: { rating: true },
    });

    const total = reviews.length;
    if (total === 0) {
      return {
        averageRating: 0,
        totalCount: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      distribution[r.rating]++;
    }

    return {
      averageRating: Math.round((sum / total) * 10) / 10,
      totalCount: total,
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
}
