/**
 * download-lingnan-wiki-images.ts — 本地化岭南路线 Wiki 图片
 *
 * 输入:  services/api/prisma/data/wiki-images-lingnan.json (URL 数组)
 * 下载:  services/api/prisma/data/holy-sites-images/{hash}.jpg  (1200px 缩略)
 * 改写:  wiki-images-lingnan.json 每个 URL → "/static/holy-sites/{hash}.{ext}"
 *
 * 运行(本地,可访问 Wikimedia):
 *   cd services/api && NODE_NO_COMPILE_CACHE=1 npx tsx prisma/download-lingnan-wiki-images.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const JSON_PATH = path.join(__dirname, 'data', 'wiki-images-lingnan.json');
const OUT_DIR = path.join(__dirname, 'data', 'holy-sites-images');
const MAX_WIDTH = 1200;
const UA = 'zuting-lingnan-bot/1.0 (https://zuting.fszyl.top)';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extFromUrl(url: string): string {
  const m = url.match(/\.(jpg|jpeg|png|gif|webp|svg|JPG|PNG)(\?|\/|$)/i);
  return m ? m[1].toLowerCase() : 'jpg';
}

function toThumbUrl(url: string): string {
  if (url.includes('/wiki/Special:FilePath/')) {
    const hasQuery = url.includes('?');
    return hasQuery ? url.replace(/width=\d+/, `width=${MAX_WIDTH}`) : `${url}?width=${MAX_WIDTH}`;
  }
  // 已经是 thumb 形式的直接返回
  if (url.includes('/thumb/')) return url;
  const m = url.match(
    /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+)\/([0-9a-f])\/([0-9a-f]{2})\/([^/?#]+)$/i,
  );
  if (m) {
    const [, base, d1, d2, file] = m;
    const filePart = /\.svg$/i.test(file) ? `${file}/${MAX_WIDTH}px-${file}.png` : `${file}/${MAX_WIDTH}px-${file}`;
    return `${base}/thumb/${d1}/${d2}/${filePart}`;
  }
  return url;
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
    if (buf.length < 1024) return false;
    fs.writeFileSync(outPath, buf);
    return true;
  } catch (e) {
    console.warn(`    × ${(e as Error).message.slice(0, 80)}`);
    return false;
  }
}

async function main() {
  const siteImages: Record<string, string[]> = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const newMap: Record<string, string[]> = {};
  let fetched = 0;
  let skip = 0;
  let fail = 0;

  for (const [name, urls] of Object.entries(siteImages)) {
    console.log(`\n► ${name} (${urls.length})`);
    newMap[name] = [];
    for (const origUrl of urls) {
      // Skip if already local
      if (origUrl.startsWith('/static/')) {
        newMap[name].push(origUrl);
        skip++;
        continue;
      }

      const thumbUrl = toThumbUrl(origUrl);
      const hash = crypto.createHash('md5').update(origUrl).digest('hex').slice(0, 12);
      let ext = extFromUrl(thumbUrl).toLowerCase();
      if (ext === 'svg') ext = 'png';
      if (ext === 'jpeg') ext = 'jpg';
      const filename = `${hash}.${ext}`;
      const outPath = path.join(OUT_DIR, filename);
      const staticUrl = `/static/holy-sites/${filename}`;

      if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1024) {
        newMap[name].push(staticUrl);
        skip++;
        continue;
      }

      const ok = await downloadOne(thumbUrl, outPath);
      if (ok) {
        newMap[name].push(staticUrl);
        fetched++;
        console.log(`    ✓ ${filename}`);
      } else {
        const ok2 = await downloadOne(origUrl, outPath);
        if (ok2) {
          newMap[name].push(staticUrl);
          fetched++;
          console.log(`    ✓ ${filename} (original)`);
        } else {
          fail++;
          console.warn(`    ✗ FAILED: ${origUrl.slice(0, 90)}`);
        }
      }
      await sleep(150);
    }
  }

  fs.writeFileSync(JSON_PATH, JSON.stringify(newMap, null, 2));
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  ✓ downloaded: ${fetched}`);
  console.log(`  ⏭ already local: ${skip}`);
  console.log(`  ✗ failed: ${fail}`);
  console.log(`  📄 rewritten: ${JSON_PATH}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
