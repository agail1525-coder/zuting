import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import { CreateRoomDto } from './dto/create-room.dto';

@ApiTags('chat')
@ApiBearerAuth('bearer')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  @ApiOperation({
    summary: 'Get my chat rooms',
    description:
      '获取当前用户的聊天房间列表，包含最后一条消息和未读消息数。\n\n' +
      'Get all chat rooms for the current user, with last message and unread count.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of chat rooms. / 聊天房间列表。',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  getRooms(@CurrentUser('id') userId: string) {
    return this.chatService.getRooms(userId);
  }

  @Post('rooms')
  @ApiOperation({
    summary: 'Create a new chat room',
    description:
      '创建新的聊天房间。支持私聊、商家咨询、导游对话等类型。\n\n' +
      'Create a new chat room. Supports PRIVATE, MERCHANT_INQUIRY, GUIDE_CHAT types.',
  })
  @ApiBody({ type: CreateRoomDto })
  @ApiResponse({
    status: 201,
    description: 'Chat room created. / 聊天房间已创建。',
  })
  @ApiResponse({ status: 400, description: 'Validation failed. / 数据校验失败。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  createRoom(
    @Body() dto: CreateRoomDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.createRoom(
      userId,
      dto.type,
      dto.participantIds,
      dto.name,
    );
  }

  @Get('rooms/:id/messages')
  @ApiOperation({
    summary: 'Get room messages (paginated)',
    description:
      '获取指定聊天房间的消息列表（分页，每页50条，最新在前）。仅房间参与者可访问。\n\n' +
      'Get paginated messages for a room (50 per page, newest first). Only room participants can access.',
  })
  @ApiParam({
    name: 'id',
    description: 'Chat room ID (CUID). / 聊天房间ID',
    example: 'clx5room001ab12cd34ef56',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1). / 页码',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated message list. / 分页消息列表。',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({
    status: 403,
    description: 'Not a participant. / 非聊天参与者。',
  })
  getMessages(
    @Param('id') roomId: string,
    @Query('page') page: string | undefined,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.getMessages(
      roomId,
      userId,
      page ? parseInt(page, 10) : 1,
    );
  }

  @Post('rooms/:id/read')
  @ApiOperation({
    summary: 'Mark room messages as read',
    description:
      '标记指定房间的消息为已读（更新lastReadAt时间戳）。\n\n' +
      'Mark all messages in a room as read (updates lastReadAt timestamp).',
  })
  @ApiParam({
    name: 'id',
    description: 'Chat room ID (CUID). / 聊天房间ID',
    example: 'clx5room001ab12cd34ef56',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages marked as read. / 消息已标记为已读。',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  markAsRead(
    @Param('id') roomId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.markAsRead(roomId, userId);
  }

  @Delete('messages/:id')
  @ApiOperation({
    summary: 'Soft delete own message',
    description:
      '软删除自己发送的消息（仅发送者可操作）。\n\n' +
      'Soft delete a message you sent (only sender can delete).',
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID (CUID). / 消息ID',
    example: 'clx5msg001ab12cd34ef56',
  })
  @ApiResponse({
    status: 200,
    description: 'Message deleted. / 消息已删除。',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({
    status: 403,
    description: 'Not the sender. / 非消息发送者。',
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found. / 消息不存在。',
  })
  deleteMessage(
    @Param('id') messageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.deleteMessage(messageId, userId);
  }
}
