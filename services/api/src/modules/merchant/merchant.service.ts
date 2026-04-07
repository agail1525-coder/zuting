import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

@Injectable()
export class MerchantService {
  constructor(private readonly prisma: PrismaService) {}

  /** Register a new merchant (one per user) */
  async register(userId: string, dto: RegisterMerchantDto) {
    const existing = await this.prisma.merchant.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new ConflictException('You have already registered as a merchant');
    }

    return this.prisma.merchant.create({
      data: {
        userId,
        type: dto.type,
        name: dto.name,
        description: dto.description,
        logo: dto.logo,
        license: dto.license,
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        address: dto.address,
        province: dto.province,
        city: dto.city,
      },
    });
  }

  /** Get my merchant profile */
  async findMy(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
      include: {
        services: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!merchant) {
      throw new NotFoundException('You have not registered as a merchant');
    }
    return merchant;
  }

  /** Update my merchant profile */
  async updateMy(userId: string, dto: UpdateMerchantDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });
    if (!merchant) {
      throw new NotFoundException('You have not registered as a merchant');
    }

    return this.prisma.merchant.update({
      where: { userId },
      data: { ...dto },
    });
  }

  /** Public: list merchants with filters */
  async findAll(
    type?: string,
    page = 1,
    pageSize = 20,
  ) {
    const take = Math.min(pageSize, 100);
    const skip = (page - 1) * take;

    const where: Record<string, unknown> = {
      status: { in: ['APPROVED', 'ACTIVE'] },
    };
    if (type) {
      where['type'] = type;
    }

    const [items, total] = await Promise.all([
      this.prisma.merchant.findMany({
        where,
        orderBy: { rating: 'desc' },
        skip,
        take,
        select: {
          id: true,
          type: true,
          name: true,
          description: true,
          logo: true,
          province: true,
          city: true,
          address: true,
          rating: true,
          totalOrders: true,
          status: true,
          createdAt: true,
          services: { where: { isActive: true }, select: { id: true, name: true, price: true, coverImage: true }, take: 20, orderBy: { createdAt: 'asc' } },
        },
      }),
      this.prisma.merchant.count({ where }),
    ]);

    return { items, total, page, pageSize: take };
  }

  /** Public: get merchant detail by id */
  async findOne(id: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
    if (!merchant) {
      throw new NotFoundException(`Merchant ${id} not found`);
    }
    // Only show approved/active merchants publicly
    if (!['APPROVED', 'ACTIVE'].includes(merchant.status)) {
      throw new NotFoundException(`Merchant ${id} not found`);
    }
    return merchant;
  }

  /** Admin: approve merchant */
  async approve(id: string) {
    const merchant = await this.findByIdOrThrow(id);
    if (merchant.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot approve merchant in status ${merchant.status}`,
      );
    }

    return this.prisma.merchant.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        rejectedReason: null,
      },
    });
  }

  /** Admin: suspend merchant */
  async suspend(id: string, reason?: string) {
    const merchant = await this.findByIdOrThrow(id);
    if (!['APPROVED', 'ACTIVE'].includes(merchant.status)) {
      throw new BadRequestException(
        `Cannot suspend merchant in status ${merchant.status}`,
      );
    }

    return this.prisma.merchant.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
        rejectedReason: reason ?? null,
      },
    });
  }

  /** Admin: reject merchant */
  async reject(id: string, reason?: string) {
    const merchant = await this.findByIdOrThrow(id);
    if (merchant.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot reject merchant in status ${merchant.status}`,
      );
    }

    return this.prisma.merchant.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedReason: reason ?? null,
      },
    });
  }

  /** Admin: stats overview */
  async getStats() {
    const [total, pending, approved, active, suspended, rejected] =
      await Promise.all([
        this.prisma.merchant.count(),
        this.prisma.merchant.count({ where: { status: 'PENDING' } }),
        this.prisma.merchant.count({ where: { status: 'APPROVED' } }),
        this.prisma.merchant.count({ where: { status: 'ACTIVE' } }),
        this.prisma.merchant.count({ where: { status: 'SUSPENDED' } }),
        this.prisma.merchant.count({ where: { status: 'REJECTED' } }),
      ]);

    const byType = await this.prisma.merchant.groupBy({
      by: ['type'],
      _count: { id: true },
    });

    return {
      total,
      pending,
      approved,
      active,
      suspended,
      rejected,
      byType: byType.map((t) => ({ type: t.type, count: t._count.id })),
    };
  }

  private async findByIdOrThrow(id: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id } });
    if (!merchant) {
      throw new NotFoundException(`Merchant ${id} not found`);
    }
    return merchant;
  }
}
