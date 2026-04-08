import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PlanTripDto } from './dto/plan-trip.dto';

export interface AiTripPlan {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  days: number;
  estimatedBudgetCents: number;
  siteIds: string[];
  packageHints: {
    accommodation: string;
    transportation: string;
    meals: string;
    pace: string;
    highlights: string[];
  };
}

export interface PlanTripResult {
  plans: AiTripPlan[];
  source: 'llm' | 'rule';
  warning?: string;
}

interface SiteCandidate {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  religionName: string;
  religionSlug: string;
  description: string;
}

@Injectable()
export class TripPlannerService {
  private readonly logger = new Logger(TripPlannerService.name);
  private readonly llmBaseUrl: string;
  private readonly llmApiKey: string;
  private readonly llmModel: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.llmBaseUrl = this.config.get<string>('LLM_BASE_URL', '');
    this.llmApiKey = this.config.get<string>('LLM_API_KEY', '');
    this.llmModel = this.config.get<string>('LLM_MODEL', '');
  }

  private get isLLMEnabled(): boolean {
    return !!this.llmBaseUrl;
  }

  /** Main entry: generate 2-3 trip plan proposals based on user input */
  async generatePlans(input: PlanTripDto): Promise<PlanTripResult> {
    const candidates = await this.loadSiteCandidates();
    const days = this.calcDays(input.startDate, input.endDate);

    if (this.isLLMEnabled) {
      try {
        const llmPlans = await this.callLLMForPlans(input, candidates, days);
        const validated = this.validateAndFilterPlans(llmPlans, candidates);
        if (validated.length > 0) {
          return { plans: validated, source: 'llm' };
        }
        this.logger.warn('LLM returned no valid plans, falling back to rules');
      } catch (err) {
        this.logger.error(`LLM planning failed: ${(err as Error).message}`);
      }
    }

    // Rule-based fallback
    const rulePlans = this.generateRulePlans(input, candidates, days);
    return {
      plans: rulePlans,
      source: 'rule',
      warning: this.isLLMEnabled
        ? 'AI 暂时不可用，已为您匹配规则方案'
        : undefined,
    };
  }

  // ──────────────────────────────────────────────
  //  Site candidates
  // ──────────────────────────────────────────────

  private async loadSiteCandidates(): Promise<SiteCandidate[]> {
    const sites = await this.prisma.holySite.findMany({
      take: 100,
      include: { religion: { select: { name: true, slug: true } } },
      orderBy: { name: 'asc' },
    });
    return sites.map((s) => ({
      id: s.id,
      name: s.name,
      nameEn: s.nameEn || '',
      country: s.country || '',
      religionName: s.religion?.name || '',
      religionSlug: s.religion?.slug || '',
      description: (s.description || '').substring(0, 80),
    }));
  }

  private calcDays(startDate?: string, endDate?: string): number {
    if (!startDate || !endDate) return 4;
    const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
    if (Number.isNaN(ms) || ms <= 0) return 4;
    return Math.max(1, Math.ceil(ms / 86400000) + 1);
  }

  // ──────────────────────────────────────────────
  //  LLM call
  // ──────────────────────────────────────────────

  private async callLLMForPlans(
    input: PlanTripDto,
    candidates: SiteCandidate[],
    days: number,
  ): Promise<AiTripPlan[]> {
    const candidatesText = candidates
      .map(
        (c) =>
          `- id="${c.id}" 名称="${c.name}" 国家="${c.country}" 宗教="${c.religionName}" 简介="${c.description}"`,
      )
      .join('\n');

    const systemPrompt = `你是 ZUTING 全球祖庭旅行平台的专业行程规划师，精通 12 大宗教文化（佛教/道教/禅宗/基督教/伊斯兰教/印度教/犹太教/儒教/锡克教/神道教/藏传佛教/巴哈伊教等）。

你的任务：根据用户的诉求，从我提供的候选圣地数据库中**精选相关的圣地**，输出 2-3 条不同主题/节奏的路线方案。

**铁律**：
1. 你只能使用我提供的候选圣地 id，禁止虚构 id
2. 必须根据用户标题和备注的语义判断主题（例如"六祖慧能"→ 选南华寺/国恩寺/光孝寺等禅宗圣地，绝不混入伊斯兰/印度教圣地）
3. 每条方案至少包含 2 个圣地，最多 8 个
4. 输出严格的 JSON，不要任何 markdown 包裹、不要解释文字
5. 必须输出 2 或 3 条方案，每条主题不同（例如：经典版/深度版/速览版）

**输出格式（严格 JSON）**：
{
  "plans": [
    {
      "id": "plan_a",
      "title": "方案标题（10字以内）",
      "subtitle": "圣地A→圣地B→圣地C",
      "summary": "一句话方案简介（50字以内）",
      "days": 4,
      "estimatedBudgetCents": 500000,
      "siteIds": ["真实候选id1", "真实候选id2"],
      "packageHints": {
        "accommodation": "住宿建议",
        "transportation": "交通建议",
        "meals": "餐饮建议",
        "pace": "宽松/平衡/紧凑",
        "highlights": ["亮点1", "亮点2", "亮点3"]
      }
    }
  ]
}

**候选圣地数据库**（${candidates.length} 个）：
${candidatesText}`;

    const userPrompt = `请为以下需求规划 2-3 条路线方案：

行程标题：${input.title}
${input.note ? `用户备注：${input.note}` : ''}
${days ? `预计天数：${days} 天` : ''}
${input.persons ? `出行人数：${input.persons} 人` : ''}
${input.budgetCents ? `预算：¥${(input.budgetCents / 100).toLocaleString()}` : ''}

请严格按照系统提示的 JSON 格式输出，siteIds 必须从候选数据库中选择。`;

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
        max_tokens: 3000,
        temperature: 0.6,
        stream: false,
        chat_template_kwargs: { enable_thinking: false },
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`LLM API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const rawContent: string = data.choices?.[0]?.message?.content || '';
    const cleaned = this.stripThinkingPrefix(rawContent);

    // Extract JSON from possible markdown wrapping
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('LLM response contains no JSON');
    }

    let parsed: { plans?: AiTripPlan[] };
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      throw new Error(`Failed to parse LLM JSON: ${(e as Error).message}`);
    }

    if (!parsed.plans || !Array.isArray(parsed.plans)) {
      throw new Error('LLM response missing plans array');
    }

    return parsed.plans;
  }

  private stripThinkingPrefix(content: string): string {
    const thinkTagMatch = content.match(/<\/think>\s*([\s\S]*)/);
    if (thinkTagMatch) return thinkTagMatch[1].trim();
    const thinkPrefixMatch = content.match(/^Thinking Process:[\s\S]*?\n\n([\s\S]*)/);
    if (thinkPrefixMatch) return thinkPrefixMatch[1].trim();
    return content;
  }

  // ──────────────────────────────────────────────
  //  Validation: whitelist siteIds
  // ──────────────────────────────────────────────

  private validateAndFilterPlans(
    plans: AiTripPlan[],
    candidates: SiteCandidate[],
  ): AiTripPlan[] {
    const validIds = new Set(candidates.map((c) => c.id));
    return plans
      .map((p, idx) => {
        const filteredIds = (p.siteIds || []).filter((id) => validIds.has(id));
        return {
          id: p.id || `plan_${idx + 1}`,
          title: p.title || `方案 ${idx + 1}`,
          subtitle: p.subtitle || '',
          summary: p.summary || '',
          days: p.days || 4,
          estimatedBudgetCents: p.estimatedBudgetCents || 500000,
          siteIds: filteredIds,
          packageHints: {
            accommodation: p.packageHints?.accommodation || '当地精品酒店',
            transportation: p.packageHints?.transportation || '高铁+包车',
            meals: p.packageHints?.meals || '当地特色餐饮',
            pace: p.packageHints?.pace || '平衡',
            highlights: Array.isArray(p.packageHints?.highlights)
              ? p.packageHints.highlights
              : [],
          },
        };
      })
      .filter((p) => p.siteIds.length >= 2);
  }

  // ──────────────────────────────────────────────
  //  Rule-based fallback
  // ──────────────────────────────────────────────

  private generateRulePlans(
    input: PlanTripDto,
    candidates: SiteCandidate[],
    days: number,
  ): AiTripPlan[] {
    const text = `${input.title} ${input.note || ''}`.toLowerCase();

    // Score each candidate by relevance to user input
    const keywords = [
      { kw: ['六祖', '慧能', '禅宗', '禅'], religionSlug: 'buddhism' },
      { kw: ['佛', '佛教', '菩萨', '寺'], religionSlug: 'buddhism' },
      { kw: ['道', '道教', '老子', '庄子'], religionSlug: 'taoism' },
      { kw: ['基督', '教堂', '耶稣'], religionSlug: 'christianity' },
      { kw: ['伊斯兰', '清真', '麦加', '穆斯林'], religionSlug: 'islam' },
      { kw: ['印度教', '印度'], religionSlug: 'hinduism' },
      { kw: ['犹太'], religionSlug: 'judaism' },
      { kw: ['神道', '日本'], religionSlug: 'shinto' },
      { kw: ['藏传', '西藏', '密宗'], religionSlug: 'tibetan_buddhism' },
    ];

    let matchedSlug = '';
    for (const k of keywords) {
      if (k.kw.some((w) => text.includes(w.toLowerCase()))) {
        matchedSlug = k.religionSlug;
        break;
      }
    }

    // Also score by name match
    const scored = candidates
      .map((c) => {
        let score = 0;
        if (matchedSlug && c.religionSlug === matchedSlug) score += 10;
        if (c.name && text.includes(c.name.toLowerCase())) score += 20;
        if (c.country && text.includes(c.country.toLowerCase())) score += 5;
        return { c, score };
      })
      .sort((a, b) => b.score - a.score);

    const topMatches = scored.filter((s) => s.score > 0).map((s) => s.c);
    const fallbackPool =
      topMatches.length >= 2
        ? topMatches
        : candidates.slice(0, 8);

    const classicCount = Math.min(5, fallbackPool.length);
    const deepCount = Math.min(8, fallbackPool.length);
    const quickCount = Math.min(3, fallbackPool.length);

    const plans: AiTripPlan[] = [];

    if (classicCount >= 2) {
      plans.push({
        id: 'rule_classic',
        title: '经典朝圣线',
        subtitle: fallbackPool
          .slice(0, classicCount)
          .map((s) => s.name)
          .join(' → '),
        summary: `精选 ${classicCount} 处核心圣地，节奏适中，适合首次朝圣`,
        days,
        estimatedBudgetCents: input.budgetCents || 500000,
        siteIds: fallbackPool.slice(0, classicCount).map((s) => s.id),
        packageHints: {
          accommodation: '当地四星级酒店或寺院挂单',
          transportation: '高铁 + 包车接送',
          meals: '寺院素斋 + 地方特色',
          pace: '平衡',
          highlights: ['核心圣地全覆盖', '专业领队讲解', '文化深度体验'],
        },
      });
    }

    if (deepCount >= 4 && fallbackPool.length >= 4) {
      plans.push({
        id: 'rule_deep',
        title: '深度沉浸版',
        subtitle: fallbackPool
          .slice(0, deepCount)
          .map((s) => s.name)
          .join(' → '),
        summary: `${deepCount} 处圣地深度走访，每处停留充分，适合资深朝圣者`,
        days: days + 2,
        estimatedBudgetCents: Math.round((input.budgetCents || 500000) * 1.6),
        siteIds: fallbackPool.slice(0, deepCount).map((s) => s.id),
        packageHints: {
          accommodation: '禅意酒店 + 寺院禅修体验',
          transportation: '高铁 + 专车',
          meals: '寺院素斋为主，养生餐饮',
          pace: '宽松',
          highlights: ['每处圣地停留 1-2 天', '抄经禅修体验', '与师父对话'],
        },
      });
    }

    if (quickCount >= 2) {
      plans.push({
        id: 'rule_quick',
        title: '精华速览版',
        subtitle: fallbackPool
          .slice(0, quickCount)
          .map((s) => s.name)
          .join(' → '),
        summary: `${quickCount} 处必访圣地紧凑行程，适合时间有限的朝圣者`,
        days: Math.max(2, days - 1),
        estimatedBudgetCents: Math.round((input.budgetCents || 500000) * 0.6),
        siteIds: fallbackPool.slice(0, quickCount).map((s) => s.id),
        packageHints: {
          accommodation: '商务连锁酒店',
          transportation: '高铁 + 滴滴/打车',
          meals: '快捷正餐 + 当地小吃',
          pace: '紧凑',
          highlights: ['性价比高', '行程紧凑', '核心打卡'],
        },
      });
    }

    return plans;
  }
}
