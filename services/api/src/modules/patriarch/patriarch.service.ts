import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatriarchDto } from './dto/create-patriarch.dto';
import { UpdatePatriarchDto } from './dto/update-patriarch.dto';

@Injectable()
export class PatriarchService {
  constructor(private prisma: PrismaService) {}

  async findAll(religionId?: string, page = 1, limit = 20, school?: string) {
    const where: Record<string, unknown> = {};
    if (religionId) where.religionId = religionId;
    if (school) where.school = school;
    const [items, total] = await Promise.all([
      this.prisma.patriarch.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          religion: { select: { name: true, nameEn: true, slug: true, color: true } },
          teacher: { select: { id: true, name: true, nameEn: true } },
          disciples: { select: { id: true, name: true, nameEn: true, generation: true } },
        },
        orderBy: [{ generation: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.patriarch.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  findById(id: string) {
    return this.prisma.patriarch.findUnique({
      where: { id },
      include: {
        religion: true,
        teacher: { select: { id: true, name: true, nameEn: true, title: true, imageUrl: true } },
        disciples: { select: { id: true, name: true, nameEn: true, title: true, generation: true, imageUrl: true, dates: true } },
      },
    });
  }

  async create(dto: CreatePatriarchDto) {
    return this.prisma.patriarch.create({
      data: dto as Parameters<typeof this.prisma.patriarch.create>[0]['data'],
    });
  }

  async update(id: string, dto: UpdatePatriarchDto) {
    return this.prisma.patriarch.update({
      where: { id },
      data: dto as Parameters<typeof this.prisma.patriarch.update>[0]['data'],
    });
  }

  async remove(id: string) {
    return this.prisma.patriarch.delete({ where: { id } });
  }
}
