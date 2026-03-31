import { Controller, Get, Post, Patch, Param, Query, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('bookings')
@Controller('bookings')
@ApiBearerAuth('bearer')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: '创建预订', description: '用户预订路线产品' })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({ status: 201, description: '预订创建成功' })
  create(@Body() dto: CreateBookingDto, @Req() req: { user: { id: string } }) {
    return this.bookingService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: '我的预订', description: '获取当前用户的预订列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: '预订列表 { items, total, page, pageSize }' })
  findMine(
    @Req() req: { user: { id: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.bookingService.findByUser(
      req.user.id,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
    );
  }

  @Get('admin')
  @Roles('ADMIN')
  @ApiOperation({ summary: '所有预订(Admin)', description: '管理员查看所有预订' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, description: 'PENDING/CONFIRMED/PAID/CANCELLED/COMPLETED' })
  @ApiResponse({ status: 200, description: '预订列表' })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ) {
    return this.bookingService.findAll(
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
      status,
    );
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @ApiOperation({ summary: '更新预订状态(Admin)', description: '管理员更新预订状态' })
  @ApiParam({ name: 'id', description: '预订ID' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PAID', 'CANCELLED', 'COMPLETED'] } }, required: ['status'] } })
  @ApiResponse({ status: 200, description: '预订状态已更新' })
  @ApiResponse({ status: 400, description: '状态转换不合法' })
  @ApiResponse({ status: 404, description: '预订不存在' })
  adminUpdateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.bookingService.adminUpdateStatus(id, status);
  }

  @Get(':id')
  @ApiOperation({ summary: '预订详情', description: '获取预订详情' })
  @ApiParam({ name: 'id', description: '预订ID' })
  @ApiResponse({ status: 200, description: '预订详情' })
  @ApiResponse({ status: 404, description: '预订不存在' })
  findById(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.bookingService.findById(id, req.user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消预订', description: '取消预订(仅PENDING/CONFIRMED状态可取消)' })
  @ApiParam({ name: 'id', description: '预订ID' })
  @ApiResponse({ status: 200, description: '预订已取消' })
  cancel(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.bookingService.cancel(id, req.user.id);
  }
}
