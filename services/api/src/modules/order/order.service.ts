import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { OrderStatus, TripStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TripStateMachine } from '../../common/trip-state-machine';
import { generateOrderNo } from '../../common/utils';
import { CreateOrderDto } from './dto/create-order.dto';
import { PayOrderDto } from './dto/pay-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stateMachine: TripStateMachine,
  ) {}

  /** Create a new order for a confirmed trip */
  async create(dto: CreateOrderDto, currentUserId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: dto.tripId } });
    if (!trip) throw new NotFoundException(`Trip ${dto.tripId} not found`);

    if (trip.userId !== currentUserId) {
      throw new ForbiddenException('You can only create orders for your own trips');
    }

    if (trip.status !== TripStatus.CONFIRMED) {
      throw new BadRequestException(
        `Trip must be in CONFIRMED status to create an order. Current: ${trip.status}`,
      );
    }

    // Check for existing unpaid order
    const existingOrder = await this.prisma.order.findFirst({
      where: {
        tripId: dto.tripId,
        status: OrderStatus.PENDING,
      },
    });
    if (existingOrder) {
      throw new BadRequestException(
        `Trip already has a pending order: ${existingOrder.orderNo}`,
      );
    }

    return this.prisma.order.create({
      data: {
        orderNo: generateOrderNo(),
        tripId: dto.tripId,
        userId: currentUserId,
        totalAmount: dto.totalAmount,
        paymentMethod: dto.paymentMethod,
      },
      include: { trip: true },
    });
  }

  /** List orders — always scoped to authenticated user */
  async findAll(params: {
    userId: string;
    tripId?: string;
    status?: OrderStatus;
    page?: number;
    limit?: number;
  }) {
    const { userId, tripId, status, page = 1, limit = 20 } = params;
    const take = Math.min(limit, 100);
    const where: Record<string, unknown> = { userId };
    if (tripId) where.tripId = tripId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          trip: { select: { id: true, title: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /** Get order detail — verifies ownership */
  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            sites: { include: { site: true } },
            user: { select: { id: true, nickname: true } },
          },
        },
      },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    if (order.userId !== userId) throw new ForbiddenException('You can only view your own orders');
    return order;
  }

  /** Verify order exists and belongs to user */
  private async findOrderWithOwnership(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    if (order.userId !== userId) throw new ForbiddenException('You can only operate on your own orders');
    return order;
  }

  /**
   * Simulate payment (dev mode).
   * In production this would be called by a payment gateway callback.
   */
  async pay(id: string, userId: string, dto: PayOrderDto) {
    const order = await this.findOrderWithOwnership(id, userId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Order is not PENDING. Current: ${order.status}`);
    }

    // Update order to PAID
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.PAID,
        paidAmount: dto.paidAmount ?? order.totalAmount,
        paymentMethod: dto.paymentMethod,
        paymentId: dto.paymentId ?? `SIM_${Date.now()}`,
        paidAt: new Date(),
      },
    });

    // Transition trip to PAID status
    await this.stateMachine.transition(
      order.tripId,
      TripStatus.PAID,
      'payment_success',
      'system',
      `Order ${order.orderNo} paid`,
    );

    return updatedOrder;
  }

  /** Cancel a pending order */
  async cancel(id: string, userId: string) {
    const order = await this.findOrderWithOwnership(id, userId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Only PENDING orders can be cancelled. Current: ${order.status}`);
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
  }

  /** Request a refund for a paid order */
  async refund(id: string, userId: string, reason?: string) {
    const order = await this.findOrderWithOwnership(id, userId);

    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException(`Only PAID orders can be refunded. Current: ${order.status}`);
    }

    // Update order to REFUNDING
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.REFUNDING },
    });

    // Transition trip to REFUNDING
    try {
      await this.stateMachine.transition(
        order.tripId,
        TripStatus.REFUNDING,
        'request_refund',
        'system',
        reason ?? `Refund requested for order ${order.orderNo}`,
      );
    } catch {
      // Trip may already be in a state that doesn't allow this transition; that's OK
    }

    return updatedOrder;
  }
}
