import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { BookPackageDto } from './dto/book-package.dto';
import { PackageQueryDto } from './dto/package-query.dto';

@Injectable()
export class PackageService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public: list active packages with optional filters */
  async findAll(params: PackageQueryDto) {
    const { type, minPrice, maxPrice, page = 1, limit = 20 } = params;
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const where: Prisma.TravelPackageWhereInput = {
      isActive: true,
      ...(type ? { packageType: type } : {}),
      ...(minPrice != null || maxPrice != null
        ? {
            basePrice: {
              ...(minPrice != null ? { gte: minPrice } : {}),
              ...(maxPrice != null ? { lte: maxPrice } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.travelPackage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: { _count: { select: { bookings: true } } },
      }),
      this.prisma.travelPackage.count({ where }),
    ]);

    return { items, total, page, pageSize: take };
  }

  /** Public: package detail with booking count */
  async findOne(id: string) {
    const pkg = await this.prisma.travelPackage.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } },
    });
    if (!pkg) throw new NotFoundException(`Package ${id} not found`);
    return pkg;
  }

  /** Authenticated: book a package */
  async book(userId: string, packageId: string, dto: BookPackageDto) {
    const pkg = await this.prisma.travelPackage.findUnique({
      where: { id: packageId },
    });
    if (!pkg) throw new NotFoundException(`Package ${packageId} not found`);
    if (!pkg.isActive) throw new BadRequestException('Package is not available');
    if (dto.persons > pkg.maxPersons) {
      throw new BadRequestException(
        `Maximum persons for this package is ${pkg.maxPersons}`,
      );
    }

    // Determine price: memberPrice for Lv3+ members, else basePrice
    let unitPrice = pkg.basePrice;
    if (pkg.memberPrice != null) {
      const membership = await this.prisma.membership.findUnique({
        where: { userId },
      });
      if (membership && membership.level >= 3) {
        unitPrice = pkg.memberPrice;
      }
    }

    const totalPrice = unitPrice * dto.persons;

    return this.prisma.packageBooking.create({
      data: {
        packageId,
        userId,
        persons: dto.persons,
        totalPrice,
        startDate: new Date(dto.startDate),
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        status: 'PENDING',
      },
      include: { package: true },
    });
  }

  /** Authenticated: user's bookings */
  async getMyBookings(userId: string, page = 1, limit = 20) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const [items, total] = await Promise.all([
      this.prisma.packageBooking.findMany({
        where: { userId },
        include: { package: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.packageBooking.count({ where: { userId } }),
    ]);

    return { items, total, page, pageSize: take };
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  async adminCreate(dto: CreatePackageDto) {
    return this.prisma.travelPackage.create({
      data: {
        name: dto.name,
        description: dto.description,
        coverImage: dto.coverImage,
        packageType: dto.packageType,
        basePrice: dto.basePrice,
        memberPrice: dto.memberPrice,
        includes: dto.includes as object,
        duration: dto.duration,
        maxPersons: dto.maxPersons ?? 20,
        entityType: dto.entityType,
        entityIds: dto.entityIds ?? [],
      },
    });
  }

  async adminUpdate(id: string, dto: Partial<CreatePackageDto>) {
    const pkg = await this.prisma.travelPackage.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException(`Package ${id} not found`);

    const { entityIds, includes, ...rest } = dto;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = { ...rest };
    if (entityIds != null) data['entityIds'] = entityIds;
    if (includes !== undefined) data['includes'] = includes;
    return this.prisma.travelPackage.update({
      where: { id },
      data,
    });
  }
}
