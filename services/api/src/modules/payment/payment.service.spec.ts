import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TripStateMachine } from '../../common/trip-state-machine';
import { WechatPayGateway } from './gateways/wechat-pay.gateway';
import { AlipayGateway } from './gateways/alipay.gateway';
import { StripeGateway } from './gateways/stripe.gateway';
import { PaymentSignatureException } from './payment.errors';

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: Record<string, any>;
  let stateMachine: Record<string, any>;
  let wechatGw: Record<string, any>;
  let alipayGw: Record<string, any>;
  let stripeGw: Record<string, any>;

  const mockOrder = {
    id: 'order-1',
    orderNo: 'ZT20260325001',
    tripId: 'trip-1',
    userId: 'user-1',
    totalAmount: 9999,
    paidAmount: null,
    status: 'PENDING',
    trip: { id: 'trip-1', title: 'Test Trip' },
  };

  const mockTransaction = {
    id: 'txn-1',
    orderId: 'order-1',
    gateway: 'wechat',
    amount: 9999,
    currency: 'CNY',
    status: 'PENDING',
    transactionId: null,
    callbackPayload: null,
  };

  beforeEach(async () => {
    prisma = {
      order: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      paymentTransaction: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    stateMachine = {
      transition: jest.fn().mockResolvedValue({}),
    };

    wechatGw = {
      name: 'wechat',
      isMockMode: jest.fn().mockReturnValue(true),
      createPayment: jest.fn().mockResolvedValue({ gateway: 'wechat', mock: true, prepayId: 'wx_mock_123' }),
      verifyCallback: jest.fn().mockResolvedValue(true),
      parseCallback: jest.fn(),
      queryPayment: jest.fn(),
      processRefund: jest.fn(),
    };

    alipayGw = {
      name: 'alipay',
      isMockMode: jest.fn().mockReturnValue(true),
      createPayment: jest.fn().mockResolvedValue({ gateway: 'alipay', mock: true, tradeNo: 'ali_mock_123' }),
      verifyCallback: jest.fn().mockResolvedValue(true),
      parseCallback: jest.fn(),
      queryPayment: jest.fn(),
      processRefund: jest.fn(),
    };

    stripeGw = {
      name: 'stripe',
      isMockMode: jest.fn().mockReturnValue(true),
      createPayment: jest.fn().mockResolvedValue({ gateway: 'stripe', mock: true, clientSecret: 'stripe_mock' }),
      verifyCallback: jest.fn().mockResolvedValue(true),
      parseCallback: jest.fn(),
      queryPayment: jest.fn(),
      processRefund: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: prisma },
        { provide: TripStateMachine, useValue: stateMachine },
        { provide: WechatPayGateway, useValue: wechatGw },
        { provide: AlipayGateway, useValue: alipayGw },
        { provide: StripeGateway, useValue: stripeGw },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  describe('createPayment', () => {
    it('should create a transaction record and return gateway params', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.paymentTransaction.findFirst.mockResolvedValue(null);
      prisma.paymentTransaction.create.mockResolvedValue(mockTransaction);

      const result = await service.createPayment('order-1', 'wechat', 'user-1');

      expect(prisma.paymentTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderId: 'order-1',
            gateway: 'wechat',
            amount: 9999,
            currency: 'CNY',
            status: 'PENDING',
          }),
        }),
      );
      expect(wechatGw.createPayment).toHaveBeenCalled();
      expect(result).toHaveProperty('transaction');
      expect(result).toHaveProperty('paymentParams');
    });

    it('should reuse existing pending transaction instead of creating a new one', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.paymentTransaction.findFirst.mockResolvedValue(mockTransaction);

      const result = await service.createPayment('order-1', 'wechat', 'user-1');

      expect(prisma.paymentTransaction.create).not.toHaveBeenCalled();
      expect(result.transaction).toEqual(mockTransaction);
    });

    it('should throw NotFoundException if order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.createPayment('nonexistent', 'wechat', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if order is not PENDING', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: 'PAID' });

      await expect(
        service.createPayment('order-1', 'wechat', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user does not own the order', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.createPayment('order-1', 'wechat', 'other-user'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for unsupported gateway', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.paymentTransaction.findFirst.mockResolvedValue(null);
      prisma.paymentTransaction.create.mockResolvedValue(mockTransaction);

      await expect(
        service.createPayment('order-1', 'paypal', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should mark transaction FAILED if gateway call throws', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.paymentTransaction.findFirst.mockResolvedValue(null);
      prisma.paymentTransaction.create.mockResolvedValue(mockTransaction);
      prisma.paymentTransaction.update.mockResolvedValue({});
      wechatGw.createPayment.mockRejectedValue(new Error('Gateway down'));

      await expect(
        service.createPayment('order-1', 'wechat', 'user-1'),
      ).rejects.toThrow();

      expect(prisma.paymentTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'txn-1' },
          data: { status: 'FAILED' },
        }),
      );
    });
  });

  describe('handleGatewayCallback (via handleWechatCallback)', () => {
    it('should update transaction and order status on successful callback', async () => {
      const txnWithOrder = {
        ...mockTransaction,
        order: mockOrder,
      };

      wechatGw.parseCallback.mockResolvedValue({
        transactionId: 'txn-1',
        gatewayTransactionId: 'wx_txn_12345',
        success: true,
        rawData: { result_code: 'SUCCESS' },
      });

      prisma.paymentTransaction.findUnique.mockResolvedValue(txnWithOrder);
      prisma.paymentTransaction.update.mockResolvedValue({});
      prisma.order.update.mockResolvedValue({});

      const result = await service.handleWechatCallback({
        result_code: 'SUCCESS',
      });

      expect(result).toEqual({ success: true, status: 'SUCCESS' });
      expect(prisma.paymentTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'SUCCESS' }),
        }),
      );
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PAID' }),
        }),
      );
      expect(stateMachine.transition).toHaveBeenCalledWith(
        'trip-1',
        'PAID',
        'payment_success',
        'system',
        expect.any(String),
      );
    });

    it('should be idempotent — skip already-processed transactions', async () => {
      const processedTxn = {
        ...mockTransaction,
        status: 'SUCCESS',
        order: mockOrder,
      };

      wechatGw.parseCallback.mockResolvedValue({
        transactionId: 'txn-1',
        gatewayTransactionId: 'wx_txn_12345',
        success: true,
        rawData: {},
      });

      prisma.paymentTransaction.findUnique.mockResolvedValue(processedTxn);

      const result = await service.handleWechatCallback({});

      expect(result).toEqual({ success: true, message: 'Already processed' });
      expect(prisma.paymentTransaction.update).not.toHaveBeenCalled();
      expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('should throw PaymentSignatureException for invalid callback signature', async () => {
      wechatGw.verifyCallback.mockResolvedValue(false);

      await expect(
        service.handleWechatCallback({ bad: 'data' }),
      ).rejects.toThrow(PaymentSignatureException);
    });
  });

  describe('queryPaymentFromGateway', () => {
    it('should query gateway and return combined status', async () => {
      prisma.paymentTransaction.findUnique.mockResolvedValue(mockTransaction);
      wechatGw.queryPayment.mockResolvedValue({
        transactionId: 'txn-1',
        gatewayTransactionId: 'wx_txn_12345',
        status: 'SUCCESS',
        amount: 9999,
        rawData: {},
      });

      const result = await service.queryPaymentFromGateway('txn-1');

      expect(result.localStatus).toBe('PENDING');
      expect(result.gatewayStatus).toBe('SUCCESS');
      expect(result.mock).toBe(true);
    });

    it('should throw NotFoundException for unknown transaction', async () => {
      prisma.paymentTransaction.findUnique.mockResolvedValue(null);

      await expect(
        service.queryPaymentFromGateway('nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getGatewayStatus', () => {
    it('should return mock mode status for all gateways', () => {
      const status = service.getGatewayStatus();

      expect(status).toEqual([
        { name: 'wechat', mockMode: true },
        { name: 'alipay', mockMode: true },
        { name: 'stripe', mockMode: true },
      ]);
    });
  });

  describe('processRefund', () => {
    it('should create a refund transaction record', async () => {
      const paidOrder = {
        ...mockOrder,
        status: 'PAID',
        paidAmount: 9999,
        transactions: [
          {
            ...mockTransaction,
            status: 'SUCCESS',
            transactionId: 'wx_txn_12345',
          },
        ],
      };
      prisma.order.findUnique.mockResolvedValue(paidOrder);

      wechatGw.processRefund.mockResolvedValue({
        refundId: 'wx_refund_123',
        success: true,
      });

      const refundTxn = {
        id: 'txn-refund-1',
        orderId: 'order-1',
        gateway: 'wechat',
        transactionId: 'wx_refund_123',
        amount: -9999,
        currency: 'CNY',
        status: 'REFUNDED',
      };
      prisma.paymentTransaction.create.mockResolvedValue(refundTxn);
      prisma.order.update.mockResolvedValue({});

      const result = await service.processRefund('order-1');

      expect(wechatGw.processRefund).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 9999 }),
      );
      expect(prisma.paymentTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: -9999,
            status: 'REFUNDED',
          }),
        }),
      );
      expect(result.success).toBe(true);
      expect(result.refundTransaction).toEqual(refundTxn);
    });

    it('should throw BadRequestException if order is not PAID or REFUNDING', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'PENDING',
        transactions: [],
      });

      await expect(service.processRefund('order-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if no successful transaction found', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'PAID',
        transactions: [],
      });

      await expect(service.processRefund('order-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.processRefund('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
