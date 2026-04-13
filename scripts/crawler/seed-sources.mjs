#!/usr/bin/env node
/**
 * 爬虫++ 源种子脚本 (CW-21: sources.json 是唯一真源)
 *
 * 读 scripts/crawler/sources.json → upsert CrawlerSource (by key)
 * 用法: node scripts/crawler/seed-sources.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = resolve(__dirname, 'sources.json');
const raw = readFileSync(jsonPath, 'utf8');
const cfg = JSON.parse(raw);

const prisma = new PrismaClient();
const SYS_USER = 'system-crawler-seed';

async function ensureUser() {
  // 找个现有 ADMIN 作 createdBy,否则 fallback cuid 字串
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
  return admin?.id ?? SYS_USER;
}

async function main() {
  const createdBy = await ensureUser();
  let created = 0;
  let updated = 0;
  for (const src of cfg.sources) {
    const existing = src.key ? await prisma.crawlerSource.findUnique({ where: { key: src.key } }) : null;
    const data = {
      key: src.key,
      name: src.name,
      baseUrl: src.baseUrl,
      type: src.type ?? 'OFFICIAL',
      targetDomain: src.targetDomain ?? 'MERCHANT',
      channel: src.channel ?? 'OFFICIAL',
      priority: src.priority ?? 3,
      strategy: src.strategy ?? 'HTTP',
      proxyNeeded: src.proxyNeeded ?? false,
      notes: src.notes ?? null,
      schedule: src.schedule ?? '0 3 * * *',
      selector: src.selector ?? {},
      parser: src.parser ?? 'cheerio',
      rateLimitMs: src.rateLimitMs ?? 1000,
      enabled: src.enabled ?? false,
      createdBy,
    };
    if (existing) {
      await prisma.crawlerSource.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.crawlerSource.create({ data });
      created++;
    }
    console.log(`  ${existing ? 'upd' : 'new'}  [${src.targetDomain}/${src.channel}] ${src.key ?? src.name}`);
  }
  console.log(`\n✓ crawler sources seeded — created=${created} updated=${updated} total=${cfg.sources.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
