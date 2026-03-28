import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({
    description: '用户消息 / User message',
    example: '佛教有哪些圣地？',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({
    description: '会话ID（可选，传入则继续该对话） / Conversation ID for multi-turn chat',
    example: 'conv_abc123',
  })
  @IsString()
  @IsOptional()
  conversationId?: string;
}
