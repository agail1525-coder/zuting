import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const FAITH_LEVELS = [
  { code: 'CHUJUE', name: '初觉', min: 0, max: 100, color: '#0EA5E9' },
  { code: 'MINGXIN', name: '明心', min: 101, max: 200, color: '#6366F1' },
  { code: 'JIANXING', name: '见性', min: 201, max: 300, color: '#A855F7' },
  { code: 'ZHENGDAO', name: '证道', min: 301, max: 400, color: '#EF4444' },
  { code: 'YUANRONG', name: '圆融', min: 401, max: 500, color: '#F59E0B' },
];

const DIMENSIONS = ['AWARENESS', 'RESILIENCE', 'VISION', 'CONNECTION', 'LEGACY'] as const;

// Theme recommendations by weakest dimension
const DIMENSION_THEME_MAP: Record<string, Record<string, string[]>> = {
  PERSONAL: {
    AWARENESS: ['pg-awakening', 'pg-compassion'],
    RESILIENCE: ['pg-fortitude', 'pg-rebirth'],
    VISION: ['pg-vision', 'pg-legacy'],
    CONNECTION: ['pg-compassion', 'pg-legacy'],
    LEGACY: ['pg-legacy', 'pg-vision'],
  },
  FAMILY: {
    AWARENESS: ['fh-reconciliation', 'fh-unity'],
    RESILIENCE: ['fh-guardian', 'fh-unity'],
    VISION: ['fh-heritage', 'fh-roots'],
    CONNECTION: ['fh-unity', 'fh-gratitude'],
    LEGACY: ['fh-roots', 'fh-heritage'],
  },
  ENTERPRISE: {
    AWARENESS: ['tc-zen-leadership', 'tc-mindful-team'],
    RESILIENCE: ['tc-resilient-culture', 'tc-warrior-spirit'],
    VISION: ['tc-vision-quest', 'tc-strategy-retreat'],
    CONNECTION: ['tc-team-bond', 'tc-empathy-culture'],
    LEGACY: ['tc-legacy-planning', 'tc-mentor-circle'],
  },
};

@Injectable()
export class FaithAssessmentService {
  constructor(private prisma: PrismaService) {}

  /** 获取指定模式的题目 */
  async getQuestions(mode: string) {
    const questions = await this.prisma.faithQuestion.findMany({
      where: { mode: mode as any, isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        dimension: true,
        sortOrder: true,
        questionText: true,
        options: true,
      },
    });
    return { items: questions, total: questions.length };
  }

  /** 提交评估并计算结果 */
  async submitAssessment(
    dto: { mode: string; answers: { questionId: string; selectedOption: string }[] },
    userId?: string,
    sessionId?: string,
  ) {
    // 1. 获取所有相关题目
    const questionIds = dto.answers.map((a) => a.questionId);
    const questions = await this.prisma.faithQuestion.findMany({
      where: { id: { in: questionIds } },
    });

    if (questions.length < 10) {
      throw new BadRequestException('答题数量不足');
    }

    const questionMap = new Map(questions.map((q: any) => [q.id, q]));

    // 2. 计算各维度分数
    const dimensionScores: Record<string, number> = {
      AWARENESS: 0,
      RESILIENCE: 0,
      VISION: 0,
      CONNECTION: 0,
      LEGACY: 0,
    };

    const answersWithScore: { questionId: string; selectedOption: string; score: number }[] = [];

    for (const answer of dto.answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;

      const options = (question as any).options as any[];
      const selected = options.find((o: any) => o.key === answer.selectedOption);
      if (!selected) continue;

      const score = selected.score || 0;
      dimensionScores[(question as any).dimension] += score;

      // 跨维度加分
      if (selected.crossScores) {
        for (const [dim, bonus] of Object.entries(selected.crossScores)) {
          if (dimensionScores[dim] !== undefined) {
            dimensionScores[dim] += bonus as number;
          }
        }
      }

      answersWithScore.push({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        score,
      });
    }

    // 3. 归一化到0-100
    for (const dim of DIMENSIONS) {
      dimensionScores[dim] = Math.min(100, Math.round(dimensionScores[dim]));
    }

    // 4. 计算总分和等级
    const totalScore = Object.values(dimensionScores).reduce((a, b) => a + b, 0);

    const level = FAITH_LEVELS.find((l) => totalScore >= l.min && totalScore <= l.max)
      || FAITH_LEVELS[FAITH_LEVELS.length - 1];

    // 5. 最强/最弱维度
    const sorted = DIMENSIONS.map((d) => ({ dim: d, score: dimensionScores[d] }))
      .sort((a, b) => b.score - a.score);
    const strongest = sorted[0].dim;
    const weakest = sorted[sorted.length - 1].dim;

    // 6. 推荐主题
    const modeThemes = DIMENSION_THEME_MAP[dto.mode] || DIMENSION_THEME_MAP.PERSONAL;
    const recommendedThemes = modeThemes[weakest] || [];

    // 7. 积分计算 (50基础 + 每100分+10)
    const pointsEarned = userId ? 50 + Math.floor(totalScore / 100) * 10 : 0;

    // 8. 保存结果
    const assessment = await this.prisma.faithAssessment.create({
      data: {
        userId,
        sessionId: userId ? undefined : sessionId,
        mode: dto.mode as any,
        answers: answersWithScore,
        awareness: dimensionScores.AWARENESS,
        resilience: dimensionScores.RESILIENCE,
        vision: dimensionScores.VISION,
        connection: dimensionScores.CONNECTION,
        legacy: dimensionScores.LEGACY,
        totalScore,
        level: level.name,
        levelCode: level.code,
        strongestDimension: strongest,
        weakestDimension: weakest,
        recommendedThemes,
        pointsEarned,
      },
    });

    // 9. 积分入账 (有冷却: 每种模式7天一次)
    if (userId && pointsEarned > 0) {
      await this.awardPoints(userId, dto.mode, pointsEarned, assessment.id, level.name);
    }

    return {
      id: assessment.id,
      mode: assessment.mode,
      scores: {
        awareness: dimensionScores.AWARENESS,
        resilience: dimensionScores.RESILIENCE,
        vision: dimensionScores.VISION,
        connection: dimensionScores.CONNECTION,
        legacy: dimensionScores.LEGACY,
      },
      totalScore,
      level: level.name,
      levelCode: level.code,
      levelColor: level.color,
      strongestDimension: strongest,
      weakestDimension: weakest,
      recommendedThemes,
      pointsEarned,
    };
  }

