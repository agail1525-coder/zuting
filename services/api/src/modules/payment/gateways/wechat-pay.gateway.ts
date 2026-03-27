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
  WechatWebhookBody,
  WechatDecryptedPayment,
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
  private readonly isProduction: boolean;
  private platformCertCache: { serial: string; publicKey: crypto.KeyObject } | null = null;

  constructor(private readonly config: ConfigService) {
    this.appId = this.config.get<string>('WECHAT_PAY_APP_ID', '');
    this.mchId = this.config.get<string>('WECHAT_PAY_MCH_ID', '');
    this.serialNo = this.config.get<string>('WECHAT_PAY_SERIAL_NO', '');
    this.privateKey = (this.config.get<string>('WECHAT_PAY_PRIVATE_KEY', '') || '').replace(/\\n/g, '\n');
    this.apiV3Key = this.config.get<string>('WECHAT_PAY_API_V3_KEY', '');
    this.notifyUrl = this.config.get<string>('WECHAT_PAY_NOTIFY_URL', '');

    this.mockMode = !this.mchId || !this.privateKey || !this.apiV3Key;
    this.isProduction = this.config.get<string>('NODE_ENV', 'development') === 'production';

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

  async verifyCallback(body: WebhookBody, headers?: Record<string, string>): Promise<boolean> {
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

    if (!timestamp || !nonce || !signature || !serial) {
      this.logger.warn('Missing required WeChat Pay callback headers');
      return false;
    }

    // Reject stale callbacks (> 5 minutes old)
    const callbackAge = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (callbackAge > 300) {
      this.logger.warn(`WeChat callback rejected: timestamp too old (${callbackAge}s)`);
      return false;
    }

    // Build the verification message per WeChat Pay V3 spec
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const message = `${timestamp}\n${nonce}\n${bodyStr}\n`;

    // Fetch platform certificate for RSA-SHA256 signature verification
    const platformCert = await this.getPlatformCertificate(serial);
    if (!platformCert) {
      if (!this.isProduction) {
        this.logger.warn(
          'WeChat signature verification skipped in dev mode — platform certificate unavailable. ' +
          'This MUST be resolved before production deployment.',
        );
        return true;
      }
      this.logger.error(`WeChat callback rejected: platform certificate not available for serial=${serial}`);
      return false;
    }

    // Verify RSA-SHA256 signature using WeChat platform public key
    try {
      const verified = crypto.createVerify('RSA-SHA256')
        .update(message)
        .verify(platformCert, Buffer.from(signature, 'base64'));

      if (!verified) {
        this.logger.error(`WeChat callback signature verification FAILED: serial=${serial}`);
      } else {
        this.logger.log(`WeChat callback signature verified: serial=${serial}`);
      }
      return verified;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`WeChat callback signature verification error: ${errMsg}`);
      return false;
    }
  }

  // ──────────────────── Parse Callback ────────────────────

  async parseCallback(body: WebhookBody): Promise<CallbackResult> {
    if (this.mockMode) {
      return this.mockParseCallback(body as WechatWebhookBody);
    }

    const wechatBody = body as WechatWebhookBody;
    // WeChat V3 callback body structure:
    // { event_type, resource: { algorithm, ciphertext, nonce, associated_data } }
    const eventType = wechatBody.event_type;
    const resource = wechatBody.resource;

    if (!resource?.ciphertext || !resource?.nonce || !resource?.associated_data) {
      this.logger.error('Invalid WeChat callback: missing resource fields');
      return {
        transactionId: '',
        gatewayTransactionId: '',
        success: false,
        rawData: wechatBody as Record<string, unknown>,
      };
    }

    // Decrypt the resource using AEAD_AES_256_GCM
    let decrypted: WechatDecryptedPayment;
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
        rawData: body as Record<string, unknown>,
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
      rawData: decrypted as unknown as Record<string, unknown>,
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
      rawData: data as Record<string, unknown>,
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

  private async request(method: string, urlPath: string, body?: Record<string, unknown>): Promise<Response> {
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
      signal: AbortSignal.timeout(15_000),
    });
  }

  // ──────────────────── Internal: AEAD Decryption ────────────────────

  private decryptAEAD(ciphertext: string, nonce: string, associatedData: string): WechatDecryptedPayment {
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

    return JSON.parse(decrypted) as WechatDecryptedPayment;
  }

  // ──────────────────── Internal: Platform Certificate ────────────────────

  private async getPlatformCertificate(serial: string): Promise<crypto.KeyObject | null> {
    // Return cached cert if serial matches
    if (this.platformCertCache?.serial === serial) {
      return this.platformCertCache.publicKey;
    }

    try {
      const response = await this.request('GET', '/v3/certificates');
      if (!response.ok) {
        this.logger.error(`Failed to fetch WeChat platform certificates: ${response.status}`);
        return null;
      }

      const data = await response.json();
      const certs = data.data as Array<{
        serial_no: string;
        effective_time: string;
        expire_time: string;
        encrypt_certificate: { algorithm: string; nonce: string; associated_data: string; ciphertext: string };
      }>;

      if (!Array.isArray(certs) || certs.length === 0) {
        this.logger.error('No platform certificates returned from WeChat');
        return null;
      }

      // Find the certificate matching the requested serial
      const cert = certs.find((c) => c.serial_no === serial) || certs[0];
      const enc = cert.encrypt_certificate;

      // Decrypt the certificate PEM using AEAD
      const decryptedPem = this.decryptAEADRaw(enc.ciphertext, enc.nonce, enc.associated_data);
      const publicKey = crypto.createPublicKey(decryptedPem);

      // Cache the certificate
      this.platformCertCache = { serial: cert.serial_no, publicKey };
      this.logger.log(`Cached WeChat platform certificate: serial=${cert.serial_no}`);

      return publicKey;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to fetch/parse WeChat platform certificate: ${errMsg}`);
      return null;
    }
  }

  private decryptAEADRaw(ciphertext: string, nonce: string, associatedData: string): string {
    const ciphertextBuf = Buffer.from(ciphertext, 'base64');
    const key = Buffer.from(this.apiV3Key, 'utf8');
    const authTag = ciphertextBuf.subarray(ciphertextBuf.length - 16);
    const encryptedData = ciphertextBuf.subarray(0, ciphertextBuf.length - 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(nonce, 'utf8'));
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(associatedData, 'utf8'));

    let decrypted = decipher.update(encryptedData, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
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

  private async mockParseCallback(body: WechatWebhookBody): Promise<CallbackResult> {
    this.logger.warn('[MOCK] WeChat Pay parseCallback');
    return {
      transactionId: body?.out_trade_no || body?.resource?.associated_data || body?.transactionId || '',
      gatewayTransactionId: body?.transaction_id || `wx_mock_txn_${Date.now()}`,
      success: true,
      rawData: body as Record<string, unknown>,
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
      rawData: { mock: true } as Record<string, unknown>,
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
    public readonly gatewayResponse?: unknown,
  ) {
    super(message);
    this.name = 'PaymentGatewayError';
  }
}
