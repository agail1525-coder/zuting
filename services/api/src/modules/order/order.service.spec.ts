import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrderService } from './order.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TripStateMachine } from '../../common/trip-state-machine';

describe('OrderService', () => {
  let service: OrderService;
  let prisma: Record<string, any>;
  let stateMachine: Record<string, any>;

  const mockTrip = {
    id: 'trip-1',
    userId: 'user-1',
    title: 'Test Trip',
    status: 'CONFIRMED',
  };

  const mockOrder = {
    id: 'order-1',
    orderNo: 'ZT20260325001',
    tripId: 'trip-1',
    userId: 'user-1',
    totalAmount: 9999,
    paidAmount: null,
    status: 'PENDING',
    paymentMethod: 'wechat',
    paymentId: null,
    paidAt: null,
    cancelledAt: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      trip: { findUnique: jest.fn() },
      order: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };

    stateMachine = {
      transition: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: prisma },
        { provide: TripStateMachine, useValue: stateMachine },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  describe('create', () => {
    it('should create an order with correct amount for a CONFIRMED trip', async () => {
      prisma.trip.findUnique.mockResolvedValue(mockTrip);
      prisma.order.findFirst.mockResolvedValue(null); // no existing pending order
      prisma.order.create.mockResolvedValue({ ...mockOrder, trip: mockTrip });

      const result = await service.create({
        tripId: 'trip-1',
        totalAmount: 9999,
        paymentMethod: 'wechat',
      }, 'user-1');

      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tripId: 'trip-1',
            userId: 'user-1',
            totalAmount: 9999,
          }),
        }),
      );
      expect(result.trip).toBeDefined();
    });

    it('should throw NotFoundException if trip does not exist', async () => {
      prisma.trip.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          tripId: 'nonexistent',
          totalAmount: 100,
          paymentMethod: 'wechat',
        }, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if trip belongs to another user', async () => {
      prisma.trip.findUnique.mockResolvedValue(mockTrip);

      await expect(
        service.create({
          tripId: 'trip-1',
          totalAmount: 100,
          paymentMethod: 'wechat',
        }, 'user-2'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if trip is not CONFIRMED', async () => {
      prisma.trip.findUnique.mockResolvedValue({ ...mockTrip, status: 'DRAFT' });

      await expect(
        service.create({
          tripId: 'trip-1',
          totalAmount: 100,
          paymentMethod: 'wechat',
        }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if trip already has a pending order', async () => {
      prisma.trip.findUnique.mockResolvedValue(mockTrip);
      prisma.order.findFirst.mockResolvedValue(mockOrder);

      await expect(
        service.create({
          tripId: 'trip-1',
          totalAmount: 100,
          paymentMethod: 'wechat',
        }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('pay', () => {
    it('should update order status to PAID and transition trip', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      const paidOrder = {
        ...mockOrder,
        status: 'PAID',
        paidAmount: 9999,
        paidAt: new Date(),
      };
      prisma.order.update.mockResolvedValue(paidOrder);

      const result = await service.pay('order-1', 'user-1', {
        paymentMethod: 'wechat',
      });

      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-1' },
          data: expect.objectContaining({
            status: 'PAID',
          }),
        }),
      );
      expect(stateMachine.transition).toHaveBeenCalledWith(
        'trip-1',
        'PAID',
        'payment_success',
        'system',
        expect.stringContaining('paid'),
      );
      expect(result.status).toBe('PAID');
    });

    it('should throw NotFoundException if order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.pay('nonexistent', 'user-1', { paymentMethod: 'wechat' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if order belongs to another user', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.pay('order-1', 'user-2', { paymentMethod: 'wechat' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if order is not PENDING', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: 'PAID' });

      await expect(
        service.pay('order-1', 'user-1', { paymentMethod: 'wechat' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should update order status to CANCELLED', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'CANCELLED',
        cancelledAt: new Date(),
      });

      const result = await service.cancel('order-1', 'user-1');

      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'CANCELLED' }),
        }),
      );
      expect(result.status).toBe('CANCELLED');
    });

    it('should throw BadRequestException when cancelling a PAID order', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: 'PAID' });

      await expect(service.cancel('order-1', 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.cancel('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if order belongs to another user', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(service.cancel('order-1', 'user-2')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('refund', () => {
    it('should update order status to REFUNDING and transition trip', async () => {
      const paidOrder = { ...mockOrder, status: 'PAID' };
      prisma.order.findUnique.mockResolvedValue(paidOrder);
      prisma.order.update.mockResolvedValue({ ...paidOrder, status: 'REFUNDING' });

      const result = await service.refund('order-1', 'user-1', 'Changed my mind');

      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'REFUNDING' },
        }),
      );
      expect(stateMachine.transition).toHaveBeenCalledWith(
        'trip-1',
        'REFUNDING',
        'request_refund',
        'system',
        'Changed my mind',
      );
      expect(result.status).toBe('REFUNDING');
    });

    it('should throw BadRequestException when refunding a PENDING order', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder); // status: PENDING

      await expect(service.refund('order-1', 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.refund('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if order belongs to another user', async () => {
      const paidOrder = { ...mockOrder, status: 'PAID' };
      prisma.order.findUnique.mockResolvedValue(paidOrder);

      await expect(service.refund('order-1', 'user-2')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne', () => {
    it('should return order with trip details', async () => {
      const orderWithTrip = { ...mockOrder, trip: mockTrip };
      prisma.order.findUnique.mockResolvedValue(orderWithTrip);

      const result = await service.findOne('order-1', 'user-1');
      expect(result).toEqual(orderWithTrip);
    });

    it('should throw NotFoundException if order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if order belongs to another user', async () => {
      const orderWithTrip = { ...mockOrder, trip: mockTrip };
      prisma.order.findUnique.mockResolvedValue(orderWithTrip);

      await expect(service.findOne('order-1', 'user-2')).rejects.toThrow(ForbiddenException);
    });
  });
});
