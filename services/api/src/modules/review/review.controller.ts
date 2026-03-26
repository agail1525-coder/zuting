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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { Public } from '../auth/decorators/public.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

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
