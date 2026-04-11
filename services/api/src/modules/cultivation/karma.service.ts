import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Realm } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CoachKarmaDto,
  CreateKarmaEventDto,
} from './dto/fulfillment.dto';

const REALM_VALUES: Realm[] = [
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
export class KarmaService {
  private readonly logger = new Logger(KarmaService.name);
  private readonly llmBaseUrl: string;
  private readonly llmApiKey: string;
  private readonly llmModel: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.llmBaseUrl = this.config.get<string>('LLM_BASE_URL', '');
    this.llmApiKey = this.config.get<string>('LLM_API_KEY', '');
    this.llmModel = this.config.get<string>('LLM_MODEL', 'qwen2.5-32b-instruct');
  }

  private get isLLMEnabled(): boolean {
    return !!this.llmBaseUrl;
  }

  // ── 写前: 小鸿帮用户理清思路 ────────────────

  async coachKarmaDraft(_userId: string, dto: CoachKarmaDto) {
    const rough = sanitize(dto.roughNotes) ?? '';
    if (!rough.trim()) {
      return this.fallbackCoach(rough, dto.intent);
    }

    if (!this.isLLMEnabled) {
      return this.fallbackCoach(rough, dto.intent);
    }

    const systemPrompt = `你是小鸿，佳绩之旅的修行教练。用户抛来一些零散的想法或情绪，请帮他把这件因缘事件整理清楚。
严格以 JSON 格式输出，不要任何 markdown 代码块包裹或额外文本。结构:
{
  "suggestedTitle": "一句 20 字内、点睛的标题 (中文)",
  "structuredBody": "分 3-4 段的结构化记述 (总共 200-500 字, 依次: 事件经过 / 情绪与反应 / 内在冲突或渴望 / 初步觉察)",
  "guidingQuestions": ["三条帮用户深入自省的问题，每条 20 字内"],
  "causeHint": "20字内的潜在原因线索",
  "effectHint": "20字内的潜在影响/启示线索"
}
要求:
- 第一人称，语气温柔而清晰
- 忠于用户原话，不编造用户没说过的事实
- guidingQuestions 必须开放式，引导自省而非回答`;

    const userPrompt = [
      dto.intent ? `[意图] ${dto.intent}` : '',
      `[用户零散笔记]`,
      rough,
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
          max_tokens: 1200,
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
      if (!parsed || typeof parsed.suggestedTitle !== 'string' || typeof parsed.structuredBody !== 'string') {
        return this.fallbackCoach(rough, dto.intent);
      }
      const guiding = Array.isArray(parsed.guidingQuestions)
        ? parsed.guidingQuestions.filter((q: any) => typeof q === 'string').slice(0, 5)
        : [];
      return {
        suggestedTitle: String(parsed.suggestedTitle).slice(0, 60),
        structuredBody: String(parsed.structuredBody).slice(0, 3000),
        guidingQuestions: guiding,
        causeHint: typeof parsed.causeHint === 'string' ? parsed.causeHint : '',
        effectHint: typeof parsed.effectHint === 'string' ? parsed.effectHint : '',
        source: 'llm' as const,
      };
    } catch (err) {
      this.logger.warn(`coachKarmaDraft LLM failed: ${(err as Error).message}`);
      return this.fallbackCoach(rough, dto.intent);
    }
  }

  private fallbackCoach(rough: string, intent?: string) {
    const firstLine = rough.split('\n').find((l) => l.trim())?.slice(0, 40) ?? '一件因缘';
    return {
      suggestedTitle: firstLine,
      structuredBody: `【事件经过】\n${rough || '（请补充细节）'}\n\n【当下感受】\n（请记录当时的情绪和身体反应）\n\n【内在冲突】\n（请写下你的真实渴望与挣扎）\n\n【初步觉察】\n（你从这件事看到了自己的什么？）`,
      guidingQuestions: [
        '这件事最触动你的是什么？',
        '如果一周后回看，你会希望自己当时怎样回应？',
        '这件事背后隐藏着你哪一份渴望？',
      ],
      causeHint: intent ? `与${intent}相关` : '',
      effectHint: '',
      source: 'fallback' as const,
    };
  }

  // ── 写: 保存因缘事件 + 写后深度分析 ─────────────

  async createKarmaEvent(userId: string, dto: CreateKarmaEventDto) {
    const journey = await this.getOrCreateJourney(userId);
    const created = await this.prisma.karmaEvent.create({
      data: {
        journeyId: journey.id,
        title: sanitize(dto.title)!,
        body: sanitize(dto.body)!,
        eventAt: new Date(dto.eventAt),
        visibility: dto.visibility ?? 'PRIVATE',
        aiRealmTag: null,
        aiCauseTag: null,
        aiEffectTag: null,
        aiAdvice: null,
        aiConfidence: null,
        aiCausalChain: undefined,
        aiTraditionInsights: undefined,
      },
    });

    // 深度分析 (失败不阻断保存)
    const analysis = await this.analyzeKarma(created.title, created.body);
    if (analysis) {
      return this.prisma.karmaEvent.update({
        where: { id: created.id },
        data: {
          aiRealmTag: analysis.realmTag,
          aiCauseTag: analysis.causeTag,
          aiEffectTag: analysis.effectTag,
          aiAdvice: analysis.advice,
          aiConfidence: analysis.confidence,
          aiCausalChain: analysis.causalChain as any,
          aiTraditionInsights: analysis.traditionInsights as any,
        },
      });
    }
    return created;
  }

  async reanalyzeKarma(userId: string, id: string) {
    const event = await this.getKarmaEvent(userId, id);
    const analysis = await this.analyzeKarma(event.title, event.body);
    if (!analysis) return event;
    return this.prisma.karmaEvent.update({
      where: { id: event.id },
      data: {
        aiRealmTag: analysis.realmTag,
        aiCauseTag: analysis.causeTag,
        aiEffectTag: analysis.effectTag,
        aiAdvice: analysis.advice,
        aiConfidence: analysis.confidence,
        aiCausalChain: analysis.causalChain as any,
        aiTraditionInsights: analysis.traditionInsights as any,
      },
    });
  }

  private async analyzeKarma(
    title: string,
    body: string,
  ): Promise<{
    realmTag: Realm | null;
    causeTag: string | null;
    effectTag: string | null;
    advice: string | null;
    confidence: number | null;
    causalChain: Array<{ type: string; text: string }>;
    traditionInsights: Array<{
      tradition: string;
      scriptureTitle: string;
      scriptureSlug?: string;
      quote: string;
      guidance: string;
    }>;
  } | null> {
    const query = `${title} ${body.slice(0, 300)}`;
    const candidates = await this.searchScriptures(query, 8);

    if (!this.isLLMEnabled) {
      return this.fallbackAnalysis(title, body, candidates);
    }

    const scriptureCtx = candidates
      .map(
        (s, i) =>
          `${i + 1}. slug=${s.slug} tradition=${s.tradition ?? '未知'} 《${s.title}》 — ${s.summary?.slice(0, 120) ?? ''}`,
      )
      .join('\n');

    const systemPrompt = `你是小鸿，佳绩之旅的修行导师。请对这件因缘事件做多维度分析，帮助用户从小事件中获得觉知与智慧。
严格以 JSON 格式输出，不要 markdown 包裹或额外文本。结构:
{
  "realmTag": "七境界之一 — AWAKENING|CLARIFYING|SEEING|ATTAINING|INTEGRATING|RETURNING|GIVING_BACK",
  "causeTag": "10字内的因",
  "effectTag": "10字内的果",
  "advice": "50字内修行建议",
  "confidence": 0.0-1.0,
  "causalChain": [
    {"type": "CAUSE", "text": "背后的因 20字"},
    {"type": "EVENT", "text": "事件核心 20字"},
    {"type": "EFFECT", "text": "显现的果 20字"},
    {"type": "INSIGHT", "text": "可收获的觉知 30字"}
  ],
  "traditionInsights": [
    {"tradition": "从候选中选", "scriptureTitle": "经论原名", "scriptureSlug": "精确 slug", "quote": "一句原文节选 20-60字", "guidance": "如何应用到这件事 50字内"}
  ]
}
要求:
- traditionInsights 必须至少 3 条，来自不同 tradition，优先选择候选清单中的经论
- 禁止编造 slug，若不确定留空
- 语气温柔清晰，禁止说教，避免传教色彩
- causalChain 四个节点缺一不可`;

    const userPrompt = [
      `[因缘事件标题] ${title}`,
      `[事件正文]`,
      body.slice(0, 2000),
      '',
      `[经论候选 TOP${candidates.length}]`,
      scriptureCtx || '（无候选）',
    ].join('\n');

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
          max_tokens: 2000,
          temperature: 0.6,
          stream: false,
          chat_template_kwargs: { enable_thinking: false },
        }),
        signal: AbortSignal.timeout(180_000),
      });
      if (!response.ok) throw new Error(`LLM ${response.status}`);
      const data = (await response.json()) as any;
      const content: string = data?.choices?.[0]?.message?.content ?? '';
      const parsed = this.tryParseJson(content);
      if (!parsed) return this.fallbackAnalysis(title, body, candidates);

      const realmTag: Realm | null = REALM_VALUES.includes(parsed.realmTag)
        ? (parsed.realmTag as Realm)
        : null;
      const causalChain = Array.isArray(parsed.causalChain)
        ? parsed.causalChain
            .filter((n: any) => n && typeof n.text === 'string' && typeof n.type === 'string')
            .slice(0, 6)
            .map((n: any) => ({ type: String(n.type), text: String(n.text).slice(0, 120) }))
        : [];
      const traditionInsights = Array.isArray(parsed.traditionInsights)
        ? parsed.traditionInsights
            .filter((t: any) => t && typeof t.tradition === 'string' && typeof t.quote === 'string')
            .slice(0, 6)
            .map((t: any) => ({
              tradition: String(t.tradition),
              scriptureTitle: String(t.scriptureTitle ?? '').slice(0, 80),
              scriptureSlug: typeof t.scriptureSlug === 'string' ? t.scriptureSlug : undefined,
              quote: String(t.quote).slice(0, 200),
              guidance: String(t.guidance ?? '').slice(0, 200),
            }))
        : [];

      return {
        realmTag,
        causeTag: typeof parsed.causeTag === 'string' ? parsed.causeTag.slice(0, 30) : null,
        effectTag: typeof parsed.effectTag === 'string' ? parsed.effectTag.slice(0, 30) : null,
        advice: typeof parsed.advice === 'string' ? parsed.advice.slice(0, 200) : null,
        confidence:
          typeof parsed.confidence === 'number' && parsed.confidence >= 0 && parsed.confidence <= 1
            ? parsed.confidence
            : 0.6,
        causalChain,
        traditionInsights,
      };
    } catch (err) {
      this.logger.warn(`analyzeKarma LLM failed: ${(err as Error).message}`);
      return this.fallbackAnalysis(title, body, candidates);
    }
  }

  private fallbackAnalysis(
    _title: string,
    body: string,
    candidates: Array<{
      slug: string;
      title: string;
      summary: string | null;
      tradition: string | null;
    }>,
  ) {
    const byTradition = new Map<string, (typeof candidates)[number]>();
    for (const c of candidates) {
      if (!c.tradition) continue;
      if (!byTradition.has(c.tradition)) byTradition.set(c.tradition, c);
      if (byTradition.size >= 3) break;
    }
    const traditionInsights = Array.from(byTradition.values()).map((s) => ({
      tradition: s.tradition ?? '未知',
      scriptureTitle: s.title,
      scriptureSlug: s.slug,
      quote: s.summary?.slice(0, 120) ?? '（原文待补）',
      guidance: '小鸿降级模式 — 请稍后点击「重新分析」获得深度引导',
    }));
    return {
      realmTag: null,
      causeTag: null,
      effectTag: null,
      advice: '小鸿暂时无法深度分析，已保存这件因缘。稍后可在时间线点击「重新分析」获得完整觉知。',
      confidence: null,
      causalChain: [
        { type: 'CAUSE', text: '（小鸿暂不可用）' },
        { type: 'EVENT', text: body.slice(0, 40) },
        { type: 'EFFECT', text: '（待分析）' },
        { type: 'INSIGHT', text: '先让这件事在心里停留片刻，不急于解读。' },
      ],
      traditionInsights,
    };
  }

  // ── 读 / 删 ────────────────────────────────────

  async listKarmaTimeline(userId: string, page: number, pageSize: number) {
    const journey = await this.getOrCreateJourney(userId);
    const take = Math.min(Math.max(pageSize || 20, 1), 50);
    const currentPage = Math.max(page || 1, 1);
    const skip = (currentPage - 1) * take;
    const [items, total] = await Promise.all([
      this.prisma.karmaEvent.findMany({
        where: { journeyId: journey.id },
        orderBy: { eventAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.karmaEvent.count({ where: { journeyId: journey.id } }),
    ]);
    return { items, total, page: currentPage, pageSize: take };
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
    await this.getKarmaEvent(userId, id);
    return this.prisma.karmaEvent.delete({ where: { id } });
  }

  // ── helpers ────────────────────────────────────

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

  private async searchScriptures(query: string, limit = 5) {
    const tokens = query
      .replace(/[，。！？；：、""''（）()\[\]]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 2)
      .slice(0, 8);
    if (tokens.length === 0) {
      return this.prisma.scripture.findMany({
        where: { isPublished: true },
        orderBy: { sortOrder: 'asc' },
        take: limit,
      });
    }
    return this.prisma.scripture.findMany({
      where: {
        isPublished: true,
        OR: [
          ...tokens.map((t) => ({ title: { contains: t, mode: 'insensitive' as const } })),
          ...tokens.map((t) => ({ summary: { contains: t, mode: 'insensitive' as const } })),
          { tags: { hasSome: tokens } },
        ],
      },
      orderBy: [{ difficulty: 'asc' }, { sortOrder: 'asc' }],
      take: limit,
    });
  }
}
