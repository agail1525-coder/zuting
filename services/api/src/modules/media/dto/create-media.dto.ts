import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class CreateMediaDto {
  @ApiProperty({
    description: 'Entity type: HOLY_SITE or TEMPLE. / 关联实体类型',
    example: 'HOLY_SITE',
    enum: ['HOLY_SITE', 'TEMPLE'],
  })
  @IsString()
  entityType: string;

  @ApiProperty({
    description: 'Entity ID (CUID of the holy site or temple). / 关联实体ID',
    example: 'clx2xyz9f0001ab12cd34ef56',
  })
  @IsString()
  entityId: string;

  @ApiProperty({
    description: 'Media type: VIDEO, PANORAMA, or AUDIO. / 媒体类型',
    example: 'VIDEO',
    enum: ['VIDEO', 'PANORAMA', 'AUDIO'],
  })
  @IsString()
  mediaType: string;

  @ApiProperty({
    description: 'Title of the media content. / 媒体标题',
    example: '菩提伽耶航拍导览',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Media file URL. / 媒体文件URL',
    example: 'https://cdn.zuting.org/media/bodh-gaya-aerial.mp4',
  })
  @IsString()
  url: string;

  @ApiPropertyOptional({
    description: 'Description of the media content. / 媒体描述',
    example: '从空中俯瞰菩提伽耶大觉寺全貌',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Thumbnail image URL. / 缩略图URL',
    example: 'https://cdn.zuting.org/media/bodh-gaya-aerial-thumb.jpg',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Duration in seconds (for VIDEO and AUDIO). / 时长(秒)',
    example: 180,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({
    description: 'Sort order (lower = first). Default 0. / 排序权重',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
