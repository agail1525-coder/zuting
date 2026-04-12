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

  // ── 扩展 Ring2 Batch 1: 佛教中日名寺 ──
  '灵隐寺': { openingHours: '07:00-18:00', ticketPrice: '¥30 (飞来峰 ¥45)', bestSeason: '3-11月', visitDuration: '2小时', transport: '杭州地铁 3 号线黄龙洞站转 Y2 旅游巴士', tips: ['与飞来峰石刻联票', '周末法会众多', '素斋需提前预订'] },
  '少林寺': { openingHours: '08:00-17:30', ticketPrice: '¥80', bestSeason: '4-10月', visitDuration: '3-4小时', transport: '郑州机场/高铁至登封大巴 1.5 小时', tips: ['武术表演场次有固定时间', '达摩洞须登山 1 小时', '塔林不可攀爬'] },
  '峨眉山': { openingHours: '06:00-18:00', ticketPrice: '旺季 ¥160 / 淡季 ¥110', bestSeason: '5-10月', visitDuration: '1-2天', transport: '成都高铁至峨眉山站转大巴 30 分钟', tips: ['金顶日出云海佛光', '山顶猴群谨慎', '冬季需备防滑链'] },
  '普陀山': { openingHours: '全天 (寺院 05:30-18:00)', ticketPrice: '进山 ¥140', bestSeason: '4-11月', visitDuration: '1-2天', transport: '舟山朱家尖蜈蚣峙码头渡轮 15 分钟', tips: ['南海观音像为核心', '农历二月十九/六月十九/九月十九香期人潮', '上山步道与缆车结合省力'] },
  '九华山': { openingHours: '07:00-18:00', ticketPrice: '旺季 ¥160', bestSeason: '4-10月', visitDuration: '1-2天', transport: '池州火车站转大巴 1 小时', tips: ['地藏菩萨道场', '百岁宫为核心', '农历七月地藏诞辰朝拜'] },
  '白马寺': { openingHours: '07:40-18:00', ticketPrice: '¥35', bestSeason: '4-10月', visitDuration: '2小时', transport: '洛阳城区 58 路公交 / 自驾 30 分钟', tips: ['中国第一古刹', '国际佛殿苑含印度/泰国/缅甸风格', '清凉台为摄摩腾译经处'] },
  '寒山寺': { openingHours: '07:30-17:00', ticketPrice: '¥20 (除夕钟声另购)', bestSeason: '3-11月', visitDuration: '1-1.5小时', transport: '苏州地铁 2 号线石路站转 9 路公交', tips: ['除夕钟声票需预订', '诗碑廊与钟楼核心', '毗邻枫桥可联游'] },
  '南华禅寺': { openingHours: '08:00-17:00', ticketPrice: '¥20', bestSeason: '全年', visitDuration: '2小时', transport: '韶关市区公交或出租 30 分钟', tips: ['六祖慧能真身保存', '六祖殿为核心', '4 月六祖诞期盛会'] },
  '塔普伦寺': { openingHours: '05:00-17:30', ticketPrice: '含吴哥通票', bestSeason: '11-3月', visitDuration: '1.5小时', transport: '暹粒突突车 30 分钟', tips: ['古墓丽影取景地树根缠绕', '早晨人少', '禁止攀爬树根'] },
  '玉佛寺': { openingHours: '08:30-15:30', ticketPrice: '500 泰铢含大皇宫', bestSeason: '11-2月', visitDuration: '2-3小时', transport: 'BTS Saphan Taksin 换船 Tha Chang 码头', tips: ['着装严格门口可租衣', '玉佛每季换金袍', '禁止拍摄玉佛'] },
  '佛牙寺': { openingHours: '05:30-20:00', ticketPrice: '免费', bestSeason: '12-3月', visitDuration: '2-3小时', transport: '康提市中心步行 10 分钟', tips: ['每日三次拜牙仪式', '7-8 月佛牙节 10 天盛典', '入内脱鞋着装须过膝'] },
  '海印寺': { openingHours: '08:00-18:00', ticketPrice: '₩3,000', bestSeason: '5-10月', visitDuration: '半天', transport: '大邱东部巴士站至海印寺大巴 1.5 小时', tips: ['八万大藏经板为UNESCO', '禁触摸经板', '寺内住宿体验僧生活'] },
  '通度寺': { openingHours: '08:00-17:00', ticketPrice: '₩3,000', bestSeason: '4-10月', visitDuration: '2-3小时', transport: '釜山站 KTX 至梁山站转公交', tips: ['佛宝寺舍利信仰', '千年银杏树为核心', '春季樱花满园'] },
  '松广寺': { openingHours: '08:00-18:00', ticketPrice: '₩3,000', bestSeason: '4-10月', visitDuration: '2小时', transport: '顺天市区公交 111 路 1 小时', tips: ['僧宝寺曹溪宗本山', '禅修体验需申请', '秋季枫叶最美'] },
  '东大寺': { openingHours: '07:30-17:30 (季节变动)', ticketPrice: '¥600', bestSeason: '春秋', visitDuration: '2小时', transport: 'JR 奈良站步行 20 分钟或 2 路公交', tips: ['世界最大木造大佛殿', '梅花鹿群可抚喂', '东大寺二月堂俯瞰奈良'] },
  '清水寺': { openingHours: '06:00-18:00 (夜间参拜至21:30)', ticketPrice: '¥400', bestSeason: '春秋', visitDuration: '2-3小时', transport: '京都站 206 路公交 30 分钟', tips: ['舞台悬空造型不用一颗钉', '音羽瀑布三股水选一饮', '春秋夜间特别参拜'] },
  '金阁寺': { openingHours: '09:00-17:00', ticketPrice: '¥500', bestSeason: '四季', visitDuration: '1小时', transport: '京都站 101/205 路公交 40 分钟', tips: ['金箔鹿苑寺为正式名', '门票为御守型纪念票', '雪后金阁最美'] },
  '银阁寺': { openingHours: '08:30-17:00 (冬季 9-16:30)', ticketPrice: '¥500', bestSeason: '春秋', visitDuration: '1小时', transport: '京都站 5 路公交 35 分钟', tips: ['哲学之道起点可联游', '银沙滩为标志', '苔庭禁踩踏'] },
  '建长寺': { openingHours: '08:30-16:30', ticketPrice: '¥500', bestSeason: '春秋', visitDuration: '1.5小时', transport: 'JR 北镰仓站步行 15 分钟', tips: ['日本最古禅宗寺', '坐禅会周五五六对外开放', '紫阳花季人多'] },
  '永平寺': { openingHours: '08:30-16:30', ticketPrice: '¥700', bestSeason: '4-10月', visitDuration: '2小时', transport: 'JR 福井站转巴士 30 分钟', tips: ['曹洞宗大本山道元创建', '僧堂参拜须穿袜', '秋枫特别美'] },
  '高野山': { openingHours: '08:30-17:00 (奥之院 24h)', ticketPrice: '奥之院免费/金刚峯寺 ¥1000', bestSeason: '5-10月', visitDuration: '1-2天', transport: '大阪难波南海电铁极乐桥换缆车 1.5 小时', tips: ['空海弘法大师圣地', '奥之院夜间参拜氛围神秘', '宿坊体验素斋打坐'] },
  '比睿山延历寺': { openingHours: '09:00-16:00', ticketPrice: '¥1000', bestSeason: '4-11月', visitDuration: '半天', transport: '京都站驾车 40 分钟或叡山缆车', tips: ['天台宗总本山', '千日回峰行圣地', '横川中堂不可入'] },

  // ── 扩展 Ring2 Batch 2: 道教名山 (未扩充) ──
  '华山': { openingHours: '07:00-19:00 (夜登24h)', ticketPrice: '旺季 ¥160', bestSeason: '4-10月', visitDuration: '1-2天', transport: '西安北站高铁华山北站', tips: ['夜登看日出为经典路线', '长空栈道/鹞子翻身务必系安全带', '北峰索道省力'] },
  '泰山': { openingHours: '24小时', ticketPrice: '旺季 ¥115', bestSeason: '5-10月', visitDuration: '1-2天', transport: '泰安高铁站公交/出租 15 分钟', tips: ['夜登玉皇顶观日出', '备厚衣山顶气温低 10 度', '挑山工文化体验'] },
  '嵩山': { openingHours: '08:00-17:00', ticketPrice: '少林景区 ¥80 / 中岳庙 ¥30', bestSeason: '4-10月', visitDuration: '1-2天', transport: '郑州高铁至登封大巴 1.5 小时', tips: ['道教中岳庙与佛教少林寺并存', '徒步"嵩阳书院-会善寺"古道', '4 月报春最美'] },
  '恒山': { openingHours: '07:00-18:00', ticketPrice: '¥55', bestSeason: '5-10月', visitDuration: '1天', transport: '大同高铁至浑源大巴 1 小时', tips: ['悬空寺为必看', '北岳庙为核心', '冬季需防滑具'] },
  '三清山': { openingHours: '07:30-17:00', ticketPrice: '旺季 ¥120 + 索道 ¥125', bestSeason: '4-10月', visitDuration: '1-2天', transport: '玉山高铁站公交 2 小时', tips: ['花岗岩峰林 UNESCO', '云雾缭绕适合看日出', '南清园/西海岸为核心栈道'] },
  '齐云山': { openingHours: '08:00-17:00', ticketPrice: '¥75 + 索道 ¥72', bestSeason: '4-10月', visitDuration: '1天', transport: '黄山市区公交 1 小时', tips: ['道教四大名山丹霞景', '月华天街为核心', '附近黄山可联游'] },
  '终南山': { openingHours: '全天开放 (部分景区 08:00-17:00)', ticketPrice: '翠华山 ¥75 / 南五台 ¥35', bestSeason: '4-10月', visitDuration: '1-2天', transport: '西安地铁 2 号线到韦曲南站转班车', tips: ['道教发源地楼观台', '隐士文化', '冬季可能封山'] },
  '崆峒山': { openingHours: '06:00-19:00', ticketPrice: '旺季 ¥120', bestSeason: '5-10月', visitDuration: '1天', transport: '平凉高铁站公交 30 分钟', tips: ['道教第一山', '皇城为核心建筑群', '秋季红叶最美'] },
  '长白山': { openingHours: '08:00-17:30', ticketPrice: '¥125 + 环保车 ¥85', bestSeason: '6-9月/12-2月滑雪', visitDuration: '1-2天', transport: '敦化机场/高铁至二道白河镇大巴', tips: ['天池观景窗口期极短', '冬季温泉+滑雪', '北坡/西坡入口不同'] },
  '抱朴道院': { openingHours: '07:30-17:00', ticketPrice: '¥5', bestSeason: '3-11月', visitDuration: '1小时', transport: '杭州葛岭山上步行', tips: ['葛洪炼丹处', '西湖北岸可串联黄龙洞', '元旦登高赏湖'] },
  '玄妙观': { openingHours: '07:30-16:30', ticketPrice: '免费', bestSeason: '3-11月', visitDuration: '1小时', transport: '苏州观前街中心', tips: ['三清殿宋代遗构', '夜晚观前街小吃街', '元辰殿求财受欢迎'] },
  '天师府': { openingHours: '08:00-17:00', ticketPrice: '¥50', bestSeason: '3-11月', visitDuration: '1-1.5小时', transport: '鹰潭高铁至龙虎山景区大巴 40 分钟', tips: ['正一道祖庭', '天师手札值得看', '龙虎山联票更划算'] },
  '永乐宫': { openingHours: '08:00-17:30', ticketPrice: '¥80', bestSeason: '4-10月', visitDuration: '2-3小时', transport: '运城高铁站打车 1 小时', tips: ['元代壁画《朝元图》国宝', '不得使用闪光灯', '讲解员必雇'] },
  '八仙宫': { openingHours: '08:00-17:00', ticketPrice: '免费', bestSeason: '3-11月', visitDuration: '1小时', transport: '西安地铁 1 号线朝阳门站步行 10 分钟', tips: ['八仙朝圣地', '周日早课可旁听', '周边小吃多'] },
  '黄大仙祠': { openingHours: '07:00-17:30', ticketPrice: 'HK$3', bestSeason: '全年', visitDuration: '1小时', transport: '香港地铁黄大仙站 B2 出口', tips: ['求签解签为特色', '签后可至周边摊档解签', '农历初一十五人多'] },
  '青羊宫': { openingHours: '08:00-17:30', ticketPrice: '¥10', bestSeason: '3-11月', visitDuration: '1小时', transport: '成都地铁 2 号线中医大省医院站步行', tips: ['《道藏辑要》收藏地', '正月初九真人会', '邻近杜甫草堂/文殊院'] },
  '楼观台': { openingHours: '08:30-17:30', ticketPrice: '¥95', bestSeason: '4-10月', visitDuration: '半天', transport: '西安城南客运站周至专线 1.5 小时', tips: ['老子讲经处', '说经台为核心', '秦岭脚下空气佳'] },
  '王屋山': { openingHours: '08:00-17:00', ticketPrice: '¥80', bestSeason: '4-10月', visitDuration: '1天', transport: '济源高铁站公交 1 小时', tips: ['愚公移山典故发生地', '十大洞天之首', '天坛峰需索道+徒步'] },
  '罗浮山': { openingHours: '07:00-18:00', ticketPrice: '¥60', bestSeason: '全年', visitDuration: '1天', transport: '广州东站至博罗高铁 30 分钟转车', tips: ['岭南第一山', '冲虚观为核心', '夏季避暑胜地'] },

  // ── 扩展 Ring2 Batch 3: 基督教欧美亚大教堂 ──
  '威尼斯圣马可大教堂': { openingHours: '09:30-17:15 (周日 14:00-)', ticketPrice: '€3 (金顶 €7)', bestSeason: '4-10月', visitDuration: '1-1.5小时', transport: '圣马可广场中心', tips: ['入内禁食物背包', '金顶近观拜占庭马赛克', '旺季排队需 1 小时'] },
  '佛罗伦萨圣母百花大教堂': { openingHours: '10:15-16:45', ticketPrice: '€30 含穹顶+洗礼堂', bestSeason: '4-6/9-10月', visitDuration: '2-3小时', transport: '市中心广场', tips: ['登穹顶 463 级需预约', '洗礼堂天顶马赛克必看', '着肩膝覆盖服装'] },
  '米兰大教堂': { openingHours: '09:00-19:00', ticketPrice: '€10 (屋顶 +€15)', bestSeason: '4-10月', visitDuration: '2小时', transport: '米兰地铁 Duomo 站直达', tips: ['欧洲第三大教堂', '登顶屋顶尖塔林', '着装须遮肩膝'] },
  '圣地亚哥-德孔波斯特拉大教堂': { openingHours: '07:00-20:30', ticketPrice: '免费', bestSeason: '5-9月', visitDuration: '2小时', transport: '圣地亚哥老城中心', tips: ['朝圣之路终点', '12:00 朝圣者弥撒', '拥抱圣雅各像为传统'] },
  '雅典都主教座堂': { openingHours: '06:30-19:00', ticketPrice: '免费', bestSeason: '4-10月', visitDuration: '1小时', transport: '雅典地铁 Monastiraki 站步行', tips: ['希腊东正教总堂', '圣尼古拉节特别弥撒', '内部禁拍照'] },
  '马德里阿穆德纳大教堂': { openingHours: '10:00-20:30', ticketPrice: '€1 捐献', bestSeason: '4-10月', visitDuration: '1-1.5小时', transport: '马德里地铁 Ópera 站步行', tips: ['皇宫对面', '博物馆/穹顶 €6 另付', '西班牙皇室婚礼处'] },
  '维也纳圣斯蒂芬大教堂': { openingHours: '06:00-22:00', ticketPrice: '免费 (导览 €6)', bestSeason: '4-10月', visitDuration: '1-1.5小时', transport: '维也纳地铁 Stephansplatz 站直达', tips: ['南塔 343 级登顶', '地下墓穴另外付费', '莫扎特曾在此结婚'] },
  '布拉格圣维特大教堂': { openingHours: '09:00-16:00', ticketPrice: '布拉格城堡套票 CZK 450', bestSeason: '4-10月', visitDuration: '1.5小时', transport: '布拉格地铁 Malostranská 站步行 20 分钟', tips: ['圣瓦茨拉夫礼拜堂为精华', '登钟楼看红屋顶', '米哈·穆哈彩色玻璃'] },
  '布达佩斯圣史蒂芬大教堂': { openingHours: '09:00-17:00 (周日 13:00-)', ticketPrice: '€2 捐献 (登顶 €6)', bestSeason: '4-10月', visitDuration: '1-1.5小时', transport: '布达佩斯地铁 Bajcsy-Zsilinszky 站步行', tips: ['圣右手圣物特别保留', '登顶视角极佳', '夜间照明美'] },
  '华盛顿国家大教堂': { openingHours: '10:00-17:30 (周日礼拜)', ticketPrice: '$15', bestSeason: '4-10月', visitDuration: '2小时', transport: '华盛顿地铁红线 Tenleytown 站转公交', tips: ['美国新哥特最大教堂', '达斯维达头像装饰细节', '周日圣乐礼拜免费'] },
  '纽约圣约翰大教堂': { openingHours: '09:30-17:00', ticketPrice: '$12 建议捐', bestSeason: '5-10月', visitDuration: '2小时', transport: '纽约地铁 1 号线 Cathedral Pkwy (110 St) 步行', tips: ['世界最大哥特式', '塔楼登顶需预约', '定期现代艺术展'] },
  '里约救世基督像': { openingHours: '08:00-19:00', ticketPrice: 'R$ 99 旺季', bestSeason: '4-10月干季', visitDuration: '半天', transport: '科尔科瓦多齿轨小火车 20 分钟', tips: ['雨季云雾多选早晨', '官网预订快速通道', '脚下俯瞰面包山糖果山'] },
  '拉利贝拉岩石教堂': { openingHours: '06:00-18:00', ticketPrice: '$50 5日通票', bestSeason: '10-3月', visitDuration: '2-3天', transport: '拉利贝拉机场出租 15 分钟', tips: ['1 月 7 日圣诞千年朝圣', '脱鞋入内', '必雇本地导游'] },
  '南非圣乔治大教堂': { openingHours: '07:30-17:00', ticketPrice: '免费', bestSeason: '全年', visitDuration: '1小时', transport: '开普敦国会大楼步行 3 分钟', tips: ['图图大主教讲台', '周日 11 点圣餐礼', '合唱团定期免费演出'] },
  '悉尼圣玛丽大教堂': { openingHours: '06:30-18:30', ticketPrice: '免费', bestSeason: '9-4月', visitDuration: '1小时', transport: '悉尼火车 St James 站步行 5 分钟', tips: ['南半球最大哥特式', '地窖墓地另外付费', '皇家植物园旁'] },
  '蒙特利尔圣母圣殿': { openingHours: '08:30-16:30', ticketPrice: 'CAD$8', bestSeason: '5-10月', visitDuration: '1-1.5小时', transport: '蒙特利尔地铁 Place-d\'Armes 站步行', tips: ['席琳迪翁在此结婚', 'AURA 光影秀值得', '夜晚蓝色照明美'] },
  '伯利恒圣诞教堂': { openingHours: '06:00-19:30', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '1-1.5小时', transport: '耶路撒冷 231 路大巴 45 分钟', tips: ['耶稣降生洞穴', '入"谦卑门"需弯腰', '圣诞夜午夜弥撒万人'] },

  // ── 扩展 Ring2 Batch 4: 伊斯兰中东北非名寺 ──
  '苏莱曼尼耶清真寺': { openingHours: '09:00-18:00 (祈祷时闭)', ticketPrice: '免费', bestSeason: '4-10月', visitDuration: '1小时', transport: '伊斯坦布尔电车 Laleli 站步行 10 分钟', tips: ['奥斯曼最大清真寺', '陵园苏莱曼大帝墓', '游客专用入口'] },
  '阿兹哈尔清真寺': { openingHours: '09:00-21:00 (非穆斯林限定区)', ticketPrice: '免费', bestSeason: '10-4月', visitDuration: '1小时', transport: '开罗地铁 Al-Attaba 站步行 10 分钟', tips: ['阿兹哈尔大学一体', '伊斯兰世界最古学府之一', '周五聚礼禁入'] },
  '穆罕默德·阿里清真寺': { openingHours: '09:00-17:00 (周五部分闭)', ticketPrice: 'E£200 萨拉丁城堡联票', bestSeason: '10-4月', visitDuration: '1.5小时', transport: '开罗市中心出租 20 分钟', tips: ['城堡山可俯瞰开罗', '奥斯曼式建筑', '着长袖长裤'] },
  '凯鲁万大清真寺': { openingHours: '08:00-14:00 (周五闭)', ticketPrice: '10 第纳尔', bestSeason: '3-5/9-11月', visitDuration: '1-1.5小时', transport: '凯鲁万老城中心', tips: ['北非最古清真寺', '非穆斯林限院子与殿外', '三柱石柱井信仰'] },
  '哈桑二世清真寺': { openingHours: '导览 09:00/10:00/11:00/14:00', ticketPrice: 'MAD 130', bestSeason: '4-10月', visitDuration: '1.5小时', transport: '卡萨布兰卡老城步行', tips: ['世界最高宣礼塔 210 米', '仅导览可入非穆斯林', '玻璃地板俯瞰大西洋'] },
  '伊斯法罕伊玛目清真寺': { openingHours: '08:00-20:00', ticketPrice: 'Rial 500,000', bestSeason: '4-5/9-11月', visitDuration: '1.5-2小时', transport: '伊玛目广场南侧', tips: ['萨法维时期巅峰之作', '穹顶七色马赛克', '圆拱共鸣奇特'] },
  '谢赫洛特弗拉清真寺': { openingHours: '08:00-20:00', ticketPrice: 'Rial 300,000', bestSeason: '4-5/9-11月', visitDuration: '1小时', transport: '伊玛目广场东侧', tips: ['无宣礼塔无院子独特', '地板见孔雀光线投影', '萨法维皇家私人寺'] },
  '伊玛目礼萨圣陵': { openingHours: '24小时 (非穆斯林限部分区)', ticketPrice: '免费', bestSeason: '3-5/9-11月', visitDuration: '2-3小时', transport: '马什哈德机场出租 30 分钟', tips: ['什叶派第二圣地', '女士需戴 chador 现场借', '禁相机入内圣域'] },
  '撒马尔罕雷吉斯坦': { openingHours: '08:00-19:00', ticketPrice: '50,000 苏姆', bestSeason: '4-6/9-10月', visitDuration: '2-3小时', transport: '撒马尔罕市中心步行 5 分钟', tips: ['三经学院环广场', '黄昏光线最佳', '夜场灯光秀每周六'] },
  '布哈拉卡梁清真寺': { openingHours: '08:00-18:00', ticketPrice: '30,000 苏姆', bestSeason: '4-5/9-10月', visitDuration: '1-1.5小时', transport: '布哈拉古城中心', tips: ['卡梁塔 46 米 12 世纪', '毗邻蓄水池区', '周五聚礼本地人多'] },
  '费萨尔清真寺': { openingHours: '09:00-17:00 (周五/周六部分闭)', ticketPrice: '免费', bestSeason: '10-4月', visitDuration: '1小时', transport: '伊斯兰堡 F6 区出租', tips: ['南亚最大清真寺', '马拉加山脚现代造型', '入内脱鞋女戴头巾'] },
  '巴德夏希清真寺': { openingHours: '05:00-20:30', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '1.5小时', transport: '拉合尔老城堡旁', tips: ['莫卧儿最大清真寺', '与拉合尔古堡联游', '殿内禁拍'] },

  // ── 扩展 Ring2 Batch 5: 印度教圣地 ──
  '米纳克希神庙': { openingHours: '05:00-12:30/16:00-22:00', ticketPrice: '免费 (相机 ₹50)', bestSeason: '10-3月', visitDuration: '2-3小时', transport: '马杜赖机场/火车站出租 20 分钟', tips: ['达罗毗荼风格峰塔', '严禁皮革用品入', '晚间仪式神秘'] },
  '哈里德瓦': { openingHours: 'Ganga Aarti 日落 6 点', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '1-2天', transport: '哈里德瓦火车站步行 15 分钟', tips: ['恒河上游圣地', 'Har Ki Pauri 祭典震撼', '12 年一次大壶节'] },
  '瑞诗凯诗': { openingHours: '24小时', ticketPrice: '免费', bestSeason: '9-4月', visitDuration: '2-3天', transport: '德拉敦机场出租 45 分钟', tips: ['世界瑜伽之都', 'Parmarth Niketan Ganga Aarti', '不可食肉饮酒'] },
  '凯达尔纳特': { openingHours: '5月-10月开放', ticketPrice: '免费', bestSeason: '5-10月 (冬雪封山)', visitDuration: '1-2天', transport: 'Gaurikund 徒步 18km 或骑骡', tips: ['喜马拉雅海拔 3583 米', '仅夏季开放', '高反需防'] },
  '巴德里纳特': { openingHours: '5月-11月开放', ticketPrice: '免费', bestSeason: '5-10月', visitDuration: '1-2天', transport: '约什梅特汽车站大巴 3 小时', tips: ['毗湿奴圣地', '温泉池洗浴为仪式', '冬季11-4月闭'] },
  '阿姆利则杜加庙': { openingHours: '04:00-22:00', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '1-1.5小时', transport: '阿姆利则火车站步行 15 分钟', tips: ['金庙印度教版', '大理石湖中殿', '夜景灯光倒影'] },

  // ── 扩展 Ring2 Batch 6: 日本神道 ──
  '出云大社': { openingHours: '06:00-20:00', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '1.5-2小时', transport: '一畑电铁出云大社前站步行 5 分钟', tips: ['日本最古神社', '拍手独特 4 次非 2 次', '结缘神社求姻缘'] },
  '春日大社': { openingHours: '06:30-17:30', ticketPrice: '免费 (本殿 ¥500)', bestSeason: '春秋', visitDuration: '1.5小时', transport: 'JR 奈良站 2 路公交 15 分钟', tips: ['3000 盏石灯笼', '鹿遍布神社参道', '节分/盆祭万灯笼奇景'] },
  '平安神宫': { openingHours: '06:00-18:00', ticketPrice: '免费 (神苑 ¥600)', bestSeason: '4月樱花', visitDuration: '1-1.5小时', transport: '京都地铁东山站步行 10 分钟', tips: ['大鸟居 24 米气势磅礴', '神苑垂枝樱最美', '10月时代祭'] },
  '鹤冈八幡宫': { openingHours: '06:00-21:00', ticketPrice: '免费', bestSeason: '4月樱花/7月莲花', visitDuration: '1-1.5小时', transport: 'JR 镰仓站步行 10 分钟', tips: ['武家崇拜圣地', '大银杏 2010 年倒', '元旦三日参人潮'] },
  '日光东照宫': { openingHours: '08:00-17:00 (冬 -16:00)', ticketPrice: '¥1300', bestSeason: '5-10月 (10-11 红叶)', visitDuration: '2-3小时', transport: 'JR 日光站巴士 10 分钟', tips: ['德川家康陵寝', '三猿/眠猫国宝雕刻', '阳明门极致装饰'] },
  '下鸭神社': { openingHours: '06:30-17:00', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '1小时', transport: '京都站 4 路公交 25 分钟', tips: ['糺之森原始林', '与上贺茂并称贺茂社', '葵祭 5 月'] },
  '上贺茂神社': { openingHours: '05:30-17:00', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '1-1.5小时', transport: '京都站 4 路公交 40 分钟', tips: ['京都最古神社', '立砂为独特造型', '5月葵祭古式仪典'] },

  // ── 扩展 Ring2 Batch 7: 藏传佛教 ──
  '扎什伦布寺': { openingHours: '09:00-17:00', ticketPrice: '¥100', bestSeason: '5-10月', visitDuration: '2-3小时', transport: '拉萨至日喀则大巴 6 小时', tips: ['班禅驻锡地', '强巴佛殿巨佛像 26 米', '海拔 3836 米适应'] },
  '哲蚌寺': { openingHours: '09:00-17:00', ticketPrice: '¥55', bestSeason: '5-10月', visitDuration: '半天', transport: '拉萨市区公交 11 路', tips: ['格鲁派六大寺最大', '藏历 6 月晒佛节', '辩经时段 14:00-16:00'] },
  '色拉寺': { openingHours: '09:00-17:00', ticketPrice: '¥55', bestSeason: '5-10月', visitDuration: '2-3小时', transport: '拉萨市区公交 21 路', tips: ['辩经场 15:00-17:00 必看', '马头明王殿为核心', '拉萨最后一站'] },
  '桑耶寺': { openingHours: '08:00-18:00', ticketPrice: '¥40', bestSeason: '5-10月', visitDuration: '半天', transport: '拉萨至山南大巴 2 小时转车', tips: ['藏地第一寺', '坛城式建筑独一无二', '需山南住宿方便'] },
  '塔尔寺': { openingHours: '08:00-17:00', ticketPrice: '¥70', bestSeason: '5-10月', visitDuration: '2-3小时', transport: '西宁汽车西站大巴 40 分钟', tips: ['宗喀巴诞生地', '酥油花/壁画/堆绣三绝', '农历正月法会'] },
  '拉卜楞寺': { openingHours: '08:00-18:00', ticketPrice: '¥40', bestSeason: '5-9月', visitDuration: '半天', transport: '兰州汽车南站大巴 4 小时', tips: ['藏传佛教最大高等学府', '转经长廊 3.5 公里', '正月晒佛节人潮'] },

  // ── 扩展 Ring2 Batch 8: 儒家书院 ──
  '南京夫子庙': { openingHours: '08:00-21:00', ticketPrice: '¥30', bestSeason: '3-11月', visitDuration: '2-3小时', transport: '南京地铁 3 号线夫子庙站', tips: ['明代江南贡院遗址', '秦淮河画舫夜游', '灯节 (春节元宵) 最盛'] },
  '衢州孔庙': { openingHours: '08:00-17:00', ticketPrice: '¥30', bestSeason: '3-11月', visitDuration: '1-1.5小时', transport: '衢州火车站公交 20 分钟', tips: ['南宗孔庙孔子第 48 代嫡孙南渡地', '家庙族庙一体', '秋季祭孔大典'] },
  '台南孔庙': { openingHours: '08:30-17:30', ticketPrice: 'NT$25', bestSeason: '10-4月', visitDuration: '1-1.5小时', transport: '台南火车站 2 路公交', tips: ['全台首学', '9 月 28 日祭孔大典', '建筑保留明代形制'] },
  '台北孔庙': { openingHours: '08:30-21:00 (周一闭)', ticketPrice: '免费', bestSeason: '10-4月', visitDuration: '1.5-2小时', transport: '台北捷运圆山站步行 5 分钟', tips: ['大成殿为核心', '9 月 28 日释奠典礼', '定期 4D 体验展'] },
  '首尔成均馆': { openingHours: '09:00-18:00', ticketPrice: '免费', bestSeason: '4-10月', visitDuration: '1小时', transport: '首尔地铁 4 号线 Hyehwa 站步行 10 分钟', tips: ['朝鲜王朝最高学府', '大学城一体', '5 月春季释菜礼'] },
  '河内文庙': { openingHours: '08:00-17:00', ticketPrice: '30,000 越南盾', bestSeason: '10-4月', visitDuration: '1-1.5小时', transport: '河内旧区中心出租', tips: ['越南第一大学', '进士碑 82 座乌龟驮', '春节新年祈求学业'] },
  '足利学校': { openingHours: '09:00-16:30', ticketPrice: '¥440', bestSeason: '4-11月', visitDuration: '1小时', transport: 'JR 足利站步行 10 分钟', tips: ['日本最古学校平安时代', '禅宗影响汉学中心', '秋季书法大会'] },
  '嵩阳书院': { openingHours: '08:00-18:00', ticketPrice: '¥80 (含嵩阳景区)', bestSeason: '4-10月', visitDuration: '1.5小时', transport: '登封市区公交 30 分钟', tips: ['程颢程颐讲学处', '两千年古柏树为宝', '与少林寺一日可并游'] },

  // ── 扩展 Ring2 Batch 9: 锡克&犹太 ──
  '邦格拉萨希卜': { openingHours: '24小时', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '2小时', transport: '新德里 Connaught Place 步行 10 分钟', tips: ['德里最大锡克庙', '圣水池疗愈信仰', 'langar 免费素餐 24h'] },
  '哈尔曼迪尔萨希卜': { openingHours: '24小时', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '2-3小时', transport: '阿姆利则火车站步行 20 分钟', tips: ['金庙晨 4 点圣典震撼', '免费行李/鞋寄存', '傍晚灯火倒影'] },
  '阿南德普尔萨希卜': { openingHours: '03:00-22:00', ticketPrice: '免费', bestSeason: '10-3月 (3月Hola Mohalla)', visitDuration: '2-3小时', transport: '昌迪加尔机场租车 1.5 小时', tips: ['Khalsa 创立圣地', 'langar 24 小时', 'Hola Mohalla 节 3 月盛大'] },
  '帕特那萨希卜': { openingHours: '04:00-22:00', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '1.5-2小时', transport: '巴特那机场出租 30 分钟', tips: ['Guru Gobind Singh 诞生地', '12-1 月 Prakash Utsav 节', '恒河南岸'] },

  // ── 扩展 Ring2 Batch 10: 原住民 ──
  '马丘比丘': { openingHours: '06:00-17:30 (4 时段入场)', ticketPrice: '外宾 $50+华那比丘 +$15', bestSeason: '5-9月', visitDuration: '半天-1天', transport: '库斯科火车至温泉镇 3 小时转大巴', tips: ['4 条环线单向禁回头', '雨季 12-2 月风险', '海拔 2430 米轻微高反'] },
  '提瓦纳库': { openingHours: '09:00-17:00', ticketPrice: 'BOB 100', bestSeason: '5-9月', visitDuration: '半天', transport: '拉巴斯出租 1.5 小时', tips: ['海拔 3850 米防高反', '太阳门为核心', '冬至祭典震撼'] },
  '特奥蒂瓦坎': { openingHours: '09:00-17:00', ticketPrice: 'MXN 100', bestSeason: '11-4月', visitDuration: '半天', transport: '墨西哥城 Autobuses del Norte 大巴 1 小时', tips: ['太阳金字塔 65 米可登', '羽蛇神庙为核心', '热气球观遗址流行'] },
  '帕伦克': { openingHours: '08:00-17:00', ticketPrice: 'MXN 100', bestSeason: '11-4月', visitDuration: '半天', transport: '帕伦克镇自驾 15 分钟', tips: ['玛雅雨林典型遗址', '铭刻神庙为核心', '带防蚊'] },
  '乌斯马尔': { openingHours: '08:00-17:00', ticketPrice: 'MXN 100', bestSeason: '11-4月', visitDuration: '半天', transport: '梅里达自驾 1 小时', tips: ['普克风格建筑精美', '魔法师金字塔为核心', '冬季干爽宜游'] },
  '蒂卡尔': { openingHours: '06:00-18:00', ticketPrice: 'GTQ 150', bestSeason: '11-4月', visitDuration: '1天', transport: '弗洛雷斯自驾 1.5 小时', tips: ['危地马拉热带雨林玛雅都市', 'IV 号金字塔俯瞰', '日出套票可夜宿'] },

  // ── 扩展 Ring2 Batch 11: 巴哈伊 ──
  '巴哈欧拉陵园': { openingHours: '09:00-12:00', ticketPrice: '免费', bestSeason: '3-11月', visitDuration: '1-1.5小时', transport: '海法到阿克公交 20 分钟', tips: ['巴哈伊最神圣地', '朝向祷告点', '需肃静禁拍照'] },
  '巴孛陵园': { openingHours: '09:00-12:00', ticketPrice: '免费', bestSeason: '3-11月', visitDuration: '1小时', transport: '海法轻轨 HaZiyonut 站步行 5 分钟', tips: ['空中花园下部金顶', '需参加官方免费导览', '衣着得体禁拍内部'] },
  '悉尼灵曦堂': { openingHours: '09:00-17:00', ticketPrice: '免费', bestSeason: '9-4月', visitDuration: '1小时', transport: '悉尼北岸 Ingleside 区自驾 40 分钟', tips: ['大洋洲唯一灵曦堂', '9 门 9 信仰象征', '日落海景极美'] },
  '巴拿马灵曦堂': { openingHours: '09:00-17:00', ticketPrice: '免费', bestSeason: '12-4月', visitDuration: '1小时', transport: '巴拿马城北郊自驾 20 分钟', tips: ['拉美唯一灵曦堂', '玛雅风格建筑', '设计师伯恩斯'] },
  '萨摩亚灵曦堂': { openingHours: '09:00-17:00', ticketPrice: '免费', bestSeason: '5-10月', visitDuration: '1小时', transport: '阿皮亚市区自驾 30 分钟', tips: ['太平洋区灵曦堂', '9 瓣花瓣造型', '周日礼拜对外开放'] },

  // ── 扩展 Ring3 Batch 12: 基督教拉美/俄罗斯/欧洲补强 ──
  '瓜达卢佩圣母大教堂': { openingHours: '06:00-21:00', ticketPrice: '免费', bestSeason: '11-4月', visitDuration: '2-3小时', transport: '墨西哥城地铁 La Villa-Basílica 站', tips: ['拉美朝圣量第一', '12月12日圣像节人山人海', '新旧两座殿堂并立'] },
  '法蒂玛圣母文化探访地': { openingHours: '全天', ticketPrice: '免费', bestSeason: '4-10月', visitDuration: '半天', transport: '里斯本 Rede Expressos 大巴 1.5 小时', tips: ['5-10月13日月度朝圣', '烛光游行壮观', '圣母显现地玫瑰广场'] },
  '卢尔德圣母文化探访地': { openingHours: '全天', ticketPrice: '免费', bestSeason: '4-10月', visitDuration: '半天-1天', transport: 'Lourdes 火车站步行 15 分钟', tips: ['圣水浴池排队长', '晚间烛光游行震撼', '病患朝圣首选'] },
  '莫斯科救世主大教堂': { openingHours: '10:00-18:00', ticketPrice: '免费', bestSeason: '5-9月', visitDuration: '1-2小时', transport: '地铁 Kropotkinskaya 站步行 3 分钟', tips: ['苏联炸毁后原样重建', '103米俄最高教堂', '克里姆林宫视角最佳'] },
  '滴血救世主大教堂': { openingHours: '10:30-18:00', ticketPrice: 'RUB 350', bestSeason: '5-9月', visitDuration: '1-1.5小时', transport: '圣彼得堡 Nevsky Prospekt 地铁站步行 5 分钟', tips: ['亚历山大二世遇刺地', '7500㎡马赛克举世无双', '周三闭馆'] },
  '蒙特塞拉特修道院': { openingHours: '07:30-20:00', ticketPrice: '免费 (博物馆 €8)', bestSeason: '4-10月', visitDuration: '半天', transport: '巴塞罗那火车 R5 线 + 缆车 1.5 小时', tips: ['加泰罗尼亚守护黑圣母', '山岩奇景', '13:00儿童合唱团演唱'] },
  '都柏林圣帕特里克大教堂': { openingHours: '09:30-17:00', ticketPrice: '€9', bestSeason: '5-9月', visitDuration: '1小时', transport: '都柏林市中心步行可达', tips: ['爱尔兰最大教堂', '斯威夫特墓所在', '哥特风格'] },
  '大马士革圣母升天大教堂': { openingHours: '07:00-19:00', ticketPrice: '免费', bestSeason: '3-5/9-11月', visitDuration: '1小时', transport: '老城区步行', tips: ['叙利亚东正教主教座堂', '当前局势需核实安全', '1860年重建'] },
  '巴西利亚大教堂': { openingHours: '08:00-18:00', ticketPrice: '免费', bestSeason: '5-10月', visitDuration: '1小时', transport: '巴西利亚纪念轴步行', tips: ['尼迈耶现代主义杰作', '16根抛物线柱', '地下入场仪式感强'] },
  '布宜诺斯艾利斯大教堂': { openingHours: '08:00-19:00', ticketPrice: '免费', bestSeason: '10-4月', visitDuration: '1小时', transport: '地铁 Catedral 站 (A/D/E线)', tips: ['教宗方济各曾任大主教', '圣马丁陵寝', '五月广场北侧'] },
  '加利利变像山': { openingHours: '08:00-17:00', ticketPrice: '免费 (停车费)', bestSeason: '3-5/9-11月', visitDuration: '2-3小时', transport: '提比利亚自驾 30 分钟', tips: ['耶稣登山变像处', '方济各教堂为核心', '俯瞰加利利海'] },
  '法蒂玛圣寺': { openingHours: '午后1小时除外开放', ticketPrice: '非穆斯林禁入', bestSeason: '10-4月', visitDuration: '外观1小时', transport: '开罗地铁 Al-Shohadaa 站步行', tips: ['法蒂玛王朝建', '非穆斯林仅限外观', '伊斯兰开罗世遗'] },
  '伊本·图伦清真寺': { openingHours: '08:00-17:00', ticketPrice: '免费 (捐款)', bestSeason: '10-4月', visitDuration: '1-1.5小时', transport: '开罗Sayyida Zeinab地铁站步行 10 分钟', tips: ['876年现存最老', '螺旋宣礼塔', '库法体建筑精美'] },

  // ── 扩展 Ring3 Batch 13: 印度教 ──
  '德瓦尔卡蒂神庙': { openingHours: '06:00-13:00/17:00-21:30', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '2-3小时', transport: '古吉拉特邦德瓦尔卡火车站 2 公里', tips: ['四大圣城之一', '克里希那传说', '阿拉伯海畔'] },
  '加尔各答卡莉庙': { openingHours: '05:00-22:00 (午休)', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '1-2小时', transport: '地铁 Kalighat 站步行 5 分钟', tips: ['51 Shakti Peetha 之一', '血祭传统现已减少', '排队2-3小时'] },
  '布巴内斯瓦尔林伽罗加神庙': { openingHours: '05:00-22:00', ticketPrice: '免费', bestSeason: '10-2月', visitDuration: '1.5小时', transport: '布巴内斯瓦尔机场 8 公里出租', tips: ['11世纪Kalinga风格', '非印度教徒不可入主殿', '奥迪萨古建筑典范'] },
  '蒂鲁马拉文卡塔什瓦拉神庙': { openingHours: '03:00-23:00 全年无休', ticketPrice: '免费 (特殊票 ₹300+)', bestSeason: '9-2月', visitDuration: '半天(含排队)', transport: '蒂鲁帕蒂火车站+巴士1小时上山', tips: ['世界最富神庙', 'Seva 排队8-12小时', '剃发仪式盛行'] },
  '坎奇普拉姆凯拉撒那塔': { openingHours: '06:00-12:00/16:00-20:30', ticketPrice: '免费', bestSeason: '11-2月', visitDuration: '1小时', transport: '金奈自驾 1.5 小时', tips: ['8世纪帕拉瓦王朝', '砂岩精雕', '七圣城之一'] },
  '埃洛拉凯拉撒石窟': { openingHours: '06:00-18:00 周二闭', ticketPrice: '₹40/外宾₹600', bestSeason: '10-2月', visitDuration: '半天', transport: '奥兰加巴德自驾 45 分钟', tips: ['单石凿成世界最大', 'Cave 16为核心', '印度教佛教耆那教34窟并存'] },
  '拉梅什瓦拉姆神庙': { openingHours: '05:00-13:00/15:00-21:00', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '2-3小时', transport: '马杜赖自驾 4 小时', tips: ['罗摩安置林伽处', '1200米走廊世界最长', '22圣水井沐浴仪式'] },
  '普里贾格纳神庙': { openingHours: '05:00-24:00', ticketPrice: '免费', bestSeason: '10-2月', visitDuration: '2-3小时', transport: '布巴内斯瓦尔火车 2 小时', tips: ['非印度教徒禁入', '车节 Rath Yatra 6-7月', '四大圣地之一'] },
  '马图拉': { openingHours: '04:00-21:00 各庙不同', ticketPrice: '免费', bestSeason: '10-3月 (Holi 3月)', visitDuration: '1天', transport: '新德里火车 2 小时', tips: ['克里希那诞生地', 'Holi 节盛大', '搭配沃林达文'] },
  '沃林达文': { openingHours: '各庙 04:00-22:00', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '1天', transport: '马图拉出租 30 分钟', tips: ['克里希那童年地', 'Banke Bihari Temple核心', '寡妇之城别名'] },
  '阿约提亚': { openingHours: '全天', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '1天', transport: '勒克瑙自驾 2.5 小时', tips: ['罗摩诞生地', '2024年新罗摩神庙落成', '安检严格'] },
  '索玛纳特神庙': { openingHours: '06:00-21:30', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '2小时', transport: '古吉拉特邦 Veraval 火车 6 公里', tips: ['12 Jyotirlinga 之首', '阿拉伯海日落音光秀', '现代重建第七代'] },
  '萨巴里马拉': { openingHours: '11-1月/4月', ticketPrice: '免费', bestSeason: '11-1月', visitDuration: '1-2天朝圣', transport: 'Kottayam 火车+巴士+徒步18公里', tips: ['Ayyappa神圣地', '41天斋戒后朝圣', '10-50岁女性传统禁入'] },
  '维鲁帕克沙神庙': { openingHours: '06:00-12:30/17:00-20:30', ticketPrice: '₹10', bestSeason: '10-2月', visitDuration: '1-1.5小时', transport: 'Hampi遗址内步行', tips: ['Hampi 世遗核心', '50米宣礼塔', '7世纪至今活庙'] },
  '吴哥窟印度文化': { openingHours: '05:00-17:30', ticketPrice: '单日 $37', bestSeason: '11-3月', visitDuration: '1天', transport: '暹粒 Tuk-tuk 20 分钟', tips: ['世界最大宗教建筑', '日出面向西特殊设计', '毗湿奴神庙后改佛教'] },

  // ── 扩展 Ring3 Batch 14: 伊斯兰教 ──
  '布尔萨绿色清真寺': { openingHours: '礼拜外开放', ticketPrice: '免费', bestSeason: '4-10月', visitDuration: '1小时', transport: '布尔萨市中心出租', tips: ['15世纪奥斯曼早期杰作', '绿色瓷砖内饰', '需脱鞋入'] },
  '达卡星星清真寺': { openingHours: '礼拜外开放', ticketPrice: '免费', bestSeason: '11-2月', visitDuration: '45分钟', transport: '达卡 Armanitola 区', tips: ['18世纪莫卧儿风格', '蓝色星星马赛克', '女性入需长袍'] },
  '卡鲁因清真寺': { openingHours: '非穆斯林禁入', ticketPrice: '外观免费', bestSeason: '3-5/9-11月', visitDuration: '外观30分钟', transport: '非斯麦地那步行', tips: ['859年世界最老大学', '非穆斯林限外观', '麦地那迷宫核心'] },
  '津加里贝尔清真寺': { openingHours: '开放时间不定', ticketPrice: '免费', bestSeason: '11-2月', visitDuration: '1小时', transport: '廷巴克图市中心', tips: ['马里泥砖清真寺', '1327年', '当前安全形势需核实'] },
  '马来西亚国家清真寺': { openingHours: '09:00-12:00/15:00-16:00/17:30-18:30', ticketPrice: '免费', bestSeason: '5-9月', visitDuration: '1-1.5小时', transport: '吉隆坡中央火车站步行 10 分钟', tips: ['73米宣礼塔', '16角星伞状屋顶', '女性入口提供长袍'] },
  '奥马尔·阿里·赛义夫丁清真寺': { openingHours: '非礼拜时段开放', ticketPrice: '免费', bestSeason: '全年', visitDuration: '1小时', transport: '斯里巴加湾市中心', tips: ['文莱首都地标', '金顶意大利大理石', '人工潟湖皇家游船模型'] },
  '伊斯蒂赫拉尔清真寺': { openingHours: '礼拜外开放', ticketPrice: '免费', bestSeason: '5-9月', visitDuration: '1小时', transport: '雅加达 Gambir 火车站步行 5 分钟', tips: ['东南亚最大', '对面天主教堂呼应', '印尼独立清真寺名'] },
  '西安化觉巷清真大寺': { openingHours: '08:00-19:00', ticketPrice: '¥25', bestSeason: '4-10月', visitDuration: '1-1.5小时', transport: '西安钟楼步行 10 分钟', tips: ['中国最大清真寺之一', '中式四合院布局', '礼拜时段非穆斯林限外院'] },
  '艾提尕尔清真寺': { openingHours: '09:00-20:00', ticketPrice: '¥30 (非礼拜)', bestSeason: '4-10月', visitDuration: '1小时', transport: '喀什老城中心', tips: ['新疆最大清真寺', '1442年', '周五主麻日人气最盛'] },
  '约旦河西岸亚布拉欣清真寺': { openingHours: '划时段穆斯林/犹太教', ticketPrice: '免费', bestSeason: '3-5/9-11月', visitDuration: '1小时', transport: '希伯伦安检后步行', tips: ['亚伯拉罕家族墓', '穆斯林犹太双用', '安检极严'] },
  '毛里求斯大盆地': { openingHours: '全天', ticketPrice: '免费', bestSeason: '5-10月', visitDuration: '2-3小时', transport: '路易港自驾 1 小时', tips: ['印度洋岛湿婆圣地', 'Maha Shivaratri 2月大朝圣', '108米湿婆像'] },

  // ── 扩展 Ring3 Batch 15: 犹太教 ──
  '洛杉矶威尔希大会堂': { openingHours: '预约参观', ticketPrice: '免费', bestSeason: '全年', visitDuration: '1小时', transport: 'LA Koreatown区', tips: ['1929年历史建筑', '好莱坞名人常礼拜', '电影取景地'] },
  '开罗本以斯拉会堂': { openingHours: '09:00-16:00', ticketPrice: '免费', bestSeason: '10-4月', visitDuration: '45分钟', transport: '开罗老城科普特区步行', tips: ['9世纪Geniza文献发现地', '传摩西藏匿处', '安检严格'] },
  '摩洛哥伊本·丹南会堂': { openingHours: '09:00-18:00', ticketPrice: 'MAD 20', bestSeason: '3-5/9-11月', visitDuration: '45分钟', transport: '非斯麦拉清真犹太区', tips: ['17世纪', '非斯犹太遗产', '融合摩洛哥工艺'] },
  '特拉维夫大会堂': { openingHours: '09:00-13:00', ticketPrice: '免费', bestSeason: '3-5/9-11月', visitDuration: '45分钟', transport: 'Allenby 街步行', tips: ['1926年Bauhaus白城', '以色列独立宣言地', '安检严格'] },
  '阿姆斯特丹葡萄牙会堂': { openingHours: '10:00-17:00', ticketPrice: '€17 (含博物馆)', bestSeason: '4-10月', visitDuration: '1-1.5小时', transport: 'Waterlooplein 地铁站', tips: ['1675年Sephardi建筑', '烛光礼拜特别美', '犹太历史博物馆联票'] },
  '威尼斯犹太区': { openingHours: '博物馆10:00-18:00', ticketPrice: '€12', bestSeason: '4-10月', visitDuration: '2-3小时', transport: '威尼斯 Cannaregio 区', tips: ['世界首个 Ghetto 1516年', '5座会堂导览制', '周六安息日闭'] },
  '柏林新会堂': { openingHours: '10:00-18:00 周五14:00', ticketPrice: '€7', bestSeason: '5-9月', visitDuration: '1.5小时', transport: '地铁 Oranienburger Str. 站', tips: ['水晶之夜受损重建', '摩尔风格金顶', '必过机场级安检'] },
  '维也纳主会堂': { openingHours: '11:30/14:00导览', ticketPrice: '€5', bestSeason: '5-9月', visitDuration: '1小时', transport: '维也纳1区步行', tips: ['1826年唯一幸存', '预约+护照进入', '导览制限时'] },
  '纽约爱玛努尔会堂': { openingHours: '10:00-16:30 周六闭', ticketPrice: '免费', bestSeason: '4-10月', visitDuration: '1小时', transport: '地铁 5Av/59St 站', tips: ['Reform 旗舰', '2500 座位世界最大之一', '音乐会常办'] },
  '布达佩斯大犹太会堂': { openingHours: '10:00-18:00', ticketPrice: 'HUF 14000', bestSeason: '4-10月', visitDuration: '1.5小时', transport: 'Astoria 地铁站', tips: ['欧洲最大3000座', '摩尔风格', 'Theodor Herzl纪念花园'] },
  '布拉格老新犹太会堂': { openingHours: '09:00-18:00 周六闭', ticketPrice: 'CZK 220', bestSeason: '5-9月', visitDuration: '30-45分钟', transport: 'Staroměstská 地铁站', tips: ['13世纪欧洲最老', 'Golem传说地', '犹太博物馆联票'] },
  '布拉格皮卡斯犹太会堂': { openingHours: '09:00-18:00 周六闭', ticketPrice: '犹太博物馆联票', bestSeason: '5-9月', visitDuration: '30分钟', transport: 'Staroměstská 地铁站步行', tips: ['8万纳粹受害者姓名墙', '儿童画展', '联票必看'] },
  '多伦多贝丝太菲拉会堂': { openingHours: '预约开放', ticketPrice: '免费', bestSeason: '5-10月', visitDuration: '1小时', transport: '多伦多 Forest Hill 区', tips: ['Conservative 社群', '20世纪中叶风格', '礼拜对外'] },
  '布宜诺斯艾利斯大会堂': { openingHours: '预约参观', ticketPrice: '免费', bestSeason: '10-4月', visitDuration: '1小时', transport: 'Libertad 街', tips: ['拉美最大会堂', '1994年爆炸案纪念', '极严安检'] },
  '开普敦犹太会堂': { openingHours: '10:00-17:00 周五闭', ticketPrice: 'ZAR 50', bestSeason: '11-3月', visitDuration: '1小时', transport: '公司花园步行', tips: ['南非犹太博物馆联票', '1905年开普荷兰风格', '曼德拉展区'] },
  '拉宾纪念广场会堂': { openingHours: '公共区全天', ticketPrice: '免费', bestSeason: '3-5/9-11月', visitDuration: '30分钟', transport: '特拉维夫市政厅步行', tips: ['拉宾遇刺地', '广场改名纪念', '11月4日纪念日'] },

  // ── 扩展 Ring3 Batch 16: 印尼本地神道/湿婆 ──
  '巴厘岛乌鲁瓦图神庙': { openingHours: '07:00-19:00', ticketPrice: 'IDR 50000', bestSeason: '5-9月', visitDuration: '2-3小时', transport: '库塔自驾 1 小时', tips: ['悬崖70米海景', '18:00 Kecak 火舞演出', '防猴抢物'] },
  '巴厘岛布撒基母庙': { openingHours: '08:00-17:00', ticketPrice: 'IDR 75000', bestSeason: '5-9月', visitDuration: '2-3小时', transport: '乌布自驾 1.5 小时', tips: ['阿贡火山脚母庙', '22座小庙群', '常遇"导游"骗费'] },
  '普兰巴南神庙': { openingHours: '06:30-17:00', ticketPrice: '外宾 $25', bestSeason: '5-9月', visitDuration: '半天', transport: '日惹自驾 30 分钟', tips: ['9世纪印度教世遗', '三大神庙47米高', '5-10月拉玛雅那舞剧'] },

  // ── 扩展 Ring3 Batch 17: 儒家书院 ──
  '东林书院': { openingHours: '08:30-17:00', ticketPrice: '¥15', bestSeason: '3-11月', visitDuration: '1.5小时', transport: '无锡火车站出租 15 分钟', tips: ['顾宪成重建', '"风声雨声"名联', '依庸堂为核心'] },
  '应天书院': { openingHours: '08:30-17:30', ticketPrice: '¥50', bestSeason: '4-10月', visitDuration: '1.5小时', transport: '商丘古城步行', tips: ['四大书院之首', '北宋范仲淹讲学地', '崇圣殿为核心'] },
  '武夷精舍': { openingHours: '08:00-17:00', ticketPrice: '武夷山景区门票', bestSeason: '4-10月', visitDuration: '1小时', transport: '武夷山景区内九曲溪五曲', tips: ['朱熹讲学50年', '集理学之大成', '水帘洞近'] },
  '漳州府文庙': { openingHours: '08:30-17:00', ticketPrice: '免费凭证件', bestSeason: '10-4月', visitDuration: '1小时', transport: '漳州市区步行', tips: ['闽南最大文庙', '宋代始建', '闽南古建筑典范'] },
  '石鼓书院': { openingHours: '09:00-17:00', ticketPrice: '¥30', bestSeason: '4-10月', visitDuration: '1.5小时', transport: '衡阳市区出租 10 分钟', tips: ['湖湘学派发源', '湘江畔', '韩愈朱熹讲学'] },
  '紫阳书院': { openingHours: '08:30-17:00', ticketPrice: '¥20', bestSeason: '3-11月', visitDuration: '1小时', transport: '杭州地铁4号线', tips: ['朱熹别号紫阳', '西湖畔', '浙派理学重镇'] },
  '庆州乡校': { openingHours: '09:00-18:00 周一闭', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '1小时', transport: '庆州东部步行', tips: ['新罗朝鲜儒学', '韩屋群落', '搭配佛国寺'] },
  '汤岛圣堂': { openingHours: '09:30-17:00', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '45分钟', transport: '地铁御茶之水站步行 3 分钟', tips: ['日本儒学中心', '江户幕府昌平坂学问所', '1月考试祈福'] },

  // ── 扩展 Ring3 Batch 18: 锡克教 ──
  '塔兰塔兰萨希卜': { openingHours: '03:00-22:00', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '2小时', transport: '阿姆利则自驾 45 分钟', tips: ['第五代祖师建', '水池环绕', '人气低需安排交通'] },
  '宗迪亚拉古鲁德瓦拉': { openingHours: '03:00-22:00', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '1.5小时', transport: '阿姆利则自驾 30 分钟', tips: ['Guru Gobind Singh纪念', 'Khalsa起源', '红砂岩建筑'] },
  '杜克巴杰尼古鲁德瓦拉': { openingHours: '04:00-22:00', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '1小时', transport: '贾朗达尔自驾 20 分钟', tips: ['第六祖师蒙难追忆地', '人气较低', '朝圣环线之一'] },
  '哈兹尔萨希卜': { openingHours: '04:00-22:00', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '2-3小时', transport: 'Nanded火车站步行', tips: ['末代祖师圆寂地', '5大Takht之一', '金色穹顶华丽'] },
  '南德德胡尔萨希卜': { openingHours: '04:00-22:00', ticketPrice: '免费', bestSeason: '10-3月', visitDuration: '1.5小时', transport: 'Nanded市内出租', tips: ['哈兹尔萨希卜卫星庙群', '朝圣必经', '免费langan'] },
  '芝加哥锡克文化中心': { openingHours: '06:00-21:00', ticketPrice: '免费', bestSeason: '5-10月', visitDuration: '1.5小时', transport: 'Palatine区自驾', tips: ['美中西部最大', '周日langar对外开放', '锡克教育课'] },
  '温哥华罗斯街锡克庙': { openingHours: '04:00-21:00', ticketPrice: '免费', bestSeason: '5-9月', visitDuration: '1小时', transport: 'Ross St Skytrain步行', tips: ['加拿大最大锡克庙之一', '4月Vaisakhi巡游', 'langar对所有人'] },
  '伦敦索霍路锡克庙': { openingHours: '04:30-22:00', ticketPrice: '免费', bestSeason: '5-9月', visitDuration: '1小时', transport: 'Southall火车站步行 10 分钟', tips: ['欧洲最大锡克庙', '3000人同时礼拜', '免费langar极有名'] },
  '新加坡中央锡克庙': { openingHours: '05:00-21:30', ticketPrice: '免费', bestSeason: '2-4月', visitDuration: '1小时', transport: '地铁 Little India 站步行', tips: ['新加坡锡克中心', 'Vaisakhi 盛大', 'langar周日最旺'] },
  '曼谷锡克庙': { openingHours: '05:00-22:00', ticketPrice: '免费', bestSeason: '11-2月', visitDuration: '1小时', transport: '地铁 Sam Yot 站步行', tips: ['东南亚知名', '金色穹顶', 'langar免费素食'] },
  '迪拜锡克庙': { openingHours: '04:00-22:00', ticketPrice: '免费', bestSeason: '11-3月', visitDuration: '1小时', transport: '地铁Jebel Ali 站出租', tips: ['海湾唯一独立锡克庙', '穹顶金光', 'langar对所有宗教开放'] },
  '巴林锡克文化中心': { openingHours: '礼拜时段开放', ticketPrice: '免费', bestSeason: '11-3月', visitDuration: '45分钟', transport: '麦纳麦市内出租', tips: ['海湾小型中心', 'langar自由参与', '游客可参礼'] },
  '多伦多大锡克文化中心': { openingHours: '05:00-22:00', ticketPrice: '免费', bestSeason: '5-10月', visitDuration: '1小时', transport: 'Dixie Rd 自驾', tips: ['北美最大锡克建筑之一', '穹顶18米', '周日聚会数千人'] },
  '伯明翰锡克庙': { openingHours: '04:30-21:30', ticketPrice: '免费', bestSeason: '5-9月', visitDuration: '1小时', transport: 'Handsworth 巴士', tips: ['英伦工业城锡克中心', 'langan社区活动', '4月Vaisakhi游行'] },

  // ── 扩展 Ring3 Batch 19: 神道教 ──
  '靖国神社': { openingHours: '06:00-18:00', ticketPrice: '免费 (博物馆¥1000)', bestSeason: '春秋', visitDuration: '1-2小时', transport: '地铁九段下站步行 5 分钟', tips: ['争议地政治敏感', '约30万樱花3月下旬', '游就馆展二战史观'] },
  '柯达拉特之井': { openingHours: '全天', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '45分钟', transport: '奈良公园步行', tips: ['神道水源祭祀地', '春日大社参拜前净身', '鹿伴随'] },
  '石清水八幡宫': { openingHours: '06:00-18:00', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '1.5小时', transport: '京都京阪本线八幡市站+缆车', tips: ['日本三大八幡', '男山山顶', '爱迪生纪念碑特色'] },
  '香取神宫': { openingHours: '全天', ticketPrice: '免费 (宝物馆¥300)', bestSeason: '春秋', visitDuration: '1.5小时', transport: '成田机场自驾 30 分钟', tips: ['关东古社之一', '武神经津主神', '杉树参道震撼'] },
  '鹿岛神宫': { openingHours: '08:30-16:30', ticketPrice: '免费 (博物馆¥300)', bestSeason: '春秋', visitDuration: '1.5小时', transport: '东京 JR 鹿岛线 2 小时', tips: ['武神 Takemikazuchi', '大鸟居白木造', '奥宫需走森林路'] },
  '贵船神社': { openingHours: '06:00-20:00', ticketPrice: '免费', bestSeason: '夏7-8月', visitDuration: '1-1.5小时', transport: '京都叡山电铁+巴士', tips: ['水占签特色', '夏季川床料理有名', '赤色灯笼照片经典'] },
  '大神神社': { openingHours: '全天', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '1.5-2小时', transport: 'JR三轮站步行 5 分钟', tips: ['日本最古神社之一', '三轮山本身即神体', '无本殿独特'] },
  '住吉大社': { openingHours: '06:00-17:00', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '1.5小时', transport: '大阪南海本线住吉大社站', tips: ['全国住吉总社', '反橋太鼓桥', '1月初诣百万人'] },
  '热田神宫': { openingHours: '全天', ticketPrice: '免费 (宝物馆¥300)', bestSeason: '春秋', visitDuration: '1.5小时', transport: '名古屋地铁神宫西站', tips: ['三种神器草薙剑所在', '1900年历史', '护佐'] },
  '宗像大社': { openingHours: '06:00-18:00', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '2小时', transport: 'JR东乡站+巴士', tips: ['世遗三宫', '玄界滩海上丝路', '沖之岛限男性朝圣'] },
  '三岛大社': { openingHours: '全天', ticketPrice: '免费 (宝物馆¥500)', bestSeason: '春秋', visitDuration: '1小时', transport: 'JR三岛站步行 10 分钟', tips: ['伊豆最古神社', '春樱桜并木震撼', '每日茅轮祓'] },
  '冰川神社': { openingHours: '全天', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '1小时', transport: 'JR大宫站步行 15 分钟', tips: ['关东冰川总社', '两千年历史', '参道2公里直线'] },
  '宫崎神宫': { openingHours: '05:30-18:30', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '1小时', transport: 'JR宫崎神宫站步行 10 分钟', tips: ['神武天皇起源', '4月 Gyoretsu 大祭', '九州神道中心'] },
  '熊野三山': { openingHours: '全天', ticketPrice: '免费 (三社连票建议)', bestSeason: '春秋', visitDuration: '1-2天', transport: '新宫站巴士+徒步', tips: ['本宫/速玉/那智三社', '古道熊野参诣道世遗', '雨季需查路况'] },
  '宇佐神宫': { openingHours: '06:00-18:00', ticketPrice: '免费', bestSeason: '春秋', visitDuration: '1.5小时', transport: 'JR宇佐站巴士', tips: ['全国八幡总本宫', '九州大分县', '春木树道'] },

  // ── 扩展 Ring3 Batch 20: 藏传佛教 ──
  '萨迦寺': { openingHours: '09:00-17:30', ticketPrice: '¥45', bestSeason: '5-10月', visitDuration: '2-3小时', transport: '日喀则自驾 2.5 小时', tips: ['萨迦派祖庭', '4万部藏书藏宝', '花教灰白红三色墙'] },
  '楚布寺': { openingHours: '09:00-17:00', ticketPrice: '¥40', bestSeason: '5-10月', visitDuration: '2-3小时', transport: '拉萨自驾 2 小时', tips: ['噶玛噶举派祖庭', '海拔4300米防高反', '大宝法王祖庭'] },
  '直贡梯寺': { openingHours: '09:00-17:00', ticketPrice: '¥30', bestSeason: '5-10月', visitDuration: '半天', transport: '拉萨自驾 3 小时', tips: ['直贡噶举派祖庭', '天葬台著名不开放拍摄', '海拔4465米'] },
  '青海瞿昙寺': { openingHours: '08:00-17:30', ticketPrice: '¥60', bestSeason: '6-9月', visitDuration: '1.5小时', transport: '西宁自驾 1.5 小时', tips: ['汉式明代建筑', '壁画堪比敦煌', '藏传格鲁派'] },
  '青海夏琼寺': { openingHours: '09:00-17:00', ticketPrice: '¥30', bestSeason: '6-9月', visitDuration: '1.5小时', transport: '化隆县自驾', tips: ['宗喀巴出家地', '格鲁派母寺', '海拔2900米'] },
  '云南松赞林寺': { openingHours: '07:00-18:00', ticketPrice: '¥115', bestSeason: '4-10月', visitDuration: '半天', transport: '香格里拉市出租 15 分钟', tips: ['小布达拉宫', '格鲁派云南最大', '高原气候准备'] },
  '德格印经院': { openingHours: '09:00-12:30/14:30-17:00', ticketPrice: '¥50', bestSeason: '6-9月', visitDuration: '2小时', transport: '甘孜德格县自驾', tips: ['藏文化三大印经院', '32万经版', '雕版印刷工艺世遗'] },
  '甘南郎木寺': { openingHours: '08:00-18:00', ticketPrice: '¥30', bestSeason: '6-9月', visitDuration: '半天', transport: '兰州自驾 6 小时', tips: ['东方小瑞士', '白龙江源头', '天葬台著名'] },
  '加德满都玛哈伽加塔': { openingHours: '06:00-19:00', ticketPrice: 'NPR 200', bestSeason: '10-3月', visitDuration: '2小时', transport: '加德满都机场出租', tips: ['博达哈大塔别名', '藏人社区核心', '转经筒长廊'] },
  '黑密斯寺': { openingHours: '06:00-18:00', ticketPrice: 'INR 100', bestSeason: '6-9月', visitDuration: '3-4小时', transport: '列城自驾 40 分钟', tips: ['拉达克最大藏传', '6月节庆舞蹈', '海拔3505米'] },
  '蒙古甘丹寺': { openingHours: '09:00-17:00', ticketPrice: 'MNT 7000', bestSeason: '6-9月', visitDuration: '1.5小时', transport: '乌兰巴托市中心步行 20 分钟', tips: ['蒙古藏传中心', '26米弥勒佛像', '格鲁派'] },
  '博达哈大佛塔': { openingHours: '全天', ticketPrice: 'NPR 400', bestSeason: '10-3月', visitDuration: '2-3小时', transport: '加德满都机场出租 10 分钟', tips: ['尼泊尔最大佛塔', '藏人流亡核心', '2015地震后重建'] },
  '斯瓦扬布纳特': { openingHours: '全天', ticketPrice: 'NPR 200', bestSeason: '10-3月', visitDuration: '2小时', transport: '加德满都市中心出租 15 分钟', tips: ['猴庙别名', '365级登山', '俯瞰加都全景'] },
  '不丹普那卡宗': { openingHours: '11:00-13:00/15:00-17:00', ticketPrice: 'BTN 300', bestSeason: '3-5/9-11月', visitDuration: '2小时', transport: '廷布自驾 2.5 小时', tips: ['不丹冬都', '宗堡建筑典范', '紫荆花 3-4 月盛开'] },

  // ── 扩展 Ring3 Batch 21: 原住民 & 跨地区 ──
  '科帕卡瓦纳': { openingHours: '全天', ticketPrice: '免费', bestSeason: '5-10月', visitDuration: '1-2天', transport: '拉巴斯大巴 3.5 小时', tips: ['的的喀喀湖畔朝圣镇', '黑圣母玛利亚像', '海拔3800米'] },
  '纳米布红岩': { openingHours: '日出-日落', ticketPrice: 'NAD 80', bestSeason: '5-9月', visitDuration: '1-2天', transport: '温得和克自驾 5 小时', tips: ['Sossusvlei 红沙丘', '日出Dune 45必看', '死亡谷白骨苍劲'] },
  '冈仁波齐神山': { openingHours: '全年开放朝圣', ticketPrice: '阿里地区许可+¥200', bestSeason: '5-10月', visitDuration: '3天转山', transport: '拉萨自驾 3 天或飞机到普兰', tips: ['四教圣山', '52km转山道海拔5630米', '体能+高反准备'] },
  '因加皮尔卡': { openingHours: '08:00-18:00', ticketPrice: '$2', bestSeason: '6-9月', visitDuration: '2-3小时', transport: '昆卡自驾 2 小时', tips: ['厄瓜多尔最大印加遗址', '太阳神庙椭圆布局', '海拔3160米'] },
  '埃尔多拉多湖': { openingHours: '09:00-17:00', ticketPrice: 'COP 42000', bestSeason: '12-3月', visitDuration: '半天', transport: '波哥大自驾 1 小时', tips: ['穆伊斯卡金人传说发源', 'Guatavita湖', '步道海拔3000米'] },
  '大津巴布韦': { openingHours: '07:00-18:00', ticketPrice: 'USD 15', bestSeason: '5-10月', visitDuration: '半天', transport: '马斯温戈自驾 30 分钟', tips: ['撒哈拉以南最大石建筑', '11-15世纪绍纳王国', '津巴布韦国名来源'] },
  '夏威夷莫纳克亚': { openingHours: '全天 (登顶受限)', ticketPrice: '免费', bestSeason: '5-10月', visitDuration: '半天-1天', transport: '希洛自驾 2 小时', tips: ['原住民圣山', '4205米观星圣地', '登顶需高反适应'] },
  '哈依达瓜埃': { openingHours: '访问需许可', ticketPrice: '许可费', bestSeason: '6-9月', visitDuration: '多日', transport: '温哥华飞桑德斯皮特+船', tips: ['海达原住民故土', '北美版加拉帕戈斯', 'SGang Gwaay世遗图腾柱'] },
  '蒂罗亚毛利圣山': { openingHours: '全天 (登顶季节性)', ticketPrice: '免费 (捐款)', bestSeason: '11-4月', visitDuration: '1-2天', transport: '陶波自驾 45 分钟', tips: ['汤加里罗国家公园', '毛利精神之源', '冬季火山攀登禁'] },
  '科罗拉多四角地': { openingHours: '08:00-18:00', ticketPrice: '$8', bestSeason: '5-10月', visitDuration: '1-2小时', transport: 'Cortez 自驾 1 小时', tips: ['四州交界纳瓦霍圣地', 'Anasazi文化遗址周边', '纪念品市集'] },
  '塞内加尔圣木林': { openingHours: '白天开放', ticketPrice: '村庄捐款', bestSeason: '11-2月', visitDuration: '半天', transport: '达喀尔自驾 4 小时', tips: ['塞雷尔族圣林', '猴面包树千年', '需当地向导进入'] },
  '北极圈萨米鼓圣地': { openingHours: '夏季6-9月', ticketPrice: '免费', bestSeason: '6-8月', visitDuration: '2小时', transport: '奥斯陆飞Alta+陆路', tips: ['萨米原住民岩画世遗', '极昼可全夜访问', '需尊重仪式区'] },

  // ── 扩展 Ring3 Batch 22: 巴哈伊 ──
  '世界公义院': { openingHours: '9:00-12:00', ticketPrice: '免费', bestSeason: '3-11月', visitDuration: '30分钟外观', transport: '海法 Carmel 山', tips: ['巴哈伊最高治理机构', '仅外观无内参观', '位于空中花园'] },
  '阿卡巴比花园': { openingHours: '9:00-16:00 周四-周一', ticketPrice: '免费', bestSeason: '3-11月', visitDuration: '1-1.5小时', transport: '海法至阿卡公交', tips: ['巴哈欧拉晚年居地', '与Bahji陵园同园区', '柏树花坛'] },
  '设拉子巴孛诞生地': { openingHours: '因政策限制', ticketPrice: '受限', bestSeason: '4-5/9-10月', visitDuration: '1小时外观', transport: '设拉子市中心', tips: ['巴孛诞生的遗址', '1979革命后多次毁损', '多为朝圣精神纪念'] },
  '阿德里安堡圣地': { openingHours: '公开区全天', ticketPrice: '免费', bestSeason: '4-10月', visitDuration: '1-2小时', transport: '伊斯坦布尔巴士 3 小时', tips: ['巴哈欧拉流亡地', '土耳其 Edirne 城', '墓园可访'] },
  '塞浦路斯巴哈伊中心': { openingHours: '9:00-17:00', ticketPrice: '免费', bestSeason: '4-6/9-11月', visitDuration: '45分钟', transport: '尼科西亚市中心', tips: ['地中海区中心', '图书馆开放', '活动日历可查'] },
  '阿联酋巴哈伊中心': { openingHours: '预约开放', ticketPrice: '免费', bestSeason: '11-3月', visitDuration: '1小时', transport: '阿布扎比市内', tips: ['海湾区国家中心', '欢迎游客访谈', '周五主活动'] },
  '加拿大巴哈伊国家中心': { openingHours: '9:00-17:00', ticketPrice: '免费', bestSeason: '5-10月', visitDuration: '1小时', transport: '多伦多 Thornhill 区', tips: ['加拿大最高管理处', '图书馆档案丰富', '欢迎导览预约'] },
  '伦敦巴哈伊中心': { openingHours: '9:30-17:00', ticketPrice: '免费', bestSeason: '5-9月', visitDuration: '1小时', transport: 'Rutland Gate 地铁 South Kensington 步行', tips: ['英国国家中心', '公开讲座常办', '历史建筑'] },
  '巴格达圣居': { openingHours: '访问受限', ticketPrice: '受限', bestSeason: '10-4月', visitDuration: '外观', transport: '巴格达市内安全考量', tips: ['巴哈欧拉1853-63流亡居所', '现属清真寺管控', '朝圣重要精神地'] },
  '法兰克福灵曦堂': { openingHours: '09:00-17:00', ticketPrice: '免费', bestSeason: '5-9月', visitDuration: '1小时', transport: '法兰克福 S-Bahn Bad Homburg', tips: ['欧洲唯一灵曦堂', '9门9信仰', '公园环境静谧'] },
  '乌干达灵曦堂': { openingHours: '09:00-17:00', ticketPrice: '免费', bestSeason: '6-9月', visitDuration: '1小时', transport: '坎帕拉近郊自驾', tips: ['非洲唯一灵曦堂', 'Kikaaya Hill 山顶', '绿荫环绕'] },
  '圣地亚哥灵曦堂': { openingHours: '09:00-17:00', ticketPrice: '免费', bestSeason: '10-4月', visitDuration: '1.5小时', transport: '圣地亚哥郊外自驾 45 分钟', tips: ['南美唯一灵曦堂', '安第斯山麓半透明玻璃', '2016年启用'] },
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
