import {
  Controller,
  Get,
  Post,
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
import type { OrderStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrderService } from './order.service';
import { OrderQueryDto, OrderAdminQueryDto } from '../../common/dto/order-query.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { PayOrderDto } from './dto/pay-order.dto';
import { RefundOrderDto } from './dto/refund-order.dto';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Create an order for a trip',
    description:
      '为指定行程创建订单，需提供行程ID和总金额（分）。用户ID从JWT令牌中获取。可选择支付方式和币种。\n\n' +
      'Create an order for a specified trip. Requires trip ID and total amount in cents. User ID is derived from JWT token. Optionally specify payment method and currency.',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Order created with status PENDING. / 订单创建成功，状态为待支付。',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'clx4ord0001ab12cd34ef56' },
        tripId: { type: 'string' },
        userId: { type: 'string' },
        totalAmount: { type: 'number', example: 1500000 },
        currency: { type: 'string', example: 'CNY' },
        status: { type: 'string', example: 'PENDING' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation failed or trip not eligible for ordering. / 校验失败或行程不符合下单条件。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  create(@Body() dto: CreateOrderDto, @CurrentUser('id') userId: string) {
    return this.orderService.create(dto, userId);
  }

  @Get()
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'List orders with filters and pagination',
    description:
      '获取订单列表，支持按用户ID、行程ID、状态筛选和分页。\n\n' +
      'Retrieve order list with optional filters by user ID, trip ID, status, and pagination.',
  })
  @ApiQuery({
    name: 'tripId',
    required: false,
    description: 'Filter by trip ID. / 按行程ID筛选',
    example: 'clx3trip0001ab12cd34ef56',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by order status. / 按订单状态筛选',
    enum: ['PENDING', 'PAID', 'CANCELLED', 'REFUNDING', 'REFUNDED'],
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated order list. / 分页订单列表。',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              tripId: { type: 'string' },
              status: { type: 'string' },
              totalAmount: { type: 'number' },
              currency: { type: 'string' },
              paidAt: { type: 'string', format: 'date-time', nullable: true },
            },
          },
        },
        total: { type: 'number', example: 15 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  findAll(
    @Query() query: OrderQueryDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.orderService.findAll({
      userId: currentUserId,
      tripId: query.tripId,
      status: query.status as OrderStatus,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Admin: list all orders',
    description:
      '管理员获取所有订单列表，不限用户，支持按状态和关键词筛选。\n\n' +
      'Admin endpoint to list all orders across all users with optional status and search filters.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by order status. / 按订单状态筛选',
    enum: ['PENDING', 'PAID', 'CANCELLED', 'REFUNDING', 'REFUNDED'],
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by order number, user name, or trip title. / 按订单号、用户名或行程标题搜索',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated order list (all users). / 全部用户的分页订单列表。',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only. / 仅限管理员。' })
  findAllAdmin(
    @Query() query: OrderAdminQueryDto,
  ) {
    return this.orderService.findAllAdmin({
      status: query.status as OrderStatus,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Admin: get any order detail',
    description:
      '管理员获取任意订单详情，无用户归属限制。\n\n' +
      'Admin endpoint to get any order detail without ownership restriction.',
  })
  @ApiParam({ name: 'id', description: 'Order ID (CUID). / 订单ID' })
  @ApiResponse({ status: 200, description: 'Order detail returned. / 订单详情返回成功。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only. / 仅限管理员。' })
  @ApiResponse({ status: 404, description: 'Order not found. / 订单不存在。' })
  findOneAdmin(@Param('id') id: string) {
    return this.orderService.findOneAdmin(id);
  }

  @Post('admin/:id/refund')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Admin: refund any paid order',
    description:
      '管理员为任意已支付订单发起退款，无用户归属限制。\n\n' +
      'Admin endpoint to request a refund for any paid order without ownership restriction.',
  })
  @ApiParam({ name: 'id', description: 'Order ID (CUID). / 订单ID' })
  @ApiResponse({ status: 201, description: 'Refund request submitted. / 退款申请已提交。' })
  @ApiResponse({ status: 400, description: 'Order not in PAID status. / 订单不在已支付状态。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only. / 仅限管理员。' })
  @ApiResponse({ status: 404, description: 'Order not found. / 订单不存在。' })
  refundAdmin(@Param('id') id: string, @Body() dto: RefundOrderDto) {
    return this.orderService.refundAdmin(id, dto.reason);
  }

  @Get(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get order detail by ID',
    description:
      '获取指定订单的详细信息，包含支付信息和关联行程。\n\n' +
      'Retrieve detailed order information including payment info and associated trip.',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID (CUID). / 订单ID',
    example: 'clx4ord0001ab12cd34ef56',
  })
  @ApiResponse({ status: 200, description: 'Order detail returned. / 订单详情返回成功。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 404, description: 'Order not found. / 订单不存在。' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.orderService.findOne(id, userId);
  }

  @Post(':id/pay')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Simulate payment (dev mode)',
    description:
      '模拟支付操作（开发环境用）。在生产环境中应通过支付网关回调完成。\n\n' +
      'Simulate a payment in development mode. In production, payments should be completed via payment gateway webhooks.',
  })
  @ApiParam({ name: 'id', description: 'Order ID (CUID). / 订单ID', example: 'clx4ord0001ab12cd34ef56' })
  @ApiBody({ type: PayOrderDto })
  @ApiResponse({ status: 201, description: 'Payment simulated — order status changed to PAID. / 模拟支付成功——订单状态变为已支付。' })
  @ApiResponse({ status: 400, description: 'Order not in PENDING status. / 订单不在待支付状态。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 404, description: 'Order not found. / 订单不存在。' })
  pay(@Param('id') id: string, @Body() dto: PayOrderDto, @CurrentUser('id') userId: string) {
    return this.orderService.pay(id, userId, dto);
  }

  @Post(':id/cancel')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Cancel a pending order',
    description:
      '取消待支付订单。仅 PENDING 状态的订单可以取消。\n\n' +
      'Cancel a pending order. Only orders with PENDING status can be cancelled.',
  })
  @ApiParam({ name: 'id', description: 'Order ID (CUID). / 订单ID', example: 'clx4ord0001ab12cd34ef56' })
  @ApiResponse({ status: 201, description: 'Order cancelled successfully. / 订单取消成功。' })
  @ApiResponse({ status: 400, description: 'Order not in PENDING status — cannot cancel. / 订单不在待支付状态——无法取消。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 404, description: 'Order not found. / 订单不存在。' })
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.orderService.cancel(id, userId);
  }

  @Post(':id/refund')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Request a refund for a paid order',
    description:
      '申请退款。仅 PAID 状态的订单可以申请退款。可提供退款原因。\n\n' +
      'Request a refund for a paid order. Only orders with PAID status are eligible. An optional reason may be provided.',
  })
  @ApiParam({ name: 'id', description: 'Order ID (CUID). / 订单ID', example: 'clx4ord0001ab12cd34ef56' })
  @ApiResponse({ status: 201, description: 'Refund request submitted — order status changed to REFUNDING. / 退款申请已提交——订单状态变为退款中。' })
  @ApiResponse({ status: 400, description: 'Order not in PAID status — cannot refund. / 订单不在已支付状态——无法退款。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 404, description: 'Order not found. / 订单不存在。' })
  refund(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: RefundOrderDto) {
    return this.orderService.refund(id, userId, dto.reason);
  }
}
