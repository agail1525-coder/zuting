import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

const ENTITY_TYPES = ['HOLY_SITE', 'TEMPLE', 'PATRIARCH', 'TRIP'];

export class QuickSaveDto {
  @ApiProperty({
    description: 'Type of entity being quick-saved. / 快速收藏的实体类型',
    example: 'HOLY_SITE',
    enum: ENTITY_TYPES,
  })
  @IsString()
  @IsIn(ENTITY_TYPES)
  entityType: string;

  @ApiProperty({
    description: 'ID of the entity to quick-save. / 快速收藏的实体ID',
    example: 'clx2xyz9f0001ab12cd34ef56',
  })
  @IsString()
  entityId: string;
}
