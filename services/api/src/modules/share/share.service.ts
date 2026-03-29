import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShareDto } from './dto/create-share.dto';

@Injectable()
export class ShareService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateShareDto, userId?: string) {
    return this.prisma.share.create({
      data: {
        platform: dto.platform,
        entityType: dto.entityType,
        entityId: dto.entityId,
        userId: userId ?? dto.userId ?? null,
      },
    });
  }

  async getStats() {
    const byPlatform = await this.prisma.share.groupBy({
      by: ['platform'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    });

    const byEntityType = await this.prisma.share.groupBy({
      by: ['entityType'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    });

    const total = await this.prisma.share.count();

    return {
      total,
      byPlatform: byPlatform.map((row) => ({
        platform: row.platform,
        count: row._count.id,
      })),
      byEntityType: byEntityType.map((row) => ({
        entityType: row.entityType,
        count: row._count.id,
      })),
    };
  }

  async getPopular() {
    const results = await this.prisma.share.groupBy({
      by: ['entityType', 'entityId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    return results.map((row) => ({
      entityType: row.entityType,
      entityId: row.entityId,
      shareCount: row._count.id,
    }));
  }
}
