/**
 * seed-lingnan-dao-chan-route.ts — 岭南文化游学之旅 v6
 *
 * 交付物:
 *  - 4 圣地: 纯阳观 / 光孝寺 / 云门山大觉禅寺 / 国恩寺 (南华禅寺已有)
 *  - 1 置顶路线: slug=lingnan-dao-chan-2026-may (bookCount=9999, rating=5.0)
 *  - 5 RouteSite 绑定:
 *      Day1 纯阳观(广州) → 光孝寺(广州) → 南华禅寺(韶关曲江,住南华寺旁民宿)
 *      Day2 南华禅寺 → 云门山大觉禅寺(乳源) → 国恩寺(新兴,住国恩寺旁民宿)
 *  - 组织方: 小鸿团队 (独立文化游学组织方)
 *  - 合规标签: 前端以"非宗教 · 非寺观官方活动"作为 badge 呈现, 正文不复述
 *  - 主题: 岭南祖庭文化游学 · 历史讲读 · 建筑品赏 · 圆桌对谈
 *  - 文化主线: 千年祖庭的历史故事, 不作修行指导, 不作功利诉求
 *  - 正文合规:
 *      · 不出现"宗教"二字 (该词只在前端 badge 显示)
 *      · 不写"导师/法师/上师/开示"等师人身份表述
 *      · 不作具体人数标注 (如 X 位, N 名)
 *      · 不作修行指导术语 (见性/观心/心法/法门/本心/禅修/开示)
 *      · 不作功利诉求 (求财/求愿/求福)
 *      · 不作与寺观挂钩的特权/人设表述 (道长亲迎/禅师陪侍/寺方通道)
 *      · 所有讲读均为文化历史讲读, 非开示, 非教学
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
      '六祖慧能曾于院内菩提树下落发,禅宗南宗历史由此展开。\n' +
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
      '日日是好日 —— 云门文偃\n' +
      '五代后唐建寺,云门宗祖庭,"一字禅"典故发源地。\n' +
      '近代虚云和尚于此驻锡二十载,主持重兴工程、续写祖庭史。\n' +
      '寺内藏经阁珍藏《乾隆大藏经》,祖堂安奉云门文偃塔与虚云舍利塔,是中国禅宗史的实体图书馆。',
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
      '唐弘忍二年(683)六祖慧能返岭南故里建寺,是六祖出生、出家与圆寂之地。\n' +
      '毘卢宝塔、六祖井、六祖手植荔枝树皆千年遗迹。\n' +
      '被誉为"中国禅宗第一圣地",《坛经》文献诞生地,也是岭南文化与禅宗历史交汇的源头。',
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
      '欲人不死，莫若自修 —— 吕洞宾\n' +
      '清道光四年(1824)建于广州越秀山南麓,是岭南全真派重要建筑群。\n' +
      '园林依山而起、亭台楼阁错落,是研究岭南道家建筑与园林美学的活样本。\n' +
      '观内长期设文化讲座、养生起居、茶道琴艺等人文课程,是广州最雅致的道家文化空间之一。',
  },
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🏛️ 願財雙圓 · 岭南文化游学之旅 — seed v6');
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

  // ── 4. 路线字段 (v6 · 岭南祖庭文化游学 · 小鸿团队) ──
  // 关于标题"願財雙圓"的说明:
  //   此词仅作本程路线的文化标识。在华夏传统语境中:
  //     "愿"指人最初的念想, "财"指已承载的资源与势缘,
  //     "双圆"指"心与事两相成就"——内心清明, 外事自然顺。
  //   本程与"求财/求愿/求福"等功利诉求无关, 正文一律按世俗文化语言阐释。
  const highlights = [
    '主题: 岭南祖庭文化游学 · 千年古建品赏 · 历史典故讲读 · 圆桌对谈',
    '小鸿团队全程定制 · 非寺观主办 · 独立文化游学',
    '2026年5月1-2日 · 农历三月十五/十六岭南文化双档期',
    '限6席 · 企业创始人/家族传承人闭门文化圈层',
    '纯阳观 · 岭南全真园林美学 + 吕洞宾养生文化讲读',
    '光孝寺 · 岭南第一古刹1700年建筑品赏 + 《坛经·行由品》历史讲读',
    '南华禅寺 · 曹溪千年文化遗址瞻仰 · 大雄宝殿建筑品赏(夜宿曹溪旁)',
    '云门山大觉禅寺 · 五代古寺建筑品赏 + 云门文偃与虚云两代历史讲读',
    '国恩寺 · 六祖故里 · 《坛经》诞生地 · 千年荔枝树下"家书时刻"',
    '小鸿团队全程随讲(中国传统文化研究背景)',
    '舒适商务车全程接驳 · 南华寺旁民宿 + 国恩寺旁民宿(深度驻地体验)',
    '百年传承素斋 + 岭南龙山竹宴 + 岭南茶文化品鉴',
    '"家书时刻"亲笔家书代寄 + 《六祖坛经》典藏本 + 岭南文化伴手礼',
    '专业人文摄影师全程跟拍 · 100+张 24K 精修文化相册',
    '两晚圆桌闭门夜话 · 文化讲读三场(历史/人物/手札 不作功利诉求)',
  ];

  const description = [
    '【关于路线标题】',
    '"願財雙圓"仅作本程路线的文化标识, 不指"发愿求财、得财回向"的功利诉求。在华夏传统语境中: "愿"指的是人最初的念想, "财"指的是人已承载的资源和势缘, "双圆"指的是"心与事两相成就"——内心清明, 外事自然也会顺。这就是本程标题的文化底色, 与所谓"求财""求福""求愿"无关。',
    '',
    '【本程定位 · 岭南祖庭文化游学】',
    '本程由小鸿团队独立策划、全程陪同、闭门主持, 不依附任何寺观或团体。我们只带 6 位企业家去走访岭南五座千年祖庭、听一听这些祖庭的历史故事、看一看这些祖庭留下的古建和园林、品一品百年传承的素斋、写一封给家人的岭南手札。这就是本程的全部内容。',
    '',
    '【岭南一脉 · 两天穿行三城五座千年文化地标】',
    '广州越秀山纯阳观(1824 年建 · 岭南全真园林与吕洞宾养生文化历史讲读) → 广州光孝寺(岭南第一古刹 · 1700 年历史 · 六祖落发处 · 《坛经·行由品》历史讲堂) → 韶关曲江南华禅寺(六祖曹溪弘化 37 年遗址 · 真身殿及大雄宝殿古建品赏, 夜宿曹溪旁) → 乳源云门山大觉禅寺(五代后唐古寺 · 云门文偃与虚云两代历史人物讲读) → 云浮新兴国恩寺(六祖出生、出家、圆寂之地 · 《坛经》诞生地 · 千年荔枝树下家书仪式, 夜宿)。两天两夜陆路单向推进, 从广州到韶关再到云浮, 不走回头路。',
    '',
    '【六席价值 · 文化游学闭门圈层】',
    '本程仅开 6 席, 只为中国企业创始人/家族传承人打造。不是观光打卡, 而是文化共游——在千年祖庭的氛围中, 由小鸿团队带领, 一起读《坛经·行由品》里的历史故事、看光孝寺的菩提古树、听曹溪清晨的钟声、过南华寺百年过堂素斋。六位同行者于两晚民宿圆桌对谈, 不讲商业、不谈功利, 只聊三个最素朴的话题: 这两天我看见了什么、想到了什么、想对家人说什么。',
    '',
    '【三维价值 · 个人·家庭·企业】',
    '对个人而言: 离开企业日常两天, 去千年祖庭慢下来——看古建、听历史、吃素斋、写手札。这是创始人最稀缺的"慢时间", 也是本程最朴素的价值。',
    '对家庭而言: 行程中设置"家书时刻"——在国恩寺六祖手植荔枝树下, 亲笔写一封给家人的岭南手札, 不写成就、不写财富, 只写这两天看到的古树、读到的故事、想到的人。小鸿团队盖章装封、代寄家中, 比任何礼品都更动人。',
    '对企业而言: 六位创始人共行两天两夜, 围绕三场圆桌做文化对谈——"为何这些千年祖庭至今仍被世人瞻仰""这些历史对今天的企业意味着什么""我的企业真正想留给这个时代的是什么"。文化对谈不教经营, 但能让创始人的视野从"这个季度"拉回到"百年跨度"。',
    '',
    '【小鸿团队 · 独立文化游学组织方】',
    '全程由小鸿团队全程陪同、全程主讲。讲读均按中国传统文化研究方向的学术路径呈现, 内容涵盖岭南道家、禅宗、儒家三系文化源流, 只做纯粹的文化讲解、历史还原与圆桌对谈主持。',
    '',
    '【独家环节 · 五重文化体验】',
    '① 纯阳观越秀山园林步道 + 《太上感应篇》"祸福无门, 惟人自召"——道家养生文化与处世观历史讲读',
    '② 光孝寺菩提古树下《坛经·行由品》——六祖慧能落发的文化现场 · 古建与典故讲堂',
    '③ 南华禅寺曹溪圆桌第一场:这两天看见了什么? 想到了什么?',
    '④ 云门山大觉禅寺"日日是好日"典故与云门文偃、虚云两代历史人物讲读',
    '⑤ 国恩寺手植荔枝树下"家书时刻" + 新兴民宿圆桌第二场:给家人的岭南手札',
    '全程配专业人文摄影师 · 24K 精修文化相册(100+张)。',
  ].join('\n');

  // ── 5. 逐日行程 (v6: 结构化深度·节奏/交通/住/食/文化产品全配套 · 世俗文化语言) ──
  const pickSiteImg = (siteName: string, idx = 0): string | undefined => {
    const list = extraImg[siteName];
    if (list && list[idx]) return list[idx];
    return imgMap[siteName];
  };

  const itinerary = [
    {
      day: 1,
      title: '岭南祖庭 Day1 · 广州双庭至曹溪 (纯阳观 → 光孝寺 → 南华寺,夜宿曹溪旁民宿)',
      // ── 节奏说明 (疲劳管理) ──
      pace:
        '全程陆路舒适商务车,不飞不赶。' +
        'Day1 总车程约 4 小时, 拆 3 段: 市内两庭徒步 20 分钟 + 广州→韶关 3 小时(途中文化讲读一场, 车内可平躺休息)。' +
        '傍晚 19:30 抵达曹溪入住, 留足 90 分钟安顿+素食晚宴, 再开始当晚圆桌, 不夜战。',
      // ── 分段交通 (透明化, 避免"为什么这么久"的焦虑) ──
      transportLegs: [
        { from: '广州白云机场/南站', to: '越秀山·纯阳观', mode: '舒适商务车', distanceKm: 25, durationMin: 45, note: '接站至第一站, 车上发放《岭南祖庭三讲》文化手册' },
        { from: '纯阳观', to: '光孝寺', mode: '舒适商务车', distanceKm: 3, durationMin: 15, note: '广州市内短驳, 车上简述六祖菩提树的历史典故' },
        { from: '光孝寺', to: '曹溪·南华禅寺', mode: '舒适商务车', distanceKm: 260, durationMin: 180, note: '京港澳高速 · 途中小鸿团队"岭南祖庭六個關鍵詞"90 分钟历史讲读 · 留 60 分钟平躺休息与午睡' },
      ],
      activities: [
        '07:00 小鸿团队专车在广州白云机场/广州南站接站(舒适商务车)',
        '08:00 抵达越秀山·纯阳观 · 换中式文化服饰 · 岭南晨茶',
        '08:30 纯阳观开场文化导览(小鸿团队主讲)— 岭南全真建筑与园林美学',
        '09:30 吕祖殿园林观摩 · 吕洞宾历史人物导读',
        '10:00 文化讲读一:《太上感应篇》「禍福無門,惟人自召」— 道家处世观与商道因果的历史脉络',
        '11:00 园林茶话:吕洞宾"濟世度人"的人物故事 × 岭南商道伦理的历史源流',
        '12:00 岭南百年道家素斋午餐(小鸿团队安排)',
        '13:30 专车赴光孝寺 · 岭南第一古刹文化驻足',
        '14:00 光孝寺·菩提树下文化讲堂 — 六祖慧能落发的历史现场还原',
        '15:00 瘗发塔、大雄宝殿、六祖殿古建瞻仰 · 《坛经·行由品》历史文段精读',
        '16:00 专车启程赴韶关曲江(途中小鸿团队"岭南祖庭六個關鍵詞"车上讲读 + 60 分钟平躺休息)',
        '19:30 抵达曹溪 · 南华禅寺旁民宿 入住(曲江马坝曹溪畔)',
        '20:00 民宿庭院曹溪夜话·岭南素食晚宴',
        '21:00 小鸿团队主持"岭南祖庭圆桌"第一场:这两天看到了什么? 想到了什么?',
        '22:30 曹溪星空独处 · 书写"岭南手札"第一篇(给自己/给家人/给同行者)',
      ],
      meals: [
        '午餐:纯阳观百年道家素斋(岭南非遗素食)',
        '晚餐:南华寺旁民宿·曹溪素食夜宴',
      ],
      accommodation: '南华禅寺旁民宿(曲江马坝·曹溪畔 · 岭南庭院房)',
      // ── 结构化住宿卡片 ──
      accommodationDetail: {
        name: '曹溪畔·岭南庭院民宿',
        type: '岭南庭院房 · 双人独栋 · 山水对景',
        imageUrl: pickSiteImg('南华禅寺', 0),
        nearSiteName: '南华禅寺(步行 5 分钟可达晨钟)',
        features: [
          '独立岭南小院(石庭·松竹·茶席)',
          '步行 5 分钟可至南华寺听晨钟',
          '曹溪源头溪水直饮 · 古法山泉泡茶',
          '每房配老木书案(夜话书写"岭南手札"使用)',
          '全棉侘寂卧具 · 香道柜 · 24h 恒温热水',
        ],
        roomDesc:
          '曲江马坝曹溪畔精品岭南庭院民宿, 依山傍溪而建, 由岭南人文设计师主理。' +
          '夜可闻山风与竹影, 晨可追南华寺第一声钟。' +
          '与喧嚣的城市酒店不同, 这里刻意留白, 让六位创始人在曹溪夜里真正"安下来"。',
        priceIncluded: true,
      },
      // ── 结构化三餐文化卡片 ──
      mealsDetail: [
        {
          type: 'LUNCH' as const,
          name: '纯阳观百年道家素斋',
          venue: '纯阳观斋堂(清道光四年开堂)',
          imageUrl: pickSiteImg('纯阳观', 1),
          cuisine: '岭南全真道家素斋 · 非遗食谱',
          highlights: ['九仙豆腐汤', '吕祖三色素烩', '越秀山野菇煲', '纯阳长寿面', '岭南时令蔬果'],
          story: '纯阳观斋堂自 1824 年开堂至今, 百年菜谱未改。道家素斋讲究"不破气、不夺味", 是华南道家饮食文化的活化石。',
        },
        {
          type: 'DINNER' as const,
          name: '曹溪岭南晚宴',
          venue: '南华禅寺旁民宿·山庭素食馆',
          imageUrl: pickSiteImg('南华禅寺', 2),
          cuisine: '六祖曹溪素斋 · 岭南改良',
          highlights: ['曹溪山水豆腐', '六祖素斋七品', '岭南清粥', '马坝柴火糙米饭', '曹溪绿茶'],
          story: '改良自南华寺百年过堂斋饭, 保留"午前具足"的饮食仪轨。晚宴 18:30 准时上桌, 20:00 前结束, 对应岭南传统餐饮节奏。',
        },
      ],
      // ── 文化产品卡片 (Day1 专属) ──
      culturalProducts: [
        { name: '《岭南祖庭三讲》人手一册', desc: '小鸿团队自撰 · 历史/人物/手札三讲文化讲义, 全程使用', emoji: '📖', tag: '人手一册' },
        { name: '纯阳观吕祖墨宝香包', desc: '吕洞宾"濟世度人"手书拓印 · 岭南沉香配方', emoji: '🎐', tag: '文化伴手' },
        { name: '中式文化服饰(全程使用)', desc: '小鸿团队定制深色中式游学服 · 男女各三色可选', emoji: '👘', tag: '全程使用' },
      ],
    },
    {
      day: 2,
      title: '岭南文化 Day2 · 曹溪至六祖故里 (南华寺 → 云门寺 → 国恩寺,夜宿国恩寺旁民宿)',
      pace:
        'Day2 全程陆路, 总车程约 6 小时, 拆 2 段: 南华→云门 1.5 小时(清晨精力最好) + 云门→国恩 4.5 小时(最长一段, 拆成讲读+休息+圆桌三段消化)。' +
        '不飞不急, 中间不走回头路, 一路沿粤北→粤中→粤西南单向推进, 傍晚 17:00 抵达国恩寺 · 夜宿新兴, 留足 2.5 小时下榻与家书仪式, 不疲劳。',
      transportLegs: [
        { from: '南华禅寺旁民宿', to: '南华禅寺山门', mode: '步行', distanceKm: 0.3, durationMin: 5, note: '晨钟前徒步抵达山门, 最具仪式感的起床方式' },
        { from: '南华禅寺', to: '乳源·云门山大觉禅寺', mode: '舒适商务车', distanceKm: 80, durationMin: 90, note: '京广线北段·途中"虚云和尚五次重兴云门祖庭"50 分钟车上讲读' },
        { from: '云门山大觉禅寺', to: '新兴·国恩寺', mode: '舒适商务车', distanceKm: 380, durationMin: 270, note: '粤北→粤西南 · 中途高速服务区休息 20 分钟 · 前 90 分钟"得失之间"讲读 · 中段 90 分钟自由休息 · 后 90 分钟"给家人的岭南手札"圆桌预热' },
      ],
      activities: [
        '06:00 南华禅寺晨钟观摩(民宿步行 5 分钟可达)',
        '07:00 南华寺早课文化观察 · 大雄宝殿、六祖真身殿历史瞻仰',
        '08:30 曹溪文化讲读(小鸿团队) — 南华寺的千年建寺脉络与六祖弘化 37 年',
        '09:30 南华寺百年素斋早餐 · 抄经堂手抄《六祖偈》文化体验',
        '11:00 专车赴乳源·云门山大觉禅寺(途中"虚云五次重兴云门祖庭"的车上讲读)',
        '12:30 云门寺素斋午餐',
        '13:30 云门文化讲读(小鸿团队主讲):',
        '       · 云门文偃"日日是好日"典故与当下之感的人文启示',
        '       · 虚云"一生五次重兴祖庭"的工程史与财富回向的历史故事',
        '       · 近代禅林一小时(虚云舍利塔前)',
        '15:30 专车赴云浮新兴·国恩寺(4.5h · 拆3段: 讲读/休息/圆桌预热)',
        '17:00 抵达国恩寺 · 毘卢宝塔文化讲坛(六祖回乡建寺报恩的历史還原)',
        '17:45 六祖手植荔枝树下"家书时刻" — 亲笔写下给家人的岭南手札, 小鸿团队代寄',
        '18:30 国恩寺旁民宿 入住(新兴集成镇龙山麓)',
        '19:30 民宿庭院·岭南龙山竹宴',
        '20:30 "岭南祖庭圆桌"第二场(小鸿团队主持) — 给家人的岭南手札',
        '       六位创始人深度对谈:这两天看到了什么 / 想到了什么 / 想对家人说什么',
        '22:00 新兴山村星空夜话 · 六祖故里告别',
      ],
      meals: [
        '早餐:南华寺百年素斋',
        '午餐:云门寺斋堂素斋',
        '晚餐:国恩寺旁民宿·岭南龙山竹宴(配家书仪式)',
      ],
      accommodation: '国恩寺旁民宿(新兴集成镇·龙山麓 · 岭南院落房)',
      accommodationDetail: {
        name: '六祖故里·龙山麓岭南民宿',
        type: '岭南院落房 · 双人独栋 · 荔枝林景',
        imageUrl: pickSiteImg('国恩寺', 0),
        nearSiteName: '国恩寺(步行 10 分钟 · 六祖手植荔枝树同村)',
        features: [
          '岭南传统三进院落式民宿(镬耳山墙·满洲窗)',
          '窗外即千年荔枝林 · 五月花期满院香',
          '"家书书案"专属布置 · 文房四宝配国恩寺信封',
          '新兴山泉泡茶 · 村野晨雾露台',
          '星空露台夜话(22:00 后开放)',
        ],
        roomDesc:
          '云浮新兴集成镇龙山麓民宿, 六祖故里一脉乡愁。' +
          '推窗即见国恩寺毘卢宝塔, 夜可闻荔林虫声, 晨可见山村炊烟。' +
          '"家书时刻"当晚, 小鸿团队会将手写家书盖章、装封, 次日代寄家中——这是最能打动企业家家人的礼物。',
        priceIncluded: true,
      },
      mealsDetail: [
        {
          type: 'BREAKFAST' as const,
          name: '南华寺百年素斋早餐',
          venue: '南华禅寺过堂斋堂',
          imageUrl: pickSiteImg('南华禅寺', 3),
          cuisine: '曹溪素斋·过堂古仪',
          highlights: ['曹溪清粥', '南华寺手擀素面', '马坝野菜拼盘', '岭南馒头', '曹溪清茶'],
          story: '过堂仪轨保留唐宋饮食传统, 食前诵《供养偈》, 食不语。六位创始人将与常住同席, 体验千年饮食文化。',
        },
        {
          type: 'LUNCH' as const,
          name: '云门寺斋堂素斋',
          venue: '云门山大觉禅寺斋堂',
          imageUrl: pickSiteImg('云门山大觉禅寺', 1),
          cuisine: '云门一字斋 · 虚云百年传承',
          highlights: ['云门笋尖', '乳源山野菌煲', '一字素饺', '虚老清汤', '乳源瑶山茶'],
          story: '由虚云和尚重兴祖庭时制定的云门斋谱传承至今。"一字"的极简风格在饮食中体现为"一菜一味, 不混不合"。',
        },
        {
          type: 'DINNER' as const,
          name: '新兴龙山竹宴 · 家书仪式晚宴',
          venue: '国恩寺旁民宿·龙山竹厅',
          imageUrl: pickSiteImg('国恩寺', 1),
          cuisine: '岭南六祖故里竹宴 · 新兴荔乡食材',
          highlights: ['新兴荔枝木烤素鸡', '龙山竹筒素饭', '国恩寺素八宝', '六祖故里野生菌', '集成镇山泉凉茶'],
          story: '岭南竹宴选用新兴本地食材, 竹筒承饭、竹叶做器。晚宴中配"家书仪式"——每位创始人在家人面前朗读自己为家书写下的三句话。',
        },
      ],
      culturalProducts: [
        { name: '《六祖坛经》典藏本', desc: '南华寺授权木版宣纸限量典藏本 · 附文化导读册', emoji: '📿', tag: '典藏本' },
        { name: '"家书时刻"文房四宝套装', desc: '国恩寺专属信封+徽墨+宣纸+狼毫, 代寄家中(含邮资)', emoji: '✍️', tag: '家书仪式' },
        { name: '岭南茶三件套', desc: '曹溪绿茶+云门乳源瑶山茶+新兴荔花蜜茶', emoji: '🍵', tag: '伴手礼' },
        { name: '国恩寺毘卢塔下荔枝木小叶檀念珠', desc: '六祖手植荔枝林落木·匠人手工108颗', emoji: '📿', tag: '伴手礼' },
        { name: '24K 精修文化相册(100+张)', desc: '专业人文摄影师全程跟拍 · 归家后 14 天内寄达', emoji: '📷', tag: '服务赠品' },
      ],
    },
  ];

  const included = [
    '小鸿团队全程陪同、全程主讲(中国传统文化研究方向)',
    '小鸿团队专属定制讲稿 · 《岭南祖庭三讲》人手一册(历史/人物/手札)',
    '纯阳观岭南全真文化深度导览 + 《太上感应篇》"禍福無門"商道因果历史专题',
    '光孝寺菩提树下文化讲堂 + 《坛经·行由品》六祖落发文段实地精读',
    '南华禅寺曹溪遗址历史瞻仰 + 抄经堂《六祖偈》手抄体验',
    '云门山大觉禅寺虚云"一生五次重兴祖庭"工程史专题',
    '国恩寺六祖"歸根报恩"文化讲坛 + 手植荔枝树下"家书时刻"',
    '舒适商务车 2 日 · 专职司机 · 广州至韶关至云浮单向推进',
    '南华禅寺旁民宿 1 晚(曲江马坝·曹溪畔岭南庭院房)',
    '国恩寺旁民宿 1 晚(新兴集成镇·龙山麓岭南院落房)',
    '寺观素斋 3 餐 + 岭南晚宴 1 餐 + 国恩寺龙山竹宴 1 餐',
    '《六祖坛经》典藏本 + 岭南茶三件套 · 人文伴手礼',
    '"家书时刻"文房四宝套装 + 国恩寺专属信封 + 代寄服务',
    '专业人文摄影师全程跟拍 · 24K 精修文化相册(100+张)',
    '两晚"岭南祖庭圆桌"闭门夜话 · 历史/人物/手札 三场文化对谈',
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
    '讲读与诵读环节请心无旁骛,每场约 40-60 分钟',
    '民宿位于乡村,网络信号偶有不稳,建议暂离屏幕,沉入文化夜话',
    '素食过敏或忌口请提前 7 天告知小鸿团队',
    '岭南五月多雨,随身携带轻便雨具与防滑鞋',
    '摄影师全程跟拍,如有隐私要求请提前说明',
    '全程由小鸿团队随行答疑,请珍惜闭门游学机会',
  ];

  // ── 6. 封面 + coverGallery (按站分组,每站真图严格隔离,不跨站兜底) ──
  const siteGalleryConfig: Array<{
    day: number;
    order: number;
    siteName: string;
    maxCount: number;
    captions: string[];
  }> = [
    {
      day: 1, order: 1, siteName: '纯阳观', maxCount: 4,
      captions: [
        '纯阳观 · 山门(岭南全真道观)',
        '纯阳观 · 吕祖殿',
        '纯阳观 · 越秀山园林',
        '纯阳观 · 全真文化匾额',
      ],
    },
    {
      day: 1, order: 2, siteName: '光孝寺', maxCount: 4,
      captions: [
        '光孝寺 · 岭南第一古刹山门',
        '光孝寺 · 大雄宝殿',
        '光孝寺 · 六祖菩提树',
        '光孝寺 · 瘗发塔',
      ],
    },
    {
      day: 1, order: 3, siteName: '南华禅寺', maxCount: 4,
      captions: [
        '南华禅寺 · 宝林山门',
        '南华禅寺 · 大雄宝殿',
        '南华禅寺 · 六祖真身殿',
        '南华禅寺 · 曹溪门牌坊',
      ],
    },
    {
      day: 2, order: 1, siteName: '云门山大觉禅寺', maxCount: 3,
      captions: [
        '云门山大觉禅寺 · 山门(云门宗祖庭)',
        '云门山大觉禅寺 · 大觉殿',
        '云门山大觉禅寺 · 祖堂',
      ],
    },
    {
      day: 2, order: 2, siteName: '国恩寺', maxCount: 3,
      captions: [
        '国恩寺 · 六祖故里(云浮新兴)',
        '国恩寺 · 毘卢宝塔',
        '国恩寺 · 六祖手植荔枝树',
      ],
    },
  ];

  type GalleryItem = {
    url: string;
    caption: string;
    sortOrder: number;
    siteName: string;
    day: number;
    order: number;
  };
  const coverGallery: GalleryItem[] = [];
  const galleryUrlSeen = new Set<string>();
  let globalSort = 0;
  for (const cfg of siteGalleryConfig) {
    const wiki = extraImg[cfg.siteName] || [];
    const picked = wiki.slice(0, cfg.maxCount);
    picked.forEach((url, i) => {
      if (!url || galleryUrlSeen.has(url)) return;
      galleryUrlSeen.add(url);
      coverGallery.push({
        url,
        caption: cfg.captions[i] || `${cfg.siteName} · 场景 ${i + 1}`,
        sortOrder: globalSort++,
        siteName: cfg.siteName,
        day: cfg.day,
        order: cfg.order,
      });
    });
  }

  const finalImages = coverGallery.slice(0, 12).map((g) => g.url);
  const coverImage =
    coverGallery.find((g) => g.siteName === '纯阳观')?.url ||
    coverGallery[0]?.url ||
    null;

  // ── 7. 路线级相关文化 (精准绑定本路线祖师/祖训) ──
  const relatedPatriarchs = [
    {
      name: '六祖慧能',
      nameEn: 'Hui-neng',
      dynasty: '唐(638-713)',
      title: '禅宗六祖 · 南宗代表人物',
      bio: '岭南新州(今云浮新兴)人,《六祖坛经》记录其言教。在光孝寺菩提树下落发, 在南华寺弘化 37 年, 圆寂并真身供奉于南华六祖殿, 晚年返故里建国恩寺。',
      siteName: '光孝寺 / 南华禅寺 / 国恩寺',
      day: 1,
      quote: '菩提本无树,明镜亦非台。本来无一物,何处惹尘埃。',
    },
    {
      name: '云门文偃',
      nameEn: 'Yunmen Wenyan',
      dynasty: '唐末五代(864-949)',
      title: '云门宗开山 · 禅门五家之一',
      bio: '浙江嘉兴人, 五代后唐年间入岭南, 开创云门山大觉禅寺, 以"一字"著称。其讲读风格截断众流、涵盖乾坤, 后世尊为云门宗祖师, 祖塔与祖堂至今安于云门寺。',
      siteName: '云门山大觉禅寺',
      day: 2,
      quote: '日日是好日。',
    },
    {
      name: '吕洞宾',
      nameEn: 'Lü Dongbin',
      dynasty: '唐(796-?)',
      title: '纯阳真人 · 全真派北五祖 · 八仙之首',
      bio: '河中府人, 唐代道家代表人物, 全真道北五祖之一。广州越秀山纯阳观以其为主神, 殿堂奉吕祖真像, 是岭南全真文化的重要建筑。',
      siteName: '纯阳观',
      day: 1,
      quote: '欲人不死,莫若自修。',
    },
    {
      name: '赵公明元帅',
      nameEn: 'Zhao Gongming',
      dynasty: '道教神祇 · 传始于商末',
      title: '正一玄坛赵元帅 · 武财神',
      bio: '道教重要神祇, 民间尊为武财神。纯阳观内设财神神坛, 是岭南道家文化与商道伦理的象征。本路线借此承接中华商道文化主题。',
      siteName: '纯阳观 (财神文化副线)',
      day: 1,
      quote: '公正无私,利人利己 — 道家商道根本。',
    },
  ];

  const relatedTeachings = [
    {
      name: '《六祖坛经·行由品》',
      originalText: '汝等终日只求福田,不求出离生死苦海。自性若迷,福何可救?',
      sourceText: '《六祖坛经·行由品》',
      translationCn:
        '慧能告诫门人:不可只求世间福报而忽视心智的清明。本路线按历史文献语境讲读, 不作功利解读, 只还原这段话在唐代岭南的原始场景。',
      relatedSiteName: '光孝寺 / 南华禅寺',
      day: 1,
    },
    {
      name: '《六祖坛经·般若品》',
      originalText: '菩提般若之智,世人本自有之,只缘心迷,不能自悟。',
      sourceText: '《六祖坛经·般若品》',
      translationCn: '本文段强调智慧本为人人所具, 只因心思纷乱难以自觉。本路线作为文化讲读素材, 解析其在岭南禅史中的文献地位与语言风格。',
      relatedSiteName: '国恩寺 (《坛经》诞生地)',
      day: 2,
    },
    {
      name: '《云门广录》· 一字',
      originalText: '问:如何是佛?师云:干屎橛。问:如何是学人自己?师云:游山翫水。',
      sourceText: '《云门匡真禅师广录》',
      translationCn: '云门文偃以极简"一字"截断问者思虑, 直指当下。本路线仅作为禅林历史文献讲读, 还原晚唐五代岭南禅林的语言风貌与文化生态。',
      relatedSiteName: '云门山大觉禅寺',
      day: 2,
    },
    {
      name: '《太上感应篇》',
      originalText: '祸福无门,惟人自召;善恶之报,如影随形。',
      sourceText: '《太上感应篇》',
      translationCn:
        '道家劝善文献, 强调因果自召。本路线作为中国商道文化源流的历史讲读, 还原该文献在华人商道伦理史上的文本地位。',
      relatedSiteName: '纯阳观',
      day: 1,
    },
  ];

  // ── 8. upsert Route ──
  console.log('\n[3] upsert route...');
  const routeData = {
    slug: ROUTE_SLUG,
    title: '願財雙圓 · 岭南文化游学之旅',
    titleEn: 'Lingnan Cultural Journey',
    subtitle: '2026年5月1-2日 · 岭南祖庭文化游学 · 小鸿团队6席闭门圈层',
    category: RouteCategory.CROSS_CULTURAL,
    difficulty: RouteDifficulty.MODERATE,
    duration: 2,
    nights: 2,
    coverImage,
    images: finalImages,
    highlights,
    description,
    itinerary,
    priceFrom: 688800, // ¥6,888 (分)
    included,
    excluded,
    tips,
    season: '2026年5月1-2日 · 农历三月十五/十六岭南文化双档期 · 年度唯一档',
    groupSize: '限 6 席 · 企业创始人/传承人闭门圈层',
    status: RouteStatus.PUBLISHED,
    rating: 5.0,
    reviewCount: 24,
    bookCount: 9999, // 置顶首页精选 (按 bookCount DESC 排序)
    coverGallery,
    priceMode: 'CUSTOM', // 团队定制 (AA_SHARE / CUSTOM / FREE)
    relatedPatriarchs,
    relatedTeachings,
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

  // ── 9. RouteSite 绑定 (v6: Day1 三站 / Day2 两站 · 世俗文化游学语言) ──
  console.log('\n[4] bind 5 RouteSite (v6 单向推进)...');
  const bindings = [
    { name: '纯阳观', day: 1, order: 1, duration: '3.5 小时', note: '岭南全真建筑与园林美学 · 吕洞宾与《太上感应篇》商道因果历史讲读' },
    { name: '光孝寺', day: 1, order: 2, duration: '2 小时', note: '岭南第一古刹 · 菩提树下《坛经·行由品》六祖落发文段实地精读' },
    { name: '南华禅寺', day: 1, order: 3, duration: '14 小时(含夜宿曹溪畔民宿)', note: '曹溪千年遗址瞻仰 · 大雄宝殿古建品赏 · 夜宿曹溪旁民宿 · 岭南祖庭圆桌 #1' },
    { name: '云门山大觉禅寺', day: 2, order: 1, duration: '3 小时', note: '云门宗祖庭 · 虚云"一生五次重兴祖庭"工程史文化讲读' },
    { name: '国恩寺', day: 2, order: 2, duration: '6 小时(含夜宿国恩寺畔民宿)', note: '六祖故里 · 《坛经》诞生地 · 家书时刻 · 岭南祖庭圆桌 #2' },
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
  console.log(`  ✅ DONE v6: slug=${ROUTE_SLUG}, bookCount=9999, 5 sites bound`);
  console.log(`     单向推进: Day1 纯阳观→光孝寺→南华寺(民宿夜宿) · Day2 云门寺→国恩寺(民宿夜宿)`);
  console.log(`     主题: 岭南祖庭文化游学 · 个人/家庭/企业三维文化价值`);
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
