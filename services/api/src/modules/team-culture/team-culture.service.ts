import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitInquiryDto } from './dto/submit-inquiry.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { IssueCertificateDto } from './dto/issue-certificate.dto';
import { UpsertThemeDto } from './dto/upsert-theme.dto';
import { UpsertCaseDto } from './dto/upsert-case.dto';
import {
  ALLOWED_INQUIRY_TRANSITIONS,
  TeamInquiryStatus,
  canTransition,
} from './team-inquiry.state-machine';

const sanitize = (s?: string | null) =>
  typeof s === 'string'
    ? s.replace(/<\s*\/?\s*(script|iframe|object|embed)[^>]*>/gi, '').slice(0, 8000)
    : s ?? null;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || `team-${Date.now()}`;

@Injectable()
export class TeamCultureService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Public: Themes ─────────────────────────────────────
  async listThemes(page = 1, pageSize = 12) {
    const take = Math.min(pageSize, 50);
    const skip = (page - 1) * take;
    const [items, total] = await Promise.all([
      this.prisma.teamCultureTheme.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.teamCultureTheme.count({ where: { isPublished: true } }),
    ]);
    return { items, total, page, pageSize: take };
  }

  async getThemeBySlug(slug: string) {
    const theme = await this.prisma.teamCultureTheme.findUnique({ where: { slug } });
    if (!theme || !theme.isPublished) throw new NotFoundException('Theme not found');
    return theme;
  }

  // ── Public: Cases ──────────────────────────────────────
  async listCases(page = 1, pageSize = 12) {
    const take = Math.min(pageSize, 50);
    const skip = (page - 1) * take;
    const [items, total] = await Promise.all([
      this.prisma.teamCase.findMany({
        where: { isPublished: true },
        orderBy: [{ publishedAt: 'desc' }],
        skip,
        take,
        include: { theme: { select: { id: true, slug: true, title: true, color: true } } },
      }),
      this.prisma.teamCase.count({ where: { isPublished: true } }),
    ]);
    return { items, total, page, pageSize: take };
  }

  async getCaseBySlug(slug: string) {
    const item = await this.prisma.teamCase.findUnique({
      where: { slug },
      include: { theme: { select: { id: true, slug: true, title: true, color: true } } },
    });
    if (!item || !item.isPublished) throw new NotFoundException('Case not found');
    await this.prisma.teamCase.update({ where: { id: item.id }, data: { viewCount: { increment: 1 } } });
    return item;
  }

  // ── Public: Inquiry submit ─────────────────────────────
  async submitInquiry(dto: SubmitInquiryDto) {
    let themeId: string | undefined;
    if (dto.themeId) {
      const theme = await this.prisma.teamCultureTheme.findFirst({
        where: { OR: [{ id: dto.themeId }, { slug: dto.themeId }] },
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
        orgName: dto.orgName,
        headcount: dto.headcount,
        budget: dto.budget ?? null,
        preferredAt: dto.preferredAt ? new Date(dto.preferredAt) : null,
        message: sanitize(dto.message ?? null),
        source: dto.source ?? null,
      },
    });
  }

  // ── Teams: my teams ────────────────────────────────────
  async getMyTeams(userId: string) {
    const memberships = await this.prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          select: {
            id: true, name: true, slug: true, orgType: true, industry: true, size: true,
            logoUrl: true, coverUrl: true, city: true, ownerId: true, createdAt: true,
            _count: { select: { members: true, certificates: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
      take: 100,
    });
    return memberships.map((m) => ({ ...m.team, role: m.role }));
  }

  async createTeam(userId: string, dto: CreateTeamDto) {
    const slug = slugify(`${dto.name}-${randomBytes(2).toString('hex')}`);
    const team = await this.prisma.$transaction(async (tx) => {
      const t = await tx.team.create({
        data: {
          name: dto.name,
          slug,
          orgType: dto.orgType as never,
          industry: dto.industry ?? null,
          size: dto.size ?? 0,
          description: sanitize(dto.description ?? null),
          logoUrl: dto.logoUrl ?? null,
          coverUrl: dto.coverUrl ?? null,
          city: dto.city ?? null,
          country: dto.country ?? null,
          ownerId: userId,
        },
      });
      await tx.teamMember.create({
        data: { teamId: t.id, userId, role: 'OWNER' },
      });
      return t;
    });
    return team;
  }

  async getTeam(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: { select: { id: true, nickname: true, avatar: true } },
        _count: { select: { members: true, certificates: true } },
      },
    });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async updateTeam(teamId: string, dto: UpdateTeamDto) {
    return this.prisma.team.update({
      where: { id: teamId },
      data: {
        ...dto,
        description: dto.description !== undefined ? sanitize(dto.description) : undefined,
        orgType: dto.orgType as never,
      },
    });
  }

  async listMembers(teamId: string) {
    return this.prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
      orderBy: { joinedAt: 'asc' },
      take: 200,
    });
  }

  async createInvite(teamId: string, userId: string, dto: InviteMemberDto) {
    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.prisma.teamInvite.create({
      data: {
        teamId,
        token,
        role: (dto.role ?? 'MEMBER') as never,
        createdBy: userId,
        expiresAt,
      },
    });
    return { token, expiresAt };
  }

  async acceptInvite(token: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const invite = await tx.teamInvite.findUnique({ where: { token } });
      if (!invite) throw new NotFoundException('Invite not found');
      if (invite.usedAt) throw new ConflictException('Invite already used');
      if (invite.expiresAt < new Date()) throw new BadRequestException('Invite expired');

      const existing = await tx.teamMember.findUnique({
        where: { teamId_userId: { teamId: invite.teamId, userId } },
      });
      if (existing) throw new ConflictException('Already a member');

      const member = await tx.teamMember.create({
        data: { teamId: invite.teamId, userId, role: invite.role },
      });
      await tx.teamInvite.update({
        where: { id: invite.id },
        data: { usedAt: new Date(), usedBy: userId },
      });
      return { teamId: invite.teamId, role: member.role };
    });
  }

  async listCertificates(teamId: string) {
    return this.prisma.teamCertificate.findMany({
      where: { teamId, revokedAt: null },
      orderBy: { issuedAt: 'desc' },
      take: 100,
    });
  }

  // ── Admin: Inquiries ───────────────────────────────────
  async adminListInquiries(status?: string, page = 1, pageSize = 20) {
    const take = Math.min(pageSize, 100);
    const skip = (page - 1) * take;
    const where = status ? { status: status as never } : {};
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
    dto: UpdateInquiryStatusDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const inquiry = await tx.teamInquiry.findUnique({ where: { id: inquiryId } });
      if (!inquiry) throw new NotFoundException('Inquiry not found');
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

  // ── Admin: Themes & Cases & Certificates ───────────────
  async adminUpsertTheme(dto: UpsertThemeDto) {
    return this.prisma.teamCultureTheme.upsert({
      where: { slug: dto.slug },
      update: {
        title: dto.title,
        subtitle: dto.subtitle ?? null,
        description: sanitize(dto.description) ?? '',
        color: dto.color,
        icon: dto.icon ?? null,
        coverUrl: dto.coverUrl ?? null,
        keywords: dto.keywords ?? [],
        holySites: dto.holySites ?? [],
        routes: dto.routes ?? [],
        rituals: (dto.rituals as never) ?? null,
        priceFrom: dto.priceFrom ?? null,
        durationDays: dto.durationDays ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isPublished: dto.isPublished ?? true,
      },
      create: {
        slug: dto.slug,
        title: dto.title,
        subtitle: dto.subtitle ?? null,
        description: sanitize(dto.description) ?? '',
        color: dto.color,
        icon: dto.icon ?? null,
        coverUrl: dto.coverUrl ?? null,
        keywords: dto.keywords ?? [],
        holySites: dto.holySites ?? [],
        routes: dto.routes ?? [],
        rituals: (dto.rituals as never) ?? null,
        priceFrom: dto.priceFrom ?? null,
        durationDays: dto.durationDays ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isPublished: dto.isPublished ?? true,
      },
    });
  }

  async adminUpsertCase(dto: UpsertCaseDto) {
    if (dto.isPublished && !dto.consentSigned) {
      throw new ForbiddenException('Cannot publish a case without consentSigned');
    }
    return this.prisma.teamCase.upsert({
      where: { slug: dto.slug },
      update: {
        teamName: dto.teamName,
        orgType: dto.orgType as never,
        industry: dto.industry ?? null,
        themeId: dto.themeId ?? null,
        headcount: dto.headcount,
        story: sanitize(dto.story) ?? '',
        highlights: dto.highlights ?? [],
        photos: dto.photos ?? [],
        videoUrl: dto.videoUrl ?? null,
        testimonial: sanitize(dto.testimonial ?? null),
        consentSigned: dto.consentSigned ?? false,
        isPublished: dto.isPublished ?? false,
        publishedAt: dto.isPublished ? new Date() : null,
      },
      create: {
        slug: dto.slug,
        teamName: dto.teamName,
        orgType: dto.orgType as never,
        industry: dto.industry ?? null,
        themeId: dto.themeId ?? null,
        headcount: dto.headcount,
        story: sanitize(dto.story) ?? '',
        highlights: dto.highlights ?? [],
        photos: dto.photos ?? [],
        videoUrl: dto.videoUrl ?? null,
        testimonial: sanitize(dto.testimonial ?? null),
        consentSigned: dto.consentSigned ?? false,
        isPublished: dto.isPublished ?? false,
        publishedAt: dto.isPublished ? new Date() : null,
      },
    });
  }

  async adminIssueCertificate(dto: IssueCertificateDto) {
    const team = await this.prisma.team.findUnique({ where: { id: dto.teamId }, select: { id: true } });
    if (!team) throw new NotFoundException('Team not found');
    const serialNo = `ZT-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;
    return this.prisma.teamCertificate.create({
      data: {
        teamId: dto.teamId,
        tripId: dto.tripId ?? null,
        themeId: dto.themeId ?? null,
        title: dto.title,
        serialNo,
        pdfUrl: dto.pdfUrl ?? null,
        imageUrl: dto.imageUrl ?? null,
      },
    });
  }

  async adminStats() {
    const [totalInquiries, byStatus, totalTeams, totalCases, totalCertificates] = await Promise.all([
      this.prisma.teamInquiry.count(),
      this.prisma.teamInquiry.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.team.count(),
      this.prisma.teamCase.count({ where: { isPublished: true } }),
      this.prisma.teamCertificate.count({ where: { revokedAt: null } }),
    ]);
    return {
      totalInquiries,
      inquiriesByStatus: byStatus.map((b) => ({ status: b.status, count: b._count.id })),
      totalTeams,
      totalCases,
      totalCertificates,
    };
  }
}
