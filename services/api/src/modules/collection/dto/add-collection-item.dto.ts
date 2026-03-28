import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

const ENTITY_TYPES = ['HOLY_SITE', 'TEMPLE', 'PATRIARCH', 'TRIP'];

export class AddCollectionItemDto {
  @ApiProperty({
    description: 'Type of entity being saved. / 收藏的实体类型',
    example: 'HOLY_SITE',
    enum: ENTITY_TYPES,
  })
  @IsString()
  @IsIn(ENTITY_TYPES)
  entityType: string;

  @ApiProperty({
    description: 'ID of the entity to save. / 收藏的实体ID',
    example: 'clx2xyz9f0001ab12cd34ef56',
  })
  @IsString()
  entityId: string;

  @ApiPropertyOptional({
    description: 'Personal note for this item. Max 300 characters. / 该收藏项的个人备注，最多300字符',
    example: '2026年春节朝圣时必去',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}
