/**
 * Abstract interface for payment gateway integrations.
 * Each gateway (WeChat Pay, Alipay, Stripe) implements this interface.
 */
export interface PaymentParams {
  /** Gateway identifier */
  gateway: string;
  /** Whether this is a mock response (dev mode) */
  mock: boolean;
  // WeChat Pay specific
  codeUrl?: string;
  prepayId?: string;
  appId?: string;
  timeStamp?: string;
  nonceStr?: string;
  package?: string;
  signType?: string;
  paySign?: string;
  // Alipay specific
  paymentUrl?: string;
  outTradeNo?: string;
  // Stripe specific
  clientSecret?: string;
  paymentIntentId?: string;
  publishableKey?: string;
}

export interface CreatePaymentParams {
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  description?: string;
  /** Client IP for WeChat Pay */
  clientIp?: string;
  /** Notify URL override */
  notifyUrl?: string;
}

export interface CallbackResult {
  transactionId: string;
  gatewayTransactionId: string;
  success: boolean;
  rawData: Record<string, unknown>;
}

export interface RefundParams {
  transactionId: string;
  gatewayTransactionId: string;
  amount: number;
  currency: string;
  reason?: string;
}

export interface RefundResult {
  refundId: string;
  success: boolean;
}

export interface QueryResult {
  transactionId: string;
  gatewayTransactionId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CLOSED' | 'REFUNDED';
  amount: number;
  rawData: Record<string, unknown>;
}

/** WeChat Pay V3 webhook notification body */
export interface WechatWebhookBody {
  id?: string;
  create_time?: string;
  event_type?: string;
  resource_type?: string;
  resource?: {
    algorithm?: string;
    ciphertext?: string;
    nonce?: string;
    associated_data?: string;
    original_type?: string;
  };
  summary?: string;
  // Mock mode fallback fields
  out_trade_no?: string;
  transaction_id?: string;
  transactionId?: string;
}

/** Decrypted WeChat Pay AEAD resource */
export interface WechatDecryptedPayment {
  appid?: string;
  mchid?: string;
  out_trade_no?: string;
  transaction_id?: string;
  trade_type?: string;
  trade_state?: string;
  trade_state_desc?: string;
  bank_type?: string;
  attach?: string;
  success_time?: string;
  payer?: { openid?: string };
  amount?: {
    total?: number;
    payer_total?: number;
    currency?: string;
    payer_currency?: string;
  };
}

/** Alipay async notification body (URL-encoded form) */
export interface AlipayWebhookBody {
  notify_time?: string;
  notify_type?: string;
  notify_id?: string;
  app_id?: string;
  charset?: string;
  version?: string;
  sign_type?: string;
  sign?: string;
  trade_no?: string;
  out_trade_no?: string;
  out_biz_no?: string;
  buyer_id?: string;
  seller_id?: string;
  trade_status?: string;
  total_amount?: string;
  receipt_amount?: string;
  buyer_pay_amount?: string;
  subject?: string;
  gmt_create?: string;
  gmt_payment?: string;
  gmt_refund?: string;
  gmt_close?: string;
  fund_bill_list?: string;
  passback_params?: string;
  // Mock mode fallback
  transactionId?: string;
  [key: string]: string | undefined;
}

/** Stripe webhook event body */
export interface StripeWebhookBody {
  id?: string;
  object?: string;
  api_version?: string;
  created?: number;
  type?: string;
  data?: {
    object?: StripePaymentIntent;
  };
  livemode?: boolean;
  pending_webhooks?: number;
  request?: { id?: string; idempotency_key?: string };
  // Mock mode fallback
  transactionId?: string;
}

/** Stripe PaymentIntent object (subset of fields used) */
export interface StripePaymentIntent {
  id?: string;
  object?: string;
  amount?: number;
  currency?: string;
  status?: string;
  client_secret?: string;
  metadata?: Record<string, string>;
  description?: string;
}

/** Alipay API response wrapper */
export interface AlipayApiResponse {
  code?: string;
  msg?: string;
  sub_code?: string;
  sub_msg?: string;
  trade_no?: string;
  out_trade_no?: string;
  trade_status?: string;
  total_amount?: string;
  fund_change?: string;
  [key: string]: unknown;
}

/** Stripe PaymentIntent query response */
export interface StripePaymentIntentResponse {
  id: string;
  object: string;
  amount?: number;
  currency?: string;
  status?: string;
  metadata?: Record<string, string>;
  data?: StripePaymentIntentResponse[];
}

/** Union type for all gateway webhook bodies */
export type WebhookBody = WechatWebhookBody | AlipayWebhookBody | StripeWebhookBody;

export interface PaymentGateway {
  /** Gateway identifier */
  readonly name: string;

  /** Whether this gateway is running in mock mode */
  isMockMode(): boolean;

  /**
   * Create a payment intent / prepay order on the gateway side.
   * Returns gateway-specific params the client uses to invoke the payment UI.
   */
  createPayment(params: CreatePaymentParams): Promise<PaymentParams>;

  /**
   * Verify the webhook callback signature / authenticity.
   * Returns true if the callback is genuine.
   */
  verifyCallback(body: WebhookBody, headers?: Record<string, string>): Promise<boolean>;

  /**
   * Parse the callback body and extract the transaction result.
   */
  parseCallback(body: WebhookBody): Promise<CallbackResult>;

  /**
   * Query payment status from the gateway.
   */
  queryPayment(transactionId: string): Promise<QueryResult>;

  /**
   * Process a refund through the gateway.
   * Returns the gateway refund ID.
   */
  processRefund(params: RefundParams): Promise<RefundResult>;
}
