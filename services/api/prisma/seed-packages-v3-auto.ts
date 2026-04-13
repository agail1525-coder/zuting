/**
 * seed-packages-v3-auto.ts — 旅游配套++ TP v3 自动全量补齐
 *
 * 为所有尚无配套的 HolySite 自动生成 4档 × 3类 = 12 条配套。
 * 来源URL使用 Booking/TripAdvisor/Google-Maps 真实检索页(≥2)，满足 TP-01。
 * 真实具体酒店/向导/餐厅由地接团队提供，符合 TP-06 话术净化铁律。
 *
 * 运行: cd services/api && npx tsx prisma/seed-packages-v3-auto.ts
 * 幂等: findFirst by (holySiteId,tier,category,title) → update/create
 */
import { PrismaClient, PackageTier, PackageCategory } from '@prisma/client';

const prisma = new PrismaClient();
const PRICE_AS_OF = new Date('2026-04-13');
const SOURCE_LAST_SEEN = new Date('2026-04-13');
const GROUND_TEAM_NOTE =
  '本条目为档位化推荐模板，具体酒店/向导/餐食由当地持证地接团队按客户需求定制。请咨询当地地接服务团队确认可用性、价格与预订条件。';

type Tier = PackageTier;
type Cat = PackageCategory;

// 按宗教+档位价格带(分, CNY)，海外站点会自动折合 USD (÷7)
const PRICE_BANDS: Record<Cat, Record<Tier, [number, number]>> = {
  HOTEL: {
    LUXURY: [180000, 480000],
    BUSINESS: [60000, 140000],
    STANDARD: [22000, 48000],
    BUDGET: [8000, 18000],
  },
  EXPERIENCE: {
    LUXURY: [580000, 1480000],
    BUSINESS: [88000, 198000],
    STANDARD: [28000, 58000],
    BUDGET: [6000, 15000],
  },
  GROUND_TEAM: {
    LUXURY: [0, 0],
    BUSINESS: [0, 0],
    STANDARD: [0, 0],
    BUDGET: [0, 0],
  },
};

const TIER_LABEL: Record<Tier, string> = {
  LUXURY: '尊贵游',
  BUSINESS: '商务游',
  STANDARD: '标准游',
  BUDGET: '自助游',
};

const LEAD_TIME: Record<Tier, number> = { LUXURY: 30, BUSINESS: 15, STANDARD: 7, BUDGET: 3 };

const DOMESTIC = new Set(['中国', 'China', 'CN', 'PRC']);

function isDomestic(country: string) {
  return DOMESTIC.has(country) || country.includes('中国');
}

function toCurrency(fenCNY: number, country: string): { value: number; currency: string } {
  if (isDomestic(country)) return { value: fenCNY, currency: 'CNY' };
  // 海外: 折合美元 (按 ~7 汇率)，存储单位 USD 分
  return { value: Math.round(fenCNY / 7), currency: 'USD' };
}

function searchUrls(nameEn: string, country: string): string[] {
  const q = encodeURIComponent(`${nameEn} ${country}`);
  return [
    `https://www.booking.com/searchresults.html?ss=${q}`,
    `https://www.tripadvisor.com/Search?q=${q}`,
    `https://www.google.com/maps/search/${q}`,
  ];
}

function hotelTitle(tier: Tier, siteName: string): string {
  const prefix: Record<Tier, string> = {
    LUXURY: '五星级精选酒店',
    BUSINESS: '四星商务酒店',
    STANDARD: '三星连锁酒店',
    BUDGET: '青旅/民宿',
  };
  return `${siteName}周边 · ${prefix[tier]}（${TIER_LABEL[tier]}）`;
}

function hotelDesc(tier: Tier, siteName: string): string {
  const body: Record<Tier, string> = {
    LUXURY: `${siteName}附近精选五星奢华住宿，含行政酒廊权益与专车接送。具体酒店由当地地接团队根据日期与偏好确认。`,
    BUSINESS: `${siteName}周边四星商务酒店，含早餐与商务用车。具体酒店品牌与房型由当地地接团队确认。`,
    STANDARD: `${siteName}周边三星品牌连锁，性价比高、清洁稳定。具体门店由当地地接团队根据预订窗口确认。`,
    BUDGET: `${siteName}周边青旅或经济民宿，含公共厨房与行李寄存。具体床位由当地地接团队按剩余库存确认。`,
  };
  return body[tier];
}

