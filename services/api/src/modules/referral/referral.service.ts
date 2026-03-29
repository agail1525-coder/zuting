import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReferralService {
  constructor(private readonly prisma: PrismaService) {}

  /** Generate a random 6-char A-Z0-9 code */
  private generateCode(): string {
    return crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 6);
  }

  /** Get or create the user's invite code */
  async getOrCreateCode(userId: string) {
    const existing = await this.prisma.inviteCode.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    // Keep trying until we get a unique code (collision is astronomically rare)
    let code: string;
    for (let attempt = 0; attempt < 5; attempt++) {
      code = this.generateCode();
      const taken = await this.prisma.inviteCode.findUnique({ where: { code } });
      if (!taken) break;
    }

    return this.prisma.inviteCode.create({
      data: { userId, code: code! },
    });
  }

  /** Get the user's team: level-1 and level-2 invitees */
  async getMyTeam(userId: string) {
    const referrals = await this.prisma.referral.findMany({
      where: { inviterId: userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const level1 = referrals.filter((r) => r.level === 1);
    const level2 = referrals.filter((r) => r.level === 2);

    return {
      level1Count: level1.length,
      level2Count: level2.length,
      level1,
      level2,
    };
  }

  /** Paginated referral rewards */
  async getMyRewards(userId: string, page = 1, limit = 20) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const [items, total] = await Promise.all([
      this.prisma.referralReward.findMany({
        where: { inviterId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.referralReward.count({ where: { inviterId: userId } }),
    ]);

    return { items, total, page, pageSize: take };
  }

  /** Distribution stats for the current user */
  async getStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [level1Count, level2Count, totalRewardsAgg, monthlyRewardsAgg] =
      await Promise.all([
        this.prisma.referral.count({ where: { inviterId: userId, level: 1 } }),
        this.prisma.referral.count({ where: { inviterId: userId, level: 2 } }),
        this.prisma.referralReward.aggregate({
          where: { inviterId: userId, status: 'SETTLED' },
          _sum: { amount: true },
        }),
        this.prisma.referralReward.aggregate({
          where: {
            inviterId: userId,
            status: 'SETTLED',
            createdAt: { gte: startOfMonth },
          },
          _sum: { amount: true },
        }),
      ]);

    return {
      totalInvites: level1Count + level2Count,
      level1Count,
      level2Count,
      totalRewards: totalRewardsAgg._sum.amount ?? 0,
      monthlyRewards: monthlyRewardsAgg._sum.amount ?? 0,
    };
  }

  /** Bind an invite code for a new user */
  async bindInviteCode(userId: string, code: string) {
    // Validate code exists
    const inviteCode = await this.prisma.inviteCode.findUnique({ where: { code } });
    if (!inviteCode) {
      throw new NotFoundException(`Invite code "${code}" not found`);
    }

    // No self-invite
    if (inviteCode.userId === userId) {
      throw new BadRequestException('Cannot use your own invite code');
    }

    // Check not already bound
    const existingBind = await this.prisma.referral.findUnique({
      where: { inviteeId: userId },
    });
    if (existingBind) {
      throw new ConflictException('You have already bound an invite code');
    }

    const inviterId = inviteCode.userId;

    // Check if the inviter themselves was invited by someone (grandparent)
    const inviterReferral = await this.prisma.referral.findUnique({
      where: { inviteeId: inviterId },
    });

    // Use a transaction to create referral(s) and increment totalInvites
    const results = await this.prisma.$transaction(async (tx) => {
      // Level-1 referral
      const level1 = await tx.referral.create({
        data: { inviterId, inviteeId: userId, level: 1 },
      });

      // Level-2 referral for grandparent
      let level2 = null;
      if (inviterReferral) {
        const grandparentId = inviterReferral.inviterId;
        level2 = await tx.referral.create({
          data: { inviterId: grandparentId, inviteeId: userId, level: 2 },
        });
      }

      // Increment totalInvites on the invite code
      await tx.inviteCode.update({
        where: { id: inviteCode.id },
        data: { totalInvites: { increment: 1 } },
      });

      return { level1, level2 };
    });

    return results;
  }

  /**
   * Settle referral rewards when an order is paid.
   * Level-1 referrer gets 5%, level-2 gets 2%. Cap: 500 points per order.
   * Called internally by the payment/order module.
   */
  async settleReward(orderId: string, buyerUserId: string, orderAmount: number) {
    // Find buyer's level-1 referral
    const level1Ref = await this.prisma.referral.findFirst({
      where: { inviteeId: buyerUserId, level: 1 },
    });

    if (!level1Ref) return; // Buyer was not referred — nothing to do

    // Find buyer's level-2 referral (grandparent)
    const level2Ref = await this.prisma.referral.findFirst({
      where: { inviteeId: buyerUserId, level: 2 },
    });

    const CAP = 500;

    const level1Amount = Math.min(Math.floor(orderAmount * 0.05), CAP);
    const level2Amount = level2Ref
      ? Math.min(Math.floor(orderAmount * 0.02), CAP)
      : 0;

    await this.prisma.$transaction(async (tx) => {
      // Create level-1 reward record
      await tx.referralReward.create({
        data: {
          referralId: level1Ref.id,
          orderId,
          inviterId: level1Ref.inviterId,
          amount: level1Amount,
          level: 1,
          status: 'SETTLED',
          settledAt: new Date(),
        },
      });

      // Update inviter's InviteCode totalRewards
      await tx.inviteCode.updateMany({
        where: { userId: level1Ref.inviterId },
        data: { totalRewards: { increment: level1Amount } },
      });

      if (level2Ref && level2Amount > 0) {
        await tx.referralReward.create({
          data: {
            referralId: level2Ref.id,
            orderId,
            inviterId: level2Ref.inviterId,
            amount: level2Amount,
            level: 2,
            status: 'SETTLED',
            settledAt: new Date(),
          },
        });

        await tx.inviteCode.updateMany({
          where: { userId: level2Ref.inviterId },
          data: { totalRewards: { increment: level2Amount } },
        });
      }
    });
  }
}
