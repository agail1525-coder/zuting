import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitPersonalInquiryDto } from './dto/submit-inquiry.dto';
import {
  ALLOWED_INQUIRY_TRANSITIONS,
  TeamInquiryStatus,
  canTransition,
} from '../team-culture/team-inquiry.state-machine';

const CATEGORY = 'PERSONAL' as const;

const sanitize = (s?: string | null) =>
  typeof s === 'string'
    ? s.replace(/<\s*\/?\s*(script|iframe|object|embed)[^>]*>/gi, '').slice(0, 8000)
    : s ?? null;

@Injectable()
export class PersonalGrowthService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Public: Themes ─────────────────────────────────────
  async listThemes(page = 1, pageSize = 12) {
    const take = Math.min(pageSize, 50);
    const skip = (page - 1) * take;
    const where = { isPublished: true, category: CATEGORY };
    const [items, total] = await Promise.all([
      this.prisma.teamCultureTheme.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.teamCultureTheme.count({ where }),
    ]);
    return { items, total, page, pageSize: take };
  }

  async getThemeBySlug(slug: string) {
    const theme = await this.prisma.teamCultureTheme.findUnique({ where: { slug } });
    if (!theme || !theme.isPublished || theme.category !== CATEGORY) {
      throw new NotFoundException('Theme not found');
    }
    return theme;
  }

  // ── Public: Cases ──────────────────────────────────────
  async listCases(page = 1, pageSize = 12) {
    const take = Math.min(pageSize, 50);
    const skip = (page - 1) * take;
    const where = { isPublished: true, category: CATEGORY };
    const [items, total] = await Promise.all([
      this.prisma.teamCase.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }],
        skip,
        take,
        include: { theme: { select: { id: true, slug: true, title: true, color: true } } },
      }),
      this.prisma.teamCase.count({ where }),
    ]);
    return { items, total, page, pageSize: take };
  }

  async getCaseBySlug(slug: string) {
    const item = await this.prisma.teamCase.findUnique({
      where: { slug },
      include: { theme: { select: { id: true, slug: true, title: true, color: true } } },
    });
    if (!item || !item.isPublished || item.category !== CATEGORY) {
      throw new NotFoundException('Case not found');
    }
    await this.prisma.teamCase.update({ where: { id: item.id }, data: { viewCount: { increment: 1 } } });
    return item;
  }

  // ── Public: Inquiry submit ─────────────────────────────
  async submitInquiry(dto: SubmitPersonalInquiryDto) {
    let themeId: string | undefined;
    if (dto.themeId) {
      const theme = await this.prisma.teamCultureTheme.findFirst({
        where: { OR: [{ id: dto.themeId }, { slug: dto.themeId }], category: CATEGORY },
        select: { id: true },
      });
      themeId = theme?.id;
    }
    return this.prisma.teamInquiry.create({
      data: {
        themeId,
        contactName: dto.contactName,
        contactRole: dto.contactRole ?? null,
        phone: dto.phone,
        email: dto.email ?? null,
        orgName: dto.orgName ?? '个人',
        headcount: dto.headcount ?? 1,
        budget: dto.budget ?? null,
        preferredAt: dto.preferredAt ? new Date(dto.preferredAt) : null,
        message: sanitize(dto.message ?? null),
        source: dto.source ?? null,
        category: CATEGORY,
      },
    });
  }

  // ── Admin ──────────────────────────────────────────────
  async adminListInquiries(status?: string, page = 1, pageSize = 20) {
    const take = Math.min(pageSize, 100);
    const skip = (page - 1) * take;
    const where = { category: CATEGORY, ...(status ? { status: status as never } : {}) };
    const [items, total] = await Promise.all([
      this.prisma.teamInquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: { theme: { select: { id: true, title: true, slug: true } } },
      }),
      this.prisma.teamInquiry.count({ where }),
    ]);
    return { items, total, page, pageSize: take };
  }

  async adminUpdateInquiryStatus(
    inquiryId: string,
    operatorId: string,
    dto: { toStatus: string; note?: string },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const inquiry = await tx.teamInquiry.findUnique({ where: { id: inquiryId } });
      if (!inquiry || inquiry.category !== CATEGORY) throw new NotFoundException('Inquiry not found');
      const from = inquiry.status as TeamInquiryStatus;
      const to = dto.toStatus as TeamInquiryStatus;
      if (!canTransition(from, to)) {
        throw new BadRequestException(
          `Illegal transition ${from} → ${to}. Allowed: ${ALLOWED_INQUIRY_TRANSITIONS[from].join(', ') || '(none)'}`,
        );
      }
      const updated = await tx.teamInquiry.update({
        where: { id: inquiryId },
        data: { status: to as never, assignedTo: inquiry.assignedTo ?? operatorId },
      });
      await tx.teamInquiryLog.create({
        data: { inquiryId, fromStatus: from as never, toStatus: to as never, operatorId, note: dto.note ?? null },
      });
      return updated;
    });
  }

  async adminUpsertTheme(dto: Record<string, unknown>) {
    const slug = dto.slug as string;
    const data = {
      title: dto.title as string,
      subtitle: (dto.subtitle as string) ?? null,
      description: sanitize(dto.description as string) ?? '',
      color: dto.color as string,
      icon: (dto.icon as string) ?? null,
      coverUrl: (dto.coverUrl as string) ?? null,
      keywords: (dto.keywords as string[]) ?? [],
      holySites: (dto.holySites as string[]) ?? [],
      routes: (dto.routes as string[]) ?? [],
      rituals: (dto.rituals as never) ?? null,
      richContent: (dto.richContent as never) ?? null,
      priceFrom: (dto.priceFrom as number) ?? null,
      durationDays: (dto.durationDays as number) ?? null,
      sortOrder: (dto.sortOrder as number) ?? 0,
      isPublished: (dto.isPublished as boolean) ?? true,
      category: CATEGORY,
    };
    return this.prisma.teamCultureTheme.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });
  }

  async adminStats() {
    const [totalInquiries, byStatus, totalCases] = await Promise.all([
      this.prisma.teamInquiry.count({ where: { category: CATEGORY } }),
      this.prisma.teamInquiry.groupBy({
        by: ['status'],
        where: { category: CATEGORY },
        _count: { id: true },
      }),
      this.prisma.teamCase.count({ where: { isPublished: true, category: CATEGORY } }),
    ]);
    return {
      totalInquiries,
      inquiriesByStatus: byStatus.map((b) => ({ status: b.status, count: b._count.id })),
      totalCases,
    };
  }
}
