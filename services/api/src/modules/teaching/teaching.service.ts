import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeachingDto } from './dto/create-teaching.dto';
import { UpdateTeachingDto } from './dto/update-teaching.dto';

@Injectable()
export class TeachingService {
  constructor(private prisma: PrismaService) {}

  async findAll(religionId?: string, page = 1, limit = 20) {
    const where = religionId ? { religionId } : undefined;
    const [items, total] = await Promise.all([
      this.prisma.teaching.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { religion: { select: { name: true, nameEn: true, slug: true, color: true } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.teaching.count({ where }),
    ]);
    return { items, total, page, limit };
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
