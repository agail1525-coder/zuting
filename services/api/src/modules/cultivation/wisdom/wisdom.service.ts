import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  buildAnswerSystemPrompt,
  buildDebateSystemPrompt,
  buildSynthesizerPrompt,
  type MasterAnswer,
  type DebateTurn,
  type SynthesisResult,
  type ScriptureHit,
} from './master-prompt.builder';
import { WISDOM_MASTERS, getMaster, type WisdomMaster } from './masters.constants';

@Injectable()
export class WisdomService {
  private readonly logger = new Logger(WisdomService.name);
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

  // ── 公开 API ─────────────────────────────────────────

  /**
   * 12 位宗师之一作答。Wave 1 核心入口。
   * - LLM 未配置时返回降级答案
   * - LLM 调用失败时返回 FAILED 状态（供上层 allSettled 容错）
   */
  async answerAsMaster(
    masterOrTradition: WisdomMaster | string,
    question: string,
  ): Promise<MasterAnswer> {
    const master =
      typeof masterOrTradition === 'string'
        ? getMaster(masterOrTradition)
        : masterOrTradition;
    if (!master) {
      return {
        tradition: typeof masterOrTradition === 'string' ? masterOrTradition : 'UNKNOWN',
        masterName: '佚名',
        answer: '此宗师尚未登坛。',
        citations: [],
        keyPoints: [],
        status: 'FAILED',
      };
    }

    if (!this.isLLMEnabled) {
      return this.fallbackAnswer(master, question);
    }

    try {
      const scriptures = await this.searchScripturesForMaster(question, master, 6);
      const systemPrompt = buildAnswerSystemPrompt(master, scriptures);
      const content = await this.callLLM(systemPrompt, question, 1500, 0.8, 90_000);
      const parsed = this.tryParseJson(content);
      if (!parsed) {
        this.logger.warn(`[${master.tradition}] JSON parse failed, falling back`);
        return this.fallbackAnswer(master, question);
      }
      return this.normalizeAnswer(master, parsed, scriptures);
    } catch (err) {
      this.logger.warn(`[${master.tradition}] answerAsMaster failed: ${(err as Error).message}`);
      return {
        tradition: master.tradition,
        masterName: master.masterName,
        answer: '此刻大师沉默不语，请稍后再问。',
        citations: [],
        keyPoints: [],
        status: 'FAILED',
      };
    }
  }

  /**
   * 讨论模式：宗师基于其他宗师上一轮答复再次作答
   */
  async debateAsMaster(
    masterOrTradition: WisdomMaster | string,
    question: string,
    round: number,
    otherMastersLastTurn: Array<{ masterName: string; tradition: string; text: string }>,
  ): Promise<DebateTurn> {
    const master =
      typeof masterOrTradition === 'string'
        ? getMaster(masterOrTradition)
        : masterOrTradition;
    if (!master || !this.isLLMEnabled) {
      return {
        tradition: master?.tradition ?? 'UNKNOWN',
        masterName: master?.masterName ?? '佚名',
        response: '此轮大师默然。',
        citations: [],
        repliesTo: [],
      };
    }
    try {
      const scriptures = await this.searchScripturesForMaster(question, master, 4);
      const systemPrompt = buildDebateSystemPrompt(
        master,
        scriptures,
        round,
        otherMastersLastTurn,
      );
      const content = await this.callLLM(systemPrompt, question, 1200, 0.85, 90_000);
      const parsed = this.tryParseJson(content);
      if (!parsed) {
        return {
          tradition: master.tradition,
          masterName: master.masterName,
          response: '此轮大师默然。',
          citations: [],
          repliesTo: [],
        };
      }
      return {
        tradition: master.tradition,
        masterName: master.masterName,
        response: String(parsed.answer ?? '').slice(0, 2000),
        citations: this.normalizeCitations(parsed.citations, scriptures),
        repliesTo: Array.isArray(parsed.repliesTo)
          ? parsed.repliesTo.map((x: unknown) => String(x)).slice(0, 6)
          : [],
      };
    } catch (err) {
      this.logger.warn(`[${master.tradition}] debate round ${round} failed: ${(err as Error).message}`);
      return {
        tradition: master.tradition,
        masterName: master.masterName,
        response: '此轮大师默然。',
        citations: [],
        repliesTo: [],
      };
    }
  }

