import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { CreateReplyDto } from './dto/create-reply.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a review',
    description:
      '创建评价，支持对行程、导游、圣地等目标进行评分和评论。\n\n' +
      'Create a review for a target (trip, guide, or site) with rating and comments.',
  })
  @ApiResponse({ status: 201, description: 'Review created successfully / 评价创建成功' })
  @ApiResponse({ status: 400, description: 'Bad request — validation error / 请求参数无效' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required / 未授权' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.create(userId, dto);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin: list all reviews',
    description:
      '管理员获取所有评价列表，支持按类型和状态筛选。\n\n' +
      'Admin endpoint to list all reviews with optional targetType and status filters.',
  })
  @ApiQuery({ name: 'targetType', required: false, enum: ['TRIP', 'GUIDE', 'SITE'] })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED', 'HIDDEN'] })
  @ApiResponse({ status: 200, description: 'Paginated list of reviews / 评价列表（分页）' })
  @ApiResponse({ status: 401, description: 'Unauthorized / 未授权' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only / 仅限管理员' })
  findAllAdmin(
    @Query('targetType') targetType: string,
    @Query('status') status: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.reviewService.findAllAdmin({
      targetType,
      status,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Patch(':id/moderate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin: moderate a review',
    description:
      '管理员审核评价，可以通过、拒绝或隐藏评价。\n\n' +
      'Admin moderation endpoint to approve, reject, or hide a review.',
  })
  @ApiParam({ name: 'id', description: 'Review ID (评价ID)' })
  @ApiResponse({ status: 200, description: 'Review moderated successfully / 评价审核成功' })
  @ApiResponse({ status: 401, description: 'Unauthorized / 未授权' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only / 仅限管理员' })
  @ApiResponse({ status: 404, description: 'Review not found / 评价不存在' })
  moderate(
    @Param('id') id: string,
    @Body() dto: ModerateReviewDto,
  ) {
    return this.reviewService.moderate(id, dto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List reviews for a target',
    description:
      '获取指定目标（行程/导游/圣地）的评价列表，支持分页。\n\n' +
      'List reviews for a specific target (trip/guide/site) with pagination support.',
  })
  @ApiQuery({ name: 'targetType', required: true, enum: ['TRIP', 'GUIDE', 'SITE'] })
  @ApiQuery({ name: 'targetId', required: true })
  @ApiResponse({ status: 200, description: 'Paginated list of reviews / 评价列表（分页）' })
  findAll(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.reviewService.findAll({
      targetType,
      targetId,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user reviews',
    description:
      '获取当前登录用户的所有评价，支持分页。\n\n' +
      'Get all reviews created by the currently authenticated user, with pagination.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of user reviews / 用户评价列表' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required / 未授权' })
  findMyReviews(
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.reviewService.findMyReviews(
      userId,
      pagination.page,
      pagination.limit,
    );
  }

  @Public()
  @Get('stats/:targetType/:targetId')
  @ApiOperation({
    summary: 'Get review statistics',
    description:
      '获取指定目标的评价统计数据，包括平均评分和评分分布。\n\n' +
      'Get review statistics for a target including average rating and rating distribution.',
  })
  @ApiParam({ name: 'targetType', enum: ['TRIP', 'GUIDE', 'SITE'] })
  @ApiParam({ name: 'targetId', description: 'Target ID (目标ID)' })
  @ApiResponse({ status: 200, description: 'Review statistics returned / 评价统计数据' })
  @ApiResponse({ status: 404, description: 'Target not found / 目标不存在' })
  getStats(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    return this.reviewService.getStats(targetType, targetId);
  }

  @Post(':id/replies')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reply to a review',
    description: '回复一条评价。支持官方/普通回复。\n\nReply to a review (official or regular).',
  })
  @ApiParam({ name: 'id', description: 'Review ID (评价ID)' })
  @ApiResponse({ status: 201, description: 'Reply created / 回复已创建' })
  @ApiResponse({ status: 401, description: 'Unauthorized / 未授权' })
  @ApiResponse({ status: 404, description: 'Review not found / 评价不存在' })
  addReply(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReplyDto,
  ) {
    return this.reviewService.addReply(id, userId, dto);
  }

  @Post(':id/vote')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Vote review as helpful',
    description: '标记评价为"有帮助"。每个用户只能投票一次。\n\nMark a review as helpful. Each user can vote once.',
  })
  @ApiParam({ name: 'id', description: 'Review ID (评价ID)' })
  @ApiResponse({ status: 200, description: 'Vote recorded / 投票成功' })
  @ApiResponse({ status: 401, description: 'Unauthorized / 未授权' })
  @ApiResponse({ status: 404, description: 'Review not found / 评价不存在' })
  @ApiResponse({ status: 409, description: 'Already voted / 已投票' })
  addVote(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reviewService.addVote(id, userId);
  }

  @Delete(':id/vote')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove helpful vote',
    description: '取消对评价的"有帮助"投票。\n\nRemove your helpful vote from a review.',
  })
  @ApiParam({ name: 'id', description: 'Review ID (评价ID)' })
  @ApiResponse({ status: 200, description: 'Vote removed / 投票已取消' })
  @ApiResponse({ status: 401, description: 'Unauthorized / 未授权' })
  @ApiResponse({ status: 404, description: 'Vote not found / 投票不存在' })
  removeVote(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reviewService.removeVote(id, userId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update own review',
    description:
      '更新自己的评价内容。只能修改自己发布的评价。\n\n' +
      'Update your own review. Users can only modify reviews they created.',
  })
  @ApiParam({ name: 'id', description: 'Review ID (评价ID)' })
  @ApiResponse({ status: 200, description: 'Review updated successfully / 评价更新成功' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required / 未授权' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the review owner / 无权修改' })
  @ApiResponse({ status: 404, description: 'Review not found / 评价不存在' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete review',
    description:
      '删除评价。评价作者或管理员可以执行此操作。\n\n' +
      'Delete a review. Can be performed by the review owner or an admin.',
  })
  @ApiParam({ name: 'id', description: 'Review ID (评价ID)' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully / 评价删除成功' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required / 未授权' })
  @ApiResponse({ status: 403, description: 'Forbidden — not owner or admin / 无权删除' })
  @ApiResponse({ status: 404, description: 'Review not found / 评价不存在' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.reviewService.remove(id, user.id, user.role === 'ADMIN');
  }
}
