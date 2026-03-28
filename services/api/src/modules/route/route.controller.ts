import { Controller, Get, Post, Patch, Delete, Param, Query, Body, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('routes')
@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '路线列表', description: '获取路线列表，支持分类/难度/时长/分页/排序筛选' })
  @ApiQuery({ name: 'category', required: false, description: 'ZEN/BUDDHIST/TAOIST/CHRISTIAN/ISLAMIC/HINDU/JEWISH/CROSS_CULTURAL/CULTURAL_HERITAGE' })
  @ApiQuery({ name: 'difficulty', required: false, description: 'EASY/MODERATE/CHALLENGING' })
  @ApiQuery({ name: 'status', required: false, description: 'DRAFT/PUBLISHED/ARCHIVED (default: PUBLISHED)' })
  @ApiQuery({ name: 'religionId', required: false })
  @ApiQuery({ name: 'minDuration', required: false, type: Number })
  @ApiQuery({ name: 'maxDuration', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, description: 'createdAt/price/rating/duration' })
  @ApiResponse({ status: 200, description: '路线列表 { items, total, page, pageSize }' })
  findAll(
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: string,
    @Query('status') status?: string,
    @Query('religionId') religionId?: string,
    @Query('minDuration') minDuration?: string,
    @Query('maxDuration') maxDuration?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
  ) {
    return this.routeService.findAll({
      category,
      difficulty,
      status,
      religionId,
      minDuration: minDuration ? parseInt(minDuration) : undefined,
      maxDuration: maxDuration ? parseInt(maxDuration) : undefined,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      sort,
    });
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: '精选路线', description: '获取首页精选路线(按预订量+评分排序)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '返回数量(默认8，最大20)' })
  @ApiResponse({ status: 200, description: '精选路线数组' })
  findFeatured(@Query('limit') limit?: string) {
    return this.routeService.findFeatured(limit ? parseInt(limit) : 8);
  }

  @Get('by-site/:siteId')
  @Public()
  @ApiOperation({ summary: '按圣地查路线', description: '获取包含指定圣地的所有路线' })
  @ApiParam({ name: 'siteId', description: '圣地ID' })
  @ApiResponse({ status: 200, description: '包含该圣地的路线数组' })
  findBySite(@Param('siteId') siteId: string) {
    return this.routeService.findBySite(siteId);
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: '路线详情', description: '按slug获取路线详情(含逐日行程、关联圣地)' })
  @ApiParam({ name: 'slug', description: '路线slug', example: 'sixth-patriarch-huineng' })
  @ApiResponse({ status: 200, description: '路线详情' })
  @ApiResponse({ status: 404, description: '路线不存在' })
  findBySlug(@Param('slug') slug: string) {
    return this.routeService.findBySlug(slug);
  }

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '创建路线(Admin)', description: '创建新路线产品' })
  @ApiBody({ type: CreateRouteDto })
  @ApiResponse({ status: 201, description: '路线创建成功' })
  create(@Body() dto: CreateRouteDto) {
    return this.routeService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '更新路线(Admin)', description: '更新路线信息' })
  @ApiParam({ name: 'id', description: '路线ID' })
  @ApiBody({ type: UpdateRouteDto })
  @ApiResponse({ status: 200, description: '路线更新成功' })
  update(@Param('id') id: string, @Body() dto: UpdateRouteDto) {
    return this.routeService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '删除路线(Admin)', description: '删除路线' })
  @ApiParam({ name: 'id', description: '路线ID' })
  @ApiResponse({ status: 200, description: '路线删除成功' })
  remove(@Param('id') id: string) {
    return this.routeService.remove(id);
  }
}
