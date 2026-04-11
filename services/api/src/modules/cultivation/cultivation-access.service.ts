import {
  BadRequestException,
  forwardRef,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CultivationRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DailyPracticeService } from './daily-practice.service';
import {
  GenerateInviteDto,
  GrantAccessDto,
  RedeemInviteDto,
  RejectApplicationDto,
  ReviewApplicationDto,
  RevokeAccessDto,
  SubmitApplicationDto,
} from './dto/apply.dto';

const sanitize = (s?: string | null) =>
  typeof s === 'string'
    ? s
        .replace(/<\s*\/?\s*(script|iframe|object|embed|style)[^>]*>/gi, '')
        .replace(/javascript:/gi, '')
        .slice(0, 2000)
    : s ?? null;

const ROLE_RANK: Record<string, number> = {
  NONE: 0,
  SEEKER: 1,
  PRACTITIONER: 2,
  MENTOR: 3,
  MASTER: 4,
};

@Injectable()
export class CultivationAccessService {
  private readonly logger = new Logger(CultivationAccessService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => DailyPracticeService))
    private readonly dailyPractice: DailyPracticeService,
  ) {}

  private autoInitPractice(userId: string) {
    this.dailyPractice
      .getOrInitPractice(userId)
      .catch((err) =>
        this.logger.warn(`auto-init daily practice failed: ${(err as Error).message}`),
      );
  }

  // ── 用户端 ────────────────────────────────────────────────

  async submitApplication(userId: string, dto: SubmitApplicationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, cultivationRole: true, cultivationAccess: true },
    });
    if (!user) throw new NotFoundException('用户不存在');
    if (user.cultivationAccess) {
      throw new BadRequestException('您已拥有修行资格, 无需重复申请');
    }

    // 30 天冷却防刷
    const recent = await this.prisma.cultivationApplication.findFirst({
      where: {
        userId,
        submittedAt: { gte: new Date(Date.now() - 30 * 86400_000) },
        status: { in: ['PENDING', 'REJECTED'] },
      },
    });
    if (recent && recent.status === 'REJECTED') {
      throw new BadRequestException('30 天内已被拒绝, 请稍后再试');
    }
    if (recent && recent.status === 'PENDING') {
      throw new BadRequestException('您有一份审核中的申请');
    }

    // 邀请码路径 → 自动通过
    if (dto.inviteCode) {
      return this.redeemInternal(userId, dto.inviteCode, dto);
    }

    return this.prisma.cultivationApplication.create({
      data: {
        userId,
        motivation: sanitize(dto.motivation)!,
        tradition: dto.tradition ?? null,
        experience: sanitize(dto.experience),
        source: 'MANUAL',
        status: 'PENDING',
      },
    });
  }

  async getMyApplication(userId: string) {
    const application = await this.prisma.cultivationApplication.findFirst({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
    });
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        cultivationAccess: true,
        cultivationRole: true,
        cultivationGrantedAt: true,
        cultivationExpiresAt: true,
      },
    });
    const isAdmin = user?.role === 'ADMIN';
    return {
      hasAccess: isAdmin || !!user?.cultivationAccess,
      role: user?.cultivationRole ?? (isAdmin ? 'MASTER' : 'NONE'),
      expiresAt: user?.cultivationExpiresAt ?? null,
      application,
    };
  }

  async redeemInvite(userId: string, dto: RedeemInviteDto) {
    return this.redeemInternal(userId, dto.code);
  }

  private async redeemInternal(
    userId: string,
    code: string,
    appDto?: SubmitApplicationDto,
  ) {
    const invite = await this.prisma.cultivationInviteCode.findUnique({
      where: { code },
    });
    if (!invite) throw new NotFoundException('邀请码无效');
    if (invite.usedAt) throw new BadRequestException('邀请码已被使用');
    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('邀请码已过期');
    }
    if (invite.issuerId === userId) {
      throw new BadRequestException('不能使用自己的邀请码');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.cultivationInviteCode.update({
        where: { id: invite.id },
        data: { usedAt: new Date(), assigneeId: userId },
      });
      const fromUser = await tx.user.findUnique({
        where: { id: userId },
        select: { cultivationRole: true },
      });
      await tx.user.update({
        where: { id: userId },
        data: {
          cultivationAccess: true,
          cultivationRole: 'PRACTITIONER',
          cultivationGrantedBy: invite.issuerId,
          cultivationGrantedAt: new Date(),
        },
      });
      const application = await tx.cultivationApplication.create({
        data: {
          userId,
          motivation: sanitize(appDto?.motivation) ?? '通过邀请码加入',
          tradition: appDto?.tradition ?? null,
          experience: sanitize(appDto?.experience),
          source: 'INVITE',
          inviteCodeId: invite.id,
          status: 'AUTO_APPROVED',
          reviewedAt: new Date(),
        },
      });
      await tx.cultivationAccessAudit.create({
        data: {
          userId,
          action: 'GRANT',
          fromRole: (fromUser?.cultivationRole ?? 'NONE') as CultivationRole,
          toRole: 'PRACTITIONER',
          operatorId: invite.issuerId,
          reason: 'INVITE_REDEEM',
        },
      });
      return application;
    }).then((result) => {
      this.autoInitPractice(userId);
      return result;
    });
  }

  // ── MENTOR 邀请 ────────────────────────────────────────────

  async generateInvites(issuerId: string, dto: GenerateInviteDto) {
    const count = Math.max(1, Math.min(5, dto.count));
    // 每月上限 5 张
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyCount = await this.prisma.cultivationInviteCode.count({
      where: { issuerId, createdAt: { gte: startOfMonth } },
    });
    if (monthlyCount + count > 5) {
      throw new BadRequestException(
        `本月邀请码已用 ${monthlyCount}/5, 不能再生成 ${count} 张`,
      );
    }
    const expiresAt = new Date(Date.now() + 7 * 86400_000);
    const codes = await this.prisma.$transaction(
      Array.from({ length: count }, () =>
        this.prisma.cultivationInviteCode.create({
          data: {
            issuerId,
            note: sanitize(dto.note),
            expiresAt,
          },
        }),
      ),
    );
    return codes;
  }

  async listMyInvites(issuerId: string) {
    const items = await this.prisma.cultivationInviteCode.findMany({
      where: { issuerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyCount = await this.prisma.cultivationInviteCode.count({
      where: { issuerId, createdAt: { gte: startOfMonth } },
    });
    return { items, monthlyUsed: monthlyCount, monthlyLimit: 5 };
  }

  // ── Admin ──────────────────────────────────────────────────

  async listApplications(status?: string, page = 1, pageSize = 20) {
    const take = Math.min(pageSize, 50);
    const skip = (page - 1) * take;
    const where: Prisma.CultivationApplicationWhereInput = status
      ? { status }
      : {};
    const [items, total] = await Promise.all([
      this.prisma.cultivationApplication.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip,
        take,
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
        },
      }),
      this.prisma.cultivationApplication.count({ where }),
    ]);
    return { items, total, page, pageSize: take };
  }

  async approveApplication(
    applicationId: string,
    operatorId: string,
    dto: ReviewApplicationDto,
  ) {
    const app = await this.prisma.cultivationApplication.findUnique({
      where: { id: applicationId },
    });
    if (!app) throw new NotFoundException('申请不存在');
    if (app.status !== 'PENDING') {
      throw new BadRequestException('申请已处理');
    }
    const role = (dto.role ?? 'PRACTITIONER') as CultivationRole;
    return this.prisma.$transaction(async (tx) => {
      const fromUser = await tx.user.findUnique({
        where: { id: app.userId },
        select: { cultivationRole: true },
      });
      const updated = await tx.cultivationApplication.update({
        where: { id: applicationId },
        data: {
          status: 'APPROVED',
          reviewedBy: operatorId,
          reviewedAt: new Date(),
          reviewNote: sanitize(dto.note),
        },
      });
      await tx.user.update({
        where: { id: app.userId },
        data: {
          cultivationAccess: true,
          cultivationRole: role,
          cultivationGrantedBy: operatorId,
          cultivationGrantedAt: new Date(),
        },
      });
      await tx.cultivationAccessAudit.create({
        data: {
          userId: app.userId,
          action: 'GRANT',
          fromRole: (fromUser?.cultivationRole ?? 'NONE') as CultivationRole,
          toRole: role,
          operatorId,
          reason: dto.note ?? 'ADMIN_APPROVE',
        },
      });
      return updated;
    }).then((result) => {
      this.autoInitPractice(app.userId);
      return result;
    });
  }

  async rejectApplication(
    applicationId: string,
    operatorId: string,
    dto: RejectApplicationDto,
  ) {
    const app = await this.prisma.cultivationApplication.findUnique({
      where: { id: applicationId },
    });
    if (!app) throw new NotFoundException('申请不存在');
    if (app.status !== 'PENDING') {
      throw new BadRequestException('申请已处理');
    }
    return this.prisma.cultivationApplication.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        reviewedBy: operatorId,
        reviewedAt: new Date(),
        reviewNote: sanitize(dto.reason),
      },
    });
  }

  async grantAccess(operatorId: string, dto: GrantAccessDto) {
    const target = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { cultivationRole: true },
    });
    if (!target) throw new NotFoundException('用户不存在');
    const role = dto.role as CultivationRole;
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: dto.userId },
        data: {
          cultivationAccess: true,
          cultivationRole: role,
          cultivationGrantedBy: operatorId,
          cultivationGrantedAt: new Date(),
        },
        select: {
          id: true,
          cultivationAccess: true,
          cultivationRole: true,
        },
      });
      await tx.cultivationAccessAudit.create({
        data: {
          userId: dto.userId,
          action:
            ROLE_RANK[role] > ROLE_RANK[target.cultivationRole]
              ? 'UPGRADE'
              : 'GRANT',
          fromRole: target.cultivationRole as CultivationRole,
          toRole: role,
          operatorId,
          reason: dto.reason ?? 'ADMIN_GRANT',
        },
      });
      return updated;
    });
  }

  async revokeAccess(operatorId: string, dto: RevokeAccessDto) {
    const target = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { cultivationRole: true },
    });
    if (!target) throw new NotFoundException('用户不存在');
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: dto.userId },
        data: {
          cultivationAccess: false,
          cultivationRole: 'NONE',
          cultivationExpiresAt: null,
        },
      });
      await tx.cultivationAccessAudit.create({
        data: {
          userId: dto.userId,
          action: 'REVOKE',
          fromRole: target.cultivationRole as CultivationRole,
          toRole: 'NONE',
          operatorId,
          reason: dto.reason ?? 'ADMIN_REVOKE',
        },
      });
      return updated;
    });
  }
}
