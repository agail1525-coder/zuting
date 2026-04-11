import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const ENTRY_KIND = ['CHAT', 'INSIGHT', 'REFLECTION', 'VOW_UPDATE', 'SCRIPTURE_NOTE'] as const;
const CATEGORY = ['PERSONAL', 'FAMILY', 'CAREER', 'DAILY_STRUGGLE', 'GENERAL'] as const;
const REC_STATUS = ['PENDING', 'READ', 'PRACTICING', 'DONE', 'DISMISSED'] as const;
const VOW_CAT = ['PERSONAL', 'FAMILY', 'CAREER'] as const;

export class UpdateVowsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) personalVow?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) familyVow?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) careerVow?: string;
}

export class ListEntriesDto {
  @ApiPropertyOptional({ enum: ENTRY_KIND }) @IsOptional() @IsEnum(ENTRY_KIND) kind?: string;
  @ApiPropertyOptional({ enum: CATEGORY }) @IsOptional() @IsEnum(CATEGORY) category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) tag?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) pageSize?: number;
}

export class CreateEntryDto {
  @ApiProperty({ enum: ENTRY_KIND }) @IsEnum(ENTRY_KIND) kind!: string;
  @ApiPropertyOptional({ enum: CATEGORY }) @IsOptional() @IsEnum(CATEGORY) category?: string;
  @ApiProperty() @IsString() @MaxLength(200) title!: string;
  @ApiProperty() @IsString() @MaxLength(8000) content!: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) mood?: string;
}

export class UpdateEntryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(8000) content?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) mood?: string;
}

export class StruggleDto {
  @ApiProperty() @IsString() @MaxLength(2000) message!: string;
  @ApiPropertyOptional({ enum: CATEGORY }) @IsOptional() @IsEnum(CATEGORY) category?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}

export class UpdateRecommendationDto {
  @ApiProperty({ enum: REC_STATUS }) @IsEnum(REC_STATUS) status!: string;
}

export class DraftVowDto {
  @ApiProperty({ enum: VOW_CAT }) @IsEnum(VOW_CAT) category!: 'PERSONAL' | 'FAMILY' | 'CAREER';
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) keywords?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) currentDraft?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) hint?: string;
}

export class ShareEntryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) summary?: string;
}
