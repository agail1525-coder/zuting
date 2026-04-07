import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { TEAM_ORG_TYPES } from './create-team.dto';

export class UpsertCaseDto {
  @ApiProperty()
  @IsString()
  @MaxLength(80)
  slug: string;

  @ApiProperty()
  @IsString()
  @MaxLength(120)
  teamName: string;

  @ApiProperty({ enum: TEAM_ORG_TYPES })
  @IsIn(TEAM_ORG_TYPES as unknown as string[])
  orgType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  industry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  themeId?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  headcount: number;

  @ApiProperty()
  @IsString()
  @MaxLength(8000)
  story: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  highlights?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  photos?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  videoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  testimonial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  consentSigned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
