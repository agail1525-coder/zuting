import { IsString, MaxLength, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchQueryDto {
  @ApiProperty({
    description: 'Search query string / 搜索关键词',
    example: '佛教',
  })
  @IsString()
  @MaxLength(200)
  q: string;

  @ApiPropertyOptional({
    description: 'Content type filter / 内容类型过滤',
    enum: ['all', 'religion', 'holy-site', 'temple', 'patriarch', 'teaching', 'seal'],
    example: 'all',
  })
  @IsOptional()
  @IsString()
  @IsIn(['all', 'religion', 'holy-site', 'temple', 'patriarch', 'teaching', 'seal'])
  type?: string = 'all';

  @ApiPropertyOptional({
    description: 'Page number (1-based) / 页码',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Results per page (max 50) / 每页数量',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
