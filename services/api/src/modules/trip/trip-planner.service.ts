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

export interface EnrichedSiteData {
  name: string;
  nameEn?: string;
  country: string;
  city?: string;
  latitude: number;
  longitude: number;
  religionSlug: string;
  description: string;
  source: 'AI_KNOWLEDGE';
  confidence: number;
}

export interface PlanTripResult {
  plans: AiTripPlan[];
  source: 'llm' | 'rule';
  warning?: string;
  /** Map from ext_xxx temporary id → enriched site data (frontend uses this to bulk-create real holy sites) */
  enrichedSites?: Record<string, EnrichedSiteData>;
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

    // Phase 1: Mention extraction + missing-site enrichment via LLM knowledge base
    let enrichedCandidates: SiteCandidate[] = [];
    let enrichedMap: Record<string, EnrichedSiteData> = {};
    if (this.isLLMEnabled) {
      try {
        const mentioned = await this.extractMentionedSites(input);
        if (mentioned.length > 0) {
          const missing = this.findMissingMentions(mentioned, candidates);
          if (missing.length > 0) {
            this.logger.log(
              `Found ${missing.length} missing sites in user query: ${missing.map((m) => m.name).join(', ')}`,
            );
            const enriched = await this.enrichMissingSites(missing);
            for (const e of enriched) {
              const extId = `ext_${Math.random().toString(36).slice(2, 12)}`;
              enrichedMap[extId] = e;
              enrichedCandidates.push({
                id: extId,
                name: e.name,
                nameEn: e.nameEn || '',
                country: e.country,
                religionName: e.religionSlug,
                religionSlug: e.religionSlug,
                description: e.description.substring(0, 300),
              });
            }
          }
        }
      } catch (err) {
        this.logger.warn(`Mention enrichment failed (non-fatal): ${(err as Error).message}`);
      }
    }

    const allCandidates = [...candidates, ...enrichedCandidates];

    // Phase 2: Main LLM planning
    if (this.isLLMEnabled) {
      try {
        const llmPlans = await this.callLLMForPlans(input, allCandidates, days);
        this.logger.log(`LLM returned ${llmPlans.length} plans, candidate pool size: ${allCandidates.length}`);
        for (const p of llmPlans) {
          this.logger.log(`  Plan "${p.title}": siteIds=[${(p.siteIds || []).join(',')}]`);
        }
        const validated = this.validateAndFilterPlans(llmPlans, allCandidates);
        this.logger.log(`After validation: ${validated.length} valid plans (need siteIds.length >= 2)`);
        if (validated.length > 0) {
          // Trim enrichedMap to only contain ext ids that survived validation
          const usedExtIds = new Set<string>();
          for (const p of validated) {
            for (const id of p.siteIds) {
              if (id.startsWith('ext_')) usedExtIds.add(id);
            }
          }
          const trimmedEnriched: Record<string, EnrichedSiteData> = {};
          for (const id of usedExtIds) {
            if (enrichedMap[id]) trimmedEnriched[id] = enrichedMap[id];
          }
          return {
            plans: validated,
            source: 'llm',
            ...(Object.keys(trimmedEnriched).length > 0
              ? { enrichedSites: trimmedEnriched }
              : {}),
          };
        }
        this.logger.warn('LLM returned no valid plans, falling back to rules');
      } catch (err) {
        this.logger.error(`LLM planning failed: ${(err as Error).message}`);
      }
    }

