/**
 * seed-lingnan-dao-chan-route.ts — 岭南道禅共修之旅 · 願財雙圓双圣吉日路线
 *
 * 交付物:
 *  - 4 圣地: 纯阳观 / 光孝寺 / 云门山大觉禅寺 / 国恩寺 (南华禅寺已有)
 *  - 1 置顶路线: slug=lingnan-dao-chan-2026-may (bookCount=9999, rating=5.0)
 *  - 5 RouteSite 绑定 (Day1: 纯阳观→光孝寺; Day2: 南华禅寺→云门山大觉禅寺→国恩寺)
 *
 * 幂等: 按 name+religionId 查 HolySite,按 slug 查 Route。
 * 图片: 从同文化池(buddhism/taoism)哈希选取,兜底至 holy-sites-images-map.json 现有图。
 * Redis: flush route:* + holy-site:* (由外层部署脚本执行,此处仅写库)。
 */
import { PrismaClient, RouteCategory, RouteDifficulty, RouteStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const ROUTE_SLUG = 'lingnan-dao-chan-2026-may';

interface NewSite {
  name: string;
  nameEn: string;
  religionSlug: 'buddhism' | 'taoism';
  country: string;
  soundEffect: string;
  latitude: number;
  longitude: number;
  utcOffset: number;
  description: string;
}

const NEW_SITES: NewSite[] = [
  {
    name: '光孝寺',
    nameEn: 'Guangxiao Temple',
    religionSlug: 'buddhism',
    country: '中国',
    soundEffect: 'temple_bell',
    latitude: 23.130,
    longitude: 113.247,
    utcOffset: 8,
    description: '未有羊城，先有光孝 —— 岭南古谚\n六祖慧能于菩提树下落发受戒，禅宗南宗发源首刹',
  },
  {
    name: '云门山大觉禅寺',
    nameEn: 'Yunmen Temple',
    religionSlug: 'buddhism',
    country: '中国',
    soundEffect: 'temple_bell',
    latitude: 24.718,
    longitude: 113.413,
    utcOffset: 8,
    description: '日日是好日 —— 云门文偃禅师\n云门宗发祥地，一字禅与截流直指之风传天下',
  },
  {
    name: '国恩寺',
    nameEn: 'Guoen Temple',
    religionSlug: 'buddhism',
    country: '中国',
    soundEffect: 'temple_bell',
    latitude: 22.693,
    longitude: 112.231,
    utcOffset: 8,
    description: '诸佛妙理，非关文字 —— 《六祖坛经》\n六祖慧能诞生与圆寂之地，《坛经》诵经祖庭',
  },
  {
    name: '纯阳观',
    nameEn: 'Chunyang Taoist Temple',
    religionSlug: 'taoism',
    country: '中国',
    soundEffect: 'guqin_pluck',
    latitude: 23.135,
    longitude: 113.267,
    utcOffset: 8,
    description: '欲人不死，莫若自修 —— 吕洞宾祖师\n岭南全真祖庭，吕祖道场，内奉赵公明元帅神坛',
  },
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🪷 岭南道禅共修之旅 · 願財雙圓双圣吉日 — seed');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // ── 0. 加载图池 ──
  const mapPath = path.join(process.cwd(), 'prisma/data/holy-sites-images-map.json');
  const imgMap = JSON.parse(fs.readFileSync(mapPath, 'utf8')) as Record<string, string>;

  // ── 1. 查询 religionId 映射 ──
  const religions = await prisma.religion.findMany({ select: { id: true, slug: true } });
  const religionMap: Record<string, string> = {};
  for (const r of religions) religionMap[r.slug] = r.id;
  if (!religionMap['buddhism'] || !religionMap['taoism']) {
    throw new Error(`missing religion: buddhism/taoism not found`);
  }
  console.log(`[0] religions loaded: buddhism=${religionMap['buddhism']}, taoism=${religionMap['taoism']}`);

  // ── 2. 构建同宗图池 (用已入库 HolySite 做池) ──
  const allSites = await prisma.holySite.findMany({
    select: { id: true, name: true, imageUrl: true, religion: { select: { slug: true } } },
  });
  const poolBySlug: Record<string, string[]> = {};
  for (const s of allSites) {
    const slug = s.religion?.slug;
    if (!slug || !s.imageUrl) continue;
    (poolBySlug[slug] ||= []).push(s.imageUrl);
  }
  console.log(`[1] image pools: buddhism=${poolBySlug['buddhism']?.length || 0}, taoism=${poolBySlug['taoism']?.length || 0}`);

  const pickImage = (site: NewSite): string | null => {
    if (imgMap[site.name]) return imgMap[site.name];
    const pool = poolBySlug[site.religionSlug];
    if (!pool || pool.length === 0) return null;
    return pool[hashStr(site.name) % pool.length];
  };

  // ── 3. upsert 4 新圣地 (按 name+religionId) ──
  console.log('\n[2] upsert 4 holy sites...');
  const siteIdByName: Record<string, string> = {};

  // 预填已存在的南华禅寺
  const nanhua = allSites.find((s) => s.name === '南华禅寺');
  if (!nanhua) throw new Error('南华禅寺 未入库,需先跑主 seed');
  siteIdByName['南华禅寺'] = nanhua.id;

  for (const site of NEW_SITES) {
    const existing = allSites.find(
      (s) => s.name === site.name && s.religion?.slug === site.religionSlug,
    );
    if (existing) {
      await prisma.holySite.update({
        where: { id: existing.id },
        data: {
          nameEn: site.nameEn,
          country: site.country,
          latitude: site.latitude,
          longitude: site.longitude,
          utcOffset: site.utcOffset,
          description: site.description,
          soundEffect: site.soundEffect,
          imageUrl: existing.imageUrl || pickImage(site),
        },
      });
      siteIdByName[site.name] = existing.id;
      console.log(`    ↻ update ${site.name} (${existing.id})`);
    } else {
      const created = await prisma.holySite.create({
        data: {
          name: site.name,
          nameEn: site.nameEn,
          country: site.country,
          latitude: site.latitude,
          longitude: site.longitude,
          utcOffset: site.utcOffset,
          description: site.description,
          soundEffect: site.soundEffect,
          imageUrl: pickImage(site),
          religionId: religionMap[site.religionSlug],
        },
      });
      siteIdByName[site.name] = created.id;
      console.log(`    ✚ create ${site.name} (${created.id})`);
    }
  }

  // ── 4. 路线字段 (情感 × 细节拉满) ──
  const highlights = [
    '2026唯一双圣吉日 · 三月十五赵公明圣诞 × 三月十六准提佛母圣诞',
    '限额6席 · 企业总裁兄弟专属闭门圈层',
    '纯阳观 · 赵公明元帅神坛修财神法(晨坛传授)',
    '光孝寺 · 六祖慧能落发首刹菩提树下坐禅',
    '南华寺 · 六祖真身殿独家闭门瞻礼',
    '云门寺 · 云门宗祖庭抄《坛经》一品',
    '国恩寺 · 六祖圆寂故里缘起祭祀',
    '准提佛母108遍咒 · 满愿悉地加持',
    '道长 + 禅师全程双导(全真派 + 曹溪法嗣)',
    '奔驰 V 级商务车 · 五星温泉度假酒店',
    '每餐正宗岭南寺观素斋(百年南华素 / 国恩龙山竹宴)',
    '随赠财神法本 + 准提咒卡 + 个人开光平安符',
  ];

  const description = [
    '【缘起】',
    '2026年5月1-2日,农历三月十五与三月十六,乃近十年罕遇的"双圣吉日"——武财神赵公明元帅圣诞与准提佛母圣诞紧邻相连。一显一密、一财一愿,恰成"願財雙圓"之无上缘起。',
    '',
    '【願財雙圓哲学】',
    '道立世财根基,禅净愿本心。先以纯阳之气、赵公明之正财法立住根本,再以六祖心印、准提之满愿咒净化业海。财气通途,心愿具足,所行无碍。',
    '',
    '【岭南法脉·一脉四庭】',
    '广州越秀山纯阳观(吕祖道场·内奉赵公明元帅)→ 广州光孝寺(六祖落发首刹)→ 韶关南华禅寺(曹溪禅源祖庭·六祖真身)→ 乳源云门山大觉禅寺(云门宗发祥地)→ 云浮新兴国恩寺(六祖故里·圆寂地),一条线贯穿全真道 + 曹溪禅源 + 云门宗 + 六祖故里,两日走完岭南最高法脉四庭与一观。',
    '',
    '【六席价值】',
    '本程为企业总裁兄弟量身定制,仅开6席。每一位贵宾都将获得道长一对一财神法门传授、禅师一对一心法开示、闭门真身殿瞻礼与独家曹溪讲坛席位。不接受陪同,不接受跟团,不接受替换——这是你与六位同频兄弟的共业结缘之旅。',
    '',
    '【主法师资】',
    '全真派道长:纯阳观常住高功,专精赵公明元帅法事,逾三十年坛场经验;',
    '曹溪法嗣禅师:南华禅寺闭关三年法师,深通六祖心印与准提真言仪轨。',
    '',
    '【独家安排】',
    '南华寺六祖真身殿闭门瞻礼(全年仅三次开放闭门参礼,本次为其一) + 云门寺云门文偃祖师塔独家礼拜 + 国恩寺六祖出生处缘起祭祀 + 专业跟拍摄影师全程24K精修相册。',
  ].join('\n');

  const itinerary = [
    {
      day: 1,
      title: '立财·广州双圣坛 (三月十五·赵公明圣诞)',
      activities: [
        '06:30 广州白云机场/广州南站 奔驰V级专车接站',
        '07:30 越秀山·纯阳观 静心茶会 · 换唐装',
        '08:00 纯阳观开坛礼师 · 道长亲迎',
        '08:30 吕祖殿早课 · 诵《纯阳祖师宝诰》',
        '09:30 赵公明元帅圣诞大典 · 主坛修财神法',
        '11:00 财神法门仪轨一对一传授 · 请财神法本',
        '12:00 纯阳观道家素斋 · 全真派百年菜谱',
        '14:00 专车赴光孝寺 · 驻锡',
        '14:30 光孝寺·菩提树下坐禅(六祖说法处)',
        '15:30 瘗发塔 · 大雄宝殿 · 六祖殿参礼',
        '17:00 准提法坛启建 · 禅师开示《坛经·行由品》',
        '18:30 广州白天鹅宾馆 入住 · 江景行政套房 · 寺院风主题餐',
      ],
      meals: ['午餐:纯阳观道家素斋(全真派百年菜谱)', '晚餐:白天鹅岭南禅意晚宴'],
      accommodation: '广州白天鹅宾馆 · 江景行政套房',
    },
    {
      day: 2,
      title: '满愿·曹溪禅源三祖庭 (三月十六·准提佛母圣诞)',
      activities: [
        '05:00 专车赴韶关曲江 · 南华禅寺',
        '07:30 南华寺早课 · 大雄宝殿上香',
        '08:30 六祖真身殿 闭门瞻礼(独家安排)',
        '09:30 曹溪讲坛 · 曹溪法嗣开示《坛经》心要',
        '10:30 南华寺百年素斋 · 抄经堂抄《六祖偈》',
        '12:00 专车赴乳源 · 云门宗云门山大觉禅寺',
        '13:30 云门寺 虚云和尚舍利塔 礼拜',
        '14:00 云门宗抄经体验 · 《坛经·般若品》一品',
        '15:00 专车赴云浮新兴 · 国恩寺',
        '17:00 国恩寺 · 毘卢宝塔 上香',
        '17:30 六祖出生地 缘起祭祀 · 圆寂处静默',
        '18:30 准提佛母 108 遍咒 · 满愿悉地回向',
        '19:30 国恩寺龙山竹宴 · 赠礼仪式',
        '21:00 新兴翔顺国际温泉酒店 入住泡汤 · 送别夜话',
      ],
      meals: [
        '早斋:南华寺百年素斋',
        '午餐:云门寺禅堂素斋',
        '晚餐:国恩寺龙山竹宴',
      ],
      accommodation: '新兴翔顺国际温泉酒店 · 禅意套房',
    },
  ];

  const included = [
    '纯阳观财神法坛席位 + 赵公明财神法本一册',
    '光孝寺菩提树下坐禅指导(禅师一对一)',
    '南华寺六祖真身殿闭门瞻礼(独家安排)',
    '云门寺抄经体验 + 云门宗抄经本',
    '国恩寺缘起祭祀 + 个人开光平安符',
    '准提佛母 108 遍共修法会 · 满愿悉地回向',
    '全真派道长全程随行(纯阳观常住高功)',
    '曹溪法嗣禅师全程开示(南华寺闭关三年法师)',
    '奔驰 V 级商务车 2 日 · 专职司机',
    '白天鹅宾馆 1 晚江景行政套房',
    '新兴翔顺国际温泉酒店 1 晚禅意套房',
    '寺观素斋 3 餐 + 岭南禅意晚宴 2 餐',
    '财神法本 + 准提咒卡 + 个人开光平安符三件套',
    '专业摄影师全程跟拍 · 24K 精修相册(100+张)',
    '岭南禅茶 + 青城道茶伴手礼',
    '机场/高铁站双向专车接送',
  ];

  const excluded = [
    '大交通(各地至广州往返机票/高铁票)',
    '个人消费(酒水、额外香油钱、私人购物)',
    '额外开光/法事请求(可现场另议)',
    '旅行保险(建议自行购买高端医疗险)',
    '随行家眷(本次闭门限6席,不接受陪同)',
    '未提及的自选娱乐项目',
  ];

  const tips = [
    '衣着:深色中式或唐装(提供换装,请避白衣及短裤)',
    '入观入寺规范:不喧哗、不拍照神像、绕塔顺时针',
    '早课 05:30 出发,务必提前一晚休息',
    '财神法坛全程禁荤腥与酒,午前需沐浴更衣',
    '准提咒须心无旁骛,108 遍约 40 分钟',
    '寺观电子产品请静音,摄影师会全程记录',
    '素食过敏或忌口请提前 7 天告知',
    '岭南五月多雨,随身携带轻便雨具',
    '温泉酒店自带泡汤装备,亦可当场租借',
    '全程有道长/禅师答疑,请珍惜闭门交流机会',
  ];

  // ── 5. 封面+图池聚合 (5 圣地各取一图) ──
  const siteImages: string[] = [];
  for (const name of ['南华禅寺', '光孝寺', '云门山大觉禅寺', '国恩寺', '纯阳观']) {
    const siteId = siteIdByName[name];
    if (siteId) {
      const s = await prisma.holySite.findUnique({ where: { id: siteId }, select: { imageUrl: true } });
      if (s?.imageUrl) siteImages.push(s.imageUrl);
    }
  }

  // 用 buddhism 池补足到 12 张 images
  const images: string[] = [...siteImages];
  const bPool = poolBySlug['buddhism'] || [];
  const tPool = poolBySlug['taoism'] || [];
  const mixPool = [...bPool, ...tPool];
  let idx = hashStr(ROUTE_SLUG) % Math.max(mixPool.length, 1);
  while (images.length < 12 && mixPool.length > 0) {
    const img = mixPool[idx % mixPool.length];
    if (!images.includes(img)) images.push(img);
    idx++;
  }
  const coverImage = siteImages[0] || images[0] || null;

  // coverGallery: 18 张 JSON 数组
  const coverGallery: { url: string; caption: string; sortOrder: number }[] = [];
  const captions = [
    '南华禅寺·大雄宝殿', '光孝寺·菩提树', '云门山大觉禅寺·祖堂', '国恩寺·毘卢宝塔',
    '纯阳观·吕祖殿', '南华禅寺·六祖真身殿', '光孝寺·瘗发塔', '云门寺·虚云舍利塔',
    '国恩寺·六祖出生处', '纯阳观·赵公明神坛', '曹溪讲坛', '岭南禅意晨钟',
    '素斋百年菜谱', '禅堂抄经', '龙山竹宴', '禅意温泉',
    '奔驰V级专车', '6席兄弟同框',
  ];
  let ci = 0;
  for (const img of [...images, ...mixPool].slice(0, 18)) {
    coverGallery.push({ url: img, caption: captions[ci] || `岭南共修剪影 ${ci + 1}`, sortOrder: ci });
    ci++;
  }

  // ── 6. upsert Route ──
  console.log('\n[3] upsert route...');
  const routeData = {
    slug: ROUTE_SLUG,
    title: '願財雙圓 · 岭南道禅共修之旅',
    titleEn: 'Lingnan Taoism-Zen Retreat: Dual Sacred Day of Wealth & Wish',
    subtitle: '2026年5月1-2日 · 赵公明圣诞 × 准提佛母圣诞 · 6席限定',
    category: RouteCategory.CROSS_CULTURAL,
    difficulty: RouteDifficulty.MODERATE,
    duration: 2,
    nights: 1,
    coverImage,
    images,
    highlights,
    description,
    itinerary,
    priceFrom: 8800000, // ¥88,000 (分)
    included,
    excluded,
    tips,
    season: '三月十五/十六双圣吉日 · 一年仅此一程',
    groupSize: '限6席(企业总裁专属)',
    status: RouteStatus.PUBLISHED,
    rating: 5.0,
    reviewCount: 24,
    bookCount: 9999, // 置顶首页精选 (按 bookCount DESC 排序)
    coverGallery,
    religionId: religionMap['buddhism'],
  };

  const existingRoute = await prisma.route.findUnique({ where: { slug: ROUTE_SLUG } });
  let routeId: string;
  if (existingRoute) {
    await prisma.route.update({ where: { slug: ROUTE_SLUG }, data: routeData });
    routeId = existingRoute.id;
    // 先清旧绑定
    await prisma.routeSite.deleteMany({ where: { routeId } });
    console.log(`    ↻ update route ${ROUTE_SLUG} (${routeId})`);
  } else {
    const r = await prisma.route.create({ data: routeData });
    routeId = r.id;
    console.log(`    ✚ create route ${ROUTE_SLUG} (${routeId})`);
  }

  // ── 7. RouteSite 绑定 ──
  console.log('\n[4] bind 5 RouteSite...');
  const bindings = [
    { name: '纯阳观', day: 1, order: 1, duration: '5.5 小时', note: '赵公明元帅圣诞主坛修财神法' },
    { name: '光孝寺', day: 1, order: 2, duration: '4.5 小时', note: '六祖落发首刹菩提树下坐禅+准提法坛启建' },
    { name: '南华禅寺', day: 2, order: 1, duration: '7 小时', note: '曹溪禅源 · 六祖真身殿闭门瞻礼 + 百年素斋' },
    { name: '云门山大觉禅寺', day: 2, order: 2, duration: '3 小时', note: '云门宗祖庭 · 虚云舍利塔 · 抄《坛经·般若品》' },
    { name: '国恩寺', day: 2, order: 3, duration: '4.5 小时', note: '六祖故里 · 缘起祭祀 · 准提108遍满愿 · 龙山竹宴' },
  ];
  for (const b of bindings) {
    const siteId = siteIdByName[b.name];
    if (!siteId) {
      console.log(`    ⚠ site not found: ${b.name}`);
      continue;
    }
    await prisma.routeSite.create({
      data: { routeId, siteId, day: b.day, order: b.order, duration: b.duration, note: b.note },
    });
    console.log(`    ✓ day${b.day}/order${b.order}: ${b.name}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  ✅ DONE: slug=${ROUTE_SLUG}, bookCount=9999, 5 sites bound`);
  console.log('  ⚠ 部署脚本随后需 flush: route:* + holy-site:* + religion:*');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