  /**
   * 融通：由小鸿作为元角色，汇总 N 位宗师答复
   */
  async synthesize(
    question: string,
    answers: Array<{ tradition: string; masterName: string; answer: string }>,
  ): Promise<SynthesisResult> {
    if (!this.isLLMEnabled || answers.length === 0) {
      return this.fallbackSynthesis(question, answers);
    }
    try {
      const systemPrompt = buildSynthesizerPrompt(question, answers);
      const content = await this.callLLM(
        systemPrompt,
        '请按要求输出 JSON。',
        2000,
        0.6,
        120_000,
      );
      const parsed = this.tryParseJson(content);
      if (!parsed) return this.fallbackSynthesis(question, answers);
      return {
        convergence: Array.isArray(parsed.convergence)
          ? parsed.convergence.map((s: unknown) => String(s).slice(0, 200)).slice(0, 8)
          : [],
        divergence: Array.isArray(parsed.divergence)
          ? parsed.divergence
              .filter((d: any) => d && typeof d.tradition === 'string')
              .slice(0, 8)
              .map((d: any) => ({
                tradition: String(d.tradition),
                stance: String(d.stance ?? '').slice(0, 200),
                reason: String(d.reason ?? '').slice(0, 200),
              }))
          : [],
        integration:
          typeof parsed.integration === 'string'
            ? parsed.integration.slice(0, 2000)
            : '',
        practice:
          typeof parsed.practice === 'string' ? parsed.practice.slice(0, 200) : '',
      };
    } catch (err) {
      this.logger.warn(`synthesize failed: ${(err as Error).message}`);
      return this.fallbackSynthesis(question, answers);
    }
  }

  // ── 内部工具 ─────────────────────────────────────────

  /**
   * 按宗师的 canonSlugs 白名单 + 问题关键词做 RAG 检索
   * 第一优先：canon 白名单命中；第二优先：tradition 字段匹配 + 关键词
   */
  private async searchScripturesForMaster(
    question: string,
    master: WisdomMaster,
    limit: number,
  ): Promise<ScriptureHit[]> {
    const tokens = question
      .replace(/[，。！？；：、""''（）()\[\]]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 2)
      .slice(0, 6);

    // Phase 1: canonSlugs 白名单命中（最权威）
    const canonHits = master.canonSlugs.length
      ? await this.prisma.scripture.findMany({
          where: {
            isPublished: true,
            slug: { in: master.canonSlugs },
          },
          select: { slug: true, title: true, tradition: true, summary: true },
          take: limit,
        })
      : [];

    if (canonHits.length >= limit) return canonHits;

    // Phase 2: 按 tradition + 关键词补充
    const remaining = limit - canonHits.length;
    const alreadySlugs = new Set(canonHits.map((h) => h.slug));
    const keywordFilter =
      tokens.length > 0
        ? {
            OR: [
              ...tokens.map((t) => ({
                title: { contains: t, mode: 'insensitive' as const },
              })),
              ...tokens.map((t) => ({
                summary: { contains: t, mode: 'insensitive' as const },
              })),
              { tags: { hasSome: tokens } },
            ],
          }
        : {};
    const fallbackHits = await this.prisma.scripture.findMany({
      where: {
        isPublished: true,
        tradition: master.tradition,
        slug: { notIn: Array.from(alreadySlugs) },
        ...keywordFilter,
      },
      select: { slug: true, title: true, tradition: true, summary: true },
      orderBy: [{ difficulty: 'asc' }, { sortOrder: 'asc' }],
      take: remaining,
    });

    return [...canonHits, ...fallbackHits];
  }

