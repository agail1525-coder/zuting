import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class SubmitQuizAnswerDto {
  @ApiProperty()
  @IsString()
  quizId!: string;

  @ApiProperty({ minimum: 0, maximum: 9 })
  @IsInt()
  @Min(0)
  @Max(9)
  questionIndex!: number;

  @ApiProperty({ minLength: 10, maxLength: 2000 })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  answer!: string;
}
