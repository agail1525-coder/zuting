import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCrawlerSourceDto {
  @ApiProperty() @IsString() @MaxLength(200) name!: string;
  @ApiProperty() @IsString() @MaxLength(500) baseUrl!: string;
  @ApiProperty({ enum: ['HOTEL', 'RESTAURANT', 'EXPERIENCE', 'OFFICIAL', 'TRANSPORT', 'GUIDE'] })
  @IsString()
  type!: string;
  @ApiPropertyOptional({ description: 'cron expression, default "0 3 * * *"' })
  @IsOptional()
  @IsString()
  schedule?: string;
  @ApiProperty({ description: 'selector object {list,title,price,images,coords,url,description,rating}' })
  @IsObject()
  selector!: Record<string, string>;
  @ApiProperty({ description: 'predefined parser function name' })
  @IsString()
  @MaxLength(100)
  parser!: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(100) rateLimitMs?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() enabled?: boolean;
}

export class UpdateCrawlerSourceDto extends PartialType(CreateCrawlerSourceDto) {}

export class AcknowledgeAlertDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) note?: string;
}
