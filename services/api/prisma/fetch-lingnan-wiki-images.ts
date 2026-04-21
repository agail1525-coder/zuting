/**
 * fetch-lingnan-wiki-images.ts — 本地运行,为岭南道禅路线 4 新圣地拉真实 Wiki 图
 *
 * 用法 (本地,可访问维基):
 *   NODE_NO_COMPILE_CACHE=1 npx tsx services/api/prisma/fetch-lingnan-wiki-images.ts
 *
 * 输出: services/api/prisma/data/wiki-images-lingnan.json
 *   { "光孝寺": ["https://upload.wikimedia.org/...","..."], ... }
 *
 * 生产: seed-lingnan-dao-chan-route.ts 会优先读取此 JSON 的首张作为 imageUrl。
 */
import * as fs from 'fs';
import * as path from 'path';

const OUT = path.join(__dirname, 'data', 'wiki-images-lingnan.json');
const UA = 'zuting-lingnan-bot/1.0 (https://zuting.fszyl.top)';
const TIMEOUT = 15000;

// 每站准备多个别名,提高命中率
const SITES: Record<string, { zh: string[]; en: string[]; wikidata?: string[] }> = {
  光孝寺: {
    zh: ['光孝寺_(广州市)', '光孝寺_(广州)', '光孝寺'],
    en: ['Guangxiao_Temple', 'Guangxiao_Temple_(Guangzhou)'],
    wikidata: ['Guangxiao Temple Guangzhou', '广州光孝寺'],
  },
  云门山大觉禅寺: {
    zh: ['云门寺_(韶关市)', '云门宗', '云门寺_(乳源县)', '大觉禅寺_(乳源县)'],
    en: ['Yunmen_Monastery', 'Yunmen_Temple', 'Yunmen_school'],
    wikidata: ['Yunmen Monastery', 'Yunmen Temple', '云门山大觉禅寺'],
  },
  国恩寺: {
    zh: ['国恩寺', '国恩寺_(新兴县)', '六祖慧能'],
    en: ['Guoen_Temple', 'National_Gratitude_Temple', 'Huineng'],
    wikidata: ['Guoen Temple Xinxing', 'National Gratitude Temple'],
  },
  纯阳观: {
    zh: ['纯阳观_(广州市)', '纯阳观', '吕洞宾'],
    en: ['Chunyang_Taoist_Temple', 'Chunyang_Temple_(Guangzhou)', 'Lü_Dongbin'],
    wikidata: ['Chunyang Taoist Temple Guangzhou', '纯阳观广州'],
  },
  // 南华禅寺 已有图,但顺便刷新
  南华禅寺: {
    zh: ['南华寺', '南华禅寺'],
    en: ['Nanhua_Temple', 'Nanhua_Monastery'],
    wikidata: ['Nanhua Temple', '南华寺'],
  },
};

async function fetchJson(url: string): Promise<any> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn(`  × ${url.slice(0, 80)}... ${(e as Error).message}`);
    return null;
  }
}

// REST summary 端点的主图
async function wikiSummary(title: string, lang: 'en' | 'zh'): Promise<string | null> {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const data: any = await fetchJson(url);
  if (!data) return null;
  const img = data.originalimage?.source || data.thumbnail?.source;
  if (img && typeof img === 'string' && img.includes('upload.wikimedia.org')) return img;
  return null;
}

// MediaWiki pageimages for given titles — returns ALL images found
async function wikiPageImages(titles: string[], lang: 'en' | 'zh'): Promise<string[]> {
  if (titles.length === 0) return [];
  const titlesParam = titles.map((t) => encodeURIComponent(t)).join('|');
  const url =
    `https://${lang}.wikipedia.org/w/api.php?action=query&format=json` +
    `&prop=pageimages&piprop=original|thumbnail&pithumbsize=1600` +
    `&titles=${titlesParam}&origin=*`;
  const data: any = await fetchJson(url);
  const pages = data?.query?.pages;
  if (!pages) return [];
  const out: string[] = [];
  for (const p of Object.values(pages) as any[]) {
    const img = p.original?.source || p.thumbnail?.source;
    if (img && typeof img === 'string' && img.includes('upload.wikimedia.org')) out.push(img);
  }
  return out;
}

