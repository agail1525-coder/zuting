import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({
    summary: 'List notifications for current user',
    description:
      '获取当前用户的通知列表，支持分页和仅显示未读过滤。\n\n' +
      'List notifications for the authenticated user with pagination and optional unread-only filter.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Paginated list of notifications / 通知列表（分页）' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required / 未授权' })
  findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationService.findAll(
      userId,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
      unreadOnly === 'true',
    );
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notification count',
    description:
      '获取当前用户的未读通知数量。\n\n' +
      'Get the count of unread notifications for the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Unread count returned / 未读数量返回成功' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required / 未授权' })
  getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description:
      '将指定通知标记为已读。\n\n' +
      'Mark a specific notification as read.',
  })
  @ApiParam({ name: 'id', description: 'Notification ID (通知ID)' })
  @ApiResponse({ status: 200, description: 'Notification marked as read / 通知已标记为已读' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required / 未授权' })
  @ApiResponse({ status: 404, description: 'Notification not found / 通知不存在' })
  markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationService.markAsRead(id, userId);
  }

  @Post('read-all')
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description:
      '将当前用户的所有未读通知标记为已读。\n\n' +
      'Mark all unread notifications as read for the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'All notifications marked as read / 所有通知已标记为已读' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required / 未授权' })
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete notification',
    description:
      '删除指定通知。用户只能删除自己的通知。\n\n' +
      'Delete a specific notification. Users can only delete their own notifications.',
  })
  @ApiParam({ name: 'id', description: 'Notification ID (通知ID)' })
  @ApiResponse({ status: 200, description: 'Notification deleted / 通知已删除' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required / 未授权' })
  @ApiResponse({ status: 404, description: 'Notification not found / 通知不存在' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationService.remove(id, userId);
  }

  @Post('send')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Admin: send system notification',
    description:
      '管理员发送系统通知给指定用户。需要ADMIN角色权限。\n\n' +
      'Admin endpoint to send system notifications to specified users. Requires ADMIN role.',
  })
  @ApiResponse({ status: 201, description: 'System notification sent / 系统通知发送成功' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required / 未授权' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required / 需要管理员权限' })
  sendSystem(@Body() dto: SendNotificationDto) {
    return this.notificationService.sendSystem(
      dto.userIds,
      dto.title,
      dto.content,
      dto.link,
    );
  }
}
