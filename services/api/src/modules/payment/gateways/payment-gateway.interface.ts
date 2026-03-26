/**
 * Abstract interface for payment gateway integrations.
 * Each gateway (WeChat Pay, Alipay, Stripe) implements this interface.
 */
export interface PaymentParams {
  /** Gateway identifier */
  gateway: string;
  /** Whether this is a mock response (dev mode) */
  mock: boolean;
  /** Gateway-specific data the client needs to initiate payment */
  [key: string]: any;
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
  rawData: any;
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
  rawData: any;
}

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
  verifyCallback(body: any, headers?: Record<string, string>): Promise<boolean>;

  /**
   * Parse the callback body and extract the transaction result.
   */
  parseCallback(body: any): Promise<CallbackResult>;

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
