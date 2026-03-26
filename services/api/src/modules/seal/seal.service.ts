import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SealSeries } from '@prisma/client';

@Injectable()
export class SealService {
  constructor(private prisma: PrismaService) {}

  findAll(series?: SealSeries) {
    return this.prisma.seal.findMany({
      where: series ? { series } : undefined,
      orderBy: { id: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.seal.findUnique({ where: { id } });
  }
}
