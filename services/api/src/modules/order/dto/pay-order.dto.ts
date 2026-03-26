import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class PayOrderDto {
  @ApiProperty({
    description: 'Payment method used for this transaction. / 本次交易使用的支付方式',
    example: 'wechat',
    enum: ['wechat', 'alipay', 'stripe', 'bank_transfer'],
  })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({
    description: 'Actual paid amount in cents. Defaults to order totalAmount if not specified. / 实际支付金额（分），不指定则默认为订单总金额',
    example: 1500000,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  paidAmount?: number;

  @ApiPropertyOptional({
    description: 'External payment transaction ID from the payment gateway. / 支付网关返回的外部交易ID',
    example: 'wx20260601123456789',
  })
  @IsOptional()
  @IsString()
  paymentId?: string;

  @ApiPropertyOptional({
    description: 'Currency code (ISO 4217). Defaults to CNY. / 币种代码（ISO 4217），默认CNY',
    example: 'CNY',
    enum: ['CNY', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'INR', 'THB', 'SGD', 'MYR', 'ILS', 'SAR'],
    default: 'CNY',
  })
  @IsOptional()
  @IsString()
  currency?: string;
}
