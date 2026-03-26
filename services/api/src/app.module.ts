import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { ReligionModule } from './modules/religion/religion.module';
import { HolySiteModule } from './modules/holy-site/holy-site.module';
import { TempleModule } from './modules/temple/temple.module';
import { PatriarchModule } from './modules/patriarch/patriarch.module';
import { TeachingModule } from './modules/teaching/teaching.module';
import { SealModule } from './modules/seal/seal.module';
import { XiaohongModule } from './modules/xiaohong/xiaohong.module';
import { TripModule } from './modules/trip/trip.module';
import { OrderModule } from './modules/order/order.module';
import { JournalModule } from './modules/journal/journal.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ReviewModule } from './modules/review/review.module';
import { UploadModule } from './modules/upload/upload.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { SearchModule } from './modules/search/search.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
    RedisModule,
    AuthModule,
    HealthModule,
    ReligionModule,
    HolySiteModule,
    TempleModule,
    PatriarchModule,
    TeachingModule,
    SealModule,
    XiaohongModule,
    TripModule,
    OrderModule,
    JournalModule,
    NotificationModule,
    ReviewModule,
    UploadModule,
    PaymentModule,
    CouponModule,
    ModerationModule,
    SearchModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
