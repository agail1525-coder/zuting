import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiCommunityLlmService } from './ai-community-llm.service';
import { AI_AGENTS, type AiAgentPersona } from './agents/agent-personas';
import {
  buildGuidePrompt_HolySite,
  buildGuidePrompt_Patriarch,
  buildGuidePrompt_Business,
  buildGuidePrompt_Culture,
  buildGuidePrompt_Interfaith,
  buildQuestionPrompt,
  buildAnswerPrompt,
  buildCommentPrompt,
} from './agents/prompt-templates';

/** 圣地话题池（每信仰1组） */
const SITE_TOPICS: Record<string, string[]> = {
  buddhism: ['菩提伽耶', '鹿野苑', '灵鹫山', '蓝毗尼', '拘尸那迦'],
  taoism: ['武当山', '龙虎山', '青城山', '齐云山', '茅山'],
  confucianism: ['曲阜孔庙', '岳麓书院', '白鹿洞书院', '嵩阳书院', '应天书院'],
  christianity: ['耶路撒冷圣墓教堂', '伯利恒圣诞教堂', '梵蒂冈', '圣地亚哥', '坎特伯雷'],
  islam: ['麦加禁寺', '麦地那先知寺', '耶路撒冷阿克萨清真寺', '伊斯坦布尔蓝色清真寺', '科尔多瓦大清真寺'],
  hinduism: ['瓦拉纳西', '阿约提亚', '马图拉', '德瓦尔卡', '蒂鲁帕蒂'],
  judaism: ['耶路撒冷西墙', '希伯伦', '采法特', '拿撒勒', '马萨达'],
  sikhism: ['阿姆利则金庙', '阿南德普尔萨希布', '帕特纳萨希布', '南坎纳萨希布', '海兹尔萨希布'],
  shinto: ['伊势神宫', '出云大社', '春日大社', '严岛神社', '明治神宫'],
  'tibetan-buddhism': ['布达拉宫', '大昭寺', '扎什伦布寺', '塔尔寺', '拉卜楞寺'],
  indigenous: ['乌鲁鲁', '马丘比丘', '奇琴伊察', '大峡谷', '怀唐伊'],
  bahai: ['海法巴哈伊花园', '阿卡巴哈伊圣地', '新德里莲花寺', '萨摩亚灵曦堂', '巴拿马灵曦堂'],
};

/** 商业话题池 */
const BIZ_TOPICS = ['团队管理', '领导力', '企业文化', '决策智慧', '员工关怀'];

/** 文化体验话题 */
const CULTURE_TOPICS: Record<string, string[]> = {
  buddhism: ['水灯节', '卫塞节', '佛教素斋', '抄经体验', '禅茶一味'],
  taoism: ['道教科仪', '太极晨练', '道家辟谷', '符箓文化', '洞天福地'],
  confucianism: ['祭孔大典', '汉服体验', '书法临帖', '儒商茶叙', '成人礼'],
  christianity: ['圣诞弥撒', '复活节', '福音音乐', '教堂管风琴', '修道院静修'],
  islam: ['开斋节', '古尔邦节', '清真美食', '书法艺术', '市集文化'],
  hinduism: ['排灯节', '洒红节', '印度婚礼', '恒河夜祭', '瑜伽晨修'],
  judaism: ['安息日', '逾越节', '光明节', '犹太美食', '托拉诵读'],
  sikhism: ['兰加尔共餐', '拜萨基节', '锡克婚礼', '旁遮普美食', '清晨礼拜'],
  shinto: ['新年初诣', '七五三节', '神社婚礼', '花见', '秋祭'],
  'tibetan-buddhism': ['雪顿节', '萨噶达瓦', '酥油花', '唐卡绘制', '转山'],
  indigenous: ['篝火仪式', '图腾艺术', '丛林食物', '梦幻时间', '净化仪式'],
  bahai: ['诺鲁孜节', '里兹万节', '灵性会议', '社区服务', '跨文化花园'],
};

/** 跨信仰共通价值 */
const SHARED_VALUES = ['慈悲与仁爱', '感恩与谦逊', '社区服务', '自然和谐', '终身学习', '和平共处'];

