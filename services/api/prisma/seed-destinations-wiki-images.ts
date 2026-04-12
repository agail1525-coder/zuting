/**
 * seed-destinations-wiki-images.ts — 从 Wikipedia 拉取每个目的地的真实代表图
 *
 * 问题: v2-v6 新增 + 老 ADMIN 站点的 imageUrl 大多为空或用池内哈希选图(不匹配)
 * 解法: 调用 Wikipedia REST API 按 nameEn → name 查询每站点页摘要,取 originalimage/thumbnail
 * API: https://{lang}.wikipedia.org/api/rest_v1/page/summary/{title}
 * 幂等: 所有站点重查,以最后一次 Wikipedia 返回为准
 * 策略: 图像必须来自 upload.wikimedia.org; 失败则保留原 imageUrl (降级而非置 null)
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function wikiImage(title: string, lang: 'en' | 'zh'): Promise<string | null> {
  try {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'zuting-destination-bot/1.0 (https://zuting.fszyl.top)' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    const img = data.originalimage?.source || data.thumbnail?.source;
    if (!img || typeof img !== 'string') return null;
    if (!img.includes('upload.wikimedia.org')) return null;
    return img;
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('🌐 目的地++ Wikipedia 真实图片补丁\n');

  const sites = await prisma.holySite.findMany({
    select: { id: true, name: true, nameEn: true, country: true },
    orderBy: { name: 'asc' },
  });
  console.log(`待处理: ${sites.length} 站点\n`);

  let hitEn = 0, hitZh = 0, miss = 0;
  const missList: string[] = [];

  for (let i = 0; i < sites.length; i++) {
    const s = sites[i];
    let img: string | null = null;

    if (s.nameEn) img = await wikiImage(s.nameEn, 'en');
    if (img) hitEn++;

    if (!img) {
      img = await wikiImage(s.name, 'zh');
      if (img) hitZh++;
    }

    if (!img) {
      miss++;
      missList.push(`${s.name} (${s.nameEn || '-'}) / ${s.country}`);
    } else {
      await prisma.holySite.update({ where: { id: s.id }, data: { imageUrl: img } });
    }

    if ((i + 1) % 20 === 0) {
      console.log(`  进度 ${i + 1}/${sites.length}  en=${hitEn} zh=${hitZh} miss=${miss}`);
    }
    await sleep(120); // 礼貌性 ~8 req/s
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✓ 英文维基命中: ${hitEn}`);
  console.log(`✓ 中文维基命中: ${hitZh}`);
  console.log(`⚠ 双语未命中: ${miss}`);
  if (missList.length && missList.length <= 50) {
    console.log(`\n未命中清单 (保留原图):`);
    for (const m of missList) console.log(`  - ${m}`);
  } else if (missList.length > 50) {
    console.log(`\n未命中前 30 条:`);
    for (const m of missList.slice(0, 30)) console.log(`  - ${m}`);
    console.log(`  ...还有 ${missList.length - 30} 条`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
