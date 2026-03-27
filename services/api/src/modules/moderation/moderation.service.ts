import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create a content report — prevent duplicate from same user for same target */
  async createReport(reporterId: string, dto: CreateReportDto) {
    const existing = await this.prisma.contentReport.findFirst({
      where: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
      },
    });
    if (existing) {
      throw new ConflictException(
        'You have already reported this content',
      );
    }

    return this.prisma.contentReport.create({
      data: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason,
        description: dto.description,
      },
      include: {
        reporter: { select: { id: true, nickname: true, avatar: true } },
      },
    });
  }

  /** Admin: paginated list of reports, filterable by status */
  async findAll(page = 1, limit = 20, status?: string) {
    limit = Math.min(limit, 100);
    const where: Prisma.ContentReportWhereInput = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.contentReport.findMany({
        where,
        include: {
          reporter: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contentReport.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /** Admin: get report detail */
  async findOne(id: string) {
    const report = await this.prisma.contentReport.findUnique({
      where: { id },
      include: {
        reporter: { select: { id: true, nickname: true, avatar: true } },
        reviewer: { select: { id: true, nickname: true, avatar: true } },
      },
    });
    if (!report) throw new NotFoundException(`Report ${id} not found`);
    return report;
  }

  /** Admin: review a report — approve or dismiss */
  async review(id: string, reviewerId: string, action: string) {
    const report = await this.prisma.contentReport.findUnique({
      where: { id },
    });
    if (!report) throw new NotFoundException(`Report ${id} not found`);

    if (report.status !== 'PENDING') {
      throw new BadRequestException('Report has already been reviewed');
    }

    const status = action === 'approve' ? 'REVIEWED' : 'DISMISSED';

    const updated = await this.prisma.contentReport.update({
      where: { id },
      data: {
        status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
      include: {
        reporter: { select: { id: true, nickname: true, avatar: true } },
        reviewer: { select: { id: true, nickname: true, avatar: true } },
      },
    });

    // Future: if approved, hide the target content
    // e.g., set journal.isPublic = false

    return updated;
  }

  /** Admin: aggregate stats — count by status and reason */
  async getStats() {
    const [byStatus, byReason, total] = await Promise.all([
      this.prisma.contentReport.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.contentReport.groupBy({
        by: ['reason'],
        _count: { id: true },
      }),
      this.prisma.contentReport.count(),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const item of byStatus) {
      statusCounts[item.status] = item._count.id;
    }

    const reasonCounts: Record<string, number> = {};
    for (const item of byReason) {
      reasonCounts[item.reason] = item._count.id;
    }

    return { total, byStatus: statusCounts, byReason: reasonCounts };
  }
}
