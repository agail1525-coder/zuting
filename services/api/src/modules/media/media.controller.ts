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
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { Public } from '../auth/decorators/public.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List media content by entity',
    description:
      '按实体获取多媒体导览列表。支持按entityType、entityId和mediaType筛选。\n\n' +
      'List multimedia tour content by entity. Supports filtering by entityType, entityId, and mediaType.',
  })
  @ApiQuery({
    name: 'entityType',
    required: false,
    description: 'Entity type: HOLY_SITE or TEMPLE. / 实体类型',
    example: 'HOLY_SITE',
    enum: ['HOLY_SITE', 'TEMPLE'],
  })
  @ApiQuery({
    name: 'entityId',
    required: false,
    description: 'Entity ID to filter by. / 实体ID',
    example: 'clx2xyz9f0001ab12cd34ef56',
  })
  @ApiQuery({
    name: 'mediaType',
    required: false,
    description: 'Media type filter: VIDEO, PANORAMA, AUDIO. / 媒体类型筛选',
    example: 'VIDEO',
    enum: ['VIDEO', 'PANORAMA', 'AUDIO'],
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated media content list. / 分页多媒体列表。',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              entityType: { type: 'string' },
              entityId: { type: 'string' },
              mediaType: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string', nullable: true },
              url: { type: 'string' },
              thumbnailUrl: { type: 'string', nullable: true },
              duration: { type: 'number', nullable: true },
              sortOrder: { type: 'number' },
            },
          },
        },
        total: { type: 'number', example: 5 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
      },
    },
  })
  findAll(
    @Query() pagination: PaginationQueryDto,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('mediaType') mediaType?: string,
  ) {
    return this.mediaService.findAll({
      entityType,
      entityId,
      mediaType,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get single media content by ID',
    description:
      '获取单个多媒体内容详情。\n\n' +
      'Retrieve a single media content item by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Media content ID (CUID). / 媒体内容ID',
    example: 'clx5med0001ab12cd34ef56',
  })
  @ApiResponse({ status: 200, description: 'Media content detail. / 媒体详情。' })
  @ApiResponse({ status: 404, description: 'Media content not found. / 媒体不存在。' })
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Post()
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Create media content (Admin)',
    description:
      '创建多媒体导览内容。需要管理员权限。\n\n' +
      'Create a new multimedia tour content item. Requires admin authentication.',
  })
  @ApiBody({ type: CreateMediaDto })
  @ApiResponse({
    status: 201,
    description: 'Media content created successfully. / 媒体内容创建成功。',
  })
  @ApiResponse({ status: 400, description: 'Validation failed. / 数据校验失败。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  create(@Body() dto: CreateMediaDto) {
    return this.mediaService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Update media content (Admin)',
    description:
      '更新多媒体导览内容。需要管理员权限。\n\n' +
      'Update an existing multimedia tour content item. Requires admin authentication.',
  })
  @ApiParam({ name: 'id', description: 'Media content ID (CUID). / 媒体内容ID' })
  @ApiBody({ type: UpdateMediaDto })
  @ApiResponse({ status: 200, description: 'Media content updated. / 媒体内容已更新。' })
  @ApiResponse({ status: 404, description: 'Media content not found. / 媒体不存在。' })
  update(@Param('id') id: string, @Body() dto: UpdateMediaDto) {
    return this.mediaService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Delete media content (Admin)',
    description:
      '删除多媒体导览内容。此操作不可逆。需要管理员权限。\n\n' +
      'Delete a multimedia tour content item. This action is irreversible. Requires admin authentication.',
  })
  @ApiParam({ name: 'id', description: 'Media content ID (CUID). / 媒体内容ID' })
  @ApiResponse({ status: 200, description: 'Media content deleted. / 媒体内容已删除。' })
  @ApiResponse({ status: 404, description: 'Media content not found. / 媒体不存在。' })
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