  /**
   * 调 Qwen3.5-35B（与 karma.service 同模式；禁用 thinking mode；有超时；容错 stripThinkingPrefix）
   */
  private async callLLM(
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number,
    temperature: number,
    timeoutMs: number,
  ): Promise<string> {
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
        max_tokens: maxTokens,
        temperature,
        stream: false,
        chat_template_kwargs: { enable_thinking: false },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
      throw new Error(`LLM ${response.status}: ${await response.text().catch(() => '')}`);
    }
    const data = (await response.json()) as any;
    const raw: string = data?.choices?.[0]?.message?.content ?? '';
    return this.stripThinkingPrefix(raw);
  }

  private stripThinkingPrefix(content: string): string {
    const thinkTagMatch = content.match(/<\/think>\s*([\s\S]*)/);
    if (thinkTagMatch) return thinkTagMatch[1].trim();
    const thinkPrefixMatch = content.match(/^Thinking Process:[\s\S]*?\n\n([\s\S]*)/);
    if (thinkPrefixMatch) return thinkPrefixMatch[1].trim();
    return content;
  }

  private tryParseJson(content: string): any | null {
    if (!content) return null;
    // 直接尝试
    try {
      return JSON.parse(content);
    } catch {
      // 提取第一个 {...} 块
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) return null;
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
  }

  private normalizeAnswer(
    master: WisdomMaster,
    parsed: any,
    candidates: ScriptureHit[],
  ): MasterAnswer {
    const answerText =
      typeof parsed.answer === 'string' ? parsed.answer.slice(0, 3000) : '';
    if (!answerText.trim()) {
      return {
        tradition: master.tradition,
        masterName: master.masterName,
        answer: '此刻大师沉默不语。',
        citations: [],
        keyPoints: [],
        status: 'FAILED',
      };
    }
    return {
      tradition: master.tradition,
      masterName: master.masterName,
      answer: answerText,
      citations: this.normalizeCitations(parsed.citations, candidates),
      keyPoints: Array.isArray(parsed.keyPoints)
        ? parsed.keyPoints.map((p: unknown) => String(p).slice(0, 30)).slice(0, 6)
        : [],
      status: 'OK',
    };
  }

  private normalizeCitations(
    raw: unknown,
    candidates: ScriptureHit[],
  ): MasterAnswer['citations'] {
    if (!Array.isArray(raw)) return [];
    const validSlugs = new Set(candidates.map((c) => c.slug));
    return raw
      .filter((c: any) => c && typeof c.quote === 'string')
      .slice(0, 4)
      .map((c: any) => ({
        // 强过滤：编造的 slug 直接置空，避免引用幻觉
        scriptureSlug:
          typeof c.scriptureSlug === 'string' && validSlugs.has(c.scriptureSlug)
            ? c.scriptureSlug
            : '',
        title: String(c.title ?? '').slice(0, 100),
        quote: String(c.quote).slice(0, 200),
      }));
  }

  // ── 降级 ─────────────────────────────────────────────

  private fallbackAnswer(master: WisdomMaster, question: string): MasterAnswer {
    return {
      tradition: master.tradition,
      masterName: master.masterName,
      answer: `${master.masterName}尚在云游途中，本宗智慧暂由心念代传：「${master.coreConcern}」。当你的问题「${question.slice(0, 40)}」回到此处时，不妨先静坐片刻，聆听内在本具的答案。`,
      citations: [],
      keyPoints: master.signatureVocab.slice(0, 3),
      status: 'FAILED',
    };
  }

  private fallbackSynthesis(
    _question: string,
    answers: Array<{ tradition: string; masterName: string; answer: string }>,
  ): SynthesisResult {
    return {
      convergence: ['各宗皆指向同一心源，殊途同归'],
      divergence: answers.slice(0, 3).map((a) => ({
        tradition: a.tradition,
        stance: a.masterName + '的立场',
        reason: '详见大师原话',
      })),
      integration:
        '小鸿暂时无法调用融通引擎。请先细读各位大师的答复，留意让你心跳的那一句——那便是你此刻的答案。',
      practice: '静坐三分钟，让最触动你的那一句在心中反复回响。',
    };
  }

  // ── 暴露常量 ─────────────────────────────────────────

  get allMasters() {
    return WISDOM_MASTERS;
  }
}
