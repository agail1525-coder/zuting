import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TEN_BHUMI, getBhumi, BHUMI_TOTAL, VowSource } from './ten-bhumi.constants';

export type VowEvidence = {
  type: VowSource;
  evidenceId?: string;
  reflection?: string;
  doneAt: string;
  count: number;
};

type VowsDoneMap = Record<string, VowEvidence[]>;

@Injectable()
export class BhumiPathService {
  constructor(private readonly prisma: PrismaService) {}

  private async getJourney(userId: string) {
    const journey = await this.prisma.fulfillmentJourney.findUnique({ where: { userId } });
    if (!journey) throw new NotFoundException('请先开启修行之路');
    return journey;
  }

  private parseVowsDone(raw: unknown): VowsDoneMap {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    return raw as VowsDoneMap;
  }

  private tallyVow(vowsDone: VowsDoneMap, bhumiNo: number, vowIdx: number, type: VowSource): number {
    const key = `${bhumiNo}`;
    const list = vowsDone[key] ?? [];
    // Count evidences of matching type for this bhumi. vowIdx disambiguation done at write time.
    return list.filter((e) => e.type === type).reduce((sum, e) => sum + (e.count || 1), 0);
  }

  async getBhumiPath(userId: string) {
    const journey = await this.getJourney(userId);
    const unlocked = journey.oxStage >= 10;
    const vowsDone = this.parseVowsDone(journey.bhumiVowsDone);

    const stages = TEN_BHUMI.map((b) => {
      const isCurrent = journey.bhumiStage === b.no;
      const isCompleted = journey.bhumiStage > b.no;
      const isLocked = !unlocked || journey.bhumiStage < b.no - 1;
      const vows = b.vows.map((v) => {
        const done = this.tallyVow(vowsDone, b.no, 0, v.type);
        return {
          type: v.type,
          title: v.title,
          description: v.description,
          target: v.target,
          reflectionMin: v.reflectionMin,
          done: Math.min(done, v.target),
          completed: done >= v.target,
        };
      });
      const allVowsDone = vows.every((v) => v.completed);
      return {
        no: b.no,
        name: b.name,
        sanskrit: b.sanskrit,
        paramita: b.paramita,
        paramitaEn: b.paramitaEn,
        focus: b.focus,
        gateVow: b.gateVow,
        emoji: b.emoji,
        scriptureSlugs: b.scriptureSlugs,
        recommendedSiteTradition: b.recommendedSiteTradition,
        vows,
        completed: isCompleted,
        current: isCurrent,
        locked: isLocked,
        canAdvance: isCurrent && allVowsDone,
      };
    });

    return {
      unlocked,
      currentBhumi: journey.bhumiStage,
      unlockedAt: journey.bhumiUnlockedAt,
      oxStage: journey.oxStage,
      total: BHUMI_TOTAL,
      stages,
    };
  }

  async getGate(userId: string) {
    const journey = await this.getJourney(userId);
    const eligible = journey.oxStage >= 10;
    return {
      eligible,
      reason: eligible ? '已具菩萨道发心资格' : '需先圆满十牛图第十阶 · 入廛垂手',
      oxStage: journey.oxStage,
      oxRequired: 10,
    };
  }

  async unlockBhumi(userId: string) {
    const journey = await this.getJourney(userId);
    if (journey.oxStage < 10) {
      throw new ForbiddenException('需先圆满十牛图');
    }
    if (journey.bhumiStage >= 1) {
      return journey;
    }
    return this.prisma.fulfillmentJourney.update({
      where: { userId },
      data: { bhumiStage: 1, bhumiUnlockedAt: new Date() },
    });
  }

  async submitVow(
    userId: string,
    input: { bhumiStage: number; vowType: VowSource; evidenceId?: string; reflection?: string; count?: number },
  ) {
    const journey = await this.getJourney(userId);
    if (journey.oxStage < 10) throw new ForbiddenException('需先圆满十牛图');
    if (journey.bhumiStage < 1) throw new ForbiddenException('请先进入欢喜地');
    if (input.bhumiStage !== journey.bhumiStage) {
      throw new BadRequestException('只能提交当前地的大愿');
    }

    const bhumi = getBhumi(input.bhumiStage);
    if (!bhumi) throw new BadRequestException('无效的地位');
    const matchedVow = bhumi.vows.find((v) => v.type === input.vowType);
    if (!matchedVow) throw new BadRequestException(`此地无 ${input.vowType} 类型大愿`);

    const minReflection = matchedVow.reflectionMin;
    const reflection = (input.reflection ?? '').trim();
    if (minReflection > 0 && reflection.length < minReflection) {
      throw new BadRequestException(`反思文字至少 ${minReflection} 字 (当前 ${reflection.length})`);
    }

    const vowsDone = this.parseVowsDone(journey.bhumiVowsDone);
    const key = `${input.bhumiStage}`;
    if (!vowsDone[key]) vowsDone[key] = [];
    vowsDone[key].push({
      type: input.vowType,
      evidenceId: input.evidenceId,
      reflection: reflection || undefined,
      doneAt: new Date().toISOString(),
      count: input.count ?? 1,
    });

    const updated = await this.prisma.fulfillmentJourney.update({
      where: { userId },
      data: { bhumiVowsDone: vowsDone as any },
    });

    return this.getBhumiPath(userId);
  }

  async advanceBhumi(userId: string) {
    const journey = await this.getJourney(userId);
    if (journey.oxStage < 10) throw new ForbiddenException('需先圆满十牛图');
    if (journey.bhumiStage < 1) throw new ForbiddenException('请先进入欢喜地');
    if (journey.bhumiStage >= BHUMI_TOTAL) {
      throw new BadRequestException('已证法云地，愿财双圆');
    }

    const bhumi = getBhumi(journey.bhumiStage);
    if (!bhumi) throw new BadRequestException('无效的地位');
    const vowsDone = this.parseVowsDone(journey.bhumiVowsDone);
    const allDone = bhumi.vows.every(
      (v) => this.tallyVow(vowsDone, bhumi.no, 0, v.type) >= v.target,
    );
    if (!allDone) {
      throw new ForbiddenException({
        code: 'BHUMI_ADVANCE_LOCKED',
        message: `${bhumi.name}三大愿尚未圆满`,
        bhumi: bhumi.no,
      });
    }

    return this.prisma.fulfillmentJourney.update({
      where: { userId },
      data: { bhumiStage: journey.bhumiStage + 1 },
    });
  }
}
