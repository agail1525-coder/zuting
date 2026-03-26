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
    // orderAmount will be fetched from the order in a real scenario
    // For now we pass 0 and let the service handle it
    return this.couponService.applyWithOrderLookup(dto.code, userId, dto.orderId);
  }

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: '我的可用优惠券 / My available coupons' })
  getUserCoupons(@CurrentUser('id') userId: string) {
    return this.couponService.getUserCoupons(userId);
  }
}
