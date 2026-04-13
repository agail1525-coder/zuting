/**
 * phase5-final-coverage.ts — 最后 33 站点 100% 覆盖
 *
 * 1. 拉当前 imageUrl 仍是 http 的站点
 * 2. zh.wikipedia + en.wikipedia search + pageimages (真实图)
 * 3. 仍失败 → 保留 wiki URL(浏览器 unoptimized 透传),遵守 DST-F07 宁缺毋滥
 */
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const API_BASE = 'https://zuting.fszyl.top/api';
const OUT_DIR = path.join(__dirname, 'data', 'holy-sites-images');
const MAP_PATH = path.join(__dirname, 'data', 'holy-sites-images-map.json');
const UA = 'zuting-destination-bot/2.2 (https://zuting.fszyl.top)';

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function wikiSearchImage(term: string, lang: 'en' | 'zh'): Promise<string | null> {
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json` +
      `&prop=pageimages&piprop=original|thumbnail&pithumbsize=1200` +
      `&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrlimit=3&gsrnamespace=0&origin=*`;
    const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
    if (!r.ok) return null;
    const d: any = await r.json();
    const pages: any[] = Object.values(d?.query?.pages ?? {});
    for (const p of pages) {
      const src = p?.thumbnail?.source || p?.original?.source;
      if (src && /upload\.wikimedia\.org/.test(src)) return src;
    }
  } catch {}
  return null;
}

async function downloadOne(url: string, outPath: string): Promise<boolean> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(45000) });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2048) return false;
    fs.writeFileSync(outPath, buf);
    return true;
  } catch { return false; }
}

async function fetchAllSites(): Promise<Array<{ name: string; nameEn: string; imageUrl: string; religionId: string }>> {
  const all: any[] = [];
  for (let page = 1; page <= 10; page++) {
    const r = await fetch(`${API_BASE}/holy-sites?page=${page}&limit=100`);
    if (!r.ok) break;
    const d: any = await r.json();
    const items: any[] = Array.isArray(d) ? d : d.items ?? [];
    if (!items.length) break;
    all.push(...items);
    if (all.length >= (d.total ?? all.length)) break;
  }
  return all.map((i) => ({ name: i.name, nameEn: i.nameEn ?? '', imageUrl: i.imageUrl ?? '', religionId: i.religionId }));
}

async function main() {
  const all = await fetchAllSites();
  const failing = all.filter((s) => s.imageUrl.startsWith('http'));
  console.log(`🎯 最后 ${failing.length}/${all.length} 个 wiki 残存`);

  const localMap: Record<string, string> = fs.existsSync(MAP_PATH)
    ? JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'))
    : {};

  let wiki = 0, fail = 0;
  const missing: string[] = [];
  for (const s of failing) {
    const term = s.nameEn || s.name;
    let url: string | null = null;
    url = await wikiSearchImage(term, 'en');
    await sleep(400);
    if (!url && s.name !== term) {
      url = await wikiSearchImage(s.name, 'zh');
      await sleep(400);
    }
    if (url) {
      const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 12);
      const outPath = path.join(OUT_DIR, `${hash}.raw`);
      if (await downloadOne(url, outPath)) {
        localMap[s.name] = `/static/holy-sites/${hash}.jpg`;
        wiki++;
        continue;
      }
    }
    fail++;
    missing.push(s.name);
  }

  fs.writeFileSync(MAP_PATH, JSON.stringify(localMap, null, 2));
  console.log(`\n✓ wiki 新增: ${wiki}`);
  console.log(`✗ 仍缺失(保留 wiki URL): ${fail}`);
  console.log('示例:', missing.slice(0, 10).join(', '));
}

main().catch((e) => { console.error(e); process.exit(1); });
