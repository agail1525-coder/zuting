import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { GuideQueryDto } from './dto/guide-query.dto';
import { AiDraftGuideDto, AiDraftGuideResult } from './dto/ai-draft-guide.dto';
import { AiCommunityLlmService } from '../ai-community/ai-community-llm.service';
import { buildGuideRefinementPrompt } from '../ai-community/agents/prompt-templates';

@Injectable()
export class GuideService {
  private readonly logger = new Logger(GuideService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: AiCommunityLlmService,
  ) {}

  async findAll(params: GuideQueryDto) {
    const { page = 1, limit = 20, tag, sort = 'latest' } = params;
    const take = Math.min(limit, 50);

    const where: Prisma.GuideWhereInput = {
      status: 'PUBLISHED',
    };

    if (tag) {
      where.tags = { has: tag };
    }

    let orderBy: Prisma.GuideOrderByWithRelationInput;
    switch (sort) {
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
      case 'mostLiked':
        orderBy = { likeCount: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [data, total] = await Promise.all([
      this.prisma.guide.findMany({
        where,
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy,
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.guide.count({ where }),
    ]);

    return { data, total, page, limit: take };
  }

  async create(userId: string, dto: CreateGuideDto) {
    return this.prisma.guide.create({
      data: {
        userId,
        title: dto.title,
        content: dto.content,
        coverImage: dto.coverImage,
        entityType: dto.entityType,
        entityId: dto.entityId,
        tags: dto.tags ?? [],
        status: 'DRAFT',
      },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
  }

  async findOne(id: string) {
    const guide = await this.prisma.guide.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
    if (!guide) throw new NotFoundException(`Guide ${id} not found`);

    // 详情页++ (DPG): 游记正文配图池 · 按 religion/holy-site 关联取图,前端段落间插图
    const inlineImages = await this.computeInlineImages(guide);

    // Increment viewCount (fire-and-forget, non-blocking)
    void this.prisma.guide.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return { ...guide, inlineImages };
  }

  /**
   * 计算游记正文配图池 · 读时拼装(不入 schema)
   * 来源优先级: HOLY_SITE 自身 gallery+photoStory+imageUrl > RELIGION 下多个圣地 gallery
   */
  private async computeInlineImages(guide: {
    entityType: string | null;
    entityId: string | null;
  }): Promise<string[]> {
    const urls: string[] = [];
    const pushJsonImages = (val: unknown, key: 'url' | 'imageUrl') => {
      if (Array.isArray(val)) {
        for (const it of val) {
          if (it && typeof it === 'object' && typeof (it as Record<string, unknown>)[key] === 'string') {
            urls.push((it as Record<string, unknown>)[key] as string);
          }
        }
      }
    };

    if (guide.entityType === 'HOLY_SITE' && guide.entityId) {
      const site = await this.prisma.holySite.findUnique({
        where: { id: guide.entityId },
        select: { imageUrl: true, gallery: true, photoStory: true },
      });
      if (site?.imageUrl) urls.push(site.imageUrl);
      pushJsonImages(site?.gallery, 'url');
      pushJsonImages(site?.photoStory, 'imageUrl');
    } else if (guide.entityType === 'RELIGION' && guide.entityId) {
      const sites = await this.prisma.holySite.findMany({
        where: { religionId: guide.entityId, status: 'ACTIVE' },
        select: { imageUrl: true, gallery: true, photoStory: true },
        take: 8,
      });
      for (const s of sites) {
        if (s.imageUrl) urls.push(s.imageUrl);
        pushJsonImages(s.gallery, 'url');
        pushJsonImages(s.photoStory, 'imageUrl');
      }
    }

    // 去重 + 过滤 picsum 兜底图 + 限 12 张
    const filtered = urls.filter((u) => u && !u.includes('picsum.photos'));
    return Array.from(new Set(filtered)).slice(0, 12);
  }

  async update(id: string, userId: string, dto: UpdateGuideDto) {
    const guide = await this.prisma.guide.findUnique({ where: { id } });
    if (!guide) throw new NotFoundException(`Guide ${id} not found`);
    if (guide.userId !== userId)
      throw new ForbiddenException('You can only edit your own guides');

    return this.prisma.guide.update({
      where: { id },
      data: dto,
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
  }

  async remove(id: string, userId: string) {
    const guide = await this.prisma.guide.findUnique({ where: { id } });
    if (!guide) throw new NotFoundException(`Guide ${id} not found`);
    if (guide.userId !== userId)
      throw new ForbiddenException('You can only delete your own guides');

    return this.prisma.guide.delete({ where: { id } });
  }

  async publish(id: string, userId: string) {
    const guide = await this.prisma.guide.findUnique({ where: { id } });
    if (!guide) throw new NotFoundException(`Guide ${id} not found`);
    if (guide.userId !== userId)
      throw new ForbiddenException('You can only publish your own guides');

    return this.prisma.guide.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
  }

  async findComments(
    guideId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const take = Math.min(limit, 50);

    // Verify guide exists
    const guide = await this.prisma.guide.findUnique({ where: { id: guideId }, select: { id: true } });
    if (!guide) throw new NotFoundException(`Guide ${guideId} not found`);

    const [data, total] = await Promise.all([
      this.prisma.guideComment.findMany({
        where: { guideId },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.guideComment.count({ where: { guideId } }),
    ]);

    return { data, total, page, limit: take };
  }

  async addComment(guideId: string, userId: string, content: string) {
    const guide = await this.prisma.guide.findUnique({ where: { id: guideId }, select: { id: true } });
    if (!guide) throw new NotFoundException(`Guide ${guideId} not found`);

    const [comment] = await this.prisma.$transaction([
      this.prisma.guideComment.create({
        data: { guideId, userId, content },
      }),
      this.prisma.guide.update({
        where: { id: guideId },
        data: { commentCount: { increment: 1 } },
      }),
    ]);

    return comment;
  }

  async like(guideId: string, userId: string) {
    const guide = await this.prisma.guide.findUnique({ where: { id: guideId }, select: { id: true } });
    if (!guide) throw new NotFoundException(`Guide ${guideId} not found`);

    await this.prisma.$transaction([
      this.prisma.guideLike.upsert({
        where: { guideId_userId: { guideId, userId } },
        create: { guideId, userId },
        update: {},
      }),
      this.prisma.guide.update({
        where: { id: guideId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);

    return { liked: true };
  }

  /**
   * AI 辅助整理游记草稿
   * 不直接落库——把结构化结果返回给前端预填，用户确认编辑后再走 create/publish
   */
  async aiDraft(dto: AiDraftGuideDto): Promise<AiDraftGuideResult> {
    if (!this.llm.isEnabled) {
      throw new ServiceUnavailableException('AI service is not configured');
    }
    const rawNotes = dto.rawNotes?.trim() ?? '';
    if (rawNotes.length < 10) {
      throw new BadRequestException(
        'rawNotes too short — please provide at least 10 characters',
      );
    }
    const images = dto.imageUrls ?? [];

    const prompt = buildGuideRefinementPrompt({
      rawNotes,
      imageCount: images.length,
      category: dto.category,
      entityName: dto.entityName,
    });

    let llmOutput = '';
    try {
      llmOutput = await this.llm.generate(prompt, '请开始整理。');
    } catch (err) {
      this.logger.error(`LLM generate failed: ${(err as Error).message}`);
      throw new ServiceUnavailableException('AI service temporarily unavailable');
    }
    if (!llmOutput) {
      throw new ServiceUnavailableException('AI returned empty response');
    }

    // 解析 JSON（容错：从文本中提取首个大括号包裹的 JSON）
    let parsed: {
      title?: string;
      content?: string;
      tags?: string[];
      suggestedCoverIdx?: number;
    } = {};
    try {
      const match = llmOutput.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : llmOutput);
    } catch {
      // 降级：第一行做 title，其余做 content
      const lines = llmOutput.split('\n').filter((l) => l.trim());
      parsed = {
        title: (lines[0] ?? '').slice(0, 100),
        content: lines.slice(1).join('\n'),
        tags: [],
        suggestedCoverIdx: 0,
      };
    }

    // 占位符替换：![图片N](IMG_N) → ![...](actualUrl)
    // 使用 split/join 避免动态 RegExp (ReDoS防护)
    let content = (parsed.content ?? '').trim();
    images.forEach((url, idx) => {
      content = content.split(`IMG_${idx}`).join(url);
    });
    // 移除残留的未替换占位符
    content = content.replace(/!\[[^\]]*\]\(IMG_\d+\)/g, '');

    const title = (parsed.title ?? '').trim().slice(0, 120) || '未命名游记';
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags
          .filter((t): t is string => typeof t === 'string')
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 8)
      : [];
    const suggestedCoverIdx =
      typeof parsed.suggestedCoverIdx === 'number' &&
      parsed.suggestedCoverIdx >= 0 &&
      parsed.suggestedCoverIdx < images.length
        ? parsed.suggestedCoverIdx
        : images.length > 0
        ? 0
        : -1;

    return { title, content, tags, suggestedCoverIdx };
  }

  async unlike(guideId: string, userId: string) {
    const guide = await this.prisma.guide.findUnique({ where: { id: guideId }, select: { id: true } });
    if (!guide) throw new NotFoundException(`Guide ${guideId} not found`);

    const existing = await this.prisma.guideLike.findUnique({
      where: { guideId_userId: { guideId, userId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.guideLike.delete({
          where: { guideId_userId: { guideId, userId } },
        }),
        this.prisma.guide.update({
          where: { id: guideId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
    }

    return { liked: false };
  }
}
