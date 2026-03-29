import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionService {
  constructor(private readonly prisma: PrismaService) {}

  /** List active, non-expired promotions with remaining quota */
  async findActive(type?: string, page = 1, limit = 20) {
    const take = Math.min(limit, 50);
    const skip = (page - 1) * take;
    const now = new Date();

    const where = {
      isActive: true,
      startAt: { lte: now },
      endAt: { gte: now },
      ...(type ? { type: type as 'TIME_LIMITED' | 'EARLY_BIRD' | 'FLASH_SALE' } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.promotion.findMany({
        where,
        orderBy: { endAt: 'asc' },
        skip,
        take,
        include: { _count: { select: { usages: true } } },
      }),
      this.prisma.promotion.count({ where }),
    ]);

    // Filter out fully-used promotions (totalQuota > 0 and usedQuota >= totalQuota)
    const filtered = items.filter(
      (p) => p.totalQuota === 0 || p.usedQuota < p.totalQuota,
    );

    return { items: filtered, total, page, pageSize: take };
  }

  /** Get promotion detail */
  async findOne(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: { _count: { select: { usages: true } } },
    });
    if (!promotion) throw new NotFoundException(`Promotion ${id} not found`);
    return promotion;
  }

  /** Admin: create promotion */
  async create(dto: CreatePromotionDto) {
    if (
      dto.discountType === 'PERCENT' &&
      (dto.discountValue < 1 || dto.discountValue > 100)
    ) {
      throw new BadRequestException('Percent discountValue must be between 1 and 100');
    }

    return this.prisma.promotion.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type as 'TIME_LIMITED' | 'EARLY_BIRD' | 'FLASH_SALE',
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minAmount: dto.minAmount,
        maxDiscount: dto.maxDiscount,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        entityType: dto.entityType,
        entityIds: dto.entityIds ?? [],
        totalQuota: dto.totalQuota ?? 0,
        coverImage: dto.coverImage,
      },
    });
  }

  /** Admin: update promotion */
  async update(id: string, dto: UpdatePromotionDto) {
    const existing = await this.prisma.promotion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Promotion ${id} not found`);

    if (
      dto.discountType === 'PERCENT' &&
      dto.discountValue != null &&
      (dto.discountValue < 1 || dto.discountValue > 100)
    ) {
      throw new BadRequestException('Percent discountValue must be between 1 and 100');
    }

    const data: Record<string, unknown> = { ...dto };
    if (dto.startAt) data['startAt'] = new Date(dto.startAt);
    if (dto.endAt) data['endAt'] = new Date(dto.endAt);
    if (dto.type) data['type'] = dto.type as 'TIME_LIMITED' | 'EARLY_BIRD' | 'FLASH_SALE';

    return this.prisma.promotion.update({ where: { id }, data });
  }

  /** Admin: deactivate promotion (soft delete) */
  async deactivate(id: string) {
    const existing = await this.prisma.promotion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Promotion ${id} not found`);

    return this.prisma.promotion.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Verify a promotion for a given user and order amount.
   * Returns { valid: true, discount, promotion } or { valid: false, reason }.
   */
  async verify(promotionId: string, userId: string, orderAmount: number) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion) {
      return { valid: false, reason: 'Promotion not found' };
    }
    if (!promotion.isActive) {
      return { valid: false, reason: 'Promotion is not active' };
    }

    const now = new Date();
    if (now < promotion.startAt) {
      return { valid: false, reason: 'Promotion has not started yet' };
    }
    if (now > promotion.endAt) {
      return { valid: false, reason: 'Promotion has expired' };
    }

    if (
      promotion.totalQuota > 0 &&
      promotion.usedQuota >= promotion.totalQuota
    ) {
      return { valid: false, reason: 'Promotion quota exhausted' };
    }

    // Check if user already used this promotion
    const userUsage = await this.prisma.promotionUsage.findFirst({
      where: { promotionId: promotion.id, userId },
    });
    if (userUsage) {
      return { valid: false, reason: 'You have already used this promotion' };
    }

    if (promotion.minAmount && orderAmount < promotion.minAmount) {
      return {
        valid: false,
        reason: `Minimum order amount is ${promotion.minAmount} cents`,
      };
    }

    const discount = this.calculateDiscount(promotion, orderAmount);
    return { valid: true as const, discount, promotion };
  }

  /**
   * Apply promotion to an order: verify + create usage + increment usedQuota atomically.
   * Uses conditional update (WHERE usedQuota < totalQuota) for quota safety.
   */
  async apply(
    promotionId: string,
    userId: string,
    orderId: string,
    orderAmount: number,
  ) {
    const result = await this.verify(promotionId, userId, orderAmount);
    if (!result.valid || result.discount == null || !result.promotion) {
      throw new BadRequestException(
        (result as { valid: false; reason: string }).reason ?? 'Promotion verification failed',
      );
    }

    const promotion = result.promotion;
    const discount = result.discount;

    // Create usage record
    const usage = await this.prisma.promotionUsage.create({
      data: {
        promotionId: promotion.id,
        userId,
        orderId,
        discount,
      },
    });

    // Increment usedQuota with conditional safety (only if still under quota)
    if (promotion.totalQuota > 0) {
      await this.prisma.$executeRaw`
        UPDATE "Promotion"
        SET "usedQuota" = "usedQuota" + 1
        WHERE id = ${promotion.id}
          AND "usedQuota" < "totalQuota"
      `;
    } else {
      await this.prisma.promotion.update({
        where: { id: promotion.id },
        data: { usedQuota: { increment: 1 } },
      });
    }

    return { discount, usage };
  }

  /**
   * Apply with order lookup — fetches order amount from DB, then delegates to apply().
   */
  async applyWithOrderLookup(
    promotionId: string,
    userId: string,
    orderId: string,
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException(`Order ${orderId} not found`);
    return this.apply(promotionId, userId, orderId, order.totalAmount);
  }

  private calculateDiscount(
    promotion: { discountType: string; discountValue: number; maxDiscount: number | null },
    orderAmount: number,
  ): number {
    if (promotion.discountType === 'FIXED') {
      return Math.min(promotion.discountValue, orderAmount);
    }

    // PERCENT
    let discount = Math.floor((orderAmount * promotion.discountValue) / 100);
    if (promotion.maxDiscount && discount > promotion.maxDiscount) {
      discount = promotion.maxDiscount;
    }
    return Math.min(discount, orderAmount);
  }
}
