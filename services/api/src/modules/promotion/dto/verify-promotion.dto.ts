import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class VerifyPromotionDto {
  @ApiProperty({ description: '促销活动ID', example: 'clx3promo0001' })
  @IsString()
  promotionId: string;

  @ApiProperty({ description: '订单金额(分)', example: 150000 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  orderAmount: number;
}
