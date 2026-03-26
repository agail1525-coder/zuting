import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreatePatriarchDto {
  @ApiProperty({ example: '释迦牟尼' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Shakyamuni Buddha' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ example: '563 BCE - 483 BCE' })
  @IsOptional()
  @IsString()
  dates?: string;

  @ApiPropertyOptional({ example: '佛祖' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsString()
  biography: string;

  @ApiProperty()
  @IsString()
  coreTeaching: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty()
  @IsString()
  religionId: string;
}
