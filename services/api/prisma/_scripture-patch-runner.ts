import { PrismaClient } from '@prisma/client';

export interface ChapterDef {
  chapterNo: number;
  title: string;
  subtitle?: string;
  originalText: string;
  commentary?: string;
  practiceHint?: string;
}

export interface NewScriptureDef {
  slug: string;
  title: string;
  titleEn?: string;
  author?: string;
  era?: string;
  ring: number;
  categorySlug: string;
  summary: string;
  significance?: string;
  difficulty: number;
  oxStageMin: number;
  oxStageMax: number;
  readingMins?: number;
  tags: string[];
  sortOrder: number;
  relatedSlugs?: string[];
  chapters: ChapterDef[];
}

export async function runScripturePatch(label: string, scriptures: NewScriptureDef[]) {
  const prisma = new PrismaClient();
  try {
    console.log(`🌱 ${label}\n`);
    let s = 0;
    let c = 0;
    for (const def of scriptures) {
      const cat = await prisma.scriptureCategory.findUnique({ where: { slug: def.categorySlug } });
      if (!cat) {
        console.warn(`  ⚠ 类别未找到: ${def.categorySlug}, 跳过 ${def.slug}`);
        continue;
      }
      const sc = await prisma.scripture.upsert({
        where: { slug: def.slug },
        create: {
          slug: def.slug, title: def.title, titleEn: def.titleEn, author: def.author, era: def.era,
          ring: def.ring, categoryId: cat.id, tradition: cat.tradition,
          summary: def.summary, significance: def.significance,
          difficulty: def.difficulty, oxStageMin: def.oxStageMin, oxStageMax: def.oxStageMax,
          readingMins: def.readingMins, tags: def.tags, sortOrder: def.sortOrder, isPublished: true,
        },
        update: {
          title: def.title, titleEn: def.titleEn, author: def.author, era: def.era,
          ring: def.ring, categoryId: cat.id, tradition: cat.tradition,
          summary: def.summary, significance: def.significance,
          difficulty: def.difficulty, oxStageMin: def.oxStageMin, oxStageMax: def.oxStageMax,
          readingMins: def.readingMins, tags: def.tags, sortOrder: def.sortOrder,
        },
      });
      s++;
      for (const ch of def.chapters) {
        await prisma.scriptureChapter.upsert({
          where: { scriptureId_chapterNo: { scriptureId: sc.id, chapterNo: ch.chapterNo } },
          create: {
            scriptureId: sc.id, chapterNo: ch.chapterNo, title: ch.title, subtitle: ch.subtitle,
            originalText: ch.originalText, commentary: ch.commentary, practiceHint: ch.practiceHint,
          },
          update: {
            title: ch.title, subtitle: ch.subtitle,
            originalText: ch.originalText, commentary: ch.commentary, practiceHint: ch.practiceHint,
          },
        });
        c++;
      }
      await prisma.scripture.update({
        where: { slug: def.slug },
        data: { chapterCount: def.chapters.length },
      });
    }
    console.log(`  ✓ ${s} 经论 ${c} 章节`);
    for (const def of scriptures) {
      if (!def.relatedSlugs?.length) continue;
      const rel = await prisma.scripture.findMany({
        where: { slug: { in: def.relatedSlugs } }, select: { id: true },
      });
      if (rel.length) {
        await prisma.scripture.update({
          where: { slug: def.slug },
          data: { relatedIds: rel.map((r) => r.id) },
        });
      }
    }
    const ts = await prisma.scripture.count();
    const tc = await prisma.scriptureChapter.count();
    console.log(`📜 ${label} 完成. 总数: ${ts} / ${tc}`);
  } catch (e) {
    console.error('❌ 失败:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
