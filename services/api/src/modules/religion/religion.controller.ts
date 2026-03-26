import { Controller, Get, Post, Patch, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ReligionService } from './religion.service';
import { CreateReligionDto } from './dto/create-religion.dto';
import { UpdateReligionDto } from './dto/update-religion.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('religions')
@Controller('religions')
export class ReligionController {
  constructor(private readonly religionService: ReligionService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all religions',
    description:
      '获取平台支持的全部12大世界宗教列表，包含多语言名称、符号和主题色。\n\n' +
      'Retrieve the complete list of 12 world religions supported by the platform, ' +
      'including multilingual names, symbols, and theme colors.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all religions returned successfully. / 所有宗教列表返回成功。',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clx1abc2d0000ab12cd34ef56' },
          name: { type: 'string', example: '佛教' },
          nameEn: { type: 'string', example: 'Buddhism' },
          slug: { type: 'string', example: 'buddhism' },
          symbol: { type: 'string', example: '☸' },
          color: { type: 'string', example: '#FFD700' },
        },
      },
    },
  })
  findAll() {
    return this.religionService.findAll();
  }

  @Get(':slug')
  @Public()
  @ApiOperation({
    summary: 'Get religion detail by slug',
    description:
      '按 slug 获取宗教详情，包含关联的圣地、祖庭、祖师和祖训。\n\n' +
      'Retrieve religion details by slug, including associated holy sites, temples, patriarchs, and teachings.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Unique URL-friendly identifier for the religion. / 宗教的URL友好唯一标识符',
    example: 'buddhism',
    enum: [
      'buddhism', 'taoism', 'christianity', 'islam', 'hinduism', 'judaism',
      'confucianism', 'sikhism', 'shinto', 'tibetan-buddhism', 'indigenous-spirituality', 'bahai',
    ],
  })
  @ApiResponse({
    status: 200,
    description: 'Religion detail with associated entities. / 宗教详情及关联实体。',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'clx1abc2d0000ab12cd34ef56' },
        name: { type: 'string', example: '佛教' },
        nameEn: { type: 'string', example: 'Buddhism' },
        slug: { type: 'string', example: 'buddhism' },
        symbol: { type: 'string', example: '☸' },
        color: { type: 'string', example: '#FFD700' },
        holySites: { type: 'array', items: { type: 'object' } },
        temples: { type: 'array', items: { type: 'object' } },
        patriarchs: { type: 'array', items: { type: 'object' } },
        teachings: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Religion not found for the given slug. / 未找到对应slug的宗教。' })
  async findBySlug(@Param('slug') slug: string) {
    const religion = await this.religionService.findBySlug(slug);
    if (!religion) throw new NotFoundException(`Religion "${slug}" not found`);
    return religion;
  }

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Create a new religion (admin)',
    description:
      '创建新宗教记录。仅管理员可操作。\n\n' +
      'Create a new religion record. Admin role required.',
  })
  @ApiBody({ type: CreateReligionDto })
  @ApiResponse({ status: 201, description: 'Religion created successfully. / 宗教创建成功。' })
  @ApiResponse({ status: 400, description: 'Validation failed. / 数据校验失败。' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required. / 权限不足——需要管理员角色。' })
  @ApiResponse({ status: 409, description: 'Religion with this slug already exists. / 该slug的宗教已存在。' })
  create(@Body() dto: CreateReligionDto) {
    return this.religionService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Update a religion (admin)',
    description:
      '更新宗教记录的部分字段。仅管理员可操作。\n\n' +
      'Partially update a religion record. Admin role required.',
  })
  @ApiParam({ name: 'id', description: 'Religion ID (CUID) / 宗教ID', example: 'clx1abc2d0000ab12cd34ef56' })
  @ApiBody({ type: UpdateReligionDto })
  @ApiResponse({ status: 200, description: 'Religion updated successfully. / 宗教更新成功。' })
  @ApiResponse({ status: 400, description: 'Validation failed. / 数据校验失败。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required. / 权限不足。' })
  @ApiResponse({ status: 404, description: 'Religion not found. / 宗教不存在。' })
  update(@Param('id') id: string, @Body() dto: UpdateReligionDto) {
    return this.religionService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Delete a religion (admin)',
    description:
      '删除宗教记录。此操作不可逆，将同时级联删除关联的圣地、祖庭、祖师和祖训。仅管理员可操作。\n\n' +
      'Delete a religion record. This action is irreversible and will cascade-delete associated holy sites, temples, patriarchs, and teachings. Admin role required.',
  })
  @ApiParam({ name: 'id', description: 'Religion ID (CUID) / 宗教ID', example: 'clx1abc2d0000ab12cd34ef56' })
  @ApiResponse({ status: 200, description: 'Religion deleted successfully. / 宗教删除成功。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required. / 权限不足。' })
  @ApiResponse({ status: 404, description: 'Religion not found. / 宗教不存在。' })
  remove(@Param('id') id: string) {
    return this.religionService.remove(id);
  }
}
