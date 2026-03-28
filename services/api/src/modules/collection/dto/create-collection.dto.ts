import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty({
    description: 'Collection name. Max 100 characters. / 收藏夹名称，最多100字符',
    example: '我的佛教圣地收藏',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Optional description for the collection. Max 500 characters. / 收藏夹描述（可选），最多500字符',
    example: '记录我走过的佛教圣地，分享给同修',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Cover image URL for the collection. / 收藏夹封面图URL',
    example: 'https://images.zuting.org/collections/cover-1.jpg',
  })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({
    description: 'Whether this collection is publicly visible. Default: false. / 是否公开可见，默认false',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
