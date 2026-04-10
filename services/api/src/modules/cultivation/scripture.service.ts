import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FulfillmentService } from './fulfillment.service';
import { ScriptureListQueryDto, InsightQueryDto } from './dto/scripture.dto';

@Injectable()
export class ScriptureService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fulfillmentService: FulfillmentService,
  ) {}

  // ── 分类树 ─────────────────────────────────────────

  async getCategories() {
    const all = await this.prisma.scriptureCategory.findMany({
      orderBy: [{ ring: 'asc' }, { sortOrder: 'asc' }],
      include: { _count: { select: { scriptures: true } } },
    });
    // 构建树形结构
    const map = new Map(all.map((c) => [c.id, { ...c, children: [] as any[] }]));
    const roots: any[] = [];
    for (const node of map.values()) {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  // ── 经论列表 ───────────────────────────────────────

  async listScriptures(dto: ScriptureListQueryDto) {
    const page = dto.page ?? 1;
    const pageSize = Math.min(dto.pageSize ?? 20, 50);
    const where: any = { isPublished: true };
    if (dto.ring) where.ring = dto.ring;
    if (dto.tradition) where.tradition = dto.tradition;
    if (dto.categorySlug) {
      const cat = await this.prisma.scriptureCategory.findUnique({
        where: { slug: dto.categorySlug },
      });
      if (cat) where.categoryId = cat.id;
    }
    if (dto.search) {
      where.OR = [
        { title: { contains: dto.search, mode: 'insensitive' } },
        { author: { contains: dto.search, mode: 'insensitive' } },
        { tags: { has: dto.search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.scripture.findMany({
        where,
        orderBy: [{ ring: 'asc' }, { sortOrder: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: { select: { slug: true, name: true, icon: true, color: true } },
        },
      }),
      this.prisma.scripture.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  // ── 经论详情 ───────────────────────────────────────

  async getScripture(slug: string) {
    const scripture = await this.prisma.scripture.findUnique({
      where: { slug },
      include: {
        category: { select: { slug: true, name: true, icon: true, color: true, ring: true } },
        chapters: {
          select: { chapterNo: true, title: true, subtitle: true },
          orderBy: { chapterNo: 'asc' },
        },
      },
    });
    if (!scripture) throw new NotFoundException('经论不存在');

    // 获取关联经论
    let related: any[] = [];
    if (scripture.relatedIds.length > 0) {
      related = await this.prisma.scripture.findMany({
        where: { id: { in: scripture.relatedIds }, isPublished: true },
        select: { slug: true, title: true, author: true, tradition: true, ring: true },
        take: 10,
      });
    }

    // 获取最新AI悟道
    const insights = await this.prisma.scriptureInsight.findMany({
      where: { scriptureId: scripture.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return { ...scripture, related, insights };
  }

  // ── 章节详情 ───────────────────────────────────────

  async getChapter(slug: string, chapterNo: number) {
    const scripture = await this.prisma.scripture.findUnique({
      where: { slug },
      select: { id: true, title: true, slug: true, chapterCount: true },
    });
    if (!scripture) throw new NotFoundException('经论不存在');

    const chapter = await this.prisma.scriptureChapter.findUnique({
      where: { scriptureId_chapterNo: { scriptureId: scripture.id, chapterNo } },
    });
    if (!chapter) throw new NotFoundException('章节不存在');

    return {
      scripture: { title: scripture.title, slug: scripture.slug, chapterCount: scripture.chapterCount },
      chapter,
    };
  }

  // ── 知识图谱数据 ──────────────────────────────────

  async getGraph() {
    const categories = await this.prisma.scriptureCategory.findMany({
      orderBy: [{ ring: 'asc' }, { sortOrder: 'asc' }],
      select: { id: true, slug: true, name: true, ring: true, tradition: true, parentId: true, icon: true, color: true },
    });
    const scriptures = await this.prisma.scripture.findMany({
      where: { isPublished: true },
      select: { id: true, slug: true, title: true, categoryId: true, tradition: true, ring: true, relatedIds: true, difficulty: true },
      orderBy: { sortOrder: 'asc' },
    });

    // 节点 = 分类 + 经论
    const nodes = [
      ...categories.map((c) => ({
        id: c.id,
        type: 'category' as const,
        slug: c.slug,
        label: c.name,
        ring: c.ring,
        tradition: c.tradition,
        parentId: c.parentId,
        icon: c.icon,
        color: c.color,
      })),
      ...scriptures.map((s) => ({
        id: s.id,
        type: 'scripture' as const,
        slug: s.slug,
        label: s.title,
        ring: s.ring,
        tradition: s.tradition,
        parentId: s.categoryId,
        icon: null,
        color: null,
      })),
    ];

    // 边 = 分类归属 + relatedIds
    const edges: { source: string; target: string; type: string }[] = [];
    for (const s of scriptures) {
      edges.push({ source: s.categoryId, target: s.id, type: 'contains' });
      for (const rid of s.relatedIds) {
        edges.push({ source: s.id, target: rid, type: 'related' });
      }
    }
    for (const c of categories) {
      if (c.parentId) {
        edges.push({ source: c.parentId, target: c.id, type: 'child' });
      }
    }

    return { nodes, edges };
  }

  // ── 基于阶位推荐 ──────────────────────────────────

  async getRecommended(userId: string) {
    const journey = await this.fulfillmentService.getOrCreateJourney(userId);
    const stage = journey.oxStage;
    const tradition = journey.primaryTradition;

    const items = await this.prisma.scripture.findMany({
      where: {
        isPublished: true,
        oxStageMin: { lte: stage },
        oxStageMax: { gte: stage },
      },
      orderBy: [
        // 优先用户传统
        { sortOrder: 'asc' },
      ],
      take: 10,
      include: {
        category: { select: { slug: true, name: true, icon: true, color: true } },
      },
    });

    // 排序：用户传统优先 + Ring 1优先
    items.sort((a, b) => {
      const aTrad = a.tradition === tradition ? 0 : 1;
      const bTrad = b.tradition === tradition ? 0 : 1;
      if (aTrad !== bTrad) return aTrad - bTrad;
      return a.ring - b.ring;
    });

    return items.slice(0, 6);
  }

  // ── 记录阅读 ──────────────────────────────────────

  async recordView(slug: string) {
    await this.prisma.scripture.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });
  }

  // ── AI悟道列表 ─────────────────────────────────────

  async listInsights(dto: InsightQueryDto) {
    const page = dto.page ?? 1;
    const pageSize = Math.min(dto.pageSize ?? 20, 50);
    const where: any = {};

    if (dto.scriptureSlug) {
      const s = await this.prisma.scripture.findUnique({
        where: { slug: dto.scriptureSlug },
        select: { id: true },
      });
      if (s) where.scriptureId = s.id;
    }
    if (dto.tradition) where.tradition = dto.tradition;
    if (dto.oxStage) where.oxStage = dto.oxStage;
    if (dto.insightType) where.insightType = dto.insightType;

    const [items, total] = await Promise.all([
      this.prisma.scriptureInsight.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          scripture: { select: { slug: true, title: true, tradition: true } },
        },
      }),
      this.prisma.scriptureInsight.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }
}
