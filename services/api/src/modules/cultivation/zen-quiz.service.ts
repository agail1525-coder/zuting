import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { FulfillmentService } from './fulfillment.service';
import { SubmitQuizAnswerDto } from './dto/zen-quiz.dto';

const STAGE_NAMES = [
  '寻牛', '见迹', '见牛', '得牛', '牧牛',
  '骑牛归家', '忘牛存人', '人牛俱忘', '返本还源', '入廛垂手',
];

const STAGE_THEMES = [
  '初发心寻道，心猿意马不定，为何踏上修行之路',
  '略见踪迹，从经典中初窥门径，信心初生',
  '亲见本性，感官直觉的觉醒，直面内心',
  '捕获真心，但仍须调伏，克服习气的挣扎',
  '渐渐调伏，保持正念，耐心与持续的功夫',
  '心牛合一，不须用力，回归自然本心',
  '超越方法与工具，无法可修，忘却修行本身',
  '能所双泯，空性体验，圆融无碍',
  '回归本来面目，平常心即是道，无修无证',
  '和光同尘，垂手入廛，慈悲度化众生',
];

const PASS_THRESHOLD = 60;

@Injectable()
export class ZenQuizService {
  private readonly logger = new Logger(ZenQuizService.name);
  private readonly llmBaseUrl: string;
  private readonly llmApiKey: string;
  private readonly llmModel: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly fulfillmentService: FulfillmentService,
  ) {
    this.llmBaseUrl = this.configService.get<string>('LLM_BASE_URL', '');
    this.llmApiKey = this.configService.get<string>('LLM_API_KEY', '');
    this.llmModel = this.configService.get<string>(
      'LLM_MODEL',
      'qwen3.5',
    );
  }

  // ── 获取/生成今日考核 ──────────────────────────────────

  async getTodayQuiz(userId: string) {
    const journey = await this.fulfillmentService.getOrCreateJourney(userId);
    const today = this.todayDate();

    const existing = await this.prisma.dailyPracticeQuiz.findUnique({
      where: { journeyId_quizDate: { journeyId: journey.id, quizDate: today } },
    });
    if (existing) return this.sanitizeQuizForClient(existing);

    // 生成新考核
    const questions = await this.generateQuestions(journey.oxStage, journey.primaryTradition);
    const quiz = await this.prisma.dailyPracticeQuiz.create({
      data: {
        journeyId: journey.id,
        quizDate: today,
        oxStage: journey.oxStage,
        questions,
        totalQuestions: questions.length,
      },
    });
    return this.sanitizeQuizForClient(quiz);
  }

  // ── 提交单题答案 ───────────────────────────────────────

  async submitAnswer(userId: string, dto: SubmitQuizAnswerDto) {
    const journey = await this.fulfillmentService.getOrCreateJourney(userId);
    const quiz = await this.prisma.dailyPracticeQuiz.findUnique({
      where: { id: dto.quizId },
    });
    if (!quiz) throw new NotFoundException('考核不存在');
    if (quiz.journeyId !== journey.id) {
      throw new ForbiddenException('不能回答他人的考核');
    }
    if (quiz.status !== 'IN_PROGRESS') {
      throw new BadRequestException('考核已结束');
    }

    const questions = quiz.questions as any[];
    if (dto.questionIndex >= questions.length) {
      throw new BadRequestException('题号超出范围');
    }

    const answers = (quiz.answers as any[]) ?? [];
    if (answers.find((a: any) => a.index === dto.questionIndex)) {
      throw new BadRequestException('该题已回答');
    }

    const question = questions[dto.questionIndex];

    // AI 评分
    const evaluation = await this.evaluateAnswer(
      question,
      dto.answer,
      journey.oxStage,
    );

    const newAnswer = {
      index: dto.questionIndex,
      userAnswer: dto.answer,
      aiScore: evaluation.score,
      aiFeedback: evaluation.feedback,
      encouragement: evaluation.encouragement,
      passed: evaluation.passed,
    };
    const updatedAnswers = [...answers, newAnswer];
    const answeredCount = updatedAnswers.length;
    const passedCount = updatedAnswers.filter((a: any) => a.passed).length;

    // 检查是否全部答完
    let status = 'IN_PROGRESS';
    let completedAt: Date | undefined;
    if (answeredCount === quiz.totalQuestions) {
      status = passedCount === quiz.totalQuestions ? 'PASSED' : 'FAILED';
      completedAt = new Date();
    }

    await this.prisma.dailyPracticeQuiz.update({
      where: { id: quiz.id },
      data: {
        answers: updatedAnswers,
        answeredCount,
        passedCount,
        status,
        completedAt,
      },
    });

    // 如果考核结束，更新 streak
    if (status !== 'IN_PROGRESS') {
      await this.updateQuizStreak(journey.id, status === 'PASSED');
    }

    return {
      passed: evaluation.passed,
      score: evaluation.score,
      feedback: evaluation.feedback,
      encouragement: evaluation.encouragement,
      quizStatus: status,
      answeredCount,
      passedCount,
      totalQuestions: quiz.totalQuestions,
    };
  }

  // ── 考核进度 ───────────────────────────────────────────

  async getProgress(userId: string) {
    const journey = await this.fulfillmentService.getOrCreateJourney(userId);
    const today = this.todayDate();
    const todayQuiz = await this.prisma.dailyPracticeQuiz.findUnique({
      where: { journeyId_quizDate: { journeyId: journey.id, quizDate: today } },
    });

    let todayStatus: string;
    if (!todayQuiz) {
      todayStatus = 'NOT_STARTED';
    } else {
      todayStatus = todayQuiz.status;
    }

    return {
      quizPassedStreak: journey.quizPassedStreak,
      lastQuizPassedAt: journey.lastQuizPassedAt,
      todayStatus,
      daysToAdvancement: Math.max(0, 21 - journey.quizPassedStreak),
      oxStage: journey.oxStage,
    };
  }

  // ── 历史记录 ───────────────────────────────────────────

  async getHistory(userId: string, page: number, pageSize: number) {
    const journey = await this.fulfillmentService.getOrCreateJourney(userId);
    const take = Math.min(pageSize, 50);
    const skip = (page - 1) * take;
    const [items, total] = await Promise.all([
      this.prisma.dailyPracticeQuiz.findMany({
        where: { journeyId: journey.id },
        orderBy: { quizDate: 'desc' },
        skip,
        take,
      }),
      this.prisma.dailyPracticeQuiz.count({ where: { journeyId: journey.id } }),
    ]);
    return {
      items: items.map((q) => this.sanitizeQuizForClient(q)),
      total,
      page,
      pageSize: take,
    };
  }

  // ── AI 出题 ────────────────────────────────────────────

  private async generateQuestions(oxStage: number, tradition: string) {
    const stageIdx = Math.min(oxStage, 10) - 1;
    const stageName = STAGE_NAMES[stageIdx];
    const stageTheme = STAGE_THEMES[stageIdx];

    // 获取该阶位的经文
    const mapping = await this.prisma.oxCultureMapping.findFirst({
      where: { oxStage, tradition },
    });
    const scriptureContext = mapping
      ? `经文: "${mapping.originalText}" —— ${mapping.source}`
      : '';

    if (!this.llmBaseUrl) {
      return this.fallbackQuestions(stageIdx);
    }

    const systemPrompt = `你是一位深修禅宗的禅师，正在为修行者设计每日禅修考核。

修行者当前处于十牛图第${oxStage}阶「${stageName}」。此阶核心主题：${stageTheme}。
修行者所修传统：${tradition}。
${scriptureContext}

请生成10道深度禅修反思题。要求：
1. 题目类型混合：包含公案参究(让修行者用自己的话解释公案含义)、禅定体验描述(描述打坐中某种体验该如何应对)、日常修行应用(将禅理应用于具体生活情境)、经文理解(对给出的经文段落作深层解读)
2. 不要出选择题。所有题目都是开放性问答，需要修行者用心回答
3. 题目难度匹配当前阶位：第1-3阶侧重基础觉知与发心，第4-6阶侧重功夫实修与习气调伏，第7-10阶侧重空性智慧与度化众生
4. 每道题附上"参考要点"(3-5个核心关键要素)，用于AI评分时参考
5. 回答应体现真实修行体验，不是书本知识的复述

请以JSON数组格式返回，不要包含其他文字：
[{"index":0,"question":"题目内容","questionType":"KOAN|MEDITATION|APPLICATION|SCRIPTURE","referencePoints":"评分参考要点","stageName":"${stageName}"}]`;

    try {
      const result = await this.callLLM(systemPrompt, `请为第${oxStage}阶「${stageName}」生成今日10道禅修考核题`);
      const parsed = this.parseJsonFromLLM(result);
      if (Array.isArray(parsed) && parsed.length >= 5) {
        return parsed.slice(0, 10).map((q: any, i: number) => ({
          index: i,
          question: String(q.question || ''),
          questionType: String(q.questionType || 'APPLICATION'),
          referencePoints: String(q.referencePoints || ''),
          stageName,
        }));
      }
    } catch (e) {
      this.logger.warn(`AI出题失败，使用预置题: ${e}`);
    }
    return this.fallbackQuestions(stageIdx);
  }

  // ── AI 评分 ────────────────────────────────────────────

  private async evaluateAnswer(
    question: any,
    userAnswer: string,
    oxStage: number,
  ): Promise<{ passed: boolean; score: number; feedback: string; encouragement: string }> {
    if (!this.llmBaseUrl) {
      return this.fallbackEvaluate(userAnswer);
    }

    const stageName = STAGE_NAMES[Math.min(oxStage, 10) - 1];
    const systemPrompt = `你是一位慈悲而严格的禅师，正在评估修行者对禅修问题的回答。

题目：${question.question}
题目类型：${question.questionType}
修行者阶位：第${oxStage}阶「${stageName}」
参考要点：${question.referencePoints}

请评估修行者的回答：
1. 是否体现了真实的修行体悟(而非空洞的书本知识)?
2. 是否触及了参考要点中的核心要素?
3. 回答的深度是否匹配其修行阶位?

请以JSON格式返回，不要包含其他文字：
{"passed":true,"score":75,"feedback":"针对性禅修指导(2-4句)","encouragement":"一句鼓励"}

评分标准：60分以上通过。空洞泛泛30-50分；有个人体悟但不够深入50-70分；真实修行体验且有深度70-90分；令人惊叹的洞见90-100分。`;

    try {
      const result = await this.callLLM(systemPrompt, `修行者的回答：\n${userAnswer}`);
      const parsed = this.parseJsonFromLLM(result);
      if (parsed && typeof parsed.score === 'number') {
        return {
          passed: parsed.score >= PASS_THRESHOLD,
          score: Math.max(0, Math.min(100, parsed.score)),
          feedback: String(parsed.feedback || '继续精进'),
          encouragement: String(parsed.encouragement || '修行路上，每一步都算数'),
        };
      }
    } catch (e) {
      this.logger.warn(`AI评分失败，使用宽容评分: ${e}`);
    }
    return this.fallbackEvaluate(userAnswer);
  }

  // ── 更新考核连击 ───────────────────────────────────────

  private async updateQuizStreak(journeyId: string, passed: boolean) {
    const journey = await this.prisma.fulfillmentJourney.findUnique({
      where: { id: journeyId },
    });
    if (!journey) return;

    if (passed) {
      const today = this.todayDate();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const wasYesterday =
        journey.lastQuizPassedAt &&
        this.isSameDay(journey.lastQuizPassedAt, yesterday);

      await this.prisma.fulfillmentJourney.update({
        where: { id: journeyId },
        data: {
          quizPassedStreak: wasYesterday ? journey.quizPassedStreak + 1 : 1,
          lastQuizPassedAt: today,
          karmaPoints: { increment: 20 },
        },
      });
    } else {
      // 失败：连击归零
      await this.prisma.fulfillmentJourney.update({
        where: { id: journeyId },
        data: { quizPassedStreak: 0 },
      });
    }
  }

  // ── LLM 调用 ──────────────────────────────────────────

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
        max_tokens: 4096,
        temperature: 0.7,
        stream: false,
        chat_template_kwargs: { enable_thinking: false },
      }),
      signal: AbortSignal.timeout(180000),
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`LLM API error ${response.status}: ${errText}`);
    }
    const data = (await response.json()) as any;
    const rawContent = data.choices?.[0]?.message?.content || '';
    return this.stripThinkingPrefix(rawContent);
  }

  private stripThinkingPrefix(content: string): string {
    const thinkTagMatch = content.match(/<\/think>\s*([\s\S]*)/);
    if (thinkTagMatch) return thinkTagMatch[1].trim();
    const thinkPrefixMatch = content.match(/^Thinking Process:[\s\S]*?\n\n([\s\S]*)/);
    if (thinkPrefixMatch) return thinkPrefixMatch[1].trim();
    return content;
  }

  private parseJsonFromLLM(text: string): any {
    // 尝试直接解析
    try { return JSON.parse(text); } catch {}
    // 尝试从 markdown code block 提取
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) {
      try { return JSON.parse(codeBlock[1].trim()); } catch {}
    }
    // 尝试找到第一个 [ 或 { 开始的 JSON
    const jsonStart = text.search(/[\[{]/);
    if (jsonStart >= 0) {
      try { return JSON.parse(text.slice(jsonStart)); } catch {}
    }
    throw new Error('无法解析LLM返回的JSON');
  }

  // ── Fallback ──────────────────────────────────────────

  private fallbackQuestions(stageIdx: number): any[] {
    const stageName = STAGE_NAMES[stageIdx];
    const theme = STAGE_THEMES[stageIdx];
    const templates = [
      { q: `在修行「${stageName}」的阶段，你最初的发心是什么？请描述你踏上修行之路的因缘。`, type: 'APPLICATION' },
      { q: `打坐时，当杂念纷飞、心猿意马之际，你如何安住当下？请分享你的实际经验。`, type: 'MEDITATION' },
      { q: `"不思善，不思恶，正与么时，那个是明上座本来面目？"——请用你自己的话解释这则公案。`, type: 'KOAN' },
      { q: `在日常生活中（工作、家庭），你如何将「${stageName}」的修行主题融入？请举一个具体例子。`, type: 'APPLICATION' },
      { q: `${theme}。你在修行中是否曾有过类似的体悟？请详细描述那个时刻。`, type: 'MEDITATION' },
      { q: `"菩提本无树，明镜亦非台"——对于当前「${stageName}」阶位的你，这句话意味着什么？`, type: 'SCRIPTURE' },
      { q: `修行路上最大的障碍是什么？你是如何面对和转化这个障碍的？`, type: 'APPLICATION' },
      { q: `描述一次你在禅坐中体验到身心合一或忘我状态的经历。如果还没有，描述你最接近那种状态的体验。`, type: 'MEDITATION' },
      { q: `"一花一世界，一叶一菩提"——从你当前的修行阶段出发，谈谈你对这句话的理解。`, type: 'KOAN' },
      { q: `如果有人问你"什么是禅？"，基于你目前的修行体验，你会如何回答？`, type: 'APPLICATION' },
    ];
    return templates.map((t, i) => ({
      index: i,
      question: t.q,
      questionType: t.type,
      referencePoints: `体现真实修行体验、与「${stageName}」主题相关、有个人感悟而非泛泛而谈`,
      stageName,
    }));
  }

  private fallbackEvaluate(userAnswer: string): { passed: boolean; score: number; feedback: string; encouragement: string } {
    // 宽容评分：答案足够长且有实质内容即可通过
    const length = userAnswer.trim().length;
    if (length < 30) {
      return { passed: false, score: 25, feedback: '回答过于简短，请用心展开你的思考和体悟。', encouragement: '修行贵在真诚，试着敞开心扉。' };
    }
    if (length < 80) {
      return { passed: true, score: 62, feedback: '有所思考，但可以更深入地分享你的实际修行体验。', encouragement: '每一次反思都是进步。' };
    }
    return { passed: true, score: 75, feedback: '回答有一定深度，继续保持这种认真修行的态度。', encouragement: '精进不已，功不唐捐。' };
  }

  // ── 工具方法 ──────────────────────────────────────────

  private sanitizeQuizForClient(quiz: any) {
    const questions = (quiz.questions as any[]).map((q: any) => ({
      index: q.index,
      question: q.question,
      questionType: q.questionType,
      stageName: q.stageName,
      // 不返回 referencePoints 给前端
    }));
    return { ...quiz, questions };
  }

  private todayDate(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}
