import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../notification/email.service';
import { SmsService } from '../notification/sms.service';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * Send a verification code via email or SMS.
   * Generates 6-digit code, stores in DB with 5min expiry, rate-limited to 5/hour.
   */
  async sendCode(
    target: string,
    type: 'email' | 'sms',
    purpose: 'register' | 'reset' | 'login',
  ): Promise<{ message: string }> {
    // Rate limit: max 5 codes per target per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await this.prisma.verificationCode.count({
      where: {
        target,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentCount >= 5) {
      throw new ForbiddenException(
        'Too many verification codes requested. Please try again later. / 验证码请求过于频繁，请稍后再试。',
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB with 5-minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const dbType = this.mapPurposeToType(purpose);

    await this.prisma.verificationCode.create({
      data: {
        target,
        code,
        type: dbType,
        expiresAt,
      },
    });

    // Send via appropriate channel
    if (type === 'email') {
      if (purpose === 'reset') {
        await this.emailService.sendPasswordReset(target, code);
      } else {
        await this.emailService.sendVerificationCode(target, code);
      }
    } else {
      await this.smsService.sendVerificationCode(target, code);
    }

    this.logger.log(
      `Verification code sent: type=${type}, purpose=${purpose}, target=${target}`,
    );

    return { message: 'Verification code sent / 验证码已发送' };
  }

  /**
   * Verify a code: check exists, not expired, not used. Mark as used on success.
   */
  async verifyCode(
    target: string,
    code: string,
    purpose: 'register' | 'reset' | 'login',
  ): Promise<boolean> {
    const dbType = this.mapPurposeToType(purpose);

    const record = await this.prisma.verificationCode.findFirst({
      where: {
        target,
        code,
        type: dbType,
        used: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return false;
    }

    // Mark as used
    await this.prisma.verificationCode.update({
      where: { id: record.id },
      data: { used: true },
    });

    return true;
  }

  /** Map purpose to DB type string */
  private mapPurposeToType(purpose: 'register' | 'reset' | 'login'): string {
    switch (purpose) {
      case 'register':
        return 'REGISTER';
      case 'reset':
        return 'RESET_PASSWORD';
      case 'login':
        return 'LOGIN';
    }
  }
}
