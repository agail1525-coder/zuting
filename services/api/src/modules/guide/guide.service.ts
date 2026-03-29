import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { GuideQueryDto } from './dto/guide-query.dto';

@Injectable()
export class GuideService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: GuideQueryDto) {
    const { page = 1, limit = 20, tag, sort = 'latest' } = params;
    const take = Math.min(limit, 50);

    const where: Prisma.GuideWhereInput = {
      status: 'PUBLISHED',
    };

    if (tag) {
      where.tags = { has: tag };
    }

    let orderBy: Prisma.GuideOrderByWithRelationInput;
    switch (sort) {
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
      case 'mostLiked':
        orderBy = { likeCount: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [data, total] = await Promise.all([
      this.prisma.guide.findMany({
        where,
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy,
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.guide.count({ where }),
    ]);

    return { data, total, page, limit: take };
  }

  async create(userId: string, dto: CreateGuideDto) {
    return this.prisma.guide.create({
      data: {
        userId,
        title: dto.title,
        content: dto.content,
        coverImage: dto.coverImage,
        entityType: dto.entityType,
        entityId: dto.entityId,
        tags: dto.tags ?? [],
        status: 'DRAFT',
      },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
  }

  async findOne(id: string) {
    const guide = await this.prisma.guide.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
    if (!guide) throw new NotFoundException(`Guide ${id} not found`);

    // Increment viewCount (fire-and-forget, non-blocking)
    void this.prisma.guide.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return guide;
  }

  async update(id: string, userId: string, dto: UpdateGuideDto) {
    const guide = await this.prisma.guide.findUnique({ where: { id } });
    if (!guide) throw new NotFoundException(`Guide ${id} not found`);
    if (guide.userId !== userId)
      throw new ForbiddenException('You can only edit your own guides');

    return this.prisma.guide.update({
      where: { id },
      data: dto,
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
  }

  async remove(id: string, userId: string) {
    const guide = await this.prisma.guide.findUnique({ where: { id } });
    if (!guide) throw new NotFoundException(`Guide ${id} not found`);
    if (guide.userId !== userId)
      throw new ForbiddenException('You can only delete your own guides');

    return this.prisma.guide.delete({ where: { id } });
  }

  async publish(id: string, userId: string) {
    const guide = await this.prisma.guide.findUnique({ where: { id } });
    if (!guide) throw new NotFoundException(`Guide ${id} not found`);
    if (guide.userId !== userId)
      throw new ForbiddenException('You can only publish your own guides');

    return this.prisma.guide.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
  }

  async findComments(
    guideId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const take = Math.min(limit, 50);

    // Verify guide exists
    const guide = await this.prisma.guide.findUnique({ where: { id: guideId }, select: { id: true } });
    if (!guide) throw new NotFoundException(`Guide ${guideId} not found`);

    const [data, total] = await Promise.all([
      this.prisma.guideComment.findMany({
        where: { guideId },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.guideComment.count({ where: { guideId } }),
    ]);

    return { data, total, page, limit: take };
  }

  async addComment(guideId: string, userId: string, content: string) {
    const guide = await this.prisma.guide.findUnique({ where: { id: guideId }, select: { id: true } });
    if (!guide) throw new NotFoundException(`Guide ${guideId} not found`);

    const [comment] = await this.prisma.$transaction([
      this.prisma.guideComment.create({
        data: { guideId, userId, content },
      }),
      this.prisma.guide.update({
        where: { id: guideId },
        data: { commentCount: { increment: 1 } },
      }),
    ]);

    return comment;
  }

  async like(guideId: string, userId: string) {
    const guide = await this.prisma.guide.findUnique({ where: { id: guideId }, select: { id: true } });
    if (!guide) throw new NotFoundException(`Guide ${guideId} not found`);

    await this.prisma.$transaction([
      this.prisma.guideLike.upsert({
        where: { guideId_userId: { guideId, userId } },
        create: { guideId, userId },
        update: {},
      }),
      this.prisma.guide.update({
        where: { id: guideId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);

    return { liked: true };
  }

  async unlike(guideId: string, userId: string) {
    const guide = await this.prisma.guide.findUnique({ where: { id: guideId }, select: { id: true } });
    if (!guide) throw new NotFoundException(`Guide ${guideId} not found`);

    const existing = await this.prisma.guideLike.findUnique({
      where: { guideId_userId: { guideId, userId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.guideLike.delete({
          where: { guideId_userId: { guideId, userId } },
        }),
        this.prisma.guide.update({
          where: { id: guideId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
    }

    return { liked: false };
  }
}
