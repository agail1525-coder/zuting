import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { VerificationService } from './verification.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { WechatOAuthStrategy } from './strategies/wechat.strategy';
import { GoogleOAuthStrategy } from './strategies/google.strategy';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'change-me-in-production'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    NotificationModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, VerificationService, JwtStrategy, WechatOAuthStrategy, GoogleOAuthStrategy],
  exports: [AuthService, VerificationService, JwtModule],
})
export class AuthModule {}
