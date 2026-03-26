import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrderStatus, TripStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TripStateMachine } from '../../common/trip-state-machine';
import { WechatPayGateway } from './gateways/wechat-pay.gateway';
import { AlipayGateway } from './gateways/alipay.gateway';
import { StripeGateway } from './gateways/stripe.gateway';
import type { PaymentGateway } from './gateways/payment-gateway.interface';
import {
  PaymentFailedException,
  PaymentTimeoutException,
  PaymentSignatureException,
  RefundFailedException,
} from './payment.errors';

/** Default timeout for gateway operations (15 seconds) */
const GATEWAY_TIMEOUT_MS = 15_000;

/** Default retry config */
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 5_000,
};

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly gateways: Record<string, PaymentGateway>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly stateMachine: TripStateMachine,
    private readonly wechatPayGateway: WechatPayGateway,
    private readonly alipayGateway: AlipayGateway,
    private readonly stripeGateway: StripeGateway,
  ) {
    this.gateways = {
      wechat: this.wechatPayGateway,
      alipay: this.alipayGateway,
      stripe: this.stripeGateway,
    };
  }

  private getGateway(name: string): PaymentGateway {
    const gw = this.gateways[name];
    if (!gw) {
      throw new BadRequestException(`Unsupported payment gateway: ${name}`);
    }
    return gw;
  }

  // ════════════════════════════════════════════════════════════════
  //  Create Payment
  // ════════════════════════════════════════════════════════════════

  async createPayment(orderId: string, gateway: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { trip: true },
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    if (order.userId !== userId) {
      throw new BadRequestException('You can only pay for your own orders');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Order must be PENDING to create a payment. Current: ${order.status}`,
      );
    }

    const gw = this.getGateway(gateway);

    // Check for existing pending transaction on this order for the same gateway
    const existingTxn = await this.prisma.paymentTransaction.findFirst({
      where: { orderId, gateway, status: 'PENDING' },
    });
    if (existingTxn) {
      this.logger.log(`Reusing existing pending transaction ${existingTxn.id} for order ${orderId}`);
      const paymentParams = await this.withTimeout(
        gw.createPayment({
          orderId,
          transactionId: existingTxn.id,
          amount: existingTxn.amount,
          currency: existingTxn.currency,
          description: `Zuting Order ${order.orderNo}`,
        }),
        gateway,
        'createPayment',
      );

      this.auditLog('PAYMENT_CREATE_REUSE', {
        orderId,
        transactionId: existingTxn.id,
        gateway,
        mock: gw.isMockMode(),
      });

      return { transaction: existingTxn, paymentParams };
    }

    // Create new transaction
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        orderId,
        gateway,
        amount: order.totalAmount,
        currency: 'CNY',
        status: 'PENDING',
      },
    });

    try {
      const paymentParams = await this.withTimeout(
        gw.createPayment({
          orderId,
          transactionId: transaction.id,
          amount: transaction.amount,
          currency: transaction.currency,
          description: `Zuting Order ${order.orderNo}`,
        }),
        gateway,
        'createPayment',
      );

      this.auditLog('PAYMENT_CREATE', {
        orderId,
        transactionId: transaction.id,
        gateway,
        amount: transaction.amount,
        currency: transaction.currency,
        mock: gw.isMockMode(),
      });

      return { transaction, paymentParams };
    } catch (err) {
      // Mark the transaction as FAILED if gateway call fails
      await this.prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });

      this.auditLog('PAYMENT_CREATE_FAILED', {
        orderId,
        transactionId: transaction.id,
        gateway,
        error: err.message,
      });

      throw err;
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  Handle Gateway Callbacks
  // ════════════════════════════════════════════════════════════════

  async handleWechatCallback(body: any, headers?: Record<string, string>) {
    return this.handleGatewayCallback('wechat', body, headers);
  }

  async handleAlipayCallback(body: any) {
    return this.handleGatewayCallback('alipay', body);
  }

  async handleStripeCallback(body: any, headers?: Record<string, string>) {
    return this.handleGatewayCallback('stripe', body, headers);
  }

  private async handleGatewayCallback(
    gatewayName: string,
    body: any,
    headers?: Record<string, string>,
  ) {
    const gw = this.getGateway(gatewayName);

    this.auditLog('CALLBACK_RECEIVED', {
      gateway: gatewayName,
      bodyKeys: typeof body === 'object' ? Object.keys(body) : ['raw'],
    });

    // 1. Verify callback authenticity
    const isValid = await gw.verifyCallback(body, headers);
    if (!isValid) {
      this.auditLog('CALLBACK_SIGNATURE_INVALID', { gateway: gatewayName });
      throw new PaymentSignatureException(gatewayName);
    }

    // 2. Parse callback data
    const result = await gw.parseCallback(body);
    this.logger.log(
      `${gatewayName} callback parsed: txn=${result.transactionId}, success=${result.success}`,
    );

    if (!result.transactionId) {
      this.auditLog('CALLBACK_NO_TRANSACTION_ID', { gateway: gatewayName, rawData: result.rawData });
      throw new BadRequestException('Cannot identify transaction from callback');
    }

    // 3. Find the transaction
    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { id: result.transactionId },
      include: { order: true },
    });
    if (!transaction) {
      this.logger.warn(`Transaction ${result.transactionId} not found for ${gatewayName} callback`);
      throw new NotFoundException(`Transaction ${result.transactionId} not found`);
    }

    // Idempotency: skip if already processed
    if (transaction.status !== 'PENDING') {
      this.auditLog('CALLBACK_IDEMPOTENT_SKIP', {
        gateway: gatewayName,
        transactionId: transaction.id,
        existingStatus: transaction.status,
      });
      this.logger.log(`Transaction ${transaction.id} already processed (status: ${transaction.status}), skipping`);
      return { success: true, message: 'Already processed' };
    }

    const newStatus = result.success ? 'SUCCESS' : 'FAILED';

    // 4. Update transaction
    await this.prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: newStatus,
        transactionId: result.gatewayTransactionId,
        callbackPayload: result.rawData,
      },
    });

    this.auditLog('CALLBACK_PROCESSED', {
      gateway: gatewayName,
      transactionId: transaction.id,
      gatewayTransactionId: result.gatewayTransactionId,
      newStatus,
      orderId: transaction.orderId,
    });

    // 5. If payment succeeded, update order and trip
    if (result.success) {
      await this.prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          status: OrderStatus.PAID,
          paidAmount: transaction.amount,
          paymentMethod: gatewayName,
          paymentId: result.gatewayTransactionId,
          paidAt: new Date(),
        },
      });

      // Transition trip to PAID
      try {
        await this.stateMachine.transition(
          transaction.order.tripId,
          TripStatus.PAID,
          'payment_success',
          'system',
          `Payment via ${gatewayName}, txn: ${result.gatewayTransactionId}`,
        );
        this.logger.log(`Trip ${transaction.order.tripId} transitioned to PAID`);
      } catch (err) {
        this.logger.error(
          `Failed to transition trip ${transaction.order.tripId} to PAID: ${err.message}`,
        );
      }
    }

    return { success: true, status: newStatus };
  }

  // ════════════════════════════════════════════════════════════════
  //  Query Payment Status
  // ════════════════════════════════════════════════════════════════

  async getPaymentStatus(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    return {
      orderId: order.id,
      orderNo: order.orderNo,
      orderStatus: order.status,
      totalAmount: order.totalAmount,
      paidAmount: order.paidAmount,
      transactions: order.transactions,
    };
  }

  /**
   * Query payment status from the gateway directly (with retry).
   * Useful for reconciliation and when callbacks are delayed.
   */
  async queryPaymentFromGateway(transactionId: string) {
    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction ${transactionId} not found`);
    }

    const gw = this.getGateway(transaction.gateway);

    const result = await this.withRetry(
      () => gw.queryPayment(transactionId),
      transaction.gateway,
      'queryPayment',
    );

    this.auditLog('PAYMENT_QUERY', {
      gateway: transaction.gateway,
      transactionId,
      gatewayStatus: result.status,
      mock: gw.isMockMode(),
    });

    return {
      transactionId,
      gateway: transaction.gateway,
      localStatus: transaction.status,
      gatewayStatus: result.status,
      gatewayTransactionId: result.gatewayTransactionId,
      amount: result.amount,
      mock: gw.isMockMode(),
    };
  }

  // ════════════════════════════════════════════════════════════════
  //  Process Refund
  // ════════════════════════════════════════════════════════════════

  async processRefund(orderId: string, amount?: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        transactions: {
          where: { status: 'SUCCESS' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.REFUNDING) {
      throw new BadRequestException(
        `Order must be PAID or REFUNDING to process a refund. Current: ${order.status}`,
      );
    }

    const successfulTxn = order.transactions[0];
    if (!successfulTxn) {
      throw new BadRequestException('No successful payment transaction found for this order');
    }

    const refundAmount = amount ?? order.paidAmount ?? order.totalAmount;
    const gw = this.getGateway(successfulTxn.gateway);

    this.auditLog('REFUND_INITIATED', {
      orderId,
      gateway: successfulTxn.gateway,
      transactionId: successfulTxn.id,
      refundAmount,
      mock: gw.isMockMode(),
    });

    // Call gateway refund with retry
    let refundResult: { refundId: string; success: boolean };
    try {
      refundResult = await this.withRetry(
        () =>
          gw.processRefund({
            transactionId: successfulTxn.id,
            gatewayTransactionId: successfulTxn.transactionId || '',
            amount: refundAmount,
            currency: successfulTxn.currency,
            reason: `Refund for order ${order.orderNo}`,
          }),
        successfulTxn.gateway,
        'refund',
      );
    } catch (err) {
      this.auditLog('REFUND_FAILED', {
        orderId,
        gateway: successfulTxn.gateway,
        error: err.message,
      });
      throw new RefundFailedException(successfulTxn.gateway, err.message);
    }

    // Create refund transaction record
    const refundTxn = await this.prisma.paymentTransaction.create({
      data: {
        orderId,
        gateway: successfulTxn.gateway,
        transactionId: refundResult.refundId,
        amount: -refundAmount, // negative amount indicates refund
        currency: successfulTxn.currency,
        status: refundResult.success ? 'REFUNDED' : 'FAILED',
      },
    });

    // Update order status
    if (refundResult.success) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.REFUNDED },
      });

      // Transition trip to REFUNDED
      try {
        await this.stateMachine.transition(
          order.tripId,
          TripStatus.REFUNDED,
          'refund_approved',
          'system',
          `Refund processed: ${refundResult.refundId}`,
        );
      } catch (err) {
        this.logger.error(`Failed to transition trip to REFUNDED: ${err.message}`);
      }

      this.auditLog('REFUND_SUCCESS', {
        orderId,
        gateway: successfulTxn.gateway,
        refundId: refundResult.refundId,
        refundAmount,
      });
    } else {
      this.auditLog('REFUND_GATEWAY_REJECTED', {
        orderId,
        gateway: successfulTxn.gateway,
        refundId: refundResult.refundId,
      });
    }

    return { refundTransaction: refundTxn, success: refundResult.success };
  }

  // ════════════════════════════════════════════════════════════════
  //  Gateway Info (for health checks / admin)
  // ════════════════════════════════════════════════════════════════

  getGatewayStatus() {
    return Object.entries(this.gateways).map(([name, gw]) => ({
      name,
      mockMode: gw.isMockMode(),
    }));
  }

  // ════════════════════════════════════════════════════════════════
  //  Internal: Retry, Timeout, Audit
  // ════════════════════════════════════════════════════════════════

  /**
   * Wrap a promise with a timeout.
   */
  private withTimeout<T>(
    promise: Promise<T>,
    gateway: string,
    operation: string,
    timeoutMs = GATEWAY_TIMEOUT_MS,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.auditLog('PAYMENT_TIMEOUT', { gateway, operation, timeoutMs });
        reject(new PaymentTimeoutException(gateway, operation));
      }, timeoutMs);

      promise
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  /**
   * Retry a gateway operation with exponential backoff.
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    gateway: string,
    operation: string,
    config = RETRY_CONFIG,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await this.withTimeout(fn(), gateway, operation);
      } catch (err) {
        lastError = err;

        // Don't retry on client errors (4xx) or timeout
        if (err instanceof PaymentTimeoutException) throw err;
        if (err?.status >= 400 && err?.status < 500) throw err;

        if (attempt < config.maxRetries) {
          const delay = Math.min(
            config.baseDelayMs * Math.pow(2, attempt),
            config.maxDelayMs,
          );
          this.logger.warn(
            `[${gateway}] ${operation} attempt ${attempt + 1} failed, retrying in ${delay}ms: ${err.message}`,
          );
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    this.auditLog('PAYMENT_RETRY_EXHAUSTED', {
      gateway,
      operation,
      maxRetries: config.maxRetries,
      lastError: lastError?.message,
    });

    throw lastError || new PaymentFailedException(gateway, `${operation} failed after retries`);
  }

  /**
   * Structured audit log for payment events.
   * All payment operations should be traceable for compliance.
   */
  private auditLog(event: string, data: Record<string, any>) {
    this.logger.log(
      JSON.stringify({
        audit: true,
        event,
        timestamp: new Date().toISOString(),
        ...data,
      }),
    );
  }
}
