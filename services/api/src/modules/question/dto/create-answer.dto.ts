import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAnswerDto {
  @ApiProperty({
    description: 'Answer content. / 回答内容',
    example: '菩提伽耶最佳朝圣时间是10月至3月，气候凉爽舒适。4月至6月极其炎热，不建议前往。',
  })
  @IsString()
  content: string;
}
