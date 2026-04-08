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
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GuideService } from './guide.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { GuideQueryDto } from './dto/guide-query.dto';
import { AiDraftGuideDto } from './dto/ai-draft-guide.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('guides')
@Controller('guides')
export class GuideController {
  constructor(private readonly guideService: GuideService) {}

  // ---- Public: List published guides ----
  @Public()
  @Get()
  @ApiOperation({
    summary: '获取攻略列表',
    description:
      '获取已发布的旅行攻略列表，支持按标签筛选和多种排序方式（最新/最热/最多点赞）。\n\n' +
      'List published travel guides. Supports tag filtering and sorting (latest / popular / mostLiked).',
  })
  @ApiResponse({ status: 200, description: '攻略列表返回成功。' })
  findAll(@Query() query: GuideQueryDto) {
    return this.guideService.findAll(query);
  }

  // ---- Auth: Create guide draft ----
  @Post()
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '创建攻略草稿',
    description:
      '创建一篇新的旅行攻略草稿。草稿不对外公开，需调用发布接口才能公开展示。\n\n' +
      'Create a new travel guide draft. Drafts are not public until published.',
  })
  @ApiBody({ type: CreateGuideDto })
  @ApiResponse({ status: 201, description: '攻略草稿创建成功。' })
  @ApiResponse({ status: 400, description: '数据校验失败。' })
  @ApiResponse({ status: 401, description: '未授权。' })
  create(@Body() dto: CreateGuideDto, @CurrentUser('id') userId: string) {
    return this.guideService.create(userId, dto);
  }

  // ---- Auth: AI-assisted draft generation ----
  @Post('ai-draft')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'AI辅助游记草稿生成',
    description:
      '用户提交大白话素材+图片，AI整理成结构化游记（标题/正文/标签/建议封面）。不直接落库，前端预填后用户可编辑再发布。\n\n' +
      'User submits raw notes + uploaded images; AI refines into structured guide draft (title, markdown content, tags, suggested cover). Does NOT persist — frontend pre-fills the draft for user to edit before publish.',
  })
  @ApiBody({ type: AiDraftGuideDto })
  @ApiResponse({ status: 201, description: 'AI 草稿生成成功。' })
  @ApiResponse({ status: 400, description: '素材过短或格式错误。' })
  @ApiResponse({ status: 401, description: '未授权。' })
  @ApiResponse({ status: 503, description: 'AI 服务不可用。' })
  aiDraft(@Body() dto: AiDraftGuideDto) {
    return this.guideService.aiDraft(dto);
  }

  // ---- Public: Get guide detail ----
  @Public()
  @Get(':id')
  @ApiOperation({
    summary: '获取攻略详情',
    description:
      '获取攻略详情，同时自动增加浏览量计数。\n\n' +
      'Get guide detail. Automatically increments view count.',
  })
  @ApiParam({ name: 'id', description: '攻略ID (CUID)', example: 'clx5jrn0001ab12cd34ef56' })
  @ApiResponse({ status: 200, description: '攻略详情返回成功。' })
  @ApiResponse({ status: 404, description: '攻略不存在。' })
  findOne(@Param('id') id: string) {
    return this.guideService.findOne(id);
  }

  // ---- Auth: Update guide ----
  @Patch(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '更新攻略',
    description:
      '更新攻略内容。仅攻略作者可以修改自己的攻略。\n\n' +
      'Update guide content. Only the author can modify their own guides.',
  })
  @ApiParam({ name: 'id', description: '攻略ID (CUID)', example: 'clx5jrn0001ab12cd34ef56' })
  @ApiBody({ type: UpdateGuideDto })
  @ApiResponse({ status: 200, description: '攻略更新成功。' })
  @ApiResponse({ status: 403, description: '权限不足——非作者。' })
  @ApiResponse({ status: 404, description: '攻略不存在。' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGuideDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.guideService.update(id, userId, dto);
  }

  // ---- Auth: Delete guide ----
  @Delete(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '删除攻略',
    description:
      '删除攻略。此操作不可逆，同时删除所有关联评论和点赞。仅作者可以删除。\n\n' +
      'Delete a guide. Irreversible — also removes all comments and likes. Author only.',
  })
  @ApiParam({ name: 'id', description: '攻略ID (CUID)', example: 'clx5jrn0001ab12cd34ef56' })
  @ApiResponse({ status: 200, description: '攻略删除成功。' })
  @ApiResponse({ status: 403, description: '权限不足——非作者。' })
  @ApiResponse({ status: 404, description: '攻略不存在。' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.guideService.remove(id, userId);
  }

  // ---- Auth: Publish guide (static sub-route BEFORE :id sub-routes) ----
  @Post(':id/publish')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '发布攻略',
    description:
      '将草稿状态的攻略发布为公开可见。仅作者可以发布自己的攻略。\n\n' +
      'Publish a draft guide to make it publicly visible. Author only.',
  })
  @ApiParam({ name: 'id', description: '攻略ID (CUID)', example: 'clx5jrn0001ab12cd34ef56' })
  @ApiResponse({ status: 201, description: '攻略发布成功。' })
  @ApiResponse({ status: 403, description: '权限不足——非作者。' })
  @ApiResponse({ status: 404, description: '攻略不存在。' })
  publish(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.guideService.publish(id, userId);
  }

  // ---- Public: List guide comments ----
  @Public()
  @Get(':id/comments')
  @ApiOperation({
    summary: '获取攻略评论列表',
    description:
      '分页获取攻略下的评论，按时间正序排列。\n\n' +
      'Get paginated comments for a guide, ordered chronologically.',
  })
  @ApiParam({ name: 'id', description: '攻略ID (CUID)', example: 'clx5jrn0001ab12cd34ef56' })
  @ApiResponse({ status: 200, description: '评论列表返回成功。' })
  @ApiResponse({ status: 404, description: '攻略不存在。' })
  findComments(
    @Param('id') id: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.guideService.findComments(id, pagination.page, pagination.limit);
  }

  // ---- Auth: Add comment ----
  @Post(':id/comments')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '添加评论',
    description:
      '为攻略添加评论，同时自动更新评论计数。\n\n' +
      'Add a comment to a guide. Automatically updates comment count.',
  })
  @ApiParam({ name: 'id', description: '攻略ID (CUID)', example: 'clx5jrn0001ab12cd34ef56' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['content'],
      properties: { content: { type: 'string', example: '非常实用的攻略，感谢分享！' } },
    },
  })
  @ApiResponse({ status: 201, description: '评论添加成功。' })
  @ApiResponse({ status: 401, description: '未授权。' })
  @ApiResponse({ status: 404, description: '攻略不存在。' })
  addComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.guideService.addComment(id, userId, content);
  }

  // ---- Auth: Like guide ----
  @Post(':id/like')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '点赞攻略',
    description:
      '为攻略点赞（幂等，重复点赞不会报错）。\n\n' +
      'Like a guide (idempotent — no error if already liked).',
  })
  @ApiParam({ name: 'id', description: '攻略ID (CUID)', example: 'clx5jrn0001ab12cd34ef56' })
  @ApiResponse({ status: 201, description: '点赞成功。', schema: { type: 'object', properties: { liked: { type: 'boolean', example: true } } } })
  @ApiResponse({ status: 401, description: '未授权。' })
  @ApiResponse({ status: 404, description: '攻略不存在。' })
  like(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.guideService.like(id, userId);
  }

  // ---- Auth: Unlike guide ----
  @Delete(':id/like')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '取消点赞',
    description:
      '取消对攻略的点赞（幂等，未点赞时不会报错）。\n\n' +
      'Unlike a guide (idempotent — no error if not previously liked).',
  })
  @ApiParam({ name: 'id', description: '攻略ID (CUID)', example: 'clx5jrn0001ab12cd34ef56' })
  @ApiResponse({ status: 200, description: '取消点赞成功。', schema: { type: 'object', properties: { liked: { type: 'boolean', example: false } } } })
  @ApiResponse({ status: 401, description: '未授权。' })
  @ApiResponse({ status: 404, description: '攻略不存在。' })
  unlike(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.guideService.unlike(id, userId);
  }
}
