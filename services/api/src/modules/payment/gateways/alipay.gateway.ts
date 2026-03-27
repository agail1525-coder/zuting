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
  AlipayWebhookBody,
  AlipayApiResponse,
} from './payment-gateway.interface';
import { PaymentGatewayError } from './wechat-pay.gateway';

/**
 * Alipay Open Platform Gateway
 *
 * Uses RSA2 (SHA256WithRSA) signing for all API requests.
 * When env vars are not configured, falls back to mock mode.
 *
 * Required ENV:
 *   ALIPAY_APP_ID         - Alipay App ID
 *   ALIPAY_PRIVATE_KEY    - RSA2 private key (PEM, newlines as \n)
 *   ALIPAY_PUBLIC_KEY     - Alipay public key for signature verification (PEM)
 *   ALIPAY_GATEWAY        - Gateway URL (default: https://openapi.alipay.com/gateway.do)
 *   ALIPAY_NOTIFY_URL     - Callback notification URL
 */
@Injectable()
export class AlipayGateway implements PaymentGateway {
  readonly name = 'alipay';
  private readonly logger = new Logger(AlipayGateway.name);

  private readonly appId: string;
  private readonly privateKey: string;
  private readonly alipayPublicKey: string;
  private readonly gatewayUrl: string;
  private readonly notifyUrl: string;
  private readonly mockMode: boolean;

