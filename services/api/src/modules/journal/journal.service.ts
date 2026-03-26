import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';

@Injectable()
export class JournalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateJournalDto) {
    return this.prisma.journalEntry.create({
      data: {
        userId: dto.userId,
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
  }) {
    const { userId, tripId, isPublic, page = 1, limit = 20 } = params;
    const where: any = {};
    if (userId) where.userId = userId;
    if (tripId) where.tripId = tripId;
    if (isPublic !== undefined) where.isPublic = isPublic;

    const [data, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where,
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
          trip: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.journalEntry.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const entry = await this.prisma.journalEntry.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
        trip: { select: { id: true, title: true, status: true } },
      },
    });
    if (!entry) throw new NotFoundException(`Journal entry ${id} not found`);
    return entry;
  }

  async update(id: string, dto: UpdateJournalDto) {
    const entry = await this.prisma.journalEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException(`Journal entry ${id} not found`);

    return this.prisma.journalEntry.update({
      where: { id },
      data: dto,
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
        trip: { select: { id: true, title: true } },
      },
    });
  }

  async remove(id: string) {
    const entry = await this.prisma.journalEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException(`Journal entry ${id} not found`);

    return this.prisma.journalEntry.delete({ where: { id } });
  }
}
