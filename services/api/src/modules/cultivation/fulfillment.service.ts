import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Realm } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateKarmaEventDto,
  StartJourneyDto,
  SetTraditionDto,
  SubmitSealPracticeDto,
  SynthesizeDto,
  UpdateThreeLifeVisionDto,
  WisdomQueryDto,
} from './dto/fulfillment.dto';

const REALM_ORDER: Realm[] = [
  'AWAKENING',
  'CLARIFYING',
  'SEEING',
  'ATTAINING',
  'INTEGRATING',
  'RETURNING',
  'GIVING_BACK',
];

const sanitize = (s?: string | null) =>
  typeof s === 'string'
    ? s
        .replace(/<\s*\/?\s*(script|iframe|object|embed|style)[^>]*>/gi, '')
        .replace(/javascript:/gi, '')
        .slice(0, 5000)
    : s ?? null;

@Injectable()
export class FulfillmentService {
  constructor(private readonly prisma: PrismaService) {}

  // ── A1 罗盘 / Journey ──────────────────────────────────

  async getOrCreateJourney(userId: string) {
    const existing = await this.prisma.fulfillmentJourney.findUnique({
      where: { userId },
    });
    if (existing) return existing;
    return this.prisma.fulfillmentJourney.create({
      data: { userId, primaryTradition: 'ZEN', blendTraditions: [] },
    });
  }

  async startJourney(userId: string, dto: StartJourneyDto) {
    return this.prisma.fulfillmentJourney.upsert({
      where: { userId },
      create: {
        userId,
        primaryTradition: dto.primaryTradition ?? 'ZEN',
        blendTraditions: dto.blendTraditions ?? [],
      },
      update: {
        primaryTradition: dto.primaryTradition ?? undefined,
        blendTraditions: dto.blendTraditions ?? undefined,
      },
    });
  }

  async setTradition(userId: string, dto: SetTraditionDto) {
    return this.prisma.fulfillmentJourney.update({
      where: { userId },
      data: {
        primaryTradition: dto.primaryTradition,
        blendTraditions: dto.blendTraditions ?? undefined,
      },
    });
  }

  async getCompass(userId: string) {
    const journey = await this.getOrCreateJourney(userId);
    const mapping = await this.prisma.oxCultureMapping.findFirst({
      where: {
        realmId: REALM_ORDER.indexOf(journey.currentRealm) + 1,
        tradition: journey.primaryTradition,
      },
    });
    // 今日步骤是骨架, 真实内容由 Wave 2 内容种子驱动
    const todaySteps = [
      { id: 'morning-meditation', title: '晨课禅坐 10 分钟', kind: 'MEDITATION', completed: false },
      { id: 'daily-seal', title: '今日一印', kind: 'SEAL', completed: !!journey.lastSealAt && this.isSameDay(journey.lastSealAt) },
      { id: 'karma-journal', title: '记一件因缘', kind: 'JOURNAL', completed: false },
    ];
    return {
      journey,
      currentSymbol: mapping
        ? {
            symbolName: mapping.symbolName,
            originalText: mapping.originalText,
            source: mapping.source,
          }
        : null,
      todaySteps,
      streakDays: journey.streakDays,
    };
  }

  // ── A2 十牛图 ──────────────────────────────────────────

  async getOxPath(userId: string) {
    const journey = await this.getOrCreateJourney(userId);
    return {
      currentStage: journey.oxStage,
      stages: Array.from({ length: 10 }, (_, i) => ({
        stage: i + 1,
        unlocked: i + 1 <= journey.oxStage,
        current: i + 1 === journey.oxStage,
      })),
    };
  }

  async advanceOxStage(userId: string) {
    const journey = await this.getOrCreateJourney(userId);
    if (journey.oxStage >= 10) {
      throw new BadRequestException('已到圆融境');
    }
    // 简化条件: 至少 21 天连击
    if (journey.streakDays < 21) {
      throw new ForbiddenException({
        code: 'ADVANCE_LOCKED',
        message: '尚未满足晋阶条件 (21 天连击)',
        currentStreak: journey.streakDays,
      });
    }
    const newStage = journey.oxStage + 1;
    const newRealm = this.oxToRealm(newStage);
    return this.prisma.fulfillmentJourney.update({
      where: { userId },
      data: { oxStage: newStage, currentRealm: newRealm },
    });
  }

