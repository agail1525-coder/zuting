/**
 * download-wiki-images-v2.ts — 重下载为 1200px 缩略图版本 + 重试失败项
 *
 * Wikimedia 缩略图 URL 规则:
 *   原图  https://upload.wikimedia.org/wikipedia/commons/X/YY/File.jpg
 *   缩略图 https://upload.wikimedia.org/wikipedia/commons/thumb/X/YY/File.jpg/1200px-File.jpg
 *   Special:FilePath?width=1200 原生支持
 *
 * 只下载缺失或 >2MB 的大图(说明是原图,需要替换为缩略图),已有小图跳过。
 */
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const JSON_PATH = path.join(__dirname, 'data', 'wiki-images.json');
const OUT_DIR = path.join(__dirname, 'data', 'holy-sites-images');
const MAP_PATH = path.join(__dirname, 'data', 'holy-sites-images-map.json');
const MAX_WIDTH = 1200;
const SIZE_THRESHOLD = 2 * 1024 * 1024; // 大于 2MB 视为原图,需要替换

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extFromUrl(url: string): string {
  const m = url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i);
  return m ? m[1].toLowerCase() : 'jpg';
}

/**
 * 把原图 URL 变成 1200px 缩略图 URL
 */
function toThumbUrl(url: string): string {
  // Special:FilePath 形式
  if (url.includes('/wiki/Special:FilePath/')) {
    const hasQuery = url.includes('?');
    return hasQuery ? url.replace(/width=\d+/, `width=${MAX_WIDTH}`) : `${url}?width=${MAX_WIDTH}`;
  }
  // upload.wikimedia.org/wikipedia/XX/Y/YY/File.ext 原图 → thumb
  // upload.wikimedia.org/wikipedia/XX/thumb/Y/YY/File.ext/1200px-File.ext
  const m = url.match(
    /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+)\/([0-9a-f])\/([0-9a-f]{2})\/([^/?#]+)$/i
  );
  if (m) {
    const [, base, d1, d2, file] = m;
    // SVG 需要指定栅格化,转 png
    const filePart = /\.svg$/i.test(file) ? `${file}/${MAX_WIDTH}px-${file}.png` : `${file}/${MAX_WIDTH}px-${file}`;
    return `${base}/thumb/${d1}/${d2}/${filePart}`;
  }
  return url; // 无法识别,原样返回
}

async function downloadOne(url: string, outPath: string): Promise<{ ok: boolean; size: number }> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'zuting-destination-bot/1.0 (https://zuting.fszyl.top)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) return { ok: false, size: 0 };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1024) return { ok: false, size: buf.length };
    fs.writeFileSync(outPath, buf);
    return { ok: true, size: buf.length };
  } catch {
    return { ok: false, size: 0 };
  }
}

async function main() {
  const map: Record<string, string> = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
  const existingMap: Record<string, string> = fs.existsSync(MAP_PATH)
    ? JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'))
    : {};
  const localMap: Record<string, string> = { ...existingMap };

  const entries = Object.entries(map);
  console.log(`📥 处理目标: ${entries.length} 张 (1200px 缩略版)`);

  let redownload = 0;
  let fetched = 0;
  let skip = 0;
  let fail = 0;

  for (const [name, origUrl] of entries) {
    const thumbUrl = toThumbUrl(origUrl);
    // 保留旧文件名规则(按原 URL md5),确保 map 可复用
    const hash = crypto.createHash('md5').update(origUrl).digest('hex').slice(0, 12);
    let ext = extFromUrl(thumbUrl);
    if (ext === 'svg') ext = 'png'; // 缩略版本是 png
    const filename = `${hash}.${ext}`;
    const outPath = path.join(OUT_DIR, filename);
    const staticUrl = `/static/holy-sites/${filename}`;

    let needDownload = true;
    if (fs.existsSync(outPath)) {
      const sz = fs.statSync(outPath).size;
      if (sz > 1024 && sz < SIZE_THRESHOLD) {
        localMap[name] = staticUrl;
        skip++;
        needDownload = false;
      } else if (sz >= SIZE_THRESHOLD) {
        redownload++;
      }
    }

    if (needDownload) {
      const r = await downloadOne(thumbUrl, outPath);
      if (r.ok) {
        localMap[name] = staticUrl;
        fetched++;
      } else {
        // 缩略失败,降级原图再试一次
        const r2 = await downloadOne(origUrl, outPath);
        if (r2.ok) {
          localMap[name] = staticUrl;
          fetched++;
        } else {
          fail++;
          console.warn(`  ✗ ${name}`);
        }
      }
      if ((fetched + fail) % 25 === 0) {
        console.log(`  进度: fetched=${fetched} skip=${skip} redo=${redownload} fail=${fail}`);
        fs.writeFileSync(MAP_PATH, JSON.stringify(localMap, null, 2));
      }
      await sleep(200);
    }
  }

  fs.writeFileSync(MAP_PATH, JSON.stringify(localMap, null, 2));
  console.log(`\n✓ 下载: ${fetched}`);
  console.log(`⏭ 小图跳过: ${skip}`);
  console.log(`🔁 替换大图: ${redownload}`);
  console.log(`✗ 失败: ${fail}`);
  console.log(`📄 映射: ${Object.keys(localMap).length} 条`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
