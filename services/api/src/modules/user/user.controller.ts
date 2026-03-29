import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserService } from './user.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List users (admin only) / 用户列表（仅管理员）' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by nickname or email' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Paginated user list' })
  listUsers(
    @Query() pagination: PaginationQueryDto,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.userService.listUsers({
      page: pagination.page ?? 1,
      limit: pagination.limit ?? 20,
      search,
      role,
      isActive: isActive === undefined ? undefined : isActive === 'true',
    });
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update user (admin only) / 更新用户（仅管理员）' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUser(
    @Param('id') id: string,
    @Body() data: AdminUpdateUserDto,
  ) {
    this.logger.log(`Admin updating user ${id}: ${JSON.stringify(data)}`);
    return this.userService.adminUpdateUser(id, data);
  }

  @Get('me/profile')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get my profile / 获取我的资料', description: 'Auto-creates UserProfile if not exists.' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyProfile(@CurrentUser('id') userId: string) {
    this.logger.log(`User ${userId} fetching own profile`);
    return this.userService.getMyProfile(userId);
  }

  @Patch('me/profile')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update my profile / 更新我的资料' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    this.logger.log(`User ${userId} updating profile`);
    return this.userService.updateMyProfile(userId, dto);
  }

  @Get('me/export')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Export all user data (GDPR)',
    description:
      'GDPR合规：导出当前用户的所有个人数据，包括个人资料、行程、订单、日志、评价、通知和帖子。\n\n' +
      'GDPR compliance: Export all personal data for the authenticated user, including profile, trips, orders, journals, reviews, notifications, and posts.',
  })
  @ApiResponse({
    status: 200,
    description:
      'All user data exported as JSON. / 用户数据已导出为JSON。',
    schema: {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nickname: { type: 'string' },
            email: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            role: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        trips: { type: 'array', items: { type: 'object' } },
        orders: { type: 'array', items: { type: 'object' } },
        journals: { type: 'array', items: { type: 'object' } },
        reviews: { type: 'array', items: { type: 'object' } },
        notifications: { type: 'array', items: { type: 'object' } },
        posts: { type: 'array', items: { type: 'object' } },
        exportedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — valid JWT required. / 未授权——需要有效的JWT。',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found. / 用户不存在。',
  })
  exportMyData(@CurrentUser('id') userId: string) {
    this.logger.log(`User ${userId} requested data export`);
    return this.userService.exportUserData(userId);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Delete user account (GDPR right to be forgotten)',
    description:
      'GDPR合规：软删除当前用户账号。\n\n' +
      '执行步骤：\n' +
      '1. 匿名化个人信息（昵称→"Deleted User"，邮箱→null，手机→null）\n' +
      '2. 清除所有OAuth关联（微信、Google）\n' +
      '3. 删除所有登录会话（立即登出）\n' +
      '4. 停用账号（isActive=false）\n\n' +
      '30天宽限期后，计划任务将硬删除所有关联数据（行程、订单、日志、评价、通知、帖子、上传文件、优惠券使用记录）。\n\n' +
      'GDPR compliance: Soft-delete the current user account.\n\n' +
      'Steps:\n' +
      '1. Anonymize PII (nickname→"Deleted User", email→null, phone→null)\n' +
      '2. Clear all OAuth associations (WeChat, Google)\n' +
      '3. Delete all sessions (immediate logout)\n' +
      '4. Deactivate account (isActive=false)\n\n' +
      'After a 30-day grace period, a scheduled job will hard-delete all related data ' +
      '(trips, trip status history, orders, payment transactions, journals, reviews, ' +
      'notifications, posts, uploads, coupon usages).',
  })
  @ApiResponse({
    status: 204,
    description:
      'Account soft-deleted successfully. Data will be permanently removed after 30 days. / 账号已软删除。数据将在30天后永久删除。',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — valid JWT required. / 未授权——需要有效的JWT。',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found. / 用户不存在。',
  })
  async deleteMyAccount(@CurrentUser('id') userId: string): Promise<void> {
    this.logger.warn(`User ${userId} requested account deletion`);
    await this.userService.softDeleteAccount(userId);
  }

  @Get(':userId/profile')
  @Public()
  @ApiOperation({ summary: 'Get public user profile / 获取用户公开资料' })
  @ApiParam({ name: 'userId', description: 'User ID / 用户ID' })
  @ApiResponse({ status: 200, description: 'Public profile returned' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getPublicProfile(@Param('userId') userId: string) {
    return this.userService.getPublicProfile(userId);
  }

  @Get(':userId/guides')
  @Public()
  @ApiOperation({ summary: "Get user's published guides / 获取用户发布的攻略" })
  @ApiParam({ name: 'userId', description: 'User ID / 用户ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (max 50)' })
  @ApiResponse({ status: 200, description: 'Paginated guide list' })
  getUserGuides(
    @Param('userId') userId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.userService.getUserGuides(
      userId,
      pagination.page ?? 1,
      pagination.limit ?? 20,
    );
  }
}
