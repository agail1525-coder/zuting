/**
 * 爬虫++ 源种子 (CW-21: sources.json 是唯一真源)
 *
 * 读 /scripts/crawler/sources.json → upsert CrawlerSource (by key)
 * 用法: cd services/api && npx tsx prisma/seed-crawler-sources.ts
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';

const jsonPath = resolve(__dirname, '../../../scripts/crawler/sources.json');
const cfg = JSON.parse(readFileSync(jsonPath, 'utf8')) as {
  sources: Array<Record<string, unknown>>;
};

const prisma = new PrismaClient();
const SYS_USER = 'system-crawler-seed';

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
  const createdBy = admin?.id ?? SYS_USER;

  let created = 0;
  let updated = 0;
  for (const src of cfg.sources) {
    const key = src.key as string | undefined;
    const existing = key ? await prisma.crawlerSource.findUnique({ where: { key } }) : null;
    const data = {
      key: key ?? null,
      name: src.name as string,
      baseUrl: src.baseUrl as string,
      type: (src.type as string) ?? 'OFFICIAL',
      targetDomain: (src.targetDomain as string) ?? 'MERCHANT',
      channel: (src.channel as string) ?? 'OFFICIAL',
      priority: (src.priority as number) ?? 3,
      strategy: (src.strategy as string) ?? 'HTTP',
      proxyNeeded: (src.proxyNeeded as boolean) ?? false,
      notes: (src.notes as string) ?? null,
      schedule: (src.schedule as string) ?? '0 3 * * *',
      selector: (src.selector as object) ?? {},
      parser: (src.parser as string) ?? 'cheerio',
      rateLimitMs: (src.rateLimitMs as number) ?? 1000,
      enabled: (src.enabled as boolean) ?? false,
      createdBy,
    };
    if (existing) {
      await prisma.crawlerSource.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.crawlerSource.create({ data });
      created++;
    }
    console.log(`  ${existing ? 'upd' : 'new'}  [${data.targetDomain}/${data.channel}] ${key ?? data.name}`);
  }
  console.log(`\n✓ crawler sources seeded — created=${created} updated=${updated} total=${cfg.sources.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
