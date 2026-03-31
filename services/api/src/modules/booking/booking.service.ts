import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '@prisma/client';
import { generateOrderNo } from '../../common/utils';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

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

  // Admin: update booking status
  async adminUpdateStatus(id: string, status: string) {
    const booking = await this.prisma.routeBooking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    const validStatuses: string[] = ['PENDING', 'CONFIRMED', 'PAID', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate transitions
    const currentStatus = booking.status;
    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PAID', 'CANCELLED'],
      PAID: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    const allowed = allowedTransitions[currentStatus] ?? [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${status}. Allowed: ${allowed.join(', ') || 'none (terminal state)'}`,
      );
    }

    // When confirming a booking, create a linked Order for payment
    if (status === 'CONFIRMED' && !booking.orderId) {
      const order = await this.prisma.order.create({
        data: {
          orderNo: generateOrderNo(),
          userId: booking.userId,
          totalAmount: booking.totalPrice,
          status: 'PENDING',
        },
      });

      this.logger.log(
        `Order ${order.orderNo} created for booking ${id} (amount: ${order.totalAmount})`,
      );

      return this.prisma.routeBooking.update({
        where: { id },
        data: {
          status: status as BookingStatus,
          orderId: order.id,
        },
        include: {
          route: { select: { title: true, slug: true } },
          user: { select: { id: true, nickname: true } },
          order: true,
        },
      });
    }

    return this.prisma.routeBooking.update({
      where: { id },
      data: { status: status as BookingStatus },
      include: {
        route: { select: { title: true, slug: true } },
        user: { select: { id: true, nickname: true } },
        order: true,
      },
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
