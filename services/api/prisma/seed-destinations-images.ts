/**
 * seed-destinations-images.ts — 目的地++ 图片兜底补丁
 *
 * 修复 v2-v6 新增站点 imageUrl 为空的问题。
 * 策略 [DATA-01]:
 *   1. 有同名直接映射 → 使用 HOLY_SITE_IMAGES[name]
 *   2. 否则按文化 slug 分组池 + 名称哈希确定性选取
 *
 * 幂等: 只填补空值，不覆盖已有图片
 */
import { PrismaClient } from '@prisma/client';
import { HOLY_SITE_IMAGES } from './seed-images';

const prisma = new PrismaClient();

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

async function main() {
  console.log('🖼  目的地++ 图片兜底补丁\n');

  const religions = await prisma.religion.findMany({ select: { id: true, slug: true } });
  const idToSlug = new Map(religions.map((r) => [r.id, r.slug]));

  // 建立各文化已有图片池 (来自 seed-images.ts + 现有数据库)
  const poolByReligion: Record<string, string[]> = {};
  const sitesWithImg = await prisma.holySite.findMany({
    where: { imageUrl: { not: null } },
    select: { imageUrl: true, religionId: true },
  });
  for (const s of sitesWithImg) {
    const slug = idToSlug.get(s.religionId);
    if (!slug || !s.imageUrl) continue;
    (poolByReligion[slug] ||= []).push(s.imageUrl);
  }
  // 并入 HOLY_SITE_IMAGES 值 (若池为空兜底)
  const allKnownImages = Object.values(HOLY_SITE_IMAGES).filter(Boolean);

  console.log('池规模:');
  for (const [slug, pool] of Object.entries(poolByReligion)) {
    console.log(`  ${slug}: ${pool.length}`);
  }

  const noImg = await prisma.holySite.findMany({
    where: { imageUrl: null },
    select: { id: true, name: true, religionId: true },
  });
  console.log(`\n需补图: ${noImg.length}`);

  let fixed = 0;
  let skipped = 0;
  for (const s of noImg) {
    const direct = HOLY_SITE_IMAGES[s.name];
    const slug = idToSlug.get(s.religionId) ?? '';
    const pool = poolByReligion[slug] || allKnownImages;
    let url: string | null = null;
    if (direct) url = direct;
    else if (pool.length > 0) url = pool[hashStr(s.name) % pool.length];

    if (!url) {
      skipped++;
      continue;
    }
    await prisma.holySite.update({
      where: { id: s.id },
      data: { imageUrl: url },
    });
    fixed++;
  }

  console.log(`\n✓ 补图: ${fixed}`);
  console.log(`⏭ 无可用池跳过: ${skipped}`);

  const remain = await prisma.holySite.count({ where: { imageUrl: null } });
  console.log(`📊 剩余无图: ${remain}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
