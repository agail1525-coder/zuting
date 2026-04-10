import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ScriptureLearningService implements OnModuleInit {
  private readonly logger = new Logger(ScriptureLearningService.name);
  private readonly llmBaseUrl: string;
  private readonly llmApiKey: string;
  private readonly llmModel: string;
  private enabled = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.llmBaseUrl = this.configService.get<string>('LLM_BASE_URL', '');
    this.llmApiKey = this.configService.get<string>('LLM_API_KEY', '');
    this.llmModel = this.configService.get<string>('LLM_MODEL', 'qwen3.5');
  }

  onModuleInit() {
    this.enabled = !!this.llmBaseUrl;
    if (this.enabled) {
      this.logger.log('Scripture Learning CRON enabled');
    } else {
      this.logger.warn('Scripture Learning CRON disabled — no LLM_BASE_URL');
    }
  }

  // ── 03:00 经论日学 — 随机选1部经论, AI阅读1章, 生成DAILY_STUDY Insight ──
  @Cron('0 3 * * *')
  async dailyStudy() {
    if (!this.enabled) return;
    try {
      // 随机选一部有章节的经论
      const count = await this.prisma.scripture.count({ where: { isPublished: true, chapterCount: { gt: 0 } } });
      if (count === 0) return;
      const skip = Math.floor(Math.random() * count);
      const [scripture] = await this.prisma.scripture.findMany({
        where: { isPublished: true, chapterCount: { gt: 0 } },
        skip,
        take: 1,
        include: { chapters: { orderBy: { chapterNo: 'asc' }, take: 5 } },
      });
      if (!scripture || scripture.chapters.length === 0) return;

      // 选一个还没学过的章节
      const studied = await this.prisma.scriptureInsight.findMany({
        where: { scriptureId: scripture.id, insightType: 'DAILY_STUDY' },
        select: { chapterNo: true },
      });
      const studiedNos = new Set(studied.map((s) => s.chapterNo));
      const unstudied = scripture.chapters.filter((c) => !studiedNos.has(c.chapterNo));
      const chapter = unstudied.length > 0 ? unstudied[0] : scripture.chapters[0];

      const systemPrompt = `你是一位精通佛学与多元文化智慧的学者，正在研读经论。
请阅读以下经文，从修行实践角度提炼3条核心悟道:

经论: 《${scripture.title}》(${scripture.tradition})
章节: ${chapter.title}
原文: ${chapter.originalText.slice(0, 3000)}

请以JSON数组格式返回3条悟道，每条100-200字:
[{"insight":"悟道内容","oxStageRecommend":3}]`;

      const result = await this.callLLM(systemPrompt, '请提炼修行悟道');
      const parsed = this.parseJson(result);
      if (!Array.isArray(parsed)) return;

      for (const item of parsed.slice(0, 3)) {
        await this.prisma.scriptureInsight.create({
          data: {
            scriptureId: scripture.id,
            chapterNo: chapter.chapterNo,
            insightType: 'DAILY_STUDY',
            content: String(item.insight || ''),
            tradition: scripture.tradition,
            oxStage: item.oxStageRecommend || null,
            quality: 70,
          },
        });
      }
      this.logger.log(`Daily study: ${scripture.title} - ${chapter.title}, 3 insights`);
    } catch (e) {
      this.logger.error(`Daily study failed: ${e}`);
    }
  }

  // ── 05:00 跨经参照 — 选2部不同传统经论, 生成CROSS_REF融通视角 ──
  @Cron('0 5 * * *')
  async crossReference() {
    if (!this.enabled) return;
    try {
      const scriptures = await this.prisma.scripture.findMany({
        where: { isPublished: true, chapterCount: { gt: 0 } },
        select: { id: true, title: true, tradition: true, summary: true },
      });
      if (scriptures.length < 2) return;

      // 随机选2部不同传统
      const shuffled = scriptures.sort(() => Math.random() - 0.5);
      const a = shuffled[0];
      const b = shuffled.find((s) => s.tradition !== a.tradition) || shuffled[1];

      const systemPrompt = `你是一位精通多元文化智慧的融通学者。
请对比以下两部经论，找出它们的共通智慧和互补之处:

经论A: 《${a.title}》(${a.tradition}) — ${a.summary.slice(0, 500)}
经论B: 《${b.title}》(${b.tradition}) — ${b.summary.slice(0, 500)}

请以JSON格式返回一条融通悟道(200-400字):
{"insight":"融通悟道内容","commonTheme":"共通主题"}`;

      const result = await this.callLLM(systemPrompt, '请融通两部经论的智慧');
      const parsed = this.parseJson(result);
      if (!parsed?.insight) return;

      await this.prisma.scriptureInsight.create({
        data: {
          scriptureId: a.id,
          insightType: 'CROSS_REF',
          content: `【${a.title} × ${b.title}】${String(parsed.insight)}`,
          tradition: 'CROSS',
          quality: 75,
        },
      });
      this.logger.log(`Cross-ref: ${a.title} × ${b.title}`);
    } catch (e) {
      this.logger.error(`Cross reference failed: ${e}`);
    }
  }

  // ── 06:00 修行指导素材 — 选1部经论, 为当前主要阶位生成PRACTICE_GUIDE ──
  @Cron('0 6 * * *')
  async practiceGuide() {
    if (!this.enabled) return;
    try {
      const count = await this.prisma.scripture.count({ where: { isPublished: true } });
      if (count === 0) return;
      const skip = Math.floor(Math.random() * count);
      const [scripture] = await this.prisma.scripture.findMany({
        where: { isPublished: true },
        skip,
        take: 1,
      });
      if (!scripture) return;

      // 为3个代表性阶位生成指导 (初/中/高)
      for (const stage of [1, 5, 9]) {
        const STAGE_NAMES = ['寻牛', '见迹', '见牛', '得牛', '牧牛', '骑牛归家', '忘牛存人', '人牛俱忘', '返本还源', '入廛垂手'];
        const stageName = STAGE_NAMES[stage - 1];

        const systemPrompt = `你是一位禅师，请基于《${scripture.title}》的核心思想，
为处于十牛图第${stage}阶「${stageName}」的修行者提供一条修行指导(100-200字)。
指导应具体可行，结合日常生活。

以JSON返回: {"guide":"修行指导内容"}`;

        const result = await this.callLLM(systemPrompt, '请生成修行指导');
        const parsed = this.parseJson(result);
        if (!parsed?.guide) continue;

        await this.prisma.scriptureInsight.create({
          data: {
            scriptureId: scripture.id,
            insightType: 'PRACTICE_GUIDE',
            content: String(parsed.guide),
            tradition: scripture.tradition,
            oxStage: stage,
            quality: 70,
          },
        });
      }
      this.logger.log(`Practice guide: ${scripture.title}, 3 stages`);
    } catch (e) {
      this.logger.error(`Practice guide failed: ${e}`);
    }
  }

  // ── LLM 调用 ─────────────────────────────────────

  private async callLLM(systemPrompt: string, userContent: string): Promise<string> {
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
          { role: 'user', content: userContent },
        ],
        max_tokens: 2048,
        temperature: 0.7,
        stream: false,
        chat_template_kwargs: { enable_thinking: false },
      }),
      signal: AbortSignal.timeout(120000),
    });
    if (!response.ok) throw new Error(`LLM ${response.status}`);
    const data = (await response.json()) as any;
    const raw = data.choices?.[0]?.message?.content || '';
    // strip thinking prefix
    const thinkMatch = raw.match(/<\/think>\s*([\s\S]*)/);
    return thinkMatch ? thinkMatch[1].trim() : raw;
  }

  private parseJson(text: string): any {
    try { return JSON.parse(text); } catch {}
    const cb = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (cb) { try { return JSON.parse(cb[1].trim()); } catch {} }
    const js = text.search(/[\[{]/);
    if (js >= 0) { try { return JSON.parse(text.slice(js)); } catch {} }
    return null;
  }
}
