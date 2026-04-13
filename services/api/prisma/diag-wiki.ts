import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
const prisma = new PrismaClient();
async function main() {
  const map: Record<string, string> = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'wiki-images.json'), 'utf8'),
  );
  const sites = await prisma.holySite.findMany({ select: { name: true, imageUrl: true } });
  let miss = 0, match = 0, nocache = 0;
  const samples: any[] = [];
  for (const s of sites) {
    const c = map[s.name];
    if (!c) { nocache++; continue; }
    if (s.imageUrl === c) { match++; continue; }
    miss++;
    if (samples.length < 5) samples.push({ name: s.name, now: (s.imageUrl || '').slice(0, 50), want: c.slice(0, 50) });
  }
  console.log('sites:', sites.length, 'nocache:', nocache, 'match:', match, 'mismatch:', miss);
  samples.forEach((s) => console.log(JSON.stringify(s)));
}
main().finally(() => prisma.$disconnect());
