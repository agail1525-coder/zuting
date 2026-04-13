/**
 * phase3-fill-missing-images.ts — 为剩余 157 个站点抓 Wikidata P18 图
 *
 * 1. 查 DB,找出 imageUrl 不是 /static/holy-sites/ 开头的站点
 * 2. 对每个站点 name + nameEn: Wikidata wbsearchentities → wbgetentities.claims.P18
 * 3. 命中则写入 wiki-images.json 并下载
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const prisma = new PrismaClient();
const JSON_PATH = path.join(__dirname, 'data', 'wiki-images.json');
const OUT_DIR = path.join(__dirname, 'data', 'holy-sites-images');
const MAP_PATH = path.join(__dirname, 'data', 'holy-sites-images-map.json');
const UA = 'zuting-destination-bot/2.0 (https://zuting.fszyl.top)';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function wikidataP18(term: string): Promise<string | null> {
  try {
    const sr = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&limit=3&search=${encodeURIComponent(term)}`,
      { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) },
    );
    if (!sr.ok) return null;
    const sd: any = await sr.json();
    const hits: any[] = sd?.search ?? [];
    for (const h of hits) {
      const qid = h.id;
      const er = await fetch(
        `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids=${qid}`,
        { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) },
      );
      if (!er.ok) continue;
      const ed: any = await er.json();
      const p18 = ed?.entities?.[qid]?.claims?.P18;
      const filename = p18?.[0]?.mainsnak?.datavalue?.value;
      if (filename) {
        return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=1200`;
      }
      await sleep(300);
    }
  } catch {}
  return null;
}

async function downloadOne(url: string, outPath: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      redirect: 'follow',
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2048) return false;
    fs.writeFileSync(outPath, buf);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const wikiMap: Record<string, string> = fs.existsSync(JSON_PATH)
    ? JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'))
    : {};
  const localMap: Record<string, string> = fs.existsSync(MAP_PATH)
    ? JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'))
    : {};
  const mapped = new Set(Object.keys(localMap));
  const allSites = await prisma.holySite.findMany({
    select: { id: true, name: true, nameEn: true, imageUrl: true },
  });
  const sites = allSites.filter((s) => !mapped.has(s.name));
  console.log(`🎯 目标: ${sites.length}/${allSites.length} 站点无本地图`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let fetched = 0;
  let downloaded = 0;
  let failed = 0;
  const stillMissing: string[] = [];

  for (const [i, s] of sites.entries()) {
    if (i % 10 === 0) {
      console.log(`  [${i}/${sites.length}] fetched=${fetched} dl=${downloaded} fail=${failed}`);
      fs.writeFileSync(JSON_PATH, JSON.stringify(wikiMap, null, 2));
      fs.writeFileSync(MAP_PATH, JSON.stringify(localMap, null, 2));
    }

    const term = s.nameEn || s.name;
    const url = await wikidataP18(term);
    await sleep(400);

    if (!url) {
      failed++;
      stillMissing.push(s.name);
      continue;
    }
    fetched++;
    wikiMap[s.name] = url;

    const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 12);
    const outPath = path.join(OUT_DIR, `${hash}.raw`);
    const ok = await downloadOne(url, outPath);
    if (ok) {
      downloaded++;
      localMap[s.name] = `/static/holy-sites/${hash}.jpg`; // resize 后统一 .jpg
    }
    await sleep(500);
  }

  fs.writeFileSync(JSON_PATH, JSON.stringify(wikiMap, null, 2));
  fs.writeFileSync(MAP_PATH, JSON.stringify(localMap, null, 2));
  console.log(`\n✓ Wikidata 命中: ${fetched}`);
  console.log(`✓ 下载成功: ${downloaded}`);
  console.log(`✗ 仍缺失: ${failed}`);
  console.log('示例缺失:', stillMissing.slice(0, 10).join(', '));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
