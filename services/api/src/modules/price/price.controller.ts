import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PriceService } from './price.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { CompareQueryDto } from './dto/compare-query.dto';
import { TrendQueryDto } from './dto/trend-query.dto';
import { CreateAlertDto } from './dto/create-alert.dto';

@ApiTags('prices')
@Controller()
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  // ──────────────── Static public price routes ────────────────

  @Public()
  @Get('prices/calendar')
  @ApiOperation({
    summary: '价格日历 — 获取指定日期范围内每日价格',
    description:
      '返回某个套餐或路线在指定日期范围内的每日价格快照，用于日历热力图展示。\n\n' +
      'Returns daily price snapshots for a package or route within the given date range.',
  })
  @ApiQuery({ name: 'entityType', required: true, example: 'ROUTE', description: 'PACKAGE | ROUTE' })
  @ApiQuery({ name: 'entityId', required: true, example: 'clx1234', description: '实体ID' })
  @ApiQuery({ name: 'startDate', required: true, example: '2026-04-01', description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: true, example: '2026-04-30', description: 'YYYY-MM-DD' })
  @ApiResponse({
    status: 200,
    description: '日期→价格映射返回成功 / Calendar data returned.',
    schema: {
      type: 'object',
      properties: {
        entityType: { type: 'string' },
        entityId: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        calendar: {
          type: 'object',
          additionalProperties: {
            nullable: true,
            type: 'object',
            properties: {
              price: { type: 'number' },
              currency: { type: 'string' },
            },
          },
        },
        minPrice: { type: 'number', nullable: true },
        maxPrice: { type: 'number', nullable: true },
        avgPrice: { type: 'number', nullable: true },
        currency: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '参数格式错误 / Invalid query params.' })
  getCalendar(@Query() query: CalendarQueryDto) {
    return this.priceService.getCalendar(query);
  }

  @Public()
  @Get('prices/compare')
  @ApiOperation({
    summary: '比价面板 — 多实体价格对比',
    description:
      '对比多个套餐或路线的最新价格及近30天统计数据（最低/最高/均价）。\n\n' +
      'Compare latest price and 30-day stats (min/max/avg) for multiple packages or routes.',
  })
  @ApiQuery({ name: 'entityType', required: true, example: 'ROUTE', description: 'PACKAGE | ROUTE' })
  @ApiQuery({ name: 'entityIds', required: true, example: 'clx1,clx2,clx3', description: '逗号分隔，最多4个' })
  @ApiResponse({
    status: 200,
    description: '比价数据返回成功 / Comparison data returned.',
    schema: {
      type: 'object',
      properties: {
        entityType: { type: 'string' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              entityId: { type: 'string' },
              latestPrice: { type: 'number', nullable: true },
              latestDate: { type: 'string', nullable: true },
              currency: { type: 'string' },
              minPrice30d: { type: 'number', nullable: true },
              maxPrice30d: { type: 'number', nullable: true },
              avgPrice30d: { type: 'number', nullable: true },
              priceCount: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '参数格式错误 / Invalid query params.' })
  compare(@Query() query: CompareQueryDto) {
    return this.priceService.compare(query);
  }

  @Public()
  @Get('prices/trend')
  @ApiOperation({
    summary: '价格趋势 — 最近N天价格历史',
    description:
      '返回某个套餐或路线最近N天（默认30，最大90）的价格历史数据及统计摘要。\n\n' +
      'Returns price history for the last N days (default 30, max 90) with summary stats.',
  })
  @ApiQuery({ name: 'entityType', required: true, example: 'ROUTE', description: 'PACKAGE | ROUTE' })
  @ApiQuery({ name: 'entityId', required: true, example: 'clx1234', description: '实体ID' })
  @ApiQuery({ name: 'days', required: false, example: 30, description: '天数，默认30，最大90' })
  @ApiResponse({
    status: 200,
    description: '价格趋势返回成功 / Price trend returned.',
    schema: {
      type: 'object',
      properties: {
        entityType: { type: 'string' },
        entityId: { type: 'string' },
        days: { type: 'number' },
        trend: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              price: { type: 'number' },
            },
          },
        },
        stats: {
          type: 'object',
          properties: {
            minPrice: { type: 'number', nullable: true },
            maxPrice: { type: 'number', nullable: true },
            avgPrice: { type: 'number', nullable: true },
            currentPrice: { type: 'number', nullable: true },
            vsAvg: { type: 'number', nullable: true, description: '当前价格相对均价的百分比偏差' },
          },
        },
      },
    },
  })
  getTrend(@Query() query: TrendQueryDto) {
    return this.priceService.getTrend(query);
  }

  // ──────────────── 价格工具页 v3 · 控制台/洞察 (public) ────────────────

  @Public()
  @Get('prices/system-status')
  @ApiOperation({
    summary: '价格系统状态 — baseline 覆盖量/数据源混合/CRON 时刻表',
    description:
      '给 /prices 页面 PricePulseBar 使用,透明展示 PRC 自愈能力。\n\n' +
      'Live auto-heal status for the price tool page top bar.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        baselineCount: { type: 'number' },
        routeCount: { type: 'number' },
        dayCount: { type: 'number' },
        sourceBreakdown: {
          type: 'object',
          properties: {
            baseline: { type: 'number' },
            crawler: { type: 'number' },
            official: { type: 'number' },
          },
        },
        lastCronRun: { type: 'object' },
        cronSchedules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              cron: { type: 'string' },
              label: { type: 'string' },
            },
          },
        },
        asOf: { type: 'string' },
      },
    },
  })
  getSystemStatus() {
    return this.priceService.getSystemStatus();
  }

  @Public()
  @Get('prices/today-low')
  @ApiOperation({
    summary: '今日最低 Top N — 最新 snapshot 按价升序,带 24h 涨跌',
    description:
      '给 /prices 洞察区 PriceTodayLow 使用。\n\n' +
      'Top N lowest-priced routes today with 24h delta, for insight panel.',
  })
  @ApiQuery({ name: 'limit', required: false, example: 5, description: '默认 5,上限 20' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              routeId: { type: 'string' },
              slug: { type: 'string' },
              title: { type: 'string' },
              priceFen: { type: 'number' },
              currency: { type: 'string' },
              source: { type: 'string' },
              date: { type: 'string' },
              changePercent24h: { type: 'number' },
            },
          },
        },
        asOf: { type: 'string' },
      },
    },
  })
  getTodayLow(@Query('limit') limit?: string) {
    return this.priceService.getTodayLow(Number(limit) || 5);
  }

  @Public()
  @Get('prices/top-movers')
  @ApiOperation({
    summary: '涨跌榜 — 按绝对幅度降序,默认 24h 窗口',
    description:
      '给 /prices 洞察区 PriceTopMovers 使用。对比最近 N 天前 snapshot。\n\n' +
      'Top movers by absolute percent change, default 24h window.',
  })
  @ApiQuery({ name: 'limit', required: false, example: 5 })
  @ApiQuery({ name: 'window', required: false, example: '24h', description: '支持 24h/7d/30d' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              routeId: { type: 'string' },
              slug: { type: 'string' },
              title: { type: 'string' },
              currentPriceFen: { type: 'number' },
              previousPriceFen: { type: 'number' },
              changePercent: { type: 'number' },
              changeDirection: { type: 'string', enum: ['UP', 'DOWN', 'FLAT'] },
              source: { type: 'string' },
            },
          },
        },
        asOf: { type: 'string' },
      },
    },
  })
  getTopMovers(
    @Query('limit') limit?: string,
    @Query('window') windowParam?: string,
  ) {
    const days = windowParam === '7d' ? 7 : windowParam === '30d' ? 30 : 1;
    return this.priceService.getTopMovers(Number(limit) || 5, days);
  }

  // ──────────────── Price Alerts (auth required) ────────────────

  @Get('price-alerts/my')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '我的价格提醒列表',
    description:
      '获取当前用户所有活跃的价格提醒（isActive=true）。\n\n' +
      "Get current user's active price alerts.",
  })
  @ApiResponse({
    status: 200,
    description: '提醒列表返回成功 / Alert list returned.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          entityType: { type: 'string' },
          entityId: { type: 'string' },
          entityName: { type: 'string' },
          targetPrice: { type: 'number' },
          currentPrice: { type: 'number' },
          isTriggered: { type: 'boolean' },
          triggeredAt: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权 / Unauthorized.' })
  getMyAlerts(@CurrentUser('id') userId: string) {
    return this.priceService.getMyAlerts(userId);
  }

  @Post('price-alerts')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '创建价格提醒',
    description:
      '为指定套餐或路线设置目标价格提醒，当价格降至目标价格时触发通知。\n\n' +
      'Create a price alert for a package or route. Notification is sent when price drops to target.',
  })
  @ApiBody({ type: CreateAlertDto })
  @ApiResponse({ status: 201, description: '价格提醒创建成功 / Alert created.' })
  @ApiResponse({ status: 400, description: '参数校验失败 / Validation failed.' })
  @ApiResponse({ status: 401, description: '未授权 / Unauthorized.' })
  createAlert(
    @Body() dto: CreateAlertDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.priceService.createAlert(userId, dto);
  }

  @Delete('price-alerts/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '删除价格提醒',
    description:
      '软删除价格提醒（isActive=false）。仅提醒所有者可操作，防止 IDOR 攻击。\n\n' +
      'Soft-delete a price alert. Only the owner can delete. IDOR protected.',
  })
  @ApiParam({ name: 'id', description: '价格提醒ID / PriceAlert CUID', example: 'clx1234alert' })
  @ApiResponse({ status: 200, description: '提醒已删除 / Alert deleted.', schema: { type: 'object', properties: { message: { type: 'string' } } } })
  @ApiResponse({ status: 403, description: '无权操作 / Forbidden.' })
  @ApiResponse({ status: 404, description: '提醒不存在 / Alert not found.' })
  deleteAlert(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.priceService.deleteAlert(id, userId);
  }

  // ──────────────── Admin endpoints ────────────────

  @Get('prices/snapshots')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '[Admin] 价格快照列表' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  @ApiQuery({ name: 'entityType', required: false, example: 'ROUTE' })
  @ApiResponse({ status: 200, description: '快照列表' })
  listSnapshots(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.priceService.listSnapshots(
      Number(page) || 1,
      Math.min(Number(pageSize) || 20, 100),
      entityType,
    );
  }

  @Get('price-alerts/all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '[Admin] 全部价格提醒列表' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  @ApiResponse({ status: 200, description: '提醒列表' })
  listAlerts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.priceService.listAlerts(
      Number(page) || 1,
      Math.min(Number(pageSize) || 20, 100),
    );
  }

  @Delete('price-alerts/admin/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '[Admin] 删除任意价格提醒' })
  @ApiParam({ name: 'id', description: 'PriceAlert ID' })
  @ApiResponse({ status: 200, description: '已删除' })
  adminDeleteAlert(@Param('id') id: string) {
    return this.priceService.adminDeleteAlert(id);
  }
}
