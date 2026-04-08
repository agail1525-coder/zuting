import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class EnrichedSiteItemDto {
  @ApiProperty({ description: '前端临时 ID,用于回填映射 (ext_xxx)', example: 'ext_a1b2c3d4e5' })
  @IsString()
  @MaxLength(50)
  extId!: string;

  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  nameEn?: string;

  @IsString()
  @MaxLength(80)
  country!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsString()
  @MaxLength(40)
  religionSlug!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;
}

export class BulkCreateEnrichedHolySitesDto {
  @ApiProperty({ type: [EnrichedSiteItemDto] })
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => EnrichedSiteItemDto)
  sites!: EnrichedSiteItemDto[];
}
