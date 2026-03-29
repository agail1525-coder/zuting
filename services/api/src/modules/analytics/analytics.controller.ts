import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth('bearer')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Platform overview metrics (Admin only)',
    description:
      '获取平台核心指标概览：用户数、行程数、订单数、收入、评价数、攻略数、商家数、分享数。\n\n' +
      'Returns total counts for key platform metrics. Admin access only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Platform overview metrics. / 平台概览指标。',
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number', example: 1234 },
        totalTrips: { type: 'number', example: 567 },
        totalOrders: { type: 'number', example: 234 },
        totalRevenue: { type: 'number', example: 12345600, description: 'In cents (分)' },
        totalReviews: { type: 'number', example: 89 },
        totalGuides: { type: 'number', example: 45 },
        totalMerchants: { type: 'number', example: 12 },
        totalShares: { type: 'number', example: 678 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only. / 仅管理员可访问。' })
  getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('trends')
  @ApiOperation({
    summary: 'Daily trends for last N days (Admin only)',
    description:
      '获取最近N天（默认30天）的每日订单数、行程数、新增用户数趋势。\n\n' +
      'Returns daily counts of orders, trips, and new users for the last N days. Admin access only.',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to query (default 30, max 90)',
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'Daily trend data. / 每日趋势数据。',
    schema: {
      type: 'object',
      properties: {
        days: { type: 'number', example: 30 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', example: '2026-03-01' },
              orders: { type: 'number', example: 12 },
              trips: { type: 'number', example: 8 },
              users: { type: 'number', example: 15 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only. / 仅管理员可访问。' })
  getTrends(@Query('days') days?: string) {
    const numDays = Math.min(Math.max(parseInt(days || '30', 10) || 30, 1), 90);
    return this.analyticsService.getTrends(numDays);
  }

  @Get('funnel')
  @ApiOperation({
    summary: 'Conversion funnel (Admin only)',
    description:
      '获取用户转化漏斗：注册用户 → 有行程 → 有订单 → 已支付。\n\n' +
      'Returns conversion funnel: registered users → with trips → with orders → with paid orders. Admin access only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversion funnel data. / 转化漏斗数据。',
    schema: {
      type: 'object',
      properties: {
        levels: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: '注册用户' },
              nameEn: { type: 'string', example: 'Registered Users' },
              count: { type: 'number', example: 1234 },
              rate: { type: 'number', example: 1.0 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only. / 仅管理员可访问。' })
  getFunnel() {
    return this.analyticsService.getFunnel();
  }

  @Get('top-content')
  @ApiOperation({
    summary: 'Top content by views/shares/reviews (Admin only)',
    description:
      '获取热门内容排行：按浏览量、分享量或评价量排序的 Top N 实体。\n\n' +
      'Returns top N entities ranked by views, shares, or reviews. Admin access only.',
  })
  @ApiQuery({
    name: 'dimension',
    required: false,
    type: String,
    description: 'Ranking dimension: views / shares / reviews (default views)',
    example: 'views',
    enum: ['views', 'shares', 'reviews'],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of results (default 10, max 50)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Top content ranking. / 热门内容排行。',
    schema: {
      type: 'object',
      properties: {
        dimension: { type: 'string', example: 'views' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              rank: { type: 'number', example: 1 },
              entityType: { type: 'string', example: 'HOLY_SITE' },
              entityId: { type: 'string', example: 'clx5abc0001ab12cd34ef56' },
              count: { type: 'number', example: 1256 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only. / 仅管理员可访问。' })
  getTopContent(
    @Query('dimension') dimension?: string,
    @Query('limit') limit?: string,
  ) {
    const validDimensions = ['views', 'shares', 'reviews'];
    const dim = validDimensions.includes(dimension ?? '')
      ? (dimension as string)
      : 'views';
    const numLimit = Math.min(Math.max(parseInt(limit || '10', 10) || 10, 1), 50);
    return this.analyticsService.getTopContent(dim, numLimit);
  }
}
