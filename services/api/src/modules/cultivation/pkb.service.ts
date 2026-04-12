import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateEntryDto,
  DraftVowDto,
  ListEntriesDto,
  ShareEntryDto,
  StruggleDto,
  UpdateEntryDto,
  UpdateRecommendationDto,
  UpdateVowsDto,
} from './dto/pkb.dto';
import { WISDOM_MASTERS, type WisdomMaster } from './wisdom/masters.constants';

/**
 * PKB 修行库服务 (M39)
 * - 管理用户个人 PKB 主表/条目/推荐
 * - 负责小鸿对话同步落库 + 引经据典检索
 * - 经论召回第一版: tradition + tag + title/summary trgm 模糊匹配
 * - 升级路径: Scripture.embedding 向量召回 (待 embedding 服务就绪)
 */
@Injectable()
export class PkbService {
  private readonly logger = new Logger(PkbService.name);
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

  // ── 主表 ─────────────────────────────────────────

  async getOrCreatePkb(userId: string) {
    return this.prisma.userPkb.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async getOverview(userId: string) {
    const pkb = await this.getOrCreatePkb(userId);
    const [recentEntries, activeRecs, entryCount] = await Promise.all([
      this.prisma.pkbEntry.findMany({
        where: { pkbId: pkb.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.pkbRecommendation.findMany({
        where: { pkbId: pkb.id, status: { in: ['PENDING', 'READ', 'PRACTICING'] } },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        take: 12,
      }),
      this.prisma.pkbEntry.count({ where: { pkbId: pkb.id } }),
    ]);
    return { pkb: { ...pkb, entryCount }, recentEntries, activeRecs };
  }

  async updateVows(userId: string, dto: UpdateVowsDto) {
    const pkb = await this.getOrCreatePkb(userId);
    const updated = await this.prisma.userPkb.update({
      where: { id: pkb.id },
      data: {
        personalVow: dto.personalVow ?? pkb.personalVow,
        familyVow: dto.familyVow ?? pkb.familyVow,
        careerVow: dto.careerVow ?? pkb.careerVow,
        vowUpdatedAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    await this.prisma.pkbEntry.create({
      data: {
        pkbId: pkb.id,
        kind: 'VOW_UPDATE',
        category: 'GENERAL',
        title: '三生愿景已更新',
        content: `个人: ${dto.personalVow ?? ''}\n家庭: ${dto.familyVow ?? ''}\n事业: ${dto.careerVow ?? ''}`,
      },
    });

    // 清旧 PENDING 推荐
    await this.prisma.pkbRecommendation.deleteMany({
      where: { pkbId: pkb.id, category: { in: ['PERSONAL', 'FAMILY', 'CAREER'] }, status: 'PENDING' },
    });

    // 同步生成法界启示 + 深度经论推荐
    const result = await this.generateRevelationAndRecs(pkb.id, { ...pkb, ...updated }, dto);

    return { ...updated, vowRevelation: result?.revelation ?? null, recommendations: result?.recs ?? [] };
  }

  private pickMasters(pkbId: string): WisdomMaster[] {
    const zen = WISDOM_MASTERS.find((m) => m.tradition === 'ZEN');
    const others = WISDOM_MASTERS.filter((m) => m.tradition !== 'ZEN');
    // deterministic-ish shuffle seeded by pkbId
    const seed = pkbId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const shuffled = others.slice().sort((a, b) => {
      const ha = (a.masterName.charCodeAt(0) * 31 + seed) % 997;
      const hb = (b.masterName.charCodeAt(0) * 31 + seed) % 997;
      return ha - hb;
    });
    const picked: WisdomMaster[] = [];
    const usedTrads = new Set<string>();
    for (const m of shuffled) {
      if (usedTrads.has(m.tradition)) continue;
      picked.push(m);
      usedTrads.add(m.tradition);
      if (picked.length >= 4) break;
    }
    return zen ? [zen, ...picked] : picked;
  }

  private async generateRevelationAndRecs(
    pkbId: string,
    pkb: { personalVow: string | null; familyVow: string | null; careerVow: string | null; currentOxStage: number },
    dto: UpdateVowsDto,
  ) {
    const cats: Array<{ cat: 'PERSONAL' | 'FAMILY' | 'CAREER'; vow?: string; label: string; kw: string[] }> = [
      { cat: 'PERSONAL', vow: dto.personalVow, label: '个人圆满', kw: ['个人', '修行', '觉悟', '心性'] },
      { cat: 'FAMILY', vow: dto.familyVow, label: '家庭幸福', kw: ['家庭', '和合', '孝亲', '慈爱'] },
      { cat: 'CAREER', vow: dto.careerVow, label: '事业兴旺', kw: ['事业', '布施', '利他', '经世'] },
    ];

    // Step A: 候选经论池 + 章节
    const candidateMap: Record<string, Array<{ id: string; slug: string; title: string; summary: string | null; tradition: string | null; chapters: Array<{ chapterNo: number; title: string | null; subtitle: string | null }> }>> = {};
    for (const c of cats) {
      if (!c.vow || c.vow.trim().length < 5) { candidateMap[c.cat] = []; continue; }
      const scriptures = await this.searchScriptures(c.vow + ' ' + c.kw.join(' '), 6);
      const withChapters = await Promise.all(
        scriptures.map(async (s) => {
          const chapters = await this.prisma.scriptureChapter.findMany({
            where: { scriptureId: s.id },
            orderBy: { chapterNo: 'asc' },
            take: 5,
            select: { chapterNo: true, title: true, subtitle: true },
          });
          return { id: s.id, slug: s.slug, title: s.title, summary: s.summary, tradition: s.tradition, chapters };
        }),
      );
      candidateMap[c.cat] = withChapters;
    }

    // Step B: 选大师
    const masters = this.pickMasters(pkbId);
    const zenMaster = masters[0];
    const otherMasters = masters.slice(1);

    if (!this.isLLMEnabled) {
      await this.fallbackVowRecs(pkbId, cats, candidateMap);
      return null;
    }

    // Step C: LLM call
    const candidateBlock = cats.map((c) => {
      const pool = candidateMap[c.cat];
      if (pool.length === 0) return `[${c.label} 候选] 无`;
      return `[${c.label} 候选 (共${pool.length}部)]\n` +
        pool.map((s, i) => {
          const chLine = s.chapters.map((ch) => `第${ch.chapterNo}章「${ch.title ?? ''}」`).join('; ');
          return `${i + 1}. slug="${s.slug}" 《${s.title}》(${s.tradition ?? '综合'}) — ${s.summary?.slice(0, 100) ?? ''}\n   章节: ${chLine || '无章节'}`;
        }).join('\n');
    }).join('\n\n');

    const masterBlock = otherMasters.map((m) => (
      `- ${m.masterName}(${m.tradition}, ${m.era}): 文风=${m.writingStyle}; 核心关切=${m.coreConcern}; 签名词汇=${m.signatureVocab.join('/')}`
    )).join('\n');

    const systemPrompt = `你是小鸿,佳绩之旅的法界传音者。用户刚更新了三生愿景。
你不是导师,你是禅宗六祖${zenMaster?.masterName ?? '惠能'}和 ${otherMasters.length} 位异传统大师的传音者。

严格以 JSON 格式输出(不要 markdown 围栏、不要额外文字)。结构:
{
  "revelation": {
    "zenGuidance": "六祖${zenMaster?.masterName ?? '惠能'}口吻, 200字, 用禅宗用语(本心/自性/不二/无念)针对用户三生愿景回应",
    "masterVoices": [
      {"tradition":"XX","masterName":"XX","voice":"150字该传统视角的启示"}
    ],
    "synthesis": "小鸿作为传音者的100字收束, 承认自己只是传音, 法界自有回应"
  },
  "recommendations": {
    "PERSONAL": [
      {
        "scriptureSlug": "从候选池精确选取",
        "revelationNote": "80-200字: 为什么这部经论与此生愿景有关 + 会得到什么启示",
        "chapterPlan": [
          {"chapterNo": 1, "why": "30字 为何读此章", "keyQuote": "原文金句片段(从章信息推断)"}
        ]
      }
    ],
    "FAMILY": [...],
    "CAREER": [...]
  }
}

铁律:
- masterVoices 恰好 ${otherMasters.length} 条, 与下方大师一一对应
- scriptureSlug 必须精确拼写自候选池, 每一生选 2 部(无候选则空数组)
- chapterPlan 只用候选池里存在的 chapterNo
- 不传教, 文化智慧视角
- zenGuidance 有禅宗特征词; 各传统用各自核心词汇`;

    const userPrompt = [
      `[三生愿景]`,
      `个人: ${dto.personalVow ?? '(未填)'}`,
      `家庭: ${dto.familyVow ?? '(未填)'}`,
      `事业: ${dto.careerVow ?? '(未填)'}`,
      `[十牛图阶段] ${pkb.currentOxStage}/10`,
      `[禅宗主声] ${zenMaster?.masterName ?? '惠能'}: ${zenMaster?.coreConcern ?? ''}, 文风=${zenMaster?.writingStyle ?? ''}`,
      `[异传统大师]\n${masterBlock}`,
      candidateBlock,
    ].join('\n\n');

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
          max_tokens: 4000,
          temperature: 0.75,
          stream: false,
          chat_template_kwargs: { enable_thinking: false },
        }),
        signal: AbortSignal.timeout(180_000),
      });
      if (!response.ok) throw new Error(`LLM ${response.status}`);
      const data = (await response.json()) as any;
      const content: string = data?.choices?.[0]?.message?.content ?? '';
      const parsed = this.tryParseJson(content);
      if (!parsed?.revelation?.zenGuidance) {
        this.logger.warn('Revelation LLM returned invalid JSON, fallback');
        await this.fallbackVowRecs(pkbId, cats, candidateMap);
        return null;
      }

      // 保存启示到 UserPkb
      const revelation = {
        zenGuidance: parsed.revelation.zenGuidance,
        masterVoices: (Array.isArray(parsed.revelation.masterVoices) ? parsed.revelation.masterVoices : []).map(
          (v: any, i: number) => ({
            tradition: v.tradition ?? otherMasters[i]?.tradition ?? '',
            masterName: v.masterName ?? otherMasters[i]?.masterName ?? '',
            avatarEmoji: otherMasters[i]?.avatarEmoji ?? '🧘',
            voice: v.voice ?? '',
          }),
        ),
        synthesis: parsed.revelation.synthesis ?? '',
        generatedAt: new Date().toISOString(),
        oxStageSnapshot: pkb.currentOxStage,
        zenMasterName: zenMaster?.masterName ?? '惠能',
        zenAvatarEmoji: zenMaster?.avatarEmoji ?? '🧘',
      };
      await this.prisma.userPkb.update({
        where: { id: pkbId },
        data: { vowRevelation: revelation as any, revelationAt: new Date() },
      });

      // 保存推荐
      const recs: any[] = [];
      const recData = parsed.recommendations ?? {};
      for (const c of cats) {
        const items = Array.isArray(recData[c.cat]) ? recData[c.cat] : [];
        for (const item of items.slice(0, 2)) {
          const slug = item.scriptureSlug;
          const pool = candidateMap[c.cat];
          const matched = pool.find((s) => s.slug === slug);
          if (!matched) continue;
          const rec = await this.prisma.pkbRecommendation.create({
            data: {
              pkbId,
              category: c.cat,
              title: `推荐经论: ${matched.title}`,
              reason: typeof item.revelationNote === 'string' ? item.revelationNote : `推荐阅读《${matched.title}》`,
              revelationNote: typeof item.revelationNote === 'string' ? item.revelationNote : null,
              chapterPlan: Array.isArray(item.chapterPlan) ? item.chapterPlan : null,
              scriptureId: matched.id,
              scriptureSlug: matched.slug,
              priority: 8,
            },
          });
          recs.push(rec);
        }
      }

      return { revelation, recs };
    } catch (err) {
      this.logger.warn(`Revelation LLM failed: ${(err as Error).message}`);
      await this.fallbackVowRecs(pkbId, cats, candidateMap);
      return null;
    }
  }

  private async fallbackVowRecs(
    pkbId: string,
    cats: Array<{ cat: 'PERSONAL' | 'FAMILY' | 'CAREER'; vow?: string; label: string }>,
    candidateMap: Record<string, Array<{ id: string; slug: string; title: string }>>,
  ) {
    for (const c of cats) {
      if (!c.vow || c.vow.trim().length < 5) continue;
      for (const s of (candidateMap[c.cat] ?? []).slice(0, 2)) {
        await this.prisma.pkbRecommendation.create({
          data: {
            pkbId,
            category: c.cat,
            title: `推荐经论: ${s.title}`,
            reason: `根据你的${c.label}愿景推荐`,
            scriptureId: s.id,
            scriptureSlug: s.slug,
            priority: 7,
          },
        });
      }
    }
  }

  // ── 条目 ─────────────────────────────────────────

  async listEntries(userId: string, dto: ListEntriesDto) {
    const pkb = await this.getOrCreatePkb(userId);
    const where: any = { pkbId: pkb.id };
    if (dto.kind) where.kind = dto.kind;
    if (dto.category) where.category = dto.category;
    if (dto.tag) where.tags = { has: dto.tag };

    const page = dto.page ?? 1;
    const pageSize = Math.min(dto.pageSize ?? 20, 50);

    const [items, total] = await Promise.all([
      this.prisma.pkbEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.pkbEntry.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async createEntry(userId: string, dto: CreateEntryDto) {
    const pkb = await this.getOrCreatePkb(userId);
    const entry = await this.prisma.pkbEntry.create({
      data: {
        pkbId: pkb.id,
        kind: dto.kind as any,
        category: (dto.category as any) ?? 'GENERAL',
        title: dto.title,
        content: dto.content,
        tags: dto.tags ?? [],
        mood: dto.mood,
      },
    });
    await this.prisma.userPkb.update({
      where: { id: pkb.id },
      data: { entryCount: { increment: 1 }, lastActiveAt: new Date() },
    });
    return entry;
  }

  async updateEntry(userId: string, id: string, dto: UpdateEntryDto) {
    const existing = await this.getOwnedEntry(userId, id);
    return this.prisma.pkbEntry.update({
      where: { id: existing.id },
      data: {
        title: dto.title ?? existing.title,
        content: dto.content ?? existing.content,
        tags: dto.tags ?? existing.tags,
        mood: dto.mood ?? existing.mood,
      },
    });
  }

  async deleteEntry(userId: string, id: string) {
    const existing = await this.getOwnedEntry(userId, id);
    await this.prisma.pkbEntry.delete({ where: { id: existing.id } });
    return { deleted: true };
  }

  async shareEntry(userId: string, id: string, dto: ShareEntryDto) {
    const existing = await this.getOwnedEntry(userId, id);
    // 标记为已分享 (社区guide 的创建由前端/社区模块调用这个接口后自己创建或调用guide API)
    const updated = await this.prisma.pkbEntry.update({
      where: { id: existing.id },
      data: {
        isShared: true,
      },
    });
    return {
      entry: updated,
      shareDraft: {
        title: dto.title ?? updated.title,
        summary: dto.summary ?? updated.content.slice(0, 200),
        content: updated.content,
        tags: updated.tags,
      },
    };
  }

  // ── 烦恼同步接口 ──────────────────────────────

  async handleStruggle(userId: string, dto: StruggleDto) {
    const pkb = await this.getOrCreatePkb(userId);
    // 先从经论库检索 top5 (LLM 上下文) / top3 (引经据典)
    const scriptures = await this.searchScriptures(dto.message, 5);
    const topCited = scriptures.slice(0, 3);

    const citedRefs = topCited.map((s) => ({
      slug: s.slug,
      title: s.title,
      author: s.author,
      tradition: s.tradition,
      summary: s.summary?.slice(0, 150),
    }));

    // LLM 引经据典 JSON 回复 (W3)，失败兜底为纯文本 composer
    const reply = await this.generatePkbReply(pkb, dto, scriptures);

    // 创建修行条目
    const entry = await this.prisma.pkbEntry.create({
      data: {
        pkbId: pkb.id,
        kind: 'CHAT',
        category: (dto.category as any) ?? 'DAILY_STRUGGLE',
        title: dto.message.slice(0, 50),
        content: reply.text,
        userMessage: dto.message,
        xiaohongReply: reply.text,
        citedScriptureIds: scriptures.map((s) => s.id),
        citedChapterRefs: citedRefs as any,
        tags: dto.tags ?? [],
        mood: reply.mood,
      },
    });

    // 同步创建一个推荐
    if (scriptures[0]) {
      await this.prisma.pkbRecommendation.create({
        data: {
          pkbId: pkb.id,
          category: (dto.category as any) ?? 'DAILY_STRUGGLE',
          title: `参阅: ${scriptures[0].title}`,
          reason: '根据你此刻的烦恼自动推荐',
          scriptureId: scriptures[0].id,
          scriptureSlug: scriptures[0].slug,
          priority: 8,
        },
      });
    }

    await this.prisma.userPkb.update({
      where: { id: pkb.id },
      data: {
        entryCount: { increment: 1 },
        lastActiveAt: new Date(),
        struggleTags: { set: Array.from(new Set([...(pkb.struggleTags ?? []), ...(dto.tags ?? [])])).slice(0, 20) },
      },
    });

    return {
      entry,
      reply: reply.text,
      dailyPractice: reply.dailyPractice,
      citedScriptures: citedRefs,
    };
  }

  // ── 觉门: 小鸿主导愿景起草 ─────────────────────

  async draftVow(userId: string, dto: DraftVowDto) {
    const pkb = await this.getOrCreatePkb(userId);
    const categoryLabel = dto.category === 'PERSONAL' ? '个人圆满' : dto.category === 'FAMILY' ? '家庭幸福' : '事业兴旺';
    const keywordsText = (dto.keywords ?? []).join('、');

    // 关键词 → 检索经论上下文 (2 条)
    const scriptureHint = await this.searchScriptures(
      `${categoryLabel} ${keywordsText} ${dto.hint ?? ''}`.trim(),
      2,
    );

    if (!this.isLLMEnabled) {
      return {
        vow: this.fallbackVowTemplate(dto.category, dto.keywords ?? [], dto.hint),
        rationale: '小鸿降级模式 — 使用默认模板',
        referenceScriptures: scriptureHint.map((s) => ({ slug: s.slug, title: s.title })),
        source: 'fallback' as const,
      };
    }

    const otherVows = [
      pkb.personalVow && dto.category !== 'PERSONAL' ? `个人: ${pkb.personalVow}` : '',
      pkb.familyVow && dto.category !== 'FAMILY' ? `家庭: ${pkb.familyVow}` : '',
      pkb.careerVow && dto.category !== 'CAREER' ? `事业: ${pkb.careerVow}` : '',
    ].filter(Boolean).join('\n') || '尚未填写';

    const systemPrompt = `你是小鸿，佳绩之旅的修行导师。请为用户起草一条【${categoryLabel}】的修行愿景。
严格以 JSON 格式输出，不要任何 markdown 或额外文本。结构:
{
  "vow": "一段 80-200 字、诚恳、具体、可践行的愿景文字，第一人称",
  "rationale": "为什么这样起草的一句话说明 (30字内)"
}
要求:
- 结合用户已有其他愿景的语气保持一致
- 融入下方关键词和经论意象
- 避免宗教传教用语，使用文化智慧视角
- 落地可感，禁止空洞口号`;

    const userPrompt = [
      `[维度] ${categoryLabel}`,
      `[用户关键词] ${keywordsText || '（用户未选）'}`,
      dto.hint ? `[用户补充] ${dto.hint}` : '',
      dto.currentDraft ? `[用户已有草稿 — 请在此基础上润色]\n${dto.currentDraft}` : '',
      `[用户其他愿景参考]\n${otherVows}`,
      `[十牛图阶段] ${pkb.currentOxStage}/10`,
      scriptureHint.length > 0
        ? `[可借鉴经论]\n${scriptureHint.map((s, i) => `${i + 1}. 《${s.title}》 — ${s.summary?.slice(0, 80) ?? ''}`).join('\n')}`
        : '',
    ].filter(Boolean).join('\n\n');

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
          max_tokens: 800,
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
      if (!parsed || typeof parsed.vow !== 'string') {
        return {
          vow: this.fallbackVowTemplate(dto.category, dto.keywords ?? [], dto.hint),
          rationale: '小鸿输出格式异常，回退模板',
          referenceScriptures: scriptureHint.map((s) => ({ slug: s.slug, title: s.title })),
          source: 'fallback' as const,
        };
      }
      return {
        vow: parsed.vow,
        rationale: typeof parsed.rationale === 'string' ? parsed.rationale : '',
        referenceScriptures: scriptureHint.map((s) => ({ slug: s.slug, title: s.title })),
        source: 'llm' as const,
      };
    } catch (err) {
      this.logger.warn(`draftVow LLM failed: ${(err as Error).message}`);
      return {
        vow: this.fallbackVowTemplate(dto.category, dto.keywords ?? [], dto.hint),
        rationale: '小鸿暂时不在，使用默认模板',
        referenceScriptures: scriptureHint.map((s) => ({ slug: s.slug, title: s.title })),
        source: 'fallback' as const,
      };
    }
  }

  private fallbackVowTemplate(category: 'PERSONAL' | 'FAMILY' | 'CAREER', keywords: string[], hint?: string): string {
    const kw = keywords.join('、') || '觉察与慈悲';
    const base: Record<typeof category, string> = {
      PERSONAL: `我愿在日常中持续觉察自己的心念与习气，围绕「${kw}」深入修行。每一次情绪起落都是练心的机会，让定力与智慧并行增长，成为一个内心笃定、行事温和的人。`,
      FAMILY: `我愿以「${kw}」为家庭的共同底色，用耐心与在场陪伴家人成长。在每一次相处中看见对方的渴望与不易，让家成为彼此能真实做自己的港湾。`,
      CAREER: `我愿以「${kw}」为事业的根本，认真服务每一位同事、客户与众生。不以短期得失论英雄，而以价值创造与布施精神，让企业成为承载众人福祉的平台。`,
    };
    return hint ? `${base[category]}\n\n${hint}` : base[category];
  }

  // ── W3 小鸿深度介入: LLM JSON 回复 ─────────────────

  private async generatePkbReply(
    pkb: { personalVow: string | null; familyVow: string | null; careerVow: string | null; currentOxStage: number; struggleTags: string[] },
    dto: StruggleDto,
    scriptures: Array<{ slug: string; title: string; summary: string | null; author: string | null; tradition: string | null }>,
  ): Promise<{ text: string; mood: string; dailyPractice: string }> {
    if (!this.isLLMEnabled) return this.composeFallbackReply(dto.message, scriptures);

    const pkbCtx = [
      `[用户画像]`,
      `三生愿景: 个人=${pkb.personalVow ?? '未设'} | 家庭=${pkb.familyVow ?? '未设'} | 事业=${pkb.careerVow ?? '未设'}`,
      `十牛图阶段: ${pkb.currentOxStage}/10`,
      `最近烦恼标签: ${(pkb.struggleTags ?? []).slice(0, 10).join('、') || '无'}`,
    ].join('\n');

    const scriptureCtx = scriptures
      .map((s, i) => `${i + 1}. slug=${s.slug} 《${s.title}》${s.author ? `(${s.author})` : ''} — ${s.summary?.slice(0, 120) ?? ''}`)
      .join('\n');

    const systemPrompt = `你是小鸿，佳绩之旅的修行导师。根据用户的个人修行库画像与经论检索结果，给出引经据典的修行建议。
严格以 JSON 格式输出，不要任何额外文本或 markdown 代码块包裹。JSON 结构:
{
  "reply": "共情 + 开解 + 建议 (200-400字)",
  "citedScriptures": [
    { "slug": "从下方候选中选", "quote": "原文或精炼节选", "why": "为何引用该经论 (30字内)" }
  ],
  "mood": "情绪转化 (如 焦虑→平和)",
  "dailyPractice": "今日一句功课 (30字内可立即执行)"
}
要求:
- citedScriptures 必须从候选清单中选取 1-3 条，slug 精确拼写
- reply 必须结合用户愿景与十牛图阶段
- 禁止宗教传教口吻，保持文化智慧视角`;

    const userPrompt = `${pkbCtx}\n\n[经论候选 TOP${scriptures.length}]\n${scriptureCtx}\n\n[用户当下烦恼]\n${dto.message}`;

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
      if (!parsed || typeof parsed.reply !== 'string') {
        this.logger.warn('LLM returned non-JSON, falling back');
        return this.composeFallbackReply(dto.message, scriptures);
      }
      const citeLines = Array.isArray(parsed.citedScriptures)
        ? parsed.citedScriptures
            .map((c: any, i: number) => `【${i + 1}】《${this.lookupScriptureTitle(scriptures, c.slug)}》 — ${c.quote ?? ''}${c.why ? ` (${c.why})` : ''}`)
            .join('\n')
        : '';
      const text = citeLines ? `${parsed.reply}\n\n${citeLines}` : parsed.reply;
      return {
        text,
        mood: typeof parsed.mood === 'string' ? parsed.mood : '困惑→安抚',
        dailyPractice: typeof parsed.dailyPractice === 'string' ? parsed.dailyPractice : '静坐三分钟',
      };
    } catch (err) {
      this.logger.warn(`LLM call failed: ${(err as Error).message}`);
      return this.composeFallbackReply(dto.message, scriptures);
    }
  }

  private tryParseJson(text: string): any | null {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
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

  private lookupScriptureTitle(scriptures: Array<{ slug: string; title: string }>, slug?: string): string {
    if (!slug) return '经论';
    return scriptures.find((s) => s.slug === slug)?.title ?? slug;
  }

  private composeFallbackReply(
    message: string,
    scriptures: Array<{ title: string; summary: string | null; author: string | null }>,
  ) {
    const refLines = scriptures
      .map((s, i) => `${i + 1}. 《${s.title}》${s.author ? '(' + s.author + ')' : ''} — ${s.summary?.slice(0, 80) ?? ''}`)
      .join('\n');
    const text = [
      `我听到了你的困惑。这份感受是真实的，不必评判。`,
      `从经论大系统中，我为你找到以下可供参照的智慧：`,
      refLines,
      `今日功课：静坐三分钟，默念上述第一段话，不必强求懂意，只让它在心中停留。`,
    ].join('\n\n');
    return {
      text,
      mood: '困惑→安抚',
      dailyPractice: '静坐三分钟默念推荐经论首段',
    };
  }

  // ── 经论检索 (向量占位 + trgm 兜底) ────────────────

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
    // title OR summary OR tags contains any token
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

  // ── 推荐 ─────────────────────────────────────────

  async listRecommendations(userId: string) {
    const pkb = await this.getOrCreatePkb(userId);
    return this.prisma.pkbRecommendation.findMany({
      where: { pkbId: pkb.id, status: { not: 'DISMISSED' } },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });
  }

  async updateRecommendation(userId: string, id: string, dto: UpdateRecommendationDto) {
    const pkb = await this.getOrCreatePkb(userId);
    const rec = await this.prisma.pkbRecommendation.findUnique({ where: { id } });
    if (!rec) throw new NotFoundException('推荐不存在');
    if (rec.pkbId !== pkb.id) throw new ForbiddenException('无权修改');
    return this.prisma.pkbRecommendation.update({
      where: { id },
      data: { status: dto.status as any },
    });
  }

  // ── 内部归属校验 ─────────────────────────────

  private async getOwnedEntry(userId: string, id: string) {
    const pkb = await this.getOrCreatePkb(userId);
    const entry = await this.prisma.pkbEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('条目不存在');
    if (entry.pkbId !== pkb.id) throw new ForbiddenException('无权访问');
    return entry;
  }
}
