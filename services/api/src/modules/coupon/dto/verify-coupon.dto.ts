import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';

export class VerifyCouponDto {
  @ApiProperty({ description: '优惠券代码', example: 'SPRING2026' })
  @IsString()
  code: string;

  @ApiProperty({ description: '订单金额 (cents)', example: 20000 })
  @IsInt()
  @Min(0)
  orderAmount: number;
}
