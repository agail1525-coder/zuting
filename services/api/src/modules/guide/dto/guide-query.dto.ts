import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GuideQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({ description: '按标签筛选', example: '佛教' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({
    description: '排序方式: latest=最新, popular=最多浏览, mostLiked=最多点赞',
    enum: ['latest', 'popular', 'mostLiked'],
    default: 'latest',
  })
  @IsOptional()
  @IsIn(['latest', 'popular', 'mostLiked'])
  sort?: 'latest' | 'popular' | 'mostLiked' = 'latest';
}
