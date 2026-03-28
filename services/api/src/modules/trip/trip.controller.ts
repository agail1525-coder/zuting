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
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { TripStatus } from '@prisma/client';
import { TripService } from './trip.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TransitionTripDto } from './dto/transition-trip.dto';
import { AddTripSiteDto } from './dto/add-trip-site.dto';

const TRIP_STATUS_ENUM = [
  'DRAFT', 'PLANNING', 'SUBMITTED', 'CONFIRMED', 'PAID',
  'PREPARING', 'IN_PROGRESS', 'COMPLETED', 'REVIEWING',
  'CANCELLED', 'REFUNDING', 'REFUNDED',
];

@ApiTags('trips')
@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Create a new trip',
    description:
      '创建新的朝圣行程，初始状态为 DRAFT。需要指定用户ID、标题，可选出发/结束日期和预算。\n\n' +
      'Create a new pilgrimage trip with initial status DRAFT. Requires user ID and title; optionally include dates, budget, and group size.',
  })
  @ApiBody({ type: CreateTripDto })
  @ApiResponse({
    status: 201,
    description: 'Trip created successfully with status DRAFT. / 行程创建成功，状态为草稿。',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'clx3trip0001ab12cd34ef56' },
        title: { type: 'string', example: '佛教四大圣地朝圣之旅' },
        status: { type: 'string', example: 'DRAFT' },
        userId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation failed. / 数据校验失败。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  create(@Body() dto: CreateTripDto, @CurrentUser('id') userId: string) {
    return this.tripService.create(userId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List trips with filters and pagination',
    description:
      '获取行程列表，支持按用户ID、状态筛选和分页。默认每页20条。\n\n' +
      'Retrieve trip list with optional filters by user ID, status, and pagination. Default page size is 20.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID. / 按用户ID筛选',
    example: 'clx1abc2d0000ab12cd34ef56',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by trip status. / 按行程状态筛选',
    enum: TRIP_STATUS_ENUM,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated trip list. / 分页行程列表。',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              status: { type: 'string' },
              startDate: { type: 'string', format: 'date', nullable: true },
              endDate: { type: 'string', format: 'date', nullable: true },
              persons: { type: 'number', nullable: true },
              totalBudget: { type: 'number', nullable: true },
            },
          },
        },
        total: { type: 'number', example: 42 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
      },
    },
  })
  findAll(
    @Query() pagination: PaginationQueryDto,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.tripService.findAll({
      currentUserId,
      userId,
      status: status as TripStatus,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Public()
  @Get('status-meta')
  @ApiOperation({
    summary: 'Get all trip status metadata',
    description:
      '获取所有12个行程状态的元数据，包含标签、颜色和允许的状态转换。\n\n' +
      'Retrieve metadata for all 12 trip statuses, including labels, colors, and allowed transitions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Status metadata map. / 状态元数据映射。',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          label: { type: 'string', example: 'Draft' },
          labelCn: { type: 'string', example: '草稿' },
          color: { type: 'string', example: '#6B7280' },
          transitions: {
            type: 'array',
            items: { type: 'string' },
            example: ['start_planning', 'user_cancel'],
          },
        },
      },
    },
  })
  getStatusMeta() {
    return this.tripService.getStatusMeta();
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get trip detail by ID',
    description:
      '获取行程详情，包含关联的圣地列表、状态历史等完整信息。\n\n' +
      'Retrieve full trip details including associated sites, status history, and contact information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trip ID (CUID). / 行程ID',
    example: 'clx3trip0001ab12cd34ef56',
  })
  @ApiResponse({ status: 200, description: 'Trip detail returned successfully. / 行程详情返回成功。' })
  @ApiResponse({ status: 404, description: 'Trip not found. / 行程不存在。' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId?: string) {
    return this.tripService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Update trip details (DRAFT/PLANNING only)',
    description:
      '更新行程信息，仅在 DRAFT 或 PLANNING 状态下可修改。其他状态下修改将被拒绝。\n\n' +
      'Update trip information. Only allowed when trip status is DRAFT or PLANNING. Updates in other states will be rejected.',
  })
  @ApiParam({ name: 'id', description: 'Trip ID (CUID). / 行程ID', example: 'clx3trip0001ab12cd34ef56' })
  @ApiBody({ type: UpdateTripDto })
  @ApiResponse({ status: 200, description: 'Trip updated successfully. / 行程更新成功。' })
  @ApiResponse({ status: 400, description: 'Cannot update trip in current status. / 当前状态下无法更新行程。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 404, description: 'Trip not found. / 行程不存在。' })
  update(@Param('id') id: string, @Body() dto: UpdateTripDto, @CurrentUser('id') userId: string) {
    return this.tripService.update(id, userId, dto);
  }

  @Post(':id/transition')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Trigger a trip state transition',
    description:
      '触发行程状态转换。行程遵循12状态机:\n' +
      'DRAFT → PLANNING → SUBMITTED → CONFIRMED → PAID → PREPARING → IN_PROGRESS → COMPLETED → REVIEWING\n' +
      '支持: CANCELLED, REFUNDING, REFUNDED\n\n' +
      'Trigger a state transition for the trip. The trip follows a 12-state machine:\n' +
      'DRAFT → PLANNING → SUBMITTED → CONFIRMED → PAID → PREPARING → IN_PROGRESS → COMPLETED → REVIEWING\n' +
      'Also supports: CANCELLED, REFUNDING, REFUNDED',
  })
  @ApiParam({ name: 'id', description: 'Trip ID (CUID). / 行程ID', example: 'clx3trip0001ab12cd34ef56' })
  @ApiBody({ type: TransitionTripDto })
  @ApiResponse({ status: 201, description: 'State transition successful. / 状态转换成功。' })
  @ApiResponse({ status: 400, description: 'Invalid transition — action not allowed from current state. / 无效转换——当前状态不允许该操作。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 404, description: 'Trip not found. / 行程不存在。' })
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionTripDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.tripService.transition(id, userId, userRole, dto.action, userId, dto.reason);
  }

  @Post(':id/sites')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Add a holy site to the trip itinerary',
    description:
      '向行程中添加一个圣地，需指定访问顺序。可选计划访问日期和备注。\n\n' +
      'Add a holy site to the trip itinerary with a specified visit order. Optionally include planned visit date and notes.',
  })
  @ApiParam({ name: 'id', description: 'Trip ID (CUID). / 行程ID', example: 'clx3trip0001ab12cd34ef56' })
  @ApiBody({ type: AddTripSiteDto })
  @ApiResponse({ status: 201, description: 'Site added to trip successfully. / 圣地已成功添加到行程。' })
  @ApiResponse({ status: 400, description: 'Validation failed or site already in trip. / 校验失败或圣地已在行程中。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 404, description: 'Trip or holy site not found. / 行程或圣地不存在。' })
  addSite(@Param('id') id: string, @Body() dto: AddTripSiteDto, @CurrentUser('id') userId: string) {
    return this.tripService.addSite(id, userId, dto);
  }

  @Delete(':id/sites/:siteId')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Remove a holy site from the trip itinerary',
    description:
      '从行程中移除一个圣地。需要提供 TripSite 记录的ID（非圣地本身的ID）。\n\n' +
      'Remove a holy site from the trip itinerary. Requires the TripSite record ID (not the holy site ID itself).',
  })
  @ApiParam({ name: 'id', description: 'Trip ID (CUID). / 行程ID', example: 'clx3trip0001ab12cd34ef56' })
  @ApiParam({ name: 'siteId', description: 'TripSite record ID (CUID). / 行程圣地关联记录ID', example: 'clx4ts0001ab12cd34ef56' })
  @ApiResponse({ status: 200, description: 'Site removed from trip successfully. / 圣地已从行程中移除。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 404, description: 'Trip or trip-site record not found. / 行程或行程圣地记录不存在。' })
  removeSite(@Param('id') id: string, @Param('siteId') siteId: string, @CurrentUser('id') userId: string) {
    return this.tripService.removeSite(id, userId, siteId);
  }
}
