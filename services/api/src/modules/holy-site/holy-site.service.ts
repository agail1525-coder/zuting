import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHolySiteDto } from './dto/create-holy-site.dto';
import { UpdateHolySiteDto } from './dto/update-holy-site.dto';

@Injectable()
export class HolySiteService {
  constructor(private prisma: PrismaService) {}

  findAll(religionId?: string) {
    return this.prisma.holySite.findMany({
      take: 100,
      where: religionId ? { religionId } : undefined,
      include: { religion: { select: { name: true, nameEn: true, slug: true, color: true } } },
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.holySite.findUnique({
      where: { id },
      include: { religion: true },
    });
  }

  async create(dto: CreateHolySiteDto) {
    return this.prisma.holySite.create({ data: dto });
  }

  async update(id: string, dto: UpdateHolySiteDto) {
    return this.prisma.holySite.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.holySite.delete({ where: { id } });
  }
}
