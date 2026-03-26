import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ──────────────────── Create Payment ────────────────────

  @Post('create')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Create a payment for an order',
    description:
      '为订单创建支付请求，支持微信支付、支付宝、Stripe等网关。返回网关特定的支付参数（如微信的 prepay_id，Stripe的 client_secret）。\n\n' +
      'Create a payment request for an order. Supports WeChat Pay, Alipay, and Stripe gateways. Returns gateway-specific payment parameters.',
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully. Returns gateway-specific parameters. / 支付创建成功，返回网关特定参数。',
    schema: {
      type: 'object',
      properties: {
        transaction: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            orderId: { type: 'string' },
            gateway: { type: 'string' },
            amount: { type: 'number' },
            status: { type: 'string' },
          },
        },
        paymentParams: {
          type: 'object',
          description: 'Gateway-specific parameters. Contains mock:true if in dev mode.',
          properties: {
            gateway: { type: 'string', example: 'wechat' },
            mock: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request — invalid order or unsupported gateway. / 请求无效。' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required. / 未授权。' })
  @ApiResponse({ status: 404, description: 'Order not found. / 订单不存在。' })
  @ApiResponse({ status: 502, description: 'Payment gateway error. / 支付网关错误。' })
  @ApiResponse({ status: 504, description: 'Payment gateway timeout. / 支付网关超时。' })
  create(@Body() dto: CreatePaymentDto, @CurrentUser('id') userId: string) {
    return this.paymentService.createPayment(dto.orderId, dto.gateway, userId);
  }

  // ──────────────────── WeChat Pay Webhook ────────────────────

  @Public()
  @Post('webhook/wechat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'WeChat Pay webhook callback',
    description:
      '微信支付V3异步通知回调接口（公开端点）。验证签名后解密AEAD资源并处理支付结果。\n\n' +
      'WeChat Pay V3 async notification callback (public). Verifies signature, decrypts AEAD resource, and processes payment result.',
  })
  @ApiHeader({ name: 'Wechatpay-Timestamp', description: 'WeChat callback timestamp', required: false })
  @ApiHeader({ name: 'Wechatpay-Nonce', description: 'WeChat callback nonce', required: false })
  @ApiHeader({ name: 'Wechatpay-Signature', description: 'WeChat callback signature', required: false })
  @ApiHeader({ name: 'Wechatpay-Serial', description: 'WeChat platform cert serial number', required: false })
  @ApiResponse({ status: 200, description: 'Webhook processed. / 回调处理成功。' })
  @ApiResponse({ status: 400, description: 'Invalid signature or payload. / 签名或数据无效。' })
  handleWechatWebhook(
    @Body() body: any,
    @Headers('wechatpay-timestamp') timestamp?: string,
    @Headers('wechatpay-nonce') nonce?: string,
    @Headers('wechatpay-signature') signature?: string,
    @Headers('wechatpay-serial') serial?: string,
  ) {
    const headers: Record<string, string> = {};
    if (timestamp) headers['wechatpay-timestamp'] = timestamp;
    if (nonce) headers['wechatpay-nonce'] = nonce;
    if (signature) headers['wechatpay-signature'] = signature;
    if (serial) headers['wechatpay-serial'] = serial;

    return this.paymentService.handleWechatCallback(body, headers);
  }

  // ──────────────────── Alipay Webhook ────────────────────

  @Public()
  @Post('webhook/alipay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Alipay webhook callback',
    description:
      '支付宝异步通知回调接口（公开端点）。验证RSA2签名后处理支付结果。成功返回"success"字符串。\n\n' +
      'Alipay async notification callback (public). Verifies RSA2 signature and processes payment result.',
  })
  @ApiResponse({ status: 200, description: 'Webhook processed. Returns "success". / 回调处理成功。' })
  @ApiResponse({ status: 400, description: 'Invalid signature or payload. / 签名或数据无效。' })
  async handleAlipayWebhook(@Body() body: any) {
    const result = await this.paymentService.handleAlipayCallback(body);
    // Alipay requires the response body to be exactly "success"
    if (result.success) return 'success';
    return 'fail';
  }

  // ──────────────────── Stripe Webhook ────────────────────

  @Public()
  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stripe webhook callback',
    description:
      'Stripe异步通知回调接口（公开端点）。验证stripe-signature请求头HMAC-SHA256签名。\n\n' +
      'Stripe async notification callback (public). Validates stripe-signature header using HMAC-SHA256.',
  })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature (t=...,v1=...). / Stripe签名',
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Webhook processed. / 回调处理成功。' })
  @ApiResponse({ status: 400, description: 'Invalid signature or payload. / 签名或数据无效。' })
  handleStripeWebhook(
    @Body() body: any,
    @Headers('stripe-signature') signature?: string,
  ) {
    const headers: Record<string, string> = {};
    if (signature) headers['stripe-signature'] = signature;

    return this.paymentService.handleStripeCallback(body, headers);
  }

  // ──────────────────── Payment Status ────────────────────

  @Get('status/:orderId')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get payment status for an order',
    description:
      '查询订单的支付状态及所有交易记录。\n\n' +
      'Query payment status and all transactions for an order.',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order ID (CUID). / 订单ID',
    example: 'clx4ord0001ab12cd34ef56',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment status returned. / 支付状态返回成功。',
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string' },
        orderNo: { type: 'string' },
        orderStatus: { type: 'string' },
        totalAmount: { type: 'number' },
        paidAmount: { type: 'number', nullable: true },
        transactions: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 404, description: 'Order not found. / 订单不存在。' })
  getPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentStatus(orderId);
  }

  // ──────────────────── Query Gateway Directly ────────────────────

  @Get('query/:transactionId')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Query payment status from gateway (with retry)',
    description:
      '直接从支付网关查询交易状态，支持自动重试。用于对账和回调延迟时的主动查询。\n\n' +
      'Query payment status directly from the gateway with automatic retry. Used for reconciliation when callbacks are delayed.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Payment transaction ID (CUID). / 支付交易ID',
    example: 'clx5txn0001ab12cd34ef56',
  })
  @ApiResponse({
    status: 200,
    description: 'Gateway status returned. / 网关状态返回成功。',
    schema: {
      type: 'object',
      properties: {
        transactionId: { type: 'string' },
        gateway: { type: 'string' },
        localStatus: { type: 'string' },
        gatewayStatus: { type: 'string', enum: ['PENDING', 'SUCCESS', 'FAILED', 'CLOSED', 'REFUNDED'] },
        gatewayTransactionId: { type: 'string' },
        amount: { type: 'number' },
        mock: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 404, description: 'Transaction not found. / 交易不存在。' })
  @ApiResponse({ status: 502, description: 'Gateway error. / 网关错误。' })
  @ApiResponse({ status: 504, description: 'Gateway timeout. / 网关超时。' })
  queryFromGateway(@Param('transactionId') transactionId: string) {
    return this.paymentService.queryPaymentFromGateway(transactionId);
  }

  // ──────────────────── Gateway Health ────────────────────

  @Get('gateways')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get payment gateway status',
    description:
      '获取各支付网关的运行状态（生产模式/Mock模式）。\n\n' +
      'Get the runtime status of each payment gateway (production vs mock mode).',
  })
  @ApiResponse({
    status: 200,
    description: 'Gateway status list. / 网关状态列表。',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'stripe' },
          mockMode: { type: 'boolean', example: true },
        },
      },
    },
  })
  getGatewayStatus() {
    return this.paymentService.getGatewayStatus();
  }
}
