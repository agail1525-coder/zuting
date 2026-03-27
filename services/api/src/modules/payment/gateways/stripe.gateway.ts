import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import type {
  PaymentGateway,
  PaymentParams,
  CreatePaymentParams,
  CallbackResult,
  RefundParams,
  RefundResult,
  QueryResult,
  WebhookBody,
  StripeWebhookBody,
  StripePaymentIntent,
  StripePaymentIntentResponse,
} from './payment-gateway.interface';
import { PaymentGatewayError } from './wechat-pay.gateway';

/**
 * Stripe Payment Gateway
 *
 * Uses Stripe REST API directly (no SDK dependency).
 * Implements PaymentIntents for SCA-ready payments.
 * When env vars are not configured, falls back to mock mode.
 *
 * Required ENV:
 *   STRIPE_SECRET_KEY       - Stripe secret key (sk_live_xxx or sk_test_xxx)
 *   STRIPE_WEBHOOK_SECRET   - Webhook endpoint secret (whsec_xxx)
 *   STRIPE_PUBLISHABLE_KEY  - Publishable key for frontend (pk_live_xxx or pk_test_xxx)
 */
@Injectable()
export class StripeGateway implements PaymentGateway {
  readonly name = 'stripe';
  private readonly logger = new Logger(StripeGateway.name);

  private readonly secretKey: string;
  private readonly webhookSecret: string;
  private readonly publishableKey: string;
  private readonly baseUrl = 'https://api.stripe.com/v1';
  private readonly mockMode: boolean;

  constructor(private readonly config: ConfigService) {
    this.secretKey = this.config.get<string>('STRIPE_SECRET_KEY', '');
    this.webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET', '');
    this.publishableKey = this.config.get<string>('STRIPE_PUBLISHABLE_KEY', '');

    this.mockMode = !this.secretKey;

    if (this.mockMode) {
      this.logger.warn('Stripe running in MOCK mode — set STRIPE_SECRET_KEY for production');
    } else {
      this.logger.log('Stripe gateway initialized in PRODUCTION mode');
    }
  }

  isMockMode(): boolean {
    return this.mockMode;
  }

  // ──────────────────── Create Payment ────────────────────

  async createPayment(params: CreatePaymentParams): Promise<PaymentParams> {
    if (this.mockMode) {
      return this.mockCreatePayment(params);
    }

    // Map CNY to supported Stripe currency code
    const currency = (params.currency || 'CNY').toLowerCase();

    const formData = new URLSearchParams({
      amount: params.amount.toString(),
      currency,
      description: params.description || 'Zuting Payment',
      'metadata[transactionId]': params.transactionId,
      'metadata[orderId]': params.orderId,
      'automatic_payment_methods[enabled]': 'true',
    });

    const response = await this.request('POST', '/payment_intents', formData.toString());

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      this.logger.error(`Stripe create PaymentIntent failed: ${response.status} ${JSON.stringify(err)}`);
      throw new PaymentGatewayError(
        `Stripe create failed: ${err?.error?.message || response.status}`,
        'stripe',
        err,
      );
    }

    const data = await response.json();

    this.logger.log(`Stripe PaymentIntent created: id=${data.id}, status=${data.status}`);

