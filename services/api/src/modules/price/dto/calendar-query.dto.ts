import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CalendarQueryDto {
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
    description: '开始日期 (YYYY-MM-DD) / Start date',
    example: '2026-04-01',
  })
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: '结束日期 (YYYY-MM-DD) / End date',
    example: '2026-04-30',
  })
  @IsString()
  @IsNotEmpty()
  endDate: string;
}
