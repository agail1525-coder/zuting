import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class ModerationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '举报状态筛选 / Filter by report status',
    enum: ['PENDING', 'REVIEWED', 'DISMISSED'],
  })
  @IsOptional()
  @IsIn(['PENDING', 'REVIEWED', 'DISMISSED'])
  status?: string;
}
