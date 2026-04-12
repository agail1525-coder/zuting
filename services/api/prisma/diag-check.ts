import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  const s = await prisma.holySite.findFirst({ where: { name: '洛杉矶威尔希大会堂' } });
  console.log(JSON.stringify({
    name: s?.name, id: s?.id, source: s?.source,
    hrs: s?.openingHours, pr: s?.ticketPrice, bs: s?.bestSeason,
    vd: s?.visitDuration, tr: s?.transport, tips: s?.tips
  }, null, 2));

  const noHrsAdmin = await prisma.holySite.count({
    where: { source: 'ADMIN', openingHours: null }
  });
  console.log('ADMIN no-hrs:', noHrsAdmin);
  await prisma.$disconnect();
})();
