import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateAlertDto {
  @ApiProperty({
    description: '实体类型 / Entity type',
    example: 'ROUTE',
    enum: ['PACKAGE', 'ROUTE'],
  })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({
    description: '实体ID / Entity ID',
    example: 'clx1234abcdef',
  })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({
    description: '实体名称（用于展示）/ Entity display name',
    example: '六祖慧能禅宗之路',
  })
  @IsString()
  @IsNotEmpty()
  entityName: string;

  @ApiProperty({
    description: '目标价格（分）/ Target price in cents',
    example: 180000,
  })
  @IsInt()
  @Min(1)
  targetPrice: number;

  @ApiProperty({
    description: '当前价格（分）/ Current price in cents at time of alert creation',
    example: 198000,
  })
  @IsInt()
  @Min(0)
  currentPrice: number;
}
