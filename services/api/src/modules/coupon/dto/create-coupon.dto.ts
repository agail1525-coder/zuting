import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsIn,
  IsDateString,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({ description: '优惠券代码', example: 'SPRING2026' })
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  code: string;

  @ApiProperty({ description: '优惠券名称', example: '春季文化之旅优惠' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: '优惠类型',
    enum: ['FIXED', 'PERCENT'],
    example: 'FIXED',
  })
  @IsString()
  @IsIn(['FIXED', 'PERCENT'])
  type: string;

  @ApiProperty({
    description: '优惠值 (cents or percentage 1-100)',
    example: 1000,
  })
  @IsInt()
  @Min(1)
  value: number;

  @ApiPropertyOptional({
    description: '最低订单金额 (cents)',
    example: 10000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({
    description: '百分比优惠最大折扣 (cents)',
    example: 5000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxDiscount?: number;

  @ApiProperty({
    description: '总发行量 (0=无限)',
    example: 100,
    default: 0,
  })
  @IsInt()
  @Min(0)
  totalCount: number;

  @ApiProperty({ description: '生效时间', example: '2026-04-01T00:00:00Z' })
  @IsDateString()
  startAt: string;

  @ApiProperty({ description: '过期时间', example: '2026-06-30T23:59:59Z' })
  @IsDateString()
  endAt: string;
}
