import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PkbService } from './pkb.service';
import {
  CreateEntryDto,
  ListEntriesDto,
  ShareEntryDto,
  StruggleDto,
  UpdateEntryDto,
  UpdateRecommendationDto,
  UpdateVowsDto,
} from './dto/pkb.dto';

@ApiTags('cultivation-pkb')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pkb')
export class PkbController {
  constructor(private readonly service: PkbService) {}

  @Get('me')
  @ApiOperation({ summary: '我的修行库概览 (愿景+画像+最近条目+活跃推荐)' })
  overview(@CurrentUser('id') userId: string) {
    return this.service.getOverview(userId);
  }

  @Put('me/vows')
  @ApiOperation({ summary: '更新三生愿景 (个人/家庭/事业) → 自动推荐经论' })
  updateVows(@CurrentUser('id') userId: string, @Body() dto: UpdateVowsDto) {
    return this.service.updateVows(userId, dto);
  }

  @Get('me/entries')
  @ApiOperation({ summary: '修行条目分页列表 (kind/category/tag 筛选)' })
  listEntries(@CurrentUser('id') userId: string, @Query() dto: ListEntriesDto) {
    return this.service.listEntries(userId, dto);
  }

  @Post('me/entries')
  @ApiOperation({ summary: '手动创建修行条目 (反思/笔记/感悟)' })
  createEntry(@CurrentUser('id') userId: string, @Body() dto: CreateEntryDto) {
    return this.service.createEntry(userId, dto);
  }

  @Patch('me/entries/:id')
  @ApiOperation({ summary: '编辑修行条目' })
  updateEntry(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEntryDto,
  ) {
    return this.service.updateEntry(userId, id, dto);
  }

  @Delete('me/entries/:id')
  @ApiOperation({ summary: '删除修行条目' })
  deleteEntry(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.deleteEntry(userId, id);
  }

  @Post('me/entries/:id/share')
  @ApiOperation({ summary: '分享修行条目到社区 (生成分享草稿)' })
  shareEntry(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ShareEntryDto,
  ) {
    return this.service.shareEntry(userId, id, dto);
  }

  @Post('me/struggle')
  @ApiOperation({ summary: '提交当下烦恼 → 小鸿引经据典回应 → 自动建条目+推荐' })
  struggle(@CurrentUser('id') userId: string, @Body() dto: StruggleDto) {
    return this.service.handleStruggle(userId, dto);
  }

  @Get('me/recommendations')
  @ApiOperation({ summary: '活跃推荐列表 (未读/实践中/完成)' })
  listRecommendations(@CurrentUser('id') userId: string) {
    return this.service.listRecommendations(userId);
  }

  @Patch('me/recommendations/:id')
  @ApiOperation({ summary: '更新推荐状态 (PENDING→READ→PRACTICING→DONE)' })
  updateRecommendation(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRecommendationDto,
  ) {
    return this.service.updateRecommendation(userId, id, dto);
  }
}
