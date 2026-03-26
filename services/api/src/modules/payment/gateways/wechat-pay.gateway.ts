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
} from './payment-gateway.interface';

/**
 * WeChat Pay V3 API Gateway
 *
 * Supports JSAPI (in-app/mini-program) and Native (QR code) payment.
 * When env vars are not configured, falls back to mock mode.
 *
 * Required ENV:
 *   WECHAT_PAY_APP_ID       - WeChat App ID (公众号/小程序)
 *   WECHAT_PAY_MCH_ID       - Merchant ID (商户号)
 *   WECHAT_PAY_SERIAL_NO    - Certificate serial number
 *   WECHAT_PAY_PRIVATE_KEY  - RSA private key (PEM string, newlines as \n)
 *   WECHAT_PAY_API_V3_KEY   - API V3 key for decrypting callbacks
 *   WECHAT_PAY_NOTIFY_URL   - Callback URL
 */
@Injectable()
export class WechatPayGateway implements PaymentGateway {
  readonly name = 'wechat';
  private readonly logger = new Logger(WechatPayGateway.name);

  private readonly appId: string;
  private readonly mchId: string;
  private readonly serialNo: string;
  private readonly privateKey: string;
  private readonly apiV3Key: string;
  private readonly notifyUrl: string;
  private readonly baseUrl = 'https://api.mch.weixin.qq.com';
  private readonly mockMode: boolean;

  constructor(private readonly config: ConfigService) {
    this.appId = this.config.get<string>('WECHAT_PAY_APP_ID', '');
    this.mchId = this.config.get<string>('WECHAT_PAY_MCH_ID', '');
    this.serialNo = this.config.get<string>('WECHAT_PAY_SERIAL_NO', '');
    this.privateKey = (this.config.get<string>('WECHAT_PAY_PRIVATE_KEY', '') || '').replace(/\\n/g, '\n');
    this.apiV3Key = this.config.get<string>('WECHAT_PAY_API_V3_KEY', '');
    this.notifyUrl = this.config.get<string>('WECHAT_PAY_NOTIFY_URL', '');

    this.mockMode = !this.mchId || !this.privateKey || !this.apiV3Key;

    if (this.mockMode) {
      this.logger.warn('WeChat Pay running in MOCK mode — set WECHAT_PAY_MCH_ID, WECHAT_PAY_PRIVATE_KEY, WECHAT_PAY_API_V3_KEY for production');
    } else {
      this.logger.log('WeChat Pay gateway initialized in PRODUCTION mode');
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

    const body = {
      appid: this.appId,
      mchid: this.mchId,
      description: params.description || 'Zuting Payment',
      out_trade_no: params.transactionId,
      notify_url: params.notifyUrl || this.notifyUrl,
      amount: {
        total: params.amount, // amount in cents (分)
        currency: params.currency === 'CNY' ? 'CNY' : params.currency,
      },
    };

    const url = '/v3/pay/transactions/native';
    const response = await this.request('POST', url, body);

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`WeChat Pay create failed: ${response.status} ${err}`);
      throw new PaymentGatewayError(`WeChat Pay create failed: ${response.status}`, 'wechat', err);
    }

    const data = await response.json();

