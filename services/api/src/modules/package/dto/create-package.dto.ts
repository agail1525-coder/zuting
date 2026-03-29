import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  IsPositive,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

const PACKAGE_TYPES = ['CLASSIC', 'DEEP', 'VIP', 'FREE', 'GROUP'];

export class CreatePackageDto {
  @ApiProperty({ description: '套餐名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '套餐描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '封面图URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ description: '套餐类型', enum: PACKAGE_TYPES })
  @IsString()
  @IsIn(PACKAGE_TYPES)
  packageType: string;

  @ApiProperty({ description: '基础价格(分)', example: 299900 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  basePrice: number;

  @ApiPropertyOptional({ description: '会员价格(分)', example: 249900 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  memberPrice?: number;

  @ApiProperty({ description: '包含内容 JSON', example: { accommodation: true, transport: true, guide: true, meals: false } })
  includes: Record<string, unknown>;

  @ApiProperty({ description: '行程天数', example: 5 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  duration: number;

  @ApiPropertyOptional({ description: '最大人数', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxPersons?: number;

  @ApiPropertyOptional({ description: '关联实体类型', enum: ['HOLY_SITE', 'TEMPLE'] })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: '关联实体ID列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entityIds?: string[];
}
