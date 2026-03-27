import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatriarchDto } from './dto/create-patriarch.dto';
import { UpdatePatriarchDto } from './dto/update-patriarch.dto';

@Injectable()
export class PatriarchService {
  constructor(private prisma: PrismaService) {}

  findAll(religionId?: string) {
    return this.prisma.patriarch.findMany({
      take: 100,
      where: religionId ? { religionId } : undefined,
      include: { religion: { select: { name: true, nameEn: true, slug: true, color: true } } },
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.patriarch.findUnique({
      where: { id },
      include: { religion: true },
    });
  }

  async create(dto: CreatePatriarchDto) {
    return this.prisma.patriarch.create({ data: dto });
  }

  async update(id: string, dto: UpdatePatriarchDto) {
    return this.prisma.patriarch.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.patriarch.delete({ where: { id } });
  }
}
