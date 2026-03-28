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

  @ApiPropertyOptional({
    description: 'Filter by religion ID / 按信仰ID过滤',
    example: 'clx1abc2d0000ab12cd34ef56',
  })
  @IsOptional()
  @IsString()
  religionId?: string;

  @ApiPropertyOptional({
    description: 'Filter by country or region / 按国家/地区过滤',
    example: 'India',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    description: 'Sort mode: relevance | name | popular / 排序方式',
    enum: ['relevance', 'name', 'popular'],
    example: 'relevance',
  })
  @IsOptional()
  @IsString()
  @IsIn(['relevance', 'name', 'popular'])
  sort?: string = 'relevance';

  @ApiPropertyOptional({
    description: 'Sort direction: asc | desc / 排序方向',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: string = 'asc';
}
