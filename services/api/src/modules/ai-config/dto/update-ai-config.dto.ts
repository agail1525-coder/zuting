import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAiConfigDto {
  @ApiProperty({
    description: '配置值 / Config value',
    example: 'claude-sonnet-4-20250514',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  value: string;
}
