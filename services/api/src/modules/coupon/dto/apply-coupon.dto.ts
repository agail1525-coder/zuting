import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty({ description: '优惠券代码', example: 'SPRING2026' })
  @IsString()
  code: string;

  @ApiProperty({ description: '订单ID', example: 'order-cuid-123' })
  @IsString()
  orderId: string;
}
