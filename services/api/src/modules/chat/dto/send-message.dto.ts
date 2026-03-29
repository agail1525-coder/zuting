import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'Chat room ID',
    example: 'clx5room001ab12cd34ef56',
  })
  @IsString()
  roomId: string;

  @ApiProperty({
    description: 'Message content',
    example: '你好，我想咨询一下菩提伽耶的行程',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Message type: TEXT / IMAGE / SYSTEM',
    example: 'TEXT',
    default: 'TEXT',
  })
  @IsOptional()
  @IsString()
  type?: string;
}
