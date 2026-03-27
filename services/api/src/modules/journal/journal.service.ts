import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';

@Injectable()
export class JournalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateJournalDto) {
    return this.prisma.journalEntry.create({
      data: {
        userId,
        tripId: dto.tripId,
        siteId: dto.siteId,
        title: dto.title,
        content: dto.content,
        images: dto.images ?? [],
        mood: dto.mood,
        isPublic: dto.isPublic ?? false,
      },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
        trip: { select: { id: true, title: true } },
      },
    });
  }

  async findAll(params: {
    userId?: string;
    tripId?: string;
    isPublic?: boolean;
    page?: number;
    limit?: number;
    currentUserId?: string;
  }) {
    const { userId, tripId, isPublic, page = 1, limit = 20, currentUserId } = params;
    const take = Math.min(limit, 100);
    const where: Prisma.JournalEntryWhereInput = {};
    if (userId) where.userId = userId;
    if (tripId) where.tripId = tripId;
    // IDOR防护(R-68): 非本人查看时强制只显示公开日志
    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    } else if (!currentUserId || currentUserId !== userId) {
      where.isPublic = true;
    }

    const [data, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where,
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
          trip: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.journalEntry.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string, requestUserId?: string) {
    const entry = await this.prisma.journalEntry.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
        trip: { select: { id: true, title: true, status: true } },
      },
    });
    if (!entry) throw new NotFoundException(`Journal entry ${id} not found`);
    if (!entry.isPublic && entry.userId !== requestUserId) {
      throw new ForbiddenException('You cannot access this private journal entry');
    }
    return entry;
  }

  async update(id: string, userId: string, dto: UpdateJournalDto) {
    const entry = await this.prisma.journalEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException(`Journal entry ${id} not found`);
    if (entry.userId !== userId) throw new ForbiddenException('You can only edit your own journal entries');

    return this.prisma.journalEntry.update({
      where: { id },
      data: dto,
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
        trip: { select: { id: true, title: true } },
      },
    });
  }

  async remove(id: string, userId: string) {
    const entry = await this.prisma.journalEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException(`Journal entry ${id} not found`);
    if (entry.userId !== userId) throw new ForbiddenException('You can only delete your own journal entries');

    return this.prisma.journalEntry.delete({ where: { id } });
  }
}
