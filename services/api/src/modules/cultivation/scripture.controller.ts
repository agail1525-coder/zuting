import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CultivationAccessGuard } from './guards/cultivation-access.guard';
import { ScriptureService } from './scripture.service';
import { ScriptureListQueryDto, InsightQueryDto } from './dto/scripture.dto';

@ApiTags('cultivation-scriptures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CultivationAccessGuard)
@Controller('cultivation/scriptures')
export class ScriptureController {
  constructor(private readonly service: ScriptureService) {}

  @Get('categories')
  @ApiOperation({ summary: '获取经论分类树 (知识图谱节点)' })
  categories() {
    return this.service.getCategories();
  }

  @Get('graph')
  @ApiOperation({ summary: '知识图谱数据 (节点+边)' })
  graph() {
    return this.service.getGraph();
  }

  @Get('recommended')
  @ApiOperation({ summary: '基于用户阶位推荐经论' })
  recommended(@CurrentUser('id') userId: string) {
    return this.service.getRecommended(userId);
  }

  @Get('insights')
  @ApiOperation({ summary: 'AI经论悟道内容' })
  insights(@Query() dto: InsightQueryDto) {
    return this.service.listInsights(dto);
  }

  @Get()
  @ApiOperation({ summary: '经论列表 (筛选ring/tradition/category)' })
  list(@Query() dto: ScriptureListQueryDto) {
    return this.service.listScriptures(dto);
  }

  @Get(':slug')
  @ApiOperation({ summary: '经论详情 (含章节目录+关联经论+AI悟道)' })
  detail(@Param('slug') slug: string) {
    return this.service.getScripture(slug);
  }

  @Get(':slug/chapters/:no')
  @ApiOperation({ summary: '章节全文+注释' })
  chapter(@Param('slug') slug: string, @Param('no') no: string) {
    return this.service.getChapter(slug, parseInt(no, 10));
  }

  @Post(':slug/view')
  @ApiOperation({ summary: '记录阅读 (viewCount++)' })
  view(@Param('slug') slug: string) {
    return this.service.recordView(slug);
  }
}
