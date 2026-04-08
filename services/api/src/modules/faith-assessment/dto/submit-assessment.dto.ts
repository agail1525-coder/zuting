import {
  IsArray,
  IsEnum,
  IsString,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AnswerDto {
  @ApiProperty({ description: '题目ID' })
  @IsString()
  questionId: string;

  @ApiProperty({ enum: ['A', 'B', 'C', 'D'] })
  @IsIn(['A', 'B', 'C', 'D'])
  selectedOption: string;
}

export class SubmitAssessmentDto {
  @ApiProperty({ enum: ['PERSONAL', 'FAMILY', 'ENTERPRISE'] })
  @IsEnum({ PERSONAL: 'PERSONAL', FAMILY: 'FAMILY', ENTERPRISE: 'ENTERPRISE' })
  mode: string;

  @ApiProperty({ type: [AnswerDto], description: '答案列表 (15-20题)' })
  @IsArray()
  @ArrayMinSize(10)
  @ArrayMaxSize(25)
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
