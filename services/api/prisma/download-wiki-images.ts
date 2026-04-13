/**
 * download-wiki-images.ts — 从 wiki-images.json 下载所有维基图片到本地
 *
 * 输出: prisma/data/holy-sites-images/{md5}.{ext}  (文件名用 URL 的 md5,避免冲突)
 * 映射: prisma/data/holy-sites-images-map.json  { site_name: "/static/holy-sites/{md5}.{ext}" }
 *
 * 随后 scp 上传到 /opt/zuting/static/holy-sites/,并用 seed-destinations-local-images.ts 回写 DB。
 */
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const JSON_PATH = path.join(__dirname, 'data', 'wiki-images.json');
const OUT_DIR = path.join(__dirname, 'data', 'holy-sites-images');
const MAP_PATH = path.join(__dirname, 'data', 'holy-sites-images-map.json');

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extFromUrl(url: string): string {
  const m = url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i);
  return m ? m[1].toLowerCase() : 'jpg';
}

async function downloadOne(url: string, outPath: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'zuting-destination-bot/1.0 (https://zuting.fszyl.top)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1024) return false; // 过小的可能是占位符
    fs.writeFileSync(outPath, buf);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const map: Record<string, string> = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const existingMap: Record<string, string> = fs.existsSync(MAP_PATH)
    ? JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'))
    : {};

  const entries = Object.entries(map);
  console.log(`📥 下载目标: ${entries.length} 张`);
  console.log(`📂 输出目录: ${OUT_DIR}`);
  console.log(`✓ 已有映射: ${Object.keys(existingMap).length}\n`);

  const localMap: Record<string, string> = { ...existingMap };
  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const [name, url] of entries) {
    const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 12);
    const ext = extFromUrl(url);
    const filename = `${hash}.${ext}`;
    const outPath = path.join(OUT_DIR, filename);
    const staticUrl = `/static/holy-sites/${filename}`;

    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1024) {
      localMap[name] = staticUrl;
      skip++;
      continue;
    }

    const success = await downloadOne(url, outPath);
    if (success) {
      localMap[name] = staticUrl;
      ok++;
    } else {
      fail++;
      console.warn(`  ✗ ${name}: ${url.slice(0, 80)}`);
    }

    if ((ok + fail) % 20 === 0) {
      console.log(`  进度: ok=${ok} skip=${skip} fail=${fail}`);
      fs.writeFileSync(MAP_PATH, JSON.stringify(localMap, null, 2));
    }
    await sleep(150);
  }

  fs.writeFileSync(MAP_PATH, JSON.stringify(localMap, null, 2));
  console.log(`\n✓ 下载: ${ok}`);
  console.log(`⏭ 已存在: ${skip}`);
  console.log(`✗ 失败: ${fail}`);
  console.log(`📄 映射: ${MAP_PATH} (${Object.keys(localMap).length} 条)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
