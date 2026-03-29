import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionQueryDto {
  @ApiPropertyOptional({
    description: 'Page number. / 页码',
    default: 1,
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page (max 50). / 每页数量，最多50',
    default: 20,
    minimum: 1,
    maximum: 50,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by tag. / 按标签筛选',
    example: '朝圣',
  })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({
    description: 'Filter by question status. / 按状态筛选',
    enum: ['OPEN', 'ANSWERED', 'CLOSED'],
    example: 'OPEN',
  })
  @IsOptional()
  @IsString()
  @IsIn(['OPEN', 'ANSWERED', 'CLOSED'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Sort order: latest (newest first), hot (most views), unanswered (no answers yet). / 排序方式',
    enum: ['latest', 'hot', 'unanswered'],
    default: 'latest',
    example: 'latest',
  })
  @IsOptional()
  @IsString()
  @IsIn(['latest', 'hot', 'unanswered'])
  sort?: string = 'latest';
}
