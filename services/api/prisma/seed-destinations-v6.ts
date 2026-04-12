/**
 * seed-destinations-v6.ts — 目的地++ rounds 20-23 (冲刺 20 轮)
 *
 * R20-佛教东南亚 / R21-伊斯兰中亚&东南亚 / R22-基督拉美非洲 / R23-跨文化补强 = 40 个真实目的地
 * 幂等: findFirst(name+religionId)
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface S {
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
  batch: string;
}

const SITES: S[] = [
  // R20 佛教东南亚 +10
  { name: '瑞光大金塔', nameEn: 'Shwedagon Pagoda', religionSlug: 'buddhism', country: '缅甸', latitude: 16.7981, longitude: 96.1497, utcOffset: 6.5, soundEffect: 'temple_bell', description: '2600年历史，藏佛陀八根发舍利，通体金箔', openingHours: '04:00-22:00', ticketPrice: '外宾 $10', bestSeason: '11-2月', visitDuration: '2-3小时', transport: '仰光市中心北部，出租车15分钟', tips: ['入内脱鞋脱袜', '着肩膝覆盖服装', '日落时分景观最佳'], batch: 'R20-佛教东南亚' },
  { name: '瑞喜光塔', nameEn: 'Shwezigon Pagoda', religionSlug: 'buddhism', country: '缅甸', latitude: 21.1939, longitude: 94.8919, utcOffset: 6.5, soundEffect: 'temple_bell', description: '蒲甘最古塔之一，1102年阿奴律陀王建', openingHours: '06:00-21:00', ticketPrice: '蒲甘考古区 $25/多日', bestSeason: '10-3月', visitDuration: '1.5小时', transport: '娘乌镇电瓶车5分钟', tips: ['脱鞋入塔区', '热季地面烫脚带袜子', '附近娘乌夜市值得逛'], batch: 'R20-佛教东南亚' },
  { name: '阿难陀寺', nameEn: 'Ananda Temple', religionSlug: 'buddhism', country: '缅甸', latitude: 21.1706, longitude: 94.8689, utcOffset: 6.5, soundEffect: 'temple_bell', description: '蒲甘最美寺庙，1105年，四尊9.5米立佛', openingHours: '07:00-18:00', ticketPrice: '含蒲甘通票', bestSeason: '10-3月', visitDuration: '1-1.5小时', transport: '蒲甘老城电瓶车10分钟', tips: ['脱鞋入内', '四立佛从不同距离表情不同', '1月阿难陀节盛会'], batch: 'R20-佛教东南亚' },
  { name: '马哈伽纳扬僧院', nameEn: 'Mahagandhayon Monastery', religionSlug: 'buddhism', country: '缅甸', latitude: 21.8904, longitude: 96.0539, utcOffset: 6.5, soundEffect: 'temple_bell', description: '缅甸最大僧院，千僧齐列托钵', openingHours: '托钵时间10:15', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '30分钟', transport: '曼德勒阿玛拉布拉区出租20分钟', tips: ['10:15准时千僧托钵', '切勿阻挡通道', '摄像保持距离尊重'], batch: 'R20-佛教东南亚' },
  { name: '帕蓬寺', nameEn: 'Wat Pah Pong', religionSlug: 'buddhism', country: '泰国', latitude: 15.1639, longitude: 104.7903, utcOffset: 7, soundEffect: 'temple_bell', description: '阿姜查森林道场总寺，国际森林派中心', openingHours: '05:00-20:00', ticketPrice: '免费', bestSeason: '11-2月', visitDuration: '半天', transport: '乌汶府租车30分钟', tips: ['可申请短期禁语禅修', '需提前邮件联系', '着白色朴素衣'], batch: 'R20-佛教东南亚' },
  { name: '卧佛寺', nameEn: 'Wat Pho', religionSlug: 'buddhism', country: '泰国', latitude: 13.7465, longitude: 100.4927, utcOffset: 7, soundEffect: 'temple_bell', description: '曼谷最古寺，46米金色卧佛像，泰式按摩发源地', openingHours: '08:00-18:30', ticketPrice: '200 泰铢', bestSeason: '11-2月', visitDuration: '2小时', transport: '地铁MRT Sanam Chai站步行5分钟', tips: ['入大殿脱鞋', '寺内按摩学校体验正宗泰式按摩', '周日旁边大皇宫可顺道'], batch: 'R20-佛教东南亚' },
  { name: '婆罗浮屠', nameEn: 'Borobudur', religionSlug: 'buddhism', country: '印尼', latitude: -7.6079, longitude: 110.2038, utcOffset: 7, soundEffect: 'temple_bell', description: '世界最大佛塔，9世纪夏连特拉王朝，UNESCO', openingHours: '06:30-17:00', ticketPrice: '外宾 Rp 375,000', bestSeason: '5-9月干季', visitDuration: '3-4小时', transport: '日惹市自驾1小时', tips: ['日出套票需日惹Manohara酒店订', '登塔现需预约导览', '浮雕环绕逐层升进象征修行'], batch: 'R20-佛教东南亚' },
  { name: '吴哥窟', nameEn: 'Angkor Wat', religionSlug: 'buddhism', country: '柬埔寨', latitude: 13.4125, longitude: 103.8670, utcOffset: 7, soundEffect: 'temple_bell', description: '世界最大宗教建筑，12世纪，印度教转佛教圣地', openingHours: '05:00-17:30', ticketPrice: '1日 $37 / 3日 $62 / 7日 $72', bestSeason: '11-3月', visitDuration: '1-3天', transport: '暹粒市突突车20分钟', tips: ['日出从西门入最佳', '需通票现场拍照', '禁止爬上中央塔(除特定时段)'], batch: 'R20-佛教东南亚' },
  { name: '西娘寺', nameEn: 'That Luang', religionSlug: 'buddhism', country: '老挝', latitude: 17.9757, longitude: 102.6318, utcOffset: 7, soundEffect: 'temple_bell', description: '老挝国徽符号，1566年塞塔提腊王，金色塔寺', openingHours: '08:00-16:00', ticketPrice: '10,000 基普', bestSeason: '11-2月', visitDuration: '1小时', transport: '万象市中心东北4公里', tips: ['11月塔銮节最盛', '外围可绕行内部需购票', '着肩膝覆盖服装'], batch: 'R20-佛教东南亚' },
  { name: '玉佛寺', nameEn: 'Wat Phra Kaew', religionSlug: 'buddhism', country: '泰国', latitude: 13.7515, longitude: 100.4925, utcOffset: 7, soundEffect: 'temple_bell', description: '泰国最高圣寺，大皇宫内，供奉玉佛', openingHours: '08:30-15:30', ticketPrice: '500 泰铢(含大皇宫)', bestSeason: '11-2月', visitDuration: '2-3小时', transport: 'BTS Saphan Taksin换船Tha Chang码头步行10分钟', tips: ['严格着装(长裤长袖)', '门口可租衣', '玉佛每季换金袍由国王主持'], batch: 'R20-佛教东南亚' },

  // R21 伊斯兰中亚&东南亚 +10
  { name: '比比哈努姆清真寺', nameEn: 'Bibi-Khanym Mosque', religionSlug: 'islam', country: '乌兹别克斯坦', latitude: 39.6616, longitude: 66.9789, utcOffset: 5, soundEffect: 'wind_chimes', description: '撒马尔罕帖木儿为爱妻建，15世纪中亚最大清真寺', openingHours: '08:00-19:00', ticketPrice: '30,000 苏姆', bestSeason: '4-6/9-10月', visitDuration: '1.5小时', transport: '撒马尔罕市中心步行可达', tips: ['穹顶重建后可登顶', '邻近西亚布古墓群', '比比哈努姆节穆斯林女性专属祈愿日'], batch: 'R21-伊斯兰中亚' },
  { name: '雷吉斯坦广场', nameEn: 'Registan', religionSlug: 'islam', country: '乌兹别克斯坦', latitude: 39.6547, longitude: 66.9758, utcOffset: 5, soundEffect: 'wind_chimes', description: '中亚心脏 — 三座经学院环抱广场，世遗', openingHours: '08:00-19:00 (夜场另购)', ticketPrice: '50,000 苏姆', bestSeason: '4-6/9-10月', visitDuration: '2-3小时', transport: '撒马尔罕市中心步行5分钟', tips: ['黄昏光线最佳', '塔登顶需额外付费小费', '夜场灯光秀每周六'], batch: 'R21-伊斯兰中亚' },
  { name: '希瓦伊钦古城', nameEn: 'Itchan Kala', religionSlug: 'islam', country: '乌兹别克斯坦', latitude: 41.3783, longitude: 60.3638, utcOffset: 5, soundEffect: 'wind_chimes', description: '丝路绿洲古城，20+清真寺与经学院，UNESCO', openingHours: '全天开放', ticketPrice: '150,000 苏姆 2日通票', bestSeason: '4-5/9-10月', visitDuration: '1-2天', transport: '乌尔根奇机场出租30分钟', tips: ['夏季极热', '住内城民宿最佳', '卡塔米诺雷塔登顶俯瞰'], batch: 'R21-伊斯兰中亚' },
  { name: '波克拉里扬经学院', nameEn: 'Poi Kalyan', religionSlug: 'islam', country: '乌兹别克斯坦', latitude: 39.7759, longitude: 64.4145, utcOffset: 5, soundEffect: 'wind_chimes', description: '布哈拉双塔建筑群，46米卡利扬宣礼塔12世纪', openingHours: '08:00-18:00', ticketPrice: '30,000 苏姆', bestSeason: '4-5/9-10月', visitDuration: '2小时', transport: '布哈拉古城中心步行', tips: ['登塔俯瞰古城', '毗邻蓄水池区有传统澡堂', '周五中午聚礼本地人多'], batch: 'R21-伊斯兰中亚' },
  { name: '伊斯坦布尔苏菲道场', nameEn: 'Galata Mevlevi Museum', religionSlug: 'islam', country: '土耳其', latitude: 41.0281, longitude: 28.9773, utcOffset: 3, soundEffect: 'wind_chimes', description: '旋转托钵僧道场，莫拉纳苏菲派17世纪', openingHours: '09:00-18:30 (周一闭)', ticketPrice: '200 里拉(含仪式)', bestSeason: '4-10月', visitDuration: '2小时', transport: '伊斯坦布尔Tünel站步行3分钟', tips: ['每周日17点旋转仪式', '仪式中不可拍照', '可提前官网订票'], batch: 'R21-伊斯兰中亚' },
  { name: '伊斯蒂克拉尔清真寺', nameEn: 'Istiqlal Mosque', religionSlug: 'islam', country: '印尼', latitude: -6.1702, longitude: 106.8317, utcOffset: 7, soundEffect: 'wind_chimes', description: '东南亚最大清真寺，1978年，可容纳12万人', openingHours: '04:00-22:00 (非穆斯林 09:00-17:00)', ticketPrice: '免费', bestSeason: '5-9月干季', visitDuration: '1-1.5小时', transport: '雅加达Juanda站步行10分钟', tips: ['非穆斯林免费导览', '对面即天主教堂象征印尼宗教共存', '周五聚礼不对游客开放'], batch: 'R21-伊斯兰东南亚' },
  { name: '马来西亚国家清真寺', nameEn: 'Masjid Negara', religionSlug: 'islam', country: '马来西亚', latitude: 3.1419, longitude: 101.6914, utcOffset: 8, soundEffect: 'wind_chimes', description: '吉隆坡国家清真寺，独立象征，1965年', openingHours: '09:00-12:00/15:00-16:00/17:30-18:30 (周五下午闭)', ticketPrice: '免费', bestSeason: '5-9月', visitDuration: '1小时', transport: 'KL Sentral站步行10分钟', tips: ['非穆斯林免费借长袍入内', '祈祷时间谢绝参观', '穹顶73米象征十三州+60代理'], batch: 'R21-伊斯兰东南亚' },
  { name: '文莱苏丹奥玛尔清真寺', nameEn: 'Sultan Omar Ali Saifuddin Mosque', religionSlug: 'islam', country: '文莱', latitude: 4.8873, longitude: 114.9324, utcOffset: 8, soundEffect: 'wind_chimes', description: '1958年，金色穹顶3300万块马赛克', openingHours: '08:00-12:00/14:00-15:00/17:00-18:00 (周四闭)', ticketPrice: '免费', bestSeason: '全年', visitDuration: '1小时', transport: '斯里巴加湾市中心步行', tips: ['女性需全身覆盖', '现场免费借长袍头巾', '夜晚灯光映湖极美'], batch: 'R21-伊斯兰东南亚' },
  { name: '阿不都拉哈曼清真寺', nameEn: 'Masjid Kristal', religionSlug: 'islam', country: '马来西亚', latitude: 5.3000, longitude: 103.1294, utcOffset: 8, soundEffect: 'wind_chimes', description: '登嘉楼水晶清真寺，钢铁玻璃结构2008年', openingHours: '10:00-22:00', ticketPrice: '免费', bestSeason: '3-9月', visitDuration: '1.5小时', transport: '瓜拉登嘉楼机场出租20分钟', tips: ['夜晚灯光秀最佳', '入内免费借袍', '清真寺旁伊斯兰文明公园有25微缩建筑'], batch: 'R21-伊斯兰东南亚' },
  { name: '雅玛清真寺', nameEn: 'Jama Masjid Delhi', religionSlug: 'islam', country: '印度', latitude: 28.6507, longitude: 77.2334, utcOffset: 5.5, soundEffect: 'wind_chimes', description: '印度最大清真寺，1656年沙贾汗建，可容2.5万人', openingHours: '07:00-12:00/13:30-18:30 (祈祷时闭)', ticketPrice: '免费(相机 300卢比)', bestSeason: '10-3月', visitDuration: '1-1.5小时', transport: '德里地铁Chandni Chowk站步行10分钟', tips: ['登南塔俯瞰旧德里', '着装严格头巾袍现场借', '周五聚礼人极多'], batch: 'R21-伊斯兰南亚' },

  // R22 基督拉美&非洲 +10
  { name: '瓜达卢佩圣母殿', nameEn: 'Basilica of Our Lady of Guadalupe', religionSlug: 'christianity', country: '墨西哥', latitude: 19.4849, longitude: -99.1177, utcOffset: -6, soundEffect: 'church_bell', description: '美洲最大朝圣地，1531年显圣像，年访2千万', openingHours: '06:00-21:00', ticketPrice: '免费', bestSeason: '11-4月 (12月12日瞻礼)', visitDuration: '2-3小时', transport: '墨西哥城地铁La Villa站步行5分钟', tips: ['旧殿因地基下沉倾斜', '新殿圣像自动传送带通过', '12月12日朝圣潮数百万人'], batch: 'R22-基督拉美' },
  { name: '里约热内卢救世基督像', nameEn: 'Christ the Redeemer', religionSlug: 'christianity', country: '巴西', latitude: -22.9519, longitude: -43.2105, utcOffset: -3, soundEffect: 'church_bell', description: '世界新七大奇迹，38米像立710米山顶1931年', openingHours: '08:00-19:00', ticketPrice: 'R$ 99 旺季', bestSeason: '4-10月干季', visitDuration: '半天', transport: '科尔科瓦多齿轨小火车，20分钟上山', tips: ['雨季云雾多选早晨', '官网预订快速通道', '脚下可俯瞰面包山糖果山'], batch: 'R22-基督拉美' },
  { name: '阿帕雷西达圣母大殿', nameEn: 'Basilica of Aparecida', religionSlug: 'christianity', country: '巴西', latitude: -22.8454, longitude: -45.2281, utcOffset: -3, soundEffect: 'church_bell', description: '世界第二大教堂，巴西主保圣地，黑圣母像', openingHours: '05:00-22:00', ticketPrice: '免费', bestSeason: '5-10月 (10月12日瞻礼)', visitDuration: '2-3小时', transport: '圣保罗长途汽车3小时', tips: ['10月12日巴西国庆朝圣潮', '黑圣母像19世纪河中捞起', '旧殿与新殿皆可参观'], batch: 'R22-基督拉美' },
  { name: '布宜诺斯艾利斯大都会座堂', nameEn: 'Buenos Aires Metropolitan Cathedral', religionSlug: 'christianity', country: '阿根廷', latitude: -34.6082, longitude: -58.3728, utcOffset: -3, soundEffect: 'church_bell', description: '方济各教宗原任主教座堂，新古典建筑', openingHours: '08:00-19:00', ticketPrice: '免费', bestSeason: '10-4月', visitDuration: '1小时', transport: '布宜诺斯Plaza de Mayo地铁A线', tips: ['圣马丁将军陵墓在内', '12点每日圣体降福', '殿内禁喧哗'], batch: 'R22-基督拉美' },
  { name: '波波克赖姆圣母像', nameEn: 'Lalibela Rock-Hewn Churches', religionSlug: 'christianity', country: '埃塞俄比亚', latitude: 12.0317, longitude: 39.0410, utcOffset: 3, soundEffect: 'church_bell', description: '11座岩凿教堂，12世纪，UNESCO，非洲新耶路撒冷', openingHours: '06:00-18:00', ticketPrice: '$50 5日通票', bestSeason: '10-3月', visitDuration: '2-3天', transport: '拉利贝拉机场出租15分钟', tips: ['1月7日圣诞千年朝圣', '脱鞋入内', '必雇本地导游讲述圣经故事'], batch: 'R22-基督非洲' },
  { name: '圣乔治教堂(拉利贝拉)', nameEn: 'Church of Saint George Lalibela', religionSlug: 'christianity', country: '埃塞俄比亚', latitude: 12.0317, longitude: 39.0414, utcOffset: 3, soundEffect: 'church_bell', description: '拉利贝拉最完美十字岩凿教堂', openingHours: '06:00-18:00', ticketPrice: '含拉利贝拉通票', bestSeason: '10-3月', visitDuration: '1小时', transport: '拉利贝拉城内步行', tips: ['从上方俯瞰十字形最经典', '内部光线昏暗带头灯', '只能特定日期入最深处'], batch: 'R22-基督非洲' },
  { name: '阿克苏姆锡安圣母堂', nameEn: 'Church of Our Lady Mary of Zion', religionSlug: 'christianity', country: '埃塞俄比亚', latitude: 14.1306, longitude: 38.7189, utcOffset: 3, soundEffect: 'church_bell', description: '传约柜安置地，4世纪埃塞最古教堂', openingHours: '08:00-17:00', ticketPrice: '200比尔', bestSeason: '10-3月', visitDuration: '1.5小时', transport: '阿克苏姆镇内步行', tips: ['约柜只守护僧可见', '女性只能进新堂', '11月玛丽安节盛会'], batch: 'R22-基督非洲' },
  { name: '开普敦圣乔治座堂', nameEn: "St. George's Cathedral Cape Town", religionSlug: 'christianity', country: '南非', latitude: -33.9270, longitude: 18.4199, utcOffset: 2, soundEffect: 'church_bell', description: '图图大主教反种族隔离讲台，1834年圣公会', openingHours: '07:30-17:00', ticketPrice: '免费', bestSeason: '全年 (南半球夏12-2月)', visitDuration: '1小时', transport: '开普敦国会大楼步行3分钟', tips: ['图图纪念馆在二楼', '周日11点圣餐礼', '馆内合唱团定期免费演出'], batch: 'R22-基督非洲' },
  { name: '阿雷奥帕谷圣母堂', nameEn: 'Yamoussoukro Basilica', religionSlug: 'christianity', country: '科特迪瓦', latitude: 6.8142, longitude: -5.2972, utcOffset: 0, soundEffect: 'church_bell', description: '世界最大天主教堂基尼斯纪录，1990年', openingHours: '08:30-17:00', ticketPrice: '2,000西非法郎', bestSeason: '11-3月', visitDuration: '2小时', transport: '亚穆苏克罗市中心步行', tips: ['穹顶高158米可登顶', '彩色玻璃进口自法国', '能容纳1.8万人'], batch: 'R22-基督非洲' },
  { name: '库斯科主教座堂', nameEn: 'Cusco Cathedral', religionSlug: 'christianity', country: '秘鲁', latitude: -13.5169, longitude: -71.9784, utcOffset: -5, soundEffect: 'church_bell', description: '印加神殿基座上建1654年，殖民艺术宝库', openingHours: '08:00-18:00', ticketPrice: '25 sol', bestSeason: '5-9月', visitDuration: '1.5小时', transport: '库斯科Plaza de Armas中心', tips: ['本土画派最后晚餐耶稣吃豚鼠', '内部禁拍照', '海拔3400米防高反'], batch: 'R22-基督拉美' },

  // R23 跨文化补强 +10
  { name: '安曼城堡山', nameEn: 'Amman Citadel', religionSlug: 'islam', country: '约旦', latitude: 31.9547, longitude: 35.9343, utcOffset: 3, soundEffect: 'wind_chimes', description: '倭马亚王朝宫殿+拜占庭教堂+罗马神庙遗址群', openingHours: '08:00-18:00', ticketPrice: '3 第纳尔', bestSeason: '3-5/9-11月', visitDuration: '2小时', transport: '安曼市中心出租10分钟', tips: ['俯瞰罗马剧场', '含考古博物馆', '下山可接罗马剧场一日游'], batch: 'R23-跨文化中东' },
  { name: '佩特拉修道院', nameEn: 'Petra Monastery', religionSlug: 'christianity', country: '约旦', latitude: 30.3310, longitude: 35.4357, utcOffset: 3, soundEffect: 'church_bell', description: '纳巴泰王国岩凿建筑，UNESCO七大奇迹', openingHours: '06:00-18:00 (夏季延至19:00)', ticketPrice: '50 第纳尔 1日', bestSeason: '3-5/9-11月', visitDuration: '全天', transport: 'Wadi Musa镇徒步入Siq峡谷', tips: ['至修道院需登850级台阶', '带2升水+防晒', '骑驴上山但建议徒步'], batch: 'R23-跨文化中东' },
  { name: '科尔多瓦犹太会堂', nameEn: 'Cordoba Synagogue', religionSlug: 'judaism', country: '西班牙', latitude: 37.8794, longitude: -4.7819, utcOffset: 1, soundEffect: 'wind_chimes', description: '1315年，西班牙仅存3座中世纪犹太会堂之一', openingHours: '09:30-19:30 (周一闭)', ticketPrice: '免费', bestSeason: '3-6/9-11月', visitDuration: '30分钟', transport: '科尔多瓦犹太区中心', tips: ['与托莱多会堂共为西班牙犹太遗产', '迈蒙尼德像在隔壁广场', '拉比厅泥塑花纹精美'], batch: 'R23-跨文化欧洲' },
  { name: '托莱多白色圣玛利亚会堂', nameEn: 'Santa Maria la Blanca', religionSlug: 'judaism', country: '西班牙', latitude: 39.8575, longitude: -4.0279, utcOffset: 1, soundEffect: 'wind_chimes', description: '12世纪欧洲最古犹太会堂之一(后改教堂)', openingHours: '10:00-18:45', ticketPrice: '€4', bestSeason: '3-6/9-11月', visitDuration: '30分钟', transport: '托莱多古城犹太区步行', tips: ['穆德哈尔风格马蹄拱', '下午光线最佳', '托莱多通票含此'], batch: 'R23-跨文化欧洲' },
  { name: '拜特谢阿林犹太陵墓', nameEn: 'Beit Shearim', religionSlug: 'judaism', country: '以色列', latitude: 32.7022, longitude: 35.1286, utcOffset: 2, soundEffect: 'wind_chimes', description: '2-4世纪犹太公会迁此，地下陵墓群UNESCO', openingHours: '08:00-17:00 (周五 -15:00)', ticketPrice: 'NIS 28', bestSeason: '春秋', visitDuration: '2小时', transport: '海法出租30分钟', tips: ['带手电入墓穴', '犹大公家族陵墓最精', '希伯来文铭刻珍贵'], batch: 'R23-跨文化中东' },
  { name: '阿姆利则杜加神庙', nameEn: 'Durgiana Temple', religionSlug: 'hinduism', country: '印度', latitude: 31.6301, longitude: 74.8763, utcOffset: 5.5, soundEffect: 'om_chant', description: '金庙印度教版本，大理石湖中殿', openingHours: '04:00-22:00', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '1-1.5小时', transport: '阿姆利则火车站步行15分钟', tips: ['与金庙相距2公里可一日游', '入内覆头', '晚间灯光映湖倒影'], batch: 'R23-跨文化南亚' },
  { name: '萨拉斯瓦蒂神庙班斯迪', nameEn: 'Basara Saraswathi Temple', religionSlug: 'hinduism', country: '印度', latitude: 18.8547, longitude: 77.9594, utcOffset: 5.5, soundEffect: 'om_chant', description: '印度三大萨拉斯瓦蒂神庙之一，学问之神', openingHours: '04:00-20:00', ticketPrice: '免费(特殊仪式 ₹100+)', bestSeason: '10-3月', visitDuration: '2小时', transport: '海德拉巴火车4小时', tips: ['儿童入学启蒙仪式Akshara Abhyasam盛行', '供奉米粉制笔记本', '戴赤足入殿'], batch: 'R23-跨文化南亚' },
  { name: '伊势神宫外宫', nameEn: 'Ise Geku', religionSlug: 'shinto', country: '日本', latitude: 34.4879, longitude: 136.7041, utcOffset: 9, soundEffect: 'wind_chimes', description: '丰受大神宫，食物之神祭祀，伊势神宫下宫', openingHours: '05:00-18:00 (季节变动)', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '1.5小时', transport: '伊势市站步行5分钟', tips: ['先外宫后内宫为传统礼', '禁拍摄正宫', '20年一度式年迁宫2013年最近'], batch: 'R23-跨文化日本' },
  { name: '大阪住吉大社', nameEn: 'Sumiyoshi Taisha', religionSlug: 'shinto', country: '日本', latitude: 34.6127, longitude: 135.4933, utcOffset: 9, soundEffect: 'taiko_drum', description: '1800年历史，住吉造建筑原型，航海守护神', openingHours: '06:00-17:00 (季节变动)', ticketPrice: '免费', bestSeason: '4月樱花/6月御田植神事', visitDuration: '1小时', transport: '南海电铁住吉大社站步行3分钟', tips: ['反桥需脱帽通过', '元旦三日参三百万人', '御田植神事国指定重要无形民俗'], batch: 'R23-跨文化日本' },
  { name: '曲阜周公庙', nameEn: 'Duke of Zhou Temple', religionSlug: 'confucianism', country: '中国', latitude: 35.6019, longitude: 116.9847, utcOffset: 8, soundEffect: 'wind_chimes', description: '周礼制礼作乐之源，孔子尊之为"吾梦见之"', openingHours: '08:00-17:00', ticketPrice: '¥50', bestSeason: '春秋', visitDuration: '1.5小时', transport: '曲阜市中心出租10分钟', tips: ['与孔庙孔府三孔通票可打包', '大成殿建筑群', '每年周公诞辰祭典'], batch: 'R23-跨文化儒家' },
];

async function main() {
  console.log('🎯 目的地++ v6: rounds 20-23\n');

  const religions = await prisma.religion.findMany({ select: { id: true, slug: true } });
  const slugToId = new Map(religions.map((r) => [r.slug, r.id]));

  let created = 0;
  let skipped = 0;
  const byBatch = new Map<string, { c: number; s: number }>();
  const missing: string[] = [];

  for (const site of SITES) {
    const religionId = slugToId.get(site.religionSlug);
    if (!religionId) {
      console.warn(`⚠️  跳过 ${site.name}: religion slug=${site.religionSlug}`);
      missing.push(site.name);
      continue;
    }

    const existing = await prisma.holySite.findFirst({
      where: { name: site.name, religionId },
      select: { id: true },
    });
    const rec = byBatch.get(site.batch) ?? { c: 0, s: 0 };

    if (existing) {
      rec.s++;
      byBatch.set(site.batch, rec);
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
    rec.c++;
    byBatch.set(site.batch, rec);
    created++;
  }

  console.log('📦 批次:');
  for (const [b, v] of byBatch) console.log(`  ${b}: +${v.c}/skip ${v.s}`);
  console.log(`\n✓ 新增: ${created}   ⏭ 跳过: ${skipped}`);
  if (missing.length) console.log(`⚠ 缺失religion: ${missing.join(', ')}`);

  const total = await prisma.holySite.count();
  console.log(`📊 HolySite 总数: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
