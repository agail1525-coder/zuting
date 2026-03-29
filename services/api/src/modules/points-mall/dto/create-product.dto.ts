import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsInt, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

const CATEGORIES = ['COUPON', 'DISCOUNT', 'EXPERIENCE', 'PERK', 'BADGE'];

export class CreateProductDto {
  @ApiProperty({ description: '商品名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '商品描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '封面图URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ description: '分类', enum: CATEGORIES })
  @IsString()
  @IsIn(CATEGORIES)
  category: string;

  @ApiProperty({ description: '所需积分', example: 500 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  pointsCost: number;

  @ApiPropertyOptional({ description: '原价(分)', example: 9900 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  originalPrice?: number;

  @ApiPropertyOptional({ description: '库存 (0=无限)', example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: '元数据 (JSON)', example: {} })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
