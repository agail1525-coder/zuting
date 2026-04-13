/**
 * phase4-redownload-remaining.ts — 重下载当前 imageUrl 仍为 wikimedia 的站点
 *
 * 从 DB 拉当前 imageUrl 是 http 的站点,直接下载(含 URL 解码容错),
 * 写 holy-sites-images-map.json → 给 resize + scp + seed 用
 */
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const API_BASE = 'https://zuting.fszyl.top/api';
const OUT_DIR = path.join(__dirname, 'data', 'holy-sites-images');
const MAP_PATH = path.join(__dirname, 'data', 'holy-sites-images-map.json');
const UA = 'zuting-destination-bot/2.1 (https://zuting.fszyl.top)';

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function extFromUrl(url: string): string {
  const m = url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$|#|\/)/i);
  return m ? m[1].toLowerCase() : 'jpg';
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
  } catch { return false; }
}

async function fetchAllSites(): Promise<Array<{ name: string; imageUrl: string }>> {
  const all: Array<{ name: string; imageUrl: string }> = [];
  for (let page = 1; page <= 10; page++) {
    const r = await fetch(`${API_BASE}/holy-sites?page=${page}&limit=100`);
    if (!r.ok) break;
    const d: any = await r.json();
    const items: any[] = Array.isArray(d) ? d : d.items ?? [];
    if (!items.length) break;
    all.push(...items.map((i: any) => ({ name: i.name, imageUrl: i.imageUrl ?? '' })));
    if (all.length >= (d.total ?? all.length)) break;
  }
  return all;
}

async function main() {
  const all = await fetchAllSites();
  const sites = all.filter((s) => s.imageUrl.startsWith('http'));
  console.log(`🎯 目标: ${sites.length}/${all.length} 站点仍走 wiki CDN`);

  const localMap: Record<string, string> = fs.existsSync(MAP_PATH)
    ? JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'))
    : {};

  let ok = 0, fail = 0;
  for (const [i, s] of sites.entries()) {
    if (!s.imageUrl) continue;
    const hash = crypto.createHash('md5').update(s.imageUrl).digest('hex').slice(0, 12);
    const ext = extFromUrl(s.imageUrl);
    const filename = `${hash}.${ext}`;
    const outPath = path.join(OUT_DIR, filename);

    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 2048) {
      localMap[s.name] = `/static/holy-sites/${hash}.jpg`;
      ok++;
      continue;
    }

    // 尝试: 原 URL → URL 解码再编码 → Special:FilePath
    const tries = [s.imageUrl];
    try {
      const decoded = decodeURI(s.imageUrl);
      if (decoded !== s.imageUrl) tries.push(encodeURI(decoded));
    } catch {}
    // 若是 upload.wikimedia 原图,转 Special:FilePath
    const m = s.imageUrl.match(/upload\.wikimedia\.org\/wikipedia\/[^/]+\/[0-9a-f]\/[0-9a-f]{2}\/(.+)$/i);
    if (m) {
      tries.push(`https://commons.wikimedia.org/wiki/Special:FilePath/${m[1]}?width=1200`);
    }

    let success = false;
    for (const u of tries) {
      if (await downloadOne(u, outPath)) { success = true; break; }
      await sleep(200);
    }
    if (success) {
      localMap[s.name] = `/static/holy-sites/${hash}.jpg`;
      ok++;
    } else {
      fail++;
    }
    if ((ok + fail) % 15 === 0) {
      console.log(`  [${i + 1}/${sites.length}] ok=${ok} fail=${fail}`);
      fs.writeFileSync(MAP_PATH, JSON.stringify(localMap, null, 2));
    }
    await sleep(400);
  }

  fs.writeFileSync(MAP_PATH, JSON.stringify(localMap, null, 2));
  console.log(`\n✓ 下载: ${ok}`);
  console.log(`✗ 失败: ${fail}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
