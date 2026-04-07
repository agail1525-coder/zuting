import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';

export class SealFilterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '印系列 / Seal series filter', enum: ['CHUYIN', 'ZHONGYIN', 'YINGUOYIN', 'CHENGDAOYIN', 'GUIYUANYIN'] })
  @IsOptional()
  @IsString()
  series?: string;
}
