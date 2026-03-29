import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CompareQueryDto {
  @ApiProperty({
    description: '实体类型 / Entity type',
    example: 'ROUTE',
    enum: ['PACKAGE', 'ROUTE'],
  })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({
    description: '逗号分隔的实体ID列表，最多4个 / Comma-separated entity IDs, max 4',
    example: 'clx1,clx2,clx3',
  })
  @IsString()
  @IsNotEmpty()
  entityIds: string;
}
