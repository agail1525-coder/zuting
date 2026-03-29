import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class BindInviteDto {
  @ApiProperty({ description: '邀请码 (6位字母数字)', example: 'A1B2C3' })
  @IsString()
  @Length(6, 6)
  code: string;
}
