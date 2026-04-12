import { IsString, IsOptional, MaxLength } from 'class-validator';

export class DialogueDto {
  @IsString()
  @MaxLength(2000)
  situation!: string;

  @IsOptional()
  @IsString()
  questionCode?: string;
}
