import { IsArray, IsInt, IsOptional, IsString, Min, Max, ValidateNested, MaxLength, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RouteSiteItemDto {
  @ApiProperty({ description: '圣地ID' })
  @IsString()
  siteId!: string;

  @ApiProperty({ description: '第几天 (1-based)', minimum: 1, maximum: 30 })
  @IsInt()
  @Min(1)
  @Max(30)
  day!: number;

  @ApiProperty({ description: '当天内的顺序 (1-based)', minimum: 1 })
  @IsInt()
  @Min(1)
  order!: number;

  @ApiProperty({ description: '建议停留时长(如"2h","半天")', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  duration?: string;

  @ApiProperty({ description: '行程备注', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ReplaceRouteSitesDto {
  @ApiProperty({ type: [RouteSiteItemDto], description: '完整的站点列表(将替换原有所有站点)' })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => RouteSiteItemDto)
  sites!: RouteSiteItemDto[];
}
