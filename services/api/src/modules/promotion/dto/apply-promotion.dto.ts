import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ApplyPromotionDto {
  @ApiProperty({ description: '促销活动ID', example: 'clx3promo0001' })
  @IsString()
  promotionId: string;

  @ApiProperty({ description: '订单ID', example: 'clx3order0001' })
  @IsString()
  orderId: string;
}
