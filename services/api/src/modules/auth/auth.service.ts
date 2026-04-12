import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto/auth.dto';
import { WechatOAuthStrategy } from './strategies/wechat.strategy';
import { GoogleOAuthStrategy } from './strategies/google.strategy';
import { generateTotpSecret, totpVerify, otpauthUri } from './totp.util';

/** Redis key prefixes */
const REFRESH_TOKEN_PREFIX = 'auth:refresh:';       // auth:refresh:{userId}
const LOGIN_RATE_PREFIX = 'auth:rate:login:';        // auth:rate:login:{identifier}
const VERIFY_CODE_PREFIX = 'auth:code:';             // auth:code:{type}:{target}

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
const LOGIN_RATE_WINDOW = 60;                // 1 minute
const LOGIN_RATE_MAX = 5;                    // max attempts per window
const VERIFY_CODE_TTL = 5 * 60;             // 5 minutes

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
    private readonly wechatOAuth: WechatOAuthStrategy,
    private readonly googleOAuth: GoogleOAuthStrategy,
  ) {}

  /** Register a new user with phone/email + password */
  async register(dto: RegisterDto) {
    if (!dto.phone && !dto.email) {
      throw new BadRequestException('Phone or email is required');
    }

    // Check duplicates
    if (dto.phone) {
      const exists = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
      if (exists) throw new ConflictException('Phone number already registered');
    }
    if (dto.email) {
      const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (exists) throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        nickname: dto.nickname,
        passwordHash,
      },
    });

    return this.generateTokens(user.id, user.role);
  }

  /** Login with phone/email + password, with Redis rate limiting */
  async login(dto: LoginDto, clientIp?: string) {
    // Rate limit by identifier (phone/email) and optionally IP
    const identifier = dto.phone || dto.email || 'unknown';
    await this.checkLoginRateLimit(identifier);
    if (clientIp) {
      await this.checkLoginRateLimit(clientIp);
    }

    const user = dto.phone
      ? await this.prisma.user.findUnique({ where: { phone: dto.phone } })
      : dto.email
        ? await this.prisma.user.findUnique({ where: { email: dto.email } })
        : null;

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is disabled');
    if (!user.passwordHash) throw new UnauthorizedException('Password not set, use social login');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // 双因素认证校验 (仅对已启用 2FA 的用户)
    if (user.otpEnabled && user.otpSecret) {
      if (!dto.otpCode) {
        throw new UnauthorizedException({
          code: 'OTP_REQUIRED',
          message: 'OTP_REQUIRED',
        });
      }
      if (!totpVerify(user.otpSecret, dto.otpCode)) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user.id, user.role);
  }

  /** 开始 2FA 绑定流程：生成 secret + otpauth URI,尚未启用直到 verify */
  async setup2FA(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, nickname: true, otpEnabled: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.otpEnabled) throw new BadRequestException('2FA 已启用,请先解绑');
    const secret = generateTotpSecret();
    await this.prisma.user.update({
      where: { id: userId },
      data: { otpSecret: secret, otpEnabled: false },
    });
    const label = user.email || user.nickname || userId;
    return {
      secret,
      otpauthUri: otpauthUri(secret, label),
      hint: '用 Google Authenticator / Authy 扫码,再提交 6 位验证码以激活',
    };
  }

  /** 提交 6 位验证码激活 2FA */
  async verify2FA(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { otpSecret: true, otpEnabled: true },
    });
    if (!user || !user.otpSecret) throw new BadRequestException('未初始化 2FA,请先调用 setup');
    if (!totpVerify(user.otpSecret, code)) throw new UnauthorizedException('验证码错误');
    await this.prisma.user.update({
      where: { id: userId },
      data: { otpEnabled: true, otpVerifiedAt: new Date() },
    });
    return { ok: true, enabled: true };
  }

  /** 关闭 2FA(需要当前有效验证码) */
  async disable2FA(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { otpSecret: true, otpEnabled: true },
    });
    if (!user?.otpEnabled || !user.otpSecret) throw new BadRequestException('未启用 2FA');
    if (!totpVerify(user.otpSecret, code)) throw new UnauthorizedException('验证码错误');
    await this.prisma.user.update({
      where: { id: userId },
      data: { otpEnabled: false, otpSecret: null, otpVerifiedAt: null },
    });
    return { ok: true, enabled: false };
  }

  /** Refresh access token using refresh token (validated against Redis) */
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_SECRET'),
      });

      const userId: string = payload.sub;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Validate refresh token against Redis (primary) then DB (fallback)
      const storedToken = await this.redis.get(
        `${REFRESH_TOKEN_PREFIX}${userId}`,
      );

      if (storedToken) {
        // Redis has the token — validate it
        if (storedToken !== refreshToken) {
          throw new UnauthorizedException('Refresh token revoked');
        }
      } else {
        // Redis miss — fall back to DB for backward compatibility
        const dbUser = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { refreshToken: true },
        });
        if (dbUser?.refreshToken !== refreshToken) {
          throw new UnauthorizedException('Refresh token revoked');
        }
      }

      return this.generateTokens(user.id, user.role);
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /** Logout - clear refresh token from Redis + DB */
  async logout(userId: string) {
    await Promise.all([
      this.redis.del(`${REFRESH_TOKEN_PREFIX}${userId}`),
      this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      }),
    ]);
    return { message: 'Logged out successfully' };
  }

  /** Get current user profile */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        language: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: { trips: true, orders: true, journals: true, practices: true },
        },
      },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  /** Update current user's profile */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: Record<string, string> = {};
    if (dto.nickname !== undefined) data.nickname = dto.nickname;
    if (dto.avatar !== undefined) data.avatar = dto.avatar;

    if (dto.phone !== undefined) {
      if (dto.phone) {
        const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
        if (existing && existing.id !== userId) {
          throw new ConflictException('Phone number already in use / 该手机号已被使用');
        }
      }
      data.phone = dto.phone;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        language: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: { trips: true, orders: true, journals: true, practices: true },
        },
      },
      data,
    });
    return updated;
  }

  /** Reset password for a user identified by phone or email */
  async resetPassword(target: string, newPassword: string): Promise<void> {
    // Find user by phone or email
    const isEmail = target.includes('@');
    const user = isEmail
      ? await this.prisma.user.findUnique({ where: { email: target } })
      : await this.prisma.user.findUnique({ where: { phone: target } });

    if (!user) {
      throw new BadRequestException('User not found / 用户不存在');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    this.logger.log(`Password reset for user: ${user.id}`);
  }

  // ─── OAuth login ─────────────────────────────────────────

  /** Check if WeChat OAuth is configured */
  isWechatConfigured(): boolean {
    return this.wechatOAuth.isConfigured();
  }

  /** Check if Google OAuth is configured */
  isGoogleConfigured(): boolean {
    return this.googleOAuth.isConfigured();
  }

  /** Get WeChat authorize URL */
  getWechatAuthorizeUrl(state: string): string {
    return this.wechatOAuth.getAuthorizeUrl(state);
  }

  /** Get Google authorize URL */
  getGoogleAuthorizeUrl(state: string): string {
    return this.googleOAuth.getAuthorizeUrl(state);
  }

  /** Handle WeChat OAuth callback: exchange code, find or create user */
  async wechatCallback(code: string) {
    // 1. Exchange code for token
    const tokenRes = await this.wechatOAuth.getAccessToken(code);
    const { openid, unionid } = tokenRes;

    // 2. Try to find existing user by openid
    let user = await this.prisma.user.findUnique({
      where: { wechatOpenId: openid },
    });

    if (!user) {
      // 3. Fetch user profile from WeChat
      const userInfo = await this.wechatOAuth.getUserInfo(
        tokenRes.access_token,
        openid,
      );

      // 4. Create new user
      user = await this.prisma.user.create({
        data: {
          wechatOpenId: openid,
          wechatUnionId: unionid || userInfo.unionid || null,
          nickname: userInfo.nickname || '微信用户',
          avatar: userInfo.headimgurl || null,
        },
      });
      this.logger.log(`New user created via WeChat OAuth: ${user.id}`);
    } else {
      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    return this.generateTokens(user.id, user.role);
  }

  /** Handle Google OAuth callback: exchange code, find or create user */
  async googleCallback(code: string) {
    // 1. Exchange code for tokens
    const tokenRes = await this.googleOAuth.getTokens(code);

    // 2. Get user info
    const userInfo = await this.googleOAuth.getUserInfo(tokenRes.access_token);
    const googleId = userInfo.sub;

    // 3. Try to find existing user by googleId
    let user = await this.prisma.user.findUnique({
      where: { googleId },
    });

    if (!user) {
      // 4. Check if email already exists (link accounts)
      if (userInfo.email) {
        user = await this.prisma.user.findUnique({
          where: { email: userInfo.email },
        });
        if (user) {
          // Link Google account to existing user
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              googleId,
              avatar: user.avatar || userInfo.picture || null,
              lastLoginAt: new Date(),
            },
          });
          this.logger.log(`Linked Google account to existing user: ${user.id}`);
          return this.generateTokens(user.id, user.role);
        }
      }

      // 5. Create new user
      user = await this.prisma.user.create({
        data: {
          googleId,
          email: userInfo.email || null,
          emailVerified: userInfo.email_verified || false,
          nickname: userInfo.name || 'Google User',
          avatar: userInfo.picture || null,
        },
      });
      this.logger.log(`New user created via Google OAuth: ${user.id}`);
    } else {
      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    return this.generateTokens(user.id, user.role);
  }

  // ─── WeChat Mini Program Login ────────────────────────────

  /**
   * Handle WeChat Mini Program login via jscode2session API.
   *
   * Uses WECHAT_MP_APP_ID and WECHAT_MP_APP_SECRET env vars
   * (separate from web OAuth WECHAT_APP_ID / WECHAT_APP_SECRET).
   *
   * Flow:
   * 1. Frontend calls Taro.login() -> gets code
   * 2. Backend exchanges code for openid via jscode2session
   * 3. Find or create user by wechatOpenId
   * 4. Return JWT tokens
   */
  async wechatMiniProgramLogin(code: string) {
    const appId = this.config.get<string>('WECHAT_MP_APP_ID', '');
    const appSecret = this.config.get<string>('WECHAT_MP_APP_SECRET', '');

    if (!appId || !appSecret) {
      throw new BadRequestException(
        'WeChat Mini Program login is not configured. Set WECHAT_MP_APP_ID and WECHAT_MP_APP_SECRET.',
      );
    }

    // Exchange code for session via WeChat jscode2session API
    const url =
      `https://api.weixin.qq.com/sns/jscode2session` +
      `?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    const data = (await res.json()) as {
      openid?: string;
      session_key?: string;
      unionid?: string;
      errcode?: number;
      errmsg?: string;
    };

    if (data.errcode || !data.openid) {
      this.logger.error(
        `WeChat jscode2session failed: ${data.errmsg} (${data.errcode})`,
      );
      throw new BadRequestException(
        `WeChat login failed: ${data.errmsg || 'unknown error'}`,
      );
    }

    const { openid, unionid } = data;

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { wechatOpenId: openid },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          wechatOpenId: openid,
          wechatUnionId: unionid || null,
          nickname: '微信用户',
          avatar: null,
        },
      });
      this.logger.log(
        `New user created via WeChat MiniProgram: ${user.id}`,
      );
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    const tokens = await this.generateTokens(user.id, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    };
  }

  // ─── Verification codes ───────────────────────────────────

  /** Store a verification code in Redis with 5-minute TTL */
  async storeVerificationCode(
    type: string,
    target: string,
    code: string,
  ): Promise<void> {
    const key = `${VERIFY_CODE_PREFIX}${type}:${target}`;
    await this.redis.setex(key, VERIFY_CODE_TTL, code);
  }

  /** Verify a code and delete it if valid */
  async verifyCode(
    type: string,
    target: string,
    code: string,
  ): Promise<boolean> {
    const key = `${VERIFY_CODE_PREFIX}${type}:${target}`;
    const stored = await this.redis.get(key);
    if (!stored || stored !== code) return false;
    await this.redis.del(key);
    return true;
  }

  // ─── Private helpers ──────────────────────────────────────

  /** Generate access + refresh token pair, store refresh token in Redis + DB */
  private async generateTokens(userId: string, role: string) {
    const payload = { sub: userId, role };

    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });

    // Store refresh token in Redis (primary) and DB (fallback)
    await Promise.all([
      this.redis.setex(
        `${REFRESH_TOKEN_PREFIX}${userId}`,
        REFRESH_TOKEN_TTL,
        refreshToken,
      ),
      this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken },
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  /** Rate limit login attempts: max 5 per minute per identifier */
  private async checkLoginRateLimit(identifier: string): Promise<void> {
    const key = `${LOGIN_RATE_PREFIX}${identifier}`;
    const current = await this.redis.incr(key);

    // Set expiry on first attempt
    if (current === 1) {
      await this.redis.expire(key, LOGIN_RATE_WINDOW);
    }

    if (current > LOGIN_RATE_MAX) {
      throw new ForbiddenException(
        'Too many login attempts. Please try again in a minute.',
      );
    }
  }
}
