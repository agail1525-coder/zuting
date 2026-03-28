import { IsString, IsInt, IsOptional, IsArray, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRouteDto {
  @ApiProperty({ example: 'sixth-patriarch-huineng' })
  @IsString()
  slug: string;

  @ApiProperty({ example: '六祖慧能路线' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Sixth Patriarch Huineng Route' })
  @IsString()
  titleEn: string;

  @ApiProperty({ example: '追随六祖足迹，体验禅宗精髓' })
  @IsString()
  subtitle: string;

  @ApiProperty({ enum: ['ZEN', 'BUDDHIST', 'TAOIST', 'CHRISTIAN', 'ISLAMIC', 'HINDU', 'JEWISH', 'CROSS_CULTURAL', 'CULTURAL_HERITAGE'] })
  @IsString()
  category: string;

  @ApiProperty({ enum: ['EASY', 'MODERATE', 'CHALLENGING'] })
  @IsString()
  difficulty: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(30)
  duration: number;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(0)
  @Max(29)
  nights: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({ type: [String], example: ['禅宗文化', '素斋体验'] })
  @IsArray()
  highlights: string[];

  @ApiProperty({ example: '详细路线介绍...' })
  @IsString()
  description: string;

  @ApiProperty({ description: '逐日行程JSON数组' })
  itinerary: object[];

  @ApiProperty({ example: 328000, description: '起价(分)' })
  @IsInt()
  @Min(0)
  priceFrom: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  included: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  excluded: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tips?: string[];

  @ApiProperty({ example: '春秋两季' })
  @IsString()
  season: string;

  @ApiProperty({ example: '2-8人小团' })
  @IsString()
  groupSize: string;

  @ApiPropertyOptional({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  religionId?: string;
}
