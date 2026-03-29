import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CommunityService } from './community.service';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { PhotoQueryDto } from './dto/photo-query.dto';

@ApiTags('community')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('leaderboard')
  @Public()
  @ApiOperation({ summary: 'Get community leaderboard / 社区排行榜' })
  @ApiQuery({ name: 'type', required: false, enum: ['guides', 'reviews', 'trips'], description: 'Leaderboard type' })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'all'], description: 'Time period' })
  @ApiResponse({ status: 200, description: 'Leaderboard entries sorted by rank' })
  getLeaderboard(@Query() query: LeaderboardQueryDto) {
    return this.communityService.getLeaderboard(query);
  }

  @Get('trending')
  @Public()
  @ApiOperation({ summary: 'Get trending content this week / 本周热门内容' })
  @ApiResponse({ status: 200, description: 'Hot guides and hot questions from the past 7 days' })
  getTrending() {
    return this.communityService.getTrending();
  }

  @Get('photos/featured')
  @Public()
  @ApiOperation({ summary: 'Get featured / curated photos / 精选照片' })
  @ApiResponse({ status: 200, description: 'Most-liked review images' })
  getFeaturedPhotos() {
    return this.communityService.getFeaturedPhotos();
  }

  @Get('photos')
  @Public()
  @ApiOperation({ summary: 'Get photo wall / 照片墙' })
  @ApiQuery({ name: 'entityType', required: false, description: 'Filter by entity type (HOLY_SITE, TEMPLE)' })
  @ApiQuery({ name: 'entityId', required: false, description: 'Filter by entity ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (max 50)' })
  @ApiResponse({ status: 200, description: 'Paginated photo wall from reviews' })
  getPhotos(@Query() query: PhotoQueryDto) {
    return this.communityService.getPhotos(query);
  }
}
