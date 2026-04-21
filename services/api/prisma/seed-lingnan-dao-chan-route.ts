/**
 * seed-lingnan-dao-chan-route.ts — 岭南文化游学之旅 · 基业长青 v3
 *
 * 交付物:
 *  - 4 圣地: 纯阳观 / 光孝寺 / 云门山大觉禅寺 / 国恩寺 (南华禅寺已有)
 *  - 1 置顶路线: slug=lingnan-dao-chan-2026-may (bookCount=9999, rating=5.0)
 *  - 5 RouteSite 绑定:
 *      Day1 纯阳观(广州) → 光孝寺(广州) → 南华禅寺(韶关曲江,住南华寺旁民宿)
 *      Day2 南华禅寺 → 云门山大觉禅寺(乳源) → 国恩寺(新兴,住国恩寺旁民宿)
 *  - 组织方: 小鸿团队(专业文化打造团队) — 非宗教/非寺观官方活动
 *  - 主题: 企业文化 · 基业长青 · 中华传统智慧游学
 *  - 合规: 只呈现文化瞻仰、历史学习、智慧品鉴;不宣传宗教仪轨/效验;
 *          不使用"道长亲迎""禅师开示""寺方通道"等与寺观挂钩的特权/人设措辞。
 *
 * 幂等: 按 name+religionId 查 HolySite,按 slug 查 Route。
 * 图片: 优先 wiki-images-lingnan.json 真图 → 同文化池哈希兜底。
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
  console.log('  🏛️ 基业长青 · 岭南文化游学之旅 — seed v3 (小鸿团队定制)');
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

  // ── 4. 路线字段 (文化游学·基业长青·小鸿团队定制) ──
  const highlights = [
    '小鸿团队 · 专业文化打造团队全程定制(非寺观主办,独立文化游学)',
    '2026年5月1-2日 · 农历三月十五/十六岭南文化双吉日档期',
    '企业家限定6席 · 基业长青深度圈层',
    '纯阳观 · 岭南全真文化与中国古代商道溯源(越秀山晨课观摩)',
    '光孝寺 · 岭南第一古刹·六祖慧能证悟菩提树实地文化讲堂',
    '南华禅寺 · 曹溪禅源祖庭·六祖真身殿历史瞻仰(当日抵达,夜宿曹溪旁)',
    '云门山大觉禅寺 · 云门宗"日日是好日"与百年祖庭重兴文化史',
    '国恩寺 · 《六祖坛经》诞生地·六祖故里千年归根文化溯源',
    '小鸿团队文化导师 2 位全程随讲(中国传统文化研究背景)',
    '奔驰 V 级商务车 · 南华寺旁民宿 + 国恩寺旁民宿(深度驻地体验)',
    '百年寺观素斋 + 岭南龙山竹宴 + 禅意茶文化品鉴',
    '"家书时刻"亲笔一封家书代寄 + 《六祖坛经》典藏本 + 岭南文化伴手礼',
    '专业人文摄影师全程跟拍 · 100+张 24K 精修文化相册',
    '"基业长青圆桌"两晚企业家闭门夜话 · 小鸿团队主持',
  ];

  const description = [
    '【缘起 · 基业长青的中国文化答案】',
    '任何一家穿越三代以上的中华企业,都绕不开一个共同命题——基业如何长青?放眼岭南千年祖庭,我们看到一脉相承的文化答案:纯阳观吕祖道场已传二百年,光孝寺守护菩提树一千七百年,南华寺护持六祖真身一千三百年,云门寺经历代复兴至今仍香火旺盛,国恩寺手植荔枝千年未倒。这些机构之所以长青,不是靠神通,而是靠一套被中国文化验证了千年的"文化治理法"。',
    '',
    '【本程定位 · 小鸿团队企业文化定制】',
    '本程由"小鸿团队 —— 专业文化打造团队"独立策划、全程陪同、闭门主持。我们不依附任何寺观或宗教团体,仅借岭南五座千年文化场所的独特氛围,把中国传统文化中"基业长青"的智慧抽离出来,转译为现代企业可复用的文化资产——这才是本程最核心的价值。',
    '',
    '【岭南一脉 · 两天穿行三城五庭】',
    '广州越秀山纯阳观(全真文化与商道起源) → 广州光孝寺(岭南第一古刹·六祖落发处) → 韶关曲江南华禅寺(曹溪禅源祖庭·六祖真身,当日抵达,夜宿曹溪旁民宿) → 乳源云门山大觉禅寺(云门宗"日日是好日"与虚云百年重兴) → 云浮新兴国恩寺(六祖故里·《坛经》诞生地,夜宿国恩寺旁民宿)。两天两夜沿岭南禅源一线推进,不折返、不重复、每一站都有独立的文化主题。',
    '',
    '【六席价值 · 企业家基业长青圈层】',
    '本程仅开6席,只为中国企业创始人/家族第二代传承人打造。不是观光打卡,而是"基业长青文化游学"——在千年祖庭的氛围中,由小鸿团队文化导师带领,讨论企业文化治理、品牌百年延续、家族事业传承等创始人内心最深的命题。两晚民宿边的圆桌夜话,是比任何俱乐部都更珍贵的同频信任圈层。',
    '',
    '【三维价值 · 个人·家庭·企业】',
    '对个人而言: 格局拓宽、心性沉淀。从道家"谦受益、满招损"的处世观,到禅宗"不立文字、直指人心"的觉察力,为企业家的日常决策和情绪管理积累深层心性资源。',
    '对家庭而言: 行程中设置"家书一封"——在国恩寺(六祖回归故里之地)手书一封信,由小鸿团队代寄家中。企业家归程时再带上一份《六祖坛经》典藏本与岭南文化伴手礼,让"家风即是家业"的中华家训从此在自己家庭落地生根。',
    '对企业而言: 六位创始人兄弟共行两天两夜,在千年场所之中围绕"基业长青"做深度对话——从"为何百年寺庙不倒"延伸到"为何我们的企业要活过百年",这种文化自觉,比任何管理学课程都深远。',
    '',
    '【师资 · 小鸿团队自有文化导师】',
    '全程由小鸿团队两位文化导师全程陪同、全程主讲。导师背景为中国传统文化研究方向,熟悉岭南道教、禅宗、儒家三系文化源流,并长期服务中国头部企业的文化建设项目。全程不挂宗教头衔,只做纯粹的文化讲解、历史还原与企业家对话主持。',
    '',
    '【独家环节 · 基业长青五重文化体验】',
    '① 纯阳观越秀山晨课观摩 + 《太上感应篇》中国古代商道精读',
    '② 光孝寺菩提树下《坛经·行由品》实地文化讲堂',
    '③ 南华禅寺曹溪"企业文化夜话"— 基业长青的六个关键词',
    '④ 云门宗"日日是好日"企业长青心法专题 + 虚云老和尚百年重兴文化史',
    '⑤ 国恩寺手植荔枝树下"家书时刻" + 基业长青圆桌(民宿星空夜话)',
    '全程配专业人文摄影师 · 24K 精修文化相册(100+张)。',
  ].join('\n');

  // ── 5. 逐日行程 (v3 重排: 广州→韶关单向推进, 住民宿, 小鸿团队主办) ──
  const itinerary = [
    {
      day: 1,
      title: '溯根 · 广州双庭至曹溪 (纯阳观 → 光孝寺 → 南华寺,夜宿曹溪旁民宿)',
      activities: [
        '07:00 小鸿团队专车在广州白云机场/广州南站接站(奔驰V级商务车)',
        '08:00 抵达越秀山·纯阳观 · 换中式文化服饰 · 岭南晨茶',
        '08:30 纯阳观开场文化导览(小鸿团队文化导师主讲)— 岭南全真道教建筑与园林美学',
        '09:30 吕祖殿晨课观摩 · 吕洞宾历史人物导读',
        '10:00 专题讲坛:《太上感应篇》与中国古代商道伦理 — 做企业的文化根基',
        '11:00 园林茶话:道家"谦受益、满招损"处世观与当代企业家心性修养',
        '12:00 岭南百年道家素斋午餐(小鸿团队安排)',
        '13:30 专车赴光孝寺 · 岭南第一古刹文化驻足',
        '14:00 光孝寺·菩提树下文化讲堂(六祖慧能证悟处历史场景还原)',
        '15:00 瘗发塔、大雄宝殿、六祖殿文化瞻仰 · 《坛经·行由品》实地精读',
        '16:00 专车启程赴韶关曲江(途中小鸿团队"基业长青的六个关键词"车上讲座)',
        '19:30 抵达曹溪 · 南华禅寺旁民宿 入住(曲江马坝曹溪畔)',
        '20:00 民宿庭院曹溪夜话·岭南素食晚宴',
        '21:00 小鸿团队主持"企业文化夜话"第一场:基业长青——从千年祖庭看百年企业',
        '22:30 曹溪星空独处 · 自省笔记',
      ],
      meals: [
        '午餐:纯阳观百年道家素斋(岭南非遗素食)',
        '晚餐:南华寺旁民宿·曹溪素食夜宴',
      ],
      accommodation: '南华禅寺旁民宿(曲江马坝·曹溪畔 · 禅意庭院房)',
    },
    {
      day: 2,
      title: '溯源 · 曹溪至六祖故里 (南华寺 → 云门寺 → 国恩寺,夜宿国恩寺旁民宿)',
      activities: [
        '06:00 南华禅寺晨钟观摩(民宿步行 5 分钟可达)',
        '07:00 南华寺早课文化观察 · 大雄宝殿、六祖真身殿历史瞻仰',
        '08:30 曹溪文化深度讲座(小鸿团队导师) —《坛经》心要与现代企业治理',
        '09:30 南华寺百年素斋早餐 · 抄经堂手抄《六祖偈》文化体验',
        '11:00 专车赴乳源·云门山大觉禅寺(途中"基业长青"随车讲座第二段)',
        '12:30 云门寺素斋午餐',
        '13:30 云门宗文化讲坛(小鸿团队主讲):',
        '       · 云门文偃"日日是好日"与企业长青心法',
        '       · 虚云老和尚百年重兴祖庭的文化启示',
        '       · 近代禅史一小时(虚云舍利塔前)',
        '15:30 专车赴云浮新兴·国恩寺(途中圆桌:六祖回归故里与"基业归根"意象)',
        '17:00 抵达国恩寺 · 毘卢宝塔文化讲坛(六祖回乡建寺历史还原)',
        '17:45 六祖手植荔枝树下"家书时刻" — 亲笔写一封家书,小鸿团队代寄',
        '18:30 国恩寺旁民宿 入住(新兴集成镇龙山麓)',
        '19:30 民宿庭院·岭南龙山竹宴',
        '20:30 "基业长青圆桌"第二场(小鸿团队主持) — 六位创始人深度对谈:',
        '       文化治理 · 品牌百年 · 家族传承 · 创始人心性修养',
        '22:00 新兴山村星空夜话 · 六祖故里告别',
      ],
      meals: [
        '早餐:南华寺百年素斋',
        '午餐:云门寺禅堂素斋',
        '晚餐:国恩寺旁民宿·岭南龙山竹宴(配家书仪式)',
      ],
      accommodation: '国恩寺旁民宿(新兴集成镇·龙山麓 · 岭南院落房)',
    },
  ];

  const included = [
    '小鸿团队 2 位文化导师全程陪同、全程主讲(中国传统文化研究方向)',
    '小鸿团队专属定制讲稿 · 《基业长青六讲》人手一册',
    '纯阳观岭南全真文化深度导览 + 《太上感应篇》与商道伦理专题',
    '光孝寺菩提树下文化讲堂 + 《坛经·行由品》实地精读',
    '南华禅寺曹溪禅源历史瞻仰 + 抄经堂《六祖偈》手抄体验',
    '云门山大觉禅寺云门宗文化讲坛 + 近代禅史一小时专题',
    '国恩寺六祖故里文化讲坛 + 手植荔枝树下"家书时刻"',
    '奔驰 V 级商务车 2 日 · 专职司机 · 广州至韶关至云浮单向推进',
    '南华禅寺旁民宿 1 晚(曲江马坝·曹溪畔禅意庭院房)',
    '国恩寺旁民宿 1 晚(新兴集成镇·龙山麓岭南院落房)',
    '寺观素斋 3 餐 + 岭南禅意晚宴 1 餐 + 国恩寺龙山竹宴 1 餐',
    '《六祖坛经》典藏本 + 岭南禅茶 + 青城道茶人文伴手礼三件套',
    '"家书时刻"文房四宝套装 + 国恩寺专属信封 + 代寄服务',
    '专业人文摄影师全程跟拍 · 24K 精修文化相册(100+张)',
    '两晚"基业长青圆桌"闭门夜话 · 小鸿团队主持',
    '广州机场/高铁站接站 · 行程结束民宿至附近高铁站/机场单程送达',
  ];

  const excluded = [
    '大交通(各地至广州往返机票/高铁票)',
    '个人消费(酒水、私人购物、额外贡献)',
    '行程外的自选文化参访(可预约另付)',
    '旅行保险(建议自行购买高端医疗险)',
    '随行家眷(本次闭门限6席,不接受陪同)',
    '未提及的自选娱乐项目',
  ];

  const tips = [
    '着装:深色中式或文化服饰(行程提供换装,请避纯白及过于休闲衣物)',
    '入寺观礼仪:不喧哗、不拍摄殿内神佛像、绕塔请顺时针',
    '第二天 06:00 晨钟观摩,建议前一晚 23:00 前入睡',
    '寺观内请以素食为主,尊重千年传统餐饮文化',
    '讲坛与诵读环节请心无旁骛,每场约 40-60 分钟',
    '民宿位于乡村,网络信号偶有不稳,建议暂离屏幕,沉入文化夜话',
    '素食过敏或忌口请提前 7 天告知小鸿团队',
    '岭南五月多雨,随身携带轻便雨具与防滑鞋',
    '摄影师全程跟拍,如有隐私要求请提前说明',
    '全程由小鸿团队文化导师随行答疑,请珍惜闭门游学机会',
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
    '曹溪畔民宿 · 禅意庭院',
    '手抄《六祖偈》体验',
    '国恩寺龙山竹宴',
    '基业长青圆桌夜话',
    '奔驰V级商务专车',
    '六席企业创始人同框',
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
    title: '基业长青 · 岭南文化游学之旅',
    titleEn: 'Lingnan Cultural Study Journey for Enterprise Legacy',
    subtitle: '2026年5月1-2日 · 小鸿团队企业文化定制 · 6席闭门圈层',
    category: RouteCategory.CROSS_CULTURAL,
    difficulty: RouteDifficulty.MODERATE,
    duration: 2,
    nights: 2,
    coverImage,
    images: finalImages,
    highlights,
    description,
    itinerary,
    priceFrom: 8800000, // ¥88,000 (分)
    included,
    excluded,
    tips,
    season: '2026年5月1-2日 · 农历三月十五/十六岭南文化双吉日 · 年度唯一档',
    groupSize: '限 6 席 · 企业创始人/传承人闭门圈层',
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

  // ── 9. RouteSite 绑定 (v3: Day1 三站 / Day2 两站 · 小鸿团队文化游学语言) ──
  console.log('\n[4] bind 5 RouteSite (v3 单向推进)...');
  const bindings = [
    { name: '纯阳观', day: 1, order: 1, duration: '3.5 小时', note: '岭南全真文化深度导览 · 《太上感应篇》与中国商道伦理专题(小鸿团队主讲)' },
    { name: '光孝寺', day: 1, order: 2, duration: '2 小时', note: '岭南第一古刹现场讲堂 · 菩提树下《坛经·行由品》文本精读(小鸿团队导读)' },
    { name: '南华禅寺', day: 1, order: 3, duration: '14 小时(含夜宿曹溪畔民宿)', note: '曹溪禅源祖庭历史瞻仰 · 夜宿寺旁民宿 · 基业长青第一场圆桌夜话' },
    { name: '云门山大觉禅寺', day: 2, order: 1, duration: '3 小时', note: '云门宗"日日是好日"企业长青心法 · 虚云老和尚百年重兴文化史(小鸿团队讲读)' },
    { name: '国恩寺', day: 2, order: 2, duration: '6 小时(含夜宿国恩寺畔民宿)', note: '六祖故里·《坛经》诞生地 · 家书时刻 · 夜宿岭南院落民宿 · 基业长青第二场圆桌' },
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
  console.log(`  ✅ DONE v3: slug=${ROUTE_SLUG}, bookCount=9999, 5 sites bound`);
  console.log(`     单向推进: Day1 纯阳观→光孝寺→南华寺(民宿夜宿) · Day2 云门寺→国恩寺(民宿夜宿)`);
  console.log(`     定位: 小鸿团队独立组织 · 企业文化 × 基业长青 · 个人/家庭/企业三维价值`);
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
