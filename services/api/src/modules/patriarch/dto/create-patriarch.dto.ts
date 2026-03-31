import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsArray } from 'class-validator';

export class CreatePatriarchDto {
  @ApiProperty({ example: '释迦牟尼' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Shakyamuni Buddha' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ example: '563 BCE - 483 BCE' })
  @IsOptional()
  @IsString()
  dates?: string;

  @ApiPropertyOptional({ example: '佛祖' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsString()
  biography: string;

  @ApiProperty()
  @IsString()
  coreTeaching: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: '曹洞宗' })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  generation?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  koans?: Record<string, unknown>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  achievements?: string;

  @ApiPropertyOptional()
  @IsOptional()
  templeNames?: Record<string, unknown>[];

  @ApiPropertyOptional()
  @IsOptional()
  classicQuotes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  works?: Record<string, unknown>[];

  @ApiProperty()
  @IsString()
  religionId: string;
}
