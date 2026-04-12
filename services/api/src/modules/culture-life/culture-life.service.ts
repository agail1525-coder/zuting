import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const CACHE_TTL = 3600;
const MAX_TAKE = 200;

const K = {
  questions: 'culture-life:questions',
  questionMatrix: (code: string) => `culture-life:question:${code}`,
  religion: (slug: string) => `culture-life:religion:${slug}`,
  stages: 'culture-life:stages',
  stageMatrix: (stage: string) => `culture-life:stage:${stage}`,
};

const RELIGION_SELECT = { id: true, name: true, nameEn: true, slug: true, color: true, symbol: true } as const;

@Injectable()
export class CultureLifeService {
  private readonly logger = new Logger(CultureLifeService.name);

  constructor(private prisma: PrismaService, private redis: RedisService) {}

  private async cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
    try {
      const hit = await this.redis.getJSON<T>(key);
      if (hit) return hit;
    } catch (e) {
      this.logger.warn(`Redis GET failed for ${key}: ${(e as Error).message}`);
    }
    const data = await loader();
    try {
      await this.redis.setJSON(key, data, CACHE_TTL);
    } catch (e) {
      this.logger.warn(`Redis SET failed for ${key}: ${(e as Error).message}`);
    }
    return data;
  }

  async listQuestions() {
    return this.cached(K.questions, async () => {
      const items = await this.prisma.lifeQuestion.findMany({
        orderBy: { sortOrder: 'asc' },
        take: MAX_TAKE,
      });
      return { items, total: items.length };
    });
  }

  async getQuestionMatrix(code: string) {
    return this.cached(K.questionMatrix(code), async () => {
      const question = await this.prisma.lifeQuestion.findUnique({
        where: { code: code as any },
        include: {
          perspectives: {
            take: MAX_TAKE,
            include: { religion: { select: RELIGION_SELECT } },
          },
        },
      });
      if (!question) throw new NotFoundException('LifeQuestion not found');
      return question;
    });
  }

  async getReligionPerspectives(religionSlug: string) {
    return this.cached(K.religion(religionSlug), async () => {
      const religion = await this.prisma.religion.findUnique({
        where: { slug: religionSlug },
        select: RELIGION_SELECT,
      });
      if (!religion) throw new NotFoundException('Religion not found');
      const perspectives = await this.prisma.lifeQuestionPerspective.findMany({
        where: { religionId: religion.id },
        include: { question: true },
        take: MAX_TAKE,
      });
      const stageGuides = await this.prisma.lifeStageGuide.findMany({
        where: { religionId: religion.id },
        take: MAX_TAKE,
      });
      return { religion, perspectives, stageGuides };
    });
  }

  async listStages() {
    return this.cached(K.stages, async () => {
      const items = await this.prisma.lifeStageGuide.findMany({
        include: { religion: { select: RELIGION_SELECT } },
        take: MAX_TAKE,
      });
      return { items, total: items.length };
    });
  }

  async getStageMatrix(stage: string) {
    return this.cached(K.stageMatrix(stage), async () => {
      const items = await this.prisma.lifeStageGuide.findMany({
        where: { stage: stage as any },
        include: { religion: { select: RELIGION_SELECT } },
        take: MAX_TAKE,
      });
      return { stage, items, total: items.length };
    });
  }

  async dialoguePlaceholder(situation: string, questionCode?: string) {
    return {
      situation,
      questionCode: questionCode ?? null,
      turns: [] as Array<{ religionSlug: string; text: string }>,
      note: 'AI 圆桌对话 SSE 将在 W5 接入 Qwen3.5-35B 多角色编排。当前为占位响应。',
    };
  }
}