    // Rule-based fallback (uses DB candidates only — no enrichment without LLM)
    const rulePlans = this.generateRulePlans(input, candidates, days);
    if (rulePlans.length === 0) {
      return {
        plans: [],
        source: 'rule',
        warning:
          'AI 暂时不可用，且未在圣地库中匹配到与您诉求高度相关的目的地。请尝试在标题或备注中提及具体的宗教/祖师/圣地名称，或在下方手动选择圣地。',
      };
    }
    return {
      plans: rulePlans,
      source: 'rule',
      warning: this.isLLMEnabled
        ? 'AI 暂时不可用，已根据您的关键词为您匹配相关圣地'
        : undefined,
    };
  }

  // ──────────────────────────────────────────────
  //  Mention extraction & enrichment (LLM knowledge)
  // ──────────────────────────────────────────────

  /**
   * Phase 1.1: Ask LLM to extract any specific holy site / temple / shrine names
   * the user mentioned in title + note. Returns [] if user only described a theme.
   */
  private async extractMentionedSites(
    input: PlanTripDto,
  ): Promise<Array<{ name: string; religionGuess?: string }>> {
    const text = `${input.title}\n${input.note || ''}`.trim();
    if (text.length < 4) return [];

    const systemPrompt = `你是一个文本信息提取器。任务：从用户的旅行需求文本中,提取所有明确提到的具体祖庭/寺院/道观/教堂/清真寺/神社/朝圣地名称。

规则:
1. 只提取确切的专有名词(如"南华寺"、"纯阳观"、"耶路撒冷哭墙"),不要提取宽泛主题词(如"佛教圣地"、"禅宗")
2. 同一个地点不要重复
3. 如果用户只描述主题,没有提具体名字,返回空数组
4. 输出严格JSON,无任何markdown或解释

输出格式:
{"sites":[{"name":"南华寺","religionGuess":"佛教"},{"name":"纯阳观","religionGuess":"道教"}]}

religionGuess 可选值: 佛教/道教/禅宗/基督教/天主教/伊斯兰教/印度教/犹太教/儒教/锡克教/神道教/藏传佛教/巴哈伊教/原住民/未知`;

    const raw = await this.callLLMRaw(systemPrompt, text, 600, 30000);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];
    try {
      const parsed = JSON.parse(jsonMatch[0]) as {
        sites?: Array<{ name?: string; religionGuess?: string }>;
      };
      const sites = (parsed.sites || [])
        .filter((s) => s.name && s.name.trim().length >= 2)
        .map((s) => ({ name: s.name!.trim(), religionGuess: s.religionGuess }));
      // Dedupe by name
      const seen = new Set<string>();
      return sites.filter((s) => {
        if (seen.has(s.name)) return false;
        seen.add(s.name);
        return true;
      });
    } catch {
      return [];
    }
  }

  /**
   * Phase 1.2: Compare extracted names against DB candidates. Anything not found
   * (after fuzzy match) is "missing" and needs enrichment.
   */
  private findMissingMentions(
    mentioned: Array<{ name: string; religionGuess?: string }>,
    candidates: SiteCandidate[],
  ): Array<{ name: string; religionGuess?: string }> {
    return mentioned.filter((m) => {
      const mName = m.name.replace(/[寺观宫庙院堂祠]$/g, ''); // strip common suffix
      return !candidates.some((c) => {
        const cName = c.name;
        return (
          cName === m.name ||
          cName.includes(m.name) ||
          m.name.includes(cName) ||
          (mName.length >= 2 && cName.includes(mName))
        );
      });
    });
  }

  /**
   * Phase 1.3: Ask LLM (knowledge base) to fill in geographic + religious data
   * for missing sites. Discards items with confidence < 0.6 or unknown=true.
   */
  private async enrichMissingSites(
    missing: Array<{ name: string; religionGuess?: string }>,
  ): Promise<EnrichedSiteData[]> {
    if (missing.length === 0) return [];

    const systemPrompt = `你是一位精通全球宗教历史地理的专家。任务:为给定的祖庭/寺院/道观/教堂/清真寺名称生成结构化资料。

铁律:
1. 必须基于真实历史地理知识,绝不虚构
2. 对每个名称生成一个对象,包含: name, nameEn, country, city, latitude, longitude, religionSlug, description, confidence, unknown
3. religionSlug 必须是以下之一: buddhism, taoism, christianity, islam, hinduism, judaism, shinto, tibetan-buddhism, confucianism, sikhism, bahai, indigenous
4. description 100-200 字中文,介绍历史背景和宗教地位
5. confidence: 0-1,你对这条数据的把握度
6. 如果完全不认识这个名字或不确定,设置 unknown:true 且 confidence:0
7. 输出严格 JSON,无任何 markdown

输出格式:
{"sites":[{"name":"纯阳观","nameEn":"Chunyang Temple","country":"中国","city":"广州","latitude":23.1295,"longitude":113.2644,"religionSlug":"taoism","description":"广州纯阳观位于...","confidence":0.92,"unknown":false}]}`;

    const userPrompt = `请为以下 ${missing.length} 个名称生成结构化资料:\n${missing
      .map((m, i) => `${i + 1}. ${m.name}${m.religionGuess ? ` (${m.religionGuess})` : ''}`)
      .join('\n')}`;

    const raw = await this.callLLMRaw(systemPrompt, userPrompt, 2000, 60000);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];
    try {
      const parsed = JSON.parse(jsonMatch[0]) as {
        sites?: Array<Partial<EnrichedSiteData> & { unknown?: boolean }>;
      };
      const result: EnrichedSiteData[] = [];
      for (const s of parsed.sites || []) {
        if (s.unknown || (s.confidence ?? 0) < 0.6) continue;
        if (!s.name || !s.country || s.latitude == null || s.longitude == null) continue;
        if (!s.religionSlug || !s.description) continue;
        result.push({
          name: s.name,
          nameEn: s.nameEn,
          country: s.country,
          city: s.city,
          latitude: s.latitude,
          longitude: s.longitude,
          religionSlug: s.religionSlug,
          description: s.description,
          source: 'AI_KNOWLEDGE',
          confidence: s.confidence ?? 0,
        });
      }
      return result;
    } catch (e) {
      this.logger.warn(`enrichMissingSites parse failed: ${(e as Error).message}`);
      return [];
    }
  }

  /**
   * Shared LLM call helper. Returns raw cleaned content (no JSON parsing).
   */
  private async callLLMRaw(
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number,
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
        temperature: 0.3,
        stream: false,
        chat_template_kwargs: { enable_thinking: false },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
      throw new Error(`LLM API error ${response.status}`);
    }
    const data = await response.json();
    const raw: string = data.choices?.[0]?.message?.content || '';
    return this.stripThinkingPrefix(raw);
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
      description: (s.description || '').substring(0, 300),
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

