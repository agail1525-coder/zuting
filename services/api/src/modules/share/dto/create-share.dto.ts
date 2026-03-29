import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const PLATFORMS = ['WECHAT', 'WEIBO', 'FACEBOOK', 'TWITTER', 'WHATSAPP', 'COPY', 'NATIVE'] as const;
const ENTITY_TYPES = ['HOLY_SITE', 'TEMPLE', 'TRIP', 'GUIDE', 'QUESTION', 'PROMOTION', 'PACKAGE'] as const;

export class CreateShareDto {
  @ApiProperty({
    description: 'Sharing platform / 分享平台',
    enum: PLATFORMS,
    example: 'WECHAT',
  })
  @IsString()
  @IsIn([...PLATFORMS])
  platform: string;

  @ApiProperty({
    description: 'Type of entity being shared / 分享实体类型',
    enum: ENTITY_TYPES,
    example: 'HOLY_SITE',
  })
  @IsString()
  @IsIn([...ENTITY_TYPES])
  entityType: string;

  @ApiProperty({
    description: 'ID of the entity being shared / 分享实体ID',
    example: 'clx5abc0001ab12cd34ef56',
  })
  @IsString()
  entityId: string;

  @ApiPropertyOptional({
    description: 'User ID (auto-filled if authenticated) / 用户ID（登录时自动填充）',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
