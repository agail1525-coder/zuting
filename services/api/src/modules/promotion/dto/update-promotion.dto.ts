import { PartialType } from '@nestjs/swagger';
import { CreatePromotionDto } from './create-promotion.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {
  @ApiPropertyOptional({ description: '是否激活' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
