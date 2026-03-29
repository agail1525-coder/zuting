import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min, IsDateString, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class BookPackageDto {
  @ApiProperty({ description: '出行人数', example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  persons: number;

  @ApiProperty({ description: '出发日期 (ISO8601)', example: '2026-05-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ description: '联系人姓名' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ description: '联系人电话' })
  @IsOptional()
  @IsString()
  contactPhone?: string;
}
