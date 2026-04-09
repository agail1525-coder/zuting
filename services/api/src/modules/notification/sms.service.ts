import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly provider: string;
  private readonly isConfigured: boolean;

  // Aliyun SMS config
  private readonly accessKeyId: string;
  private readonly accessSecret: string;
  private readonly signName: string;
  private readonly templateCode: string;

  constructor(private readonly config: ConfigService) {
    this.provider = this.config.get<string>('SMS_PROVIDER', 'aliyun');
    this.accessKeyId = this.config.get<string>('ALIYUN_ACCESS_KEY', '');
    this.accessSecret = this.config.get<string>('ALIYUN_SECRET', '');
    this.signName = this.config.get<string>('ALIYUN_SMS_SIGN', '佳绩之旅');
    this.templateCode = this.config.get<string>(
      'ALIYUN_SMS_TEMPLATE',
      'SMS_123456',
    );

    this.isConfigured = !!(this.accessKeyId && this.accessSecret);

    if (this.isConfigured) {
      this.logger.log(`SMS service configured: provider=${this.provider}`);
    } else {
      this.logger.warn(
        'SMS not configured — messages will be logged to console (dev mode)',
      );
    }
  }

  /** Send verification code via SMS */
  async sendVerificationCode(phone: string, code: string): Promise<void> {
    if (!this.isConfigured) {
      this.logger.log(
        `[DEV SMS] To: ${phone} | Code: ${code} | Sign: ${this.signName}`,
      );
      return;
    }

    if (this.provider === 'aliyun') {
      await this.sendAliyunSms(phone, code);
    } else {
      this.logger.warn(`Unknown SMS provider: ${this.provider}, logging code`);
      this.logger.log(`[SMS] To: ${phone} | Code: ${code}`);
    }
  }

  /** Send SMS via Aliyun (Alibaba Cloud) SMS API */
  private async sendAliyunSms(phone: string, code: string): Promise<void> {
    try {
      const params: Record<string, string> = {
        AccessKeyId: this.accessKeyId,
        Action: 'SendSms',
        Format: 'JSON',
        PhoneNumbers: phone,
        RegionId: 'cn-hangzhou',
        SignName: this.signName,
        SignatureMethod: 'HMAC-SHA1',
        SignatureNonce: crypto.randomUUID(),
        SignatureVersion: '1.0',
        TemplateCode: this.templateCode,
        TemplateParam: JSON.stringify({ code }),
        Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
        Version: '2017-05-25',
      };

      // Build signature
      const sortedKeys = Object.keys(params).sort();
      const canonicalQuery = sortedKeys
        .map(
          (key) =>
            `${this.percentEncode(key)}=${this.percentEncode(params[key])}`,
        )
        .join('&');

      const stringToSign = `GET&${this.percentEncode('/')}&${this.percentEncode(canonicalQuery)}`;
      const signature = crypto
        .createHmac('sha1', `${this.accessSecret}&`)
        .update(stringToSign)
        .digest('base64');

      params.Signature = signature;

      const queryString = Object.entries(params)
        .map(
          ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`,
        )
        .join('&');

      const url = `https://dysmsapi.aliyuncs.com/?${queryString}`;

      const response = await fetch(url, {
        signal: AbortSignal.timeout(10_000),
      });
      const result = await response.json();

      if (result.Code === 'OK') {
        this.logger.log(`SMS sent to ${phone} via Aliyun`);
      } else {
        this.logger.error(
          `Aliyun SMS error: ${result.Code} — ${result.Message}`,
        );
        // Don't throw — graceful degradation
      }
    } catch (err) {
      this.logger.error(`Failed to send SMS to ${phone}: ${err.message}`);
      // Don't throw — graceful degradation
    }
  }

  /** Percent-encode for Alibaba Cloud API signature */
  private percentEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/\+/g, '%20')
      .replace(/\*/g, '%2A')
      .replace(/~/g, '%7E');
  }
}
