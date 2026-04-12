import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PackageTier, PackageCategory } from '@prisma/client';

const TIERS = ['LUXURY', 'BUSINESS', 'STANDARD', 'BUDGET'] as const;
const CATEGORIES = [
  'HOTEL',
  'RESTAURANT',
  'TRANSPORT',
  'EXPERIENCE',
  'SHOPPING',
  'GUIDE',
  'GROUND_TEAM',
] as const;

export class CreateDestinationPackageDto {
  @ApiPropertyOptional() @IsOptional() @IsString() holySiteId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() routeId?: string;

  @ApiProperty({ enum: TIERS }) @IsEnum(TIERS as unknown as object) tier!: PackageTier;
  @ApiProperty({ enum: CATEGORIES }) @IsEnum(CATEGORIES as unknown as object) category!: PackageCategory;

  @ApiProperty() @IsString() @MaxLength(200) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) titleEn?: string;
  @ApiProperty() @IsString() description!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() coverImage?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() images?: string[];

  @ApiProperty() @IsInt() @Min(0) priceMin!: number;
  @ApiProperty() @IsInt() @Min(0) priceMax!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
  @ApiProperty() @IsString() priceUnit!: string;
  @ApiProperty() @IsISO8601() priceAsOf!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() groundTeamName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() groundTeamPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() groundTeamWechat?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() groundTeamHours?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() groundTeamNote?: string;

  @ApiProperty({ type: [String] }) @IsArray() sourceUrls!: string[];
  @ApiProperty() @IsISO8601() sourceLastSeenAt!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() crawlerSourceId?: string;

  @ApiPropertyOptional({ type: [Number] }) @IsOptional() @IsArray() bestMonths?: number[];
  @ApiPropertyOptional({ type: [Number] }) @IsOptional() @IsArray() avoidMonths?: number[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() taboos?: string[];
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) leadTimeDays?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() enabled?: boolean;
}

export class UpdateDestinationPackageDto extends PartialType(CreateDestinationPackageDto) {}
