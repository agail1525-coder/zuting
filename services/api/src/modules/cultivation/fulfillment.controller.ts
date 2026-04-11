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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CultivationAccessGuard } from './guards/cultivation-access.guard';
import { FulfillmentService } from './fulfillment.service';
import { KarmaService } from './karma.service';
import {
  CoachKarmaDto,
  CreateKarmaEventDto,
  DebateDto,
  SetTraditionDto,
  StartJourneyDto,
  SubmitSealPracticeDto,
  SynthesizeDto,
  UpdateThreeLifeVisionDto,
  WisdomQueryDto,
} from './dto/fulfillment.dto';

@ApiTags('cultivation-fulfillment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CultivationAccessGuard)
@Controller('cultivation')
export class FulfillmentController {
  constructor(
    private readonly service: FulfillmentService,
    private readonly karma: KarmaService,
  ) {}

  // ── A1 罗盘 / Journey ──────────────────────────────────

  @Get('journey/me')
  @ApiOperation({ summary: '获取本人修行之路' })
  getJourney(@CurrentUser('id') userId: string) {
    return this.service.getOrCreateJourney(userId);
  }

  @Post('journey/start')
  @ApiOperation({ summary: '初始化 / 设置主修文化' })
  start(
    @CurrentUser('id') userId: string,
    @Body() dto: StartJourneyDto,
  ) {
    return this.service.startJourney(userId, dto);
  }

  @Patch('journey/tradition')
  @ApiOperation({ summary: '切换主修 / 融修' })
  setTradition(
    @CurrentUser('id') userId: string,
    @Body() dto: SetTraditionDto,
  ) {
    return this.service.setTradition(userId, dto);
  }

  @Get('compass')
  @ApiOperation({ summary: '罗盘今日指引' })
  compass(@CurrentUser('id') userId: string) {
    return this.service.getCompass(userId);
  }

  // ── A2 十牛图 ──────────────────────────────────────────

  @Get('ox-path')
  @ApiOperation({ summary: '十牛图当前进度' })
  oxPath(@CurrentUser('id') userId: string) {
    return this.service.getOxPath(userId);
  }

  @Post('ox-path/advance')
  @ApiOperation({ summary: '晋阶 (需满足条件)' })
  advance(@CurrentUser('id') userId: string) {
    return this.service.advanceOxStage(userId);
  }

  // ── A3 每日一印 ────────────────────────────────────────

  @Get('daily-seal/today')
  @ApiQuery({ name: 'session', required: false, enum: ['MORNING', 'EVENING'] })
  @ApiOperation({ summary: '今日推荐印' })
  todaySeal(
    @CurrentUser('id') userId: string,
    @Query('session') session = 'MORNING',
  ) {
    return this.service.getTodaySeal(userId, session);
  }

  @Post('daily-seal/practice')
  @ApiOperation({ summary: '提交印修打卡' })
  submitSeal(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitSealPracticeDto,
  ) {
    return this.service.submitSealPractice(userId, dto);
  }

  @Get('daily-seal/streak')
  @ApiOperation({ summary: '连击统计' })
  streak(@CurrentUser('id') userId: string) {
    return this.service.getStreak(userId);
  }

  // ── A4 融通问答 ────────────────────────────────────────

  @Post('wisdom/query')
  @Throttle({ default: { limit: 10, ttl: 3_600_000 } })
  @ApiOperation({ summary: '12 文化融通提问 (10/h)' })
  query(
    @CurrentUser('id') userId: string,
    @Body() dto: WisdomQueryDto,
  ) {
    return this.service.createWisdomQuery(userId, dto);
  }

  @Post('wisdom/synthesize')
  @ApiOperation({ summary: '融合所选答案' })
  synthesize(
    @CurrentUser('id') userId: string,
    @Body() dto: SynthesizeDto,
  ) {
    return this.service.synthesize(userId, dto);
  }

  @Post('wisdom/:id/debate')
  @Throttle({ default: { limit: 5, ttl: 3_600_000 } })
  @ApiOperation({ summary: '启动大师圆桌 (3 轮，5/h)' })
  debate(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: DebateDto,
  ) {
    return this.service.runDebate(userId, id, dto.rounds ?? 3);
  }

  @Get('wisdom/history')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  history(
    @CurrentUser('id') userId: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.service.listWisdomHistory(
      userId,
      parseInt(page, 10),
      parseInt(pageSize, 10),
    );
  }

  // ── A5 因缘日志 (小鸿觉门深度介入) ─────────────────────

  @Post('karma/coach')
  @ApiOperation({ summary: '写前引导 — 小鸿帮用户把零散想法理成结构化草稿' })
  coachKarma(
    @CurrentUser('id') userId: string,
    @Body() dto: CoachKarmaDto,
  ) {
    return this.karma.coachKarmaDraft(userId, dto);
  }

  @Post('karma/event')
  @ApiOperation({ summary: '记录因缘事件 (保存即触发小鸿多维度深度分析)' })
  createKarma(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateKarmaEventDto,
  ) {
    return this.karma.createKarmaEvent(userId, dto);
  }

  @Post('karma/event/:id/reanalyze')
  @ApiOperation({ summary: '重新分析 — 触发小鸿重新生成因果链与 12 传统引用' })
  reanalyzeKarma(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.karma.reanalyzeKarma(userId, id);
  }

  @Get('karma/timeline')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  karmaTimeline(
    @CurrentUser('id') userId: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.karma.listKarmaTimeline(
      userId,
      parseInt(page, 10),
      parseInt(pageSize, 10),
    );
  }

  @Get('karma/event/:id')
  getKarma(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.karma.getKarmaEvent(userId, id);
  }

  @Delete('karma/event/:id')
  deleteKarma(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.karma.deleteKarmaEvent(userId, id);
  }

  // ── A6 三生愿景 ────────────────────────────────────────

  @Get('three-lives')
  @ApiOperation({ summary: '三生愿景' })
  getThreeLives(@CurrentUser('id') userId: string) {
    return this.service.getThreeLives(userId);
  }

  @Put('three-lives')
  @ApiOperation({ summary: '保存三生愿景' })
  updateThreeLives(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateThreeLifeVisionDto,
  ) {
    return this.service.updateThreeLives(userId, dto);
  }

  // ── A7 活佛直播 ────────────────────────────────────────

  @Get('live-dharma/schedule')
  @ApiQuery({ name: 'date', required: false })
  @ApiOperation({ summary: '直播排期 (未来 7 日)' })
  liveSchedule(@Query('date') date?: string) {
    return this.service.listLiveSchedule(date);
  }
}
