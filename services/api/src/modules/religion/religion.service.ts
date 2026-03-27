import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReligionDto } from './dto/create-religion.dto';
import { UpdateReligionDto } from './dto/update-religion.dto';

@Injectable()
export class ReligionService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.religion.findMany({
      take: 100,
      orderBy: { name: 'asc' },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.religion.findUnique({
      where: { slug },
      include: {
        holySites: true,
        temples: true,
        patriarchs: true,
        teachings: true,
      },
    });
  }

  findById(id: string) {
    return this.prisma.religion.findUnique({
      where: { id },
      include: {
        holySites: true,
        temples: true,
        patriarchs: true,
        teachings: true,
      },
    });
  }

  async create(dto: CreateReligionDto) {
    return this.prisma.religion.create({ data: dto });
  }

  async update(id: string, dto: UpdateReligionDto) {
    return this.prisma.religion.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.religion.delete({ where: { id } });
  }
}
