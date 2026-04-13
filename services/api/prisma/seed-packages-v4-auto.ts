/**
 * seed-packages-v4-auto.ts — 旅游配套++ TP v4 补齐剩余 4 类
 *
 * v1/v2/v3 已补: HOTEL / EXPERIENCE / GROUND_TEAM
 * v4 本轮补: RESTAURANT(食) / TRANSPORT(行) / SHOPPING(购) / GUIDE(向导)
 * 272 站 × 4 档 × 4 类 = 4352 条，叠加 v1-v3 的 3264 条 = 7616 条全量
 *
 * 运行: cd services/api && npx tsx prisma/seed-packages-v4-auto.ts
 */
import { PrismaClient, PackageTier, PackageCategory } from '@prisma/client';

const prisma = new PrismaClient();
const PRICE_AS_OF = new Date('2026-04-13');
const SOURCE_LAST_SEEN = new Date('2026-04-13');
const GROUND_TEAM_NOTE =
  '本条目为档位化推荐模板，具体门店/车辆/商铺/向导由当地持证地接团队按需求定制。请咨询当地地接服务团队确认可用性与价格。';

type Tier = PackageTier;
type Cat = 'RESTAURANT' | 'TRANSPORT' | 'SHOPPING' | 'GUIDE';

const TIER_LABEL: Record<Tier, string> = {
  LUXURY: '尊贵游',
  BUSINESS: '商务游',
  STANDARD: '标准游',
  BUDGET: '自助游',
};
const LEAD_TIME: Record<Tier, number> = { LUXURY: 30, BUSINESS: 15, STANDARD: 7, BUDGET: 3 };

// 分(CNY)，海外 ÷7 折 USD
const PRICE_BANDS: Record<Cat, Record<Tier, [number, number]>> = {
  RESTAURANT: {
    LUXURY: [80000, 280000],
    BUSINESS: [28000, 68000],
    STANDARD: [8000, 20000],
    BUDGET: [2000, 6000],
  },
  TRANSPORT: {
    LUXURY: [180000, 480000],
    BUSINESS: [60000, 140000],
    STANDARD: [20000, 48000],
    BUDGET: [5000, 15000],
  },
  SHOPPING: {
    LUXURY: [50000, 500000],
    BUSINESS: [15000, 60000],
    STANDARD: [5000, 20000],
    BUDGET: [1000, 5000],
  },
  GUIDE: {
    LUXURY: [280000, 680000],
    BUSINESS: [68000, 158000],
    STANDARD: [20000, 48000],
    BUDGET: [0, 0],
  },
};

const DOMESTIC = new Set(['中国', 'China', 'CN', 'PRC']);
const isDomestic = (c: string) => DOMESTIC.has(c) || c.includes('中国');
const toMoney = (fen: number, country: string) =>
  isDomestic(country)
    ? { value: fen, currency: 'CNY' }
    : { value: Math.round(fen / 7), currency: 'USD' };

const searchUrls = (nameEn: string, country: string, extra: string) => {
  const q = encodeURIComponent(`${nameEn} ${country} ${extra}`);
  return [
    `https://www.tripadvisor.com/Search?q=${q}`,
    `https://www.google.com/maps/search/${q}`,
    `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(nameEn + ' ' + country)}`,
  ];
};

function titleOf(cat: Cat, tier: Tier, siteName: string): string {
  const map: Record<Cat, Record<Tier, string>> = {
    RESTAURANT: {
      LUXURY: '米其林/高端文化主题餐厅',
      BUSINESS: '本地特色商务餐厅',
      STANDARD: '地道家常风味餐厅',
      BUDGET: '街头小吃与快餐',
    },
    TRANSPORT: {
      LUXURY: '专车司导（豪华轿车/MPV）',
      BUSINESS: '商务专车（朗逸/GL8级）',
      STANDARD: '拼车或当地出租',
      BUDGET: '公共交通指引',
    },
    SHOPPING: {
      LUXURY: '高端文化艺术藏品',
      BUSINESS: '品牌文化纪念品',
      STANDARD: '地方特产伴手礼',
      BUDGET: '景区平价纪念品',
    },
    GUIDE: {
      LUXURY: '学者级一对一双语向导',
      BUSINESS: '持证中英文向导',
      STANDARD: '中文跟团讲解',
      BUDGET: '官方讲解APP/小程序',
    },
  };
  return `${siteName} · ${map[cat][tier]}（${TIER_LABEL[tier]}）`;
}

