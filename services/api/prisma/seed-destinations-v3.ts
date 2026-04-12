/**
 * seed-destinations-v3.ts — 目的地++ 第二轮增量补丁
 *
 * 本轮: 藏传+3 / 犹太+3 / 神道+3 / 原住民+1 = 10 个真实目的地
 * 聚焦"国际化多元补强"，缩小 Ring 3/4 传统缺口
 *
 * 运行: cd services/api && npx tsx prisma/seed-destinations-v3.ts
 * 幂等: findFirst(name+religionId)
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
  // ── 藏传文化 +3 ──
  {
    name: '敏珠林寺',
    nameEn: 'Mindrolling Monastery',
    religionSlug: 'tibetan-buddhism',
    country: '中国',
    latitude: 29.330,
    longitude: 91.300,
    utcOffset: 8,
    soundEffect: 'singing_bowl',
    description: '成熟解脱之地 —— 宁玛派南传六大祖寺之一\n1676年德达林巴创建，雅鲁藏布江南岸，宁玛派最重要的伏藏传承中心',
    openingHours: '09:00-17:00 (每日)',
    ticketPrice: '免费 (捐献随缘)',
    bestSeason: '5-10月',
    visitDuration: '2-3小时',
    transport: '拉萨乘大巴至山南贡嘎，转乘至扎囊县；自驾走G318转Z101',
    tips: ['海拔3600米注意高反', '大殿内禁拍照', '寺内有多康仓壁画需专人讲解'],
  },
  {
    name: '雍和宫',
    nameEn: 'Yonghe Lama Temple',
    religionSlug: 'tibetan-buddhism',
    country: '中国',
    latitude: 39.9475,
    longitude: 116.4102,
    utcOffset: 8,
    soundEffect: 'temple_bell',
    description: '藏传佛教文化汇通皇家 —— 北京雍和宫\n原为雍正皇帝府邸，1744年改为喇嘛庙，汉藏合璧建筑典范，檀木弥勒大佛高18米',
    openingHours: '09:00-16:30 (每日，周一不休)',
    ticketPrice: '成人 ¥25',
    bestSeason: '全年',
    visitDuration: '1.5-2小时',
    transport: '北京地铁2/5号线雍和宫站C口直达',
    tips: ['农历春节初一至十五人流极大', '大殿内禁烟禁拍照', '可请香不得自带香火'],
  },
  {
    name: '止贡梯寺',
    nameEn: 'Drigung Til Monastery',
    religionSlug: 'tibetan-buddhism',
    country: '中国',
    latitude: 30.1139,
    longitude: 91.8403,
    utcOffset: 8,
    soundEffect: 'singing_bowl',
    description: '天葬圣地 —— 止贡噶举派祖庭\n1179年仁钦贝创建，海拔4460米，藏区三大天葬台之首所在地',
    openingHours: '08:00-18:00 (天葬仪式上午9-11点)',
    ticketPrice: '免费',
    bestSeason: '6-9月',
    visitDuration: '半天',
    transport: '拉萨墨竹工卡县出租车约2小时，末段碎石路需越野车',
    tips: ['天葬仪式严禁拍照/录像/议论', '海拔4460米务必预适应', '冬季道路可能封闭'],
  },

  // ── 犹太文化 +3 (继续朝 30 目标推进) ──
  {
    name: '族长之墓',
    nameEn: 'Cave of the Patriarchs',
    religionSlug: 'judaism',
    country: '巴勒斯坦',
    latitude: 31.5247,
    longitude: 35.1107,
    utcOffset: 2,
    soundEffect: 'wind_chimes',
    description: '亚伯拉罕、以撒、雅各及其妻埋葬之地 —— 《创世记》23章\n希伯伦城麦比拉洞，希律王时代建造大型墙垣，犹太教第二圣地',
    openingHours: '周日-周四 04:00-22:00 (安息日 04:00-13:00)',
    ticketPrice: '免费',
    bestSeason: '春秋两季',
    visitDuration: '1-1.5小时',
    transport: '耶路撒冷中央车站 160/260路大巴至希伯伦约1.5小时',
    tips: ['分犹太区与穆斯林区两入口，节日轮换', '重大节日两区互换开放', '安检较严禁带危险品'],
  },
  {
    name: '大卫王之墓',
    nameEn: "King David's Tomb",
    religionSlug: 'judaism',
    country: '以色列',
    latitude: 31.7717,
    longitude: 35.2295,
    utcOffset: 2,
    soundEffect: 'temple_bell',
    description: '以色列大卫王长眠之所 —— 《列王纪上》2:10\n耶路撒冷锡安山南麓，中世纪拜占庭建筑，上层为最后晚餐厅',
    openingHours: '周日-周四 08:00-18:00 / 周五 08:00-14:00',
    ticketPrice: '免费',
    bestSeason: '全年',
    visitDuration: '30分钟-1小时',
    transport: '耶路撒冷旧城 Zion Gate 步行5分钟',
    tips: ['男女进入分道', '男性需戴头罩', '与最后晚餐厅上下楼同址'],
  },
  {
    name: '拉结之墓',
    nameEn: "Rachel's Tomb",
    religionSlug: 'judaism',
    country: '巴勒斯坦',
    latitude: 31.7197,
    longitude: 35.2024,
    utcOffset: 2,
    soundEffect: 'wind_chimes',
    description: '雅各之妻拉结葬于此 —— 《创世记》35:19\n伯利恒城北入口，犹太教第三圣地，千年来妇女求子求安息之地',
    openingHours: '周日-周四 24小时 / 周五至安息日入夜 / 安息日闭',
    ticketPrice: '免费',
    bestSeason: '春秋',
    visitDuration: '30分钟-1小时',
    transport: '耶路撒冷 163路 防弹大巴 (仅此一路可达)，约40分钟',
    tips: ['位于分离墙内需防弹大巴接驳', '男女祈祷区分离', '入拉结忌日(马赫什万月11日)万人朝圣'],
  },

  // ── 神道文化 +3 (推进至 28/30) ──
  {
    name: '日枝神社',
    nameEn: 'Hie Shrine',
    religionSlug: 'shinto',
    country: '日本',
    latitude: 35.6739,
    longitude: 139.7399,
    utcOffset: 9,
    soundEffect: 'taiko_drum',
    description: '江戸の鎮守 —— 日枝神社\n东京赤坂镇守社，德川家康钦定江户总氏神，山王祭为江户三大祭之一',
    openingHours: '夏季 05:00-18:00 / 冬季 06:00-17:00',
    ticketPrice: '免费',
    bestSeason: '6月山王祭最盛；4月樱花；11月红叶',
    visitDuration: '1小时',
    transport: '东京地铁南北线溜池山王站7号出口步行3分钟',
    tips: ['有自动扶梯直达山顶本殿便于年长者', '猿神像为授福象征', '求子授袋有"子授かり"特色御守'],
  },
  {
    name: '太宰府天满宫',
    nameEn: 'Dazaifu Tenmangu',
    religionSlug: 'shinto',
    country: '日本',
    latitude: 33.5217,
    longitude: 130.5353,
    utcOffset: 9,
    soundEffect: 'wind_chimes',
    description: '学問の神 —— 菅原道真公を祀る\n菅原道真909年逝于此葬于此，学问之神总本宫，每年考季百万考生朝拜',
    openingHours: '06:00-19:00 (春夏) / 06:30-18:30 (秋冬)',
    ticketPrice: '免费 (宝物殿 ¥500)',
    bestSeason: '2月梅花季 (梅花6000株)；11月红叶',
    visitDuration: '1.5-2小时',
    transport: '福冈天神站乘西铁线至太宰府站 (约30分钟)',
    tips: ['正殿大修中 (至2026年春)，参拜改至仮殿', '梅枝饼是当地名产必尝', '门前参道有星巴克隈研吾设计店'],
  },
  {
    name: '箱根神社',
    nameEn: 'Hakone Shrine',
    religionSlug: 'shinto',
    country: '日本',
    latitude: 35.2042,
    longitude: 139.0264,
    utcOffset: 9,
    soundEffect: 'taiko_drum',
    description: '交通安全、心願成就 —— 箱根神社\n芦之湖畔湖中红色鸟居为Instagram圣地，757年万卷上人创建',
    openingHours: '社务所 08:00-17:00 (本殿全天可参拜)',
    ticketPrice: '免费 (宝物殿 ¥500)',
    bestSeason: '全年；秋季红叶与冬季富士山映湖最佳',
    visitDuration: '1-1.5小时',
    transport: '箱根汤本乘箱根登山巴士H线至"元箱根港"站步行10分钟',
    tips: ['湖中鸟居拍照早晨逆光最佳', '九头龙神社(本宫)需徒步1小时深山参道', '御朱印需在社务所领取'],
  },

  // ── 原住民 +1 (Ring4, 文化稀缺) ──
  {
    name: '查科峡谷',
    nameEn: 'Chaco Culture National Historical Park',
    religionSlug: 'indigenous',
    country: '美国',
    latitude: 36.0339,
    longitude: -107.9614,
    utcOffset: -7,
    soundEffect: 'wind_chimes',
    description: '祖先的天文图书馆 —— 普韦布洛古文明中心\n850-1250年阿纳萨齐文明首都，精准对齐日月周期的大房子遗址群，UNESCO世界遗产',
    openingHours: '公园全天开放；游客中心 09:00-16:00',
    ticketPrice: '车辆 $25/7天 (步行 $15/人)',
    bestSeason: '4-10月 (冬季道路可能封闭)',
    visitDuration: '1-2天 (含徒步)',
    transport: '阿尔伯克基市自驾 3 小时，末20公里为未铺装土路需高底盘车',
    tips: ['无手机信号需提前下载离线地图', '园内无加油站/食物供应需自备', '暗夜星空公园建议夜宿Gallo营地'],
  },
];

async function main() {
  console.log('🎯 目的地++ v3: 真实目的地增量补丁开始\n');

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
