import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: any = null;
  private readonly from: string;
  private readonly isConfigured: boolean;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT', 465);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    this.from = this.config.get<string>('SMTP_FROM', 'noreply@zuting.com');

    this.isConfigured = !!(host && user && pass);

    if (this.isConfigured) {
      try {
        // Dynamic require to avoid hard dependency
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nodemailer = require('nodemailer');
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
        this.logger.log(`Email service configured: ${host}:${port}`);
      } catch (err) {
        this.logger.warn(
          'nodemailer not installed — email will be logged to console',
        );
        this.transporter = null;
      }
    } else {
      this.logger.warn(
        'SMTP not configured — emails will be logged to console (dev mode)',
      );
    }
  }

  /** Send verification code email */
  async sendVerificationCode(email: string, code: string): Promise<void> {
    const subject = '【祖庭之旅】验证码 / Verification Code';
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #D4A855;">祖庭之旅 · Zuting</h2>
        <p>您好！您的验证码是：</p>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #D4A855; margin: 24px 0; text-align: center;">
          ${code}
        </div>
        <p>验证码有效期为5分钟，请勿泄露给他人。</p>
        <p style="color: #888; font-size: 12px;">This code expires in 5 minutes. Do not share it with anyone.</p>
      </div>
    `;
    await this.send(email, subject, html);
  }

  /** Send password reset email */
  async sendPasswordReset(email: string, code: string): Promise<void> {
    const subject = '【祖庭之旅】重置密码 / Password Reset';
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #D4A855;">祖庭之旅 · Zuting</h2>
        <p>您正在重置密码，验证码如下：</p>
        <p>You are resetting your password. Your code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #D4A855; margin: 24px 0; text-align: center;">
          ${code}
        </div>
        <p>验证码有效期为5分钟。如果这不是您的操作，请忽略此邮件。</p>
        <p style="color: #888; font-size: 12px;">This code expires in 5 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `;
    await this.send(email, subject, html);
  }

  /** Send order confirmation email */
  async sendOrderConfirmation(
    email: string,
    orderDetails: {
      orderId: string;
      tripTitle: string;
      amount: number;
      currency?: string;
    },
  ): Promise<void> {
    const currency = orderDetails.currency || 'CNY';
    const amountStr =
      currency === 'CNY'
        ? `¥${(orderDetails.amount / 100).toFixed(2)}`
        : `$${(orderDetails.amount / 100).toFixed(2)}`;

    const subject = '【祖庭之旅】订单确认 / Order Confirmation';
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #D4A855;">祖庭之旅 · Zuting</h2>
        <p>感谢您的订单！以下是您的订单详情：</p>
        <p>Thank you for your order! Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">订单号 / Order ID</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${orderDetails.orderId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">行程 / Trip</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${orderDetails.tripTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">金额 / Amount</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #D4A855;">${amountStr}</td>
          </tr>
        </table>
        <p style="color: #888; font-size: 12px;">祝您旅途愉快！/ Have a wonderful journey!</p>
      </div>
    `;
    await this.send(email, subject, html);
  }

  /** Core send method — falls back to console.log in dev mode */
  private async send(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.from,
          to,
          subject,
          html,
        });
        this.logger.log(`Email sent to ${to}: ${subject}`);
      } catch (err) {
        this.logger.error(`Failed to send email to ${to}: ${err.message}`);
        // Don't throw — graceful degradation
      }
    } else {
      // Dev mode: log to console
      this.logger.log(
        `[DEV EMAIL] To: ${to} | Subject: ${subject}\n${html.replace(/<[^>]*>/g, '').trim()}`,
      );
    }
  }
}
