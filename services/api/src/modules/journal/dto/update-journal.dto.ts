import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class UpdateJournalDto {
  @ApiPropertyOptional({
    description: 'Updated title. Max 200 characters. / 更新标题，最多200字符',
    example: '菩提伽耶朝圣记（修订版）',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated content/body text. / 更新正文内容',
    example: '在菩提伽耶度过了难忘的三天...',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Updated image URL array. Replaces the entire image list. / 更新图片URL数组，替换整个图片列表',
    type: [String],
    example: ['https://images.zuting.org/journals/updated-1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Updated mood tag. / 更新心情标签',
    example: '感恩',
    enum: ['感悟', '喜悦', '平静', '震撼', '感恩', '庄严'],
  })
  @IsOptional()
  @IsString()
  mood?: string;

  @ApiPropertyOptional({
    description: 'Update public visibility. true = visible to all, false = private. / 更新公开状态',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
