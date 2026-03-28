import { IsString, IsInt, IsOptional, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: '路线ID' })
  @IsString()
  routeId: string;

  @ApiProperty({ description: '出发日期', example: '2026-05-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: '出行人数', example: 2 })
  @IsInt()
  @Min(1)
  @Max(20)
  persons: number;

  @ApiPropertyOptional({ description: '联系人姓名' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  note?: string;
}
