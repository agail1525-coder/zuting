import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class TrendQueryDto {
  @ApiProperty({
    description: '实体类型 / Entity type',
    example: 'ROUTE',
    enum: ['PACKAGE', 'ROUTE'],
  })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({
    description: '实体ID / Entity ID',
    example: 'clx1234abcdef',
  })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiPropertyOptional({
    description: '查询最近N天，默认30，最大90 / Number of days (default 30, max 90)',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  days?: number;
}
