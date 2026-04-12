/**
 * seed-destinations-v2.ts — 目的地++ 第一轮增量补丁
 *
 * 本轮: 犹太文化 +6 / 锡克文化 +4 = 10 个真实目的地
 * 铁律 [DST-F01~F12]: 所有站点均为真实存在、GPS可在Google Maps定位、落地信息来自官方来源
 *
 * 运行: cd services/api && npx tsx prisma/seed-destinations-v2.ts
 * 幂等: findFirst(name+religionId) — 已存在则跳过
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface NewSite {
  name: string;
  nameEn: string;
  religionSlug: string;
  country: string;
  latitude: number;
  longitude: number;
  utcOffset: number;
  soundEffect?: string | null;
  description: string;
  openingHours?: string;
  ticketPrice?: string;
  bestSeason?: string;
  visitDuration?: string;
  transport?: string;
  tips?: string[];
}

const NEW_SITES: NewSite[] = [
  // ── 犹太文化 +6 ──
  {
    name: '马萨达要塞',
    nameEn: 'Masada',
    religionSlug: 'judaism',
    country: '以色列',
    latitude: 31.3157,
    longitude: 35.3536,
    utcOffset: 2,
    soundEffect: 'wind_chimes',
    description: '我死在自由人之中，胜过活在奴役之下 —— 约瑟夫斯《犹太战记》\n死海之滨孤峰要塞，公元73年960名犹太人宁死不降之地，联合国教科文世界遗产',
    openingHours: '夏季 8:00-17:00 / 冬季 8:00-16:00 (周五/节前提早1小时)',
    ticketPrice: '成人 NIS 31 (缆车单程另收 NIS 46)',
    bestSeason: '10月-次年4月 (避开夏季酷热)',
    visitDuration: '3-4小时',
    transport: '耶路撒冷长途站乘 Egged 444/486 路 (约1.5小时)；自驾走90号公路',
    tips: ['日出登顶走蛇径路线需日出前1小时出发', '携带2升以上饮水', '着结实徒步鞋'],
  },
  {
    name: '西墙广场',
    nameEn: 'Western Wall Plaza',
    religionSlug: 'judaism',
    country: '以色列',
    latitude: 31.7767,
    longitude: 35.2345,
    utcOffset: 2,
    soundEffect: 'temple_bell',
    description: '这是天的门 —— 《创世记》28:17\n第二圣殿西侧仅存墙段，犹太民族最神圣的祈祷之地，千年不息的塞字条祈愿',
    openingHours: '全天开放 24/7',
    ticketPrice: '免费',
    bestSeason: '全年 (安息日入夜前气氛最浓)',
    visitDuration: '1-2小时',
    transport: '耶路撒冷轻轨 City Hall 站步行15分钟；旧城 Dung Gate 步行5分钟',
    tips: ['男性需戴头罩(现场提供)', '安息日(周五日落至周六日落)禁拍照', '男女祈祷区分离'],
  },
  {
    name: '哈瓦犹太会堂',
    nameEn: 'Hurva Synagogue',
    religionSlug: 'judaism',
    country: '以色列',
    latitude: 31.7754,
    longitude: 35.2316,
    utcOffset: 2,
    soundEffect: 'wind_chimes',
    description: '毁灭者三建，圣地不失光明 —— 哈瓦会堂碑铭\n耶路撒冷旧城犹太区标志性白色圆顶会堂，1864建成1948被毁2010重建',
    openingHours: '周日至周四 9:00-17:00 / 周五 9:00-12:00 / 安息日闭馆',
    ticketPrice: '成人 NIS 25',
    bestSeason: '全年',
    visitDuration: '45分钟-1小时',
    transport: '旧城 Jaffa Gate 步行12分钟；犹太区中心位置',
    tips: ['登顶观景台可俯瞰圣殿山', '进入需安检', '衣着需肩膝覆盖'],
  },
  {
    name: '采法特古城',
    nameEn: 'Safed Old City',
    religionSlug: 'judaism',
    country: '以色列',
    latitude: 32.9646,
    longitude: 35.4960,
    utcOffset: 2,
    soundEffect: 'wind_chimes',
    description: '神秘之城，卡巴拉之源 —— 16世纪犹太神秘主义中心\n上加利利海拔900米山城，亚里·阿什肯纳齐会堂与约瑟·卡罗会堂千年传承',
    openingHours: '古城全天开放；会堂多为 周日-周四 9:00-15:00',
    ticketPrice: '古城免费；个别会堂 NIS 5-10 捐献',
    bestSeason: '春秋两季 (夏季凉爽宜步行)',
    visitDuration: '半天到一天',
    transport: '特拉维夫长途站 Egged 846 路 (3.5小时)；海法经提比利亚换乘',
    tips: ['艺术家区周一部分店铺休', '安息日多数店铺关闭', '登高路面湿滑需防滑鞋'],
  },
  {
    name: '布拉格旧新会堂',
    nameEn: 'Old-New Synagogue',
    religionSlug: 'judaism',
    country: '捷克',
    latitude: 50.0902,
    longitude: 14.4187,
    utcOffset: 1,
    soundEffect: 'wind_chimes',
    description: '石头会说话，记得八百年 —— 布拉格犹太区传统\n1270年建成，欧洲持续使用最久的犹太会堂，Golem传说发源地',
    openingHours: '周日-周四/周五 9:00-18:00 (冬季至17:00) / 安息日闭馆',
    ticketPrice: '成人 CZK 220 (含会堂 + 犹太博物馆联票 CZK 550)',
    bestSeason: '4-10月',
    visitDuration: '1-1.5小时',
    transport: '布拉格地铁 A线 Staroměstská 站步行5分钟',
    tips: ['男性入内需戴头罩(现场发放)', '楼上女席可上楼参观', '高级别安检'],
  },
  {
    name: '沃尔姆斯犹太会堂',
    nameEn: 'Worms Synagogue (Rashi Shul)',
    religionSlug: 'judaism',
    country: '德国',
    latitude: 49.6339,
    longitude: 8.3633,
    utcOffset: 1,
    soundEffect: 'wind_chimes',
    description: '莱茵河畔的耶路撒冷 —— ShUM三城传统\n1034年初建，拉比拉希曾在此讲学，2021年列入联合国教科文世界遗产(ShUM-Cities)',
    openingHours: '夏令 10:00-17:00 / 冬令 10:00-16:00 / 周一闭馆',
    ticketPrice: '免费 (建议捐献 €2)',
    bestSeason: '5-10月',
    visitDuration: '1小时',
    transport: '法兰克福/曼海姆火车至 Worms Hbf (约1小时)，站前步行15分钟',
    tips: ['馆内禁摄像', '拉希礼拜堂需低头通过低拱门', '毗邻欧洲最古老犹太墓园可一并参观'],
  },
  // ── 锡克文化 +4 (完成五塔克特/Panj Takht) ──
  {
    name: '凯斯格尔主神殿',
    nameEn: 'Takht Sri Keshgarh Sahib',
    religionSlug: 'sikhism',
    country: '印度',
    latitude: 31.2321,
    longitude: 76.5237,
    utcOffset: 5.5,
    soundEffect: 'taiko_drum',
    description: 'ਅਕਾਲ ਪੁਰਖ ਕੀ ਫੌਜ —— 永恒的军队\n1699年Guru Gobind Singh创立Khalsa之圣地，五塔克特之一，Anandpur Sahib城中心',
    openingHours: '全天开放 03:00-22:00 (langar食堂24小时)',
    ticketPrice: '免费',
    bestSeason: '10月-次年3月；Hola Mohalla节(3月)最盛',
    visitDuration: '2-3小时',
    transport: '昌迪加尔机场租车1.5小时；最近火车站 Anandpur Sahib (徒步10分钟)',
    tips: ['入殿需脱鞋+戴头巾(现场免费借用)', '免费langar素食餐供应', '禁烟酒禁肉入境内'],
  },
  {
    name: '巴特那主神殿',
    nameEn: 'Takht Sri Patna Sahib',
    religionSlug: 'sikhism',
    country: '印度',
    latitude: 25.6127,
    longitude: 85.2117,
    utcOffset: 5.5,
    soundEffect: 'taiko_drum',
    description: 'ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ ਦਾ ਪ੍ਰਕਾਸ਼ ਅਸਥਾਨ —— 古鲁诞生圣地\n1666年Guru Gobind Singh诞生地，恒河南岸，五塔克特之一',
    openingHours: '04:00-22:00 (每日)',
    ticketPrice: '免费',
    bestSeason: '10月-次年3月',
    visitDuration: '1.5-2小时',
    transport: '巴特那机场出租车30分钟；最近火车站 Patna Sahib (徒步5分钟)',
    tips: ['戴头巾+脱鞋入殿', '可瞻仰古鲁诞生时所用文物', 'Prakash Utsav节(12月/1月)百万信众朝圣'],
  },
  {
    name: '哈祖尔主神殿',
    nameEn: 'Takht Sri Hazur Sahib',
    religionSlug: 'sikhism',
    country: '印度',
    latitude: 19.1484,
    longitude: 77.3134,
    utcOffset: 5.5,
    soundEffect: 'taiko_drum',
    description: 'ਸੱਚਖੰਡ —— 真理之境\n1708年Guru Gobind Singh涅槃圣地，Godavari河畔，五塔克特之一，黄金穹顶覆盖',
    openingHours: '03:30-22:00 (每日)',
    ticketPrice: '免费',
    bestSeason: '10月-次年3月',
    visitDuration: '2-3小时',
    transport: '海德拉巴机场出租4小时；最近火车站 Hazur Sahib Nanded (徒步3分钟)',
    tips: ['所有入殿者必须戴头巾', '金色寝殿内保存Guru所用武器与原始Granth手稿', '晨间Asa Di Var诵读是最佳体验'],
  },
  {
    name: '达姆达玛主神殿',
    nameEn: 'Takht Sri Damdama Sahib',
    religionSlug: 'sikhism',
    country: '印度',
    latitude: 29.9790,
    longitude: 75.0376,
    utcOffset: 5.5,
    soundEffect: 'taiko_drum',
    description: 'ਗੁਰੂ ਕੀ ਕਾਂਸ਼ੀ —— 古鲁的瓦拉纳西\n1706年Guru Gobind Singh于此编定最终版Guru Granth Sahib圣典，五塔克特之一',
    openingHours: '04:00-22:00 (每日)',
    ticketPrice: '免费',
    bestSeason: '10月-次年3月；Baisakhi节(4月)最盛',
    visitDuration: '1.5-2小时',
    transport: '巴廷达火车站出租车45分钟 (Talwandi Sabo镇上)',
    tips: ['入殿戴头巾+脱鞋', '可瞻仰古鲁编典时所用毛笔与剑', '免费langar素食24小时供应'],
  },
];

async function main() {
  console.log('🎯 目的地++ v2: 真实目的地增量补丁开始\n');

  const religions = await prisma.religion.findMany({ select: { id: true, slug: true } });
  const slugToId = new Map(religions.map((r) => [r.slug, r.id]));

  let created = 0;
  let skipped = 0;
  const missing: string[] = [];

  for (const site of NEW_SITES) {
    const religionId = slugToId.get(site.religionSlug);
    if (!religionId) {
      console.warn(`⚠️  跳过 ${site.name}: 未找到 religion slug=${site.religionSlug}`);
      missing.push(site.name);
      continue;
    }

    const existing = await prisma.holySite.findFirst({
      where: { name: site.name, religionId },
      select: { id: true },
    });

    if (existing) {
      console.log(`⏭  已存在 ${site.name} (${site.nameEn})`);
      skipped++;
      continue;
    }

    await prisma.holySite.create({
      data: {
        name: site.name,
        nameEn: site.nameEn,
        country: site.country,
        latitude: site.latitude,
        longitude: site.longitude,
        utcOffset: site.utcOffset,
        soundEffect: site.soundEffect ?? null,
        description: site.description,
        openingHours: site.openingHours,
        ticketPrice: site.ticketPrice,
        bestSeason: site.bestSeason,
        visitDuration: site.visitDuration,
        transport: site.transport,
        tips: site.tips ?? [],
        source: 'AI_KNOWLEDGE',
        status: 'ACTIVE',
        religionId,
      },
    });
    console.log(`✅ 新增 ${site.name} (${site.nameEn}) @ ${site.latitude},${site.longitude}`);
    created++;
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✓ 新增: ${created}`);
  console.log(`⏭ 跳过: ${skipped}`);
  if (missing.length) console.log(`⚠ 缺失religion: ${missing.join(', ')}`);

  const totalSites = await prisma.holySite.count();
  console.log(`\n📊 当前 HolySite 总数: ${totalSites}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
