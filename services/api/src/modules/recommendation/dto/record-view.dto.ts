import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RecordViewDto {
  @ApiProperty({ description: '实体类型', example: 'SITE', enum: ['SITE', 'TEMPLE', 'RELIGION'] })
  @IsString()
  entityType: string;

  @ApiProperty({ description: '实体ID', example: 'cuid-123' })
  @IsString()
  entityId: string;
}
