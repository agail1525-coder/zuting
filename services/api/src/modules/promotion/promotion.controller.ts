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
import { PromotionService } from './promotion.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionQueryDto } from './dto/promotion-query.dto';
import { VerifyPromotionDto } from './dto/verify-promotion.dto';
import { ApplyPromotionDto } from './dto/apply-promotion.dto';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  // ── Static routes BEFORE :id ──────────────────────────────────────────────

  @Post('verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: '验证促销活动 / Verify promotion for an order' })
  verify(
    @CurrentUser('id') userId: string,
    @Body() dto: VerifyPromotionDto,
  ) {
    return this.promotionService.verify(dto.promotionId, userId, dto.orderAmount);
  }

  @Post('apply')
  @ApiBearerAuth()
  @ApiOperation({ summary: '使用促销活动 / Apply promotion to order' })
  apply(
    @CurrentUser('id') userId: string,
    @Body() dto: ApplyPromotionDto,
  ) {
    return this.promotionService.applyWithOrderLookup(
      dto.promotionId,
      userId,
      dto.orderId,
    );
  }

  // ── CRUD routes ───────────────────────────────────────────────────────────

  @Get()
  @Public()
  @ApiOperation({ summary: '活动列表 / List active promotions' })
  findActive(@Query() query: PromotionQueryDto) {
    return this.promotionService.findActive(query.type, query.page, query.limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '活动详情 / Promotion detail' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  findOne(@Param('id') id: string) {
    return this.promotionService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建促销活动 / Admin create promotion' })
  create(@Body() dto: CreatePromotionDto) {
    return this.promotionService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新促销活动 / Admin update promotion' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.promotionService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '停用促销活动 / Admin deactivate promotion' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  deactivate(@Param('id') id: string) {
    return this.promotionService.deactivate(id);
  }
}
