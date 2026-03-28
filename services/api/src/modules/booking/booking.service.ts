import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
    // Verify route exists and is published
    const route = await this.prisma.route.findUnique({ where: { id: dto.routeId } });
    if (!route) throw new NotFoundException('Route not found');
    if (route.status !== 'PUBLISHED') throw new BadRequestException('Route is not available for booking');

    const totalPrice = route.priceFrom * dto.persons;

    const booking = await this.prisma.routeBooking.create({
      data: {
        routeId: dto.routeId,
        userId,
        startDate: new Date(dto.startDate),
        persons: dto.persons,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        note: dto.note,
        totalPrice,
      },
      include: { route: { select: { title: true, slug: true, duration: true } } },
    });

    // Increment booking count
    await this.prisma.route.update({
      where: { id: dto.routeId },
      data: { bookCount: { increment: 1 } },
    });

    return booking;
  }

  async findByUser(userId: string, page = 1, pageSize = 20) {
    const take = Math.min(pageSize, 50);
    const skip = (page - 1) * take;

    const [items, total] = await Promise.all([
      this.prisma.routeBooking.findMany({
        where: { userId },
        include: {
          route: { select: { title: true, titleEn: true, slug: true, duration: true, nights: true, coverImage: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.routeBooking.count({ where: { userId } }),
    ]);

    return { items, total, page, pageSize: take };
  }

  async findById(id: string, userId: string) {
    const booking = await this.prisma.routeBooking.findUnique({
      where: { id },
      include: {
        route: true,
        user: { select: { id: true, nickname: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) throw new ForbiddenException('Access denied');
    return booking;
  }

  async cancel(id: string, userId: string) {
    const booking = await this.prisma.routeBooking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) throw new ForbiddenException('Access denied');
    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Booking cannot be cancelled in current status');
    }

    return this.prisma.routeBooking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });
  }

  // Admin: list all bookings
  async findAll(page = 1, pageSize = 20, status?: string) {
    const take = Math.min(pageSize, 50);
    const skip = (page - 1) * take;
    const where = status ? { status: status as BookingStatus } : {};

    const [items, total] = await Promise.all([
      this.prisma.routeBooking.findMany({
        where,
        include: {
          route: { select: { title: true, slug: true } },
          user: { select: { id: true, nickname: true, phone: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.routeBooking.count({ where }),
    ]);

    return { items, total, page, pageSize: take };
  }
}
