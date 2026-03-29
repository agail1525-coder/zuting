import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  /** Admin: create coupon */
  async create(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Coupon code "${dto.code}" already exists`);
    }

    if (dto.type === 'PERCENT' && (dto.value < 1 || dto.value > 100)) {
      throw new BadRequestException('Percent value must be between 1 and 100');
    }

    return this.prisma.coupon.create({
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type,
        value: dto.value,
        minAmount: dto.minAmount,
        maxDiscount: dto.maxDiscount,
        totalCount: dto.totalCount,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
      },
    });
  }

  /** Admin: list all coupons */
  async findAll(page = 1, limit = 20) {
    const take = Math.min(limit, 100);
    const [data, total] = await Promise.all([
      this.prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * take,
        take,
        include: { _count: { select: { usages: true } } },
      }),
      this.prisma.coupon.count(),
    ]);

    return { data, total, page, limit };
  }

  /** Admin: update coupon */
  async update(id: string, dto: UpdateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException(`Coupon ${id} not found`);

    if (dto.type === 'PERCENT' && dto.value != null && (dto.value < 1 || dto.value > 100)) {
      throw new BadRequestException('Percent value must be between 1 and 100');
    }

    const data: Prisma.CouponUpdateInput = { ...dto };
    if (dto.startAt) data.startAt = new Date(dto.startAt);
    if (dto.endAt) data.endAt = new Date(dto.endAt);

    return this.prisma.coupon.update({ where: { id }, data });
  }

  /** Admin: deactivate coupon (soft delete) */
  async deactivate(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException(`Coupon ${id} not found`);

    return this.prisma.coupon.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /** Verify coupon for a user and order amount */
  async verify(code: string, userId: string, orderAmount: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return { valid: false, reason: 'Coupon not found' };
    }
    if (!coupon.isActive) {
      return { valid: false, reason: 'Coupon is not active' };
    }

    const now = new Date();
    if (now < coupon.startAt) {
      return { valid: false, reason: 'Coupon has not started yet' };
    }
    if (now > coupon.endAt) {
      return { valid: false, reason: 'Coupon has expired' };
    }

    if (coupon.totalCount > 0 && coupon.usedCount >= coupon.totalCount) {
      return { valid: false, reason: 'Coupon usage limit reached' };
    }

    // Check if user already used this coupon
    const userUsage = await this.prisma.couponUsage.findFirst({
      where: { couponId: coupon.id, userId },
    });
    if (userUsage) {
      return { valid: false, reason: 'You have already used this coupon' };
    }

    if (coupon.minAmount && orderAmount < coupon.minAmount) {
      return {
        valid: false,
        reason: `Minimum order amount is ${coupon.minAmount} cents`,
      };
    }

    const discount = this.calculateDiscount(coupon, orderAmount);

    return { valid: true, discount, coupon };
  }

  /** Apply coupon to an order */
  async apply(code: string, userId: string, orderId: string, orderAmount: number) {
    const result = await this.verify(code, userId, orderAmount);
    if (!result.valid) {
      throw new BadRequestException(result.reason);
    }

    const coupon = result.coupon!;
    const discount = result.discount!;

    // Create usage and increment used count in a transaction
    const [usage] = await this.prisma.$transaction([
      this.prisma.couponUsage.create({
        data: {
          couponId: coupon.id,
          userId,
          orderId,
          discount,
        },
      }),
      this.prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      }),
    ]);

    return { discount, usage };
  }

  /** Apply coupon with order lookup — fetches order amount from DB */
  async applyWithOrderLookup(code: string, userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new BadRequestException(`Order ${orderId} not found`);
    }
    return this.apply(code, userId, orderId, order.totalAmount);
  }

  /** Get active coupons the user hasn't used */
  async getUserCoupons(userId: string, page = 1, limit = 20) {
    const take = Math.min(limit, 50);
    const skip = (page - 1) * take;
    const now = new Date();

    // Use relation filter to exclude coupons already used by this user
    // (replaces the old take:500 couponUsage query)
    const where: Prisma.CouponWhereInput = {
      isActive: true,
      startAt: { lte: now },
      endAt: { gte: now },
      usages: { none: { userId } },
    };

    const [items, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        orderBy: { endAt: 'asc' },
        skip,
        take,
      }),
      this.prisma.coupon.count({ where }),
    ]);

    // Filter out fully used coupons (Prisma can't compare two columns)
    const filtered = items.filter(
      (c) => c.totalCount === 0 || c.usedCount < c.totalCount,
    );

    return { items: filtered, total, page, pageSize: take };
  }

  /** Public: list available coupons (active, not expired, has quota) */
  async getAvailableCoupons(page = 1, limit = 20) {
    const take = Math.min(limit, 50);
    const now = new Date();
    const where: Prisma.CouponWhereInput = {
      isActive: true,
      startAt: { lte: now },
      endAt: { gte: now },
    };
    const [items, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        orderBy: { endAt: 'asc' },
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.coupon.count({ where }),
    ]);
    // Filter out fully used coupons (Prisma can't compare two columns directly)
    const filtered = items.filter(
      (c) => c.totalCount === 0 || c.usedCount < c.totalCount,
    );
    return { items: filtered, total, page, pageSize: take };
  }

  /** User claims a coupon */
  async claim(couponId: string, userId: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id: couponId } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    if (!coupon.isActive) throw new BadRequestException('Coupon is not active');

    const now = new Date();
    if (now < coupon.startAt || now > coupon.endAt) {
      throw new BadRequestException('Coupon is not in valid period');
    }
    if (coupon.totalCount > 0 && coupon.usedCount >= coupon.totalCount) {
      throw new BadRequestException('Coupon fully claimed');
    }

    // Check if already claimed
    const existing = await this.prisma.userCoupon.findUnique({
      where: { couponId_userId: { couponId, userId } },
    });
    if (existing) throw new ConflictException('Already claimed this coupon');

    return this.prisma.userCoupon.create({
      data: { couponId, userId },
      include: { coupon: true },
    });
  }

  /** Get user's claimed coupons with optional status filter */
  async getMyClaimed(
    userId: string,
    status?: string,
    page = 1,
    limit = 20,
  ) {
    const take = Math.min(limit, 50);
    const where: Prisma.UserCouponWhereInput = { userId };
    if (status) {
      where.status = status as Prisma.EnumUserCouponStatusFilter;
    }

    const [items, total] = await Promise.all([
      this.prisma.userCoupon.findMany({
        where,
        include: { coupon: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.userCoupon.count({ where }),
    ]);
    return { items, total, page, pageSize: take };
  }

  private calculateDiscount(
    coupon: { type: string; value: number; maxDiscount: number | null },
    orderAmount: number,
  ): number {
    if (coupon.type === 'FIXED') {
      return Math.min(coupon.value, orderAmount);
    }

    // PERCENT
    let discount = Math.floor((orderAmount * coupon.value) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
    return Math.min(discount, orderAmount);
  }
}
