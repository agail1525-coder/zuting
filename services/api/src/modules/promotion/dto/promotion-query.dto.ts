import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PromotionQueryDto {
  @ApiPropertyOptional({
    description: '促销类型筛选',
    enum: ['TIME_LIMITED', 'EARLY_BIRD', 'FLASH_SALE'],
  })
  @IsOptional()
  @IsIn(['TIME_LIMITED', 'EARLY_BIRD', 'FLASH_SALE'])
  type?: string;

  @ApiPropertyOptional({ description: '页码', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
