import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Order ID to create a payment for. Must reference an existing order in PENDING status. / 要创建支付的订单ID，必须引用一个状态为PENDING的现有订单',
    example: 'clx4ord0001ab12cd34ef56',
  })
  @IsString()
  orderId: string;

  @ApiProperty({
    description:
      'Payment gateway to process this payment. / 处理此支付的支付网关\n\n' +
      '- `wechat`: WeChat Pay (微信支付) — popular in China\n' +
      '- `alipay`: Alipay (支付宝) — popular in China\n' +
      '- `stripe`: Stripe — international credit/debit cards',
    enum: ['wechat', 'alipay', 'stripe'],
    example: 'wechat',
  })
  @IsString()
  @IsIn(['wechat', 'alipay', 'stripe'])
  gateway: string;
}
