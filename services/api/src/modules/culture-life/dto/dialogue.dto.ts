import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';

export const LIFE_QUESTION_CODES = [
  'ORIGIN_PURPOSE', 'SUFFERING', 'LOVE_RELATIONSHIP', 'WEALTH_DESIRE',
  'FREEDOM_FATE', 'DEATH_TRANSCENDENCE', 'SIN_REDEMPTION', 'KNOWLEDGE',
  'SELF_OTHER', 'TIME_ETERNITY', 'BODY_SOUL', 'LEGACY_IMMORTALITY',
] as const;

export const LIFE_STAGES = [
  'BIRTH', 'GROWTH', 'MARRIAGE', 'CAREER', 'MIDLIFE', 'AGING', 'DEATH',
] as const;

export class DialogueDto {
  @IsString()
  @MaxLength(2000)
  situation!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  @IsIn(LIFE_QUESTION_CODES as unknown as string[])
  questionCode?: string;
}
