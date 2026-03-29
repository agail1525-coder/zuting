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
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PointsMallService } from './points-mall.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ExchangeDto } from './dto/exchange.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@ApiTags('points-mall')
@Controller('points-mall')
export class PointsMallController {
  constructor(private readonly pointsMallService: PointsMallService) {}

  // ─── Static routes BEFORE :id ──────────────────────────────────────────────

  @Post('exchange')
  @ApiBearerAuth()
  @ApiOperation({ summary: '积分兑换商品 / Exchange product with points' })
  exchange(
    @CurrentUser('id') userId: string,
    @Body() dto: ExchangeDto,
  ) {
    return this.pointsMallService.exchange(userId, dto.productId);
  }

  @Get('my-exchanges')
  @ApiBearerAuth()
  @ApiOperation({ summary: '我的兑换记录 / My exchange history' })
  getMyExchanges(
    @CurrentUser('id') userId: string,
    @Query() pagination: ProductQueryDto,
  ) {
    return this.pointsMallService.getMyExchanges(
      userId,
      pagination.page,
      pagination.limit,
    );
  }

  // ─── Admin CRUD ───────────────────────────────────────────────────────────

  @Post('products')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] 创建积分商品 / Create product' })
  adminCreate(@Body() dto: CreateProductDto) {
    return this.pointsMallService.adminCreate(dto);
  }

  // ─── Public product listing ────────────────────────────────────────────────

  @Get('products')
  @Public()
  @ApiOperation({ summary: '积分商城商品列表 / List products (public)' })
  findProducts(@Query() query: ProductQueryDto) {
    return this.pointsMallService.findProducts(
      query.category,
      query.page,
      query.limit,
    );
  }

  @Get('products/:id')
  @Public()
  @ApiOperation({ summary: '积分商品详情 / Product detail (public)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  findProduct(@Param('id') id: string) {
    return this.pointsMallService.findProduct(id);
  }

  @Patch('products/:id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] 更新积分商品 / Update product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  adminUpdate(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.pointsMallService.adminUpdate(id, dto);
  }

  @Delete('products/:id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] 下架积分商品 / Deactivate product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  adminDeactivate(@Param('id') id: string) {
    return this.pointsMallService.adminDeactivate(id);
  }
}