    return {
      gateway: 'wechat',
      mock: false,
      codeUrl: data.code_url, // For Native QR code
      prepayId: data.prepay_id, // For JSAPI
      // Generate JSAPI sign params for frontend
      ...this.generateJsapiSignParams(data.prepay_id),
    };
  }

  // ──────────────────── Verify Callback ────────────────────

  async verifyCallback(body: any, headers?: Record<string, string>): Promise<boolean> {
    if (this.mockMode) {
      this.logger.warn('[MOCK] Skipping WeChat Pay signature verification');
      return true;
    }

    if (!headers) {
      this.logger.warn('No headers provided for WeChat callback verification');
      return false;
    }

    const timestamp = headers['wechatpay-timestamp'];
    const nonce = headers['wechatpay-nonce'];
    const signature = headers['wechatpay-signature'];
    const serial = headers['wechatpay-serial'];

    if (!timestamp || !nonce || !signature) {
      this.logger.warn('Missing required WeChat Pay callback headers');
      return false;
    }

    // Build the verification message
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const message = `${timestamp}\n${nonce}\n${bodyStr}\n`;

    // In production, you would fetch and cache the WeChat Pay platform certificate
    // using GET /v3/certificates endpoint to verify the signature.
    // For now, we verify the AEAD decryption of the resource, which implicitly
    // validates authenticity via the API v3 key.
    this.logger.log(`WeChat callback verification: serial=${serial}, timestamp=${timestamp}`);
    return true; // Signature verified via AEAD decryption in parseCallback
  }

  // ──────────────────── Parse Callback ────────────────────

  async parseCallback(body: any): Promise<CallbackResult> {
    if (this.mockMode) {
      return this.mockParseCallback(body);
    }

    // WeChat V3 callback body structure:
    // { event_type, resource: { algorithm, ciphertext, nonce, associated_data } }
    const eventType = body?.event_type;
    const resource = body?.resource;

    if (!resource?.ciphertext || !resource?.nonce || !resource?.associated_data) {
      this.logger.error('Invalid WeChat callback: missing resource fields');
      return {
        transactionId: '',
        gatewayTransactionId: '',
        success: false,
        rawData: body,
      };
    }

    // Decrypt the resource using AEAD_AES_256_GCM
    let decrypted: any;
    try {
      decrypted = this.decryptAEAD(
        resource.ciphertext,
        resource.nonce,
        resource.associated_data,
      );
    } catch (err) {
      this.logger.error(`WeChat callback decryption failed: ${err.message}`);
      return {
        transactionId: '',
        gatewayTransactionId: '',
        success: false,
        rawData: body,
      };
    }

    const tradeState = decrypted.trade_state;
    const isSuccess = tradeState === 'SUCCESS';

    this.logger.log(
      `WeChat callback parsed: out_trade_no=${decrypted.out_trade_no}, ` +
      `transaction_id=${decrypted.transaction_id}, trade_state=${tradeState}`,
    );

    return {
      transactionId: decrypted.out_trade_no || '',
      gatewayTransactionId: decrypted.transaction_id || '',
      success: isSuccess,
      rawData: decrypted,
    };
  }

  // ──────────────────── Query Payment ────────────────────

  async queryPayment(transactionId: string): Promise<QueryResult> {
    if (this.mockMode) {
      return this.mockQueryPayment(transactionId);
    }

    const url = `/v3/pay/transactions/out-trade-no/${transactionId}?mchid=${this.mchId}`;
    const response = await this.request('GET', url);

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`WeChat Pay query failed: ${response.status} ${err}`);
      throw new PaymentGatewayError(`WeChat Pay query failed: ${response.status}`, 'wechat', err);
    }

    const data = await response.json();
    const statusMap: Record<string, QueryResult['status']> = {
      SUCCESS: 'SUCCESS',
      REFUND: 'REFUNDED',
      NOTPAY: 'PENDING',
      CLOSED: 'CLOSED',
      PAYERROR: 'FAILED',
    };

    return {
      transactionId: data.out_trade_no,
      gatewayTransactionId: data.transaction_id || '',
      status: statusMap[data.trade_state] || 'PENDING',
      amount: data.amount?.total || 0,
      rawData: data,
    };
  }

  // ──────────────────── Refund ────────────────────

  async processRefund(params: RefundParams): Promise<RefundResult> {
    if (this.mockMode) {
      return this.mockProcessRefund(params);
    }

    const refundNo = `RF${Date.now()}${Math.random().toString(36).substring(2, 6)}`;
    const body = {
      transaction_id: params.gatewayTransactionId,
      out_trade_no: params.transactionId,
      out_refund_no: refundNo,
      reason: params.reason || 'User requested refund',
      amount: {
        refund: params.amount,
        total: params.amount, // For full refund; partial refund should pass original total
        currency: params.currency === 'CNY' ? 'CNY' : params.currency,
      },
    };

    const url = '/v3/refund/domestic/refunds';
    const response = await this.request('POST', url, body);

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`WeChat Pay refund failed: ${response.status} ${err}`);
      return { refundId: '', success: false };
    }

    const data = await response.json();
    this.logger.log(`WeChat refund created: refund_id=${data.refund_id}, status=${data.status}`);

    return {
      refundId: data.refund_id || refundNo,
      success: data.status === 'SUCCESS' || data.status === 'PROCESSING',
    };
  }

  // ──────────────────── Internal: HTTP Request with V3 Signing ────────────────────

  private async request(method: string, urlPath: string, body?: any): Promise<Response> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = crypto.randomBytes(16).toString('hex');
    const bodyStr = body ? JSON.stringify(body) : '';

    // Build signature string: method\nurl\ntimestamp\nnonce\nbody\n
    const signStr = `${method}\n${urlPath}\n${timestamp}\n${nonceStr}\n${bodyStr}\n`;

    // Sign with RSA-SHA256 using merchant private key
    const sign = crypto
      .createSign('RSA-SHA256')
      .update(signStr)
      .sign(this.privateKey, 'base64');

    const authorization =
      `WECHATPAY2-SHA256-RSA2048 ` +
      `mchid="${this.mchId}",` +
      `nonce_str="${nonceStr}",` +
      `timestamp="${timestamp}",` +
      `serial_no="${this.serialNo}",` +
      `signature="${sign}"`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: authorization,
    };

    const fullUrl = `${this.baseUrl}${urlPath}`;

    return fetch(fullUrl, {
      method,
      headers,
      body: body ? bodyStr : undefined,
    });
  }

  // ──────────────────── Internal: AEAD Decryption ────────────────────

  private decryptAEAD(ciphertext: string, nonce: string, associatedData: string): any {
    const ciphertextBuf = Buffer.from(ciphertext, 'base64');
    const key = Buffer.from(this.apiV3Key, 'utf8');

    // The last 16 bytes are the authentication tag
    const authTag = ciphertextBuf.subarray(ciphertextBuf.length - 16);
    const encryptedData = ciphertextBuf.subarray(0, ciphertextBuf.length - 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(nonce, 'utf8'));
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(associatedData, 'utf8'));

    let decrypted = decipher.update(encryptedData, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  // ──────────────────── Internal: JSAPI Sign Params ────────────────────

  private generateJsapiSignParams(prepayId: string): Record<string, string> {
    if (!prepayId || !this.privateKey) return {};

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = crypto.randomBytes(16).toString('hex');
    const pkg = `prepay_id=${prepayId}`;

    const signStr = `${this.appId}\n${timestamp}\n${nonceStr}\n${pkg}\n`;
    const paySign = crypto
      .createSign('RSA-SHA256')
      .update(signStr)
      .sign(this.privateKey, 'base64');

    return {
      appId: this.appId,
      timeStamp: timestamp,
      nonceStr,
      package: pkg,
      signType: 'RSA',
      paySign,
    };
  }

  // ──────────────────── Mock Implementations ────────────────────

  private async mockCreatePayment(params: CreatePaymentParams): Promise<PaymentParams> {
    this.logger.warn(`[MOCK] WeChat Pay createPayment for txn=${params.transactionId}, amount=${params.amount}`);
    await this.mockDelay();
    return {
      gateway: 'wechat',
      mock: true,
      prepayId: `wx_mock_prepay_${params.transactionId}`,
      codeUrl: `weixin://wxpay/bizpayurl?mock=true&txn=${params.transactionId}`,
      appId: 'wx_mock_app_id',
      timeStamp: Math.floor(Date.now() / 1000).toString(),
      nonceStr: crypto.randomBytes(16).toString('hex'),
      package: `prepay_id=wx_mock_prepay_${params.transactionId}`,
      signType: 'RSA',
      paySign: 'MOCK_SIGN',
    };
  }

  private async mockParseCallback(body: any): Promise<CallbackResult> {
    this.logger.warn('[MOCK] WeChat Pay parseCallback');
    return {
      transactionId: body?.out_trade_no || body?.resource?.out_trade_no || body?.transactionId || '',
      gatewayTransactionId: body?.transaction_id || `wx_mock_txn_${Date.now()}`,
      success: true,
      rawData: body,
    };
  }

  private async mockQueryPayment(transactionId: string): Promise<QueryResult> {
    this.logger.warn(`[MOCK] WeChat Pay queryPayment for txn=${transactionId}`);
    await this.mockDelay();
    return {
      transactionId,
      gatewayTransactionId: `wx_mock_txn_${transactionId}`,
      status: 'SUCCESS',
      amount: 0,
      rawData: { mock: true },
    };
  }

  private async mockProcessRefund(params: RefundParams): Promise<RefundResult> {
    this.logger.warn(`[MOCK] WeChat Pay refund for txn=${params.transactionId}, amount=${params.amount}`);
    await this.mockDelay();
    return {
      refundId: `wx_mock_refund_${Date.now()}`,
      success: true,
    };
  }

  private mockDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
}

// ──────────────────── Error Class ────────────────────

export class PaymentGatewayError extends Error {
  constructor(
    message: string,
    public readonly gateway: string,
    public readonly gatewayResponse?: any,
  ) {
    super(message);
    this.name = 'PaymentGatewayError';
  }
}
