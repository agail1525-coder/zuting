import {
  BadRequestException,
  ConflictException,
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
import { WisdomService } from './wisdom/wisdom.service';
import { DEFAULT_WISDOM_TRADITIONS, getMaster } from './wisdom/masters.constants';
import type { MasterAnswer, DebateTurn } from './wisdom/master-prompt.builder';
import { FIVE_HOUSES, getZenHouse, ZEN_HOUSE_CODES } from './ox-path/five-houses.constants';

const OX_STAGE_NAMES = [
  '寻牛', '见迹', '见牛', '得牛', '牧牛',
  '骑牛归家', '忘牛存人', '人牛俱忘', '返本还源', '入廛垂手',
];
const OX_STAGE_DESC = [
  '心猿意马，初心觅道',
  '略见踪迹，信心初生',
  '亲见本性，欣喜非常',
  '得遇真心，犹须调伏',
  '调伏渐熟，习气渐消',
  '心牛合一，自在归家',
  '牛去人在，能所未泯',
  '人牛俱忘，能所双绝',
  '返本还源，无修无证',
  '和光同尘，垂手入廛',
];

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly wisdomService: WisdomService,
  ) {}

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
    const house = getZenHouse(journey.zenHouse);
    return {
      currentStage: journey.oxStage,
      zenHouse: journey.zenHouse,
      house: house
        ? {
            code: house.code,
            name: house.name,
            founder: house.founder,
            motto: house.motto,
            introStyle: house.introStyle,
            color: house.color,
            emoji: house.emoji,
            signatureKoans: house.signatureKoans,
          }
        : null,
      stages: Array.from({ length: 10 }, (_, i) => ({
        stage: i + 1,
        name: OX_STAGE_NAMES[i],
        description: house ? house.stageTones[i] : OX_STAGE_DESC[i],
        unlocked: i + 1 <= journey.oxStage,
        current: i + 1 === journey.oxStage,
      })),
    };
  }

  async setZenHouse(userId: string, zenHouse: string | null) {
    if (zenHouse && !ZEN_HOUSE_CODES.includes(zenHouse)) {
      throw new BadRequestException('无效的宗风代码');
    }
    await this.getOrCreateJourney(userId);
    return this.prisma.fulfillmentJourney.update({
      where: { userId },
      data: { zenHouse: zenHouse ?? null },
    });
  }

  listZenHouses() {
    return Object.values(FIVE_HOUSES).map((h) => ({
      code: h.code,
      name: h.name,
      founder: h.founder,
      foundedEra: h.foundedEra,
      motto: h.motto,
      introStyle: h.introStyle,
      color: h.color,
      emoji: h.emoji,
    }));
  }

  async advanceOxStage(userId: string) {
    const journey = await this.getOrCreateJourney(userId);
    if (journey.oxStage >= 10) {
      throw new BadRequestException('已到圆融境');
    }
    if (journey.quizPassedStreak < 21) {
      throw new ForbiddenException({
        code: 'ADVANCE_LOCKED',
        message: `尚未满足晋阶条件：需连续通过 21 天禅修考核 (当前 ${journey.quizPassedStreak} 天)`,
        currentStreak: journey.quizPassedStreak,
        required: 21,
      });
    }
    const newStage = journey.oxStage + 1;
    const newRealm = this.oxToRealm(newStage);
    const result = await this.prisma.fulfillmentJourney.updateMany({
      where: { id: journey.id, oxStage: journey.oxStage },
      data: { oxStage: newStage, currentRealm: newRealm },
    });
    if (result.count === 0) {
      throw new ConflictException('晋阶已被其他会话更新,请刷新后重试');
    }
    return this.prisma.fulfillmentJourney.findUniqueOrThrow({ where: { userId } });
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
    const question = sanitize(dto.question)!;

    // 解析 traditions: 用户指定 → journey 配置 → 默认 6 位
    let traditions: string[] =
      dto.traditions && dto.traditions.length > 0
        ? dto.traditions
        : [journey.primaryTradition, ...journey.blendTraditions].filter(Boolean);
    if (traditions.length === 0) {
      traditions = [...DEFAULT_WISDOM_TRADITIONS];
    }
    // 去重 + 过滤未知 + 3-12 边界
    traditions = Array.from(new Set(traditions)).filter((t) => !!getMaster(t));
    if (traditions.length < 3) {
      for (const fallback of DEFAULT_WISDOM_TRADITIONS) {
        if (!traditions.includes(fallback)) traditions.push(fallback);
        if (traditions.length >= 3) break;
      }
    }
    if (traditions.length > 12) traditions = traditions.slice(0, 12);

    // 并行调用每位大师；单宗失败不影响整体
    const settled = await Promise.allSettled(
      traditions.map((t) => this.wisdomService.answerAsMaster(t, question)),
    );
    const answers: MasterAnswer[] = settled.map((r, idx) => {
      if (r.status === 'fulfilled') return r.value;
      const t = traditions[idx];
      return {
        tradition: t,
        masterName: this.masterName(t),
        answer: '此刻大师沉默不语，请稍后再问。',
        citations: [],
        keyPoints: [],
        status: 'FAILED',
      };
    });

    return this.prisma.wisdomQuery.create({
      data: {
        journeyId: journey.id,
        question,
        answers: answers as any,
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

    const chosen = new Set(dto.chosenTraditions);
    const rawAnswers = Array.isArray(query.answers) ? (query.answers as any[]) : [];
    const picked = rawAnswers
      .filter((a) => a && chosen.has(a.tradition) && a.status === 'OK')
      .map((a) => ({
        tradition: String(a.tradition),
        masterName: String(a.masterName ?? ''),
        answer: String(a.answer ?? ''),
      }));

    const synthesis = await this.wisdomService.synthesize(query.question, picked);

    return this.prisma.wisdomQuery.update({
      where: { id: dto.queryId },
      data: {
        chosenTrads: dto.chosenTraditions,
        synthesized: JSON.stringify(synthesis),
      },
    });
  }

  async runDebate(userId: string, queryId: string, rounds: number = 3) {
    const journey = await this.getOrCreateJourney(userId);
    const query = await this.prisma.wisdomQuery.findUnique({ where: { id: queryId } });
    if (!query) throw new NotFoundException('问答不存在');
    if (query.journeyId !== journey.id) {
      throw new ForbiddenException('IDOR: 不能启动他人的圆桌');
    }

    const rawAnswers = Array.isArray(query.answers) ? (query.answers as any[]) : [];
    const masters = rawAnswers
      .filter((a) => a && a.status === 'OK' && getMaster(a.tradition))
      .map((a) => ({
        tradition: String(a.tradition),
        masterName: String(a.masterName ?? ''),
      }));
    if (masters.length < 2) {
      throw new BadRequestException('至少需要 2 位答复成功的大师才能开启圆桌');
    }

    const maxRounds = Math.min(Math.max(rounds, 1), 3);
    // round 0: 以首轮答案作为初始上下文
    let lastTurnMap = new Map<string, string>(
      rawAnswers
        .filter((a) => a && a.status === 'OK')
        .map((a) => [String(a.tradition), String(a.answer ?? '')]),
    );

    const roundsOut: Array<{ round: number; turns: DebateTurn[] }> = [];
    for (let r = 1; r <= maxRounds; r++) {
      const settled = await Promise.allSettled(
        masters.map((m) => {
          const others = masters
            .filter((o) => o.tradition !== m.tradition)
            .map((o) => ({
              masterName: o.masterName,
              tradition: o.tradition,
              text: lastTurnMap.get(o.tradition) ?? '',
            }));
          return this.wisdomService.debateAsMaster(m.tradition, query.question, r, others);
        }),
      );
      const turns: DebateTurn[] = settled.map((s, i) =>
        s.status === 'fulfilled'
          ? s.value
          : {
              tradition: masters[i].tradition,
              masterName: masters[i].masterName,
              response: '此轮大师默然。',
              citations: [],
              repliesTo: [],
            },
      );
      roundsOut.push({ round: r, turns });
      lastTurnMap = new Map(turns.map((t) => [t.tradition, t.response]));
    }

    const debate = { rounds: roundsOut };
    return this.prisma.wisdomQuery.update({
      where: { id: queryId },
      data: { debate: debate as any },
    });
  }

  async listWisdomHistory(userId: string, page: number, pageSize: number) {
    const journey = await this.getOrCreateJourney(userId);
    const rawSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20;
    const take = Math.min(rawSize, 50);
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const skip = (safePage - 1) * take;
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
