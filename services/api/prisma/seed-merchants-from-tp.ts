/**
 * seed-merchants-from-tp.ts — TP++ → 商家派生种子
 *
 * 策略:
 *   - 每个 HolySite × 5 种 Merchant.type = 2515 商家
 *   - 每商家 4 个 MerchantService (从 TP 包的 4 档映射)
 *   - logo = site.imageUrl (真实圣地图), address = 城市/国家
 *   - 商家名 = "{site.name}{后缀}" 确定性命名
 *   - 幂等: 已存在同名同site商家则跳过
 *
 * 运行: cd services/api && npx tsx prisma/seed-merchants-from-tp.ts
 */
import { PrismaClient, PackageCategory, PackageTier } from '@prisma/client';

const prisma = new PrismaClient();

type MerchType = 'RESTAURANT' | 'HOTEL' | 'GUIDE' | 'TRANSPORT' | 'SHOPPING';

// 商家类型 → TP 包类别映射
const MERCH_TO_CAT: Record<MerchType, PackageCategory> = {
  RESTAURANT: 'RESTAURANT',
  HOTEL: 'HOTEL',
  GUIDE: 'GUIDE',
  TRANSPORT: 'TRANSPORT',
  SHOPPING: 'SHOPPING',
};

const SUFFIX: Record<MerchType, string> = {
  RESTAURANT: '文化餐厅',
  HOTEL: '精选住宿',
  GUIDE: '持证向导团队',
  TRANSPORT: '专车服务',
  SHOPPING: '文创商铺',
};

const DESC: Record<MerchType, string> = {
  RESTAURANT: '依托圣地文化底蕴，精选地方特色菜式与健康素食，含尊贵/商务/标准/自助 4 档套餐。',
  HOTEL: '邻近圣地的精选住宿，从五星奢华到青旅自助全档次覆盖，含快速入住与文化主题布置。',
  GUIDE: '持证双语向导团队，学者级到 APP 自助全档次讲解，深度解读圣地历史与原典故事。',
  TRANSPORT: '豪华轿车/商务 MPV/拼车/公交指引，全档次接送与包车方案，由地接团队统一派遣。',
  SHOPPING: '高端艺术藏品到平价纪念品全覆盖，地方特产与文创伴手礼，支持议价与真伪甄别。',
};

const TIERS: PackageTier[] = ['LUXURY', 'BUSINESS', 'STANDARD', 'BUDGET'];
const TIER_LABEL: Record<PackageTier, string> = {
  LUXURY: '尊贵游',
  BUSINESS: '商务游',
  STANDARD: '标准游',
  BUDGET: '自助游',
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function phoneFor(siteId: string, type: MerchType): string {
  const h = hash(siteId + type);
  return `+86-${String(100 + (h % 900))}-${String(h % 100000000).padStart(8, '0')}`;
}

async function ensureBotUser(siteId: string, type: MerchType, siteName: string) {
  const phone = phoneFor(siteId, type);
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      phone,
      nickname: `${siteName}${SUFFIX[type]}-bot`,
      role: 'GUIDE',
    },
  });
}

async function main() {
  console.log('🏪 seed-merchants-from-tp — 从 TP++ 包派生商家');

  const sites = await prisma.holySite.findMany({
    select: { id: true, name: true, nameEn: true, country: true, imageUrl: true },
  });
  console.log(`  Holy sites=${sites.length}`);

  let mCreated = 0;
  let mSkipped = 0;
  let sCreated = 0;

  const MERCH_TYPES: MerchType[] = ['RESTAURANT', 'HOTEL', 'GUIDE', 'TRANSPORT', 'SHOPPING'];

  for (const site of sites) {
    // 预取此站 4 档 × 5 类的所有 TP 包 (一次查全量，内存过滤)
    const cats = MERCH_TYPES.map((t) => MERCH_TO_CAT[t]);
    const pkgs = await prisma.destinationPackage.findMany({
      where: { holySiteId: site.id, category: { in: cats as PackageCategory[] } },
    });
    const byCatTier = new Map<string, typeof pkgs[number]>();
    for (const p of pkgs) byCatTier.set(`${p.category}:${p.tier}`, p);

    for (const mType of MERCH_TYPES) {
      const name = `${site.name}${SUFFIX[mType]}`;
      const existed = await prisma.merchant.findFirst({ where: { name } });
      if (existed) {
        mSkipped++;
        continue;
      }

      const user = await ensureBotUser(site.id, mType, site.name);
      const cat = MERCH_TO_CAT[mType];

      const merchant = await prisma.merchant.create({
        data: {
          userId: user.id,
          type: mType,
          name,
          description: `${site.name} · ${DESC[mType]}`,
          logo: site.imageUrl,
          status: 'ACTIVE',
          contactPhone: phoneFor(site.id, mType),
          contactEmail: `contact-${hash(site.id + mType) % 100000}@joinus.com`,
          address: `${site.country} · ${site.name}周边`,
          city: site.name,
          province: site.country,
          rating: 4.2 + ((hash(site.id + mType) % 70) / 100), // 4.2-4.9
          totalOrders: 20 + (hash(site.id + mType) % 580),
        },
      });
      mCreated++;

      // 4 档 service，从 TP 包拉取真实价格
      for (const tier of TIERS) {
        const pkg = byCatTier.get(`${cat}:${tier}`);
        const price = pkg?.priceMin ?? 0;
        await prisma.merchantService.create({
          data: {
            merchantId: merchant.id,
            name: `${TIER_LABEL[tier]} · ${SUFFIX[mType]}`,
            description: pkg?.description ?? `${site.name} ${TIER_LABEL[tier]}档${SUFFIX[mType]}服务`,
            coverImage: site.imageUrl,
            price,
            duration:
              mType === 'RESTAURANT'
                ? 90
                : mType === 'HOTEL'
                  ? 1440
                  : mType === 'GUIDE' || mType === 'TRANSPORT'
                    ? 480
                    : 60,
            maxPersons: mType === 'HOTEL' ? 2 : 10,
            isActive: true,
          },
        });
        sCreated++;
      }
    }
  }

  console.log(
    `\n✅ seed-merchants-from-tp done: merchants_created=${mCreated} skipped=${mSkipped} services_created=${sCreated}`,
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
