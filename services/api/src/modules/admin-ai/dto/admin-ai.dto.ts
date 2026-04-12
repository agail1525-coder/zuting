import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export const SUPPORTED_LANGS = ['zh', 'en', 'ja', 'ko', 'th', 'hi', 'ar'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export class TranslateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  text!: string;

  @IsOptional()
  @IsString()
  @IsIn([...SUPPORTED_LANGS])
  sourceLang?: SupportedLang;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  targetLangs!: SupportedLang[];
}

export class ContentGenDto {
  @IsString() resource!: string;
  @IsString() fieldName!: string;
  @IsOptional() @IsString() @MaxLength(2000) context?: string;
  @IsOptional() @IsString() style?: string;
  @IsOptional() @IsString() language?: string;
}

export class SeoDto {
  @IsString() resource!: string;
  @IsString() id!: string;
  @IsOptional() @IsString() language?: string;
}

export class ModerateDto {
  @IsOptional() @IsString() @MaxLength(10000) text?: string;
  @IsOptional() @IsString() imageUrl?: string;
}

export class InsightDto {
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  question!: string;
}

export class CommandDto {
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  utterance!: string;
}

export class PromptLabRunDto {
  @IsString() prompt!: string;
  @IsString() model!: string;
  @IsOptional() temperature?: number;
  @IsOptional() maxTokens?: number;
  @IsOptional() @IsString() systemPrompt?: string;
}
