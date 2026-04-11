import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CultivationAccessGuard } from './guards/cultivation-access.guard';
import { DailyPracticeService } from './daily-practice.service';
import { FestivalService } from './festival.service';
import {
  ApplyTemplateDto,
  LogSlotDto,
  UpdateScheduleDto,
  UpsertSlotDto,
} from './dto/daily-practice.dto';

@ApiTags('cultivation-daily-practice')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CultivationAccessGuard)
@Controller('cultivation/daily-practice')
export class DailyPracticeController {
  constructor(
    private readonly service: DailyPracticeService,
    private readonly festivals: FestivalService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: '获取本人每日功课时间轴' })
  @ApiQuery({ name: 'date', required: false })
  me(@CurrentUser('id') userId: string, @Query('date') date?: string) {
    return this.service.getTimeline(userId, date);
  }

  @Patch('schedule')
  @ApiOperation({ summary: '更新起床/就寝/提醒设置' })
  updateSchedule(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.service.updateSchedule(userId, dto);
  }

  @Post('slot')
  @ApiOperation({ summary: '新建一个功课槽位' })
  createSlot(
    @CurrentUser('id') userId: string,
    @Body() dto: UpsertSlotDto,
  ) {
    return this.service.upsertSlot(userId, dto);
  }

  @Patch('slot/:id')
  @ApiOperation({ summary: '编辑功课槽位' })
  updateSlot(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpsertSlotDto,
  ) {
    return this.service.upsertSlot(userId, dto, id);
  }

  @Delete('slot/:id')
  @ApiOperation({ summary: '删除功课槽位(软删)' })
  deleteSlot(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.deleteSlot(userId, id);
  }

  @Post('slot/:id/log')
  @ApiOperation({ summary: '打卡完成功课' })
  logSlot(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: LogSlotDto,
  ) {
    return this.service.logSlotCompletion(userId, id, dto);
  }

  @Get('liturgy-templates')
  @ApiOperation({ summary: '浏览 12 传统礼仪模板库' })
  @ApiQuery({ name: 'tradition', required: false })
  @ApiQuery({ name: 'session', required: false })
  listTemplates(
    @Query('tradition') tradition?: string,
    @Query('session') session?: string,
  ) {
    return this.service.listLiturgyTemplates(tradition, session);
  }

  @Post('apply-template')
  @ApiOperation({ summary: '应用某个礼仪模板到指定 session' })
  applyTemplate(
    @CurrentUser('id') userId: string,
    @Body() dto: ApplyTemplateDto,
  ) {
    return this.service.applyTemplate(userId, dto);
  }

  @Post('slot/:id/coach')
  @ApiOperation({ summary: '小鸿学伴 · 生成本场功课引导' })
  @Throttle({ default: { limit: 20, ttl: 3600_000 } })
  coach(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.coachSlot(userId, id);
  }

  @Get('streak')
  @ApiOperation({ summary: '连续打卡统计' })
  streak(@CurrentUser('id') userId: string) {
    return this.service.getStreak(userId);
  }

  @Get('festivals')
  @ApiOperation({ summary: '查询指定日期命中的公历圣日' })
  @ApiQuery({ name: 'date', required: true, example: '2026-04-08' })
  @ApiQuery({ name: 'tradition', required: false })
  listFestivals(
    @Query('date') date: string,
    @Query('tradition') tradition?: string,
  ) {
    return this.festivals.listByDate(date, tradition);
  }

  @Get('festivals/all')
  @ApiOperation({ summary: '全量文化圣日列表 (含农历/伊斯兰历)' })
  @ApiQuery({ name: 'tradition', required: false })
  allFestivals(@Query('tradition') tradition?: string) {
    return this.festivals.listAll(tradition);
  }

  @Get('festivals/:slug')
  @ApiOperation({ summary: '文化圣日详情' })
  getFestival(@Param('slug') slug: string) {
    return this.festivals.getBySlug(slug);
  }

  @Get('seal-progress')
  @ApiOperation({ summary: '禅宗三十印印证进度 (仅 ZEN 用户)' })
  sealProgress(@CurrentUser('id') userId: string) {
    return this.service.getSealProgress(userId);
  }
}
