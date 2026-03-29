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
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CouponService } from './coupon.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { VerifyCouponDto } from './dto/verify-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@ApiTags('coupons')
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  // ─── Admin Routes ──────────────────────────────────────────────────────────

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建优惠券 / Admin create coupon' })
  create(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '优惠券列表 / Admin list all coupons' })
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.couponService.findAll(pagination.page, pagination.limit);
  }

  // ─── Static / Literal Routes (must precede :id) ───────────────────────────

  @Get('available')
  @Public()
  @ApiOperation({ summary: '可领取优惠券列表 / Public available coupons' })
  getAvailableCoupons(@Query() pagination: PaginationQueryDto) {
    return this.couponService.getAvailableCoupons(pagination.page, pagination.limit);
  }

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: '我的可用优惠券 / My available coupons (CouponUsage)' })
  getUserCoupons(
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.couponService.getUserCoupons(userId, pagination.page, pagination.limit);
  }

  @Get('my/claimed')
  @ApiBearerAuth()
  @ApiOperation({ summary: '我领取的优惠券 / My claimed coupons' })
  getMyClaimed(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query() pagination?: PaginationQueryDto,
  ) {
    return this.couponService.getMyClaimed(
      userId,
      status,
      pagination?.page,
      pagination?.limit,
    );
  }

  @Post('verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: '验证优惠券 / Verify coupon code' })
  verify(
    @CurrentUser('id') userId: string,
    @Body() dto: VerifyCouponDto,
  ) {
    return this.couponService.verify(dto.code, userId, dto.orderAmount);
  }

  @Post('apply')
  @ApiBearerAuth()
  @ApiOperation({ summary: '使用优惠券 / Apply coupon to order' })
  apply(
    @CurrentUser('id') userId: string,
    @Body() dto: ApplyCouponDto,
  ) {
    return this.couponService.applyWithOrderLookup(dto.code, userId, dto.orderId);
  }

  // ─── Parameterised Routes ─────────────────────────────────────────────────

  @Post(':id/claim')
  @ApiBearerAuth()
  @ApiOperation({ summary: '领取优惠券 / Claim a coupon' })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  claim(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.couponService.claim(id, userId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新优惠券 / Admin update coupon' })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '停用优惠券 / Admin deactivate coupon' })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  deactivate(@Param('id') id: string) {
    return this.couponService.deactivate(id);
  }
}
