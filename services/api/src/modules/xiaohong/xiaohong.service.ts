import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, Subscriber } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AiConfigService } from '../ai-config/ai-config.service';
import {
  ChatIntent,
  ChatResponse,
  INTENT_KEYWORDS,
  RelatedData,
  ReligionWithRelations,
  HolySiteWithReligion,
  TempleWithReligion,
  PatriarchWithReligion,
  TeachingWithReligion,
  SummarizedData,
  SummarizedItem,
} from './xiaohong.types';
import type { Religion, Seal } from '@prisma/client';

/** OpenAI-compatible message format */
interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** 小鸿的性格语录，用于规则引擎降级模式 */
const GREETINGS: Record<ChatIntent, string[]> = {
  [ChatIntent.RELIGION_INFO]: [
    '让我为你介绍这个伟大的信仰传统。',
    '每一种信仰都是人类灵性探索的珍贵结晶。',
  ],
  [ChatIntent.HOLY_SITE_INFO]: [
    '这些圣地承载着千年的信仰力量。',
    '走进圣地，就是走进人类灵魂最深处的渴望。',
  ],
  [ChatIntent.TEMPLE_INFO]: [
    '祖庭是信仰的根，是传承的源。',
    '每一座祖庭都有说不完的故事。',
  ],
  [ChatIntent.PATRIARCH_INFO]: [
    '祖师们以生命诠释了信仰的真谛。',
    '了解祖师，就是了解信仰的灵魂。',
  ],
  [ChatIntent.TEACHING_INFO]: [
    '祖训是千年智慧的结晶，字字珠玑。',
    '让我们一起品味这些穿越时空的教导。',
  ],
  [ChatIntent.SEAL_INFO]: [
    '曹溪愿命三十印，印印相连，层层深入。',
    '修行从发愿开始，每一印都是一次生命的蜕变。',
  ],
  [ChatIntent.TRIP_PLANNING]: [
    '朝圣之旅，是身体和灵魂同时出发的旅程。',
    '让我帮你规划一条有意义的祖庭之路。',
  ],
  [ChatIntent.PRACTICE_GUIDE]: [
    '修行不在远方，就在当下这一刻。',
    '静下心来，让我们一起感受内在的宁静。',
  ],
  [ChatIntent.GENERAL]: [
    '你好！我是小鸿，你的祖庭旅行与修行伙伴。有什么我能帮你的吗？',
    '你好！小鸿在这里，随时为你的灵性之旅提供指引。',
  ],
};

