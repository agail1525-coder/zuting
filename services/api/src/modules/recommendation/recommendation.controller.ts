import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RelatedQueryDto } from './dto/related-query.dto';
import { RecordViewDto } from './dto/record-view.dto';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Homepage recommendations',
    description:
      '获取首页推荐列表。已登录用户将获得个性化推荐（基于浏览历史），未登录用户返回热门内容。\n\n' +
      'Homepage recommendations. Personalized for authenticated users based on view history, popular items otherwise.',
  })
  @ApiResponse({ status: 200, description: 'Recommendation list / 推荐列表' })
  getHomepage(@CurrentUser('id') userId: string | undefined) {
    return this.recommendationService.getHomepage(userId);
  }

  @Public()
  @Get('related')
  @ApiOperation({
    summary: 'Related items',
    description:
      '获取与指定实体相关的推荐内容。优先推荐同信仰+同国家，其次同信仰，再次同国家，最后按评分降序。\n\n' +
      'Related items for a given entity. Prioritizes same religion+country, then religion, then country, then rating.',
  })
  @ApiResponse({ status: 200, description: 'Related items list / 相关推荐' })
  getRelated(@Query() query: RelatedQueryDto) {
    return this.recommendationService.getRelated(
      query.entityType,
      query.entityId,
      query.limit,
    );
  }

  @Public()
  @Get('popular')
  @ApiOperation({
    summary: 'Popular items',
    description:
      '获取热门推荐内容，按评价数量和平均评分排序。可按宗教筛选。\n\n' +
      'Popular items ordered by review count and average rating. Optionally filter by religion.',
  })
  @ApiQuery({ name: 'religion', required: false, description: 'Religion ID filter (宗教ID过滤)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results (最大返回数)', type: Number })
  @ApiResponse({ status: 200, description: 'Popular items list / 热门推荐' })
  getPopular(
    @Query('religion') religion?: string,
    @Query('limit') limit?: string,
  ) {
    return this.recommendationService.getPopular(
      religion,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get('view-history')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user view history',
    description: '获取当前用户的最近浏览历史记录。\n\nGet the authenticated user\'s recent view history.',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results (最大返回数)', type: Number })
  @ApiResponse({ status: 200, description: 'View history list / 浏览历史' })
  @ApiResponse({ status: 401, description: 'Unauthorized / 未授权' })
  getViewHistory(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.recommendationService.getViewHistory(
      userId,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Post('view-history')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Record a view',
    description: '记录用户浏览历史。同一实体24小时内重复浏览只更新时间戳。\n\nRecord a view event. Deduped within 24h per entity.',
  })
  @ApiResponse({ status: 204, description: 'View recorded / 已记录' })
  @ApiResponse({ status: 401, description: 'Unauthorized / 未授权' })
  recordView(
    @CurrentUser('id') userId: string,
    @Body() dto: RecordViewDto,
  ) {
    return this.recommendationService.recordView(userId, dto);
  }

  @Delete('view-history')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Clear view history',
    description: '清除当前用户的全部浏览历史记录。\n\nClear all view history for the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'History cleared / 历史已清除' })
  @ApiResponse({ status: 401, description: 'Unauthorized / 未授权' })
  clearViewHistory(@CurrentUser('id') userId: string) {
    return this.recommendationService.clearViewHistory(userId);
  }
}
