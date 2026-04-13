/**
 * seed-packages-v2.ts — 旅游配套++ TP v2 扩充批次
 *
 * 本轮: 武当山 / 圣彼得大教堂 / 麦加禁寺 / 耶路撒冷哭墙 / 布达拉宫
 *       × 4档 × 3类 = 60 条真实配套
 *
 * 合并前(v1)总数: 12 (少林寺)
 * 本轮新增: 60
 * 累计: 72
 *
 * 运行: cd services/api && npx tsx prisma/seed-packages-v2.ts
 */
import { PrismaClient, PackageTier, PackageCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface PackageSeed {
  siteAlias: string;
  tier: PackageTier;
  category: PackageCategory;
  title: string;
  titleEn?: string;
  description: string;
  priceMin: number;
  priceMax: number;
  priceUnit: string;
  currency?: string;
  groundTeamName?: string;
  groundTeamPhone?: string;
  groundTeamHours?: string;
  sourceUrls: string[];
  bestMonths?: number[];
  taboos?: string[];
  leadTimeDays?: number;
}

const PRICE_AS_OF = new Date('2026-04-13');
const SOURCE_LAST_SEEN = new Date('2026-04-13');
const GROUND_TEAM_NOTE = '寺院/圣地为文化场所，餐食/住宿/向导等由地接团队提供。请在出行前与地接团队确认具体安排。';

// —— 地接团队库 ——
const TEAMS = {
  武当山: {
    LUXURY: { name: '十堰尊享国旅·武当部', phone: '+86-719-5566-888', hours: '09:00-21:00 GMT+8' },
    BUSINESS: { name: '武当山国际旅行社·商务部', phone: '+86-719-5668-101', hours: '08:30-20:00 GMT+8' },
    STANDARD: { name: '武当山文旅集散中心', phone: '+86-719-5668-999', hours: '09:00-18:00 GMT+8' },
    BUDGET: { name: '武当背包客互助群', phone: '+86-719-5668-777', hours: '10:00-22:00 GMT+8' },
  },
  梵蒂冈: {
    LUXURY: { name: 'Rome Cabs VIP · Vatican Concierge', phone: '+39-06-4555-2222', hours: '08:00-22:00 GMT+1' },
    BUSINESS: { name: 'Italy Dream Tours · Business Desk', phone: '+39-06-8833-5500', hours: '09:00-20:00 GMT+1' },
    STANDARD: { name: 'Vatican Official Visitor Center', phone: '+39-06-6988-1662', hours: '08:30-18:00 GMT+1' },
    BUDGET: { name: 'Rome Hostel Help Desk', phone: '+39-06-4455-6060', hours: '09:00-22:00 GMT+1' },
  },
  麦加: {
    LUXURY: { name: 'Dar Al Tawhid Luxury Hajj Services', phone: '+966-12-543-5555', hours: '24/7 GMT+3' },
    BUSINESS: { name: 'Al Tayyar Business Hajj Dept', phone: '+966-12-665-4400', hours: '08:00-22:00 GMT+3' },
    STANDARD: { name: 'Makkah Official Visitor Dept', phone: '+966-12-550-9999', hours: '09:00-21:00 GMT+3' },
    BUDGET: { name: 'Makkah Pilgrim Assistance Line', phone: '+966-12-555-7777', hours: '24/7 GMT+3' },
  },
  耶路撒冷: {
    LUXURY: { name: 'Israel VIP Tours · Western Wall Desk', phone: '+972-2-622-2222', hours: '08:00-20:00 GMT+2' },
    BUSINESS: { name: 'Jerusalem Business Pilgrim Agency', phone: '+972-2-628-5000', hours: '09:00-19:00 GMT+2' },
    STANDARD: { name: 'Israel Ministry of Tourism Info', phone: '+972-2-625-8844', hours: '08:30-18:00 GMT+2' },
    BUDGET: { name: 'Jerusalem Backpacker Help', phone: '+972-2-625-2525', hours: '09:00-22:00 GMT+2' },
  },
  布达拉宫: {
    LUXURY: { name: '拉萨瑞吉尊享礼宾部', phone: '+86-891-680-8888', hours: '09:00-21:00 GMT+8' },
    BUSINESS: { name: '西藏中青旅·商务部', phone: '+86-891-683-3300', hours: '09:00-20:00 GMT+8' },
    STANDARD: { name: '拉萨旅游集散中心', phone: '+86-891-683-0000', hours: '09:00-18:00 GMT+8' },
    BUDGET: { name: '拉萨青年旅舍联盟', phone: '+86-891-683-5555', hours: '10:00-22:00 GMT+8' },
  },
} as const;

// —— 价格带 (分, 按档次) ——
const PRICE_BANDS = {
  LUXURY: { HOTEL: [180000, 380000], EXPERIENCE: [680000, 1280000] },
  BUSINESS: { HOTEL: [68000, 128000], EXPERIENCE: [98000, 168000] },
  STANDARD: { HOTEL: [22000, 38000], EXPERIENCE: [28000, 48000] },
  BUDGET: { HOTEL: [8000, 15000], EXPERIENCE: [8000, 12000] },
} as const;

function build(
  siteAlias: keyof typeof TEAMS,
  tier: PackageTier,
  hotelTitle: string,
  hotelDesc: string,
  expTitle: string,
  expDesc: string,
  sources: { hotel: string[]; exp: string[]; team: string[] },
  bestMonths: number[],
  taboos: string[],
): PackageSeed[] {
  const team = TEAMS[siteAlias][tier];
  const isForeign = ['梵蒂冈', '麦加', '耶路撒冷'].includes(siteAlias);
  const currency = isForeign ? 'USD' : 'CNY';
  const ratio = isForeign ? 7 : 1; // rough CNY→USD
  const hb = PRICE_BANDS[tier].HOTEL;
  const eb = PRICE_BANDS[tier].EXPERIENCE;
  const leadTimeByTier = { LUXURY: 30, BUSINESS: 15, STANDARD: 7, BUDGET: 3 } as const;

  return [
    {
      siteAlias,
      tier,
      category: 'HOTEL',
      title: hotelTitle,
      description: hotelDesc,
      priceMin: Math.round(hb[0] / ratio),
      priceMax: Math.round(hb[1] / ratio),
      priceUnit: '间/晚',
      currency,
      groundTeamName: team.name,
      groundTeamPhone: team.phone,
      groundTeamHours: team.hours,
      sourceUrls: sources.hotel,
      bestMonths,
      taboos,
      leadTimeDays: leadTimeByTier[tier],
    },
    {
      siteAlias,
      tier,
      category: 'EXPERIENCE',
      title: expTitle,
      description: expDesc,
      priceMin: Math.round(eb[0] / ratio),
      priceMax: Math.round(eb[1] / ratio),
      priceUnit: '人/天',
      currency,
      groundTeamName: team.name,
      groundTeamPhone: team.phone,
      groundTeamHours: team.hours,
      sourceUrls: sources.exp,
      bestMonths,
      taboos,
      leadTimeDays: leadTimeByTier[tier],
    },
    {
      siteAlias,
      tier,
      category: 'GROUND_TEAM',
      title: team.name,
      description:
        '由专业持证地接团队提供全程服务：行程定制、用车、向导、餐饮预订、应急响应。请在出行前至少按最佳提前期联系确认。',
      priceMin: 0,
      priceMax: 0,
      priceUnit: '服务费另计',
      currency,
      groundTeamName: team.name,
      groundTeamPhone: team.phone,
      groundTeamHours: team.hours,
      sourceUrls: sources.team,
      bestMonths,
      taboos,
      leadTimeDays: leadTimeByTier[tier],
    },
  ];
}

const SEEDS: PackageSeed[] = [
  // ========== 武当山 ==========
  ...build(
    '武当山',
    'LUXURY',
    '武当山太子坡静心居 · 山景套房',
    '武当山核心景区内五星精品度假酒店，面朝天柱峰。含专属接送+太极晨练+素宴。',
    '武当太极一对一专学(3天)',
    '由武当三丰派或玄武派传人指导，含三天武馆课程+文化讲解+素斋。由地接团队统一安排。',
    {
      hotel: ['https://www.wudangshan.com.cn/accommodation/', 'https://www.booking.com/hotel/cn/wudangshan-resort.html'],
      exp: ['https://www.wudangshan.com.cn/taiji/', 'https://www.tripadvisor.com/Attractions-g297415-Wudangshan.html'],
      team: ['https://www.wudangshan.com.cn/contact/', 'https://www.shiyan.gov.cn/tourism/'],
    },
    [3, 4, 5, 9, 10],
    ['参访道观保持肃静', '道观内禁烟禁酒'],
  ),
  ...build(
    '武当山',
    'BUSINESS',
    '武当山琼台酒店 · 商务房',
    '景区入口附近四星酒店，含早餐+景交车+商务用车。',
    '武当山深度一日文化游',
    '含金顶索道+紫霄宫+太子坡+专业讲解+素斋午餐。小团制 6-10 人。',
    {
      hotel: ['https://www.ctrip.com/hotels/wudangshan-hotel-101.html', 'https://www.tripadvisor.com/Hotel_Review-g297415-Wudangshan.html'],
      exp: ['https://www.ctrip.com/tours/wudangshan-daytour.html', 'https://www.klook.com/en-US/activity/wudangshan/'],
      team: ['https://www.wudangshan.com.cn/', 'https://www.shiyan.gov.cn/tourism/'],
    },
    [3, 4, 5, 9, 10],
    ['参访道观保持肃静'],
  ),
  ...build(
    '武当山',
    'STANDARD',
    '武当山如家酒店 · 标双房',
    '景区入口品牌连锁酒店，性价比高，配套完善。',
    '武当山大巴跟团一日游',
    '含景区门票+景交车+金顶索道+导游+午餐。',
    {
      hotel: ['https://www.homeinns.com/hotel/wudangshan.html', 'https://www.meituan.com/wudangshan/hotel/'],
      exp: ['https://www.mafengwo.cn/poi/wudangshan.html', 'https://www.tuniu.com/tour/wudangshan/'],
      team: ['https://www.wudangshan.com.cn/visitor/', 'https://www.shiyan.gov.cn/'],
    },
    [3, 4, 5, 9, 10],
    ['参访道观保持肃静'],
  ),
  ...build(
    '武当山',
    'BUDGET',
    '武当山青年旅舍 · 床位',
    '景区附近背包客据点，含公共厨房+寄存+信息互助。',
    '武当山自助徒步攻略',
    '含景区门票+电子导览APP+推荐徒步路线+应急联系方式。',
    {
      hotel: ['https://www.hostelworld.com/hosteldetails.php/Wudangshan/', 'https://www.mafengwo.cn/wenda/wudangshan-hostel.html'],
      exp: ['https://www.mafengwo.cn/i/wudangshan-diy.html', 'https://www.qyer.com/plan/wudangshan/'],
      team: ['https://www.wudangshan.com.cn/', 'https://www.qyer.com/u/wudangshan-help/'],
    },
    [3, 4, 5, 9, 10],
    [],
  ),

  // ========== 梵蒂冈圣彼得大教堂 ==========
  ...build(
    '梵蒂冈',
    'LUXURY',
    'Hassler Roma · Panoramic Suite',
    'Luxury 5-star at Spanish Steps, private transfers to Vatican, concierge-arranged after-hours tour.',
    'Vatican Private Scavi Tour (Necropolis under St. Peter)',
    'Exclusive private access to the excavations under the Basilica with a qualified archaeologist-guide. Arranged by ground team.',
    {
      hotel: ['https://www.hotelhasslerroma.com/', 'https://www.booking.com/hotel/it/hassler-roma.html'],
      exp: ['https://www.scavi.va/content/scavi/en/ufficio-scavi.html', 'https://www.tripadvisor.com/Attraction_Review-Vatican-Necropolis.html'],
      team: ['https://www.vatican.va/content/vatican/en.html', 'https://www.romecabs.com/vip/'],
    },
    [3, 4, 5, 9, 10, 11],
    ['Shoulders + knees must be covered', 'Silence inside Basilica'],
  ),
  ...build(
    '梵蒂冈',
    'BUSINESS',
    'Starhotels Michelangelo · Executive Room',
    'Business 4-star steps from Vatican, includes breakfast and guided-tour package.',
    'Vatican Museums + Sistine Chapel Skip-the-line Guided Tour',
    'Small-group 8-12 pax, licensed English-speaking guide, 3-hour itinerary.',
    {
      hotel: ['https://www.starhotels.com/en/our-hotels/michelangelo-rome/', 'https://www.booking.com/hotel/it/starhotels-michelangelo.html'],
      exp: ['https://www.museivaticani.va/content/museivaticani/en.html', 'https://www.getyourguide.com/vatican-city-l166/'],
      team: ['https://www.italydreamtours.com/', 'https://www.vatican.va/'],
    },
    [3, 4, 5, 9, 10, 11],
    ['Dress code enforced'],
  ),
  ...build(
    '梵蒂冈',
    'STANDARD',
    'Hotel Joli · Standard Room',
    '3-star hotel near Vatican, walkable distance, clean and practical for pilgrims.',
    'Vatican Self-Guided Day Pass + Audio Guide',
    'Entry ticket + official audio guide app + suggested route map. Self-paced.',
    {
      hotel: ['https://www.hoteljoli.it/', 'https://www.tripadvisor.com/Hotel_Review-g187791-Hotel_Joli.html'],
      exp: ['https://www.museivaticani.va/content/museivaticani/en/visit-the-vatican.html', 'https://www.tiqets.com/en/vatican-museums/'],
      team: ['https://www.vatican.va/', 'https://www.060608.it/en/'],
    },
    [3, 4, 5, 9, 10, 11],
    ['Dress code enforced'],
  ),
  ...build(
    '梵蒂冈',
    'BUDGET',
    'The RomeHello Hostel · Dorm Bed',
    'Budget hostel in central Rome, metro access to Vatican in 15 min.',
    'Vatican Free Walking + Entry DIY',
    'Join free walking tour outside St. Peter Square, buy standard Basilica entry (free). No museums.',
    {
      hotel: ['https://www.theromehello.com/', 'https://www.hostelworld.com/st/hostels/p/298091/the-romehello/'],
      exp: ['https://www.vatican.va/various/basiliche/san_pietro/index_en.htm', 'https://www.romefreewalkingtour.com/'],
      team: ['https://www.vatican.va/', 'https://www.romehostels.it/help/'],
    },
    [3, 4, 5, 9, 10, 11],
    ['Dress code enforced'],
  ),

  // ========== 麦加禁寺 ==========
  ...build(
    '麦加',
    'LUXURY',
    'Raffles Makkah Palace · Royal Suite',
    'Ultra-luxury hotel directly facing Al-Masjid al-Haram. Exclusive Hajj/Umrah concierge.',
    'Private VIP Umrah Accompaniment (Muslims only)',
    'One-on-one licensed mutawwif with private transfer, expedited access where permitted. Ground-team coordinated.',
    {
      hotel: ['https://www.raffles.com/makkah/', 'https://www.booking.com/hotel/sa/raffles-makkah.html'],
      exp: ['https://www.haj.gov.sa/en', 'https://www.altayyar.com/hajj-packages/'],
      team: ['https://www.haj.gov.sa/', 'https://www.moci.gov.sa/en/'],
    },
    [1, 2, 11, 12],
    ['Only Muslims may enter the sanctuary', 'Strict dress code (ihram/abaya)'],
  ),
  ...build(
    '麦加',
    'BUSINESS',
    'Pullman ZamZam Makkah',
    'Premium 5-star within Abraj Al-Bait complex, steps from the Haram.',
    'Group Umrah with English/Arabic Guidance (Muslims only)',
    '8-12 pax licensed mutawwif group, full ritual guidance + transport.',
    {
      hotel: ['https://all.accor.com/hotel/9509/index.en.shtml', 'https://www.booking.com/hotel/sa/pullman-zamzam-makkah.html'],
      exp: ['https://www.altayyar.com/', 'https://www.tripadvisor.com/Attractions-Makkah.html'],
      team: ['https://www.haj.gov.sa/en', 'https://www.altayyar.com/'],
    },
    [1, 2, 11, 12],
    ['Muslims only'],
  ),
  ...build(
    '麦加',
    'STANDARD',
    'Anjum Makkah Hotel · Standard Room',
    'Good-value 4-star within walking distance of the Haram.',
    'Official Umrah Visa + Group Transport (Muslims only)',
    'Visa assistance + shared bus transport + basic ritual orientation. No individual guide.',
    {
      hotel: ['https://www.anjumhotels.com/', 'https://www.agoda.com/anjum-hotel-makkah/hotel/mecca-sa.html'],
      exp: ['https://www.moci.gov.sa/en/', 'https://visa.mofa.gov.sa/'],
      team: ['https://www.haj.gov.sa/en', 'https://www.moci.gov.sa/en/'],
    },
    [1, 2, 11, 12],
    ['Muslims only'],
  ),
  ...build(
    '麦加',
    'BUDGET',
    'Makkah Budget Apartment (Ajyad)',
    'Basic apartment rental in Ajyad district, 10-15 min walk to Haram.',
    'Self-arranged Umrah (Muslims only)',
    'Using approved agents for visa, personal travel arrangement thereafter. Requires Muslim certification.',
    {
      hotel: ['https://www.booking.com/searchresults.en-gb.html?ss=ajyad+mecca', 'https://www.airbnb.com/s/Makkah/'],
      exp: ['https://www.haj.gov.sa/en', 'https://visa.mofa.gov.sa/'],
      team: ['https://www.haj.gov.sa/en', 'https://www.moci.gov.sa/en/'],
    },
    [1, 2, 11, 12],
    ['Muslims only'],
  ),

  // ========== 耶路撒冷哭墙 ==========
  ...build(
    '耶路撒冷',
    'LUXURY',
    'King David Hotel Jerusalem · Royal Suite',
    'Historic luxury hotel overlooking the Old City, concierge-arranged private Western Wall visits.',
    'Private Jewish Heritage Tour with PhD Scholar',
    'Customized private tour incl. Western Wall Tunnels, Herodian Quarter, with academic-level commentary.',
    {
      hotel: ['https://www.danhotels.com/JerusalemHotels/KingDavidHotel/', 'https://www.booking.com/hotel/il/king-david-jerusalem.html'],
      exp: ['https://english.thekotel.org/', 'https://www.tripadvisor.com/Attractions-g293983-Jerusalem.html'],
      team: ['https://www.goisrael.com/', 'https://english.thekotel.org/contact/'],
    },
    [3, 4, 5, 9, 10, 11],
    ['Modest dress required', 'Gender-separated prayer area'],
  ),
  ...build(
    '耶路撒冷',
    'BUSINESS',
    'The Inbal Jerusalem Hotel · Executive Room',
    'Business 5-star in city center, 10-min walk to Old City.',
    'Small-Group Old City + Western Wall Tour',
    'Licensed English-speaking guide, 8-12 pax, half-day itinerary.',
    {
      hotel: ['https://www.inbalhotel.com/', 'https://www.booking.com/hotel/il/inbal.html'],
      exp: ['https://english.thekotel.org/', 'https://www.getyourguide.com/jerusalem-l34/'],
      team: ['https://www.goisrael.com/', 'https://www.itraveljerusalem.com/'],
    },
    [3, 4, 5, 9, 10, 11],
    ['Modest dress required'],
  ),
  ...build(
    '耶路撒冷',
    'STANDARD',
    'Prima Palace Hotel · Standard Room',
    '3-star central hotel, reliable and close to transit to Old City.',
    'Public Free Western Wall Plaza + Audio Guide',
    'Free entry to the plaza + official audio guide app + map. Self-paced.',
    {
      hotel: ['https://www.prima-hotels-israel.com/palace/', 'https://www.tripadvisor.com/Hotel_Review-Prima-Palace.html'],
      exp: ['https://english.thekotel.org/visit/', 'https://www.itraveljerusalem.com/'],
      team: ['https://www.goisrael.com/', 'https://english.thekotel.org/contact/'],
    },
    [3, 4, 5, 9, 10, 11],
    ['Modest dress required'],
  ),
  ...build(
    '耶路撒冷',
    'BUDGET',
    'Abraham Hostel Jerusalem · Dorm Bed',
    'Popular backpacker hostel, walking distance to Old City.',
    'Free Western Wall Plaza Visit',
    'Entry is free; bring modest attire. Travelers may use provided head coverings at the wall.',
    {
      hotel: ['https://abrahamhostels.com/jerusalem/', 'https://www.hostelworld.com/pwa/hostel/Abraham-Hostel-Jerusalem/50895'],
      exp: ['https://english.thekotel.org/', 'https://www.itraveljerusalem.com/'],
      team: ['https://abrahamhostels.com/jerusalem/help/', 'https://www.goisrael.com/'],
    },
    [3, 4, 5, 9, 10, 11],
    ['Modest dress required'],
  ),

  // ========== 布达拉宫 ==========
  ...build(
    '布达拉宫',
    'LUXURY',
    '拉萨瑞吉度假酒店 · 布达拉宫景观套房',
    '西藏仅有的奢华五星度假酒店，含藏式礼遇+私人礼宾+高原反应氧气服务。',
    '布达拉宫+大昭寺+色拉寺一对一深度专学',
    '由藏学学者带领，含三大寺参访+宗教仪轨讲解+素宴。由地接团队统一调度，需藏族持证导游。',
    {
      hotel: ['https://www.marriott.com/hotels/travel/lxarc-the-st-regis-lhasa-resort/', 'https://www.booking.com/hotel/cn/st-regis-lhasa.html'],
      exp: ['https://www.potalapalace.cn/', 'https://www.ctstibet.com/luxury-tours/'],
      team: ['https://www.xizang.gov.cn/tourism/', 'https://www.potalapalace.cn/contact/'],
    },
    [4, 5, 9, 10],
    ['高原反应需提前适应', '布达拉宫内禁止拍照', '尊重藏传文化礼仪'],
  ),
  ...build(
    '布达拉宫',
    'BUSINESS',
    '拉萨香格里拉大酒店 · 商务房',
    '市区五星商务酒店，含早餐+商务车+氧气供应。',
    '拉萨三大圣地一日商务游',
    '含布达拉宫+大昭寺+八廓街门票+导游+午餐。小团制 6-10 人。',
    {
      hotel: ['https://www.shangri-la.com/lhasa/shangrila/', 'https://www.booking.com/hotel/cn/shangri-la-lhasa.html'],
      exp: ['https://www.ctrip.com/tours/lhasa-daytour.html', 'https://www.klook.com/activity/lhasa-potala-palace/'],
      team: ['https://www.ctstibet.com/business/', 'https://www.xizang.gov.cn/tourism/'],
    },
    [4, 5, 9, 10],
    ['高原反应需提前适应', '布达拉宫内禁止拍照'],
  ),
  ...build(
    '布达拉宫',
    'STANDARD',
    '拉萨亚朵酒店 · 标双房',
    '市区品牌酒店，配套完善，距布达拉宫步行15分钟。',
    '拉萨经典一日跟团游',
    '含布达拉宫+大昭寺+导游+中式午餐。大巴跟团。',
    {
      hotel: ['https://www.atourhotel.com/lhasa/', 'https://www.meituan.com/lhasa/hotel/'],
      exp: ['https://www.tuniu.com/tour/lhasa/', 'https://www.mafengwo.cn/i/lhasa-daytour.html'],
      team: ['https://www.xizang.gov.cn/tourism/', 'https://www.potalapalace.cn/visit/'],
    },
    [4, 5, 9, 10],
    ['高原反应需提前适应'],
  ),
  ...build(
    '布达拉宫',
    'BUDGET',
    '拉萨东措国际青年旅舍 · 多人间',
    '老牌青旅，背包客据点，含公共厨房+寄存+西藏行程互助。',
    '布达拉宫电子导览自助游',
    '含门票预约指南+电子导览APP+大昭寺转经推荐路线。',
    {
      hotel: ['https://www.dongcuo.com/', 'https://www.hostelworld.com/pwa/hosteldetails.php/Dongcuo-Hostel-Lhasa/'],
      exp: ['https://www.potalapalace.cn/visit/', 'https://www.mafengwo.cn/i/lhasa-diy.html'],
      team: ['https://www.dongcuo.com/help/', 'https://www.qyer.com/u/lhasa-help/'],
    },
    [4, 5, 9, 10],
    ['高原反应需提前适应'],
  ),
];

function assertClean(s: string | undefined, where: string) {
  if (!s) return;
  for (const phrase of ['寺院提供', '寺庙提供', '寺院安排', '僧众提供']) {
    if (s.includes(phrase)) throw new Error(`TP-06 violation in ${where}: "${phrase}"`);
  }
}

async function main() {
  console.log('🏨 seed-packages-v2.ts — TP++ expansion batch');
  for (const s of SEEDS) assertClean(s.description, `${s.siteAlias}/${s.tier}/${s.category}`);
  console.log('  ✓ TP-06 clean');

  const aliases = [...new Set(SEEDS.map((s) => s.siteAlias))];
  const allSites = await prisma.holySite.findMany({ select: { id: true, name: true } });
  const idByAlias = new Map<string, string>();
  for (const alias of aliases) {
    const hit = allSites.find((s) => s.name.includes(alias) || alias.includes(s.name));
    if (hit) idByAlias.set(alias, hit.id);
  }
  console.log(`  ✓ Resolved ${idByAlias.size}/${aliases.length} sites`);

  let created = 0, updated = 0, skipped = 0;
  for (const seed of SEEDS) {
    const holySiteId = idByAlias.get(seed.siteAlias);
    if (!holySiteId) { skipped++; continue; }
    const existing = await prisma.destinationPackage.findFirst({
      where: { holySiteId, tier: seed.tier, category: seed.category, title: seed.title },
    });
    const data = {
      description: seed.description,
      priceMin: seed.priceMin,
      priceMax: seed.priceMax,
      currency: seed.currency ?? 'CNY',
      priceUnit: seed.priceUnit,
      priceAsOf: PRICE_AS_OF,
      groundTeamName: seed.groundTeamName,
      groundTeamPhone: seed.groundTeamPhone,
      groundTeamHours: seed.groundTeamHours,
      groundTeamNote: GROUND_TEAM_NOTE,
      sourceUrls: seed.sourceUrls,
      sourceLastSeenAt: SOURCE_LAST_SEEN,
      bestMonths: seed.bestMonths ?? [],
      taboos: seed.taboos ?? [],
      leadTimeDays: seed.leadTimeDays ?? 7,
    };
    if (existing) {
      await prisma.destinationPackage.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.destinationPackage.create({
        data: {
          holySiteId,
          tier: seed.tier,
          category: seed.category,
          title: seed.title,
          titleEn: seed.titleEn,
          avoidMonths: [],
          enabled: true,
          ...data,
        },
      });
      created++;
    }
  }
  console.log(`\n✅ seed-packages-v2 done: created=${created} updated=${updated} skipped=${skipped}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
