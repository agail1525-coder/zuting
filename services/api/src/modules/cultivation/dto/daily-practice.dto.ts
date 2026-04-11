import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const HHMM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class UpdateScheduleDto {
  @ApiPropertyOptional({ example: '05:30' })
  @IsOptional()
  @IsString()
  @Matches(HHMM_REGEX, { message: 'wakeTime 必须是 HH:mm' })
  wakeTime?: string;

  @ApiPropertyOptional({ example: '22:00' })
  @IsOptional()
  @IsString()
  @Matches(HHMM_REGEX, { message: 'sleepTime 必须是 HH:mm' })
  sleepTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

  @ApiPropertyOptional({ minimum: 0, maximum: 60 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  reminderLeadMin?: number;
}

export class UpsertSlotDto {
  @ApiProperty({ example: '05:30' })
  @IsString()
  @Matches(HHMM_REGEX)
  time!: string;

  @ApiProperty({ minimum: 1, maximum: 240 })
  @IsInt()
  @Min(1)
  @Max(240)
  durationMin!: number;

  @ApiProperty({
    example: 'MORNING_LITURGY',
    description: 'MORNING_LITURGY|EVENING_LITURGY|NOON_CHANT|SITTING|SCRIPTURE_READ|PRAYER|DEDICATION|CUSTOM|SEAL_PRACTICE',
  })
  @IsString()
  @MaxLength(30)
  kind!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  scriptureSlug?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 10000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  repetitions?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sourceRef?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  sortOrder?: number;
}

export class LogSlotDto {
  @ApiProperty({ minimum: 0, maximum: 86_400 })
  @IsInt()
  @Min(0)
  @Max(86_400)
  durationSec!: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 100_000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000)
  repetitionsDone?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reflection?: string;

  @ApiPropertyOptional({ example: 'DONE', description: 'DONE|PARTIAL|SKIPPED' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @ApiPropertyOptional({ type: [String], example: ['清净', '欢喜'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(24, { each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '若为 true, 本次打卡不计入三十印印证' })
  @IsOptional()
  @IsBoolean()
  skipSealCredit?: boolean;
}

export class ApplyTemplateDto {
  @ApiProperty()
  @IsString()
  @MaxLength(60)
  templateId!: string;

  @ApiProperty({ example: 'MORNING' })
  @IsString()
  @MaxLength(20)
  session!: string;

  @ApiPropertyOptional({ example: '05:30' })
  @IsOptional()
  @IsString()
  @Matches(HHMM_REGEX)
  startTime?: string;
}
