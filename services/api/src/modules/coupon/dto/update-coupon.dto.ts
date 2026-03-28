import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsIn,
  IsDateString,
  IsBoolean,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateCouponDto {
  @ApiPropertyOptional({ description: '优惠券名称' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: '优惠类型',
    enum: ['FIXED', 'PERCENT'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['FIXED', 'PERCENT'])
  type?: string;

  @ApiPropertyOptional({ description: '优惠值 (cents or percentage 1-100)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  value?: number;

  @ApiPropertyOptional({ description: '最低订单金额 (cents)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({ description: '百分比优惠最大折扣 (cents)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ description: '总发行量 (0=无限)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalCount?: number;

  @ApiPropertyOptional({ description: '生效时间' })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({ description: '过期时间' })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
