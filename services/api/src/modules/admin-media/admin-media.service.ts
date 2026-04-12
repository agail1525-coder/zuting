import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { Prisma } from '@prisma/client';
import {
  AiGenerateImageDto,
  CreateMediaAssetDto,
  ListMediaQueryDto,
  UpdateMediaAssetDto,
  type MediaTypeValue,
} from './dto/admin-media.dto';

@Injectable()
export class AdminMediaService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q: ListMediaQueryDto) {
    const page = Math.max(1, parseInt(q.page ?? '1', 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(q.pageSize ?? '30', 10) || 30));
    const where: Prisma.MediaAssetWhereInput = {};
    if (q.type) where.type = q.type as MediaTypeValue;
    if (q.folder) where.folder = q.folder;
    if (q.tag) where.tags = { has: q.tag };
    if (q.q) {
      where.OR = [
        { altText: { contains: q.q, mode: 'insensitive' } },
        { description: { contains: q.q, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.mediaAsset.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async create(dto: CreateMediaAssetDto, uploadedBy: string) {
    return this.prisma.mediaAsset.create({
      data: {
        url: dto.url,
        type: (dto.type ?? 'IMAGE') as MediaTypeValue,
        width: dto.width,
        height: dto.height,
        size: dto.size,
        hash: dto.hash,
        altText: dto.altText,
        description: dto.description,
        tags: dto.tags ?? [],
        aiGenerated: dto.aiGenerated ?? false,
        folder: dto.folder ?? 'default',
        uploadedBy,
      },
    });
  }

  async findOne(id: string) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException(`MediaAsset ${id} not found`);
    return asset;
  }

  async update(id: string, dto: UpdateMediaAssetDto) {
    await this.findOne(id);
    return this.prisma.mediaAsset.update({
      where: { id },
      data: {
        altText: dto.altText,
        description: dto.description,
        tags: dto.tags,
        folder: dto.folder,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.mediaAsset.delete({ where: { id } });
  }

  async aiDescribe(id: string) {
    const asset = await this.findOne(id);
    // Placeholder: W5 接入多模态模型
    const altText = `AI alt for ${asset.url}`;
    const description = `AI description for ${asset.url}`;
    return this.prisma.mediaAsset.update({
      where: { id },
      data: { altText, description },
    });
  }

  async aiGenerate(dto: AiGenerateImageDto, uploadedBy: string) {
    // Placeholder: W5 接入 SD/SDXL
    const url = `https://placehold.co/1024x768?text=${encodeURIComponent(dto.prompt.slice(0, 30))}`;
    return this.prisma.mediaAsset.create({
      data: {
        url,
        type: 'IMAGE',
        altText: dto.prompt.slice(0, 200),
        description: dto.prompt,
        aiGenerated: true,
        uploadedBy,
        folder: 'ai-generated',
      },
    });
  }

  async getReferences(id: string) {
    const asset = await this.findOne(id);
    return { id, references: asset.references ?? [] };
  }
}
