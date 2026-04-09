import {
  Controller,
  Get,
  Post,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MembershipService } from './membership.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CheckinCalendarDto } from './dto/checkin-calendar.dto';

@ApiTags('membership')
@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  // ──────────────── Static / public routes FIRST ────────────────

  @Public()
  @Get('levels')
  @ApiOperation({
    summary: '获取会员等级列表',
    description: '返回全部5个会员等级的配置信息，包括升级所需积分和等级权益。无需登录。',
  })
  @ApiResponse({
    status: 200,
    description: '返回会员等级列表',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          level: { type: 'number', example: 1 },
          name: { type: 'string', example: '文化新手' },
          minPoints: { type: 'number', example: 0 },
          nextLevelPoints: { type: 'number', nullable: true, example: 1000 },
          benefits: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  })
  getLevels() {
    return this.membershipService.getLevels();
  }

  // ──────────────── Auth-required routes ────────────────

  @Get('me')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '获取我的会员信息',
    description: '返回当前登录用户的会员信息（等级、积分等）。首次访问自动创建会员记录。',
  })
  @ApiResponse({
    status: 200,
    description: '返回会员信息',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        level: { type: 'number', example: 1 },
        levelName: { type: 'string', example: '文化新手' },
        totalPoints: { type: 'number', example: 150 },
        availablePoints: { type: 'number', example: 100 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  getMe(@CurrentUser('id') userId: string) {
    return this.membershipService.getOrCreate(userId);
  }

  @Get('points')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '获取积分明细',
    description: '返回当前用户的积分流水记录，按时间倒序，支持分页。',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: '积分明细列表',
    schema: {
      type: 'object',
      properties: {
        items: { type: 'array', items: { type: 'object' } },
        total: { type: 'number' },
        page: { type: 'number' },
        pageSize: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  getPointsHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.membershipService.getPointsHistory(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('checkin')
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '每日签到',
    description:
      '执行每日签到，获得5积分。连续签到7天额外获得50积分奖励。每日只能签到一次（幂等保护）。',
  })
  @ApiResponse({
    status: 200,
    description: '签到成功',
    schema: {
      type: 'object',
      properties: {
        date: { type: 'string', example: '2026-03-29' },
        streak: { type: 'number', example: 3 },
        pointsEarned: { type: 'number', example: 5 },
        bonusPoints: { type: 'number', example: 0 },
        totalEarned: { type: 'number', example: 5 },
        membership: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 409, description: '今日已签到' })
  checkin(@CurrentUser('id') userId: string) {
    return this.membershipService.checkin(userId);
  }

  @Get('checkin-calendar')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '获取签到日历',
    description: '返回指定年月的签到记录，列出已签到的日期（YYYY-MM-DD）。',
  })
  @ApiQuery({ name: 'year', required: true, type: Number, example: 2026 })
  @ApiQuery({ name: 'month', required: true, type: Number, example: 3 })
  @ApiResponse({
    status: 200,
    description: '签到日历',
    schema: {
      type: 'object',
      properties: {
        year: { type: 'number' },
        month: { type: 'number' },
        checkedDates: {
          type: 'array',
          items: { type: 'string' },
          example: ['2026-03-01', '2026-03-02', '2026-03-05'],
        },
        totalDays: { type: 'number', example: 12 },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  getCheckinCalendar(
    @CurrentUser('id') userId: string,
    @Query() query: CheckinCalendarDto,
  ) {
    return this.membershipService.getCheckinCalendar(
      userId,
      query.year,
      query.month,
    );
  }
}
