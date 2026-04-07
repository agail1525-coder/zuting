import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';

export class ReviewAdminQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by target type / 按目标类型筛选', enum: ['TRIP', 'GUIDE', 'SITE'] })
  @IsOptional()
  @IsString()
  targetType?: string;

  @ApiPropertyOptional({ description: 'Filter by review status / 按评价状态筛选', enum: ['PENDING', 'APPROVED', 'REJECTED', 'HIDDEN'] })
  @IsOptional()
  @IsString()
  status?: string;
}

export class ReviewQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Target type / 目标类型', enum: ['TRIP', 'GUIDE', 'SITE'] })
  @IsOptional()
  @IsString()
  targetType?: string;

  @ApiPropertyOptional({ description: 'Target ID / 目标ID' })
  @IsOptional()
  @IsString()
  targetId?: string;
}