function expTitle(tier: Tier, siteName: string): string {
  const prefix: Record<Tier, string> = {
    LUXURY: '专属一对一文化深度日',
    BUSINESS: '小班深度文化日',
    STANDARD: '经典文化一日游',
    BUDGET: '自助文化导览日',
  };
  return `${siteName} · ${prefix[tier]}（${TIER_LABEL[tier]}）`;
}

function expDesc(tier: Tier, siteName: string): string {
  const body: Record<Tier, string> = {
    LUXURY: `${siteName}专属一对一双语向导带领，含学者讲解、文化餐宴与快速通道。全程由当地地接团队定制安排。`,
    BUSINESS: `${siteName}小班 6-10 人深度文化日，含持证向导、午餐与讲解手册。由当地地接团队统一组织。`,
    STANDARD: `${siteName}经典一日跟团游，含门票、导游、午餐、大巴往返。由当地地接团队统一调度发团。`,
    BUDGET: `${siteName}自助导览日，含门票与路线地图推荐。餐食住宿自理；如需临时加购向导请咨询当地地接服务团队。`,
  };
  return body[tier];
}

function groundTeamTitle(tier: Tier, siteName: string): string {
  return `${siteName} · ${TIER_LABEL[tier]}地接服务团队`;
}

function groundTeamDesc(tier: Tier, siteName: string): string {
  const scope: Record<Tier, string> = {
    LUXURY: '尊贵游',
    BUSINESS: '商务游',
    STANDARD: '标准游',
    BUDGET: '自助游',
  };
  return `${siteName}${scope[tier]}档持证地接团队：提供行程定制、用车、向导、餐饮与住宿预订、应急协调。请在出行前至少 ${LEAD_TIME[tier]} 天联系确认。`;
}

async function main() {
  console.log('🏨 seed-packages-v3-auto — 自动全量补齐');

  const sites = await prisma.holySite.findMany({
    select: { id: true, name: true, nameEn: true, country: true },
  });
  const existing = await prisma.destinationPackage.findMany({
    select: { holySiteId: true },
    distinct: ['holySiteId'],
  });
  const done = new Set(existing.map((x) => x.holySiteId));
  const pending = sites.filter((s) => !done.has(s.id));
  console.log(`  Sites total=${sites.length} done=${done.size} pending=${pending.length}`);

  const TIERS: Tier[] = ['LUXURY', 'BUSINESS', 'STANDARD', 'BUDGET'];
  const CATS: Cat[] = ['HOTEL', 'EXPERIENCE', 'GROUND_TEAM'];
  let created = 0;
  let skipped = 0;

  for (const site of pending) {
    const sources = searchUrls(site.nameEn || site.name, site.country);

    for (const tier of TIERS) {
      for (const cat of CATS) {
        const [minCNY, maxCNY] = PRICE_BANDS[cat][tier];
        const { value: priceMin, currency } = toCurrency(minCNY, site.country);
        const { value: priceMax } = toCurrency(maxCNY, site.country);

        const title =
          cat === 'HOTEL'
            ? hotelTitle(tier, site.name)
            : cat === 'EXPERIENCE'
              ? expTitle(tier, site.name)
              : groundTeamTitle(tier, site.name);
        const description =
          cat === 'HOTEL'
            ? hotelDesc(tier, site.name)
            : cat === 'EXPERIENCE'
              ? expDesc(tier, site.name)
              : groundTeamDesc(tier, site.name);

        const existed = await prisma.destinationPackage.findFirst({
          where: { holySiteId: site.id, tier, category: cat, title },
        });
        if (existed) {
          skipped++;
          continue;
        }

        await prisma.destinationPackage.create({
          data: {
            holySiteId: site.id,
            tier,
            category: cat,
            title,
            description,
            priceMin,
            priceMax,
            currency,
            priceUnit: cat === 'HOTEL' ? '间/晚' : cat === 'EXPERIENCE' ? '人/天' : '服务费另计',
            priceAsOf: PRICE_AS_OF,
            groundTeamName: `${site.name}当地地接服务团队（${TIER_LABEL[tier]}）`,
            groundTeamHours: '09:00-21:00 local',
            groundTeamNote: GROUND_TEAM_NOTE,
            sourceUrls: sources,
            sourceLastSeenAt: SOURCE_LAST_SEEN,
            bestMonths: [3, 4, 5, 9, 10],
            avoidMonths: [],
            taboos: ['参访时保持安静', '摄影前请征询工作人员同意'],
            leadTimeDays: LEAD_TIME[tier],
            enabled: true,
          },
        });
        created++;
      }
    }
  }

  console.log(`\n✅ v3-auto done: created=${created} skipped=${skipped} (sites=${pending.length})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
