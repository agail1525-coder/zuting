import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { WechatPayGateway } from './gateways/wechat-pay.gateway';
import { AlipayGateway } from './gateways/alipay.gateway';
import { StripeGateway } from './gateways/stripe.gateway';
import { TripModule } from '../trip/trip.module';

@Module({
  imports: [ConfigModule, TripModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    WechatPayGateway,
    AlipayGateway,
    StripeGateway,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