**铁律（按优先级排列）**：
1. **用户备注是最高优先级！** 备注中描述的主题、线索、时间轴、路线要求、历史脉络等，是规划方案的核心依据。你必须深入理解备注含义并据此设计路线逻辑。例如"基于六祖大师生平弘法时间轴来"意味着必须按慧能大师出生(新州/国恩寺)→求法(东山寺/黄梅)→剃度/弘法(光孝寺/南华寺)的历史时间顺序来编排圣地，而不是随机拼凑。**每个圣地都必须与用户指定的主题人物或事件有直接的历史关联**，不能仅因为同属一个宗教就混入无关圣地（例如少林寺与六祖慧能无关，不应出现在慧能路线中）
2. **siteIds 必须精确复制候选列表中每条记录 id="" 引号内的完整字符串**（如 "cmnq29gke0018pxyh6spql9ri" 或 "ext_a1b2c3d4"），绝对不能用圣地名称代替 id，绝对不能自己编造 id
3. 候选库中以 \`ext_\` 开头的 id 是 AI 知识库为用户补全的祖庭(用户在备注中明确提到了名字),请放心使用,会在后续流程中校验入库
4. 必须根据用户标题和备注的语义判断主题（例如"六祖慧能"→ 选南华寺/国恩寺/光孝寺等禅宗圣地，绝不混入伊斯兰/印度教圣地）
5. **如果用户在备注中明确列出了一组朝圣地点(无论是 DB 内还是 ext_),至少有一条方案必须把用户列出的全部地点串联起来,作为"用户指定路线"方案**
6. **如果用户在备注中给出了编排逻辑(如时间轴/地理顺序/历史脉络),方案的 siteIds 顺序必须遵循该逻辑,不可随意排列**
7. 每条方案的 summary 必须解释该方案的编排逻辑和亮点，而不是泛泛的一句话
8. 每条方案至少包含 2 个圣地，最多 8 个
9. 输出严格的 JSON，不要任何 markdown 包裹、不要解释文字
10. 必须输出 2 或 3 条方案，每条主题不同（例如：时间轴版/地理路线版/精华速览版）

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
${input.note ? `【重要】用户特殊备注（必须作为方案设计的核心依据）：${input.note}` : ''}
${days ? `预计天数：${days} 天` : ''}
${input.persons ? `出行人数：${input.persons} 人` : ''}
${input.budgetCents ? `预算：¥${(input.budgetCents / 100).toLocaleString()}` : ''}

请深入理解用户的备注需求，据此精心设计方案。siteIds 必须从候选数据库中选择，按照用户期望的逻辑顺序排列。`;

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
      // Try to repair common LLM JSON issues: trailing commas, truncated content
      const repaired = jsonMatch[0]
        .replace(/,\s*([\]}])/g, '$1')  // remove trailing commas
        .replace(/\n/g, ' ');           // normalize newlines
      try {
        parsed = JSON.parse(repaired);
        this.logger.warn('LLM JSON was repaired (trailing comma or newline issue)');
      } catch {
        this.logger.error(`LLM raw output (first 500 chars): ${cleaned.substring(0, 500)}`);
        throw new Error(`Failed to parse LLM JSON: ${(e as Error).message}`);
      }
    }

    if (!parsed.plans || !Array.isArray(parsed.plans)) {
      throw new Error('LLM response missing plans array');
    }

    return parsed.plans;
  }

  /**
   * Extract content tokens from user query for text matching.
   * For CJK input, generates 2-char and 3-char substrings (since description text
   * mentions things like "六祖慧能" / "禅宗" — substring containment is the cheapest match).
   * For ASCII input, splits on whitespace and keeps tokens of length >= 3.
   */
  private extractQueryTokens(text: string): string[] {
    const stopwords = new Set([
      '的', '了', '和', '是', '我', '想', '去', '要', '在', '有', '一', '个', '路线', '行程',
      '设计', '根据', '时间', '大师', '请', '帮我', '安排', '需要', '希望',
      'the', 'and', 'for', 'with', 'trip', 'route', 'plan', 'tour',
    ]);
    const tokens = new Set<string>();

    // CJK 2-char and 3-char windows
    const cjkOnly = text.replace(/[^\u4e00-\u9fa5]+/g, ' ');
    for (const segment of cjkOnly.split(/\s+/)) {
      if (segment.length < 2) continue;
      for (let len = 2; len <= 3; len++) {
        for (let i = 0; i + len <= segment.length; i++) {
          const tok = segment.substring(i, i + len);
          if (!stopwords.has(tok)) tokens.add(tok.toLowerCase());
        }
      }
    }

    // ASCII words
    for (const w of text.toLowerCase().split(/[^a-z0-9]+/)) {
      if (w.length >= 3 && !stopwords.has(w)) tokens.add(w);
    }

    return [...tokens];
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

    // Build name→id lookup for fallback when LLM uses site names instead of IDs
    const nameToId = new Map<string, string>();
    for (const c of candidates) {
      nameToId.set(c.name, c.id);
      nameToId.set(c.name.toLowerCase(), c.id);
      if (c.nameEn) nameToId.set(c.nameEn.toLowerCase(), c.id);
      // Also map "ext_名称" pattern (LLM sometimes prefixes names with ext_)
      nameToId.set(`ext_${c.name}`, c.id);
    }

    return plans
      .map((p, idx) => {
        // Filter to valid IDs and dedupe; try name→id rescue for invalid IDs
        const seen = new Set<string>();
        const filteredIds = (p.siteIds || []).map((id) => {
          // If id is valid, use it directly
          if (validIds.has(id)) return id;
          // Try name→id rescue
          const rescued = nameToId.get(id) || nameToId.get(id.toLowerCase());
          if (rescued) {
            this.logger.warn(`Rescued invalid siteId "${id}" → "${rescued}" via name lookup`);
            return rescued;
          }
          return null;
        }).filter((id): id is string => {
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });
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
    const text = `${input.title} ${input.note || ''}`;
    const textLower = text.toLowerCase();

    // Religion keyword groups (slug must match Religion.slug in DB exactly)
    const keywordGroups = [
      { kw: ['六祖', '慧能', '禅宗', '禅', '佛', '佛教', '菩萨', '寺', '和尚', '法师', '出家'], religionSlug: 'buddhism' },
      { kw: ['道', '道教', '老子', '庄子', '太极', '三清'], religionSlug: 'taoism' },
      { kw: ['基督', '天主', '教堂', '耶稣', '圣母', '教皇'], religionSlug: 'christianity' },
      { kw: ['伊斯兰', '清真', '麦加', '穆斯林', '古兰', '安拉'], religionSlug: 'islam' },
      { kw: ['印度教', 'hindu', '湿婆', '梵天', '毗湿奴'], religionSlug: 'hinduism' },
      { kw: ['犹太', '希伯来', '圣殿山', '哭墙'], religionSlug: 'judaism' },
      { kw: ['神道', '日本神社', '天照'], religionSlug: 'shinto' },
      { kw: ['藏传', '西藏', '密宗', '喇嘛', '活佛', '唐卡'], religionSlug: 'tibetan-buddhism' },
      { kw: ['儒', '孔子', '孟子', '书院', '文庙'], religionSlug: 'confucianism' },
      { kw: ['锡克', '古鲁'], religionSlug: 'sikhism' },
      { kw: ['巴哈伊', '灵曦堂'], religionSlug: 'bahai' },
      { kw: ['原住民', '萨满', '图腾'], religionSlug: 'indigenous' },
    ];

    const matchedSlugs = new Set<string>();
    for (const g of keywordGroups) {
      if (g.kw.some((w) => textLower.includes(w.toLowerCase()))) {
        matchedSlugs.add(g.religionSlug);
      }
    }

    // Extract content tokens from user query (Chinese 2+ char substrings) for description match
    const queryTokens = this.extractQueryTokens(text);

    const scored = candidates
      .map((c) => {
        let score = 0;
        const nameLower = c.name.toLowerCase();
        const descLower = (c.description || '').toLowerCase();

        // Religion match
        if (matchedSlugs.has(c.religionSlug)) score += 10;

        // Strong: name fragment in user text or vice versa
        if (textLower.includes(nameLower)) score += 50;

        // Strong: any query token appears in description (this is what links 六祖慧能 → 南华禅寺)
        for (const tok of queryTokens) {
          if (nameLower.includes(tok)) score += 30;
          if (descLower.includes(tok)) score += 20;
        }

        // Mild: country match
        if (c.country && textLower.includes(c.country.toLowerCase())) score += 5;

        return { c, score };
      })
      .sort((a, b) => b.score - a.score);

    const topMatches = scored.filter((s) => s.score > 0).map((s) => s.c);

    // No blind alphabetical fallback — if nothing matches, return empty so caller surfaces a clear warning
    if (topMatches.length < 2) {
      return [];
    }

    const fallbackPool = topMatches;

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