@Injectable()
export class AiCommunityContentService {
  private readonly logger = new Logger(AiCommunityContentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: AiCommunityLlmService,
  ) {}

  /* ═══════ 工具方法 ═══════ */

  /** 获取agent对应的userId（如果不存在则跳过） */
  private async getAgentUserId(agent: AiAgentPersona): Promise<string | null> {
    const user = await this.prisma.user.findFirst({
      where: { email: agent.email, isAiAgent: true },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  /** 按天轮换选取agents */
  pickAgents(count: number, offsetSeed = 0): AiAgentPersona[] {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
    );
    const start = (dayOfYear + offsetSeed) % AI_AGENTS.length;
    const result: AiAgentPersona[] = [];
    for (let i = 0; i < count; i++) {
      result.push(AI_AGENTS[(start + i) % AI_AGENTS.length]);
    }
    return result;
  }

  /** 从话题池随机选取 */
  private pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /* ═══════ 游记创建 ═══════ */

  async createGuide(agent: AiAgentPersona, type: 'holy_site' | 'patriarch' | 'business' | 'culture' | 'interfaith'): Promise<void> {
    const userId = await this.getAgentUserId(agent);
    if (!userId) {
      this.logger.warn(`Agent ${agent.nickname} has no user record — skipping`);
      return;
    }

    const religion = await this.prisma.religion.findFirst({
      where: { slug: agent.religionSlug },
      select: { id: true, name: true },
    });
    if (!religion) return;

    let prompt: string;
    let tags: string[];

    switch (type) {
      case 'holy_site': {
        const sites = SITE_TOPICS[agent.religionSlug] ?? ['圣地'];
        const site = this.pickRandom(sites);
        prompt = buildGuidePrompt_HolySite(agent, site, religion.name);
        tags = [religion.name, site, '文化探访攻略'];
        break;
      }
      case 'patriarch': {
        const patriarchs = SITE_TOPICS[agent.religionSlug] ?? ['祖师'];
        const patriarch = this.pickRandom(patriarchs);
        prompt = buildGuidePrompt_Patriarch(agent, patriarch, religion.name);
        tags = [religion.name, '祖师智慧'];
        break;
      }
      case 'business': {
        const topic = this.pickRandom(BIZ_TOPICS);
        prompt = buildGuidePrompt_Business(agent, religion.name, topic);
        tags = [religion.name, '商业实践', topic];
        break;
      }
      case 'culture': {
        const topics = CULTURE_TOPICS[agent.religionSlug] ?? ['文化体验'];
        const topic = this.pickRandom(topics);
        prompt = buildGuidePrompt_Culture(agent, religion.name, topic);
        tags = [religion.name, topic, '文化体验'];
        break;
      }
      case 'interfaith': {
        const others = AI_AGENTS.filter((a) => a.religionSlug !== agent.religionSlug);
        const otherAgent = this.pickRandom(others);
        const otherReligion = await this.prisma.religion.findFirst({
          where: { slug: otherAgent.religionSlug },
          select: { name: true },
        });
        const value = this.pickRandom(SHARED_VALUES);
        prompt = buildGuidePrompt_Interfaith(agent, otherReligion?.name ?? '其他信仰', value);
        tags = [religion.name, '跨信仰对话', value];
        break;
      }
    }

    const content = await this.llm.generate(prompt, '请开始写作。');
    if (!content || content.length < 100) {
      this.logger.warn(`LLM returned short content for ${agent.nickname} ${type}`);
      return;
    }

    // 提取标题（第一行或前40字）
    const firstLine = content.split('\n').find((l) => l.trim().length > 0) ?? '';
    const title = firstLine.replace(/^["""《》【】\s]+/, '').replace(/["""》】\s]+$/, '').slice(0, 80) || `${agent.nickname}的${religion.name}见闻`;

    const bodyContent = content.replace(firstLine, '').trim();

    // 选一张稳定CDN封面（Picsum, deterministic seed）
    const coverSeed = encodeURIComponent(`${agent.religionSlug}-${Date.now()}`);
    const coverImage = `https://picsum.photos/seed/${coverSeed}/800/400`;

    await this.prisma.guide.create({
      data: {
        userId,
        title,
        content: bodyContent,
        coverImage,
        entityType: 'RELIGION',
        entityId: religion.id,
        tags,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        viewCount: Math.floor(Math.random() * 500) + 50,
        likeCount: Math.floor(Math.random() * 80) + 5,
      },
    });
    this.logger.log(`✅ Guide created: [${agent.nickname}] ${title}`);
  }

  /* ═══════ 问题创建 ═══════ */

  async createQuestion(agent: AiAgentPersona): Promise<void> {
    const userId = await this.getAgentUserId(agent);
    if (!userId) return;

    const religion = await this.prisma.religion.findFirst({
      where: { slug: agent.religionSlug },
      select: { id: true, name: true },
    });
    if (!religion) return;

    const topic = this.pickRandom([
      ...agent.topicAffinity,
      '旅行实用建议',
      '文化礼仪',
      '信仰交流',
    ]);

    const prompt = buildQuestionPrompt(agent, religion.name, topic);
    const raw = await this.llm.generate(prompt, '请提出你的问题。');
    if (!raw) return;

    let parsed: { title: string; content: string };
    try {
      // 尝试提取JSON
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] ?? raw);
    } catch {
      // 降级：第一行做标题，其余做内容
      const lines = raw.split('\n').filter((l) => l.trim());
      parsed = {
        title: (lines[0] ?? '').replace(/^["""]+|["""]+$/g, '').slice(0, 100),
        content: lines.slice(1).join('\n'),
      };
    }

    if (!parsed.title) return;

    await this.prisma.question.create({
      data: {
        userId,
        title: parsed.title,
        content: parsed.content || parsed.title,
        entityType: 'RELIGION',
        entityId: religion.id,
        tags: [religion.name, topic],
        status: 'OPEN',
        viewCount: Math.floor(Math.random() * 200) + 20,
      },
    });
    this.logger.log(`✅ Question created: [${agent.nickname}] ${parsed.title}`);
  }