  /** 获取评估结果 */
  async getResult(id: string) {
    const result = await this.prisma.faithAssessment.findUnique({ where: { id } });
    if (!result) throw new NotFoundException('评估结果不存在');

    const level = FAITH_LEVELS.find((l) => l.code === result.levelCode) || FAITH_LEVELS[0];

    return {
      ...result,
      levelColor: level.color,
      scores: {
        awareness: result.awareness,
        resilience: result.resilience,
        vision: result.vision,
        connection: result.connection,
        legacy: result.legacy,
      },
    };
  }

  /** 我的评估历史 */
  async getMyResults(userId: string, page = 1, pageSize = 10) {
    const [items, total] = await Promise.all([
      this.prisma.faithAssessment.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          mode: true,
          totalScore: true,
          level: true,
          levelCode: true,
          awareness: true,
          resilience: true,
          vision: true,
          connection: true,
          legacy: true,
          completedAt: true,
        },
      }),
      this.prisma.faithAssessment.count({ where: { userId } }),
    ]);
    return { items, total, page, pageSize };
  }

  /** 公开统计 */
  async getStats() {
    const [totalAssessments, avgScores] = await Promise.all([
      this.prisma.faithAssessment.count(),
      this.prisma.faithAssessment.aggregate({
        _avg: {
          totalScore: true,
          awareness: true,
          resilience: true,
          vision: true,
          connection: true,
          legacy: true,
        },
      }),
    ]);

    const byMode = await this.prisma.faithAssessment.groupBy({
      by: ['mode'],
      _count: true,
      _avg: { totalScore: true },
    });

    return {
      totalAssessments,
      avgScore: Math.round(avgScores._avg.totalScore || 0),
      avgDimensions: {
        awareness: Math.round(avgScores._avg.awareness || 0),
        resilience: Math.round(avgScores._avg.resilience || 0),
        vision: Math.round(avgScores._avg.vision || 0),
        connection: Math.round(avgScores._avg.connection || 0),
        legacy: Math.round(avgScores._avg.legacy || 0),
      },
      byMode: byMode.map((m: any) => ({
        mode: m.mode,
        count: m._count,
        avgScore: Math.round(m._avg.totalScore || 0),
      })),
    };
  }

  /** 积分发放 (7天冷却) */
  private async awardPoints(
    userId: string,
    mode: string,
    points: number,
    assessmentId: string,
    levelName: string,
  ) {
    // 检查7天冷却
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recent = await this.prisma.faithAssessment.count({
      where: {
        userId,
        mode: mode as any,
        completedAt: { gt: sevenDaysAgo },
        pointsEarned: { gt: 0 },
        id: { not: assessmentId },
      },
    });

    if (recent > 0) return; // 冷却中

    const membership = await this.prisma.membership.findUnique({ where: { userId } });
    if (!membership) return;

    await this.prisma.$transaction([
      this.prisma.pointsTransaction.create({
        data: {
          membershipId: membership.id,
          type: 'EARN',
          amount: points,
          source: 'FAITH_ASSESSMENT',
          sourceId: assessmentId,
          description: `佳绩力评估完成 (${levelName})`,
        },
      }),
      this.prisma.membership.update({
        where: { id: membership.id },
        data: {
          totalPoints: { increment: points },
          availablePoints: { increment: points },
        },
      }),
    ]);
  }
}
