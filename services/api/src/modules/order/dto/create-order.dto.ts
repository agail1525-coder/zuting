import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID of the trip this order is for. / 订单关联的行程ID',
    example: 'clx3trip0001ab12cd34ef56',
  })
  @IsString()
  tripId: string;

  @ApiProperty({
    description: 'ID of the user placing the order. / 下单用户ID',
    example: 'clx1abc2d0000ab12cd34ef56',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Total amount in cents (e.g., 1500000 = 15,000.00 CNY). Minimum 1. / 总金额（分），例如 1500000 = 15000.00元，最小值1',
    example: 1500000,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  totalAmount: number;

  @ApiPropertyOptional({
    description: 'Preferred payment method. / 首选支付方式',
    example: 'wechat',
    enum: ['wechat', 'alipay', 'stripe', 'bank_transfer'],
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Currency code (ISO 4217). Default: CNY. / 币种代码（ISO 4217标准），默认CNY',
    example: 'CNY',
    enum: ['CNY', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'INR', 'THB', 'SGD', 'MYR', 'ILS', 'SAR'],
    default: 'CNY',
  })
  @IsOptional()
  @IsString()
  currency?: string;
}