  /* ═══════ 回答问题 ═══════ */

  async answerRandomQuestion(agent: AiAgentPersona): Promise<void> {
    const userId = await this.getAgentUserId(agent);
    if (!userId) return;

    // 找一个该agent尚未回答的OPEN问题
    const answered = await this.prisma.answer.findMany({
      where: { userId },
      select: { questionId: true },
    });
    const answeredIds = answered.map((a) => a.questionId);

    const question = await this.prisma.question.findFirst({
      where: {
        status: 'OPEN',
        userId: { not: userId },
        id: { notIn: answeredIds.length > 0 ? answeredIds : undefined },
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    if (!question) return;

    const prompt = buildAnswerPrompt(agent, question.title, question.content);
    const content = await this.llm.generate(prompt, '请给出你的回答。');
    if (!content || content.length < 50) return;

    await this.prisma.answer.create({
      data: {
        questionId: question.id,
        userId,
        content,
      },
    });

    // 更新answerCount
    await this.prisma.question.update({
      where: { id: question.id },
      data: {
        answerCount: { increment: 1 },
        status: 'ANSWERED',
      },
    });

    this.logger.log(`✅ Answer by [${agent.nickname}] on "${question.title.slice(0, 30)}..."`);
  }

  /* ═══════ 评论游记 ═══════ */

  async commentRandomGuide(agent: AiAgentPersona): Promise<void> {
    const userId = await this.getAgentUserId(agent);
    if (!userId) return;

    // 找一篇非自己写的最近游记
    const guide = await this.prisma.guide.findFirst({
      where: {
        status: 'PUBLISHED',
        userId: { not: userId },
      },
      orderBy: { publishedAt: 'desc' },
      skip: Math.floor(Math.random() * 10),
      take: 1,
    });
    if (!guide) return;

    const excerpt = guide.content.slice(0, 200);
    const prompt = buildCommentPrompt(agent, guide.title, excerpt);
    const content = await this.llm.generate(prompt, '请写你的评论。');
    if (!content || content.length < 20) return;

    await this.prisma.guideComment.create({
      data: {
        guideId: guide.id,
        userId,
        content,
      },
    });

    await this.prisma.guide.update({
      where: { id: guide.id },
      data: { commentCount: { increment: 1 } },
    });

    this.logger.log(`✅ Comment by [${agent.nickname}] on "${guide.title.slice(0, 30)}..."`);
  }
}
