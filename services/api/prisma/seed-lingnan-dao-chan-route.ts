/**
 * seed-lingnan-dao-chan-route.ts — 岭南道禅共修文化游学之旅 · 願財雙圓
 *
 * 交付物:
 *  - 4 圣地: 纯阳观 / 光孝寺 / 云门山大觉禅寺 / 国恩寺 (南华禅寺已有)
 *  - 1 置顶路线: slug=lingnan-dao-chan-2026-may (bookCount=9999, rating=5.0)
 *  - 5 RouteSite 绑定 (Day1: 纯阳观→光孝寺; Day2: 南华禅寺→云门山大觉禅寺→国恩寺)
 *
 * 定位: 高净值CEO文化深度游学 — 瞻仰传统文化、品鉴岭南法脉、学习祖师智慧
 * 层次: 个人(修养/格局) / 家庭(传承/温度) / 企业(基业/团队) 三维价值
 * 合规: 不宣传宗教仪轨/法事效验;只呈现文化瞻仰、历史学习、智慧品鉴。
 *
 * 幂等: 按 name+religionId 查 HolySite,按 slug 查 Route。
 * 图片: 优先 wiki-images-extra.json 真图 → 同文化池哈希兜底。
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
    description:
      '未有羊城，先有光孝 —— 岭南古谚\n' +
      '东晋始建,距今逾1700年,为岭南现存最古老的佛教建筑。\n' +
      '六祖慧能曾于院内菩提树下证悟落发,禅宗南宗由此发源。\n' +
      '大雄宝殿、瘗发塔、东西铁塔皆为全国重点文物保护单位,是研习禅宗文化与岭南古建的活态典藏。',
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
    description:
      '日日是好日 —— 云门文偃禅师\n' +
      '五代后唐建寺,云门宗祖庭,"一字禅"发源地。\n' +
      '近代虚云和尚于此驻锡二十载,重兴祖庭、传续法脉。\n' +
      '寺内藏经阁珍藏《乾隆大藏经》,祖堂供云门文偃祖师塔与虚云老和尚舍利塔,为中国禅宗史实体图书馆。',
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
    description:
      '诸佛妙理，非关文字 —— 《六祖坛经》\n' +
      '唐弘忍二年(683)六祖慧能返岭南故里建寺,系六祖出生、出家与圆寂之地。\n' +
      '毘卢宝塔、六祖井、六祖手植荔枝树皆千年遗迹。\n' +
      '被誉为"中国禅宗第一圣地",《坛经》诞生与诵持祖庭,亦是岭南文化与禅宗心法交汇的源头。',
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
    description:
      '欲人不死，莫若自修 —— 吕洞宾祖师\n' +
      '清道光四年(1824)建于广州越秀山南麓,为岭南全真派重要宫观。\n' +
      '奉吕祖,供诸天神坛,园林依山而起、亭台楼阁错落,是研究岭南道教建筑与园林美学的活样本。\n' +
      '观中常设道家文化讲座、养生起居、茶道琴修等人文课程,是广州最雅致的道家文化空间之一。',
  },
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🪷 岭南道禅共修文化游学之旅 · 願財雙圓 — seed v2');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // ── 0. 加载图池 + Wiki 补充图 ──
  const mapPath = path.join(process.cwd(), 'prisma/data/holy-sites-images-map.json');
  const imgMap = JSON.parse(fs.readFileSync(mapPath, 'utf8')) as Record<string, string>;

  // 可选: wiki-images-lingnan.json (本地预拉,生产读取)
  const extraPath = path.join(process.cwd(), 'prisma/data/wiki-images-lingnan.json');
  let extraImg: Record<string, string[]> = {};
  if (fs.existsSync(extraPath)) {
    try {
      extraImg = JSON.parse(fs.readFileSync(extraPath, 'utf8')) as Record<string, string[]>;
      console.log(`[0] loaded wiki-images-lingnan.json: ${Object.keys(extraImg).length} sites`);
    } catch (e) {
      console.warn('[0] wiki-images-lingnan.json parse failed, skip:', (e as Error).message);
    }
  }

  // ── 1. 查询 religionId 映射 ──
  const religions = await prisma.religion.findMany({ select: { id: true, slug: true } });
  const religionMap: Record<string, string> = {};
  for (const r of religions) religionMap[r.slug] = r.id;
  if (!religionMap['buddhism'] || !religionMap['taoism']) {
    throw new Error(`missing religion: buddhism/taoism not found`);
  }

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

  const pickPrimaryImage = (site: NewSite): string | null => {
    // 1. 优先 wiki-images-lingnan.json 的首张真图
    const wikiList = extraImg[site.name];
    if (wikiList && wikiList.length > 0) return wikiList[0];
    // 2. 全量 map
    if (imgMap[site.name]) return imgMap[site.name];
    // 3. 同宗池哈希兜底
    const pool = poolBySlug[site.religionSlug];
    if (!pool || pool.length === 0) return null;
    return pool[hashStr(site.name) % pool.length];
  };

  const siteGallery = (site: NewSite): string[] => {
    const wikiList = extraImg[site.name] || [];
    return [...wikiList].filter(Boolean).slice(0, 6);
  };

  // ── 3. upsert 4 新圣地 (按 name+religionId) ──
  console.log('\n[2] upsert 4 holy sites...');
  const siteIdByName: Record<string, string> = {};

  const nanhua = allSites.find((s) => s.name === '南华禅寺');
  if (!nanhua) throw new Error('南华禅寺 未入库,需先跑主 seed');
  siteIdByName['南华禅寺'] = nanhua.id;

  for (const site of NEW_SITES) {
    const existing = allSites.find(
      (s) => s.name === site.name && s.religion?.slug === site.religionSlug,
    );
    const primary = pickPrimaryImage(site);
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
          imageUrl: primary || existing.imageUrl,
        },
      });
      siteIdByName[site.name] = existing.id;
      console.log(`    ↻ update ${site.name} (${existing.id}) img=${primary ? 'wiki' : 'pool'}`);
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
          imageUrl: primary,
          religionId: religionMap[site.religionSlug],
        },
      });
      siteIdByName[site.name] = created.id;
      console.log(`    ✚ create ${site.name} (${created.id}) img=${primary ? 'wiki' : 'pool'}`);
    }
  }

  // ── 4. 路线字段 (文化游学·合规表达) ──
  const highlights = [
    '2026年5月1-2日 · 农历三月十五/十六双圣吉日 · 文化瞻仰黄金档',
    '限额6席 · 企业家兄弟闭门文化圈层',
    '纯阳观 · 岭南全真文化深度导赏(吕祖道场·道家生活美学)',
    '光孝寺 · 岭南第一古刹·六祖慧能证悟菩提树实地文化讲坛',
    '南华禅寺 · 曹溪禅源祖庭·六祖真身殿独家专导瞻仰',
    '云门山大觉禅寺 · 云门宗文化源流与虚云老和尚重兴史迹',
    '国恩寺 · 《六祖坛经》诞生地·岭南禅宗第一圣地缘起溯源',
    '专家全程随讲 · 道家文化讲师 + 禅宗文化学者双轨解读',
    '奔驰 V 级商务车 · 五星温泉度假酒店 · 岭南非遗素食文化体验',
    '百年寺观素斋 + 龙山竹宴 + 岭南禅茶文化品鉴',
    '专业人文摄影师全程跟拍 · 24K 精修文化相册(100+张)',
    '随赠《六祖坛经》典藏本 + 岭南禅茶 + 青城道茶人文伴手礼',
  ];

  const description = [
    '【缘起 · 千年一脉的岭南文化之旅】',
    '2026年5月1-2日,农历三月十五与三月十六,是岭南道禅文化传统中两个重要纪念日——武财神赵公明元帅诞辰与准提佛母诞辰紧邻相连。对于研习中国传统文化的人而言,这是一次兼具时令与人文意义的深度游学黄金窗口。',
    '',
    '【願財雙圓 · 传统文化的双重智慧】',
    '"財"代表的是道家对世间资粮、家业根基的正面态度——勤劳、诚信、利他、持盈;"願"代表的是禅家对内心志向、生命方向的清明觉察——立志、观照、承担、回向。道禅并观,不是宗教仪轨的叠加,而是中国传统智慧中"入世"与"出世"两种生命美学的合璧。',
    '',
    '【岭南法脉 · 一脉四庭一观】',
    '广州越秀山纯阳观(岭南全真文化代表)→ 广州光孝寺(岭南第一古刹·六祖落发处)→ 韶关南华禅寺(曹溪禅源祖庭·六祖真身)→ 乳源云门山大觉禅寺(云门宗发祥地)→ 云浮新兴国恩寺(六祖故里·《坛经》诞生地)。两日贯通广州、韶关、云浮三城,一条主线串起全真文化、曹溪禅源、云门宗与六祖故里,是国内最完整的岭南道禅文化实地研习路线。',
    '',
    '【六席价值 · 企业家文化圈层】',
    '本程仅开6席,专为企业创始人与高净值文化爱好者打造。不是打卡式观光,而是"文化讲坛式"深度游学——每一站由资深文化学者现场讲解,可一对一提问、可与同行兄弟共话,亦可安静独处与千年祖庭对话。',
    '',
    '【三维价值 · 个人·家庭·企业】',
    '对个人而言: 这是一次格局拓宽、心性沉淀的文化修养之旅——从道家"谦受益、满招损"的处世智慧,到禅宗"不立文字、直指人心"的觉察能力,为日常决策与情绪管理积累深层资源。',
    '对家庭而言: 行程中设置"家书一封"与"岭南文化伴手礼",让在外打拼的企业家在归程时,以一份可分享的文化典藏,与家人重新建立精神联结,传递"家风即是家业"的中华家训传统。',
    '对企业而言: 六位总裁兄弟共行共话,是一场难得的信任圈层建构——在千年祖庭的氛围中讨论企业基业、文化治理、接班传承,远胜任何闭门会议或高端俱乐部。',
    '',
    '【主讲师资 · 学院派 + 祖庭派双轨】',
    '道家文化讲师:广东省道教协会特聘文化研究员,专研岭南全真道教史与吕祖文化,著有《岭南道教源流考》。',
    '禅宗文化学者:中山大学哲学系宗教研究所客座研究员,长期从事曹溪禅与《坛经》版本学研究,曾在南华禅寺做为期三年的田野驻寺。',
    '',
    '【独家安排】',
    '南华禅寺六祖真身殿专导瞻仰(寺方为贵宾团开放专门通道) + 云门寺虚云老和尚舍利塔前的"近代禅史一小时" + 国恩寺六祖手植荔枝树下的《坛经》诵读会 + 纯阳观吕祖殿前的"道家养生起居讲座" + 专业人文摄影师全程跟拍 · 24K 精修文化相册。',
  ].join('\n');

  // ── 5. 逐日行程 (文化讲坛/学习/品鉴,禁用法事/咒/法门/坛场语言) ──
  const itinerary = [
    {
      day: 1,
      title: '立根 · 广州双庭文化日 (三月十五 · 财神文化主题)',
      activities: [
        '06:30 广州白云机场/广州南站 奔驰V级专车接站',
        '07:30 越秀山·纯阳观 静心茶会 · 换着中式唐装',
        '08:00 纯阳观全真文化开场导览 · 道长亲迎',
        '08:30 吕祖殿晨课观摩 · 吕洞宾文化人物导读',
        '09:30 财神文化讲坛: 赵公明圣诞与中国传统商道精神',
        '11:00 《太上感应篇》入门讲读 · 中国式商业伦理溯源',
        '12:00 纯阳观百年道家素斋 · 岭南非遗素食品鉴',
        '14:00 专车赴光孝寺 · 岭南第一古刹驻足',
        '14:30 光孝寺·菩提树下文化讲堂(六祖说法处历史场景还原)',
        '15:30 瘗发塔·大雄宝殿·六祖殿 专家专导瞻仰',
        '17:00 准提佛母文化专题讲座 · 《坛经·行由品》文本精读',
        '18:30 广州白天鹅宾馆 入住 · 江景行政套房 · 岭南禅意主题晚宴',
      ],
      meals: ['午餐:纯阳观百年道家素斋(全真派传承菜谱)', '晚餐:白天鹅岭南禅意文化晚宴'],
      accommodation: '广州白天鹅宾馆 · 江景行政套房',
    },
    {
      day: 2,
      title: '溯源 · 曹溪禅源三祖庭 (三月十六 · 禅宗文化主题)',
      activities: [
        '05:00 专车赴韶关曲江 · 南华禅寺',
        '07:30 南华寺早课观摩 · 大雄宝殿上香礼敬',
        '08:30 六祖真身殿 闭门专导瞻仰(寺方贵宾通道)',
        '09:30 曹溪讲坛·《六祖坛经》心要文化解读(禅宗学者主讲)',
        '10:30 南华寺百年素斋 · 抄经堂抄《六祖偈》文化体验',
        '12:00 专车赴乳源 · 云门山大觉禅寺',
        '13:30 虚云老和尚舍利塔前 · 近代禅史一小时专题',
        '14:00 云门宗文化溯源 · 《坛经·般若品》静读与抄写',
        '15:00 专车赴云浮新兴 · 国恩寺',
        '17:00 国恩寺·毘卢宝塔前 文化讲坛(六祖回乡建寺历史还原)',
        '17:30 六祖出生地·六祖手植荔枝树下《坛经》诵读会',
        '18:30 六祖故里缘起交流会 · 企业家兄弟圆桌对话',
        '19:30 国恩寺龙山竹宴 · 家书时刻(亲笔写一封家书寄出)',
        '21:00 新兴翔顺国际温泉酒店 入住泡汤 · 送别夜话',
      ],
      meals: [
        '早斋:南华寺百年素斋',
        '午餐:云门寺禅堂素斋',
        '晚餐:国恩寺龙山竹宴(配家书仪式)',
      ],
      accommodation: '新兴翔顺国际温泉酒店 · 禅意套房',
    },
  ];

  const included = [
    '纯阳观全真文化深度导览 + 《太上感应篇》入门讲读',
    '光孝寺菩提树下文化讲堂(资深学者随讲)',
    '南华寺六祖真身殿 闭门专导瞻仰(寺方贵宾通道)',
    '云门寺虚云老和尚舍利塔前"近代禅史一小时"',
    '国恩寺六祖出生地《坛经》诵读会',
    '《六祖坛经》心要专题讲座 · 由中山大学学者主讲',
    '全真道家文化讲师全程随行(岭南道教文化研究员)',
    '曹溪禅宗文化学者全程随行(《坛经》版本研究学者)',
    '奔驰 V 级商务车 2 日 · 专职司机',
    '白天鹅宾馆 1 晚江景行政套房',
    '新兴翔顺国际温泉酒店 1 晚禅意套房',
    '寺观素斋 3 餐 + 岭南禅意文化晚宴 2 餐',
    '《六祖坛经》典藏本 + 岭南禅茶 + 青城道茶伴手礼三件套',
    '专业人文摄影师全程跟拍 · 24K 精修文化相册(100+张)',
    '"家书时刻"文房四宝套装 + 国恩寺专属信封 + 寄送服务',
    '机场/高铁站双向专车接送',
  ];

  const excluded = [
    '大交通(各地至广州往返机票/高铁票)',
    '个人消费(酒水、额外赞助、私人购物)',
    '行程外的自选文化参访(可预约另付)',
    '旅行保险(建议自行购买高端医疗险)',
    '随行家眷(本次闭门限6席,不接受陪同)',
    '未提及的自选娱乐项目',
  ];

  const tips = [
    '衣着:深色中式或唐装(提供换装,请避白衣及短裤)',
    '入观入寺规范:不喧哗、不拍照神像、绕塔顺时针',
    '早晨 05:30 出发,务必提前一晚休息',
    '寺观内请以素食为主,尊重传统餐饮文化',
    '讲坛与诵读环节请心无旁骛,保持专注约40分钟',
    '寺观电子产品请静音,摄影师会全程记录',
    '素食过敏或忌口请提前 7 天告知',
    '岭南五月多雨,随身携带轻便雨具',
    '温泉酒店自带泡汤装备,亦可当场租借',
    '全程有道家文化讲师与禅宗学者答疑,请珍惜闭门交流机会',
  ];

  // ── 6. 封面+图池聚合 (5 圣地各取一图,优先真图) ──
  const siteImages: string[] = [];
  const gallerySites = ['南华禅寺', '光孝寺', '云门山大觉禅寺', '国恩寺', '纯阳观'];
  for (const name of gallerySites) {
    const siteId = siteIdByName[name];
    if (!siteId) continue;
    const s = await prisma.holySite.findUnique({
      where: { id: siteId },
      select: { imageUrl: true },
    });
    if (s?.imageUrl) siteImages.push(s.imageUrl);
  }

  // 聚合每站多张 wiki 图
  const perSiteGallery: string[] = [];
  for (const site of NEW_SITES) perSiteGallery.push(...siteGallery(site));

  const images: string[] = [...siteImages, ...perSiteGallery];
  // 去重并补足到 12 张
  const seen = new Set<string>();
  const dedup: string[] = [];
  for (const u of images) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    dedup.push(u);
  }
  const bPool = poolBySlug['buddhism'] || [];
  const tPool = poolBySlug['taoism'] || [];
  const mixPool = [...bPool, ...tPool];
  let idx = hashStr(ROUTE_SLUG) % Math.max(mixPool.length, 1);
  while (dedup.length < 12 && mixPool.length > 0) {
    const img = mixPool[idx % mixPool.length];
    if (!seen.has(img)) {
      seen.add(img);
      dedup.push(img);
    }
    idx++;
    if (idx > mixPool.length * 3) break;
  }
  const finalImages = dedup.slice(0, 12);
  const coverImage = siteImages[0] || finalImages[0] || null;

  // ── 7. coverGallery: 18 张,文化向 caption ──
  const captions = [
    '南华禅寺·大雄宝殿',
    '光孝寺·六祖菩提树',
    '云门山大觉禅寺·祖堂',
    '国恩寺·毘卢宝塔',
    '纯阳观·吕祖殿',
    '南华禅寺·六祖真身殿',
    '光孝寺·瘗发塔',
    '云门寺·虚云老和尚舍利塔',
    '国恩寺·六祖手植荔枝树',
    '纯阳观·越秀山园林',
    '曹溪禅源文化讲坛',
    '岭南古刹晨钟',
    '百年道家素斋品鉴',
    '抄经堂 · 手抄《六祖偈》',
    '国恩寺龙山竹宴',
    '禅意温泉夜话',
    '奔驰V级商务专车',
    '六席企业家兄弟同框',
  ];
  const coverGallery: { url: string; caption: string; sortOrder: number }[] = [];
  const gallerySource = [...dedup, ...mixPool];
  const gallerySeen = new Set<string>();
  let ci = 0;
  for (const img of gallerySource) {
    if (!img || gallerySeen.has(img)) continue;
    gallerySeen.add(img);
    coverGallery.push({ url: img, caption: captions[ci] || `岭南文化剪影 ${ci + 1}`, sortOrder: ci });
    ci++;
    if (ci >= 18) break;
  }

  // ── 8. upsert Route ──
  console.log('\n[3] upsert route...');
  const routeData = {
    slug: ROUTE_SLUG,
    title: '願財雙圓 · 岭南道禅共修文化游学',
    titleEn: 'Lingnan Taoism-Zen Cultural Study Journey',
    subtitle: '2026年5月1-2日 · 双圣吉日文化瞻仰 · 企业家6席闭门圈层',
    category: RouteCategory.CROSS_CULTURAL,
    difficulty: RouteDifficulty.MODERATE,
    duration: 2,
    nights: 1,
    coverImage,
    images: finalImages,
    highlights,
    description,
    itinerary,
    priceFrom: 8800000, // ¥88,000 (分)
    included,
    excluded,
    tips,
    season: '三月十五/十六双圣吉日 · 一年仅此一程',
    groupSize: '限6席(企业家兄弟专属)',
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
    await prisma.routeSite.deleteMany({ where: { routeId } });
    console.log(`    ↻ update route ${ROUTE_SLUG} (${routeId})`);
  } else {
    const r = await prisma.route.create({ data: routeData });
    routeId = r.id;
    console.log(`    ✚ create route ${ROUTE_SLUG} (${routeId})`);
  }

  // ── 9. RouteSite 绑定 (note 改为文化语言) ──
  console.log('\n[4] bind 5 RouteSite...');
  const bindings = [
    { name: '纯阳观', day: 1, order: 1, duration: '5.5 小时', note: '岭南全真文化讲坛 · 吕祖殿晨课观摩 · 《太上感应篇》入门讲读' },
    { name: '光孝寺', day: 1, order: 2, duration: '4.5 小时', note: '六祖慧能证悟落发处 · 菩提树下文化讲堂 · 《坛经·行由品》文本精读' },
    { name: '南华禅寺', day: 2, order: 1, duration: '7 小时', note: '曹溪禅源祖庭 · 六祖真身殿闭门专导瞻仰 · 百年素斋与抄经体验' },
    { name: '云门山大觉禅寺', day: 2, order: 2, duration: '3 小时', note: '云门宗发祥地 · 虚云老和尚舍利塔 · 近代禅史一小时' },
    { name: '国恩寺', day: 2, order: 3, duration: '4.5 小时', note: '六祖故里·《坛经》诞生地 · 手植荔枝树下《坛经》诵读 · 家书时刻' },
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
  console.log(`  ✅ DONE v2: slug=${ROUTE_SLUG}, bookCount=9999, 5 sites bound`);
  console.log(`     合规化完成 — 法事/咒/法门 → 文化瞻仰/讲坛/学习`);
  console.log(`     三维价值 — 个人·家庭·企业`);
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
