import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class PointsMallService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public: list active products, optionally filtered by category */
  async findProducts(category?: string, page = 1, limit = 20) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;
    const now = new Date();

    const where = {
      isActive: true,
      ...(category ? { category } : {}),
      OR: [
        { startAt: null },
        { startAt: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endAt: null },
            { endAt: { gte: now } },
          ],
        },
      ],
    };

    const [items, total] = await Promise.all([
      this.prisma.pointsProduct.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.pointsProduct.count({ where }),
    ]);

    return { items, total, page, pageSize: take };
  }

  /** Public: product detail */
  async findProduct(id: string) {
    const product = await this.prisma.pointsProduct.findUnique({
      where: { id },
      include: { _count: { select: { exchanges: true } } },
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  /** Authenticated: exchange a product for points */
  async exchange(userId: string, productId: string) {
    const product = await this.prisma.pointsProduct.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);
    if (!product.isActive) {
      throw new BadRequestException('Product is not available');
    }

    // Check stock (0 = unlimited)
    if (product.stock > 0 && product.soldCount >= product.stock) {
      throw new BadRequestException('Product is out of stock');
    }

    // Fetch user membership for points check
    const membership = await this.prisma.membership.findUnique({
      where: { userId },
    });
    if (!membership) {
      throw new BadRequestException('Membership account not found');
    }
    if (membership.availablePoints < product.pointsCost) {
      throw new BadRequestException(
        `Insufficient points: need ${product.pointsCost}, have ${membership.availablePoints}`,
      );
    }

    // Atomic transaction: deduct points, create exchange record, increment soldCount
    const [exchangeRecord] = await this.prisma.$transaction([
      this.prisma.pointsExchange.create({
        data: {
          userId,
          productId,
          pointsSpent: product.pointsCost,
          status: 'PENDING',
        },
        include: { product: true },
      }),
      this.prisma.membership.update({
        where: { userId },
        data: {
          availablePoints: { decrement: product.pointsCost },
        },
      }),
      this.prisma.pointsTransaction.create({
        data: {
          membershipId: membership.id,
          type: 'SPEND',
          amount: product.pointsCost,
          source: 'REDEEM',
          description: `兑换商品: ${product.name}`,
        },
      }),
      this.prisma.pointsProduct.update({
        where: { id: productId },
        data: { soldCount: { increment: 1 } },
      }),
    ]);

    return exchangeRecord;
  }

  /** Authenticated: user's exchange history */
  async getMyExchanges(userId: string, page = 1, limit = 20) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const [items, total] = await Promise.all([
      this.prisma.pointsExchange.findMany({
        where: { userId },
        include: { product: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.pointsExchange.count({ where: { userId } }),
    ]);

    return { items, total, page, pageSize: take };
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  async adminCreate(dto: CreateProductDto) {
    return this.prisma.pointsProduct.create({
      data: {
        name: dto.name,
        description: dto.description,
        coverImage: dto.coverImage,
        category: dto.category,
        pointsCost: dto.pointsCost,
        originalPrice: dto.originalPrice,
        stock: dto.stock ?? 0,
        metadata: dto.metadata as object | undefined,
      },
    });
  }

  async adminUpdate(id: string, dto: Partial<CreateProductDto>) {
    const product = await this.prisma.pointsProduct.findUnique({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    const { metadata, ...rest } = dto;
    return this.prisma.pointsProduct.update({
      where: { id },
      data: { ...rest, ...(metadata !== undefined ? { metadata: metadata as object } : {}) },
    });
  }

  async adminDeactivate(id: string) {
    const product = await this.prisma.pointsProduct.findUnique({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return this.prisma.pointsProduct.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