function descOf(cat: Cat, tier: Tier, siteName: string): string {
  const RES: Record<Tier, string> = {
    LUXURY: `${siteName}周边米其林或本地高端文化主题餐厅，含主厨推荐菜、酒水搭配与独立包厢。具体餐厅由当地地接团队按日期与口味定制。`,
    BUSINESS: `${siteName}周边本地特色商务餐厅，环境安静、菜式精致，适合商务宴请。具体门店由当地地接团队预订。`,
    STANDARD: `${siteName}周边地道家常风味，人均适中、出品稳定。具体餐厅由当地地接团队按营业时间调度。`,
    BUDGET: `${siteName}周边街头小吃与快餐指引，人均经济。如需提前查位请咨询当地地接服务团队。`,
  };
  const TRA: Record<Tier, string> = {
    LUXURY: `${siteName}目的地专车司导服务，豪华轿车或商务 MPV，含机场接送、全天包车。具体车辆与司导由当地地接团队派遣。`,
    BUSINESS: `${siteName}商务专车，含空调舒适座椅与基础中英文司导。具体车型由当地地接团队按档期派遣。`,
    STANDARD: `${siteName}拼车或当地出租方案，性价比高。具体线路与价格由当地地接团队即时报价。`,
    BUDGET: `${siteName}公共交通线路指引（地铁/公交/步行）。如需增加临时接驳请咨询当地地接服务团队。`,
  };
  const SHO: Record<Tier, string> = {
    LUXURY: `${siteName}周边高端文化艺术藏品购物：古籍、法器、艺术品。具体店家与真品鉴定由当地地接团队陪同。`,
    BUSINESS: `${siteName}周边品牌文化纪念品购物，含官方文创与限量品。具体门店由当地地接团队带访。`,
    STANDARD: `${siteName}周边地方特产伴手礼，含茶叶、香品、手工艺。具体店铺由当地地接团队推荐。`,
    BUDGET: `${siteName}景区内外平价纪念品指引。议价与真伪甄别可咨询当地地接服务团队。`,
  };
  const GUI: Record<Tier, string> = {
    LUXURY: `${siteName}学者级一对一双语向导，深度解读历史文化与原典故事。由当地地接团队匹配资深学者。`,
    BUSINESS: `${siteName}持证中英文向导，含文化讲解与路线定制。由当地地接团队派遣。`,
    STANDARD: `${siteName}中文跟团讲解，含景区门票与集合接送。由当地地接团队统一调度。`,
    BUDGET: `${siteName}官方讲解 APP 或小程序使用指引，自助参访。如需现场临时讲解请咨询当地地接服务团队。`,
  };
  return cat === 'RESTAURANT'
    ? RES[tier]
    : cat === 'TRANSPORT'
      ? TRA[tier]
      : cat === 'SHOPPING'
        ? SHO[tier]
        : GUI[tier];
}

function unitOf(cat: Cat): string {
  return cat === 'RESTAURANT'
    ? '人/餐'
    : cat === 'TRANSPORT'
      ? '车/天'
      : cat === 'SHOPPING'
        ? '件起'
        : '人/天';
}

function extraKw(cat: Cat): string {
  return cat === 'RESTAURANT'
    ? 'restaurant'
    : cat === 'TRANSPORT'
      ? 'car hire transport'
      : cat === 'SHOPPING'
        ? 'souvenir shop'
        : 'tour guide';
}

async function main() {
  console.log('🏨 seed-packages-v4-auto — 补齐剩余 4 类');

  const sites = await prisma.holySite.findMany({
    select: { id: true, name: true, nameEn: true, country: true },
  });
  console.log(`  Sites=${sites.length}`);

  const TIERS: Tier[] = ['LUXURY', 'BUSINESS', 'STANDARD', 'BUDGET'];
  const CATS: Cat[] = ['RESTAURANT', 'TRANSPORT', 'SHOPPING', 'GUIDE'];
  let created = 0;
  let skipped = 0;

  for (const site of sites) {
    for (const tier of TIERS) {
      for (const cat of CATS) {
        const [minCNY, maxCNY] = PRICE_BANDS[cat][tier];
        const { value: priceMin, currency } = toMoney(minCNY, site.country);
        const { value: priceMax } = toMoney(maxCNY, site.country);
        const title = titleOf(cat, tier, site.name);

        const existed = await prisma.destinationPackage.findFirst({
          where: { holySiteId: site.id, tier, category: cat as PackageCategory, title },
        });
        if (existed) {
          skipped++;
          continue;
        }

        await prisma.destinationPackage.create({
          data: {
            holySiteId: site.id,
            tier,
            category: cat as PackageCategory,
            title,
            description: descOf(cat, tier, site.name),
            priceMin,
            priceMax,
            currency,
            priceUnit: unitOf(cat),
            priceAsOf: PRICE_AS_OF,
            groundTeamName: `${site.name}当地地接服务团队（${TIER_LABEL[tier]}）`,
            groundTeamHours: '09:00-21:00 local',
            groundTeamNote: GROUND_TEAM_NOTE,
            sourceUrls: searchUrls(site.nameEn || site.name, site.country, extraKw(cat)),
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

  console.log(`\n✅ v4-auto done: created=${created} skipped=${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
