import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    description: '举报目标类型',
    enum: ['JOURNAL', 'POST', 'REVIEW'],
    example: 'JOURNAL',
  })
  @IsString()
  @IsIn(['JOURNAL', 'POST', 'REVIEW'])
  targetType: string;

  @ApiProperty({ description: '举报目标ID', example: 'target-cuid-123' })
  @IsString()
  targetId: string;

  @ApiProperty({
    description: '举报原因',
    enum: ['INAPPROPRIATE', 'OFFENSIVE', 'SPAM', 'RELIGIOUS_SENSITIVE'],
    example: 'INAPPROPRIATE',
  })
  @IsString()
  @IsIn(['INAPPROPRIATE', 'OFFENSIVE', 'SPAM', 'RELIGIOUS_SENSITIVE'])
  reason: string;

  @ApiPropertyOptional({
    description: '详细描述',
    example: '内容包含不当信息',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
