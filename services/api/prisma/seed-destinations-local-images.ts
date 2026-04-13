/**
 * seed-destinations-local-images.ts — 把 holySite.imageUrl 重写为 /static/holy-sites/...
 *
 * 输入: prisma/data/holy-sites-images-map.json  { site_name: "/static/holy-sites/{hash}.ext" }
 * 动作: 按 name 匹配 DB,写入 imageUrl
 *
 * 部署: scp 本地 prisma/data/holy-sites-images/* → /opt/zuting/static/holy-sites/
 *       nginx location /static/ → /opt/zuting/static/
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const MAP_PATH = path.join(__dirname, 'data', 'holy-sites-images-map.json');

async function main() {
  if (!fs.existsSync(MAP_PATH)) {
    console.error(`❌ 映射文件不存在: ${MAP_PATH}`);
    process.exit(1);
  }
  const map: Record<string, string> = JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'));
  const names = Object.keys(map);
  console.log(`📥 映射条目: ${names.length}`);

  const sites = await prisma.holySite.findMany({ select: { id: true, name: true } });
  const byName = new Map(sites.map((s) => [s.name, s.id]));
  console.log(`📂 DB 站点: ${sites.length}`);

  let matched = 0;
  let missing = 0;
  for (const [name, staticUrl] of Object.entries(map)) {
    const id = byName.get(name);
    if (!id) {
      missing++;
      continue;
    }
    await prisma.holySite.update({ where: { id }, data: { imageUrl: staticUrl } });
    matched++;
    if (matched % 50 === 0) console.log(`  更新 ${matched}/${names.length}`);
  }

  console.log(`\n✓ 更新: ${matched}`);
  console.log(`✗ map中DB无此站点: ${missing}`);
  const coverage = await prisma.holySite.count({ where: { imageUrl: { startsWith: '/static/holy-sites/' } } });
  console.log(`📊 本地图覆盖率: ${coverage}/${sites.length} = ${((coverage / sites.length) * 100).toFixed(1)}%`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
