import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MerchantService } from './merchant.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

@ApiTags('merchants')
@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  // ── Static routes BEFORE :id ──────────────────────────────────────────────

  @Post('register')
  @ApiBearerAuth()
  @ApiOperation({ summary: '商家入驻注册 / Register as merchant' })
  register(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterMerchantDto,
  ) {
    return this.merchantService.register(userId, dto);
  }

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: '我的商家资料 / My merchant profile' })
  findMy(@CurrentUser('id') userId: string) {
    return this.merchantService.findMy(userId);
  }

  @Patch('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新商家资料 / Update my merchant profile' })
  updateMy(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateMerchantDto,
  ) {
    return this.merchantService.updateMy(userId, dto);
  }

  @Get('stats')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '商家统计 / Admin merchant stats' })
  getStats() {
    return this.merchantService.getStats();
  }

  // ── Dynamic :id routes ────────────────────────────────────────────────────

  @Get()
  @Public()
  @ApiOperation({ summary: '商家列表 / Public merchant list' })
  @ApiQuery({ name: 'type', required: false, enum: ['RESTAURANT', 'HOTEL', 'GUIDE', 'TRANSPORT', 'TEMPLE_SERVICE', 'SHOPPING', 'PHOTOGRAPHY', 'WELLNESS', 'CULTURAL_EXPERIENCE'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  findAll(
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.merchantService.findAll(
      type,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '商家详情 / Public merchant detail' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  findOne(@Param('id') id: string) {
    return this.merchantService.findOne(id);
  }

  @Post(':id/approve')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '审核通过 / Admin approve merchant' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  approve(@Param('id') id: string) {
    return this.merchantService.approve(id);
  }

  @Post(':id/suspend')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '暂停商家 / Admin suspend merchant' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  suspend(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.merchantService.suspend(id, reason);
  }

  @Post(':id/reject')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '拒绝商家 / Admin reject merchant' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  reject(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.merchantService.reject(id, reason);
  }
}
