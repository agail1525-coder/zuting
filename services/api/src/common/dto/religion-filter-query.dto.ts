import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';

export class ReligionFilterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by religion ID / 按宗教ID筛选' })
  @IsOptional()
  @IsString()
  religionId?: string;
}
