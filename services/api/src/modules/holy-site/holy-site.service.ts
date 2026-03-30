import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHolySiteDto } from './dto/create-holy-site.dto';
import { UpdateHolySiteDto } from './dto/update-holy-site.dto';

@Injectable()
export class HolySiteService {
  constructor(private prisma: PrismaService) {}

  async findAll(religionId?: string, page = 1, limit = 20) {
    const where = religionId ? { religionId } : undefined;
    const [items, total] = await Promise.all([
      this.prisma.holySite.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { religion: { select: { name: true, nameEn: true, slug: true, color: true } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.holySite.count({ where }),
    ]);
    return { items, total, page, limit };
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
