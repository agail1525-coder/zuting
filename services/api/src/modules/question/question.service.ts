import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionQueryDto } from './dto/question-query.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: QuestionQueryDto) {
    const { page = 1, limit = 20, tag, status, sort = 'latest' } = params;
    const take = Math.min(limit, 50);
    const skip = (page - 1) * take;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (status) {
      where['status'] = status;
    }
    if (tag) {
      where['tags'] = { has: tag };
    }
    // "unanswered" sort means filter to answerCount === 0
    if (sort === 'unanswered') {
      where['answerCount'] = 0;
    }

    // Build orderBy
    let orderBy: Record<string, string>;
    if (sort === 'hot') {
      orderBy = { viewCount: 'desc' };
    } else {
      // latest and unanswered both sort by newest first
      orderBy = { createdAt: 'desc' };
    }

    const [items, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        include: {
          _count: { select: { answers: true } },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.question.count({ where }),
    ]);

    return { items, total, page, pageSize: take };
  }

  async create(userId: string, dto: CreateQuestionDto) {
    return this.prisma.question.create({
      data: {
        title: dto.title,
        content: dto.content,
        entityType: dto.entityType,
        entityId: dto.entityId,
        tags: dto.tags ?? [],
        userId,
        status: 'OPEN',
        viewCount: 0,
        answerCount: 0,
      },
    });
  }

  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        answers: {
          orderBy: [
            { isAccepted: 'desc' },
            { voteCount: 'desc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    if (!question) {
      throw new NotFoundException(`Question ${id} not found`);
    }

    // Increment viewCount (fire-and-forget, no await to keep response fast)
    void this.prisma.question.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return question;
  }

  async update(id: string, userId: string, dto: UpdateQuestionDto) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });
    if (!question) {
      throw new NotFoundException(`Question ${id} not found`);
    }
    if (question.userId !== userId) {
      throw new ForbiddenException('Only the question author can edit this question');
    }

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data['title'] = dto.title;
    if (dto.content !== undefined) data['content'] = dto.content;
    if (dto.tags !== undefined) data['tags'] = dto.tags;

    return this.prisma.question.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });
    if (!question) {
      throw new NotFoundException(`Question ${id} not found`);
    }
    if (question.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only the question author or an admin can delete this question');
    }

    // Delete answers first, then the question
    await this.prisma.$transaction([
      this.prisma.answer.deleteMany({ where: { questionId: id } }),
      this.prisma.question.delete({ where: { id } }),
    ]);

    return { deleted: true };
  }

  async addAnswer(questionId: string, userId: string, dto: CreateAnswerDto) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) {
      throw new NotFoundException(`Question ${questionId} not found`);
    }

    const answer = await this.prisma.answer.create({
      data: {
        content: dto.content,
        questionId,
        userId,
        isAccepted: false,
        voteCount: 0,
      },
    });

    // Increment answerCount; set status to ANSWERED if this is the first answer
    const updateData: Record<string, unknown> = {
      answerCount: { increment: 1 },
    };
    if (question.answerCount === 0) {
      updateData['status'] = 'ANSWERED';
    }

    await this.prisma.question.update({
      where: { id: questionId },
      data: updateData,
    });

    return answer;
  }

  async acceptAnswer(
    questionId: string,
    answerId: string,
    userId: string,
  ) {
    // IDOR check (R-68): only question author can accept an answer
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) {
      throw new NotFoundException(`Question ${questionId} not found`);
    }
    if (question.userId !== userId) {
      throw new ForbiddenException('Only the question author can accept an answer');
    }

    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
    });
    if (!answer || answer.questionId !== questionId) {
      throw new NotFoundException(`Answer ${answerId} not found on question ${questionId}`);
    }

    // Unaccept any previously accepted answer, then accept the target answer
    await this.prisma.$transaction([
      this.prisma.answer.updateMany({
        where: { questionId, isAccepted: true },
        data: { isAccepted: false },
      }),
      this.prisma.answer.update({
        where: { id: answerId },
        data: { isAccepted: true },
      }),
    ]);

    return this.prisma.answer.findUnique({
      where: { id: answerId },
    });
  }

  async voteAnswer(answerId: string, _userId: string) {
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
    });
    if (!answer) {
      throw new NotFoundException(`Answer ${answerId} not found`);
    }

    // MVP: increment voteCount on each POST call (no duplicate prevention)
    return this.prisma.answer.update({
      where: { id: answerId },
      data: { voteCount: { increment: 1 } },
    });
  }
}