  private oxToRealm(stage: number): Realm {
    if (stage <= 1) return 'AWAKENING';
    if (stage <= 2) return 'CLARIFYING';
    if (stage <= 3) return 'SEEING';
    if (stage <= 5) return 'ATTAINING';
    if (stage <= 7) return 'INTEGRATING';
    if (stage <= 9) return 'RETURNING';
    return 'GIVING_BACK';
  }

  // ── A3 每日一印 ────────────────────────────────────────

  async getTodaySeal(userId: string, session: string) {
    const journey = await this.getOrCreateJourney(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await this.prisma.dailySealPractice.findUnique({
      where: {
        journeyId_practiceDate_session: {
          journeyId: journey.id,
          practiceDate: today,
          session,
        },
      },
    });
    return {
      session,
      practice: existing,
      // 实际 sealId 推荐由 Wave 5 推荐算法填充
      recommendedSealId: 'seal-mvp-1',
      tradition: journey.primaryTradition,
    };
  }

  async submitSealPractice(userId: string, dto: SubmitSealPracticeDto) {
    const journey = await this.getOrCreateJourney(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dto.audioListenedSec < 60) {
      throw new BadRequestException('音频未听完, 不可打卡');
    }
    const practice = await this.prisma.dailySealPractice.upsert({
      where: {
        journeyId_practiceDate_session: {
          journeyId: journey.id,
          practiceDate: today,
          session: dto.session,
        },
      },
      create: {
        journeyId: journey.id,
        sealId: dto.sealId,
        tradition: journey.primaryTradition,
        practiceDate: today,
        session: dto.session,
        audioListenedSec: dto.audioListenedSec,
        reflection: sanitize(dto.reflection),
        status: 'DONE',
      },
      update: {
        audioListenedSec: dto.audioListenedSec,
        reflection: sanitize(dto.reflection),
        status: 'DONE',
      },
    });
    // 更新 streak
    const isNewDay =
      !journey.lastSealAt || !this.isSameDay(journey.lastSealAt);
    if (isNewDay) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday =
        journey.lastSealAt && this.isSameDay(journey.lastSealAt, yesterday);
      await this.prisma.fulfillmentJourney.update({
        where: { id: journey.id },
        data: {
          streakDays: wasYesterday ? journey.streakDays + 1 : 1,
          lastSealAt: new Date(),
          karmaPoints: { increment: 10 },
        },
      });
    }
    return practice;
  }

  async getStreak(userId: string) {
    const journey = await this.getOrCreateJourney(userId);
    return {
      streakDays: journey.streakDays,
      lastSealAt: journey.lastSealAt,
      karmaPoints: journey.karmaPoints,
    };
  }

  // ── A4 融通问答 ────────────────────────────────────────

  async createWisdomQuery(userId: string, dto: WisdomQueryDto) {
    const journey = await this.getOrCreateJourney(userId);
    const traditions =
      dto.traditions && dto.traditions.length > 0
        ? dto.traditions
        : [journey.primaryTradition, ...journey.blendTraditions];
    // Wave 1: 占位答案; Wave 2 接小鸿 LLM
    const answers = traditions.map((t) => ({
      tradition: t,
      masterName: this.masterName(t),
      answer: `[${t} 视角的答案占位 — Wave 2 接入小鸿 LLM]`,
      citations: [],
      status: 'PLACEHOLDER',
    }));
    return this.prisma.wisdomQuery.create({
      data: {
        journeyId: journey.id,
        question: sanitize(dto.question)!,
        answers,
        chosenTrads: [],
      },
    });
  }

  async synthesize(userId: string, dto: SynthesizeDto) {
    const journey = await this.getOrCreateJourney(userId);
    const query = await this.prisma.wisdomQuery.findUnique({
      where: { id: dto.queryId },
    });
    if (!query) throw new NotFoundException('问答不存在');
    if (query.journeyId !== journey.id) {
      throw new ForbiddenException('IDOR: 不能融合他人的问答');
    }
    return this.prisma.wisdomQuery.update({
      where: { id: dto.queryId },
      data: {
        chosenTrads: dto.chosenTraditions,
        synthesized: '[融合答案 — Wave 2 接入小鸿]',
      },
    });
  }

