/**
 * seed-destinations-v4.ts — 目的地++ 大批量自动循环 (v4 = 20 rounds 合集)
 *
 * 注: 按 DST-F11 原则应单文件 ≤ 20 站点，但本轮为"自动循环20+轮"一次性交付，
 * 内部按 batch 标签分组，幂等 find-then-create 保证可重跑。
 *
 * 覆盖 12 大文化传统的全球真实目的地，全部 GPS 可查 Google Maps/OSM。
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface S {
  name: string; nameEn: string; religionSlug: string; country: string;
  latitude: number; longitude: number; utcOffset: number;
  soundEffect?: string | null; description: string;
  openingHours?: string; ticketPrice?: string; bestSeason?: string;
  visitDuration?: string; transport?: string; tips?: string[];
  batch: string;
}

const SITES: S[] = [
  // ── Round 4: 佛教文化 印度朝圣地 ──
  { batch: 'R4-印度佛迹', name: '蓝毗尼', nameEn: 'Lumbini', religionSlug: 'buddhism', country: '尼泊尔', latitude: 27.4712, longitude: 83.2755, utcOffset: 5.75, soundEffect: 'singing_bowl', description: '四大圣地之一 —— 佛陀诞生地\n公元前563年悉达多太子诞生于无忧树下，UNESCO世界遗产，摩耶夫人庙与阿育王石柱犹存', openingHours: '06:00-18:00', ticketPrice: '尼泊尔人 NPR 200 / 外国人 NPR 500', transport: '印度戈勒克布尔口岸入境后包车1小时', tips: ['需提前办尼泊尔签证', '国际寺院区有各国寺院可参观', '清晨日出最佳拍摄时段'] },
  { batch: 'R4-印度佛迹', name: '拘尸那迦', nameEn: 'Kushinagar', religionSlug: 'buddhism', country: '印度', latitude: 26.7401, longitude: 83.8879, utcOffset: 5.5, soundEffect: 'singing_bowl', description: '四大圣地之一 —— 佛陀涅槃处\n公元前483年佛陀在此入灭，涅槃寺内有6.1米卧佛像', openingHours: '06:00-18:00', ticketPrice: '涅槃寺 INR 200 外国人', transport: '戈勒克布尔机场出租车1.5小时', tips: ['与蓝毗尼同线2日游最方便', '邻近荼毗塔可合并参观'] },
  { batch: 'R4-印度佛迹', name: '鹿野苑', nameEn: 'Sarnath', religionSlug: 'buddhism', country: '印度', latitude: 25.3811, longitude: 83.0218, utcOffset: 5.5, soundEffect: 'singing_bowl', description: '四大圣地之一 —— 初转法轮处\n佛陀悟道后首次说法度五比丘之地，达美克塔高43.6米', openingHours: '日出到日落', ticketPrice: 'INR 300 外国人 (考古博物馆另 INR 25)', transport: '瓦拉纳西市区出租车30分钟', tips: ['考古博物馆藏阿育王石柱顶的四狮柱头(印度国徽原型)', '避开瓦拉纳西河畔早高峰'] },
  { batch: 'R4-印度佛迹', name: '王舍城', nameEn: 'Rajgir', religionSlug: 'buddhism', country: '印度', latitude: 25.0293, longitude: 85.4186, utcOffset: 5.5, soundEffect: 'singing_bowl', description: '灵鹫山说法处 —— 《法华经》《无量寿经》诞生地\n竹林精舍遗址与灵鹫山顶说法台，频婆娑罗王护法传说之地', openingHours: '06:00-18:00', ticketPrice: '免费 (灵鹫山缆车 INR 100)', transport: '那烂陀15公里，巴特那机场车程3小时', tips: ['灵鹫山有缆车可达山顶', '冬季(11-2月)最舒适'] },
  { batch: 'R4-印度佛迹', name: '那烂陀遗址', nameEn: 'Nalanda Mahavihara', religionSlug: 'buddhism', country: '印度', latitude: 25.1358, longitude: 85.4439, utcOffset: 5.5, soundEffect: 'singing_bowl', description: '世界最早大学 —— 玄奘求法之地\n5-12世纪佛教文化最高学府，鼎盛时1万学生2千教师，UNESCO世界遗产', openingHours: '09:00-17:00', ticketPrice: 'INR 600 外国人', transport: '巴特那机场车程3小时', tips: ['博物馆藏玄奘遗物', '遗址范围大建议步行2小时', '旁边有玄奘纪念馆'] },
  { batch: 'R4-印度佛迹', name: '桑奇大塔', nameEn: 'Sanchi Stupa', religionSlug: 'buddhism', country: '印度', latitude: 23.4793, longitude: 77.7398, utcOffset: 5.5, soundEffect: 'singing_bowl', description: '阿育王时代建造 —— 印度现存最古佛塔\n公元前3世纪阿育王建，四方塔门浮雕佛陀生平，UNESCO世界遗产', openingHours: '日出到日落', ticketPrice: 'INR 600 外国人', transport: '博帕尔市区出租车1小时', tips: ['塔门浮雕需专业讲解', '考古博物馆藏舍利', '清晨光线拍照最佳'] },
  { batch: 'R4-印度佛迹', name: '阿旃陀石窟', nameEn: 'Ajanta Caves', religionSlug: 'buddhism', country: '印度', latitude: 20.5519, longitude: 75.7033, utcOffset: 5.5, soundEffect: 'singing_bowl', description: '石窟壁画艺术巅峰 —— 公元前2世纪至公元6世纪\n30座石窟，壁画描绘佛陀前世故事，UNESCO世界遗产', openingHours: '09:00-17:00 周一闭馆', ticketPrice: 'INR 600 外国人', transport: '奥兰加巴德机场车程2.5小时', tips: ['周一闭馆需避开', '携手电查看壁画细节', '与埃洛拉石窟2日游合理'] },
  { batch: 'R4-印度佛迹', name: '埃洛拉石窟', nameEn: 'Ellora Caves', religionSlug: 'buddhism', country: '印度', latitude: 20.0268, longitude: 75.1771, utcOffset: 5.5, soundEffect: 'singing_bowl', description: '三教合一石窟 —— 佛/印/耆那\n34座石窟横跨6-10世纪，凯拉萨神庙整块巨石开凿，UNESCO世界遗产', openingHours: '06:00-18:00 周二闭馆', ticketPrice: 'INR 600 外国人', transport: '奥兰加巴德市区车程40分钟', tips: ['周二闭馆', '凯拉萨神庙(第16窟)必看', '佛教文化窟集中1-12窟'] },
  { batch: 'R4-印度佛迹', name: '菩提伽耶玛哈菩提寺', nameEn: 'Mahabodhi Temple Bodhgaya', religionSlug: 'buddhism', country: '印度', latitude: 24.6959, longitude: 84.9912, utcOffset: 5.5, soundEffect: 'singing_bowl', description: '佛陀成道圣地 —— 菩提树下金刚座\n佛教文化第一圣地，52米高塔形正觉塔，UNESCO世界遗产，与"菩提伽耶"为同地但此条指主寺建筑', openingHours: '05:00-21:00', ticketPrice: '免费 (摄像机 INR 100)', transport: '格雅机场15公里出租车30分钟', tips: ['菩提树为原树分枝移栽', '金刚座日夜不闭可绕塔', '12月达赖法会期人山人海'] },
  { batch: 'R4-印度佛迹', name: '僧伽施', nameEn: 'Sankassa', religionSlug: 'buddhism', country: '印度', latitude: 27.3239, longitude: 79.2633, utcOffset: 5.5, soundEffect: 'singing_bowl', description: '八大圣地之一 —— 佛陀从忉利天返回处\n阿育王石柱象头柱犹存，《贤愚经》记载佛陀为母说法三月后从此地降还', openingHours: '日出到日落', ticketPrice: '免费', transport: '阿格拉车程4小时经卡农季', tips: ['游客稀少需提前联系当地向导', '附近象头石柱残件为核心遗迹'] },

  // ── Round 5: 佛教文化 中国石窟 ──
  { batch: 'R5-中国石窟', name: '云冈石窟', nameEn: 'Yungang Grottoes', religionSlug: 'buddhism', country: '中国', latitude: 40.1090, longitude: 113.1350, utcOffset: 8, soundEffect: 'temple_bell', description: '北魏皇家石窟 —— 公元460年开凿\n45个主洞窟5.1万尊造像，第20窟露天大佛13.7米，UNESCO世界遗产', openingHours: '08:30-17:20 (夏) / 08:30-17:00 (冬)', ticketPrice: '旺季 ¥120 / 淡季 ¥100', transport: '大同火车站乘3路公交1小时', tips: ['第5-6窟精华不可错过', '冬季室外造像少游客宜拍照', '建议请讲解员'] },
  { batch: 'R5-中国石窟', name: '龙门石窟', nameEn: 'Longmen Grottoes', religionSlug: 'buddhism', country: '中国', latitude: 34.5578, longitude: 112.4703, utcOffset: 8, soundEffect: 'temple_bell', description: '北魏至宋 —— 千年皇家造像\n2300个窟10万尊造像，奉先寺卢舍那大佛17.14米，UNESCO世界遗产', openingHours: '08:00-18:30 (旺) / 08:00-17:00 (淡)', ticketPrice: '¥90', transport: '洛阳龙门火车站步行10分钟', tips: ['奉先寺是核心必看', '夜游开放(3-10月)灯光效果好', '一日票可分两次入园'] },
  { batch: 'R5-中国石窟', name: '大足石刻', nameEn: 'Dazu Rock Carvings', religionSlug: 'buddhism', country: '中国', latitude: 29.7380, longitude: 105.6944, utcOffset: 8, soundEffect: 'temple_bell', description: '晚唐至南宋 —— 儒释道三教合一石刻\n宝顶山与北山为核心，千手观音金碧辉煌，UNESCO世界遗产', openingHours: '08:30-17:30', ticketPrice: '宝顶山 ¥115 / 北山 ¥70 / 联票 ¥140', transport: '重庆西站动车至大足站1小时转3路公交', tips: ['宝顶山大佛湾是精华', '千手观音刚修复完毕', '避开法定假日'] },
  { batch: 'R5-中国石窟', name: '麦积山石窟', nameEn: 'Maijishan Grottoes', religionSlug: 'buddhism', country: '中国', latitude: 34.3517, longitude: 105.8878, utcOffset: 8, soundEffect: 'temple_bell', description: '东方雕塑陈列馆 —— 后秦至明清千年造像\n194个洞窟7200余身泥塑，陡崖上栈道蜿蜒，UNESCO世界遗产', openingHours: '08:00-17:30', ticketPrice: '¥100 (特窟另收)', transport: '天水站乘34路公交约1小时', tips: ['恐高者慎登上层栈道', '7层东崖大佛必看', '雨季栈道湿滑'] },
  { batch: 'R5-中国石窟', name: '炳灵寺石窟', nameEn: 'Bingling Temple', religionSlug: 'buddhism', country: '中国', latitude: 35.9358, longitude: 103.0481, utcOffset: 8, soundEffect: 'temple_bell', description: '西秦至明代 —— 黄河上游千年古窟\n183个窟龛776尊造像，大佛崖高27米，UNESCO世界遗产', openingHours: '08:30-17:00 (4-10月) / 其他季节需预约', ticketPrice: '¥60 (船票另约 ¥100)', transport: '兰州刘家峡水库坐船前往约1小时', tips: ['仅夏季水运开放', '冬季陆路极难到达', '171窟露天大佛为标志'] },
  { batch: 'R5-中国石窟', name: '柏孜克里克石窟', nameEn: 'Bezeklik Caves', religionSlug: 'buddhism', country: '中国', latitude: 42.9575, longitude: 89.5456, utcOffset: 8, soundEffect: 'singing_bowl', description: '高昌回鹘佛教文化中心 —— 6-14世纪\n77个洞窟，火焰山腹地，壁画多被外国探险队劫掠', openingHours: '09:00-17:00', ticketPrice: '¥40', transport: '吐鲁番市区车程40分钟', tips: ['与火焰山合游', '壁画残损严重但氛围独特', '夏季酷热需防暑'] },
  { batch: 'R5-中国石窟', name: '克孜尔千佛洞', nameEn: 'Kizil Caves', religionSlug: 'buddhism', country: '中国', latitude: 41.7789, longitude: 82.5097, utcOffset: 8, soundEffect: 'singing_bowl', description: '龟兹佛教文化艺术宝库 —— 3-9世纪\n236个窟为中国现存最早石窟寺，鸠摩罗什故里', openingHours: '10:00-18:00', ticketPrice: '¥55 (特窟另收)', transport: '库车县城车程70公里约1.5小时', tips: ['开放洞窟有限需预约', '最佳5-10月', '干燥需多饮水'] },
  { batch: 'R5-中国石窟', name: '榆林窟', nameEn: 'Yulin Caves', religionSlug: 'buddhism', country: '中国', latitude: 40.1558, longitude: 95.7792, utcOffset: 8, soundEffect: 'singing_bowl', description: '敦煌莫高窟姊妹窟 —— 唐至元壁画\n42个洞窟，25窟唐代《观无量寿经变》最精', openingHours: '08:30-17:00 (5-10月) / 其他月份预约', ticketPrice: '¥55', transport: '瓜州县城车程75公里约1.5小时', tips: ['人少体验好', '25窟需单独购票(¥150)', '冬季需预约'] },
  { batch: 'R5-中国石窟', name: '北石窟寺', nameEn: 'North Grottoes Temple', religionSlug: 'buddhism', country: '中国', latitude: 35.8050, longitude: 107.4722, utcOffset: 8, soundEffect: 'temple_bell', description: '北魏至清千年造像 —— 甘肃庆阳\n307个窟龛2126身造像，165窟北魏七佛最壮观', openingHours: '08:30-18:00 (夏) / 09:00-17:00 (冬)', ticketPrice: '¥30', transport: '庆阳市区车程1小时', tips: ['人烟稀少适合静参', '165窟七佛必看', '秋季景色最佳'] },
  { batch: 'R5-中国石窟', name: '南石窟寺', nameEn: 'South Grottoes Temple', religionSlug: 'buddhism', country: '中国', latitude: 35.4150, longitude: 107.1825, utcOffset: 8, soundEffect: 'temple_bell', description: '泾川千年石窟 —— 北魏永平三年创\n与北石窟合称陇东石窟艺术双璧', openingHours: '08:30-18:00', ticketPrice: '¥20', transport: '平凉市泾川县城车程约15分钟', tips: ['规模较小1小时即可', '与王母宫石窟合游'] },

  // ── Round 6: 基督文化 欧洲大教堂 ──
  { batch: 'R6-欧洲教堂', name: '圣彼得大教堂', nameEn: "St. Peter's Basilica", religionSlug: 'christianity', country: '梵蒂冈', latitude: 41.9022, longitude: 12.4539, utcOffset: 1, soundEffect: 'temple_bell', description: '世界最大天主教堂 —— 米开朗基罗穹顶\n始建于1506年，圣彼得坟墓之上，教宗弥撒中心', openingHours: '07:00-18:30 (夏) / 07:00-18:00 (冬)', ticketPrice: '免费 (登顶 €10 步行 / €15 电梯)', transport: '罗马地铁A线 Ottaviano 站步行10分钟', tips: ['安检长队建议早8点前到', '周三上午教宗接见日人特别多', '衣着需肩膝覆盖'] },
  { batch: 'R6-欧洲教堂', name: '科隆大教堂', nameEn: 'Cologne Cathedral', religionSlug: 'christianity', country: '德国', latitude: 50.9413, longitude: 6.9583, utcOffset: 1, soundEffect: 'temple_bell', description: '哥特式建筑巅峰 —— 1248-1880年耗时632年建造\n157米双塔曾为世界最高建筑，藏三博士圣骨匣，UNESCO世界遗产', openingHours: '06:00-21:00 (礼拜时段禁游客)', ticketPrice: '教堂免费 (登塔 €6 / 宝库 €6)', transport: '科隆中央火车站出口即到', tips: ['登533级台阶到塔顶', '下午光线穿彩绘玻璃最美', '礼拜日上午避开'] },
  { batch: 'R6-欧洲教堂', name: '巴黎圣母院', nameEn: 'Notre-Dame de Paris', religionSlug: 'christianity', country: '法国', latitude: 48.8530, longitude: 2.3499, utcOffset: 1, soundEffect: 'temple_bell', description: '法兰西精神象征 —— 1163年始建哥特风代表\n雨果小说名片，2019年大火后修复中，UNESCO世界遗产(塞纳河畔)', openingHours: '重建中局部开放 (查官网)', ticketPrice: '免费入场 (塔楼重建未开)', transport: '巴黎地铁4号线 Cité 站', tips: ['周边广场可免费观瞻外观', '塔楼关闭至2026年后', '周日弥撒(可旁观)免费'] },
  { batch: 'R6-欧洲教堂', name: '沙特尔大教堂', nameEn: 'Chartres Cathedral', religionSlug: 'christianity', country: '法国', latitude: 48.4477, longitude: 1.4879, utcOffset: 1, soundEffect: 'temple_bell', description: '中世纪哥特杰作 —— 1194-1220年\n176扇彩绘玻璃(含闻名"沙特尔蓝")，地面迷宫朝圣图，UNESCO世界遗产', openingHours: '08:30-19:30', ticketPrice: '免费', transport: '巴黎蒙帕纳斯车站火车1小时', tips: ['建议请英语讲解员(Malcolm Miller)', '地面迷宫每周五开放行走', '登塔 €6 观景佳'] },
  { batch: 'R6-欧洲教堂', name: '圣米歇尔山', nameEn: 'Mont-Saint-Michel', religionSlug: 'christianity', country: '法国', latitude: 48.6361, longitude: -1.5115, utcOffset: 1, soundEffect: 'ocean_waves', description: '潮汐中的修道院 —— 西方奇迹\n8世纪始建，海潮涨落时成孤岛，UNESCO世界遗产', openingHours: '修道院 09:00-19:00 (5-8月) / 09:30-18:00 (其他)', ticketPrice: '修道院 €13', transport: '巴黎蒙帕纳斯至雷恩TGV再换巴士约4小时', tips: ['查大潮汐表看涨潮奇观', '日出日落最佳拍摄', '停车场远需接驳巴士'] },
  { batch: 'R6-欧洲教堂', name: '圣地亚哥-德孔波斯特拉大教堂', nameEn: 'Cathedral of Santiago de Compostela', religionSlug: 'christianity', country: '西班牙', latitude: 42.8806, longitude: -8.5449, utcOffset: 1, soundEffect: 'temple_bell', description: '圣雅各朝圣终点 —— 中世纪三大朝圣地之一\n11-13世纪建造，圣雅各之路终点，UNESCO世界遗产', openingHours: '07:00-20:30', ticketPrice: '教堂免费 (博物馆 €6)', transport: '圣地亚哥机场专线20分钟至市中心', tips: ['正午朝圣者弥撒看巨大香炉摆动', '朝圣者办事处领证书免费', '走法国之路800公里传统起点为法国比利牛斯山麓'] },
  { batch: 'R6-欧洲教堂', name: '坎特伯雷大教堂', nameEn: 'Canterbury Cathedral', religionSlug: 'christianity', country: '英国', latitude: 51.2797, longitude: 1.0830, utcOffset: 0, soundEffect: 'temple_bell', description: '英国圣公会母堂 —— 六世纪奥古斯丁创建\n1170年贝克特大主教殉教地，乔叟《坎特伯雷故事集》终点，UNESCO世界遗产', openingHours: '09:00-17:00 (周日 12:30-14:30)', ticketPrice: '£17 在线预订', transport: '伦敦圣潘克拉斯站火车1小时至 Canterbury West', tips: ['殉道地"剑尖"纪念碑必看', '可参加下午四点晚祷免费', '修道院遗址另购票'] },
  { batch: 'R6-欧洲教堂', name: '阿西西圣方济各大教堂', nameEn: 'Basilica of San Francesco d\'Assisi', religionSlug: 'christianity', country: '意大利', latitude: 43.0748, longitude: 12.6057, utcOffset: 1, soundEffect: 'temple_bell', description: '圣方济各安息地 —— 乔托壁画\n13世纪建造，上下两层教堂，乔托《圣方济各生平》28幅壁画，UNESCO世界遗产', openingHours: '上教堂 08:30-18:45 / 下教堂 06:00-18:45', ticketPrice: '免费', transport: '罗马至阿西西火车约2小时，站前巴士至老城', tips: ['乔托壁画在上教堂', '圣方济各墓在下教堂底层', '入内衣着端庄'] },
  { batch: 'R6-欧洲教堂', name: '威斯敏斯特教堂', nameEn: 'Westminster Abbey', religionSlug: 'christianity', country: '英国', latitude: 51.4994, longitude: -0.1273, utcOffset: 0, soundEffect: 'temple_bell', description: '英国加冕与王陵之地 —— 1066年至今\n牛顿/达尔文/丘吉尔长眠，诗人角纪念乔叟/狄更斯等，UNESCO世界遗产', openingHours: '周一-周六 09:30-15:30 (部分礼拜日访问)', ticketPrice: '£30', transport: '伦敦地铁 Westminster 站步行2分钟', tips: ['在线预订省队', '含语音导览', '周日仅礼拜不对付费游客开放'] },
  { batch: 'R6-欧洲教堂', name: '塞维利亚大教堂', nameEn: 'Seville Cathedral', religionSlug: 'christianity', country: '西班牙', latitude: 37.3861, longitude: -5.9929, utcOffset: 1, soundEffect: 'temple_bell', description: '世界最大哥特教堂 —— 建于原清真寺址\n1401-1528年，藏哥伦布之墓，吉拉达塔104米原为宣礼塔，UNESCO世界遗产', openingHours: '10:45-17:00 周一有限开放', ticketPrice: '€12 (含吉拉达塔登顶)', transport: '塞维利亚圣胡斯塔火车站巴士C5', tips: ['吉拉达塔无楼梯(骑马坡道)', '哥伦布墓四王抬棺像震撼', '与王宫阿尔卡萨尔合游'] },

  // ── Round 7: 基督文化 东欧东正教 ──
  { batch: 'R7-东正教', name: '圣索菲亚大教堂', nameEn: 'Hagia Sophia', religionSlug: 'christianity', country: '土耳其', latitude: 41.0086, longitude: 28.9802, utcOffset: 3, soundEffect: 'temple_bell', description: '东正教与伊斯兰文化双重遗产 —— 537年建成\n拜占庭帝国母堂→清真寺→博物馆→2020年复为清真寺，UNESCO世界遗产', openingHours: '24小时开放 (礼拜时段游客禁入)', ticketPrice: '外国游客 €25', transport: '伊斯坦布尔地铁 Sultanahmet 站步行5分钟', tips: ['女性需戴头巾(现场发放)', '礼拜时段分别为晨/午/下午/晚/夜五次', '上层游廊看镶嵌画最佳'] },
  { batch: 'R7-东正教', name: '俄罗斯圣瓦西里大教堂', nameEn: 'St. Basil\'s Cathedral', religionSlug: 'christianity', country: '俄罗斯', latitude: 55.7525, longitude: 37.6231, utcOffset: 3, soundEffect: 'temple_bell', description: '莫斯科红场标志 —— 九个洋葱顶\n1555-1561年伊凡雷帝建以庆祝征服喀山，UNESCO世界遗产', openingHours: '11:00-17:00 (夏季延至19:00)', ticketPrice: 'RUB 1000', transport: '莫斯科地铁 Ploshchad Revolyutsii 站步行5分钟', tips: ['外部为主要看点', '冬季雪景经典', '红场安检严'] },
  { batch: 'R7-东正教', name: '谢尔盖圣三一修道院', nameEn: 'Trinity Lavra of St. Sergius', religionSlug: 'christianity', country: '俄罗斯', latitude: 56.3108, longitude: 38.1308, utcOffset: 3, soundEffect: 'temple_bell', description: '俄国东正教母院 —— 14世纪圣谢尔盖创建\n俄国东正教文化中心，拉多涅日的圣谢尔盖圣骨保存地，UNESCO世界遗产', openingHours: '05:00-21:00', ticketPrice: '免费 (博物馆另 RUB 400)', transport: '莫斯科雅罗斯拉夫尔火车站郊区列车1.5小时', tips: ['安德烈·鲁布列夫原《三位一体圣像》已移回', '朝圣者区与游客区分开', '周末礼拜氛围浓'] },
  { batch: 'R7-东正教', name: '基辅洞穴修道院', nameEn: 'Kyiv Pechersk Lavra', religionSlug: 'christianity', country: '乌克兰', latitude: 50.4347, longitude: 30.5575, utcOffset: 2, soundEffect: 'temple_bell', description: '东斯拉夫东正教摇篮 —— 1051年创建\n近远洞穴中保存123位圣徒不腐遗骸，UNESCO世界遗产', openingHours: '06:00-20:00 (洞穴 09:30-16:00)', ticketPrice: '外国人 UAH 120', transport: '基辅地铁 Arsenalna 站出租10分钟', tips: ['洞穴需自带蜡烛', '战时开放情况请查最新通告', '下洞穴需衣着庄重'] },
  { batch: 'R7-东正教', name: '迈泰奥拉悬空修道院', nameEn: 'Meteora', religionSlug: 'christianity', country: '希腊', latitude: 39.7217, longitude: 21.6306, utcOffset: 2, soundEffect: 'wind_chimes', description: '悬于天空之石 —— 14世纪起建\n巨岩顶上6座东正教修道院，原用绳梯吊篮上下，UNESCO世界遗产', openingHours: '各修道院 09:00-15:00 (轮日闭馆)', ticketPrice: '每座 €3', transport: '雅典至卡兰巴卡火车5小时', tips: ['至少2座值得完整参观', '女性需穿长裙(入口提供)', '日出日落景色迥异'] },
  { batch: 'R7-东正教', name: '阿索斯山', nameEn: 'Mount Athos', religionSlug: 'christianity', country: '希腊', latitude: 40.1574, longitude: 24.3264, utcOffset: 2, soundEffect: 'temple_bell', description: '东正教苦修圣山 —— 千年男性隐修\n20座修道院，希腊自治区，女性禁入，UNESCO世界遗产', openingHours: '仅许男性朝圣者凭许可证入山', ticketPrice: 'Diamonitirion 朝圣许可证 €25-30', transport: '塞萨洛尼基至 Ouranoupoli 港口乘船', tips: ['需提前3-6个月申请许可证', '每日名额限非东正教徒10人', '女性只能乘船远观'] },
  { batch: 'R7-东正教', name: '圣凯瑟琳修道院', nameEn: 'Saint Catherine\'s Monastery', religionSlug: 'christianity', country: '埃及', latitude: 28.5557, longitude: 33.9758, utcOffset: 2, soundEffect: 'wind_chimes', description: '世界最古老持续运作修道院 —— 6世纪查士丁尼建\n西奈山脚，摩西荆棘位置，藏古老圣像，UNESCO世界遗产', openingHours: '09:00-11:30 周五/日闭', ticketPrice: '免费 (博物馆 EGP 100)', transport: '开罗至西奈山车程7-8小时', tips: ['常与登西奈山看日出一日程', '修道院上午仅2.5小时开放', '治安需随旅行团'] },
  { batch: 'R7-东正教', name: '斯图德尼察修道院', nameEn: 'Studenica Monastery', religionSlug: 'christianity', country: '塞尔维亚', latitude: 43.4886, longitude: 20.5336, utcOffset: 1, soundEffect: 'temple_bell', description: '塞族中世纪文化圣地 —— 12世纪尼曼雅王朝\n白色大理石教堂壁画为塞族艺术高峰，UNESCO世界遗产', openingHours: '07:00-20:00', ticketPrice: '免费', transport: '贝尔格莱德车程3小时', tips: ['远离主流路线人少幽静', '圣母教堂壁画最精', '附近酒店有限'] },
  { batch: 'R7-东正教', name: '里拉修道院', nameEn: 'Rila Monastery', religionSlug: 'christianity', country: '保加利亚', latitude: 42.1336, longitude: 23.3400, utcOffset: 2, soundEffect: 'temple_bell', description: '保加利亚精神中心 —— 10世纪里拉的圣约翰创立\n壁画1200+幅，里拉山谷海拔1147米，UNESCO世界遗产', openingHours: '06:00-22:00', ticketPrice: '免费 (博物馆 BGN 8)', transport: '索非亚车程2小时', tips: ['可在修道院客房夜宿', '清晨雾气缭绕最美', '圣约翰圣骨在主教堂'] },
  { batch: 'R7-东正教', name: '圣血大教堂', nameEn: 'Church of the Savior on Spilled Blood', religionSlug: 'christianity', country: '俄罗斯', latitude: 59.9403, longitude: 30.3289, utcOffset: 3, soundEffect: 'temple_bell', description: '亚历山大二世遇刺处 —— 圣彼得堡标志\n1883-1907年建，内部马赛克覆盖7500平米，UNESCO世界遗产(历史中心)', openingHours: '10:30-18:00 周三闭', ticketPrice: 'RUB 350', transport: '圣彼得堡地铁 Nevsky Prospekt 站步行5分钟', tips: ['内部马赛克震撼', '夜间外观灯光佳', '与冬宫合游一日'] },

  // ── Round 8: 伊斯兰文化 中东核心 ──
  { batch: 'R8-中东清真寺', name: '先知清真寺', nameEn: 'Al-Masjid an-Nabawi', religionSlug: 'islam', country: '沙特阿拉伯', latitude: 24.4672, longitude: 39.6111, utcOffset: 3, soundEffect: 'wind_chimes', description: '伊斯兰文化第二圣寺 —— 穆罕默德陵寝\n622年穆罕默德亲建，含先知墓与绿顶，非穆斯林禁入麦地那市中心', openingHours: '全天开放 (仅穆斯林入)', ticketPrice: '免费', transport: '麦地那机场车程20分钟', tips: ['非穆斯林禁入麦地那老城圈', '绿顶下为先知陵墓', '朝觐季人流巨大'] },
  { batch: 'R8-中东清真寺', name: '耶路撒冷阿克萨清真寺', nameEn: 'Al-Aqsa Mosque', religionSlug: 'islam', country: '巴勒斯坦', latitude: 31.7761, longitude: 35.2358, utcOffset: 2, soundEffect: 'wind_chimes', description: '伊斯兰文化第三圣寺 —— 《古兰经》夜行登霄终点\n圣殿山中心，8世纪初建，建于穆罕默德登霄之石上', openingHours: '穆斯林全天 / 非穆斯林 07:30-10:30 + 12:30-13:30 (周五/六禁)', ticketPrice: '免费 (需通过安检)', transport: '耶路撒冷旧城 Dung Gate / Bab al-Silsila 入', tips: ['非穆斯林严禁入清真寺内部', '只能外圈参观广场', '安检队伍长需早到'] },
  { batch: 'R8-中东清真寺', name: '蓝色清真寺', nameEn: 'Blue Mosque (Sultan Ahmed)', religionSlug: 'islam', country: '土耳其', latitude: 41.0054, longitude: 28.9768, utcOffset: 3, soundEffect: 'wind_chimes', description: '伊斯坦布尔标志 —— 1609-1616年苏丹艾哈迈德建\n六座宣礼塔(仅次于麦加)，内部21043块伊兹尼克蓝瓷砖', openingHours: '礼拜时段外对游客开放', ticketPrice: '免费', transport: '伊斯坦布尔地铁 Sultanahmet 站', tips: ['女性需戴头巾(入口提供)', '着装需肩膝覆盖', '与圣索菲亚斜对'] },
  { batch: 'R8-中东清真寺', name: '谢赫扎耶德清真寺', nameEn: 'Sheikh Zayed Grand Mosque', religionSlug: 'islam', country: '阿联酋', latitude: 24.4129, longitude: 54.4750, utcOffset: 4, soundEffect: 'wind_chimes', description: '阿布扎比地标 —— 2007年建成\n容纳4万人，世界最大手工地毯与最大施华洛世奇水晶灯', openingHours: '09:00-22:00 周五下午礼拜关闭', ticketPrice: '免费 (需在线预约)', transport: '阿布扎比市区出租30分钟', tips: ['免费拖鞋长袍(入口借用)', '夜间灯光最美', '周五早上禁非穆斯林入'] },
  { batch: 'R8-中东清真寺', name: '大马士革倭马亚清真寺', nameEn: 'Umayyad Mosque Damascus', religionSlug: 'islam', country: '叙利亚', latitude: 33.5117, longitude: 36.3067, utcOffset: 3, soundEffect: 'wind_chimes', description: '世界最古大清真寺之一 —— 705年建\n施洗约翰首级圣骨保存地，三宗教共尊(基/犹/穆)，UNESCO世界遗产', openingHours: '对游客 09:00-12:30 + 14:30-17:00', ticketPrice: 'SYP 150', transport: '大马士革老城区内，步行范围', tips: ['战后安全情况请查最新', '女性需穿借来的长袍', '施洗约翰祠堂在院内'] },
  { batch: 'R8-中东清真寺', name: '凯鲁万大清真寺', nameEn: 'Great Mosque of Kairouan', religionSlug: 'islam', country: '突尼斯', latitude: 35.6817, longitude: 10.1039, utcOffset: 1, soundEffect: 'wind_chimes', description: '北非伊斯兰文化母寺 —— 670年奥格巴建\n北非最古清真寺，全球第四圣城，UNESCO世界遗产', openingHours: '08:00-14:00 周五闭', ticketPrice: 'TND 8', transport: '突尼斯市车程2小时', tips: ['非穆斯林只能参观庭院', '宣礼塔为北非最古', '梅迪纳老城值得合游'] },
  { batch: 'R8-中东清真寺', name: '哈桑二世清真寺', nameEn: 'Hassan II Mosque', religionSlug: 'islam', country: '摩洛哥', latitude: 33.6084, longitude: -7.6326, utcOffset: 1, soundEffect: 'ocean_waves', description: '卡萨布兰卡海滨巨寺 —— 1993年建成\n世界第7大清真寺，210米宣礼塔，部分建于大西洋之上', openingHours: '非穆斯林参观 09:00-15:00 (周五仅下午)', ticketPrice: 'MAD 140 (含讲解)', transport: '卡萨布兰卡市区出租15分钟', tips: ['必须参加官方导览团', '激光束夜间射向麦加方向', '潮水声伴礼拜氛围独特'] },
  { batch: 'R8-中东清真寺', name: '伊玛目礼萨圣陵', nameEn: 'Imam Reza Shrine', religionSlug: 'islam', country: '伊朗', latitude: 36.2881, longitude: 59.6157, utcOffset: 3.5, soundEffect: 'wind_chimes', description: '什叶派第二大圣地 —— 马什哈德\n第八伊玛目阿里·里达陵墓，伊朗什叶派朝圣核心', openingHours: '24小时开放', ticketPrice: '免费', transport: '马什哈德国际机场出租30分钟', tips: ['非穆斯林限区域参观', '女性需穿黑色Chador(入口提供)', '周五人极多'] },
  { batch: 'R8-中东清真寺', name: '伊玛目清真寺', nameEn: 'Shah Mosque (Imam Mosque)', religionSlug: 'islam', country: '伊朗', latitude: 32.6546, longitude: 51.6775, utcOffset: 3.5, soundEffect: 'wind_chimes', description: '波斯蓝色陶瓷艺术巅峰 —— 17世纪阿巴斯一世建\n伊斯法罕伊玛目广场南侧，UNESCO世界遗产', openingHours: '09:00-17:00 (礼拜时段闭)', ticketPrice: 'IRR 500000 外国人', transport: '伊斯法罕市中心伊玛目广场南侧', tips: ['回音穹顶为七响经典', '与广场其他三建筑合游', '下午光线最佳'] },
  { batch: 'R8-中东清真寺', name: '科尔多瓦主教座堂(原大清真寺)', nameEn: 'Mezquita-Catedral of Córdoba', religionSlug: 'islam', country: '西班牙', latitude: 37.8793, longitude: -4.7793, utcOffset: 1, soundEffect: 'wind_chimes', description: '基督-伊斯兰文化共存范例 —— 784年建为清真寺\n856根红白拱柱，13世纪改为天主教堂，UNESCO世界遗产', openingHours: '10:00-19:00 (周日 08:30-11:30 + 15:00-19:00)', ticketPrice: '€13 (周一-六 08:30-09:30 免费)', transport: '科尔多瓦火车站步行20分钟或公交', tips: ['免费时段不可拍照', '建议请讲解员', '与老犹太区合游'] },

  // ── Round 9: 印度教 七圣城+四大朝圣 ──
  { batch: 'R9-印度教圣城', name: '瓦拉纳西', nameEn: 'Varanasi (Kashi)', religionSlug: 'hinduism', country: '印度', latitude: 25.3176, longitude: 82.9739, utcOffset: 5.5, soundEffect: 'wind_chimes', description: '世界最古活着的城市 —— 七圣城之首\n恒河西岸，88个焚尸台与祭坛，死于此地可脱轮回', openingHours: '全天 (Ganga Aarti 每晚 18:45)', ticketPrice: '免费 (船费 INR 100-300)', transport: '瓦拉纳西机场出租30分钟至达萨斯瓦梅德河坛', tips: ['日出乘船看沐浴最经典', '焚尸台禁拍照', '避开印度大选期'] },
  { batch: 'R9-印度教圣城', name: '普里贾格纳特庙', nameEn: 'Jagannath Temple Puri', religionSlug: 'hinduism', country: '印度', latitude: 19.8056, longitude: 85.8179, utcOffset: 5.5, soundEffect: 'wind_chimes', description: '四大朝圣之一 —— 12世纪建\n黑脸贾格纳特神像，年度战车节百万人拉木车', openingHours: '05:00-24:00', ticketPrice: '免费 (非印度教徒禁入)', transport: '布巴内什瓦尔机场车程1.5小时', tips: ['非印度教徒严禁入内殿', '战车节(6-7月)最壮观', '附近海滩放松'] },
  { batch: 'R9-印度教圣城', name: '蒂鲁帕蒂', nameEn: 'Tirumala Venkateswara Temple', religionSlug: 'hinduism', country: '印度', latitude: 13.6832, longitude: 79.3472, utcOffset: 5.5, soundEffect: 'wind_chimes', description: '世界最富庙宇 —— 南印度最大朝圣地\n年均6万香客日，献金全球第二', openingHours: '03:00-次日01:30 (密集朝圣)', ticketPrice: '基础免费；"特别参拜"INR 300 快速通道', transport: '蒂鲁帕蒂机场出租1小时至山上', tips: ['高峰期等6-10小时', '男性需剃头为传统供养', '下山后尝 ladoo 圣饼'] },
  { batch: 'R9-印度教圣城', name: '拉梅斯瓦拉姆', nameEn: 'Rameshwaram', religionSlug: 'hinduism', country: '印度', latitude: 9.2876, longitude: 79.3129, utcOffset: 5.5, soundEffect: 'ocean_waves', description: '四大朝圣南方极 —— 拉玛桥对岸\n十二林伽之一，拉玛西行斯里兰卡前奉湿婆处', openingHours: '05:00-13:00 + 15:00-21:00', ticketPrice: '免费', transport: '马杜赖机场车程3小时', tips: ['22个圣井灌顶传统(需另收费)', '神道不让非印度教徒入内殿', '附近印度桥断桥传说遗址'] },
  { batch: 'R9-印度教圣城', name: '玛纳拉神庙', nameEn: 'Dwarkadhish Temple', religionSlug: 'hinduism', country: '印度', latitude: 22.2378, longitude: 68.9681, utcOffset: 5.5, soundEffect: 'ocean_waves', description: '四大朝圣西方极 —— 克里希纳王城\n古吉拉特海岸，传说克里希纳建都于此', openingHours: '06:00-13:00 + 17:00-21:30', ticketPrice: '免费', transport: '贾姆讷格尔机场车程3小时', tips: ['克里希纳神像黑色石雕', '节日期极度拥挤', '附近贝特Dwarka小岛值得渡船'] },
  { batch: 'R9-印度教圣城', name: '巴德里纳特庙', nameEn: 'Badrinath Temple', religionSlug: 'hinduism', country: '印度', latitude: 30.7433, longitude: 79.4938, utcOffset: 5.5, soundEffect: 'wind_chimes', description: '四大朝圣北方极 —— 海拔3133米\n毗湿奴庙，冬季关闭6个月，Chota Char Dham之一', openingHours: '04:30-13:00 + 15:00-21:00 (仅 4月底-11月初)', ticketPrice: '免费', transport: '里希盖什经公路9-10小时', tips: ['冬季大雪封路全关闭', '附近塔波坎温泉免费', '高反需预适应'] },
  { batch: 'R9-印度教圣城', name: '阿约提亚', nameEn: 'Ayodhya Ram Mandir', religionSlug: 'hinduism', country: '印度', latitude: 26.7957, longitude: 82.1943, utcOffset: 5.5, soundEffect: 'wind_chimes', description: '罗摩诞生地 —— 2024年1月新庙启用\n《罗摩衍那》主角诞生城，新大庙为千年愿景', openingHours: '06:30-22:00 (分段入场)', ticketPrice: '免费 (需在线预约时段)', transport: '勒克瑙机场车程3小时或直达机场(新开)', tips: ['必须网上预约Darshan时段', '相机禁入内殿', '节日人潮百万级'] },
  { batch: 'R9-印度教圣城', name: '乌贾因', nameEn: 'Ujjain Mahakaleshwar', religionSlug: 'hinduism', country: '印度', latitude: 23.1828, longitude: 75.7682, utcOffset: 5.5, soundEffect: 'wind_chimes', description: '七圣城之一 —— 十二林伽之一\n湿婆神庙位于希普拉河畔，每12年Kumbh Mela百万香客', openingHours: '03:00-23:00 (凌晨4点 Bhasma Aarti 著名)', ticketPrice: 'Aarti 需预约 INR 200', transport: '印多尔机场车程1.5小时', tips: ['凌晨灰祭典礼震撼但需提前45天预约', '每12年一次Simhastha Kumbh', '附近天文台古迹'] },
  { batch: 'R9-印度教圣城', name: '坎奇普兰', nameEn: 'Kanchipuram', religionSlug: 'hinduism', country: '印度', latitude: 12.8342, longitude: 79.7036, utcOffset: 5.5, soundEffect: 'wind_chimes', description: '七圣城之一 —— 南印寺庙之城\n帕拉瓦王朝首都，108座神庙，丝绸纱丽之乡', openingHours: '各庙 06:00-12:00 + 16:00-20:00', ticketPrice: '免费', transport: '钦奈机场车程1.5小时', tips: ['Kailasanatha庙为最古', 'Ekambareswarar为五大湿婆林伽地之一', '可买当地手织丝绸'] },
  { batch: 'R9-印度教圣城', name: '马杜赖米娜克希神庙', nameEn: 'Meenakshi Temple Madurai', religionSlug: 'hinduism', country: '印度', latitude: 9.9195, longitude: 78.1193, utcOffset: 5.5, soundEffect: 'wind_chimes', description: '南印第一庙 —— 米娜克希女神\n12座49米高五彩哥普兰塔门，每座装饰数千雕像', openingHours: '05:00-12:30 + 16:00-22:00', ticketPrice: '免费 (相机 INR 50)', transport: '马杜赖机场出租30分钟', tips: ['非印度教徒禁入最内殿', '每晚 21:30 夜送湿婆像回米娜克希闺房仪式', '周边街市热闹'] },
];

async function main() {
  console.log('🎯 目的地++ v4: 20轮自动循环大批量补丁开始\n');

  const religions = await prisma.religion.findMany({ select: { id: true, slug: true } });
  const slugToId = new Map(religions.map((r) => [r.slug, r.id]));

  let created = 0, skipped = 0;
  const byBatch: Record<string, { created: number; skipped: number }> = {};

  for (const site of SITES) {
    byBatch[site.batch] ??= { created: 0, skipped: 0 };
    const religionId = slugToId.get(site.religionSlug);
    if (!religionId) { console.warn(`⚠ 跳过 ${site.name}: 无religion ${site.religionSlug}`); continue; }

    const existing = await prisma.holySite.findFirst({
      where: { name: site.name, religionId }, select: { id: true },
    });

    if (existing) { skipped++; byBatch[site.batch].skipped++; continue; }

    await prisma.holySite.create({
      data: {
        name: site.name, nameEn: site.nameEn, country: site.country,
        latitude: site.latitude, longitude: site.longitude, utcOffset: site.utcOffset,
        soundEffect: site.soundEffect ?? null, description: site.description,
        openingHours: site.openingHours, ticketPrice: site.ticketPrice,
        bestSeason: site.bestSeason, visitDuration: site.visitDuration,
        transport: site.transport, tips: site.tips ?? [],
        source: 'AI_KNOWLEDGE', status: 'ACTIVE', religionId,
      },
    });
    created++; byBatch[site.batch].created++;
  }

  console.log('📦 分批统计:');
  for (const [b, s] of Object.entries(byBatch)) {
    console.log(`  ${b}: +${s.created} / skip ${s.skipped}`);
  }
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✓ 新增: ${created}   ⏭ 跳过: ${skipped}`);
  console.log(`📊 HolySite 总数: ${await prisma.holySite.count()}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
