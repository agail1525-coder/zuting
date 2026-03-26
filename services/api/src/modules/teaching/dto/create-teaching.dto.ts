import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateTeachingDto {
  @ApiProperty({ example: '四圣谛' })
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  originalText: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  translationCn?: string;

  @ApiProperty()
  @IsString()
  religionId: string;
}
