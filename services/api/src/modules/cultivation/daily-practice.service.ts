import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { FestivalService } from './festival.service';
import {
  ApplyTemplateDto,
  LogSlotDto,
  UpdateScheduleDto,
  UpsertSlotDto,
} from './dto/daily-practice.dto';

const DISCLAIMER =
  '本模板为公开文献整理所得, 仅供参考。具体仪规请以您所在道场/教会/导师指导为准。若发现错误, 请在"关于"页反馈。';

const sanitize = (s?: string | null) =>
  typeof s === 'string'
    ? s
        .replace(/<\s*\/?\s*(script|iframe|object|embed|style)[^>]*>/gi, '')
        .replace(/javascript:/gi, '')
        .slice(0, 3000)
    : s ?? null;

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const wrapped = ((total % 1440) + 1440) % 1440;
  const hh = Math.floor(wrapped / 60)
    .toString()
    .padStart(2, '0');
  const mm = (wrapped % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

@Injectable()
export class DailyPracticeService {
  private readonly logger = new Logger(DailyPracticeService.name);
  private readonly llmBaseUrl: string;
  private readonly llmApiKey: string;
  private readonly llmModel: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly festivals: FestivalService,
  ) {
    this.llmBaseUrl = this.config.get<string>('LLM_BASE_URL', '');
    this.llmApiKey = this.config.get<string>('LLM_API_KEY', '');
    this.llmModel = this.config.get<string>('LLM_MODEL', 'qwen2.5-32b-instruct');
  }

  private get isLLMEnabled(): boolean {
    return !!this.llmBaseUrl;
  }

  // ── 读 / 初始化 ─────────────────────────────────

  async getOrInitPractice(userId: string) {
    const journey = await this.getOrCreateJourney(userId);
    const existing = await this.prisma.dailyPractice.findUnique({
      where: { journeyId: journey.id },
      include: {
        slots: { where: { isActive: true }, orderBy: [{ time: 'asc' }, { sortOrder: 'asc' }] },
      },
    });
    if (existing && existing.slots.length > 0) return existing;

    // 首次初始化: 根据 journey.primaryTradition seed slots
    const tradition = journey.primaryTradition || 'ZEN';
    const wakeTime = existing?.wakeTime ?? '05:30';
    const sleepTime = existing?.sleepTime ?? '22:00';

    const practice =
      existing ??
      (await this.prisma.dailyPractice.create({
        data: {
          journeyId: journey.id,
          tradition,
          wakeTime,
          sleepTime,
          reminderEnabled: true,
          reminderLeadMin: 15,
        },
      }));

    await this.seedSlotsFromTemplates(practice.id, tradition, wakeTime, sleepTime);

    return this.prisma.dailyPractice.findUnique({
      where: { id: practice.id },
      include: {
        slots: { where: { isActive: true }, orderBy: [{ time: 'asc' }, { sortOrder: 'asc' }] },
      },
    });
  }

  async getTimeline(userId: string, dateStr?: string) {
    const practice = await this.getOrInitPractice(userId);
    if (!practice) throw new NotFoundException('功课表未初始化');
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setHours(0, 0, 0, 0);
    const todayLogs = await this.prisma.dailyPracticeLog.findMany({
      where: { practiceId: practice.id, practiceDate: date },
      orderBy: { completedAt: 'desc' },
    });
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const slots = (practice as any).slots ?? [];
    let currentSlot: any = null;
    let nextSlot: any = null;
    for (const s of slots) {
      const m = toMinutes(s.time);
      if (m <= nowMin && m + s.durationMin >= nowMin) currentSlot = s;
      if (m > nowMin && !nextSlot) nextSlot = s;
    }
    const dateOnly = date.toISOString().slice(0, 10);
    const festivals = await this.festivals
      .listByDate(dateOnly, practice.tradition)
      .catch(() => []);
    const sealProgress =
      practice.tradition === 'ZEN'
        ? await this.getSealProgress(userId, date).catch(() => null)
        : null;
    return {
      practice: {
        id: practice.id,
        tradition: practice.tradition,
        wakeTime: practice.wakeTime,
        sleepTime: practice.sleepTime,
        reminderEnabled: practice.reminderEnabled,
        reminderLeadMin: practice.reminderLeadMin,
        disclaimer: DISCLAIMER,
      },
      slots,
      todayLogs,
      currentSlot,
      nextSlot,
      festivals,
      sealProgress,
    };
  }

  // ── 三十印印证进度 (仅 ZEN) ─────────────────────

  async getSealProgress(userId: string, onDate?: Date) {
    const journey = await this.getOrCreateJourney(userId);
    if (journey.primaryTradition !== 'ZEN') {
      return null;
    }
    const day = journey.currentSealDay ?? 0;
    const total = 21;
    const sealId = journey.currentSealId ?? 1;
    if (sealId > 30) {
      return {
        seal: null,
        day: 0,
        total,
        todayDone: false,
        graduated: true,
      };
    }
    const seal = await this.prisma.seal.findUnique({ where: { id: sealId } });
    if (!seal) {
      return {
        seal: null,
        day,
        total,
        todayDone: false,
        graduated: false,
      };
    }
    const checkDate = onDate ? new Date(onDate) : new Date();
    checkDate.setHours(0, 0, 0, 0);
    const practice = await this.prisma.dailyPractice.findFirst({
      where: { journeyId: journey.id },
      select: { id: true },
    });
    const todayDone = practice
      ? (await this.prisma.dailyPracticeLog.count({
          where: {
            practiceId: practice.id,
            practiceDate: checkDate,
            sealId: { not: null },
          },
        })) > 0
      : false;
    return {
      seal: {
        id: seal.id,
        name: seal.name,
        series: seal.series,
        poem: seal.poem,
        essence: seal.essence,
        practice: seal.practice,
        vow: seal.vow,
        color: seal.color,
      },
      day,
      total,
      todayDone,
      graduated: false,
    };
  }

  // ── 改 ─────────────────────────────────────────

  async updateSchedule(userId: string, dto: UpdateScheduleDto) {
    const practice = await this.getOrInitPractice(userId);
    if (!practice) throw new NotFoundException();
    return this.prisma.dailyPractice.update({
      where: { id: practice.id },
      data: {
        ...(dto.wakeTime !== undefined ? { wakeTime: dto.wakeTime } : {}),
        ...(dto.sleepTime !== undefined ? { sleepTime: dto.sleepTime } : {}),
        ...(dto.reminderEnabled !== undefined ? { reminderEnabled: dto.reminderEnabled } : {}),
        ...(dto.reminderLeadMin !== undefined ? { reminderLeadMin: dto.reminderLeadMin } : {}),
        lastSyncAt: new Date(),
      },
    });
  }

  async upsertSlot(userId: string, dto: UpsertSlotDto, slotId?: string) {
    const practice = await this.getOrInitPractice(userId);
    if (!practice) throw new NotFoundException();
    if (slotId) {
      const existing = await this.prisma.dailyPracticeSlot.findUnique({ where: { id: slotId } });
      if (!existing) throw new NotFoundException('功课槽位不存在');
      if (existing.practiceId !== practice.id) {
        throw new ForbiddenException('IDOR: 不能修改他人功课');
      }
      return this.prisma.dailyPracticeSlot.update({
        where: { id: slotId },
        data: {
          time: dto.time,
          durationMin: dto.durationMin,
          kind: dto.kind,
          title: sanitize(dto.title)!,
          description: sanitize(dto.description),
          templateId: dto.templateId,
          scriptureSlug: dto.scriptureSlug,
          repetitions: dto.repetitions,
          sourceRef: sanitize(dto.sourceRef),
          sortOrder: dto.sortOrder ?? 0,
        },
      });
    }
    return this.prisma.dailyPracticeSlot.create({
      data: {
        practiceId: practice.id,
        time: dto.time,
        durationMin: dto.durationMin,
        kind: dto.kind,
        title: sanitize(dto.title)!,
        description: sanitize(dto.description),
        templateId: dto.templateId,
        scriptureSlug: dto.scriptureSlug,
        repetitions: dto.repetitions,
        sourceRef: sanitize(dto.sourceRef),
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async deleteSlot(userId: string, slotId: string) {
    const practice = await this.getOrInitPractice(userId);
    if (!practice) throw new NotFoundException();
    const existing = await this.prisma.dailyPracticeSlot.findUnique({ where: { id: slotId } });
    if (!existing) throw new NotFoundException();
    if (existing.practiceId !== practice.id) {
      throw new ForbiddenException('IDOR: 不能删除他人功课');
    }
    return this.prisma.dailyPracticeSlot.update({
      where: { id: slotId },
      data: { isActive: false },
    });
  }

  // ── 打卡 ────────────────────────────────────────

  async logSlotCompletion(userId: string, slotId: string, dto: LogSlotDto) {
    const practice = await this.getOrInitPractice(userId);
    if (!practice) throw new NotFoundException();
    const slot = await this.prisma.dailyPracticeSlot.findUnique({ where: { id: slotId } });
    if (!slot) throw new NotFoundException('槽位不存在');
    if (slot.practiceId !== practice.id) {
      throw new ForbiddenException('IDOR: 不能打卡他人功课');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cleanTags = Array.isArray(dto.tags)
      ? dto.tags
          .map((t) => String(t ?? '').trim().slice(0, 24))
          .filter((t) => t.length > 0)
          .slice(0, 10)
      : [];

    // 三十印印证: 仅 ZEN 主修, 且感悟 ≥ 10 字, 且用户未明确跳过
    const journey = await this.prisma.fulfillmentJourney.findFirst({
      where: { userId },
    });
    const isZen = journey?.primaryTradition === 'ZEN';
    const reflectionText = (dto.reflection ?? '').trim();
    const eligibleForSeal =
      isZen && !dto.skipSealCredit && reflectionText.length >= 10 && journey;

    let sealIdForLog: number | null = null;
    let sealDayNumForLog: number | null = null;
    if (eligibleForSeal && journey) {
      const curSealId = journey.currentSealId ?? 1;
      const curSealDay = journey.currentSealDay ?? 0;
      if (curSealId <= 30) {
        const alreadySealedToday = await this.prisma.dailyPracticeLog.findFirst({
          where: {
            practiceId: practice.id,
            practiceDate: today,
            sealId: { not: null },
          },
        });
        if (!alreadySealedToday) {
          const nextDay = curSealDay + 1;
          if (nextDay >= 21) {
            // 本印圆满, 推进到下一印
            sealIdForLog = curSealId;
            sealDayNumForLog = 21;
            await this.prisma.fulfillmentJourney.update({
              where: { id: journey.id },
              data: {
                currentSealId: curSealId + 1,
                currentSealDay: 0,
                sealStartedAt: new Date(),
              },
            });
          } else {
            sealIdForLog = curSealId;
            sealDayNumForLog = nextDay;
            await this.prisma.fulfillmentJourney.update({
              where: { id: journey.id },
              data: {
                currentSealDay: nextDay,
                sealStartedAt: journey.sealStartedAt ?? new Date(),
              },
            });
          }
        }
      }
    }

    const log = await this.prisma.dailyPracticeLog.upsert({
      where: {
        practiceId_slotId_practiceDate: {
          practiceId: practice.id,
          slotId,
          practiceDate: today,
        },
      },
      create: {
        practiceId: practice.id,
        slotId,
        practiceDate: today,
        durationSec: dto.durationSec,
        repetitionsDone: dto.repetitionsDone,
        reflection: sanitize(dto.reflection),
        status: dto.status ?? 'DONE',
        tags: cleanTags,
        sealId: sealIdForLog,
        sealDayNum: sealDayNumForLog,
      },
      update: {
        durationSec: dto.durationSec,
        repetitionsDone: dto.repetitionsDone,
        reflection: sanitize(dto.reflection),
        status: dto.status ?? 'DONE',
        tags: cleanTags,
        ...(sealIdForLog !== null ? { sealId: sealIdForLog, sealDayNum: sealDayNumForLog } : {}),
      },
    });

    // 顺带更新 journey streak (复用旧 lastSealAt 字段为统一打卡时间)
    const streakJourney = journey;
    if (streakJourney) {
      const isNewDay =
        !streakJourney.lastSealAt ||
        new Date(streakJourney.lastSealAt).setHours(0, 0, 0, 0) !== today.getTime();
      if (isNewDay) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday =
          streakJourney.lastSealAt &&
          new Date(streakJourney.lastSealAt).setHours(0, 0, 0, 0) === yesterday.getTime();
        await this.prisma.fulfillmentJourney.update({
          where: { id: streakJourney.id },
          data: {
            streakDays: wasYesterday ? streakJourney.streakDays + 1 : 1,
            lastSealAt: new Date(),
            karmaPoints: { increment: 5 },
          },
        });
      }
    }

    // 异步生成小鸿鼓励 (不阻塞)
    this.generateEncouragement(slot.title, dto.reflection ?? '')
      .then((text) => {
        if (!text) return;
        return this.prisma.dailyPracticeLog.update({
          where: { id: log.id },
          data: { aiEncouragement: text },
        });
      })
      .catch((err) => this.logger.warn(`encouragement failed: ${(err as Error).message}`));

    return log;
  }

  // ── 模板 ────────────────────────────────────────

  async listLiturgyTemplates(tradition?: string, session?: string) {
    return this.prisma.liturgyTemplate.findMany({
      where: {
        ...(tradition ? { tradition } : {}),
        ...(session ? { session } : {}),
      },
      include: {
        steps: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: [{ tradition: 'asc' }, { session: 'asc' }, { sortOrder: 'asc' }],
      take: 100,
    });
  }

  async applyTemplate(userId: string, dto: ApplyTemplateDto) {
    const practice = await this.getOrInitPractice(userId);
    if (!practice) throw new NotFoundException();
    const template = await this.prisma.liturgyTemplate.findUnique({
      where: { id: dto.templateId },
      include: { steps: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!template) throw new NotFoundException('礼仪模板不存在');

    // 删除该 session 下已有 slots (软删)
    const sessionKindMap: Record<string, string> = {
      MORNING: 'MORNING_LITURGY',
      EVENING: 'EVENING_LITURGY',
      MIDDAY: 'NOON_CHANT',
      NIGHT: 'EVENING_LITURGY',
      CUSTOM: 'CUSTOM',
    };
    const kind = sessionKindMap[dto.session] ?? 'CUSTOM';
    await this.prisma.dailyPracticeSlot.updateMany({
      where: { practiceId: practice.id, kind },
      data: { isActive: false },
    });

    // 创建新 slot, 每步作为 description 的一行
    const startTime =
      dto.startTime ??
      (dto.session === 'MORNING'
        ? practice.wakeTime
        : dto.session === 'EVENING' || dto.session === 'NIGHT'
        ? addMinutes(practice.sleepTime, -60)
        : '12:00');

    const description = template.steps
      .map((s, i) => {
        const reps = s.defaultRepetitions ? ` ×${s.defaultRepetitions}` : '';
        const dur = s.defaultDurationMin ? ` (${s.defaultDurationMin}分)` : '';
        return `${i + 1}. ${s.title}${reps}${dur}`;
      })
      .join('\n');

    return this.prisma.dailyPracticeSlot.create({
      data: {
        practiceId: practice.id,
        time: startTime,
        durationMin: template.suggestedDurationMin ?? 30,
        kind,
        title: template.title,
        description,
        templateId: template.id,
        sourceRef: template.source,
        sortOrder: 0,
      },
    });
  }

  // ── 小鸿学伴 ────────────────────────────────────

  async coachSlot(userId: string, slotId: string) {
    const practice = await this.getOrInitPractice(userId);
    if (!practice) throw new NotFoundException();
    const slot = await this.prisma.dailyPracticeSlot.findUnique({
      where: { id: slotId },
    });
    if (!slot) throw new NotFoundException();
    if (slot.practiceId !== practice.id) {
      throw new ForbiddenException('IDOR');
    }

    // 拉模板步骤作为上下文
    let steps: Array<{ title: string; description?: string | null; defaultRepetitions?: number | null }> = [];
    if (slot.templateId) {
      const template = await this.prisma.liturgyTemplate.findUnique({
        where: { id: slot.templateId },
        include: { steps: { orderBy: { sortOrder: 'asc' } } },
      });
      if (template) steps = template.steps;
    }

    if (!this.isLLMEnabled) {
      return this.fallbackCoach(slot, steps);
    }

    const systemPrompt = `你是小鸿，佳绩之旅的修行学伴。用户正准备进行一场功课，请以学伴身份陪伴他完成整个流程。
严格以 JSON 格式输出，不要任何 markdown 代码块或额外文本。结构:
{
  "intro": "60字内的开场，温柔提醒身心准备",
  "stepGuidance": [
    {"text": "对每一步的引导词 40-80 字", "sec": 建议停留秒数}
  ],
  "dedicationText": "本场功课结束时的回向词 60-120 字",
  "reflectionQuestion": "一个帮助用户自省的开放式问题 30 字内"
}
要求:
- 语气温柔清晰，第一人称，禁止说教或传教
- 尊重用户的修行传统，不评判其他传统
- 若步骤为空，请基于 slot 标题生成 3-5 步通用引导
- 不编造不存在的经文原文`;

    const stepCtx = steps
      .map((s, i) => `${i + 1}. ${s.title}${s.defaultRepetitions ? ` ×${s.defaultRepetitions}` : ''}`)
      .join('\n');

    const userPrompt = [
      `[功课标题] ${slot.title}`,
      `[类型] ${slot.kind}`,
      `[时长] ${slot.durationMin} 分钟`,
      slot.description ? `[描述]\n${slot.description}` : '',
      stepCtx ? `[步骤]\n${stepCtx}` : '',
      slot.sourceRef ? `[出处] ${slot.sourceRef}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const response = await fetch(`${this.llmBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.llmApiKey ? { Authorization: `Bearer ${this.llmApiKey}` } : {}),
        },
        body: JSON.stringify({
          model: this.llmModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1500,
          temperature: 0.7,
          stream: false,
          chat_template_kwargs: { enable_thinking: false },
        }),
        signal: AbortSignal.timeout(120_000),
      });
      if (!response.ok) throw new Error(`LLM ${response.status}`);
      const data = (await response.json()) as any;
      const content: string = data?.choices?.[0]?.message?.content ?? '';
      const parsed = this.tryParseJson(content);
      if (!parsed || typeof parsed.intro !== 'string') {
        return this.fallbackCoach(slot, steps);
      }
      const stepGuidance = Array.isArray(parsed.stepGuidance)
        ? parsed.stepGuidance
            .filter((g: any) => g && typeof g.text === 'string')
            .slice(0, 12)
            .map((g: any) => ({
              text: String(g.text).slice(0, 400),
              sec: typeof g.sec === 'number' ? Math.min(Math.max(g.sec, 5), 1800) : 60,
            }))
        : [];
      return {
        intro: String(parsed.intro).slice(0, 300),
        stepGuidance,
        dedicationText: typeof parsed.dedicationText === 'string'
          ? parsed.dedicationText.slice(0, 500)
          : '',
        reflectionQuestion: typeof parsed.reflectionQuestion === 'string'
          ? parsed.reflectionQuestion.slice(0, 200)
          : '',
        source: 'llm' as const,
      };
    } catch (err) {
      this.logger.warn(`coachSlot LLM failed: ${(err as Error).message}`);
      return this.fallbackCoach(slot, steps);
    }
  }

  private fallbackCoach(
    slot: { title: string; kind: string; durationMin: number; description?: string | null },
    steps: Array<{ title: string; description?: string | null; defaultRepetitions?: number | null }>,
  ) {
    const guidance = (steps.length > 0
      ? steps
      : [
          { title: '调身安坐', description: null, defaultRepetitions: null },
          { title: slot.title, description: null, defaultRepetitions: null },
          { title: '回向', description: null, defaultRepetitions: null },
        ]
    ).map((s, i) => ({
      text: `第 ${i + 1} 步: ${s.title}${s.defaultRepetitions ? ` (${s.defaultRepetitions} 遍)` : ''}。请专注当下, 缓慢呼吸。`,
      sec: Math.max(30, Math.floor((slot.durationMin * 60) / Math.max(steps.length || 3, 3))),
    }));
    return {
      intro: `亲爱的朋友, 让我们一起开始「${slot.title}」这堂功课。先深呼吸三次, 把外界的喧嚣放在门外。`,
      stepGuidance: guidance,
      dedicationText: '愿此功课功德, 回向给一切有情, 愿大家离苦得乐, 愿世界和平安宁。',
      reflectionQuestion: '做完这堂功课, 你的心有什么不同?',
      source: 'fallback' as const,
    };
  }

  private async generateEncouragement(slotTitle: string, reflection: string): Promise<string | null> {
    if (!this.isLLMEnabled) {
      return `${slotTitle} 已完成, 这一份坚持本身就是修行。`;
    }
    try {
      const response = await fetch(`${this.llmBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.llmApiKey ? { Authorization: `Bearer ${this.llmApiKey}` } : {}),
        },
        body: JSON.stringify({
          model: this.llmModel,
          messages: [
            {
              role: 'system',
              content: '你是小鸿，佳绩之旅的修行学伴。用户刚完成一场功课。请用 40 字内的一句温柔鼓励回应他, 禁止 markdown, 只要一句中文。',
            },
            {
              role: 'user',
              content: `功课: ${slotTitle}\n心得: ${reflection || '（未写心得）'}`,
            },
          ],
          max_tokens: 200,
          temperature: 0.8,
          stream: false,
          chat_template_kwargs: { enable_thinking: false },
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) return null;
      const data = (await response.json()) as any;
      const content: string = data?.choices?.[0]?.message?.content ?? '';
      return content.trim().slice(0, 200) || null;
    } catch {
      return null;
    }
  }

  async getStreak(userId: string) {
    const journey = await this.getOrCreateJourney(userId);
    const practice = await this.getOrInitPractice(userId);
    const totalLogs = practice
      ? await this.prisma.dailyPracticeLog.count({ where: { practiceId: practice.id } })
      : 0;
    return {
      streakDays: journey.streakDays,
      lastPracticeAt: journey.lastSealAt,
      karmaPoints: journey.karmaPoints,
      totalLogs,
    };
  }

  // ── helpers ────────────────────────────────────

  private async seedSlotsFromTemplates(
    practiceId: string,
    tradition: string,
    wakeTime: string,
    sleepTime: string,
  ) {
    const templates = await this.prisma.liturgyTemplate.findMany({
      where: { tradition, isOfficial: true },
      include: { steps: { orderBy: { sortOrder: 'asc' } } },
      orderBy: [{ session: 'asc' }, { sortOrder: 'asc' }],
    });
    if (templates.length === 0) return;

    const byCategory = new Map<string, (typeof templates)[number]>();
    for (const t of templates) {
      const key = t.session;
      if (!byCategory.has(key)) byCategory.set(key, t);
    }

    const morning = byCategory.get('MORNING');
    const evening = byCategory.get('EVENING');
    const midday = byCategory.get('MIDDAY');
    const night = byCategory.get('NIGHT');

    const slotsToCreate: Array<{
      time: string;
      durationMin: number;
      kind: string;
      title: string;
      description: string;
      templateId: string;
      sourceRef: string;
      sortOrder: number;
    }> = [];

    const buildDesc = (t: (typeof templates)[number]) =>
      t.steps
        .map((s, i) => {
          const reps = s.defaultRepetitions ? ` ×${s.defaultRepetitions}` : '';
          const dur = s.defaultDurationMin ? ` (${s.defaultDurationMin}分)` : '';
          return `${i + 1}. ${s.title}${reps}${dur}`;
        })
        .join('\n');

    if (morning) {
      slotsToCreate.push({
        time: wakeTime,
        durationMin: morning.suggestedDurationMin ?? 30,
        kind: 'MORNING_LITURGY',
        title: morning.title,
        description: buildDesc(morning),
        templateId: morning.id,
        sourceRef: morning.source,
        sortOrder: 0,
      });
    }
    if (midday) {
      slotsToCreate.push({
        time: '12:00',
        durationMin: midday.suggestedDurationMin ?? 15,
        kind: 'NOON_CHANT',
        title: midday.title,
        description: buildDesc(midday),
        templateId: midday.id,
        sourceRef: midday.source,
        sortOrder: 0,
      });
    }
    if (evening) {
      slotsToCreate.push({
        time: addMinutes(sleepTime, -(evening.suggestedDurationMin ?? 30) - 30),
        durationMin: evening.suggestedDurationMin ?? 30,
        kind: 'EVENING_LITURGY',
        title: evening.title,
        description: buildDesc(evening),
        templateId: evening.id,
        sourceRef: evening.source,
        sortOrder: 0,
      });
    }
    if (night && !evening) {
      slotsToCreate.push({
        time: addMinutes(sleepTime, -30),
        durationMin: night.suggestedDurationMin ?? 20,
        kind: 'EVENING_LITURGY',
        title: night.title,
        description: buildDesc(night),
        templateId: night.id,
        sourceRef: night.source,
        sortOrder: 0,
      });
    }

    if (slotsToCreate.length === 0) return;
    await this.prisma.dailyPracticeSlot.createMany({
      data: slotsToCreate.map((s) => ({ practiceId, ...s })),
    });
  }

  private async getOrCreateJourney(userId: string) {
    const existing = await this.prisma.fulfillmentJourney.findUnique({
      where: { userId },
    });
    if (existing) return existing;
    return this.prisma.fulfillmentJourney.create({
      data: { userId, primaryTradition: 'ZEN', blendTraditions: [] },
    });
  }

  private tryParseJson(text: string): any | null {
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (!m) return null;
      try {
        return JSON.parse(m[0]);
      } catch {
        return null;
      }
    }
  }
}
