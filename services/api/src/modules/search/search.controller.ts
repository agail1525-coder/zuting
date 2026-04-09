import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SearchService, SearchType } from './search.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchSuggestionsDto } from './dto/search-suggestions.dto';
import { MapSearchDto } from './dto/map-search.dto';
import { SearchHistoryDto } from './dto/search-history.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // ─────────────────────────────────────────────────────────────
  // Static routes FIRST (before any :id params)
  // ─────────────────────────────────────────────────────────────

  @Get('suggestions')
  @Public()
  @ApiOperation({
    summary: 'Autocomplete suggestions',
    description:
      '输入自动补全：返回最多5个实体匹配结果和热词建议。\n\n' +
      'Autocomplete: returns up to 5 entity matches and keyword suggestions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Suggestions returned / 返回补全建议',
    schema: {
      type: 'object',
      properties: {
        entities: { type: 'array', items: { type: 'object' } },
        keywords: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  suggestions(@Query() dto: SearchSuggestionsDto) {
    return this.searchService.suggestions(dto.q);
  }

  @Get('hot')
  @Public()
  @ApiOperation({
    summary: 'Hot search keywords',
    description:
      '获取热门搜索词（来自Redis有序集合，按搜索频次排序）。\n\n' +
      'Get hot search keywords from Redis sorted set, ordered by frequency.',
  })
  @ApiResponse({
    status: 200,
    description: 'Hot keywords returned / 返回热词列表',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          keyword: { type: 'string', example: '菩提伽耶' },
          score: { type: 'number', example: 42 },
        },
      },
    },
  })
  getHotKeywords() {
    return this.searchService.getHotKeywords();
  }

  @Get('map')
  @Public()
  @ApiOperation({
    summary: 'Map bounds search',
    description:
      '根据地图边界（西南/东北坐标）搜索范围内的圣地和祖庭，支持信仰和类型过滤。\n\n' +
      'Search holy sites and temples within map bounds (SW/NE coordinates), with optional religion and type filters.',
  })
  @ApiResponse({
    status: 200,
    description: 'Map search results with coordinates / 返回含坐标的地图搜索结果',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', example: 'holy-site' },
          id: { type: 'string' },
          title: { type: 'string', example: '菩提伽耶' },
          subtitle: { type: 'string', nullable: true },
          latitude: { type: 'number', example: 24.695 },
          longitude: { type: 'number', example: 84.991 },
          image: { type: 'string', nullable: true },
          religion: { type: 'object', nullable: true },
        },
      },
    },
  })
  mapSearch(@Query() dto: MapSearchDto) {
    return this.searchService.mapSearch(
      { swLat: dto.swLat, swLng: dto.swLng, neLat: dto.neLat, neLng: dto.neLng },
      { religionId: dto.religionId, type: dto.type },
    );
  }

  @Get('history')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get user search history',
    description:
      '获取当前用户的搜索历史（最近20条，存储在Redis）。需要JWT认证。\n\n' +
      "Get the current user's search history (last 20 entries from Redis). Requires JWT auth.",
  })
  @ApiResponse({
    status: 200,
    description: 'User search history / 用户搜索历史',
    schema: {
      type: 'array',
      items: { type: 'string', example: '菩提伽耶' },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized / 未授权' })
  getHistory(@CurrentUser('id') userId: string) {
    return this.searchService.getUserHistory(userId);
  }

  @Post('history')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Record a search keyword in history',
    description:
      '将搜索词记录到当前用户的搜索历史（Redis列表，最多保留20条）。需要JWT认证。\n\n' +
      "Record a search keyword into the current user's history list in Redis (capped at 20). Requires JWT auth.",
  })
  @ApiResponse({ status: 201, description: 'Keyword recorded / 关键词已记录' })
  @ApiResponse({ status: 401, description: 'Unauthorized / 未授权' })
  addHistory(@CurrentUser('id') userId: string, @Body() dto: SearchHistoryDto) {
    return this.searchService.addToHistory(userId, dto.keyword);
  }

  @Delete('history')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Clear user search history',
    description:
      '清空当前用户的全部搜索历史（删除Redis键）。需要JWT认证。\n\n' +
      "Clear all of the current user's search history by deleting the Redis key. Requires JWT auth.",
  })
  @ApiResponse({ status: 200, description: 'History cleared / 历史已清空' })
  @ApiResponse({ status: 401, description: 'Unauthorized / 未授权' })
  clearHistory(@CurrentUser('id') userId: string) {
    return this.searchService.clearHistory(userId);
  }

  // ─────────────────────────────────────────────────────────────
  // Main search endpoint
  // ─────────────────────────────────────────────────────────────

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Global search across all content types',
    description:
      '全局搜索所有内容类型（文化传统、圣地、祖庭、祖师、祖训、印），支持关键词搜索、类型过滤、文化传统过滤、国家过滤和排序。\n\n' +
      'Search across all content types (cultural traditions, holy sites, temples, patriarchs, teachings, seals) with keyword, type, cultural tradition, country filters and sorting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results returned successfully. / 搜索结果返回成功。',
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string', example: '佛教' },
        type: { type: 'string', example: 'all' },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        total: { type: 'number', example: 15 },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'holy-site' },
              id: { type: 'string', example: 'clx1abc2d0000ab12cd34ef56' },
              title: { type: 'string', example: '菩提伽耶' },
              subtitle: { type: 'string', example: 'Bodh Gaya - India' },
              descriptionSnippet: { type: 'string', example: '佛教四大圣地之一...' },
              image: { type: 'string', nullable: true },
              religion: {
                type: 'object',
                nullable: true,
                properties: {
                  name: { type: 'string', example: '佛教' },
                  symbol: { type: 'string', example: '☸' },
                  color: { type: 'string', example: '#FFD700' },
                },
              },
            },
          },
        },
      },
    },
  })
  search(@Query() dto: SearchQueryDto) {
    return this.searchService.search(
      dto.q,
      dto.type as SearchType,
      dto.page ?? 1,
      dto.limit ?? 20,
      dto.religionId,
      dto.country,
      dto.sort ?? 'relevance',
      (dto.sortOrder ?? 'asc') as 'asc' | 'desc',
    );
  }
}
