import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  MaxLength,
} from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({
    description: 'Question title. Max 200 characters. / 问题标题，最多200字符',
    example: '菩提伽耶最佳文化探访时间是什么时候？',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Detailed question content. / 问题详细内容',
    example: '我计划前往菩提伽耶文化探访，想了解一下最佳的探访季节和注意事项。',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Entity type this question relates to (e.g. holy-site, temple). / 关联实体类型',
    example: 'holy-site',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Entity ID this question relates to. / 关联实体ID',
    example: 'clx2xyz9f0001ab12cd34ef56',
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Tags for categorizing the question. / 问题标签',
    type: [String],
    example: ['文化之旅', '佛教文化', '印度'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
