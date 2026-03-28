import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchHistoryDto {
  @ApiProperty({
    description: 'Keyword to record in search history / 要记录的搜索关键词',
    example: '菩提伽耶',
  })
  @IsString()
  @MaxLength(200)
  keyword: string;
}