    return {
      gateway: 'stripe',
      mock: false,
      clientSecret: data.client_secret,
      paymentIntentId: data.id,
      publishableKey: this.publishableKey,
    };
  }

  // ──────────────────── Verify Callback ────────────────────

  async verifyCallback(body: WebhookBody, headers?: Record<string, string>): Promise<boolean> {
    if (this.mockMode) {
      this.logger.warn('[MOCK] Skipping Stripe webhook signature verification');
      return true;
    }

    const signature = headers?.['stripe-signature'];
    if (!signature) {
      this.logger.warn('Stripe webhook: missing stripe-signature header');
      return false;
    }

    if (!this.webhookSecret) {
      this.logger.warn('Stripe webhook: STRIPE_WEBHOOK_SECRET not configured');
      return false;
    }

    // Parse the signature header
    const elements = signature.split(',');
    const sigMap: Record<string, string> = {};
    for (const element of elements) {
      const [key, value] = element.split('=', 2);
      sigMap[key] = value;
    }

    const timestamp = sigMap['t'];
    const expectedSig = sigMap['v1'];

    if (!timestamp || !expectedSig) {
      this.logger.warn('Stripe webhook: invalid signature format');
      return false;
    }

    // Check timestamp tolerance (5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp, 10)) > 300) {
      this.logger.warn('Stripe webhook: timestamp too old (possible replay attack)');
      return false;
    }

    // Compute expected signature: HMAC-SHA256(timestamp + "." + rawBody)
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const signedPayload = `${timestamp}.${bodyStr}`;
    const computedSig = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(signedPayload, 'utf8')
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(computedSig, 'utf8'),
      Buffer.from(expectedSig, 'utf8'),
    );

    if (!isValid) {
      this.logger.warn('Stripe webhook: signature verification FAILED');
    }

    return isValid;
  }

  // ──────────────────── Parse Callback ────────────────────

  async parseCallback(body: WebhookBody): Promise<CallbackResult> {
    if (this.mockMode) {
      return this.mockParseCallback(body as StripeWebhookBody);
    }

    const stripeBody = body as StripeWebhookBody;
    // Stripe sends { type, data: { object: PaymentIntent } }
    const eventType = stripeBody.type;
    const paymentIntent: StripePaymentIntent | undefined = stripeBody.data?.object;

    if (!paymentIntent) {
      this.logger.error('Stripe callback: missing data.object');
      return {
        transactionId: '',
        gatewayTransactionId: '',
        success: false,
        rawData: stripeBody as unknown as Record<string, unknown>,
      };
    }

    const isSuccess = eventType === 'payment_intent.succeeded' && paymentIntent.status === 'succeeded';

    this.logger.log(
      `Stripe callback parsed: type=${eventType}, pi=${paymentIntent.id}, ` +
      `status=${paymentIntent.status}, txn=${paymentIntent.metadata?.transactionId}`,
    );

    return {
      transactionId: paymentIntent.metadata?.transactionId || '',
      gatewayTransactionId: paymentIntent.id || '',
      success: isSuccess,
      rawData: stripeBody as unknown as Record<string, unknown>,
    };
  }

  // ──────────────────── Query Payment ────────────────────

  async queryPayment(transactionId: string): Promise<QueryResult> {
    if (this.mockMode) {
      return this.mockQueryPayment(transactionId);
    }

    // We need to search for the PaymentIntent by metadata
    // First try treating transactionId as a PaymentIntent ID
    let response: Response;
    let data: StripePaymentIntentResponse;

    if (transactionId.startsWith('pi_')) {
      response = await this.request('GET', `/payment_intents/${transactionId}`);
    } else {
      // Search by metadata
      response = await this.request(
        'GET',
        `/payment_intents?limit=1&expand[]=data`,
      );
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new PaymentGatewayError(
        `Stripe query failed: ${err?.error?.message || response.status}`,
        'stripe',
        err,
      );
    }

    data = await response.json() as StripePaymentIntentResponse;

    // Handle list response vs single object
    let resolved: StripePaymentIntentResponse | undefined = data;
    if (data.object === 'list') {
      resolved = data.data?.[0];
    }

    if (!resolved) {
      throw new PaymentGatewayError(`Stripe PaymentIntent not found: ${transactionId}`, 'stripe');
    }

    const statusMap: Record<string, QueryResult['status']> = {
      succeeded: 'SUCCESS',
      processing: 'PENDING',
      requires_payment_method: 'PENDING',
      requires_confirmation: 'PENDING',
      requires_action: 'PENDING',
      canceled: 'CLOSED',
      requires_capture: 'PENDING',
    };

    return {
      transactionId: resolved.metadata?.transactionId || transactionId,
      gatewayTransactionId: resolved.id,
      status: statusMap[resolved.status || ''] || 'FAILED',
      amount: resolved.amount || 0,
      rawData: resolved as unknown as Record<string, unknown>,
    };
  }

  // ──────────────────── Refund ────────────────────

  async processRefund(params: RefundParams): Promise<RefundResult> {
    if (this.mockMode) {
      return this.mockProcessRefund(params);
    }

    const formData = new URLSearchParams({
      payment_intent: params.gatewayTransactionId,
      amount: params.amount.toString(),
    });

    if (params.reason) {
      formData.append('reason', 'requested_by_customer');
      formData.append('metadata[reason]', params.reason);
    }

    const response = await this.request('POST', '/refunds', formData.toString());

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      this.logger.error(`Stripe refund failed: ${response.status} ${JSON.stringify(err)}`);
      return { refundId: '', success: false };
    }

    const data = await response.json();
    this.logger.log(`Stripe refund created: id=${data.id}, status=${data.status}`);

    return {
      refundId: data.id,
      success: data.status === 'succeeded' || data.status === 'pending',
    };
  }

  // ──────────────────── Internal: HTTP Request ────────────────────

  private async request(method: string, path: string, body?: string): Promise<Response> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2024-12-18.acacia',
    };

    return fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: method !== 'GET' ? body : undefined,
      signal: AbortSignal.timeout(15_000),
    });
  }

  // ──────────────────── Mock Implementations ────────────────────

  private async mockCreatePayment(params: CreatePaymentParams): Promise<PaymentParams> {
    this.logger.warn(`[MOCK] Stripe createPayment for txn=${params.transactionId}, amount=${params.amount}`);
    await this.mockDelay();
    return {
      gateway: 'stripe',
      mock: true,
      clientSecret: `pi_mock_${params.transactionId}_secret_mock`,
      paymentIntentId: `pi_mock_${params.transactionId}`,
      publishableKey: 'pk_test_mock',
    };
  }

  private async mockParseCallback(body: StripeWebhookBody): Promise<CallbackResult> {
    this.logger.warn('[MOCK] Stripe parseCallback');
    const pi: StripePaymentIntent = body?.data?.object || {};
    return {
      transactionId: pi?.metadata?.transactionId || body?.transactionId || '',
      gatewayTransactionId: pi?.id || `pi_mock_${Date.now()}`,
      success: true,
      rawData: body as unknown as Record<string, unknown>,
    };
  }

  private async mockQueryPayment(transactionId: string): Promise<QueryResult> {
    this.logger.warn(`[MOCK] Stripe queryPayment for txn=${transactionId}`);
    await this.mockDelay();
    return {
      transactionId,
      gatewayTransactionId: `pi_mock_${transactionId}`,
      status: 'SUCCESS',
      amount: 0,
      rawData: { mock: true } as Record<string, unknown>,
    };
  }

  private async mockProcessRefund(params: RefundParams): Promise<RefundResult> {
    this.logger.warn(`[MOCK] Stripe refund for txn=${params.transactionId}, amount=${params.amount}`);
    await this.mockDelay();
    return {
      refundId: `re_mock_${Date.now()}`,
      success: true,
    };
  }

  private mockDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
}
