import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { SearchService, SearchType } from './search.service';
import { Public } from '../auth/decorators/public.decorator';
import { SearchQueryDto } from './dto/search-query.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Global search across all content types',
    description:
      '全局搜索所有内容类型（宗教、圣地、祖庭、祖师、祖训、印），支持关键词搜索和类型过滤。\n\n' +
      'Search across all content types (religions, holy sites, temples, patriarchs, teachings, seals) with keyword and type filtering.',
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
    );
  }
}
