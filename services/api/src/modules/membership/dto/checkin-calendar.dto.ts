import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CheckinCalendarDto {
  @ApiProperty({ example: 2026, description: '年份' })
  @Type(() => Number)
  @IsInt()
  year: number;

  @ApiProperty({ example: 3, description: '月份 (1-12)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}
