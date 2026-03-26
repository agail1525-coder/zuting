import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateJournalDto {
  @ApiProperty({
    description: 'ID of the user creating this journal entry. / 创建日志的用户ID',
    example: 'clx1abc2d0000ab12cd34ef56',
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'ID of the associated trip (optional). / 关联行程ID（可选）',
    example: 'clx3trip0001ab12cd34ef56',
  })
  @IsOptional()
  @IsString()
  tripId?: string;

  @ApiPropertyOptional({
    description: 'ID of the associated holy site (optional). / 关联圣地ID（可选）',
    example: 'clx2xyz9f0001ab12cd34ef56',
  })
  @IsOptional()
  @IsString()
  siteId?: string;

  @ApiProperty({
    description: 'Title of the journal entry. Max 200 characters. / 日志标题，最多200字符',
    example: '菩提伽耶朝圣记 — A Pilgrimage to Bodh Gaya',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Main content/body of the journal entry. Supports rich text. / 日志正文内容，支持富文本',
    example: '今天来到了佛陀成道的地方，在菩提树下冥想了一个小时，感受到了前所未有的宁静...',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Array of image URLs uploaded for this journal entry. / 日志配图URL数组',
    type: [String],
    example: ['https://images.zuting.org/journals/bodh-gaya-1.jpg', 'https://images.zuting.org/journals/bodh-gaya-2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Mood/emotion tag for this journal entry. / 心情/情绪标签',
    example: '震撼',
    enum: ['感悟', '喜悦', '平静', '震撼', '感恩', '庄严'],
  })
  @IsOptional()
  @IsString()
  mood?: string;

  @ApiPropertyOptional({
    description: 'Whether this journal entry is publicly visible. Default: false. / 日志是否公开可见，默认false',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