// Commons: search "filetype:bitmap" with term — returns up to 8 images
async function commonsSearch(term: string, limit = 8): Promise<string[]> {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&prop=imageinfo&iiprop=url&iiurlwidth=1600` +
    `&generator=search&gsrsearch=${encodeURIComponent(term + ' filetype:bitmap')}` +
    `&gsrlimit=${limit}&gsrnamespace=6&origin=*`;
  const data: any = await fetchJson(url);
  const pages = data?.query?.pages;
  if (!pages) return [];
  const out: string[] = [];
  for (const p of Object.values(pages) as any[]) {
    const info = p.imageinfo?.[0];
    const url = info?.thumburl || info?.url;
    if (url && typeof url === 'string' && url.includes('upload.wikimedia.org')) {
      // Skip obviously irrelevant: logos, maps, diagrams
      if (/\b(logo|map|diagram|chart|coat_of_arms|flag)\b/i.test(url)) continue;
      out.push(url);
    }
  }
  return out;
}

// Wikidata P18 — most reliable per-entity image
async function wikidataP18(term: string): Promise<string | null> {
  const s = await fetchJson(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&limit=3&search=${encodeURIComponent(term)}`,
  );
  const hits = s?.search ?? [];
  for (const h of hits) {
    const qid = h.id;
    if (!qid) continue;
    const e = await fetchJson(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids=${qid}`,
    );
    const filename = e?.entities?.[qid]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    if (filename && typeof filename === 'string') {
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=1600`;
    }
  }
  return null;
}

async function fetchSite(name: string, aliases: { zh: string[]; en: string[]; wikidata?: string[] }): Promise<string[]> {
  console.log(`\n► ${name}`);
  const urls = new Set<string>();

  // 1) ZH REST summary primary
  for (const title of aliases.zh) {
    const img = await wikiSummary(title, 'zh');
    if (img) {
      urls.add(img);
      console.log(`  ✓ zh/${title}: primary`);
      break;
    }
  }

  // 2) EN REST summary primary
  for (const title of aliases.en) {
    const img = await wikiSummary(title, 'en');
    if (img) {
      urls.add(img);
      console.log(`  ✓ en/${title}: primary`);
      break;
    }
  }

  // 3) Wikidata P18
  for (const term of aliases.wikidata ?? aliases.en) {
    const img = await wikidataP18(term);
    if (img) {
      urls.add(img);
      console.log(`  ✓ wikidata/${term}: P18`);
      break;
    }
  }

  // 4) ZH pageimages bulk
  const zhImgs = await wikiPageImages(aliases.zh, 'zh');
  for (const img of zhImgs) urls.add(img);
  if (zhImgs.length > 0) console.log(`  ✓ zh pageimages: +${zhImgs.length}`);

  // 5) EN pageimages bulk
  const enImgs = await wikiPageImages(aliases.en, 'en');
  for (const img of enImgs) urls.add(img);
  if (enImgs.length > 0) console.log(`  ✓ en pageimages: +${enImgs.length}`);

  // 6) Commons search (fallback for richer gallery)
  const searchTerms = [...(aliases.wikidata ?? []), ...aliases.en.slice(0, 1)];
  for (const term of searchTerms) {
    const imgs = await commonsSearch(term, 4);
    for (const img of imgs) urls.add(img);
    if (imgs.length > 0) console.log(`  ✓ commons/${term}: +${imgs.length}`);
  }

  const list = Array.from(urls);
  console.log(`  = ${name}: ${list.length} total images`);
  return list.slice(0, 10); // cap at 10 per site
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Fetching Wiki images for Lingnan route sites');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const result: Record<string, string[]> = {};
  for (const [name, aliases] of Object.entries(SITES)) {
    try {
      result[name] = await fetchSite(name, aliases);
    } catch (e) {
      console.error(`  ✗ ${name}: ${(e as Error).message}`);
      result[name] = [];
    }
  }

  fs.writeFileSync(OUT, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n✅ Saved to ${OUT}`);
  console.log('   Sites:');
  for (const [name, list] of Object.entries(result)) {
    console.log(`     - ${name}: ${list.length} images`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
