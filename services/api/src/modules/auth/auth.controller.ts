import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  Res,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { VerificationService } from './verification.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  WechatLoginDto,
  SendCodeDto,
  VerifyCodeDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly webUrl: string;

  constructor(
    private readonly authService: AuthService,
    private readonly verificationService: VerificationService,
  ) {
    this.webUrl = process.env.NEXT_PUBLIC_WEB_URL || process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:3000';
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user account',
    description:
      '注册新用户账号，支持手机号或邮箱注册。至少提供 phone 或 email 中的一个。\n\n' +
      'Register a new user account using phone number or email. At least one of `phone` or `email` must be provided.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully. Returns access and refresh tokens. / 注册成功，返回访问令牌与刷新令牌。',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clx1abc2d0000ab12cd34ef56' },
            nickname: { type: 'string', example: '朝圣者' },
            phone: { type: 'string', example: '13800138000' },
            email: { type: 'string', example: 'pilgrim@zuting.com' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation failed — missing required fields or invalid format. / 校验失败——缺少必填字段或格式无效。' })
  @ApiResponse({ status: 409, description: 'Phone or email already registered. / 手机号或邮箱已注册。' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with phone/email and password',
    description:
      '使用手机号或邮箱 + 密码登录。返回JWT访问令牌和刷新令牌。\n\n' +
      'Authenticate with phone or email plus password. Returns JWT access token and refresh token.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns JWT tokens and user info. / 登录成功，返回JWT令牌与用户信息。',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clx1abc2d0000ab12cd34ef56' },
            nickname: { type: 'string', example: '朝圣者' },
            role: { type: 'string', example: 'USER' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation failed — must provide phone or email. / 校验失败——需提供手机号或邮箱。' })
  @ApiResponse({ status: 401, description: 'Invalid credentials — wrong password or account not found. / 凭证无效——密码错误或账号不存在。' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    const clientIp = req.ip || req.socket?.remoteAddress;
    return this.authService.login(dto, clientIp);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      '使用刷新令牌获取新的访问令牌，用于无感续期。\n\n' +
      'Exchange a valid refresh token for a new access token. Used for seamless session renewal.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'New access token issued. / 新访问令牌已签发。',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Refresh token expired or invalid. / 刷新令牌已过期或无效。' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Logout and revoke refresh token',
    description:
      '登出当前用户，吊销其刷新令牌。需要有效的JWT访问令牌。\n\n' +
      'Logout the current user and revoke their refresh token. Requires a valid JWT access token.',
  })
  @ApiResponse({ status: 200, description: 'Logged out successfully. / 已成功登出。' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required. / 未授权——需要有效的JWT。' })
  logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Get('me')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      '获取当前已登录用户的个人资料，包括昵称、手机号、邮箱、角色等信息。\n\n' +
      'Retrieve the profile of the currently authenticated user, including nickname, phone, email, and role.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile returned successfully. / 用户资料返回成功。',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'clx1abc2d0000ab12cd34ef56' },
        nickname: { type: 'string', example: '朝圣者' },
        phone: { type: 'string', example: '13800138000' },
        email: { type: 'string', example: 'pilgrim@zuting.com' },
        role: { type: 'string', enum: ['USER', 'ADMIN', 'GUIDE'], example: 'USER' },
        avatarUrl: { type: 'string', nullable: true, example: null },
        createdAt: { type: 'string', format: 'date-time', example: '2026-01-15T08:30:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required. / 未授权——需要有效的JWT。' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Patch('profile')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Update current user profile',
    description:
      '更新当前用户的个人资料（昵称、头像、手机号）。\n\n' +
      'Update the authenticated user\'s profile (nickname, avatar, phone).',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully. / 资料更新成功。',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 409, description: 'Phone number already in use. / 手机号已被使用。' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, dto);
  }

  // ─── Verification Code Endpoints ─────────────────────────────

  @Public()
  @Post('send-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send verification code via email or SMS',
    description:
      '发送验证码到手机号或邮箱。支持注册、登录、重置密码三种用途。每小时最多发送5次。\n\n' +
      'Send a 6-digit verification code via email or SMS. Supports register, login, and password reset purposes. Rate limited to 5 per hour.',
  })
  @ApiBody({ type: SendCodeDto })
  @ApiResponse({
    status: 200,
    description: 'Verification code sent successfully. / 验证码发送成功。',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Verification code sent / 验证码已发送' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation failed. / 参数校验失败。' })
  @ApiResponse({ status: 403, description: 'Rate limit exceeded — max 5 codes per hour. / 超过频率限制——每小时最多5次。' })
  sendCode(@Body() dto: SendCodeDto) {
    return this.verificationService.sendCode(dto.target, dto.type, dto.purpose);
  }

  @Public()
  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify a verification code',
    description:
      '验证验证码是否有效。验证成功后验证码将被标记为已使用。\n\n' +
      'Verify a verification code. The code is marked as used upon successful verification.',
  })
  @ApiBody({ type: VerifyCodeDto })
  @ApiResponse({
    status: 200,
    description: 'Code verification result. / 验证码验证结果。',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation failed. / 参数校验失败。' })
  async verifyCode(@Body() dto: VerifyCodeDto) {
    const valid = await this.verificationService.verifyCode(
      dto.target,
      dto.code,
      dto.purpose,
    );
    return { valid };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password with verification code',
    description:
      '使用验证码重置密码。需要先通过 send-code 获取验证码。\n\n' +
      'Reset password using a verification code. The code must be obtained via send-code first.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully. / 密码重置成功。',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password reset successfully / 密码重置成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired verification code. / 验证码无效或已过期。' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    // Verify the code first
    const valid = await this.verificationService.verifyCode(
      dto.target,
      dto.code,
      'reset',
    );
    if (!valid) {
      throw new BadRequestException(
        'Invalid or expired verification code / 验证码无效或已过期',
      );
    }

    // Reset the password
    await this.authService.resetPassword(dto.target, dto.newPassword);
    return { message: 'Password reset successfully / 密码重置成功' };
  }

  // ─── WeChat Mini Program Login ────────────────────────────

  @Public()
  @Post('wechat/miniprogram')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'WeChat Mini Program login via wx.login() code',
    description:
      '微信小程序登录：前端调用 Taro.login() 获取 code，发送至此接口换取JWT令牌。\n\n' +
      'Mini Program login: frontend calls Taro.login() to get a code, sends it here to exchange for JWT tokens.',
  })
  @ApiBody({ type: WechatLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns JWT tokens. / 登录成功，返回JWT令牌。',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        expiresIn: { type: 'number', example: 900 },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nickname: { type: 'string' },
            avatar: { type: 'string', nullable: true },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Missing code or jscode2session exchange failed.' })
  async wechatMiniProgramLogin(@Body() dto: WechatLoginDto) {
    return this.authService.wechatMiniProgramLogin(dto.code);
  }

  // ─── OAuth: Social Login ───────────────────────────────────

  @Public()
  @Get('providers')
  @ApiOperation({
    summary: 'Get available OAuth providers',
    description: '获取当前已配置的第三方登录方式列表。\n\nReturns which social login providers are enabled.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available OAuth providers.',
    schema: {
      type: 'object',
      properties: {
        wechat: { type: 'boolean', example: true },
        google: { type: 'boolean', example: true },
      },
    },
  })
  getProviders() {
    return {
      wechat: this.authService.isWechatConfigured(),
      google: this.authService.isGoogleConfigured(),
    };
  }

  @Public()
  @Get('wechat')
  @ApiOperation({
    summary: 'Redirect to WeChat OAuth',
    description: '重定向至微信开放平台授权页面。\n\nRedirects to WeChat authorization page for social login.',
  })
  @ApiResponse({ status: 302, description: 'Redirect to WeChat authorize URL.' })
  @ApiResponse({ status: 400, description: 'WeChat OAuth not configured.' })
  wechatAuth(@Res() res: Response) {
    if (!this.authService.isWechatConfigured()) {
      throw new BadRequestException('WeChat OAuth is not configured');
    }
    const state = crypto.randomBytes(16).toString('hex');
    const url = this.authService.getWechatAuthorizeUrl(state);
    return res.redirect(url);
  }

  @Public()
  @Get('wechat/callback')
  @ApiOperation({
    summary: 'WeChat OAuth callback',
    description: '微信授权回调，交换code获取用户信息并返回JWT。\n\nHandles WeChat OAuth callback, exchanges code for user info and returns JWT.',
  })
  @ApiQuery({ name: 'code', required: true, description: 'WeChat authorization code' })
  @ApiQuery({ name: 'state', required: false, description: 'CSRF state parameter' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens in query params.' })
  @ApiResponse({ status: 400, description: 'Missing code or OAuth exchange failed.' })
  async wechatCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    if (!code) {
      throw new BadRequestException('Missing authorization code');
    }

    try {
      const tokens = await this.authService.wechatCallback(code);
      // Redirect to frontend with tokens
      const params = new URLSearchParams({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      return res.redirect(`${this.webUrl}/auth/callback?${params.toString()}`);
    } catch (err) {
      this.logger.error(`WeChat callback error: ${err.message}`, err.stack);
      const params = new URLSearchParams({
        error: 'wechat_auth_failed',
        message: err.message || 'WeChat authentication failed',
      });
      return res.redirect(`${this.webUrl}/login?${params.toString()}`);
    }
  }

  @Public()
  @Get('google')
  @ApiOperation({
    summary: 'Redirect to Google OAuth',
    description: '重定向至Google OAuth授权页面。\n\nRedirects to Google authorization page for social login.',
  })
  @ApiResponse({ status: 302, description: 'Redirect to Google authorize URL.' })
  @ApiResponse({ status: 400, description: 'Google OAuth not configured.' })
  googleAuth(@Res() res: Response) {
    if (!this.authService.isGoogleConfigured()) {
      throw new BadRequestException('Google OAuth is not configured');
    }
    const state = crypto.randomBytes(16).toString('hex');
    const url = this.authService.getGoogleAuthorizeUrl(state);
    return res.redirect(url);
  }

  @Public()
  @Get('google/callback')
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Google授权回调，交换code获取用户信息并返回JWT。\n\nHandles Google OAuth callback, exchanges code for user info and returns JWT.',
  })
  @ApiQuery({ name: 'code', required: true, description: 'Google authorization code' })
  @ApiQuery({ name: 'state', required: false, description: 'CSRF state parameter' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens in query params.' })
  @ApiResponse({ status: 400, description: 'Missing code or OAuth exchange failed.' })
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    if (!code) {
      throw new BadRequestException('Missing authorization code');
    }

    try {
      const tokens = await this.authService.googleCallback(code);
      // Redirect to frontend with tokens
      const params = new URLSearchParams({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      return res.redirect(`${this.webUrl}/auth/callback?${params.toString()}`);
    } catch (err) {
      this.logger.error(`Google callback error: ${err.message}`, err.stack);
      const params = new URLSearchParams({
        error: 'google_auth_failed',
        message: err.message || 'Google authentication failed',
      });
      return res.redirect(`${this.webUrl}/login?${params.toString()}`);
    }
  }
}
