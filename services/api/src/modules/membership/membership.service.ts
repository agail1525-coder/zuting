import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

// Level thresholds: [minPoints, levelNumber, levelName]
const LEVEL_CONFIG = [
  { level: 1, name: '朝圣新手', minPoints: 0 },
  { level: 2, name: '虔诚行者', minPoints: 1000 },
  { level: 3, name: '法脉传人', minPoints: 5000 },
  { level: 4, name: '祖庭守护', minPoints: 20000 },
  { level: 5, name: '宗门圣使', minPoints: 50000 },
] as const;

@Injectable()
export class MembershipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /** Find or create membership for a user */
  async getOrCreate(userId: string) {
    const existing = await this.prisma.membership.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    return this.prisma.membership.create({
      data: {
        userId,
        level: 1,
        levelName: '朝圣新手',
        totalPoints: 0,
        availablePoints: 0,
      },
    });
  }

  /** Paginated points transaction history */
  async getPointsHistory(userId: string, page = 1, limit = 20) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const membership = await this.getOrCreate(userId);

    const [items, total] = await Promise.all([
      this.prisma.pointsTransaction.findMany({
        where: { membershipId: membership.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.pointsTransaction.count({
        where: { membershipId: membership.id },
      }),
    ]);

    return { items, total, page, pageSize: take };
  }

  /**
   * Add points to a user's membership.
   * Creates an EARN transaction and checks for level upgrade.
   */
  async addPoints(
    userId: string,
    amount: number,
    source: string,
    sourceId: string | null,
    description: string,
  ) {
    const membership = await this.getOrCreate(userId);

    const [transaction, updated] = await this.prisma.$transaction([
      this.prisma.pointsTransaction.create({
        data: {
          membershipId: membership.id,
          type: 'EARN',
          amount,
          source,
          sourceId,
          description,
        },
      }),
      this.prisma.membership.update({
        where: { id: membership.id },
        data: {
          totalPoints: { increment: amount },
          availablePoints: { increment: amount },
        },
      }),
    ]);

    // Check and apply level upgrade
    const withLevel = await this.checkLevelUpgrade(updated);

    return { transaction, membership: withLevel };
  }

  /**
   * Spend points from a user's membership.
   * Verifies sufficient available balance before deducting.
   */
  async spendPoints(
    userId: string,
    amount: number,
    source: string,
    sourceId: string | null,
    description: string,
  ) {
    const membership = await this.getOrCreate(userId);

    if (membership.availablePoints < amount) {
      throw new BadRequestException(
        `积分不足: 需要 ${amount}，当前可用 ${membership.availablePoints}`,
      );
    }

    const [transaction, updated] = await this.prisma.$transaction([
      this.prisma.pointsTransaction.create({
        data: {
          membershipId: membership.id,
          type: 'SPEND',
          amount,
          source,
          sourceId,
          description,
        },
      }),
      this.prisma.membership.update({
        where: { id: membership.id },
        data: { availablePoints: { decrement: amount } },
      }),
    ]);

    return { transaction, membership: updated };
  }

  /**
   * Daily check-in.
   * Redis key: checkin:{userId}:{YYYY-MM-DD} for idempotency.
   * Base: 5 points. 7-day streak bonus: +50 points.
   */
  async checkin(userId: string) {
    const today = this.formatDate(new Date());
    const checkinKey = `checkin:${userId}:${today}`;

    const alreadyCheckedIn = await this.redis.exists(checkinKey);
    if (alreadyCheckedIn) {
      throw new ConflictException('今日已签到，明日再来');
    }

    // Mark today as checked-in (expires in 25 hours to cover timezone edge cases)
    await this.redis.setex(checkinKey, 25 * 3600, '1');

    // Detect streak: count consecutive days prior
    const streak = await this.getCheckinStreak(userId);
    const newStreak = streak + 1;

    let points = 5;
    let bonusDescription = '';
    let bonusPoints = 0;

    if (newStreak % 7 === 0) {
      bonusPoints = 50;
      bonusDescription = `连续签到${newStreak}天奖励`;
    }

    // Award base check-in points
    const result = await this.addPoints(
      userId,
      points,
      'CHECKIN',
      today,
      `每日签到 (连续第${newStreak}天)`,
    );

    // Award streak bonus if applicable
    if (bonusPoints > 0) {
      await this.addPoints(
        userId,
        bonusPoints,
        'CHECKIN',
        today,
        bonusDescription,
      );
    }

    return {
      date: today,
      streak: newStreak,
      pointsEarned: points,
      bonusPoints,
      totalEarned: points + bonusPoints,
      membership: result.membership,
    };
  }

  /**
   * Get check-in calendar for a given month.
   * Returns list of dates (YYYY-MM-DD) with check-in records.
   */
  async getCheckinCalendar(userId: string, year: number, month: number) {
    const membership = await this.getOrCreate(userId);

    // Start of month / end of month
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await this.prisma.pointsTransaction.findMany({
      where: {
        membershipId: membership.id,
        source: 'CHECKIN',
        createdAt: { gte: start, lte: end },
      },
      select: { createdAt: true, amount: true, description: true },
      orderBy: { createdAt: 'asc' },
    });

    // Deduplicate by date (only keep unique YYYY-MM-DD)
    const dateSet = new Set<string>();
    for (const tx of transactions) {
      dateSet.add(this.formatDate(tx.createdAt));
    }

    return {
      year,
      month,
      checkedDates: Array.from(dateSet),
      totalDays: dateSet.size,
    };
  }

  /**
   * Check and apply level upgrade based on totalPoints.
   * Returns updated membership (may be unchanged if no upgrade needed).
   */
  async checkLevelUpgrade(membership: {
    id: string;
    totalPoints: number;
    level: number;
  }) {
    let targetLevel: (typeof LEVEL_CONFIG)[number] = LEVEL_CONFIG[0];
    for (const cfg of LEVEL_CONFIG) {
      if (membership.totalPoints >= cfg.minPoints) {
        targetLevel = cfg;
      }
    }

    if (targetLevel.level <= membership.level) {
      return membership;
    }

    return this.prisma.membership.update({
      where: { id: membership.id },
      data: { level: targetLevel.level, levelName: targetLevel.name },
    });
  }

  /** Return static level configuration info */
  getLevels() {
    return LEVEL_CONFIG.map((cfg) => ({
      level: cfg.level,
      name: cfg.name,
      minPoints: cfg.minPoints,
      nextLevelPoints:
        cfg.level < LEVEL_CONFIG.length
          ? (LEVEL_CONFIG as ReadonlyArray<(typeof LEVEL_CONFIG)[number]>)[cfg.level]?.minPoints ?? null
          : null,
      benefits: this.getLevelBenefits(cfg.level),
    }));
  }

  // ──────────────── Private helpers ────────────────

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /** Count consecutive check-in days ending yesterday */
  private async getCheckinStreak(userId: string): Promise<number> {
    let streak = 0;
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const key = `checkin:${userId}:${this.formatDate(day)}`;
      const exists = await this.redis.exists(key);
      if (exists) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private getLevelBenefits(level: number): string[] {
    const benefits: Record<number, string[]> = {
      1: ['每日签到积分', '基础折扣0%'],
      2: ['每日签到积分x1.2', '套餐折扣5%', '专属徽章'],
      3: ['每日签到积分x1.5', '套餐折扣8%', '优先预订', '专属导游推荐'],
      4: ['每日签到积分x2', '套餐折扣12%', '免费升级住宿', '专属客服'],
      5: ['每日签到积分x3', '套餐折扣15%', 'VIP专属行程', '年度峰会邀请'],
    };
    return benefits[level] ?? [];
  }
}
