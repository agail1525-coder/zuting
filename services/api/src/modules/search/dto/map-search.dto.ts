import { IsNumber, IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MapSearchDto {
  @ApiProperty({ description: 'South-west latitude / 西南纬度', example: 20.0 })
  @Type(() => Number)
  @IsNumber()
  swLat: number;

  @ApiProperty({ description: 'South-west longitude / 西南经度', example: 68.0 })
  @Type(() => Number)
  @IsNumber()
  swLng: number;

  @ApiProperty({ description: 'North-east latitude / 东北纬度', example: 35.0 })
  @Type(() => Number)
  @IsNumber()
  neLat: number;

  @ApiProperty({ description: 'North-east longitude / 东北经度', example: 97.0 })
  @Type(() => Number)
  @IsNumber()
  neLng: number;

  @ApiPropertyOptional({
    description: 'Filter by religion ID / 按信仰ID过滤',
    example: 'clx1abc2d0000ab12cd34ef56',
  })
  @IsOptional()
  @IsString()
  religionId?: string;

  @ApiPropertyOptional({
    description: 'Location type filter: holy-site | temple | all / 地点类型',
    enum: ['holy-site', 'temple', 'all'],
    example: 'all',
  })
  @IsOptional()
  @IsString()
  @IsIn(['holy-site', 'temple', 'all'])
  type?: string = 'all';
}
