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
    example: '朝圣者',
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
