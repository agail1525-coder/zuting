import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMediaDto) {
    return this.prisma.mediaContent.create({
      data: {
        entityType: dto.entityType,
        entityId: dto.entityId,
        mediaType: dto.mediaType,
        title: dto.title,
        url: dto.url,
        description: dto.description,
        thumbnailUrl: dto.thumbnailUrl,
        duration: dto.duration,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async findAll(params: {
    entityType?: string;
    entityId?: string;
    mediaType?: string;
    page?: number;
    limit?: number;
  }) {
    const { entityType, entityId, mediaType, page = 1, limit = 20 } = params;
    const take = Math.min(limit, 100);
    const where: Prisma.MediaContentWhereInput = {
      isActive: true,
    };
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (mediaType) where.mediaType = mediaType;

    const [data, total] = await Promise.all([
      this.prisma.mediaContent.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.mediaContent.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const media = await this.prisma.mediaContent.findUnique({
      where: { id },
    });
    if (!media) throw new NotFoundException(`Media content ${id} not found`);
    return media;
  }

  async update(id: string, dto: UpdateMediaDto) {
    const media = await this.prisma.mediaContent.findUnique({ where: { id } });
    if (!media) throw new NotFoundException(`Media content ${id} not found`);

    return this.prisma.mediaContent.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const media = await this.prisma.mediaContent.findUnique({ where: { id } });
    if (!media) throw new NotFoundException(`Media content ${id} not found`);

    return this.prisma.mediaContent.delete({ where: { id } });
  }
}
