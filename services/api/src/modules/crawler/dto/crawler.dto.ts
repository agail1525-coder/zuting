import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCrawlerSourceDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) key?: string;
  @ApiProperty() @IsString() @MaxLength(200) name!: string;
  @ApiProperty() @IsString() @MaxLength(500) baseUrl!: string;
  @ApiProperty({ enum: ['HOTEL', 'RESTAURANT', 'EXPERIENCE', 'OFFICIAL', 'TRANSPORT', 'GUIDE'] })
  @IsString()
  type!: string;

  @ApiPropertyOptional({ enum: ['HOLY_SITE', 'MERCHANT', 'PRICE', 'GUIDE', 'NEWS'] })
  @IsOptional()
  @IsString()
  targetDomain?: string;

  @ApiPropertyOptional({ enum: ['OFFICIAL', 'WIKI', 'OTA', 'MAP', 'UGC', 'MEDIA'] })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priority?: number;

  @ApiPropertyOptional({ enum: ['HTTP', 'BROWSER', 'API', 'LLM'] })
  @IsOptional()
  @IsString()
  strategy?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() proxyNeeded?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) notes?: string;

  @ApiPropertyOptional({ description: 'cron expression, default "0 3 * * *"' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  schedule?: string;

  @ApiProperty({ description: 'selector object {list,title,price,images,coords,url,description,rating,query}' })
  @IsObject()
  selector!: Record<string, string>;

  @ApiProperty({ description: 'predefined parser function name' })
  @IsString()
  @MaxLength(100)
  parser!: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(100) @Max(60000) rateLimitMs?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() enabled?: boolean;
}

export class UpdateCrawlerSourceDto extends PartialType(CreateCrawlerSourceDto) {}

export class AcknowledgeAlertDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) note?: string;
}

export class RunMatrixDto {
  @ApiPropertyOptional() @IsOptional() @IsString() domain?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() channel?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(5) minPriority?: number;
}
