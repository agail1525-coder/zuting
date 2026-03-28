import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty({ description: '优惠券代码', example: 'SPRING2026' })
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  code: string;

  @ApiProperty({ description: '订单ID', example: 'order-cuid-123' })
  @IsString()
  orderId: string;
}