  constructor(private readonly config: ConfigService) {
    this.appId = this.config.get<string>('ALIPAY_APP_ID', '');
    this.privateKey = (this.config.get<string>('ALIPAY_PRIVATE_KEY', '') || '').replace(/\\n/g, '\n');
    this.alipayPublicKey = (this.config.get<string>('ALIPAY_PUBLIC_KEY', '') || '').replace(/\\n/g, '\n');
    this.gatewayUrl = this.config.get<string>('ALIPAY_GATEWAY', 'https://openapi.alipay.com/gateway.do');
    this.notifyUrl = this.config.get<string>('ALIPAY_NOTIFY_URL', '');

    this.mockMode = !this.appId || !this.privateKey || !this.alipayPublicKey;

    if (this.mockMode) {
      this.logger.warn('Alipay running in MOCK mode — set ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY, ALIPAY_PUBLIC_KEY for production');
    } else {
      this.logger.log('Alipay gateway initialized in PRODUCTION mode');
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

    const bizContent = {
      out_trade_no: params.transactionId,
      total_amount: (params.amount / 100).toFixed(2), // Alipay uses yuan, not fen
      subject: params.description || 'Zuting Payment',
      product_code: 'FAST_INSTANT_TRADE_PAY',
    };

    const commonParams = this.buildCommonParams('alipay.trade.page.pay');
    commonParams['notify_url'] = params.notifyUrl || this.notifyUrl;
    commonParams['biz_content'] = JSON.stringify(bizContent);
    commonParams['sign'] = this.signParams(commonParams);

    // Build the redirect URL for page pay
    const queryString = Object.entries(commonParams)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    const paymentUrl = `${this.gatewayUrl}?${queryString}`;

    this.logger.log(`Alipay payment created for txn=${params.transactionId}`);

    return {
      gateway: 'alipay',
      mock: false,
      paymentUrl,
      outTradeNo: params.transactionId,
    };
  }

  // ──────────────────── Verify Callback ────────────────────

  async verifyCallback(body: WebhookBody, _headers?: Record<string, string>): Promise<boolean> {
    if (this.mockMode) {
      this.logger.warn('[MOCK] Skipping Alipay signature verification');
      return true;
    }

    // Alipay sends callback as URL-encoded form data (key=value pairs)
    const alipayBody = body as AlipayWebhookBody;
    const params: Record<string, string | undefined> = { ...alipayBody };
    const sign = params.sign;
    const signType = params.sign_type || 'RSA2';

    if (!sign) {
      this.logger.warn('Alipay callback missing sign parameter');
      return false;
    }

    // Remove sign and sign_type from verification
    delete params.sign;
    delete params.sign_type;

    // Sort parameters alphabetically and build string
    const sortedKeys = Object.keys(params).sort();
    const signStr = sortedKeys
      .filter((k) => params[k] !== '' && params[k] !== undefined)
      .map((k) => `${k}=${params[k]}`)
      .join('&');

    // Verify with Alipay public key
    try {
      const verifier = crypto.createVerify(
        signType === 'RSA2' ? 'RSA-SHA256' : 'RSA-SHA1',
      );
      verifier.update(signStr, 'utf8');
      const isValid = verifier.verify(this.formatPublicKey(this.alipayPublicKey), sign, 'base64');

      if (!isValid) {
        this.logger.warn('Alipay callback signature verification FAILED');
      }
      return isValid;
    } catch (err) {
      this.logger.error(`Alipay signature verification error: ${err.message}`);
      return false;
    }
  }

  // ──────────────────── Parse Callback ────────────────────

  async parseCallback(body: WebhookBody): Promise<CallbackResult> {
    if (this.mockMode) {
      return this.mockParseCallback(body as AlipayWebhookBody);
    }

    const alipayBody = body as AlipayWebhookBody;
    const tradeStatus = alipayBody.trade_status;
    const isSuccess = tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED';

    this.logger.log(
      `Alipay callback parsed: out_trade_no=${alipayBody.out_trade_no}, ` +
      `trade_no=${alipayBody.trade_no}, trade_status=${tradeStatus}`,
    );

    return {
      transactionId: alipayBody.out_trade_no || '',
      gatewayTransactionId: alipayBody.trade_no || '',
      success: isSuccess,
      rawData: alipayBody as Record<string, unknown>,
    };
  }

  // ──────────────────── Query Payment ────────────────────

  async queryPayment(transactionId: string): Promise<QueryResult> {
    if (this.mockMode) {
      return this.mockQueryPayment(transactionId);
    }

    const bizContent = { out_trade_no: transactionId };
    const result = await this.execute('alipay.trade.query', bizContent);

    const statusMap: Record<string, QueryResult['status']> = {
      TRADE_SUCCESS: 'SUCCESS',
      TRADE_FINISHED: 'SUCCESS',
      WAIT_BUYER_PAY: 'PENDING',
      TRADE_CLOSED: 'CLOSED',
    };

    return {
      transactionId: result.out_trade_no || transactionId,
      gatewayTransactionId: result.trade_no || '',
      status: (result.trade_status ? statusMap[result.trade_status] : undefined) || 'PENDING',
      amount: Math.round(parseFloat(result.total_amount || '0') * 100),
      rawData: result as Record<string, unknown>,
    };
  }

  // ──────────────────── Refund ────────────────────

  async processRefund(params: RefundParams): Promise<RefundResult> {
    if (this.mockMode) {
      return this.mockProcessRefund(params);
    }

    const refundNo = `RF${Date.now()}${Math.random().toString(36).substring(2, 6)}`;
    const bizContent = {
      trade_no: params.gatewayTransactionId,
      out_trade_no: params.transactionId,
      refund_amount: (params.amount / 100).toFixed(2),
      out_request_no: refundNo,
      refund_reason: params.reason || 'User requested refund',
    };

    try {
      const result = await this.execute('alipay.trade.refund', bizContent);

      const success = result.fund_change === 'Y';
      this.logger.log(`Alipay refund: fund_change=${result.fund_change}, trade_no=${result.trade_no}`);

      return {
        refundId: result.trade_no || refundNo,
        success,
      };
    } catch (err) {
      this.logger.error(`Alipay refund failed: ${err.message}`);
      return { refundId: '', success: false };
    }
  }

  // ──────────────────── Internal: Execute API Call ────────────────────

  private async execute(method: string, bizContent: Record<string, string>): Promise<AlipayApiResponse> {
    const commonParams = this.buildCommonParams(method);
    commonParams['biz_content'] = JSON.stringify(bizContent);
    commonParams['sign'] = this.signParams(commonParams);

    const queryString = Object.entries(commonParams)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');

    const response = await fetch(`${this.gatewayUrl}?${queryString}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new PaymentGatewayError(`Alipay API ${method} failed: ${response.status}`, 'alipay', text);
    }

    const data = await response.json() as Record<string, AlipayApiResponse>;
    // Alipay wraps response in alipay_trade_xxx_response
    const responseKey = method.replace(/\./g, '_') + '_response';
    const result = data[responseKey];

    if (!result || result.code !== '10000') {
      const errMsg = result?.sub_msg || result?.msg || 'Unknown error';
      throw new PaymentGatewayError(`Alipay ${method}: ${errMsg}`, 'alipay', result);
    }

    return result;
  }

  // ──────────────────── Internal: Build Common Params ────────────────────

  private buildCommonParams(method: string): Record<string, string> {
    return {
      app_id: this.appId,
      method,
      format: 'JSON',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      version: '1.0',
    };
  }

  // ──────────────────── Internal: RSA2 Signing ────────────────────

  private signParams(params: Record<string, string>): string {
    const sortedKeys = Object.keys(params).sort();
    const signStr = sortedKeys
      .filter((k) => params[k] !== '' && params[k] !== undefined)
      .map((k) => `${k}=${params[k]}`)
      .join('&');

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signStr, 'utf8');
    return signer.sign(this.formatPrivateKey(this.privateKey), 'base64');
  }

  // ──────────────────── Internal: Key Formatting ────────────────────

  private formatPrivateKey(key: string): string {
    if (key.includes('-----BEGIN')) return key;
    const formatted = key.match(/.{1,64}/g)?.join('\n') || key;
    return `-----BEGIN RSA PRIVATE KEY-----\n${formatted}\n-----END RSA PRIVATE KEY-----`;
  }

  private formatPublicKey(key: string): string {
    if (key.includes('-----BEGIN')) return key;
    const formatted = key.match(/.{1,64}/g)?.join('\n') || key;
    return `-----BEGIN PUBLIC KEY-----\n${formatted}\n-----END PUBLIC KEY-----`;
  }

  // ──────────────────── Mock Implementations ────────────────────

  private async mockCreatePayment(params: CreatePaymentParams): Promise<PaymentParams> {
    this.logger.warn(`[MOCK] Alipay createPayment for txn=${params.transactionId}, amount=${params.amount}`);
    await this.mockDelay();
    return {
      gateway: 'alipay',
      mock: true,
      paymentUrl: `https://openapi.alipaydev.com/gateway.do?mock=true&txn=${params.transactionId}`,
      outTradeNo: params.transactionId,
    };
  }

  private async mockParseCallback(body: AlipayWebhookBody): Promise<CallbackResult> {
    this.logger.warn('[MOCK] Alipay parseCallback');
    return {
      transactionId: body?.out_trade_no || body?.transactionId || '',
      gatewayTransactionId: body?.trade_no || `ali_mock_txn_${Date.now()}`,
      success: true,
      rawData: body as Record<string, unknown>,
    };
  }

  private async mockQueryPayment(transactionId: string): Promise<QueryResult> {
    this.logger.warn(`[MOCK] Alipay queryPayment for txn=${transactionId}`);
    await this.mockDelay();
    return {
      transactionId,
      gatewayTransactionId: `ali_mock_txn_${transactionId}`,
      status: 'SUCCESS',
      amount: 0,
      rawData: { mock: true } as Record<string, unknown>,
    };
  }

  private async mockProcessRefund(params: RefundParams): Promise<RefundResult> {
    this.logger.warn(`[MOCK] Alipay refund for txn=${params.transactionId}, amount=${params.amount}`);
    await this.mockDelay();
    return {
      refundId: `ali_mock_refund_${Date.now()}`,
      success: true,
    };
  }

  private mockDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
}
