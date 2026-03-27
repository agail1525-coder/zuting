import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSuggestionDto {
  @ApiProperty({
    description: '建议文本 / Suggestion text',
    example: '推荐一个朝圣路线',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  text: string;

  @ApiPropertyOptional({
    description: '分类 / Category',
    example: '路线推荐',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  category?: string;
}

export class UpdateSuggestionDto {
  @ApiPropertyOptional({
    description: '建议文本 / Suggestion text',
    example: '推荐一个朝圣路线',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  text?: string;

  @ApiPropertyOptional({
    description: '分类 / Category',
    example: '路线推荐',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  category?: string;
}
