import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FestivalService {
  constructor(private readonly prisma: PrismaService) {}

  async listByDate(dateStr: string, tradition?: string) {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return [];
    }
    const month = date.getMonth() + 1;
    const day = date.getDate();
    // 只匹配 SOLAR 日历的公历日期; 农历/伊斯兰历等留给前端按 tradition 全量浏览
    const solarHits = await this.prisma.culturalFestival.findMany({
      where: {
        calendar: 'SOLAR',
        month,
        day,
        ...(tradition ? { tradition } : {}),
      },
      orderBy: { sortOrder: 'asc' },
    });
    return solarHits;
  }

  async listAll(tradition?: string) {
    return this.prisma.culturalFestival.findMany({
      where: tradition ? { tradition } : {},
      orderBy: [{ tradition: 'asc' }, { month: 'asc' }, { day: 'asc' }],
      take: 200,
    });
  }

  async getBySlug(slug: string) {
    const f = await this.prisma.culturalFestival.findUnique({ where: { slug } });
    if (!f) throw new NotFoundException('节日不存在');
    return f;
  }
}
