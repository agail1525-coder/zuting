import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class PlanTripDto {
  @ApiProperty({ description: '行程标题 / Trip title', example: '六祖慧能大师路线' })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ description: '用户备注 / User note', example: '根据大师的时间来设计' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @ApiPropertyOptional({ description: '出发日期 / Start date', example: '2026-04-30' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  startDate?: string;

  @ApiPropertyOptional({ description: '返程日期 / End date', example: '2026-05-03' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  endDate?: string;

  @ApiPropertyOptional({ description: '出行人数 / Persons', example: 2, minimum: 1, maximum: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  persons?: number;

  @ApiPropertyOptional({ description: '预算（分）/ Budget in cents', example: 500000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  budgetCents?: number;
}
