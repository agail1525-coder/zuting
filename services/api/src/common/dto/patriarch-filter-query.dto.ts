import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ReligionFilterQueryDto } from './religion-filter-query.dto';

export class PatriarchFilterQueryDto extends ReligionFilterQueryDto {
  @ApiPropertyOptional({ description: '禅宗流派 e.g. 曹洞宗 / School filter' })
  @IsOptional()
  @IsString()
  school?: string;
}
