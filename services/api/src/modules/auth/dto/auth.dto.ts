import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsIn, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiPropertyOptional({
    description: 'Chinese mobile phone number (11 digits starting with 1). / 中国大陆手机号（11位，1开头）',
    example: '13800138000',
    pattern: '^1[3-9]\\d{9}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: 'Invalid Chinese phone number' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email address for account registration. / 注册邮箱地址',
    example: 'pilgrim@zuting.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Account password, 6-64 characters. / 账户密码，6-64个字符',
    example: 'password123',
    minLength: 6,
    maxLength: 64,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password: string;

  @ApiProperty({
    description: 'User display name / nickname. / 用户显示昵称',
    example: '文化旅行者',
    minLength: 1,
    maxLength: 32,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  nickname: string;
}

export class LoginDto {
  @ApiPropertyOptional({
    description: 'Phone number to login with. Provide either phone or email. / 登录手机号。phone 或 email 至少提供一个。',
    example: '13800138000',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email address to login with. Provide either phone or email. / 登录邮箱。phone 或 email 至少提供一个。',
    example: 'pilgrim@zuting.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Account password. / 账户密码',
    example: 'password123',
  })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description: '双因素验证码 (若账户启用 2FA 则必填). / 6-digit 2FA code (required if user has 2FA enabled)',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  otpCode?: string;
}

export class TwoFactorCodeDto {
  @ApiProperty({ description: '6位 TOTP 验证码', example: '123456' })
  @IsString()
  code!: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token obtained from login or previous refresh. / 从登录或上次刷新获得的刷新令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  refreshToken: string;
}

export class WechatLoginDto {
  @ApiProperty({
    description: 'WeChat login code obtained from wx.login() in Mini Program. / 微信小程序 wx.login() 返回的登录凭证 code',
    example: '0a1B2c3D4e5F6g',
  })
  @IsString()
  code: string;
}

export class SendCodeDto {
  @ApiProperty({
    description: 'Phone number or email to send verification code to. / 接收验证码的手机号或邮箱',
    example: '13800138000',
  })
  @IsString()
  target: string;

  @ApiProperty({
    description: 'Channel type: email or sms. / 发送渠道：email 或 sms',
    example: 'sms',
    enum: ['email', 'sms'],
  })
  @IsString()
  @IsIn(['email', 'sms'])
  type: 'email' | 'sms';

  @ApiProperty({
    description: 'Verification code purpose. / 验证码用途',
    example: 'login',
    enum: ['register', 'reset', 'login'],
  })
  @IsString()
  @IsIn(['register', 'reset', 'login'])
  purpose: 'register' | 'reset' | 'login';
}

export class VerifyCodeDto {
  @ApiProperty({
    description: 'Phone number or email the code was sent to. / 验证码发送目标',
    example: '13800138000',
  })
  @IsString()
  target: string;

  @ApiProperty({
    description: '6-digit verification code. / 6位验证码',
    example: '123456',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;

  @ApiProperty({
    description: 'Verification code purpose. / 验证码用途',
    example: 'login',
    enum: ['register', 'reset', 'login'],
  })
  @IsString()
  @IsIn(['register', 'reset', 'login'])
  purpose: 'register' | 'reset' | 'login';
}

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'User display name, 2-20 characters. / 用户昵称，2-20个字符',
    example: '文化旅行者',
    minLength: 2,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  nickname?: string;

  @ApiPropertyOptional({
    description: 'Avatar image URL. / 头像图片URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Chinese mobile phone number (11 digits starting with 1). / 中国大陆手机号',
    example: '13800138000',
    pattern: '^1[3-9]\\d{9}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: 'Invalid Chinese phone number' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'User bio / self-introduction, max 200 characters. / 个人简介，最多200字',
    example: '文化旅行者，探索世界文化传统',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Phone number or email the code was sent to. / 验证码发送目标',
    example: 'pilgrim@zuting.com',
  })
  @IsString()
  target: string;

  @ApiProperty({
    description: '6-digit verification code. / 6位验证码',
    example: '123456',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;

  @ApiProperty({
    description: 'New password, 6-64 characters. / 新密码，6-64个字符',
    example: 'newpassword123',
    minLength: 6,
    maxLength: 64,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  newPassword: string;
}
