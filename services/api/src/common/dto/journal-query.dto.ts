import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';

export class JournalQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by user ID / 按用户ID筛选' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by trip ID / 按行程ID筛选' })
  @IsOptional()
  @IsString()
  tripId?: string;

  @ApiPropertyOptional({ description: 'Filter by public visibility / 按公开状态筛选' })
  @IsOptional()
  @IsString()
  isPublic?: string;
}
