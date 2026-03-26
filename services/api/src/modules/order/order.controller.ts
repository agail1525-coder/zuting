import {
  Controller,
  Get,
  Post,
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
import type { OrderStatus } from '@prisma/client';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PayOrderDto } from './dto/pay-order.dto';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Create an order for a trip',
    description:
      '为指定行程创建订单，需提供行程ID、用户ID和总金额（分）。可选择支付方式和币种。\n\n' +
      'Create an order for a specified trip. Requires trip ID, user ID, and total amount in cents. Optionally specify payment method and currency.',
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
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
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
    name: 'userId',
    required: false,
    description: 'Filter by user ID. / 按用户ID筛选',
    example: 'clx1abc2d0000ab12cd34ef56',
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
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based). Default: 1. / 页码，默认1',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page. Default: 20. / 每页数量，默认20',
    example: 20,
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
    @Query('userId') userId?: string,
    @Query('tripId') tripId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.orderService.findAll({
      userId,
      tripId,
      status: status as OrderStatus,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
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
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
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
  pay(@Param('id') id: string, @Body() dto: PayOrderDto) {
    return this.orderService.pay(id, dto);
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
  cancel(@Param('id') id: string) {
    return this.orderService.cancel(id);
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
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Reason for refund request. / 退款原因',
          example: '行程变更，无法出行 / Trip changed, unable to travel',
        },
      },
    },
    required: false,
  })
  @ApiResponse({ status: 201, description: 'Refund request submitted — order status changed to REFUNDING. / 退款申请已提交——订单状态变为退款中。' })
  @ApiResponse({ status: 400, description: 'Order not in PAID status — cannot refund. / 订单不在已支付状态——无法退款。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 404, description: 'Order not found. / 订单不存在。' })
  refund(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.orderService.refund(id, reason);
  }
}
