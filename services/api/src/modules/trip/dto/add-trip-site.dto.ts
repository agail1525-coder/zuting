import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsDateString, Min } from 'class-validator';

export class AddTripSiteDto {
  @ApiProperty({
    description: 'ID of the holy site to add to the itinerary. / 要添加到行程中的圣地ID',
    example: 'clx2xyz9f0001ab12cd34ef56',
  })
  @IsString()
  siteId: string;

  @ApiProperty({
    description: 'Visit order index (0-based). Determines the sequence of site visits. / 访问顺序索引（从0开始），决定圣地访问顺序',
    example: 1,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  order: number;

  @ApiPropertyOptional({
    description: 'Planned visit date (ISO 8601 date format). / 计划访问日期（ISO 8601格式）',
    example: '2026-06-05',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  visitDate?: string;

  @ApiPropertyOptional({
    description: 'Notes for this specific site visit (e.g., special activities, time constraints). / 该圣地访问的备注（如特别活动、时间限制等）',
    example: '参加清晨冥想课程 / Attend early morning meditation session',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
