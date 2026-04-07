import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';

export class TripQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by user ID / 按用户ID筛选' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by trip status / 按行程状态筛选' })
  @IsOptional()
  @IsString()
  status?: string;
}
