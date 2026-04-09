import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Sse,
  Req,
  BadRequestException,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { XiaohongService } from './xiaohong.service';
import { ChatMessageDto } from './dto/chat.dto';
import { CreateSuggestionDto, UpdateSuggestionDto } from './dto/suggestion.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('xiaohong')
@Controller('xiaohong')
export class XiaohongController {
  constructor(private readonly xiaohongService: XiaohongService) {}

  @Public()
  @Post('chat')
  @ApiOperation({
    summary: '小鸿对话 / Chat with XiaoHong',
    description:
      '发送消息给小鸿AI助手。如配置了Claude API则使用LLM回复，否则使用规则引擎。支持对话上下文。',
  })
  @ApiResponse({
    status: 200,
    description: '返回小鸿的完整回复，包含意图分析和对话ID',
  })
  chat(@Body() dto: ChatMessageDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.xiaohongService.chat(dto.message, userId, dto.conversationId);
  }

  @Public()
  @Sse('chat/stream')
  @ApiOperation({
    summary: '小鸿流式对话 / Streaming chat with XiaoHong (SSE)',
    description:
      '通过 Server-Sent Events 流式返回。LLM模式返回真正的token级流式，降级模式模拟打字效果。',
  })
  @ApiQuery({
    name: 'message',
    required: true,
    description: '用户消息',
    example: '佛教文化有哪些圣地？',
  })
  @ApiQuery({
    name: 'conversationId',
    required: false,
    description: '对话ID（可选，用于多轮对话）',
  })
  chatStream(
    @Query('message') message: string,
    @Query('conversationId') conversationId: string,
    @Req() req: any,
  ): Observable<MessageEvent> {
    if (!message || message.length > 2000) {
      throw new BadRequestException(
        'Message is required and must not exceed 2000 characters',
      );
    }
    const userId = req.user?.id;
    return this.xiaohongService.chatStream(message, userId, conversationId);
  }

  @Public()
  @Get('suggestions')
  @ApiOperation({
    summary: '获取快捷建议 / Get quick action suggestions',
    description: '返回从AI配置中心管理的快捷操作建议列表。',
  })
  getSuggestions() {
    return this.xiaohongService.getSuggestions();
  }

  @Roles('ADMIN')
  @Post('suggestions')
  @ApiOperation({
    summary: '添加快捷建议 / Add a suggestion',
    description: '管理员添加新的快捷操作建议（持久化到AI配置）。',
  })
  addSuggestion(@Body() dto: CreateSuggestionDto) {
    return this.xiaohongService.addSuggestion(dto.text, dto.category);
  }

  @Roles('ADMIN')
  @Put('suggestions/:index')
  @ApiOperation({
    summary: '更新快捷建议 / Update a suggestion',
    description: '管理员更新指定位置的快捷操作建议。',
  })
  @ApiParam({ name: 'index', type: Number, description: '建议的索引位置' })
  updateSuggestion(
    @Param('index', ParseIntPipe) index: number,
    @Body() dto: UpdateSuggestionDto,
  ) {
    try {
      return this.xiaohongService.updateSuggestion(index, dto);
    } catch {
      throw new NotFoundException(`Suggestion at index ${index} not found`);
    }
  }

  @Roles('ADMIN')
  @Delete('suggestions/:index')
  @ApiOperation({
    summary: '删除快捷建议 / Delete a suggestion',
    description: '管理员删除指定位置的快捷操作建议。',
  })
  @ApiParam({ name: 'index', type: Number, description: '建议的索引位置' })
  deleteSuggestion(@Param('index', ParseIntPipe) index: number) {
    try {
      return this.xiaohongService.deleteSuggestion(index);
    } catch {
      throw new NotFoundException(`Suggestion at index ${index} not found`);
    }
  }
}
