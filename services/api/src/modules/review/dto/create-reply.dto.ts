import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateReplyDto {
  @ApiProperty({ description: '回复内容', example: '感谢您的评价！' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '是否为官方回复', example: false })
  @IsOptional()
  @IsBoolean()
  isOfficial?: boolean;
}
