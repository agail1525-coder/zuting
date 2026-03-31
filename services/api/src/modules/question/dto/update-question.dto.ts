import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  MaxLength,
} from 'class-validator';

export class UpdateQuestionDto {
  @ApiPropertyOptional({
    description: 'Updated question title. Max 200 characters. / 更新的问题标题，最多200字符',
    example: '菩提伽耶最佳朝圣时间是什么时候？',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated detailed question content. / 更新的问题详细内容',
    example: '我计划前往菩提伽耶朝圣，想了解一下最佳的朝圣季节和注意事项。',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Updated tags for categorizing the question. / 更新的问题标签',
    type: [String],
    example: ['朝圣', '佛教', '印度'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
