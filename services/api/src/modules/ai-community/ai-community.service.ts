import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AiCommunityContentService } from './ai-community-content.service';
import { AiCommunityLlmService } from './ai-community-llm.service';
import { RedisService } from '../redis/redis.service';

/**
 * AI社区 CRON调度器
 *
 * 每日产量目标: ~5游记 + 2问题 + 5回答 + 4评论
 *
 * | 时间  | 任务                    | 产量    |
 * |-------|------------------------|---------|
 * | 07:00 | 2个agent发游记          | 2篇     |
 * | 08:30 | 1个agent提问            | 1题     |
 * | 10:00 | 2-3个agent回答          | 2-3答   |
 * | 12:00 | 2个agent发游记          | 2篇     |
 * | 14:30 | 1个agent提问            | 1题     |
 * | 16:00 | 2-3个agent回答          | 2-3答   |
 * | 19:00 | 1个agent发商业实践游记   | 1篇     |
 * | 20:00 | 3-4个agent评论          | 3-4评   |
 */
@Injectable()
export class AiCommunityService implements OnModuleInit {
  private readonly logger = new Logger(AiCommunityService.name);

  constructor(
    private readonly content: AiCommunityContentService,
    private readonly llm: AiCommunityLlmService,
    private readonly redis: RedisService,
  ) {}

  onModuleInit() {
    if (this.llm.isEnabled) {
      this.logger.log('🤖 AI Community CRON scheduler initialized');
    } else {
      this.logger.warn('⚠️ LLM not configured — AI Community CRON will be inactive');
    }
  }

  /** Redis分布式锁，防止多实例重复执行 */
  private async acquireLock(key: string, ttlSeconds = 600): Promise<boolean> {
    try {
      const client = this.redis.getClient();
      const result = await client.set(`ai-community:lock:${key}`, '1', 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch {
      return true; // Redis不可用时放行
    }
  }

  private async safeRun(taskName: string, fn: () => Promise<void>): Promise<void> {
    if (!this.llm.isEnabled) return;
    const locked = await this.acquireLock(taskName);
    if (!locked) {
      this.logger.debug(`Skip ${taskName} — another instance running`);
      return;
    }
    try {
      await fn();
    } catch (err) {
      this.logger.error(`❌ ${taskName} failed: ${err instanceof Error ? err.message : err}`);
    }
  }

  /* ─── 07:00 早间游记 (2篇：圣地+文化) ─── */
  @Cron('0 7 * * *')
  async morningGuides() {
    await this.safeRun('morningGuides', async () => {
      const agents = this.content.pickAgents(2, 0);
      await this.content.createGuide(agents[0], 'holy_site');
      await this.content.createGuide(agents[1], 'culture');
    });
  }

  /* ─── 08:30 早间提问 (1题) ─── */
  @Cron('30 8 * * *')
  async morningQuestion() {
    await this.safeRun('morningQuestion', async () => {
      const [agent] = this.content.pickAgents(1, 2);
      await this.content.createQuestion(agent);
    });
  }

  /* ─── 10:00 上午回答 (2-3答) ─── */
  @Cron('0 10 * * *')
  async morningAnswers() {
    await this.safeRun('morningAnswers', async () => {
      const agents = this.content.pickAgents(3, 3);
      for (const agent of agents) {
        await this.content.answerRandomQuestion(agent);
      }
    });
  }

  /* ─── 12:00 午间游记 (2篇：祖师+跨信仰) ─── */
  @Cron('0 12 * * *')
  async noonGuides() {
    await this.safeRun('noonGuides', async () => {
      const agents = this.content.pickAgents(2, 5);
      await this.content.createGuide(agents[0], 'patriarch');
      await this.content.createGuide(agents[1], 'interfaith');
    });
  }

  /* ─── 14:30 下午提问 (1题) ─── */
  @Cron('30 14 * * *')
  async afternoonQuestion() {
    await this.safeRun('afternoonQuestion', async () => {
      const [agent] = this.content.pickAgents(1, 7);
      await this.content.createQuestion(agent);
    });
  }

  /* ─── 16:00 下午回答 (2-3答) ─── */
  @Cron('0 16 * * *')
  async afternoonAnswers() {
    await this.safeRun('afternoonAnswers', async () => {
      const agents = this.content.pickAgents(3, 8);
      for (const agent of agents) {
        await this.content.answerRandomQuestion(agent);
      }
    });
  }

  /* ─── 19:00 晚间商业实践游记 (1篇) ─── */
  @Cron('0 19 * * *')
  async eveningBusinessGuide() {
    await this.safeRun('eveningBusinessGuide', async () => {
      const [agent] = this.content.pickAgents(1, 10);
      await this.content.createGuide(agent, 'business');
    });
  }

  /* ─── 20:00 晚间评论 (4条) ─── */
  @Cron('0 20 * * *')
  async eveningComments() {
    await this.safeRun('eveningComments', async () => {
      const agents = this.content.pickAgents(4, 11);
      for (const agent of agents) {
        await this.content.commentRandomGuide(agent);
      }
    });
  }
}
