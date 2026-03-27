import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeachingDto } from './dto/create-teaching.dto';
import { UpdateTeachingDto } from './dto/update-teaching.dto';

@Injectable()
export class TeachingService {
  constructor(private prisma: PrismaService) {}

  findAll(religionId?: string) {
    return this.prisma.teaching.findMany({
      take: 100,
      where: religionId ? { religionId } : undefined,
      include: { religion: { select: { name: true, nameEn: true, slug: true, color: true } } },
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.teaching.findUnique({
      where: { id },
      include: { religion: true },
    });
  }

  async create(dto: CreateTeachingDto) {
    return this.prisma.teaching.create({ data: dto });
  }

  async update(id: string, dto: UpdateTeachingDto) {
    return this.prisma.teaching.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.teaching.delete({ where: { id } });
  }
}
