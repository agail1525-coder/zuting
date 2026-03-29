import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsIn,
  IsBoolean,
  IsArray,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
  @ApiProperty({ description: '促销活动名称', example: '限时7折优惠' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '促销说明' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '促销类型',
    enum: ['TIME_LIMITED', 'EARLY_BIRD', 'FLASH_SALE'],
  })
  @IsIn(['TIME_LIMITED', 'EARLY_BIRD', 'FLASH_SALE'])
  type: string;

  @ApiProperty({
    description: '折扣类型: FIXED=固定金额 / PERCENT=百分比',
    enum: ['FIXED', 'PERCENT'],
  })
  @IsIn(['FIXED', 'PERCENT'])
  discountType: string;

  @ApiProperty({ description: '折扣值: FIXED时为分, PERCENT时为1-100', example: 30 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  discountValue: number;

  @ApiPropertyOptional({ description: '最低消费金额(分)', example: 100000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minAmount?: number;

  @ApiPropertyOptional({ description: '最大折扣金额(分, 百分比券用)', example: 50000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxDiscount?: number;

  @ApiProperty({ description: '活动开始时间 (ISO8601)', example: '2026-04-01T00:00:00Z' })
  @IsDateString()
  startAt: string;

  @ApiProperty({ description: '活动结束时间 (ISO8601)', example: '2026-04-30T23:59:59Z' })
  @IsDateString()
  endAt: string;

  @ApiPropertyOptional({
    description: '适用对象类型: TRIP / ROUTE / ALL',
    enum: ['TRIP', 'ROUTE', 'ALL'],
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: '适用对象ID列表 (空=全部)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entityIds?: string[];

  @ApiPropertyOptional({ description: '总配额(0=无限)', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  totalQuota?: number;

  @ApiPropertyOptional({ description: '封面图URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;
}
