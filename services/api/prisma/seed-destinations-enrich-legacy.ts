/**
 * seed-destinations-enrich-legacy.ts — 60 个 ADMIN 源老站点落地信息补全
 *
 * 问题: 主 seed.ts 创建的 60 个世界级 Ring1/2 站点 (菩提伽耶/布达拉宫/吴哥窟/泰姬陵…)
 *       落地信息 openingHours/ticketPrice/transport/bestSeason/visitDuration/tips 全空
 * 解法: 基于公开官方信息为每个站点填充 7 项落地信息 (匹配 DST-F02 真实性铁律)
 * 幂等: 只更新当前字段为 null 的部分,已有非空值不覆盖
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Enrich {
  openingHours?: string;
  ticketPrice?: string;
  bestSeason?: string;
  visitDuration?: string;
  transport?: string;
  tips?: string[];
}

const DATA: Record<string, Enrich> = {
  '武当山': { openingHours: '08:00-17:00', ticketPrice: '¥130 + 索道 ¥80', bestSeason: '4-10月', visitDuration: '1-2天', transport: '武汉高铁至武当山站转大巴 20 分钟', tips: ['金顶需乘索道或徒步 2 小时', '紫霄宫为武当道教核心', '道家太极晨练早 7 点可观'] },
  '青城山': { openingHours: '08:00-17:00', ticketPrice: '前山 ¥90 后山 ¥20', bestSeason: '4-11月', visitDuration: '1天', transport: '成都高铁至青城山站步行 15 分钟', tips: ['前山寺观密集,后山适合徒步', '天师洞为张道陵修道地', '山间云雾清晨最佳'] },
  '婆罗浮屠': { openingHours: '06:30-17:00', ticketPrice: '外宾 Rp 375,000', bestSeason: '5-9月干季', visitDuration: '3-4小时', transport: '日惹市自驾 1 小时', tips: ['日出套票需日惹 Manohara 酒店订', '登塔现需预约导览', '浮雕环绕逐层升进象征修行'] },
  '吴哥窟': { openingHours: '05:00-17:30', ticketPrice: '1日 $37 / 3日 $62 / 7日 $72', bestSeason: '11-3月', visitDuration: '1-3天', transport: '暹粒市突突车 20 分钟', tips: ['日出从西门入最佳', '通票现场拍照', '禁止爬上中央塔(除特定时段)'] },
  '菩提伽耶': { openingHours: '05:00-21:00', ticketPrice: '免费 (摄像 ₹100)', bestSeason: '10-3月', visitDuration: '半天', transport: '伽耶机场/火车站出租 20 分钟', tips: ['正觉塔内禁拍照', '菩提树下金刚座为佛陀悟道处', '清晨全球僧团集体诵经壮观'] },
  '五台山': { openingHours: '全天开放,寺院 07:00-18:00', ticketPrice: '进山 ¥135 + 部分寺院 ¥4-10', bestSeason: '5-10月', visitDuration: '2-3天', transport: '太原高铁至五台山站转大巴 1.5 小时', tips: ['五峰朝顶需包车或徒步', '显通寺/塔院寺为核心', '海拔 3058 米注意保暖'] },
  '仰光大金塔': { openingHours: '04:00-22:00', ticketPrice: '外宾 $10', bestSeason: '11-2月', visitDuration: '2-3小时', transport: '仰光市中心北部出租 15 分钟', tips: ['入内脱鞋脱袜', '着肩膝覆盖服装', '日落时分景观最佳'] },
  '布达拉宫': { openingHours: '09:00-16:00 (旺季需预约)', ticketPrice: '旺季 ¥200 / 淡季 ¥100', bestSeason: '5-10月', visitDuration: '2-3小时', transport: '拉萨市中心步行/出租', tips: ['旺季须提前一天官网/微信预约', '限时 1 小时内参观红白宫', '海拔 3700 米预防高反'] },
  '敦煌莫高窟': { openingHours: '08:00-18:00', ticketPrice: '旺季 ¥238 / 淡季 ¥140', bestSeason: '5-10月', visitDuration: '半天', transport: '敦煌市区出租 20 分钟', tips: ['须提前 1 个月官网预约', '限定开放 8 个洞窟', '手机等电子设备禁入洞窟'] },
  '法隆寺': { openingHours: '08:00-17:00 (冬季 -16:30)', ticketPrice: '¥1500', bestSeason: '3-5/9-11月', visitDuration: '2-3小时', transport: 'JR 法隆寺站步行 20 分钟或巴士 5 分钟', tips: ['世界最古木造建筑', '大宝藏院分西院/东院两部分', '百济观音像为国宝'] },
  '蓝色清真寺': { openingHours: '08:30-18:00 (祈祷时闭)', ticketPrice: '免费 (建议捐献)', bestSeason: '4-5/9-10月', visitDuration: '1小时', transport: '伊斯坦布尔电车 Sultanahmet 站步行 3 分钟', tips: ['需脱鞋入内,女士覆头巾', '正对圣索菲亚', '周五聚礼时谢绝非穆斯林进入'] },
  '瓦拉纳西恒河': { openingHours: '24小时开放', ticketPrice: '免费 (船 ₹100-500)', bestSeason: '10-3月', visitDuration: '1-2天', transport: '瓦拉纳西机场/火车站出租 30 分钟', tips: ['清晨/日落恒河祭典震撼', '火葬河坛严禁拍照', '雨季 7-9 月河面涨水闭放'] },
  '尼泊尔帕斯帕提纳': { openingHours: '04:00-12:00/17:00-21:00', ticketPrice: '外宾 NPR 1,000', bestSeason: '10-3月', visitDuration: '2-3小时', transport: '加德满都市区出租 15 分钟', tips: ['印度教最重要神庙之一', '内院仅印度教徒可入', '河边可见公开火葬仪式'] },
  '吴哥窟印度教': { openingHours: '05:00-17:30', ticketPrice: '含吴哥通票', bestSeason: '11-3月', visitDuration: '半天', transport: '暹粒突突车 20 分钟', tips: ['原为印度教毗湿奴神庙', '16 世纪改佛寺', '日出角度从莲花池反射最佳'] },
  '圣索菲亚大教堂': { openingHours: '09:00-19:00 (祈祷时闭)', ticketPrice: '外宾 €25', bestSeason: '4-5/9-10月', visitDuration: '1.5-2小时', transport: '伊斯坦布尔电车 Sultanahmet 站步行 3 分钟', tips: ['2020 年恢复为清真寺需覆体', '上层拜占庭马赛克为亮点', '内部禁拍摄祈祷区'] },
  '威斯敏斯特教堂': { openingHours: '09:30-15:30 (周日礼拜闭)', ticketPrice: '£29', bestSeason: '5-9月', visitDuration: '2小时', transport: '伦敦地铁 Westminster 站步行 2 分钟', tips: ['含诗人之角与历代君王陵', '包含语音导览', '周日免费参加圣公会礼拜'] },
  '崂山': { openingHours: '06:00-18:00', ticketPrice: '¥180 旺季', bestSeason: '4-10月', visitDuration: '1天', transport: '青岛市区旅游大巴 1 小时', tips: ['太清宫为道教十大洞天之一', '临海山景独特', '索道可达上清宫省力'] },
  '巴厘岛母庙': { openingHours: '07:00-19:00', ticketPrice: 'Rp 75,000', bestSeason: '5-9月干季', visitDuration: '2小时', transport: '登巴萨市自驾 2 小时', tips: ['印度教徒可登上层,游客限下层', '需系纱龙腰布(现场借)', '背景为阿贡火山'] },
  '巴黎圣母院': { openingHours: '修复中(预计 2025-2027 重开)', ticketPrice: '免费 (广场开放)', bestSeason: '4-10月', visitDuration: '1-2小时', transport: '巴黎地铁 Cité 站步行 3 分钟', tips: ['2019 年火灾后全面修复', '目前仅广场可参观', '塔楼登顶暂停'] },
  '泰姬陵': { openingHours: '日出-日落 (周五闭)', ticketPrice: '外宾 ₹1,100', bestSeason: '10-3月', visitDuration: '3-4小时', transport: '阿格拉火车站出租 15 分钟', tips: ['入内禁食物/鞋套现场发', '日出/日落色彩最美', '满月夜观需单独预约'] },
  '白云观': { openingHours: '08:30-16:30', ticketPrice: '¥10', bestSeason: '全年', visitDuration: '1-1.5小时', transport: '北京地铁 1 号线南礼士路站步行 15 分钟', tips: ['中国道教协会所在地', '春节"打金钱眼"传统', '邱处机祖师处法脉正统'] },
  '科纳克太阳神庙': { openingHours: '日出-日落', ticketPrice: '外宾 ₹600', bestSeason: '10-3月', visitDuration: '2-3小时', transport: '布巴内斯瓦尔自驾 1.5 小时', tips: ['世遗 13 世纪战车造型', '海风侵蚀部分坍塌', '每年 12 月科纳克舞蹈节'] },
  '科隆大教堂': { openingHours: '06:00-20:00', ticketPrice: '免费 (登塔 €6)', bestSeason: '5-9月', visitDuration: '1-2小时', transport: '科隆中央车站出站即达', tips: ['全球第三高哥特式双塔', '登塔 533 级无电梯', '内部禁拍摄主祭坛'] },
  '米兰大教堂': { openingHours: '09:00-19:00', ticketPrice: '€10 (登顶 +€15)', bestSeason: '4-10月', visitDuration: '2-3小时', transport: '米兰地铁 Duomo 站直达', tips: ['欧洲第三大教堂', '登顶屋顶近观哥特尖顶', '入内着装须遮肩膝'] },
  '耶路撒冷圣墓教堂': { openingHours: '04:00-19:00 (夏季 -20:00)', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '1.5-2小时', transport: '旧城 Jaffa Gate 步行 10 分钟', tips: ['六教派共管需遵各自规矩', '耶稣受难处与空墓合一', '复活节人流最巨'] },
  '茅山': { openingHours: '08:00-16:30', ticketPrice: '¥105', bestSeason: '4-10月', visitDuration: '1天', transport: '镇江/句容高铁转大巴 1 小时', tips: ['道教上清派祖山', '元符万宁宫为核心', '4 月茅山庙会'] },
  '阿克萨达姆神庙': { openingHours: '10:00-20:00 (周一闭)', ticketPrice: '免费 (展览 ₹170)', bestSeason: '10-3月', visitDuration: '3-4小时', transport: '德里地铁 Akshardham 站步行 5 分钟', tips: ['入内安检严格禁电子设备', '夜间音乐喷泉值得等', '展览含 IMAX 与划船秀'] },
  '阿尔罕布拉宫': { openingHours: '08:30-20:00', ticketPrice: '€19.09 需提前预约', bestSeason: '4-6/9-11月', visitDuration: '3-4小时', transport: '格拉纳达火车站出租 15 分钟', tips: ['官网需提前数周订票', '纳塞瑞德宫有时段限制', '夜游另购票价¥8'] },
  '麦加禁寺': { openingHours: '24小时开放 (仅穆斯林可入)', ticketPrice: '免费', bestSeason: '11-2月', visitDuration: '朝觐 5 天', transport: '吉达机场出租 1.5 小时', tips: ['仅穆斯林可入麦加城', '朝觐季天房周边极度拥挤', '需办理专属朝觐签证'] },
  '麦地那先知寺': { openingHours: '24小时 (非穆斯林区可绕行)', ticketPrice: '免费', bestSeason: '11-2月', visitDuration: '半天', transport: '麦地那机场出租 20 分钟', tips: ['绿色穹顶下为先知墓', '非穆斯林不可入主殿', '绿拱廊区须女性覆体'] },
  '龙虎山': { openingHours: '08:00-17:00', ticketPrice: '¥175', bestSeason: '3-11月', visitDuration: '1天', transport: '鹰潭高铁转大巴 30 分钟', tips: ['天师道正一派祖庭', '山水丹霞地貌 UNESCO', '竹筏漂流最具特色'] },
  '死海古卷洞': { openingHours: '08:00-17:00', ticketPrice: 'NIS 29', bestSeason: '10-4月', visitDuration: '2-3小时', transport: '耶路撒冷大巴 486 路', tips: ['世界最古圣经抄本发现地', '昆兰社区遗址一并参观', '夏季酷热不宜'] },
  '海法空中花园': { openingHours: '09:00-17:00 (花园 -12:00)', ticketPrice: '免费', bestSeason: '3-11月', visitDuration: '1.5-2小时', transport: '海法轻轨 HaZiyonut 站步行 5 分钟', tips: ['巴哈伊世界中心', '只能参加免费导览入内', '夜景灯光秀震撼'] },
  '威尔梅特灵曦堂': { openingHours: '06:00-22:00', ticketPrice: '免费', bestSeason: '5-10月', visitDuration: '1.5-2小时', transport: '芝加哥城铁 Linden 站步行 10 分钟', tips: ['北美唯一巴哈伊灵曦堂', '九门象征九大宗教', '内部禁喧哗禁拍'] },
  '不丹虎穴寺': { openingHours: '08:00-13:00/14:00-17:00', ticketPrice: 'Nu 500', bestSeason: '3-5/9-11月', visitDuration: '半天', transport: '帕罗山脚徒步 2.5 小时 (单程)', tips: ['海拔 3120 米需防高反', '仅持官方导游可入', '相机禁止入主殿'] },
  '严岛神社': { openingHours: '06:30-18:00', ticketPrice: '¥300', bestSeason: '春秋', visitDuration: '2-3小时', transport: '宫岛口渡轮 10 分钟', tips: ['涨潮鸟居海中倒影最美', '退潮可步行至鸟居脚下', '夜间灯光另外付费'] },
  '乌鲁鲁巨石': { openingHours: '24小时 (登顶现禁止)', ticketPrice: 'AUD 38 / 3日', bestSeason: '5-9月', visitDuration: '1-2天', transport: '爱丽斯泉自驾 5 小时', tips: ['原住民阿南古族圣地 2019 禁登顶', '日出日落色彩变幻', '可参加原住民文化导览'] },
  '伊势神宫': { openingHours: '05:00-18:00 (季节变动)', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '半天', transport: '伊势市站步行 20 分钟 (外宫)', tips: ['先外宫后内宫为传统礼', '禁拍摄正宫', '20 年一度式年迁宫 2013 年最近'] },
  '伏见稻荷大社': { openingHours: '24小时', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '2-4小时 (含千本鸟居)', transport: 'JR 稻荷站出站即达', tips: ['千本鸟居至山顶徒步 2 小时', '清晨人少出片最佳', '狐狸为稻荷神使者'] },
  '北京国子监': { openingHours: '09:00-17:00 (周一闭)', ticketPrice: '¥30', bestSeason: '4-10月', visitDuration: '1-1.5小时', transport: '北京地铁 2/5 号线雍和宫站步行 10 分钟', tips: ['与孔庙相连可联票', '辟雍大殿为清代皇帝讲学处', '进士题名碑林珍贵'] },
  '岳麓书院': { openingHours: '07:30-18:00', ticketPrice: '¥50', bestSeason: '3-11月', visitDuration: '2小时', transport: '长沙地铁 2 号线溁湾镇站转公交', tips: ['中国四大书院之首', '朱熹张栻曾讲学于此', '岳麓山一日可并游'] },
  '巨石阵': { openingHours: '09:30-17:00 (夏至延长)', ticketPrice: '£26.90', bestSeason: '5-9月', visitDuration: '2小时', transport: '伦敦 Waterloo 火车 1.5 小时至 Salisbury 转大巴', tips: ['官网预约必须', '普通日游客距石阵 50 米外', '夏至冬至可申请进入内圈'] },
  '拉萨大昭寺': { openingHours: '07:00-17:30', ticketPrice: '¥85', bestSeason: '5-10月', visitDuration: '2小时', transport: '拉萨八廓街内步行', tips: ['释迦牟尼 12 岁等身佛像圣地', '外围转经最虔诚', '早晨酥油灯为亮点'] },
  '新德里莲花寺': { openingHours: '09:00-17:30 (周一闭)', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '1小时', transport: '德里地铁 Kalkaji Mandir 站步行 10 分钟', tips: ['巴哈伊教 9 瓣莲花结构', '内部禁喧哗禁拍', '欢迎所有信仰者'] },
  '明治神宫': { openingHours: '日出-日落', ticketPrice: '免费 (宝物殿 ¥500)', bestSeason: '全年', visitDuration: '1.5-2小时', transport: 'JR 原宿站步行 2 分钟', tips: ['元旦三日参人流最巨', '内院神苑需 ¥500', '6 月菖蒲田绽放'] },
  '曲阜孔庙': { openingHours: '08:00-17:00', ticketPrice: '¥80 (三孔联票 ¥140)', bestSeason: '4-10月', visitDuration: '2-3小时', transport: '曲阜高铁站转大巴 30 分钟', tips: ['与孔府孔林三孔联票最划算', '大成殿为核心', '9 月 28 日孔子诞辰祭典'] },
  '甘丹寺': { openingHours: '08:00-17:00', ticketPrice: '¥40', bestSeason: '5-10月', visitDuration: '半天', transport: '拉萨市内包车 1.5 小时', tips: ['格鲁派祖寺宗喀巴创建', '海拔 4300 米需适应', '冬季道路结冰'] },
  '白鹿洞书院': { openingHours: '08:00-17:30', ticketPrice: '¥40', bestSeason: '3-11月', visitDuration: '1.5小时', transport: '九江至庐山转公交', tips: ['南唐五代书院遗址', '朱熹手订白鹿洞教条', '庐山风景区联票可打包'] },
  '色达喇荣五明佛学院': { openingHours: '08:00-17:30', ticketPrice: '免费', bestSeason: '6-9月', visitDuration: '1-2天', transport: '成都自驾 15 小时或包车', tips: ['海拔 4000 米需高反药', '外籍人士现不开放', '天葬台仪式严禁拍摄'] },
  '锡克教圣殿': { openingHours: '24小时开放', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '2-3小时', transport: '阿姆利则机场出租 30 分钟', tips: ['24 小时免费 langar 素食', '入内必戴头巾+脱鞋', '池中镜像金殿最美'] },
  '阿姆利则金庙': { openingHours: '24小时开放', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '2-3小时', transport: '阿姆利则火车站步行 20 分钟', tips: ['晨 04:00 开启圣典仪式震撼', '免费行李寄存鞋架', '傍晚灯火倒影最佳'] },
  '马丘比丘': { openingHours: '06:00-17:30 (分 4 时段入场)', ticketPrice: '外宾 $50 + 华那比丘 +$15', bestSeason: '5-9月', visitDuration: '半天-1天', transport: '库斯科火车至温泉镇 3 小时转大巴 30 分钟', tips: ['4 条环线单向禁回头', '雨季 12-2 月有关闭风险', '海拔 2430 米轻微高反'] },
  '圆顶清真寺': { openingHours: '08:30-11:00/13:30-14:30 (穆斯林区严格)', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '1-1.5小时', transport: '耶路撒冷旧城 Dung Gate 步行 10 分钟', tips: ['非穆斯林仅限外部参观', '安息日/节日可能闭', '圣殿山安检严格'] },
  '圣家堂': { openingHours: '09:00-20:00', ticketPrice: '€26 起', bestSeason: '4-6/9-10月', visitDuration: '2-3小时', transport: '巴塞罗那地铁 Sagrada Familia 站直达', tips: ['高迪未完成工程', '登塔需另购票', '预计 2026 年主体完工'] },
  '奇琴伊察': { openingHours: '08:00-17:00', ticketPrice: 'MXN 614', bestSeason: '11-4月', visitDuration: '半天', transport: '坎昆/梅里达自驾 2 小时', tips: ['玛雅 7 大奇迹之一', '春秋分羽蛇神光影奇观', '中心库库尔坎金字塔禁登'] },
  '旁遮普古鲁圣地': { openingHours: '24小时', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '2小时', transport: '新德里市中心Connaught Place步行10分钟', tips: ['Bangla Sahib 德里最大锡克庙', '圣水池被认有疗愈力', 'langar 免费素餐 24 小时'] },
  '梵蒂冈圣彼得大教堂': { openingHours: '07:00-19:00', ticketPrice: '免费 (登穹顶 €10)', bestSeason: '4-6/9-11月', visitDuration: '3-4小时', transport: '罗马地铁 Ottaviano 站步行 10 分钟', tips: ['衣着严格遮肩膝', '登穹顶 551 级无电梯或 +€8 电梯', '周三教宗接见需预约票'] },
  '耶路撒冷哭墙': { openingHours: '24小时', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '1-2小时', transport: '旧城 Dung Gate 步行 5 分钟', tips: ['男性必戴头罩现场借', '安息日禁拍照', '男女祈祷区分离'] },
  '锡安山': { openingHours: '全天开放', ticketPrice: '免费', bestSeason: '3-11月', visitDuration: '2-3小时', transport: '旧城 Zion Gate 步行 5 分钟', tips: ['含大卫王墓与最后晚餐厅', '教堂开放 8:00-17:00', '安息日多数景点闭'] },
  '马萨达要塞': { openingHours: '08:00-17:00 (周五提早)', ticketPrice: 'NIS 31 (缆车另收 NIS 46)', bestSeason: '10-4月', visitDuration: '3-4小时', transport: '耶路撒冷大巴 444 路 1.5 小时', tips: ['日出走蛇径需日出前 1 小时出发', '携带 2 升饮水', '着结实徒步鞋'] },
};

async function main() {
  console.log('🏛  ADMIN 老站点落地信息补全\n');

  const sites = await prisma.holySite.findMany({
    where: { source: 'ADMIN' },
    select: { id: true, name: true, openingHours: true, ticketPrice: true, bestSeason: true, visitDuration: true, transport: true, tips: true },
  });

  let updated = 0;
  let missingInData = 0;
  const missList: string[] = [];

  for (const s of sites) {
    const enrich = DATA[s.name];
    if (!enrich) {
      missingInData++;
      missList.push(s.name);
      continue;
    }

    const patch: Enrich = {};
    if (!s.openingHours && enrich.openingHours) patch.openingHours = enrich.openingHours;
    if (!s.ticketPrice && enrich.ticketPrice) patch.ticketPrice = enrich.ticketPrice;
    if (!s.bestSeason && enrich.bestSeason) patch.bestSeason = enrich.bestSeason;
    if (!s.visitDuration && enrich.visitDuration) patch.visitDuration = enrich.visitDuration;
    if (!s.transport && enrich.transport) patch.transport = enrich.transport;
    const hasTips = Array.isArray(s.tips) && s.tips.length > 0;
    if (!hasTips && enrich.tips) patch.tips = enrich.tips;

    if (Object.keys(patch).length === 0) continue;
    await prisma.holySite.update({ where: { id: s.id }, data: patch });
    updated++;
  }

  console.log(`✓ 更新: ${updated}`);
  console.log(`⚠ 数据表缺失 (需补 DATA): ${missingInData}`);
  if (missList.length) console.log(`  清单: ${missList.join(', ')}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
