import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class RelatedQueryDto {
  @ApiProperty({ description: '实体类型', example: 'SITE', enum: ['SITE', 'TEMPLE', 'RELIGION'] })
  @IsString()
  entityType: string;

  @ApiProperty({ description: '实体ID', example: 'cuid-123' })
  @IsString()
  entityId: string;

  @ApiPropertyOptional({ description: '返回数量', example: 6, minimum: 1, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;
}
