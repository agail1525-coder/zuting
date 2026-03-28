import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchSuggestionsDto {
  @ApiProperty({
    description: 'Autocomplete query string / 自动补全搜索词',
    example: '菩提',
  })
  @IsString()
  @MaxLength(100)
  q: string;
}
