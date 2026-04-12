import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export const MEDIA_TYPES = ['IMAGE', 'VIDEO', 'AUDIO', 'PANO360'] as const;
export type MediaTypeValue = (typeof MEDIA_TYPES)[number];

export class CreateMediaAssetDto {
  @IsString()
  @IsUrl({ require_protocol: false })
  url!: string;

  @IsOptional()
  @IsString()
  @IsIn([...MEDIA_TYPES])
  type?: MediaTypeValue;

  @IsOptional() @IsInt() @Min(0) width?: number;
  @IsOptional() @IsInt() @Min(0) height?: number;
  @IsOptional() @IsInt() @Min(0) size?: number;
  @IsOptional() @IsString() hash?: string;
  @IsOptional() @IsString() @MaxLength(500) altText?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsBoolean() aiGenerated?: boolean;
  @IsOptional() @IsString() folder?: string;
}

export class UpdateMediaAssetDto {
  @IsOptional() @IsString() @MaxLength(500) altText?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsString() folder?: string;
}

export class AiGenerateImageDto {
  @IsString() @MaxLength(2000) prompt!: string;
  @IsOptional() @IsString() style?: string;
  @IsOptional() @IsString() size?: string;
}

export class ListMediaQueryDto {
  @IsOptional() @IsString() @IsIn([...MEDIA_TYPES]) type?: MediaTypeValue;
  @IsOptional() @IsString() folder?: string;
  @IsOptional() @IsString() tag?: string;
  @IsOptional() @IsString() q?: string;
  @IsOptional() page?: string;
  @IsOptional() pageSize?: string;
}
