import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SealSeries } from '@prisma/client';
import { CreateSealDto } from './dto/create-seal.dto';
import { UpdateSealDto } from './dto/update-seal.dto';

@Injectable()
export class SealService {
  constructor(private prisma: PrismaService) {}

  async findAll(series?: SealSeries, page = 1, limit = 20) {
    const where = series ? { series } : undefined;
    const [items, total] = await Promise.all([
      this.prisma.seal.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.seal.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  findById(id: number) {
    return this.prisma.seal.findUnique({ where: { id } });
  }

  create(dto: CreateSealDto) {
    return this.prisma.seal.create({
      data: {
        id: dto.id,
        name: dto.name,
        series: dto.series as SealSeries,
        poem: dto.poem,
        essence: dto.essence,
        practice: dto.practice,
        vow: dto.vow,
        color: dto.color,
      },
    });
  }

  update(id: number, dto: UpdateSealDto) {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.series !== undefined) data.series = dto.series as SealSeries;
    if (dto.poem !== undefined) data.poem = dto.poem;
    if (dto.essence !== undefined) data.essence = dto.essence;
    if (dto.practice !== undefined) data.practice = dto.practice;
    if (dto.vow !== undefined) data.vow = dto.vow;
    if (dto.color !== undefined) data.color = dto.color;
    return this.prisma.seal.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.seal.delete({ where: { id } });
  }
}
