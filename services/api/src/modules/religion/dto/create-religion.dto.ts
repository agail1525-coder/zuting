import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, Matches } from 'class-validator';

export class CreateReligionDto {
  @ApiProperty({ description: 'Chinese name / 文化传统中文名称', example: '佛教' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'English name / 英文名称', example: 'Buddhism' })
  @IsString()
  nameEn: string;

  @ApiProperty({ description: 'URL slug', example: 'buddhism' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must contain only lowercase letters, numbers, and hyphens' })
  slug: string;

  @ApiPropertyOptional({ description: 'Symbol / 符号', example: '☸' })
  @IsOptional() @IsString()
  symbol?: string;

  @ApiPropertyOptional({ description: 'Theme color hex', example: '#FFD700' })
  @IsOptional() @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be a valid hex color (e.g. #FFD700)' })
  color?: string;

  // ── 深度内容 ──
  @ApiPropertyOptional() @IsOptional() @IsString() heroImage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tagline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() summary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() foundedYear?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() founder?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() followers?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() origin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() development?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() keyEvents?: unknown;
  @ApiPropertyOptional() @IsOptional() @IsString() contributions?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() controversies?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() sacredTexts?: unknown;

  // ── 商业实践 ──
  @ApiPropertyOptional() @IsOptional() @IsString() businessPhilosophy?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() businessValues?: unknown;
  @ApiPropertyOptional() @IsOptional() @IsString() businessInsight?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() businessCases?: unknown;
}