@Injectable()
export class XiaohongService {
  private readonly logger = new Logger(XiaohongService.name);
  private readonly llmBaseUrl: string;
  private readonly llmApiKey: string;
  private readonly llmModel: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly aiConfig: AiConfigService,
  ) {
    this.llmBaseUrl = this.config.get<string>('LLM_BASE_URL', '');
    this.llmApiKey = this.config.get<string>('LLM_API_KEY', '');
    this.llmModel = this.config.get<string>('LLM_MODEL', '');

    if (this.isLLMEnabled) {
      this.logger.log(`LLM enabled: ${this.llmBaseUrl} model=${this.llmModel}`);
    } else {
      this.logger.warn('LLM_BASE_URL not set — using rule-based fallback');
    }
  }

  private get isLLMEnabled(): boolean {
    return !!this.llmBaseUrl;
  }

  // ──────────────────────────────────────────────
  //  意图检测
  // ──────────────────────────────────────────────

  detectIntent(message: string): ChatIntent {
    const lower = message.toLowerCase();
    const priorityOrder: ChatIntent[] = [
      ChatIntent.SEAL_INFO, ChatIntent.HOLY_SITE_INFO, ChatIntent.TEMPLE_INFO,
      ChatIntent.PATRIARCH_INFO, ChatIntent.TEACHING_INFO, ChatIntent.RELIGION_INFO,
      ChatIntent.TRIP_PLANNING, ChatIntent.PRACTICE_GUIDE,
    ];
    for (const intent of priorityOrder) {
      if (INTENT_KEYWORDS[intent].some((kw) => lower.includes(kw.toLowerCase()))) return intent;
    }
    return ChatIntent.GENERAL;
  }

  // ──────────────────────────────────────────────
  //  RAG: 获取相关数据
  // ──────────────────────────────────────────────

  private async fetchRelatedData(intent: ChatIntent, message: string): Promise<RelatedData> {
    switch (intent) {
      case ChatIntent.RELIGION_INFO: {
        const religions = await this.prisma.religion.findMany({ take: 100, orderBy: { name: 'asc' } });
        const matched = religions.find((r) => message.includes(r.name) || message.includes(r.nameEn));
        if (matched) {
          return await this.prisma.religion.findUnique({
            where: { id: matched.id },
            include: { holySites: { take: 5 }, temples: { take: 5 }, patriarchs: { take: 3 }, teachings: { take: 3 } },
          });
        }
        return religions;
      }
      case ChatIntent.HOLY_SITE_INFO: {
        const sites = await this.prisma.holySite.findMany({ take: 100, include: { religion: true }, orderBy: { name: 'asc' } });
        const matched = sites.filter((s) => message.includes(s.name) || message.includes(s.nameEn) || message.includes(s.religion.name));
        return matched.length > 0 ? matched : sites.slice(0, 10);
      }
      case ChatIntent.TEMPLE_INFO: {
        const temples = await this.prisma.temple.findMany({ take: 100, include: { religion: true }, orderBy: { name: 'asc' } });
        const matched = temples.filter((t) => message.includes(t.name) || (t.nameEn && message.includes(t.nameEn)) || message.includes(t.religion.name));
        return matched.length > 0 ? matched : temples.slice(0, 10);
      }
      case ChatIntent.PATRIARCH_INFO: {
        const patriarchs = await this.prisma.patriarch.findMany({ take: 100, include: { religion: true }, orderBy: { name: 'asc' } });
        const matched = patriarchs.filter((p) => message.includes(p.name) || (p.nameEn && message.includes(p.nameEn)) || message.includes(p.religion.name));
        return matched.length > 0 ? matched : patriarchs.slice(0, 10);
      }
      case ChatIntent.TEACHING_INFO: {
        const teachings = await this.prisma.teaching.findMany({ take: 100, include: { religion: true }, orderBy: { name: 'asc' } });
        const matched = teachings.filter((t) => message.includes(t.name) || message.includes(t.religion.name));
        return matched.length > 0 ? matched : teachings.slice(0, 10);
      }
      case ChatIntent.SEAL_INFO: {
        const seals = await this.prisma.seal.findMany({ take: 100, orderBy: { id: 'asc' } });
        const seriesMap: Record<string, string> = { 初印: 'CHUYIN', 中印: 'ZHONGYIN', 印果: 'YINGUOYIN', 成道: 'CHENGDAOYIN', 归源: 'GUIYUANYIN' };
        for (const [keyword, series] of Object.entries(seriesMap)) {
          if (message.includes(keyword)) return seals.filter((s) => s.series === series);
        }
        return seals;
      }
      default:
        return null;
    }
  }

  // ──────────────────────────────────────────────
  //  RAG: 格式化上下文
  // ──────────────────────────────────────────────

  private formatRAGContext(intent: ChatIntent, data: RelatedData): string {
    if (!data) return '';
    switch (intent) {
      case ChatIntent.RELIGION_INFO: {
        if (Array.isArray(data)) {
          return `\n\n## 平台收录的12大信仰\n${(data as Religion[]).map((r) => `- ${r.name}（${r.nameEn}）`).join('\n')}`;
        }
        const r = data as ReligionWithRelations;
        let text = `\n\n## ${r.name}（${r.nameEn}）详细信息`;
        if (r.holySites?.length) text += `\n### 圣地\n${r.holySites.map((s) => `- ${s.name}（${s.nameEn}），${s.country}：${s.description.substring(0, 150)}`).join('\n')}`;
        if (r.temples?.length) text += `\n### 祖庭\n${r.temples.map((t) => `- ${t.name}，${t.country}：${t.description.substring(0, 150)}`).join('\n')}`;
        if (r.patriarchs?.length) text += `\n### 祖师\n${r.patriarchs.map((p) => `- ${p.name}${p.title ? `（${p.title}）` : ''}：${p.coreTeaching.substring(0, 150)}`).join('\n')}`;
        if ((r as any).teachings?.length) text += `\n### 祖训\n${(r as any).teachings.map((t: any) => `- ${t.name}：${t.originalText.substring(0, 150)}`).join('\n')}`;
        return text;
      }
      case ChatIntent.HOLY_SITE_INFO:
        return `\n\n## 相关圣地\n${(data as HolySiteWithReligion[]).slice(0, 8).map((s) => `- **${s.name}**（${s.nameEn}），${s.country}，${s.religion.name}\n  ${s.description.substring(0, 200)}`).join('\n')}`;
      case ChatIntent.TEMPLE_INFO:
        return `\n\n## 相关祖庭\n${(data as TempleWithReligion[]).slice(0, 8).map((t) => `- **${t.name}**，${t.country}，${t.religion.name}\n  ${t.description.substring(0, 200)}`).join('\n')}`;
      case ChatIntent.PATRIARCH_INFO:
        return `\n\n## 相关祖师\n${(data as PatriarchWithReligion[]).slice(0, 8).map((p) => `- **${p.name}**，${p.religion.name}\n  ${p.biography.substring(0, 150)}\n  核心教导：${p.coreTeaching.substring(0, 150)}`).join('\n')}`;
      case ChatIntent.TEACHING_INFO:
        return `\n\n## 相关祖训\n${(data as TeachingWithReligion[]).slice(0, 8).map((t) => `- **${t.name}**（${t.religion.name}）\n  ${t.originalText.substring(0, 200)}`).join('\n')}`;
      case ChatIntent.SEAL_INFO: {
        const names: Record<string, string> = { CHUYIN: '初印系', ZHONGYIN: '中印系', YINGUOYIN: '印果印', CHENGDAOYIN: '成道印', GUIYUANYIN: '归源印' };
        return `\n\n## 曹溪三十印\n${(data as Seal[]).slice(0, 10).map((s) => `- **第${s.id}印·${s.name}**（${names[s.series]}）\n  诗偈：${s.poem.substring(0, 100)}\n  修行：${s.practice.substring(0, 100)}`).join('\n')}`;
      }
      default:
        return '';
    }
  }

  // ──────────────────────────────────────────────
  //  对话历史
  // ──────────────────────────────────────────────

  private async getOrCreateConversation(userId: string, conversationId?: string): Promise<string> {
    if (conversationId) {
      const existing = await this.prisma.conversation.findFirst({ where: { id: conversationId, userId } });
      if (existing) return existing.id;
    }
    return (await this.prisma.conversation.create({ data: { userId } })).id;
  }

  private async getConversationHistory(conversationId: string, maxRounds: number): Promise<LLMMessage[]> {
    const messages = await this.prisma.conversationMessage.findMany({
      where: { conversationId }, orderBy: { createdAt: 'desc' }, take: maxRounds * 2,
    });
    return messages.reverse().map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  }

  private async saveMessage(conversationId: string, role: string, content: string, intent?: string, tokenCount?: number) {
    await this.prisma.conversationMessage.create({ data: { conversationId, role, content, intent, tokenCount } });
    if (role === 'user') {
      const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
      if (conv && !conv.title) {
        await this.prisma.conversation.update({ where: { id: conversationId }, data: { title: content.substring(0, 50) } });
      }
    }
  }

  // ──────────────────────────────────────────────
  //  LLM: OpenAI-compatible API (vLLM Qwen3.5)
  // ──────────────────────────────────────────────

  private async callLLM(systemPrompt: string, messages: LLMMessage[], model: string, maxTokens: number, temperature: number) {
    const allMessages: LLMMessage[] = [{ role: 'system', content: systemPrompt }, ...messages];
    const response = await fetch(`${this.llmBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.llmApiKey ? { Authorization: `Bearer ${this.llmApiKey}` } : {}),
      },
      body: JSON.stringify({
        model, messages: allMessages, max_tokens: maxTokens, temperature, stream: false,
        // Disable Qwen3.5 thinking/reasoning mode for faster, cleaner responses
        chat_template_kwargs: { enable_thinking: false },
      }),
      signal: AbortSignal.timeout(180000),
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`LLM API error ${response.status}: ${errText}`);
    }
    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';
    return { content: this.stripThinkingPrefix(rawContent), totalTokens: data.usage?.total_tokens || 0 };
  }

  /** Strip Qwen3.5 "Thinking Process:" prefix if present */
  private stripThinkingPrefix(content: string): string {
    // Qwen3.5 may output thinking blocks like <think>...</think> or "Thinking Process:\n..."
    const thinkTagMatch = content.match(/<\/think>\s*([\s\S]*)/);
    if (thinkTagMatch) return thinkTagMatch[1].trim();
    const thinkPrefixMatch = content.match(/^Thinking Process:[\s\S]*?\n\n([\s\S]*)/);
    if (thinkPrefixMatch) return thinkPrefixMatch[1].trim();
    return content;
  }

  private async buildSystemPrompt(intent: ChatIntent, ragContext: string): Promise<string> {
    const systemPrompt = await this.aiConfig.getOrDefault('system_prompt', '你是小鸿，全球祖庭旅行平台的AI助手。');
    const safetyPrompt = await this.aiConfig.getOrDefault('safety_prompt', '');
    let fullPrompt = systemPrompt;
    if (safetyPrompt) fullPrompt += `\n\n${safetyPrompt}`;
    if (ragContext) fullPrompt += `\n\n---\n以下是从平台数据库检索到的相关数据，请基于这些数据回答：${ragContext}`;
    fullPrompt += `\n\n检测到的用户意图：${intent}`;
    return fullPrompt;
  }

  // ──────────────────────────────────────────────
  //  普通聊天
  // ──────────────────────────────────────────────

  async chat(message: string, userId?: string, conversationId?: string): Promise<ChatResponse> {
    const intent = this.detectIntent(message);
    this.logger.log(`Intent: ${intent} for: "${message.substring(0, 50)}"`);

    if (!this.isLLMEnabled) return this.chatFallback(intent, message);

    try {
      const cfg = await this.aiConfig.getMap(['model', 'max_tokens', 'temperature', 'context_window', 'enable_rag', 'enable_history']);
      const model = cfg['model'] || this.llmModel;
      const maxTokens = parseInt(cfg['max_tokens'] || '2048', 10);
      const temperature = parseFloat(cfg['temperature'] || '0.7');
      const contextWindow = parseInt(cfg['context_window'] || '10', 10);

      let ragContext = '';
      if (cfg['enable_rag'] !== 'false') {
        ragContext = this.formatRAGContext(intent, await this.fetchRelatedData(intent, message));
      }
      const systemPrompt = await this.buildSystemPrompt(intent, ragContext);

      let convId: string | undefined;
      const historyMessages: LLMMessage[] = [];
      if (cfg['enable_history'] !== 'false' && userId) {
        convId = await this.getOrCreateConversation(userId, conversationId);
        historyMessages.push(...await this.getConversationHistory(convId, contextWindow));
        await this.saveMessage(convId, 'user', message, intent);
      }
      historyMessages.push({ role: 'user', content: message });

      const result = await this.callLLM(systemPrompt, historyMessages, model, maxTokens, temperature);
      if (convId) await this.saveMessage(convId, 'assistant', result.content, intent, result.totalTokens);

      return {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        role: 'assistant', content: result.content, intent, conversationId: convId,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      this.logger.error(`LLM error: ${err instanceof Error ? err.message : err}`);
      return this.chatFallback(intent, message);
    }
  }

  // ──────────────────────────────────────────────
  //  SSE 流式聊天
  // ──────────────────────────────────────────────

  chatStream(message: string, userId?: string, conversationId?: string): Observable<MessageEvent> {
    const intent = this.detectIntent(message);
    this.logger.log(`[Stream] Intent: ${intent} for: "${message.substring(0, 50)}"`);

    if (!this.isLLMEnabled) return this.chatStreamFallback(intent, message);

    return new Observable((subscriber: Subscriber<MessageEvent>) => {
      this.streamWithLLM(subscriber, message, intent, userId, conversationId).catch((err) => {
        this.logger.error('Stream error, falling back', err);
        this.fetchRelatedData(intent, message)
          .then((data) => this.emitFallbackStream(subscriber, this.generateFallbackResponse(intent, message, data), intent))
          .catch(() => {
            subscriber.next({ data: { content: '抱歉，小鸿遇到了一点问题。', done: true, intent: ChatIntent.GENERAL } } as MessageEvent);
            subscriber.complete();
          });
      });
    });
  }

  private async streamWithLLM(subscriber: Subscriber<MessageEvent>, message: string, intent: ChatIntent, userId?: string, conversationId?: string) {
    const cfg = await this.aiConfig.getMap(['model', 'max_tokens', 'temperature', 'context_window', 'enable_rag', 'enable_history']);
    const model = cfg['model'] || this.llmModel;
    const maxTokens = parseInt(cfg['max_tokens'] || '2048', 10);
    const temperature = parseFloat(cfg['temperature'] || '0.7');
    const contextWindow = parseInt(cfg['context_window'] || '10', 10);

    let ragContext = '';
    if (cfg['enable_rag'] !== 'false') {
      ragContext = this.formatRAGContext(intent, await this.fetchRelatedData(intent, message));
    }
    const systemPrompt = await this.buildSystemPrompt(intent, ragContext);

    let convId: string | undefined;
    const historyMessages: LLMMessage[] = [];
    if (cfg['enable_history'] !== 'false' && userId) {
      convId = await this.getOrCreateConversation(userId, conversationId);
      historyMessages.push(...await this.getConversationHistory(convId, contextWindow));
      await this.saveMessage(convId, 'user', message, intent);
    }
    historyMessages.push({ role: 'user', content: message });

    const allMessages: LLMMessage[] = [{ role: 'system', content: systemPrompt }, ...historyMessages];

    const response = await fetch(`${this.llmBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.llmApiKey ? { Authorization: `Bearer ${this.llmApiKey}` } : {}),
      },
      body: JSON.stringify({
        model, messages: allMessages, max_tokens: maxTokens, temperature, stream: true,
        chat_template_kwargs: { enable_thinking: false },
      }),
      signal: AbortSignal.timeout(300000),
    });

    if (!response.ok || !response.body) throw new Error(`LLM stream error: ${response.status}`);

    let fullContent = '';
    let isFirst = true;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const delta = JSON.parse(jsonStr).choices?.[0]?.delta?.content || '';
            if (!delta) continue;
            fullContent += delta;
            subscriber.next({
              data: { content: delta, done: false, intent: isFirst ? intent : undefined, conversationId: isFirst ? convId : undefined },
            } as MessageEvent);
            isFirst = false;
          } catch { /* skip malformed */ }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (convId && fullContent) await this.saveMessage(convId, 'assistant', this.stripThinkingPrefix(fullContent), intent);
    subscriber.next({ data: { content: '', done: true, intent } } as MessageEvent);
    subscriber.complete();
  }

  // ──────────────────────────────────────────────
  //  规则引擎降级
  // ──────────────────────────────────────────────

  private async chatFallback(intent: ChatIntent, message: string): Promise<ChatResponse> {
    const data = await this.fetchRelatedData(intent, message);
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      role: 'assistant', content: this.generateFallbackResponse(intent, message, data),
      intent, relatedData: data ? this.summarizeData(data) : undefined, timestamp: new Date().toISOString(),
    };
  }

  private chatStreamFallback(intent: ChatIntent, message: string): Observable<MessageEvent> {
    return new Observable((subscriber: Subscriber<MessageEvent>) => {
      this.fetchRelatedData(intent, message)
        .then((data) => this.emitFallbackStream(subscriber, this.generateFallbackResponse(intent, message, data), intent))
        .catch(() => {
          subscriber.next({ data: { content: '抱歉，小鸿遇到了一点问题。', done: true } } as MessageEvent);
          subscriber.complete();
        });
    });
  }

  private emitFallbackStream(subscriber: Subscriber<MessageEvent>, text: string, intent: ChatIntent): void {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
      if (text[i] === '\n') { chunks.push('\n'); i++; continue; }
      const sz = 3 + Math.floor(Math.random() * 6);
      chunks.push(text.substring(i, i + sz));
      i += sz;
    }
    let idx = 0;
    const emit = () => {
      if (idx >= chunks.length) {
        subscriber.next({ data: { content: '', done: true, intent } } as MessageEvent);
        subscriber.complete();
        return;
      }
      subscriber.next({ data: { content: chunks[idx], done: false, intent: idx === 0 ? intent : undefined } } as MessageEvent);
      idx++;
      setTimeout(emit, 30 + Math.floor(Math.random() * 50));
    };
    emit();
  }

  private generateFallbackResponse(intent: ChatIntent, message: string, data: RelatedData): string {
    const g = GREETINGS[intent][Math.floor(Math.random() * GREETINGS[intent].length)];
    switch (intent) {
      case ChatIntent.RELIGION_INFO: {
        if (Array.isArray(data)) return `${g}\n\n平台涵盖12大信仰：${(data as Religion[]).map((r) => r.name).join('、')}。\n\n你想深入了解哪一个？`;
        const r = data as ReligionWithRelations;
        let t = `${g}\n\n**${r.name}（${r.nameEn}）**\n`;
        if (r.holySites?.length) t += `\n📍 圣地：${r.holySites.map((s) => `${s.name}（${s.country}）`).join('、')}`;
        if (r.temples?.length) t += `\n🏛️ 祖庭：${r.temples.map((t2) => `${t2.name}（${t2.country}）`).join('、')}`;
        if (r.patriarchs?.length) t += `\n👤 祖师：${r.patriarchs.map((p) => p.name).join('、')}`;
        return t;
      }
      case ChatIntent.HOLY_SITE_INFO: {
        if (!Array.isArray(data) || !data.length) return `${g}\n\n平台收录了60个圣地。你想了解哪个信仰的圣地？`;
        let t = `${g}\n\n`;
        for (const s of (data as HolySiteWithReligion[]).slice(0, 5)) t += `\n**${s.name}（${s.nameEn}）** — ${s.country}\n${s.description.substring(0, 100)}...\n`;
        return t;
      }
      case ChatIntent.TEMPLE_INFO: {
        if (!Array.isArray(data) || !data.length) return `${g}\n\n平台收录了27座祖庭。`;
        let t = `${g}\n\n`;
        for (const tp of (data as TempleWithReligion[]).slice(0, 5)) t += `\n**${tp.name}** — ${tp.country}（${tp.religion.name}）\n${tp.description.substring(0, 100)}...\n`;
        return t;
      }
      case ChatIntent.PATRIARCH_INFO: {
        if (!Array.isArray(data) || !data.length) return `${g}\n\n平台收录了28位祖师。`;
        let t = `${g}\n\n`;
        for (const p of (data as PatriarchWithReligion[]).slice(0, 5)) t += `\n**${p.name}** — ${p.religion.name}\n${p.biography.substring(0, 100)}...\n`;
        return t;
      }
      case ChatIntent.TEACHING_INFO: {
        if (!Array.isArray(data) || !data.length) return `${g}\n\n平台收录了39条祖训。`;
        let t = `${g}\n\n`;
        for (const tc of (data as TeachingWithReligion[]).slice(0, 5)) t += `\n**${tc.name}**（${tc.religion.name}）\n> ${tc.originalText.substring(0, 120)}...\n`;
        return t;
      }
      case ChatIntent.SEAL_INFO: {
        if (!Array.isArray(data) || !data.length) return `${g}\n\n曹溪三十印分五系：初印系、中印系、印果印、成道印、归源印。`;
        const sn: Record<string, string> = { CHUYIN: '初印系', ZHONGYIN: '中印系', YINGUOYIN: '印果印', CHENGDAOYIN: '成道印', GUIYUANYIN: '归源印' };
        let t = `${g}\n\n`;
        for (const s of (data as Seal[]).slice(0, 6)) t += `\n**第${s.id}印·${s.name}**（${sn[s.series]}）\n诗偈：${s.poem.substring(0, 60)}...\n`;
        return t;
      }
      case ChatIntent.TRIP_PLANNING: return `${g}\n\n我可以帮你规划：\n🕉️ 佛教巡礼\n✝️ 基督教之旅\n☪️ 伊斯兰朝觐\n☯️ 道教探访\n🕎 跨宗融合\n\n你对哪个信仰最感兴趣？`;
      case ChatIntent.PRACTICE_GUIDE: return `${g}\n\n推荐修行：\n🧘 静坐冥想\n📿 持名念佛\n📖 经典诵读\n🚶 行禅\n💡 三十印修炼\n\n你想从哪种开始？`;
      default: return `${g}\n\n我可以帮你：\n• 🌍 了解12大信仰\n• 📍 探索60个圣地\n• 🏛️ 认识27座祖庭\n• 📖 品味39条祖训\n• 🔮 修炼三十印\n• ✈️ 规划朝圣路线\n\n请问你想了解什么？`;
    }
  }

  // ──────────────────────────────────────────────
  //  快捷建议 (DB-backed)
  // ──────────────────────────────────────────────

  async getSuggestions(): Promise<{ text: string; category: string }[]> {
    const raw = await this.aiConfig.get('suggestions');
    if (raw) { try { return JSON.parse(raw); } catch { /* ignore */ } }
    return [
      { text: '推荐一个朝圣路线', category: '路线推荐' },
      { text: '佛教有哪些圣地？', category: '知识问答' },
      { text: '三十印修炼如何开始？', category: '修行指导' },
      { text: '介绍道教祖庭', category: '知识问答' },
    ];
  }

  async addSuggestion(text: string, category?: string) {
    const list = await this.getSuggestions();
    const item = { text, category: category || '通用' };
    list.push(item);
    await this.aiConfig.update('suggestions', JSON.stringify(list));
    return item;
  }

  async updateSuggestion(index: number, data: { text?: string; category?: string }) {
    const list = await this.getSuggestions();
    if (index < 0 || index >= list.length) throw new Error('Index out of range');
    if (data.text !== undefined) list[index].text = data.text;
    if (data.category !== undefined) list[index].category = data.category;
    await this.aiConfig.update('suggestions', JSON.stringify(list));
    return list[index];
  }

  async deleteSuggestion(index: number) {
    const list = await this.getSuggestions();
    if (index < 0 || index >= list.length) throw new Error('Index out of range');
    list.splice(index, 1);
    await this.aiConfig.update('suggestions', JSON.stringify(list));
    return { message: 'Deleted' };
  }

  // ──────────────────────────────────────────────
  //  辅助
  // ──────────────────────────────────────────────

  private summarizeData(data: RelatedData): SummarizedData | undefined {
    if (!data) return undefined;
    if (Array.isArray(data)) {
      return data.slice(0, 10).map((item): SummarizedItem => ({
        id: item.id, name: item.name,
        ...('nameEn' in item && item.nameEn ? { nameEn: item.nameEn } : {}),
        ...('country' in item && item.country ? { country: item.country } : {}),
        ...('series' in item && item.series ? { series: item.series } : {}),
      }));
    }
    const d = data as ReligionWithRelations;
    return { id: d.id, name: d.name, nameEn: d.nameEn, holySites: d.holySites?.length, temples: d.temples?.length, patriarchs: d.patriarchs?.length };
  }
}
