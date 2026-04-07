import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';

export class MediaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by entity type / 按实体类型筛选' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Filter by entity ID / 按实体ID筛选' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Filter by media type / 按媒体类型筛选' })
  @IsOptional()
  @IsString()
  mediaType?: string;
}
