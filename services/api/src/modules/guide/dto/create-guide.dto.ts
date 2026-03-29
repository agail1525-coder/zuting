import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateGuideDto {
  @ApiProperty({ description: '攻略标题', example: '菩提伽耶朝圣完全指南' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: '攻略正文内容（支持Markdown）', example: '## 行前准备\n...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: '封面图片URL', example: 'https://cdn.example.com/cover.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '关联实体类型：HOLY_SITE 或 TEMPLE', example: 'HOLY_SITE' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: '关联实体ID', example: 'clx1abc2d0000ab12cd34ef56' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({
    description: '标签列表',
    type: [String],
    example: ['佛教', '印度', '朝圣'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
