import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTempleDto } from './dto/create-temple.dto';
import { UpdateTempleDto } from './dto/update-temple.dto';

@Injectable()
export class TempleService {
  constructor(private prisma: PrismaService) {}

  findAll(religionId?: string) {
    return this.prisma.temple.findMany({
      where: religionId ? { religionId } : undefined,
      include: { religion: { select: { name: true, nameEn: true, slug: true, color: true } } },
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.temple.findUnique({
      where: { id },
      include: { religion: true },
    });
  }

  async create(dto: CreateTempleDto) {
    return this.prisma.temple.create({ data: dto });
  }

  async update(id: string, dto: UpdateTempleDto) {
    return this.prisma.temple.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.temple.delete({ where: { id } });
  }
}
