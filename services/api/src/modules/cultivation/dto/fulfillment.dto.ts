import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const TRADITIONS = [
  'ZEN',
  'TAOISM',
  'CONFUCIANISM',
  'TIBETAN',
  'HINDUISM',
  'SIKHISM',
  'CHRISTIANITY',
  'JUDAISM',
  'ISLAM',
  'BAHAI',
  'SHINTO',
  'INDIGENOUS',
];

export class StartJourneyDto {
  @ApiPropertyOptional({ enum: TRADITIONS, default: 'ZEN' })
  @IsOptional()
  @IsString()
  primaryTradition?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  blendTraditions?: string[];
}

export class SetTraditionDto {
  @ApiProperty({ enum: TRADITIONS })
  @IsString()
  primaryTradition!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  blendTraditions?: string[];
}

export class SubmitSealPracticeDto {
  @ApiProperty()
  @IsString()
  sealId!: string;

  @ApiProperty({ enum: ['MORNING', 'EVENING'] })
  @IsString()
  session!: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  audioListenedSec!: number;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reflection?: string;
}

export class WisdomQueryDto {
  @ApiProperty({ minLength: 5, maxLength: 500 })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  question!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  traditions?: string[];
}

export class SynthesizeDto {
  @ApiProperty()
  @IsString()
  queryId!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  chosenTraditions!: string[];
}

export class CreateKarmaEventDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ maxLength: 5000 })
  @IsString()
  @MaxLength(5000)
  body!: string;

  @ApiProperty()
  @IsDateString()
  eventAt!: string;

  @ApiPropertyOptional({ enum: ['PRIVATE', 'FRIENDS', 'PUBLIC'] })
  @IsOptional()
  @IsString()
  visibility?: string;
}

export class UpdateThreeLifeVisionDto {
  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  personalGoal?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  familyGoal?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  businessGoal?: string;
}
