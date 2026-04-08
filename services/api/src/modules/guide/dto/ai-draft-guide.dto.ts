import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * 用户提交的"粗素材"，由AI整理成游记草稿
 * - rawNotes: 大白话文本（可以是语音转写+手写混合）
 * - imageUrls: 已通过 /api/uploads/image 上传完成的图片URL
 * - entityType/entityId: 可选关联到具体圣地/祖庭/宗教
 */
export class AiDraftGuideDto {
  @ApiProperty({
    description: '用户的大白话素材（语音转写+手写混合）',
    example: '今天去了武当山，凌晨爬上金顶看日出，云海翻涌，感觉整个人都被洗涤了。道长说...',
  })
  @IsString()
  @MaxLength(5000)
  rawNotes: string;

  @ApiPropertyOptional({
    description: '已上传图片URL列表（最多9张）',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({
    description: '游记分类',
    example: 'pilgrimage-diary',
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @ApiPropertyOptional({
    description: '关联实体类型 (RELIGION | HOLY_SITE | TEMPLE)',
    example: 'HOLY_SITE',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  entityType?: string;

  @ApiPropertyOptional({ description: '关联实体ID' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  entityId?: string;

  @ApiPropertyOptional({
    description: '关联实体名称（前端已知时传入，避免后端再查）',
    example: '武当山',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  entityName?: string;
}

/** AI草稿返回结构 */
export interface AiDraftGuideResult {
  title: string;
  content: string; // markdown，含内联 ![](url)
  tags: string[];
  suggestedCoverIdx: number; // imageUrls中的索引，-1表示无建议
}
