/**
 * seed-localize-images.ts — 图片本地化 TP++
 *
 * 下载 HolySite.imageUrl + Merchant.logo + MerchantService.coverImage 到本地,
 * 保存在 /opt/zuting/static/images/{sha1}.{ext},
 * 更新 DB 字段指向 /static/images/{sha1}.{ext}
 *
 * 运行: cd services/api && npx tsx prisma/seed-localize-images.ts
 *
 * 铁律:
 *   - SSRF: 仅 http(s),禁私网 IP (ssrf-req-filter)
 *   - 超时 20s,体积上限 10MB
 *   - 幂等: 已本地化 (/static/...) 跳过
 *   - 并发 4,避免压垮目标服务
 */
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ssrfFilter = require('ssrf-req-filter') as (url: string) => http.Agent;

const prisma = new PrismaClient();

const STATIC_DIR = process.env.TP_STATIC_DIR || '/opt/zuting/static/images';
const PUBLIC_PREFIX = '/static/images';
const MAX_BYTES = 10 * 1024 * 1024;
const TIMEOUT_MS = 20000;
const CONCURRENCY = 4;

fs.mkdirSync(STATIC_DIR, { recursive: true });

function extFromContentType(ct: string | undefined, urlPath: string): string {
  const fromUrl = path.extname(urlPath).toLowerCase().replace('.', '');
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(fromUrl)) return fromUrl;
  if (ct?.includes('jpeg')) return 'jpg';
  if (ct?.includes('png')) return 'png';
  if (ct?.includes('webp')) return 'webp';
  if (ct?.includes('avif')) return 'avif';
  if (ct?.includes('gif')) return 'gif';
  return 'jpg';
}

const SAFE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'] as const;

// CWE-22 defense: sha/ext are already constrained (sha=40hex from crypto hash,
// ext from whitelist). Use string concat instead of path.join to satisfy the
// sanitization lint — sanitize → concat with trusted separator.
function safeJoin(dir: string, sha: string, ext: string): string {
  const cleanSha = sha.replace(/[^a-f0-9]/g, '');
  if (cleanSha.length !== 40) throw new Error('invariant: sha1 must be 40 hex');
  if (!(SAFE_EXTS as readonly string[]).includes(ext)) throw new Error('invariant: ext not whitelisted');
  const sep = dir.endsWith('/') || dir.endsWith('\\') ? '' : '/';
  return `${dir}${sep}${cleanSha}.${ext}`;
}

async function downloadOne(url: string): Promise<string | null> {
  if (url.startsWith('/static/') || url.startsWith('/')) return url; // already local
  try {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol)) return null;
    const sha = crypto.createHash('sha1').update(url).digest('hex');
    // sha is sha1 hex (safe), ext is from whitelist — see safeJoin
    for (const ext of SAFE_EXTS) {
      // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
      const p = safeJoin(STATIC_DIR, sha, ext);
      if (fs.existsSync(p)) return `${PUBLIC_PREFIX}/${sha}.${ext}`;
    }
    const lib = u.protocol === 'https:' ? https : http;
    return await new Promise<string | null>((resolve) => {
      const req = lib.request(
        url,
        {
          method: 'GET',
          agent: ssrfFilter(url),
          timeout: TIMEOUT_MS,
          headers: { 'User-Agent': 'JoinusBot/1.0 (+https://joinus.com/bot)' },
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 400) {
            res.resume();
            return resolve(null);
          }
          if (res.statusCode === 301 || res.statusCode === 302) {
            const loc = res.headers.location;
            res.resume();
            if (loc) return resolve(downloadOne(new URL(loc, url).toString()));
            return resolve(null);
          }
          const ext = extFromContentType(res.headers['content-type'] as string | undefined, u.pathname);
          // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
          const file = safeJoin(STATIC_DIR, sha, ext);
          const stream = fs.createWriteStream(file);
          let total = 0;
          res.on('data', (c: Buffer) => {
            total += c.length;
            if (total > MAX_BYTES) {
              req.destroy();
              stream.destroy();
              fs.unlink(file, () => {});
              return resolve(null);
            }
            stream.write(c);
          });
          res.on('end', () => {
            stream.end();
            resolve(`${PUBLIC_PREFIX}/${sha}.${ext}`);
          });
          res.on('error', () => {
            stream.destroy();
            fs.unlink(file, () => {});
            resolve(null);
          });
        },
      );
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
      req.on('error', () => resolve(null));
      req.end();
    });
  } catch {
    return null;
  }
}

async function pMap<T, R>(items: T[], fn: (x: T) => Promise<R>, concurrency: number): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let idx = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (true) {
        const i = idx++;
        if (i >= items.length) return;
        results[i] = await fn(items[i]);
      }
    }),
  );
  return results;
}

async function main() {
  console.log(`📦 seed-localize-images → ${STATIC_DIR}`);

  // 1) 汇总所有唯一远程 URL
  const urlSet = new Set<string>();
  const addUrl = (u: string | null | undefined) => {
    if (u && /^https?:\/\//.test(u)) urlSet.add(u);
  };

  const sites = await prisma.holySite.findMany({ select: { id: true, imageUrl: true } });
  for (const s of sites) addUrl(s.imageUrl);
  const merchants = await prisma.merchant.findMany({ select: { id: true, logo: true } });
  for (const m of merchants) addUrl(m.logo);
  const services = await prisma.merchantService.findMany({ select: { id: true, coverImage: true } });
  for (const s of services) addUrl(s.coverImage);

  const urls = Array.from(urlSet);
  console.log(`  unique remote URLs: ${urls.length}`);

  // 2) 批量下载,构建 url→localPath 映射
  const mapping = new Map<string, string>();
  let downloaded = 0;
  let failed = 0;
  const results = await pMap(
    urls,
    async (u) => {
      const local = await downloadOne(u);
      if (local) {
        mapping.set(u, local);
        downloaded++;
        if (downloaded % 50 === 0) console.log(`  downloaded ${downloaded}/${urls.length}`);
      } else {
        failed++;
      }
      return local;
    },
    CONCURRENCY,
  );
  console.log(`  ✓ downloaded=${downloaded} failed=${failed} (of ${results.length})`);

  // 3) 更新 DB
  let updatedSites = 0;
  let updatedMerchants = 0;
  let updatedServices = 0;

  for (const s of sites) {
    const local = s.imageUrl ? mapping.get(s.imageUrl) : undefined;
    if (local && s.imageUrl !== local) {
      await prisma.holySite.update({ where: { id: s.id }, data: { imageUrl: local } });
      updatedSites++;
    }
  }
  for (const m of merchants) {
    const local = m.logo ? mapping.get(m.logo) : undefined;
    if (local && m.logo !== local) {
      await prisma.merchant.update({ where: { id: m.id }, data: { logo: local } });
      updatedMerchants++;
    }
  }
  for (const s of services) {
    const local = s.coverImage ? mapping.get(s.coverImage) : undefined;
    if (local && s.coverImage !== local) {
      await prisma.merchantService.update({ where: { id: s.id }, data: { coverImage: local } });
      updatedServices++;
    }
  }

  console.log(
    `\n✅ localize-images done: sites=${updatedSites} merchants=${updatedMerchants} services=${updatedServices}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
