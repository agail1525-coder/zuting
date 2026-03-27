import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subscriber } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
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

/** 小鸿的性格语录，用于生成开场白 */
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

  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────
  //  意图检测
  // ──────────────────────────────────────────────

  detectIntent(message: string): ChatIntent {
    const lower = message.toLowerCase();

    // 按优先级检测意图（更具体的先匹配）
    const priorityOrder: ChatIntent[] = [
      ChatIntent.SEAL_INFO,
      ChatIntent.HOLY_SITE_INFO,
      ChatIntent.TEMPLE_INFO,
      ChatIntent.PATRIARCH_INFO,
      ChatIntent.TEACHING_INFO,
      ChatIntent.RELIGION_INFO,
      ChatIntent.TRIP_PLANNING,
      ChatIntent.PRACTICE_GUIDE,
    ];

    for (const intent of priorityOrder) {
      const keywords = INTENT_KEYWORDS[intent];
      if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
        return intent;
      }
    }

    return ChatIntent.GENERAL;
  }

  // ──────────────────────────────────────────────
  //  获取相关数据
  // ──────────────────────────────────────────────

  private async fetchRelatedData(
    intent: ChatIntent,
    message: string,
  ): Promise<RelatedData> {
    switch (intent) {
      case ChatIntent.RELIGION_INFO: {
        const religions = await this.prisma.religion.findMany({
          take: 100,
          orderBy: { name: 'asc' },
        });
        // 尝试匹配具体宗教
        const matched = religions.find(
          (r) => message.includes(r.name) || message.includes(r.nameEn),
        );
        if (matched) {
          return await this.prisma.religion.findUnique({
            where: { id: matched.id },
            include: {
              holySites: { take: 3 },
              temples: { take: 3 },
              patriarchs: { take: 2 },
            },
          });
        }
        return religions;
      }

      case ChatIntent.HOLY_SITE_INFO: {
        const sites = await this.prisma.holySite.findMany({
          take: 100,
          include: { religion: true },
          orderBy: { name: 'asc' },
        });
        const matched = sites.filter(
          (s) =>
            message.includes(s.name) ||
            message.includes(s.nameEn) ||
            message.includes(s.religion.name),
        );
        return matched.length > 0 ? matched : sites.slice(0, 10);
      }

      case ChatIntent.TEMPLE_INFO: {
        const temples = await this.prisma.temple.findMany({
          take: 100,
          include: { religion: true },
          orderBy: { name: 'asc' },
        });
        const matched = temples.filter(
          (t) =>
            message.includes(t.name) ||
            (t.nameEn && message.includes(t.nameEn)) ||
            message.includes(t.religion.name),
        );
        return matched.length > 0 ? matched : temples.slice(0, 10);
      }

      case ChatIntent.PATRIARCH_INFO: {
        const patriarchs = await this.prisma.patriarch.findMany({
          take: 100,
          include: { religion: true },
          orderBy: { name: 'asc' },
        });
        const matched = patriarchs.filter(
          (p) =>
            message.includes(p.name) ||
            (p.nameEn && message.includes(p.nameEn)) ||
            message.includes(p.religion.name),
        );
        return matched.length > 0 ? matched : patriarchs.slice(0, 10);
      }

      case ChatIntent.TEACHING_INFO: {
        const teachings = await this.prisma.teaching.findMany({
          take: 100,
          include: { religion: true },
          orderBy: { name: 'asc' },
        });
        const matched = teachings.filter(
          (t) =>
            message.includes(t.name) || message.includes(t.religion.name),
        );
        return matched.length > 0 ? matched : teachings.slice(0, 10);
      }

      case ChatIntent.SEAL_INFO: {
        const seals = await this.prisma.seal.findMany({
          take: 100,
          orderBy: { id: 'asc' },
        });
        // 检查是否问特定系列
        const seriesMap: Record<string, string> = {
          '初印': 'CHUYIN',
          '中印': 'ZHONGYIN',
          '印果': 'YINGUOYIN',
          '成道': 'CHENGDAOYIN',
          '归源': 'GUIYUANYIN',
        };
        for (const [keyword, series] of Object.entries(seriesMap)) {
          if (message.includes(keyword)) {
            return seals.filter((s) => s.series === series);
          }
        }
        return seals;
      }

      default:
        return null;
    }
  }

  // ──────────────────────────────────────────────
  //  生成回复内容
  // ──────────────────────────────────────────────

  private generateResponse(
    intent: ChatIntent,
    message: string,
    data: RelatedData,
  ): string {
    const greeting =
      GREETINGS[intent][Math.floor(Math.random() * GREETINGS[intent].length)];

    switch (intent) {
      case ChatIntent.RELIGION_INFO: {
        if (Array.isArray(data)) {
          const religions = data as Religion[];
          const names = religions.map((r) => r.name).join('、');
          return `${greeting}\n\n全球祖庭旅行平台涵盖12大信仰传统：${names}。\n\n每一种信仰都有其独特的智慧和修行方法。你想深入了解哪一个？我可以为你介绍它的圣地、祖庭、祖师和核心教义。`;
        }
        const r = data as ReligionWithRelations;
        let text = `${greeting}\n\n**${r.name}（${r.nameEn}）**\n`;
        if (r.holySites?.length) {
          text += `\n📍 主要圣地：${r.holySites.map((s) => `${s.name}（${s.country}）`).join('、')}`;
        }
        if (r.temples?.length) {
          text += `\n🏛️ 重要祖庭：${r.temples.map((t) => `${t.name}（${t.country}）`).join('、')}`;
        }
        if (r.patriarchs?.length) {
          text += `\n👤 代表祖师：${r.patriarchs.map((p) => p.name).join('、')}`;
        }
        return text;
      }

      case ChatIntent.HOLY_SITE_INFO: {
        if (!Array.isArray(data) || data.length === 0) {
          return `${greeting}\n\n平台收录了60个全球宗教圣地。你想了解哪个信仰的圣地？`;
        }
        const sites = (data as HolySiteWithReligion[]).slice(0, 5);
        let text = `${greeting}\n\n`;
        for (const site of sites) {
          text += `\n**${site.name}（${site.nameEn}）** — ${site.country}`;
          text += `\n${site.description.substring(0, 100)}...`;
          text += `\n坐标：${site.latitude}°N, ${site.longitude}°E\n`;
        }
        if (data.length > 5) {
          text += `\n...还有更多圣地等你探索！`;
        }
        return text;
      }

      case ChatIntent.TEMPLE_INFO: {
        if (!Array.isArray(data) || data.length === 0) {
          return `${greeting}\n\n平台收录了27座全球祖庭。你想了解哪个信仰的祖庭？`;
        }
        const temples = (data as TempleWithReligion[]).slice(0, 5);
        let text = `${greeting}\n\n`;
        for (const temple of temples) {
          text += `\n**${temple.name}** — ${temple.country}（${temple.religion.name}）`;
          text += `\n${temple.description.substring(0, 100)}...`;
          if (temple.foundingDate) text += `\n始建：${temple.foundingDate}`;
          text += '\n';
        }
        return text;
      }

      case ChatIntent.PATRIARCH_INFO: {
        if (!Array.isArray(data) || data.length === 0) {
          return `${greeting}\n\n平台收录了28位各大信仰的祖师。你想了解哪位祖师？`;
        }
        const patriarchs = (data as PatriarchWithReligion[]).slice(0, 5);
        let text = `${greeting}\n\n`;
        for (const p of patriarchs) {
          text += `\n**${p.name}** — ${p.religion.name}`;
          if (p.title) text += `（${p.title}）`;
          if (p.dates) text += `\n年代：${p.dates}`;
          text += `\n${p.biography.substring(0, 100)}...`;
          text += `\n核心教导：${p.coreTeaching.substring(0, 80)}...\n`;
        }
        return text;
      }

      case ChatIntent.TEACHING_INFO: {
        if (!Array.isArray(data) || data.length === 0) {
          return `${greeting}\n\n平台收录了39条祖训精华。你想了解哪个信仰的祖训？`;
        }
        const teachings = (data as TeachingWithReligion[]).slice(0, 5);
        let text = `${greeting}\n\n`;
        for (const t of teachings) {
          text += `\n**${t.name}**（${t.religion.name}）`;
          text += `\n> ${t.originalText.substring(0, 120)}...`;
          if (t.sourceText) text += `\n来源：${t.sourceText}`;
          text += '\n';
        }
        return text;
      }

      case ChatIntent.SEAL_INFO: {
        if (!Array.isArray(data) || data.length === 0) {
          return `${greeting}\n\n曹溪愿命三十印分五系：初印系、中印系、印果印、成道印、归源印。你想从哪里开始了解？`;
        }
        const seriesNames: Record<string, string> = {
          CHUYIN: '初印系',
          ZHONGYIN: '中印系',
          YINGUOYIN: '印果印',
          CHENGDAOYIN: '成道印',
          GUIYUANYIN: '归源印',
        };
        const seals = (data as Seal[]).slice(0, 6);
        let text = `${greeting}\n\n`;
        for (const seal of seals) {
          text += `\n**第${seal.id}印 · ${seal.name}**（${seriesNames[seal.series] || seal.series}）`;
          text += `\n诗偈：${seal.poem.substring(0, 60)}...`;
          text += `\n修行要义：${seal.practice.substring(0, 60)}...`;
          text += `\n大愿：${seal.vow.substring(0, 60)}...\n`;
        }
        if (data.length > 6) {
          text += `\n共${data.length}印，继续问我了解更多！`;
        }
        return text;
      }

      case ChatIntent.TRIP_PLANNING: {
        return `${greeting}\n\n作为你的祖庭旅行助手，我可以帮你规划以下类型的朝圣之旅：\n\n` +
          `🕉️ **佛教圣地巡礼** — 菩提伽耶→鹿野苑→拘尸那→蓝毗尼\n` +
          `✝️ **基督教圣地之旅** — 耶路撒冷→伯利恒→拿撒勒→加利利\n` +
          `☪️ **伊斯兰朝觐之路** — 麦加→麦地那\n` +
          `☯️ **道教祖庭探访** — 龙虎山→武当山→青城山\n` +
          `🕎 **跨宗融合之旅** — 体验多种信仰的圣地\n\n` +
          `请告诉我：\n1. 你对哪个信仰传统最感兴趣？\n2. 你计划什么时候出发？\n3. 大约有几天时间？\n\n我会为你量身定制一条有灵性深度的朝圣路线。`;
      }

      case ChatIntent.PRACTICE_GUIDE: {
        return `${greeting}\n\n小鸿为你推荐几种适合当下的修行方法：\n\n` +
          `🧘 **静坐冥想**（15-30分钟）\n` +
          `   找一个安静的地方，盘腿而坐，关注呼吸，让心渐渐安定。\n\n` +
          `📿 **持名念佛**（10分钟）\n` +
          `   口念「南无阿弥陀佛」，心随声转，摄心归一。\n\n` +
          `📖 **经典诵读**（20分钟）\n` +
          `   选一段祖训或经文，慢慢诵读，用心体会每一个字。\n\n` +
          `🚶 **行禅**（15分钟）\n` +
          `   缓步而行，每一步都觉知脚与大地的接触。\n\n` +
          `💡 **曹溪三十印修炼**\n` +
          `   从第一印开始，逐印深入，每日一印，印印相扣。\n\n` +
          `你想从哪种修行方法开始？或者告诉我你目前的修行状况，我来给你更具体的建议。`;
      }

      default: {
        return `${greeting}\n\n我可以帮助你：\n` +
          `• 🌍 了解全球12大信仰传统\n` +
          `• 📍 探索60个宗教圣地\n` +
          `• 🏛️ 认识27座祖庭\n` +
          `• 👤 了解28位祖师的故事\n` +
          `• 📖 品味39条祖训精华\n` +
          `• 🔮 修炼曹溪愿命三十印\n` +
          `• ✈️ 规划朝圣旅行路线\n` +
          `• 🧘 获取修行指导\n\n` +
          `请问你想了解什么？`;
      }
    }
  }

  // ──────────────────────────────────────────────
  //  普通聊天（完整回复）
  // ──────────────────────────────────────────────

  async chat(message: string, conversationId?: string): Promise<ChatResponse> {
    const intent = this.detectIntent(message);
    this.logger.log(`Intent detected: ${intent} for message: "${message}"`);

    const relatedData = await this.fetchRelatedData(intent, message);
    const content = this.generateResponse(intent, message, relatedData);

    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      role: 'assistant',
      content,
      intent,
      relatedData: relatedData
        ? this.summarizeData(relatedData)
        : undefined,
      timestamp: new Date().toISOString(),
    };
  }

  // ──────────────────────────────────────────────
  //  SSE 流式聊天
  // ──────────────────────────────────────────────

  chatStream(message: string): Observable<MessageEvent> {
    const intent = this.detectIntent(message);
    this.logger.log(
      `[Stream] Intent detected: ${intent} for message: "${message}"`,
    );

    return new Observable((subscriber: Subscriber<MessageEvent>) => {
      this.fetchRelatedData(intent, message)
        .then((relatedData) => {
          const content = this.generateResponse(intent, message, relatedData);
          this.streamText(subscriber, content, intent);
        })
        .catch((err) => {
          this.logger.error('Stream error', err);
          const errorEvent: MessageEvent = {
            data: {
              content: '抱歉，小鸿遇到了一点问题，请稍后再试。',
              done: true,
              intent: ChatIntent.GENERAL,
            },
          } as MessageEvent;
          subscriber.next(errorEvent);
          subscriber.complete();
        });
    });
  }

  /**
   * 逐块流式输出文本，模拟打字效果
   */
  private streamText(
    subscriber: Subscriber<MessageEvent>,
    text: string,
    intent: ChatIntent,
  ): void {
    // 将文本分成小块（3-8个字符一组），模拟打字
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
      // 如果遇到换行符，单独作为一个chunk
      if (text[i] === '\n') {
        chunks.push('\n');
        i++;
        continue;
      }
      const chunkSize = 3 + Math.floor(Math.random() * 6); // 3-8 chars
      chunks.push(text.substring(i, i + chunkSize));
      i += chunkSize;
    }

    let chunkIndex = 0;

    const emitNext = () => {
      if (chunkIndex >= chunks.length) {
        // 发送完成信号
        const doneEvent = {
          data: { content: '', done: true, intent },
        } as MessageEvent;
        subscriber.next(doneEvent);
        subscriber.complete();
        return;
      }

      const event = {
        data: {
          content: chunks[chunkIndex],
          done: false,
          intent: chunkIndex === 0 ? intent : undefined,
        },
      } as MessageEvent;
      subscriber.next(event);
      chunkIndex++;

      // 随机延迟 30-80ms，模拟打字速度
      const delay = 30 + Math.floor(Math.random() * 50);
      setTimeout(emitNext, delay);
    };

    emitNext();
  }

  // ──────────────────────────────────────────────
  //  快捷建议
  // ──────────────────────────────────────────────

  getSuggestions(): { suggestions: string[] } {
    return {
      suggestions: [
        '推荐一个朝圣路线',
        '佛教有哪些圣地？',
        '三十印修炼如何开始？',
        '介绍道教祖庭',
        '今天适合修炼什么？',
        '基督教的祖师有哪些？',
        '介绍一下儒教的祖训',
        '耶路撒冷有什么宗教意义？',
      ],
    };
  }

  // ──────────────────────────────────────────────
  //  辅助方法：精简返回数据（避免过大）
  // ──────────────────────────────────────────────

  private summarizeData(data: RelatedData): SummarizedData | undefined {
    if (!data) return undefined;

    if (Array.isArray(data)) {
      return data.slice(0, 10).map((item): SummarizedItem => ({
        id: item.id,
        name: item.name,
        ...('nameEn' in item && item.nameEn ? { nameEn: item.nameEn } : {}),
        ...('country' in item && item.country ? { country: item.country } : {}),
        ...('series' in item && item.series ? { series: item.series } : {}),
      }));
    }

    // 单个对象（如具体宗教详情）
    const detail = data as ReligionWithRelations;
    return {
      id: detail.id,
      name: detail.name,
      nameEn: detail.nameEn,
      holySites: detail.holySites?.length,
      temples: detail.temples?.length,
      patriarchs: detail.patriarchs?.length,
    };
  }
}
