import { Controller, Get, Post, Patch, Delete, Param, Query, Body, NotFoundException, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { HolySiteService } from './holy-site.service';
import { CreateHolySiteDto } from './dto/create-holy-site.dto';
import { UpdateHolySiteDto } from './dto/update-holy-site.dto';
import { BulkCreateEnrichedHolySitesDto } from './dto/create-enriched-holy-site.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReligionFilterQueryDto } from '../../common/dto/religion-filter-query.dto';

@ApiTags('holy-sites')
@Controller('holy-sites')
export class HolySiteController {
  constructor(private readonly holySiteService: HolySiteService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all holy sites',
    description:
      '获取所有圣地列表，可按宗教ID筛选。每个圣地包含GPS坐标、UTC偏移和描述。\n\n' +
      'Retrieve all holy sites. Optionally filter by religion ID. Each site includes GPS coordinates, UTC offset, and description.',
  })
  @ApiQuery({
    name: 'religionId',
    required: false,
    description: 'Filter by religion ID. / 按宗教ID筛选',
    example: 'clx1abc2d0000ab12cd34ef56',
  })
  @ApiResponse({
    status: 200,
    description: 'List of holy sites returned successfully. / 圣地列表返回成功。',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clx2xyz9f0001ab12cd34ef56' },
          name: { type: 'string', example: '菩提伽耶' },
          nameEn: { type: 'string', example: 'Bodh Gaya' },
          country: { type: 'string', example: 'India' },
          latitude: { type: 'number', example: 24.6961 },
          longitude: { type: 'number', example: 84.9911 },
          utcOffset: { type: 'number', example: 5.5 },
          description: { type: 'string' },
          imageUrl: { type: 'string', nullable: true },
          religionId: { type: 'string' },
        },
      },
    },
  })
  findAll(
    @Query() query: ReligionFilterQueryDto,
  ) {
    return this.holySiteService.findAll(query.religionId, query.page, query.limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get holy site detail by ID',
    description:
      '获取指定圣地的详细信息，包含关联的宗教信息。\n\n' +
      'Retrieve detailed information for a specific holy site, including its associated religion.',
  })
  @ApiParam({
    name: 'id',
    description: 'Holy site ID (CUID). / 圣地ID',
    example: 'clx2xyz9f0001ab12cd34ef56',
  })
  @ApiResponse({ status: 200, description: 'Holy site detail returned successfully. / 圣地详情返回成功。' })
  @ApiResponse({ status: 404, description: 'Holy site not found. / 圣地不存在。' })
  async findById(@Param('id') id: string) {
    const site = await this.holySiteService.findById(id);
    if (!site) throw new NotFoundException();
    return site;
  }

  @Post('from-enriched')
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Bulk create holy sites from AI-enriched data (used by trip planner)',
    description:
      'Phase 1: AI 知识库为用户在备注中提到的祖庭补全了结构化数据,前端在创建行程前调用此端点把它们落库。\n\n' +
      '幂等: 同名+同国家+source=AI_KNOWLEDGE 的记录会被复用。\n' +
      '返回: { extId → realId } 映射,前端用于回填 plan.siteIds。',
  })
  @ApiBody({ type: BulkCreateEnrichedHolySitesDto })
  @ApiResponse({ status: 200, description: 'extId → realId 映射' })
  bulkCreateEnriched(@Body() dto: BulkCreateEnrichedHolySitesDto) {
    return this.holySiteService.bulkCreateEnriched(dto);
  }

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Create a new holy site (admin)',
    description:
      '创建新圣地记录，需提供GPS坐标和关联宗教ID。仅管理员可操作。\n\n' +
      'Create a new holy site record with GPS coordinates and associated religion ID. Admin role required.',
  })
  @ApiBody({ type: CreateHolySiteDto })
  @ApiResponse({ status: 201, description: 'Holy site created successfully. / 圣地创建成功。' })
  @ApiResponse({ status: 400, description: 'Validation failed. / 数据校验失败。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required. / 权限不足。' })
  create(@Body() dto: CreateHolySiteDto) {
    return this.holySiteService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Update a holy site (admin)',
    description:
      '更新圣地记录的部分字段。仅管理员可操作。\n\n' +
      'Partially update a holy site record. Admin role required.',
  })
  @ApiParam({ name: 'id', description: 'Holy site ID (CUID). / 圣地ID', example: 'clx2xyz9f0001ab12cd34ef56' })
  @ApiBody({ type: UpdateHolySiteDto })
  @ApiResponse({ status: 200, description: 'Holy site updated successfully. / 圣地更新成功。' })
  @ApiResponse({ status: 400, description: 'Validation failed. / 数据校验失败。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required. / 权限不足。' })
  @ApiResponse({ status: 404, description: 'Holy site not found. / 圣地不存在。' })
  update(@Param('id') id: string, @Body() dto: UpdateHolySiteDto) {
    return this.holySiteService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Delete a holy site (admin)',
    description:
      '删除圣地记录。仅管理员可操作。\n\n' +
      'Delete a holy site record. Admin role required.',
  })
  @ApiParam({ name: 'id', description: 'Holy site ID (CUID). / 圣地ID', example: 'clx2xyz9f0001ab12cd34ef56' })
  @ApiResponse({ status: 200, description: 'Holy site deleted successfully. / 圣地删除成功。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required. / 权限不足。' })
  @ApiResponse({ status: 404, description: 'Holy site not found. / 圣地不存在。' })
  remove(@Param('id') id: string) {
    return this.holySiteService.remove(id);
  }
}
