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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JournalService } from './journal.service';
import { Public } from '../auth/decorators/public.decorator';
import { JournalQueryDto } from '../../common/dto/journal-query.dto';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';

@ApiTags('journals')
@Controller('journals')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Create a cultural journey journal entry',
    description:
      '创建一篇新的文化之旅日志。可关联行程和圣地，支持图片上传、心情记录和公开/私密设置。\n\n' +
      'Create a new cultural journey journal entry. Can be linked to a trip and holy site. Supports image uploads, mood tracking, and public/private visibility.',
  })
  @ApiBody({ type: CreateJournalDto })
  @ApiResponse({
    status: 201,
    description: 'Journal entry created successfully. / 日志创建成功。',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'clx5jrn0001ab12cd34ef56' },
        title: { type: 'string', example: '菩提伽耶文化探访记' },
        content: { type: 'string' },
        mood: { type: 'string', example: '震撼' },
        isPublic: { type: 'boolean', example: false },
        userId: { type: 'string' },
        tripId: { type: 'string', nullable: true },
        siteId: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation failed. / 数据校验失败。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  create(@Body() dto: CreateJournalDto, @CurrentUser('id') userId: string) {
    return this.journalService.create(userId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List journal entries with filters and pagination',
    description:
      '获取文化之旅日志列表。公开接口可浏览公开日志；支持按用户、行程、公开状态筛选和分页。\n\n' +
      'Retrieve journal entries. Public endpoint for browsing public journals. Supports filtering by user, trip, public status, and pagination.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID. / 按用户ID筛选',
    example: 'clx1abc2d0000ab12cd34ef56',
  })
  @ApiQuery({
    name: 'tripId',
    required: false,
    description: 'Filter by associated trip ID. / 按关联行程ID筛选',
    example: 'clx3trip0001ab12cd34ef56',
  })
  @ApiQuery({
    name: 'isPublic',
    required: false,
    type: Boolean,
    description: 'Filter by public/private visibility. true = public only. / 按公开/私密筛选',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated journal list. / 分页日志列表。',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              content: { type: 'string' },
              mood: { type: 'string', nullable: true },
              isPublic: { type: 'boolean' },
              images: { type: 'array', items: { type: 'string' } },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number', example: 28 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
      },
    },
  })
  findAll(
    @Query() query: JournalQueryDto,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.journalService.findAll({
      userId: query.userId,
      tripId: query.tripId,
      isPublic: query.isPublic !== undefined ? query.isPublic === 'true' : undefined,
      page: query.page,
      limit: query.limit,
      currentUserId,
    });
  }

  @Get(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get journal entry detail by ID',
    description:
      '获取指定日志的详细信息，包含完整内容、图片列表和关联信息。\n\n' +
      'Retrieve full journal entry details including content, image list, and associated trip/site info.',
  })
  @ApiParam({
    name: 'id',
    description: 'Journal entry ID (CUID). / 日志ID',
    example: 'clx5jrn0001ab12cd34ef56',
  })
  @ApiResponse({ status: 200, description: 'Journal entry detail returned. / 日志详情返回成功。' })
  @ApiResponse({ status: 403, description: 'Forbidden — private journal of another user. / 权限不足——他人私密日志。' })
  @ApiResponse({ status: 404, description: 'Journal entry not found. / 日志不存在。' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.journalService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Update a journal entry',
    description:
      '更新日志内容。仅日志作者可以修改自己的日志。\n\n' +
      'Update journal entry content. Only the journal author can modify their own entries.',
  })
  @ApiParam({ name: 'id', description: 'Journal entry ID (CUID). / 日志ID', example: 'clx5jrn0001ab12cd34ef56' })
  @ApiBody({ type: UpdateJournalDto })
  @ApiResponse({ status: 200, description: 'Journal entry updated successfully. / 日志更新成功。' })
  @ApiResponse({ status: 400, description: 'Validation failed. / 数据校验失败。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 404, description: 'Journal entry not found. / 日志不存在。' })
  update(@Param('id') id: string, @Body() dto: UpdateJournalDto, @CurrentUser('id') userId: string) {
    return this.journalService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Delete a journal entry',
    description:
      '删除日志。此操作不可逆。仅日志作者或管理员可以删除。\n\n' +
      'Delete a journal entry. This action is irreversible. Only the author or admin can delete.',
  })
  @ApiParam({ name: 'id', description: 'Journal entry ID (CUID). / 日志ID', example: 'clx5jrn0001ab12cd34ef56' })
  @ApiResponse({ status: 200, description: 'Journal entry deleted successfully. / 日志删除成功。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the author. / 权限不足——非日志作者。' })
  @ApiResponse({ status: 404, description: 'Journal entry not found. / 日志不存在。' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.journalService.remove(id, userId);
  }
}
