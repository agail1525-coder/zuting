/**
 * seed-destinations-wiki-images.ts — 两用脚本
 *
 * 模式 A (本地 fetch): NODE_ENV=development 或传 --fetch 参数
 *   本地机器从 Wikipedia REST API 拉取每站点真实图片,写入 prisma/data/wiki-images.json
 *
 * 模式 B (生产 seed): 默认模式
 *   直接从 prisma/data/wiki-images.json 读取预拉结果,更新数据库
 *   生产服务器无法访问 en.wikipedia.org (GFW),必须走这条路径
 *
 * 工作流:
 *   1. 开发机(可访问维基):  npx tsx prisma/seed-destinations-wiki-images.ts --fetch
 *      → 生成 prisma/data/wiki-images.json
 *   2. git add prisma/data/wiki-images.json && push
 *   3. 部署后自动运行无参模式 → 从 JSON 填图
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const JSON_PATH = path.join(__dirname, 'data', 'wiki-images.json');
const FETCH_MODE = process.argv.includes('--fetch');

async function wikiImage(title: string, lang: 'en' | 'zh'): Promise<string | null> {
  try {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'zuting-destination-bot/1.0' },
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

async function fetchRemoteSites(): Promise<Array<{ name: string; nameEn: string | null }>> {
  const BASE = process.env.FETCH_REMOTE || 'https://zuting.fszyl.top/api/holy-sites';
  const sites: Array<{ name: string; nameEn: string | null }> = [];
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`${BASE}?limit=100&page=${page}`);
    if (!res.ok) break;
    const data: any = await res.json();
    const items: any[] = data.items || [];
    if (items.length === 0) break;
    for (const it of items) sites.push({ name: it.name, nameEn: it.nameEn });
    if (items.length < 100) break;
  }
  const seen = new Set<string>();
  return sites.filter((s) => (seen.has(s.name) ? false : (seen.add(s.name), true)));
}

async function fetchAndSave() {
  console.log('🌐 [FETCH] 从 Wikipedia 拉取真实图\n');

  const useRemote = process.argv.includes('--remote');
  const sites = useRemote
    ? await fetchRemoteSites()
    : await prisma.holySite.findMany({ select: { name: true, nameEn: true }, orderBy: { name: 'asc' } });
  console.log(`待处理 (${useRemote ? '远程' : '本地'}): ${sites.length} 站点`);

  // 加载现有 JSON,避免重复拉取
  let existing: Record<string, string> = {};
  if (fs.existsSync(JSON_PATH)) {
    existing = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
    console.log(`已缓存: ${Object.keys(existing).length} 条`);
  }

  const result = { ...existing };
  let newHits = 0;
  let attempts = 0;

  for (const s of sites) {
    if (result[s.name]) continue;
    attempts++;
    let img: string | null = null;
    if (s.nameEn) img = await wikiImage(s.nameEn, 'en');
    if (!img) img = await wikiImage(s.name, 'zh');
    if (img) {
      result[s.name] = img;
      newHits++;
    }
    if (attempts % 20 === 0) {
      console.log(`  尝试 ${attempts}, 新增 ${newHits}`);
      fs.mkdirSync(path.dirname(JSON_PATH), { recursive: true });
      fs.writeFileSync(JSON_PATH, JSON.stringify(result, null, 2));
    }
    await sleep(120);
  }

  fs.mkdirSync(path.dirname(JSON_PATH), { recursive: true });
  fs.writeFileSync(JSON_PATH, JSON.stringify(result, null, 2));
  console.log(`\n✓ 总缓存: ${Object.keys(result).length} 条, 本次新增 ${newHits}`);
  console.log(`📄 ${JSON_PATH}`);
}

async function applyFromJson() {
  console.log('🖼  [SEED] 从 wiki-images.json 更新图片\n');
  if (!fs.existsSync(JSON_PATH)) {
    console.warn(`⚠ JSON 未找到: ${JSON_PATH}`);
    console.warn('  请在本地运行 "npx tsx prisma/seed-destinations-wiki-images.ts --fetch" 生成');
    return;
  }
  const map: Record<string, string> = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
  console.log(`JSON 条目: ${Object.keys(map).length}`);

  const sites = await prisma.holySite.findMany({ select: { id: true, name: true, imageUrl: true } });
  let updated = 0;
  let skipped = 0;
  for (const s of sites) {
    const wikiImg = map[s.name];
    if (!wikiImg) { skipped++; continue; }
    if (s.imageUrl === wikiImg) { skipped++; continue; }
    await prisma.holySite.update({ where: { id: s.id }, data: { imageUrl: wikiImg } });
    updated++;
  }
  console.log(`✓ 更新: ${updated}`);
  console.log(`⏭ 跳过 (无 wiki 或已同步): ${skipped}`);
}

async function main() {
  if (FETCH_MODE) await fetchAndSave();
  else await applyFromJson();
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