  async listWisdomHistory(userId: string, page: number, pageSize: number) {
    const journey = await this.getOrCreateJourney(userId);
    const take = Math.min(pageSize, 50);
    const skip = (page - 1) * take;
    const [items, total] = await Promise.all([
      this.prisma.wisdomQuery.findMany({
        where: { journeyId: journey.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.wisdomQuery.count({ where: { journeyId: journey.id } }),
    ]);
    return { items, total, page, pageSize: take };
  }

  // ── A5 因缘日志 ────────────────────────────────────────

  async createKarmaEvent(userId: string, dto: CreateKarmaEventDto) {
    const journey = await this.getOrCreateJourney(userId);
    return this.prisma.karmaEvent.create({
      data: {
        journeyId: journey.id,
        title: sanitize(dto.title)!,
        body: sanitize(dto.body)!,
        eventAt: new Date(dto.eventAt),
        visibility: dto.visibility ?? 'PRIVATE',
        // Wave 2: 接入 NLP pipeline 自动标注
        aiRealmTag: null,
        aiCauseTag: null,
        aiEffectTag: null,
        aiAdvice: null,
        aiConfidence: null,
      },
    });
  }

  async listKarmaTimeline(userId: string, page: number, pageSize: number) {
    const journey = await this.getOrCreateJourney(userId);
    const take = Math.min(pageSize, 50);
    const skip = (page - 1) * take;
    const [items, total] = await Promise.all([
      this.prisma.karmaEvent.findMany({
        where: { journeyId: journey.id },
        orderBy: { eventAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.karmaEvent.count({ where: { journeyId: journey.id } }),
    ]);
    return { items, total, page, pageSize: take };
  }

  async getKarmaEvent(userId: string, id: string) {
    const journey = await this.getOrCreateJourney(userId);
    const event = await this.prisma.karmaEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('因缘事件不存在');
    if (event.journeyId !== journey.id) {
      throw new ForbiddenException('IDOR: 不能查看他人的因缘');
    }
    return event;
  }

  async deleteKarmaEvent(userId: string, id: string) {
    await this.getKarmaEvent(userId, id); // 校验归属
    return this.prisma.karmaEvent.delete({ where: { id } });
  }

  // ── A6 三生愿景 ────────────────────────────────────────

  async getThreeLives(userId: string) {
    return this.prisma.threeLifeVision.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async updateThreeLives(userId: string, dto: UpdateThreeLifeVisionDto) {
    return this.prisma.threeLifeVision.upsert({
      where: { userId },
      create: {
        userId,
        personalGoal: sanitize(dto.personalGoal),
        familyGoal: sanitize(dto.familyGoal),
        businessGoal: sanitize(dto.businessGoal),
      },
      update: {
        personalGoal: sanitize(dto.personalGoal),
        familyGoal: sanitize(dto.familyGoal),
        businessGoal: sanitize(dto.businessGoal),
        reviewedAt: new Date(),
      },
    });
  }

  // ── A7 活佛直播 ────────────────────────────────────────

  async listLiveSchedule(date?: string) {
    const start = date ? new Date(date) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return this.prisma.dharmaLiveSession.findMany({
      where: { startAt: { gte: start, lt: end } },
      orderBy: { startAt: 'asc' },
      take: 50,
    });
  }

  // ── helpers ────────────────────────────────────────────

  private isSameDay(a: Date, b: Date = new Date()): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private masterName(tradition: string): string {
    const map: Record<string, string> = {
      ZEN: '惠能',
      TAOISM: '老子',
      CONFUCIANISM: '孔子',
      TIBETAN: '莲花生',
      HINDUISM: '商羯罗',
      SIKHISM: '那纳克',
      CHRISTIANITY: '耶稣',
      JUDAISM: '摩西',
      ISLAM: '穆罕默德',
      BAHAI: '巴哈欧拉',
      SHINTO: '天照大神',
      INDIGENOUS: '部落长老',
    };
    return map[tradition] ?? '佚名';
  }
}
