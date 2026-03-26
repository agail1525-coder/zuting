import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateTempleDto {
  @ApiProperty({ example: '少林寺' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Shaolin Temple' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiProperty({ example: 'China' })
  @IsString()
  country: string;

  @ApiPropertyOptional({ example: '495 AD' })
  @IsOptional()
  @IsString()
  foundingDate?: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty()
  @IsString()
  religionId: string;
}
