import { Controller, Get, Post, Body, Query, Sse, BadRequestException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { XiaohongService } from './xiaohong.service';
import { ChatMessageDto } from './dto/chat.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('xiaohong')
@Controller('xiaohong')
export class XiaohongController {
  constructor(private readonly xiaohongService: XiaohongService) {}

  @Public()
  @Post('chat')
  @ApiOperation({
    summary: '小鸿对话 / Chat with XiaoHong',
    description:
      '发送消息给小鸿AI助手，返回完整回复。小鸿会自动识别意图并查询相关数据。',
  })
  @ApiResponse({
    status: 200,
    description: '返回小鸿的完整回复，包含意图分析和相关数据',
  })
  chat(@Body() dto: ChatMessageDto) {
    return this.xiaohongService.chat(dto.message, dto.conversationId);
  }

  @Public()
  @Sse('chat/stream')
  @ApiOperation({
    summary: '小鸿流式对话 / Streaming chat with XiaoHong (SSE)',
    description:
      '通过 Server-Sent Events 流式返回小鸿的回复，模拟打字效果。',
  })
  @ApiQuery({
    name: 'message',
    required: true,
    description: '用户消息',
    example: '佛教有哪些圣地？',
  })
  chatStream(
    @Query('message') message: string,
  ): Observable<MessageEvent> {
    if (!message || message.length > 2000) {
      throw new BadRequestException(
        'Message is required and must not exceed 2000 characters',
      );
    }
    return this.xiaohongService.chatStream(message);
  }

  @Public()
  @Get('suggestions')
  @ApiOperation({
    summary: '获取快捷建议 / Get quick action suggestions',
    description: '返回预设的快捷操作建议，方便用户快速开始对话。',
  })
  getSuggestions() {
    return this.xiaohongService.getSuggestions();
  }
}
