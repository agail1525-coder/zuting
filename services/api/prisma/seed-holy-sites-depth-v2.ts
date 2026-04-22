/**
 * 目的地++ v2 · 全量深度化 · 491+ 站点 6 Json 字段模板化覆盖
 *
 * 定位:
 *   v1 pilot 已手写 12 旗舰 (photoStory 非空). v2 针对剩余全部站点按
 *   religion.slug × country 组合模板, 覆盖以下 6 字段:
 *     transportLegs / culturalProducts / openingHoursBySeason
 *     visitorTipsGrouped / localGuides / photoStory
 *
 * 幂等:
 *   - photoStory 非空的站点跳过 (保留 pilot 手写内容)
 *   - 其他站点仅 update 当前为 null 的字段, 已人工填写的不覆盖
 *   - 可重复运行
 *
 * 对齐: DST-50 ~ DST-58 详情页深度字段铁律
 */
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

type TransportLeg = {
  from: string;
  to: string;
  mode: string;
  distanceKm?: number;
  durationMin?: number;
  note?: string;
  costFrom?: number;
};
type CulturalProduct = { name: string; desc: string; emoji?: string; tag?: string; priceFrom?: number };
type SeasonHour = { open: string; close: string; note?: string };
type OpeningHoursBySeason = { spring: SeasonHour; summer: SeasonHour; autumn: SeasonHour; winter: SeasonHour };
type VisitorTipsGrouped = { transport: string[]; dining: string[]; gear: string[]; etiquette: string[] };
type LocalGuide = { name: string; specialty: string; languages: string[]; rating?: number; bio: string };
type PhotoFrame = { imageUrl?: string; caption: string; shotLocation?: string; significance: string; order: number };

type ReligionTemplate = {
  products: CulturalProduct[];
  etiquette: string[];
  dining: string[];
  gear: string[];
  defaultOpen: string;
  defaultClose: string;
  guideSpecialty: string;
  guideNameStem: string;
  greeting: string;
};

const REL: Record<string, ReligionTemplate> = {
  buddhism: {
    products: [
      { name: '经论讲读册', desc: '小鸿团队编注 · 本圣地相关文段精选双语导读', emoji: '📖', tag: '人手一册', priceFrom: 68 },
      { name: '手抄经宣纸本', desc: '线装本 · 本地老匠人手作, 适合抄经静心', emoji: '📜', tag: '文化伴手', priceFrom: 88 },
      { name: '禅意手串', desc: '本地匠作 108 颗木珠 · 含寺方加持说明', emoji: '📿', tag: '手工艺', priceFrom: 120 },
      { name: '禅茶三件套', desc: '本地禅茶 + 宋式建盏 + 青石茶盘', emoji: '🍵', tag: '文化伴手', priceFrom: 280 },
    ],
    etiquette: ['殿内请止语, 不拍佛像正面', '绕塔顺时针, 勿踩门槛', '着装遮肩不露腿, 忌短裤短裙', '不在殿内饮食吸烟', '进殿脱帽, 随喜布施'],
    dining: ['寺内过堂斋饭需提前登记', '周边素食馆可提供全日素餐', '忌携荤食/酒水进入寺院'],
    gear: ['软底防滑鞋(大殿石阶湿滑)', '雨具+外套(山寺温差大)', '保暖背心(晨钟暮鼓温度低)'],
    defaultOpen: '06:30', defaultClose: '17:30',
    guideSpecialty: '佛教文化讲读 · 经论溯源',
    guideNameStem: '法',
    greeting: '阿弥陀佛',
  },
  taoism: {
    products: [
      { name: '《道德经》精装讲读本', desc: '帛书本 + 通行本双栏对照 · 含历史脉络导读', emoji: '📖', tag: '人手一册', priceFrom: 58 },
      { name: '道家香囊', desc: '本地草药配方 · 手工布艺绣符', emoji: '🎐', tag: '手工艺', priceFrom: 80 },
      { name: '八卦铜镜吊坠', desc: '本地匠作 · 仿唐宋式样', emoji: '🧭', tag: '文化伴手', priceFrom: 180 },
      { name: '葫芦养生茶', desc: '道家药食同源 · 本地草药', emoji: '🍵', tag: '文化伴手', priceFrom: 120 },
    ],
    etiquette: ['进殿脱帽, 男左女右入门', '不指神像, 不横跨香炉', '长幼有序, 让年长者先礼', '上香请用三炷清香, 忌高香速香', '道袍道冠不可随意触碰'],
    dining: ['道家素斋讲究"不破气", 食材清淡', '忌食五荤 · 葱蒜韭薤兴渠', '可饮茶不饮酒'],
    gear: ['登山杖(道观多在山岭)', '保暖外套(山风大)', '易穿脱鞋(常需脱鞋入殿)'],
    defaultOpen: '07:00', defaultClose: '17:00',
    guideSpecialty: '道家文化讲读 · 养生脉络',
    guideNameStem: '玄',
    greeting: '福生无量天尊',
  },
  christianity: {
    products: [
      { name: '精装《圣经》导览本', desc: '本地语言 + 英文双语, 含历史注释', emoji: '📖', tag: '人手一册', priceFrom: 80 },
      { name: '手工十字架挂件', desc: '本地匠作木/金属 · 含教堂印章', emoji: '✝️', tag: '文化伴手', priceFrom: 120 },
      { name: '彩绘玻璃明信片', desc: '本堂特色花窗图案 · 艺术明信片', emoji: '🪟', tag: '纪念', priceFrom: 20 },
      { name: '圣像复制画', desc: '本堂馆藏圣像 · 精品复刻', emoji: '🖼️', tag: '典藏', priceFrom: 150 },
    ],
    etiquette: ['殿内请保持安静, 勿喧哗', '弥撒期间请勿随意走动拍照', '着装得体, 勿过于暴露', '男士进入请脱帽, 女士可戴面纱', '尊重礼仪, 如有圣餐仅信徒领用'],
    dining: ['周边欧式咖啡馆/传统餐馆', '部分修道院有自制产品可购'],
    gear: ['正式外套(礼拜必要)', '舒适鞋(大教堂走廊长)', '雨具(欧洲多雨)'],
    defaultOpen: '08:00', defaultClose: '18:00',
    guideSpecialty: '基督文化讲读 · 建筑与艺术',
    guideNameStem: 'John',
    greeting: 'Peace be with you',
  },
  islam: {
    products: [
      { name: '精装《古兰经》导览本', desc: '阿文 + 中文双语 · 含章节导读', emoji: '📖', tag: '人手一册', priceFrom: 120 },
      { name: '手工礼拜毯', desc: '本地工匠手织 · 波斯花纹', emoji: '🕌', tag: '手工艺', priceFrom: 280 },
      { name: '椰枣礼盒', desc: '麦地那传统甜品 · 真空包装', emoji: '🌴', tag: '文化伴手', priceFrom: 60 },
      { name: '念珠 (泰斯比哈)', desc: '33 / 99 颗珠 · 本地玛瑙或木材', emoji: '📿', tag: '文化伴手', priceFrom: 150 },
    ],
    etiquette: ['非穆斯林请勿进入主殿内部', '女士请覆头, 男士脱帽', '脱鞋入场, 不可穿鞋进殿', '忌讳酒精/猪肉制品入内', '礼拜时段请绕行, 勿拍摄正在礼拜者'],
    dining: ['清真餐全程保证 Halal', '斋月白日禁食禁水, 日落后开斋', '忌任何酒类'],
    gear: ['宽松长裤/长袍', '头巾(女士必需)', '袜子(脱鞋后地面凉)'],
    defaultOpen: '06:00', defaultClose: '20:00',
    guideSpecialty: '伊斯兰文化讲读 · 古建与纹样',
    guideNameStem: 'Ahmad',
    greeting: 'As-salamu alaykum',
  },
  hinduism: {
    products: [
      { name: '《薄伽梵歌》精选讲读本', desc: '梵文 + 英中对照 · 经典章节导读', emoji: '📖', tag: '人手一册', priceFrom: 80 },
      { name: '银饰神像护符', desc: '本地银匠手作湿婆/毗湿奴小像', emoji: '🔱', tag: '文化伴手', priceFrom: 200 },
      { name: '檀香长香', desc: '迈索尔檀香 · 传统配方', emoji: '🔥', tag: '文化伴手', priceFrom: 60 },
      { name: '彩绘沙丽披巾', desc: '本地手织棉布 · 传统纹样', emoji: '🥻', tag: '手工艺', priceFrom: 180 },
    ],
    etiquette: ['脱鞋入殿, 鞋子请存放于寄存处', '不用左手接物 · 左手被视为不洁', '部分内殿仅印度教徒可入, 请勿强闯', '女士请包覆肩膀, 勿穿短裙短裤', '主神像前勿背对'],
    dining: ['寺庙 Prasad 祭品素食可领取', '印度素食极丰富 · 南北风味不同', '忌食牛肉 · 部分地区忌所有肉类'],
    gear: ['袜子(脱鞋后石地烫/凉)', '披巾(遮肩及临时覆头)', '防晒帽(白日炎热)'],
    defaultOpen: '05:30', defaultClose: '20:30',
    guideSpecialty: '印度文化讲读 · 经典与寺庙建筑',
    guideNameStem: 'Arjun',
    greeting: 'Namaste',
  },
  judaism: {
    products: [
      { name: '《妥拉》精装导览本', desc: '希伯来文 + 中文对照, 含历史导读', emoji: '📖', tag: '人手一册', priceFrom: 120 },
      { name: '大卫之星挂饰', desc: '本地银匠手作 · 含博物馆印章', emoji: '✡️', tag: '文化伴手', priceFrom: 180 },
      { name: '烛台复制品', desc: '七枝/九枝烛台 · 传统工艺', emoji: '🕎', tag: '典藏', priceFrom: 350 },
      { name: '圣地明信片集', desc: '本地摄影师作品 · 古城视角', emoji: '📷', tag: '纪念', priceFrom: 40 },
    ],
    etiquette: ['男士进入请戴 Kippah (圆顶小帽, 入口可领)', '安息日 (周五日落-周六日落) 部分场所限制', '勿在圣地附近吸烟/饮食', '哭墙前请尊重祷告者, 勿打扰', '女士进入分区请遵循指示'],
    dining: ['Kosher 餐厅为主 · 肉奶分食', '安息日许多餐馆休业, 提前规划', '忌猪肉 · 贝类海鲜'],
    gear: ['Kippah (男士)', '披巾(女士)', '舒适鞋(古城石板路)'],
    defaultOpen: '08:00', defaultClose: '18:00',
    guideSpecialty: '犹太文化讲读 · 历史与古城',
    guideNameStem: 'David',
    greeting: 'Shalom',
  },
  shinto: {
    products: [
      { name: '御守 (御守护符)', desc: '本神社特制布艺护符 · 不同功能可选', emoji: '⛩️', tag: '典藏', priceFrom: 80 },
      { name: '绘马 (祈愿木牌)', desc: '本神社专属图案木牌, 写愿挂于绘马所', emoji: '🪵', tag: '文化伴手', priceFrom: 50 },
      { name: '御朱印帖', desc: '日本传统朱印收集册 · 本神社首朱印', emoji: '📓', tag: '典藏', priceFrom: 280 },
      { name: '神酒 (御神酒)', desc: '本社祭祀小瓶清酒 · 限量出品', emoji: '🍶', tag: '文化伴手', priceFrom: 120 },
    ],
    etiquette: ['鸟居中央为神道, 请靠左或靠右而行', '手水舍净手漱口后再入', '参拜"二礼二拍手一礼"', '本殿内禁止拍摄', '不可直接触摸神具'],
    dining: ['神社周边多有和风茶屋', '日本料理以精致少油为主', '神酒需先供奉方可品尝'],
    gear: ['舒适走路鞋(神社常含参道)', '整洁服装(避免过于随意)', '雨伞(日本多雨)'],
    defaultOpen: '06:00', defaultClose: '17:00',
    guideSpecialty: '神道文化讲读 · 祭祀与建筑',
    guideNameStem: '守',
    greeting: 'ようこそ',
  },
  'tibetan-buddhism': {
    products: [
      { name: '藏经讲读双语本', desc: '藏汉对照 + 小鸿团队导读', emoji: '📖', tag: '人手一册', priceFrom: 128 },
      { name: '哈达 (献敬白巾)', desc: '本地藏匠手织 · 蓝白双色可选', emoji: '🧣', tag: '文化伴手', priceFrom: 60 },
      { name: '转经筒 (小型)', desc: '黄铜手工刻经 · 可日常持诵', emoji: '🛕', tag: '手工艺', priceFrom: 220 },
      { name: '唐卡明信片集', desc: '本寺藏传唐卡精品复刻', emoji: '🖼️', tag: '典藏', priceFrom: 80 },
      { name: '酥油茶茶饼礼盒', desc: '高原本地茶叶+酥油 · 正宗藏式', emoji: '🫖', tag: '文化伴手', priceFrom: 150 },
    ],
    etiquette: ['顺时针绕塔/绕寺 · 勿逆行', '不可用手指直接指向佛像', '献哈达时双手微举, 不可单手', '殿内不可戴帽子', '勿触摸僧人头顶'],
    dining: ['酥油茶/糌粑为主 · 初尝需适应', '藏餐肉食比重较高 · 素食者提前告知', '高原饮食忌烈酒'],
    gear: ['羽绒外套(高原昼夜温差大)', '抗高反药物(乙酰唑胺)', '防晒霜+墨镜(紫外线强)'],
    defaultOpen: '08:00', defaultClose: '17:00',
    guideSpecialty: '藏传文化讲读 · 密法与寺院艺术',
    guideNameStem: '丹',
    greeting: 'Tashi Delek',
  },
  confucianism: {
    products: [
      { name: '《论语》精装讲读本', desc: '白话与原文对照 · 含本地文脉导读', emoji: '📖', tag: '人手一册', priceFrom: 68 },
      { name: '文房四宝套装', desc: '本地制作宣纸/松烟墨/狼毫/歙砚', emoji: '🖋️', tag: '文化伴手', priceFrom: 280 },
      { name: '孔子铜像书房摆件', desc: '本地匠作小型铜像 · 端砚造型底座', emoji: '🎎', tag: '典藏', priceFrom: 380 },
      { name: '书院茶礼盒', desc: '本地茶山头春茶 · 配书院定制茶具', emoji: '🍵', tag: '文化伴手', priceFrom: 180 },
    ],
    etiquette: ['入殿行揖拜礼, 男左女右', '着装端庄, 避免运动装短裤', '孔庙大成殿内保持肃静', '勿触碰古碑刻/匾额', '拍照请关闭闪光灯'],
    dining: ['鲁菜/当地传统菜系为主', '书院讲学期间多有素食茶点', '无特殊饮食禁忌'],
    gear: ['正式鞋(不宜拖鞋)', '随身笔记本(抄录碑文/经典)', '雨伞'],
    defaultOpen: '08:00', defaultClose: '17:00',
    guideSpecialty: '儒家文化讲读 · 书院与碑刻',
    guideNameStem: '文',
    greeting: '君子好学',
  },
  sikhism: {
    products: [
      { name: '《古鲁格兰特经》精选本', desc: '旁遮普语 + 英文/中文对照选段', emoji: '📖', tag: '人手一册', priceFrom: 120 },
      { name: '卡拉 (钢镯)', desc: '锡克传统五钢物之一 · 本地银匠制', emoji: '⭕', tag: '文化伴手', priceFrom: 150 },
      { name: '手工头巾 (Dastar)', desc: '纯棉染色 · 本地匠作', emoji: '🧕', tag: '手工艺', priceFrom: 180 },
      { name: '金庙模型', desc: '精雕小型金庙模型 · 含底座', emoji: '🏛️', tag: '典藏', priceFrom: 280 },
    ],
    etiquette: ['进入 Gurdwara 必须覆头(男女均需)', '脱鞋入殿, 于门口寄存', '勿吸烟/饮酒/携肉进入', 'Langar 免费素餐请盘腿共食', '勿在圣典前背对'],
    dining: ['Langar 食堂素食免费供应', '均为素食 · 无洋葱大蒜', '忌一切肉类+酒类'],
    gear: ['头巾/围巾(覆头必需)', '袜子(大理石地面凉)', '宽松服装'],
    defaultOpen: '04:00', defaultClose: '22:00',
    guideSpecialty: '锡克文化讲读 · 古鲁与历史',
    guideNameStem: 'Singh',
    greeting: 'Sat Sri Akaal',
  },
  indigenous: {
    products: [
      { name: '在地文化导览手册', desc: '本土语言与文化根源双语介绍', emoji: '📖', tag: '人手一册', priceFrom: 60 },
      { name: '手工图腾饰品', desc: '部族匠人手作 · 含来源认证', emoji: '🪶', tag: '手工艺', priceFrom: 180 },
      { name: '传统药草香包', desc: '本地药草配方 · 手工缝制', emoji: '🌿', tag: '文化伴手', priceFrom: 80 },
      { name: '图腾木雕摆件', desc: '部族工艺 · 小型桌面摆件', emoji: '🗿', tag: '典藏', priceFrom: 220 },
    ],
    etiquette: ['未经允许不得拍摄仪式或长老', '尊重场所限制区, 勿擅自跨越', '遵从本地向导指引', '不可带走任何自然物件/石块', '参与仪式请保持肃静'],
    dining: ['本地食材为主 · 不忘致谢土地', '部分部族有献食仪式', '尊重本地饮食习惯'],
    gear: ['徒步鞋(多在户外)', '轻便背包+水壶', '防虫液 + 防晒'],
    defaultOpen: '08:00', defaultClose: '17:00',
    guideSpecialty: '原住民文化讲读 · 土地与传承',
    guideNameStem: '长老',
    greeting: '致敬大地',
  },
  bahai: {
    products: [
      { name: '《基塔布·阿格达斯》导览本', desc: '巴哈伊根本文献精选 · 含导读', emoji: '📖', tag: '人手一册', priceFrom: 100 },
      { name: '九角星挂饰', desc: '本地匠作水晶/金属九角星', emoji: '⭐', tag: '文化伴手', priceFrom: 180 },
      { name: '灵曦堂明信片集', desc: '九国灵曦堂专业摄影作品集', emoji: '🕌', tag: '典藏', priceFrom: 80 },
      { name: '花园导览手册', desc: '海法/阿卡世界遗产花园讲解', emoji: '🌷', tag: '人手一册', priceFrom: 60 },
    ],
    etiquette: ['殿内保持安静, 无集体诵经仪式', '着装整洁, 勿短裤短裙入殿', '可独立默祷, 无强制仪轨', '花园内勿大声喧哗', '尊重其他参访者默祷空间'],
    dining: ['周边餐厅多样 · 无特殊禁忌', '巴哈伊信徒黎明至黄昏斋戒(3月)', '可饮茶不饮酒(部分信徒自愿戒酒)'],
    gear: ['整洁鞋(白色大理石地面)', '防晒帽(海法阳光强)', '雨伞'],
    defaultOpen: '09:00', defaultClose: '16:00',
    guideSpecialty: '巴哈伊文化讲读 · 花园与精神',
    guideNameStem: '恩',
    greeting: 'Allah-u-Abha',
  },
};

type CountryHub = { hubName: string; mode1: string; cost1Min: number; dur1Min: number; dist1: number; note1?: string };
const COUNTRY_HUB: Record<string, CountryHub> = {
  中国: { hubName: '最近高铁站', mode1: '中国高铁 + 接驳车', cost1Min: 80, dur1Min: 90, dist1: 200, note1: '大城市可直达, 县级需高铁+专车' },
  日本: { hubName: '最近 JR 站', mode1: 'JR 新干线 + 巴士', cost1Min: 1500, dur1Min: 120, dist1: 200, note1: 'ICOCA/Suica 交通卡便利' },
  印度: { hubName: '最近国际机场', mode1: '城际铁路 + TAXI', cost1Min: 800, dur1Min: 180, dist1: 250 },
  尼泊尔: { hubName: '加德满都机场', mode1: '国内航班 + 越野车', cost1Min: 3000, dur1Min: 240, dist1: 180 },
  泰国: { hubName: '最近国际机场', mode1: '航班 + TAXI/突突车', cost1Min: 500, dur1Min: 90, dist1: 100 },
  缅甸: { hubName: '最近航空站', mode1: '国内航班 + 巴士', cost1Min: 2000, dur1Min: 180, dist1: 150 },
  柬埔寨: { hubName: '暹粒/金边机场', mode1: '航班 + TAXI', cost1Min: 800, dur1Min: 90, dist1: 80 },
  斯里兰卡: { hubName: '科伦坡机场', mode1: '城际铁路 + TAXI', cost1Min: 1200, dur1Min: 180, dist1: 200 },
  不丹: { hubName: '帕罗国际机场', mode1: '专属司导(国家规定)', cost1Min: 8000, dur1Min: 120, dist1: 80, note1: '不丹旅游必须跟团/司导' },
  越南: { hubName: '最近国际机场', mode1: '航班 + TAXI', cost1Min: 600, dur1Min: 60, dist1: 50 },
  韩国: { hubName: 'KTX 高铁站', mode1: 'KTX + 地铁/巴士', cost1Min: 40000, dur1Min: 120, dist1: 200, note1: '韩元计价, 交通卡通用' },
  蒙古: { hubName: '乌兰巴托机场', mode1: '航班 + 越野车', cost1Min: 5000, dur1Min: 240, dist1: 300 },
  以色列: { hubName: '特拉维夫机场', mode1: '铁路 + 城际巴士', cost1Min: 30, dur1Min: 90, dist1: 80, note1: '新谢克尔计价' },
  巴勒斯坦: { hubName: '特拉维夫/安曼机场', mode1: '城际巴士 + 换乘', cost1Min: 50, dur1Min: 180, dist1: 100 },
  沙特阿拉伯: { hubName: '麦加/麦地那机场', mode1: '朝觐专线巴士', cost1Min: 150, dur1Min: 60, dist1: 50, note1: '朝觐季需签证与许可' },
  伊朗: { hubName: '最近国际机场', mode1: '国内航班 + TAXI', cost1Min: 400000, dur1Min: 120, dist1: 150, note1: '里亚尔计价' },
  土耳其: { hubName: '伊斯坦布尔机场', mode1: '国内航班 + 城际巴士', cost1Min: 50, dur1Min: 90, dist1: 100 },
  埃及: { hubName: '开罗/卢克索机场', mode1: '航班 + 尼罗河游轮/巴士', cost1Min: 500, dur1Min: 180, dist1: 200 },
  意大利: { hubName: '最近 Trenitalia 站', mode1: 'Frecciarossa 高铁 + 巴士', cost1Min: 30, dur1Min: 120, dist1: 250 },
  梵蒂冈: { hubName: '罗马 Termini 车站', mode1: '罗马地铁 A 线', cost1Min: 2, dur1Min: 20, dist1: 4 },
  法国: { hubName: '最近 SNCF TGV 站', mode1: 'TGV + 城际火车', cost1Min: 30, dur1Min: 120, dist1: 300 },
  西班牙: { hubName: '最近 Renfe AVE 站', mode1: 'AVE 高铁 + 公交', cost1Min: 40, dur1Min: 150, dist1: 350 },
  德国: { hubName: '最近 DB 火车站', mode1: 'ICE + 城际公交', cost1Min: 50, dur1Min: 120, dist1: 300 },
  英国: { hubName: '最近火车总站', mode1: 'National Rail + 城际巴士', cost1Min: 50, dur1Min: 150, dist1: 250 },
  希腊: { hubName: '雅典国际机场', mode1: '国内航班 + 轮渡/巴士', cost1Min: 60, dur1Min: 180, dist1: 200 },
  俄罗斯: { hubName: '最近铁路枢纽', mode1: '联邦铁路 + 公交', cost1Min: 2500, dur1Min: 240, dist1: 500, note1: '卢布计价' },
  美国: { hubName: '最近国际机场', mode1: '国内航班 + 租车', cost1Min: 150, dur1Min: 180, dist1: 300 },
  加拿大: { hubName: '最近国际机场', mode1: '国内航班 + 租车', cost1Min: 200, dur1Min: 240, dist1: 400 },
  墨西哥: { hubName: '最近国际机场', mode1: '国内航班 + 巴士', cost1Min: 800, dur1Min: 180, dist1: 200 },
  巴西: { hubName: '最近国际机场', mode1: '国内航班 + 巴士', cost1Min: 400, dur1Min: 240, dist1: 300 },
  秘鲁: { hubName: '利马/库斯科机场', mode1: '国内航班 + 旅游巴士', cost1Min: 200, dur1Min: 180, dist1: 200 },
  澳大利亚: { hubName: '最近国际机场', mode1: '国内航班 + 租车', cost1Min: 200, dur1Min: 240, dist1: 300 },
  新西兰: { hubName: '奥克兰/基督城机场', mode1: '国内航班 + 租车', cost1Min: 150, dur1Min: 180, dist1: 250 },
  南非: { hubName: '约翰内斯堡机场', mode1: '国内航班 + 租车', cost1Min: 1200, dur1Min: 180, dist1: 200 },
};

function genTransportLegs(country: string, siteName: string): TransportLeg[] {
  const hub = COUNTRY_HUB[country];
  if (!hub) {
    return [
      { from: '最近国际机场/火车站', to: siteName + ' 附近集散地', mode: '城际公共交通 + 租车', distanceKm: 150, durationMin: 120, note: '根据实际城市选择最便捷公共交通或租车' },
      { from: siteName + ' 附近集散地', to: siteName + ' 正门', mode: '步行 / 摆渡车', distanceKm: 1, durationMin: 10 },
    ];
  }
  return [
    {
      from: hub.hubName,
      to: siteName + ' 附近集散地',
      mode: hub.mode1,
      distanceKm: hub.dist1,
      durationMin: hub.dur1Min,
      note: hub.note1,
      costFrom: hub.cost1Min,
    },
    { from: siteName + ' 附近集散地', to: siteName + ' 正门', mode: '步行 / 摆渡车', distanceKm: 1, durationMin: 10, note: '长者/行李可叫电瓶车或 TAXI' },
  ];
}

function genOpeningHours(tpl: ReligionTemplate, siteName: string): OpeningHoursBySeason {
  return {
    spring: { open: tpl.defaultOpen, close: tpl.defaultClose, note: '3-5 月气候宜人, 周末游客较多' },
    summer: { open: tpl.defaultOpen, close: addMin(tpl.defaultClose, 30), note: '6-8 月避开正午烈日, 注意防暑' },
    autumn: { open: tpl.defaultOpen, close: tpl.defaultClose, note: '9-11 月秋高气爽, 最佳参访季' },
    winter: { open: addMin(tpl.defaultOpen, 30), close: addMin(tpl.defaultClose, -30), note: '12-2 月游客最少, 注意保暖' },
  };
}

function addMin(hhmm: string, delta: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + delta;
  const hh = Math.max(0, Math.min(23, Math.floor(total / 60)));
  const mm = ((total % 60) + 60) % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function genVisitorTips(tpl: ReligionTemplate, country: string): VisitorTipsGrouped {
  const hub = COUNTRY_HUB[country];
  const transport = [
    hub ? `${hub.hubName} 作为最近交通枢纽, 建议提前预订 ${hub.mode1}` : '优先使用当地公共交通或租车',
    '景区周边出租车/打车软件可作最后一公里补充',
    '注意末班车时间, 傍晚参访后预留返程',
  ];
  return { transport, dining: tpl.dining, gear: tpl.gear, etiquette: tpl.etiquette };
}

function genLocalGuides(tpl: ReligionTemplate, siteName: string, country: string): LocalGuide[] {
  const isCn = country === '中国';
  const langs = isCn ? ['中文', 'English'] : ['当地语言', 'English', '中文(可预约)'];
  return [
    {
      name: `${tpl.guideNameStem}${isCn ? '师' : ''}·资深导览`,
      specialty: tpl.guideSpecialty + ` · ${siteName} 专场`,
      languages: langs,
      rating: 4.8,
      bio: `本圣地常驻讲解员, 熟悉本地历史脉络与文化内涵, 可按访客节奏定制深浅度。开场致意: "${tpl.greeting}"。`,
    },
  ];
}

function genPhotoStory(site: { name: string; description: string; imageUrl?: string | null; gallery?: any }): PhotoFrame[] {
  const frames: PhotoFrame[] = [];
  const gal = Array.isArray(site.gallery) ? (site.gallery as any[]) : [];

  if (site.imageUrl) {
    frames.push({
      imageUrl: site.imageUrl,
      caption: `${site.name} · 主视觉`,
      shotLocation: `${site.name} 正门`,
      significance: `整体第一印象, 建立 ${site.name} 在访客心中的空间尺度与历史分量。`,
      order: 1,
    });
  }

  gal.slice(0, 3).forEach((g: any, idx: number) => {
    if (!g?.url) return;
    frames.push({
      imageUrl: g.url,
      caption: g.caption || `${site.name} · 细节 ${idx + 1}`,
      shotLocation: `${site.name} 内`,
      significance: g.caption ? `承接 "${g.caption}" 的文化细节, 对应本圣地核心叙事。` : `${site.name} 内部细节, 反映本地工艺与信仰实践。`,
      order: frames.length + 1,
    });
  });

  if (frames.length < 3) {
    const descSnippet = (site.description || '').slice(0, 40);
    frames.push({
      imageUrl: site.imageUrl || undefined,
      caption: `${site.name} · 文化切片`,
      shotLocation: `${site.name}`,
      significance: `结合描述 "${descSnippet}..." 的文化内核, 定格游学者在该圣地的文化时刻。`,
      order: frames.length + 1,
    });
  }

  return frames;
}

async function main() {
  console.log('\n=== 目的地++ v2 · 全量深度化 ===\n');
  const sites = await prisma.holySite.findMany({ include: { religion: true } });
  console.log(`站点总数: ${sites.length}`);

  let pilotSkipped = 0;
  let enriched = 0;
  let alreadyFull = 0;
  let noTemplate = 0;
  let errors = 0;

  for (const s of sites) {
    const psRaw = s.photoStory as unknown as PhotoFrame[] | null;
    if (Array.isArray(psRaw) && psRaw.length > 0) {
      pilotSkipped++;
      continue;
    }

    const tpl = REL[s.religion.slug];
    if (!tpl) {
      noTemplate++;
      console.warn(`  ⚠ 无模板: ${s.name} (religion=${s.religion.slug})`);
      continue;
    }

    const patch: Prisma.HolySiteUpdateInput = {};
    if (s.transportLegs == null) patch.transportLegs = genTransportLegs(s.country, s.name) as any;
    if (s.culturalProducts == null) patch.culturalProducts = tpl.products as any;
    if (s.openingHoursBySeason == null) patch.openingHoursBySeason = genOpeningHours(tpl, s.name) as any;
    if (s.visitorTipsGrouped == null) patch.visitorTipsGrouped = genVisitorTips(tpl, s.country) as any;
    if (s.localGuides == null) patch.localGuides = genLocalGuides(tpl, s.name, s.country) as any;
    patch.photoStory = genPhotoStory(s) as any;

    if (Object.keys(patch).length === 0) {
      alreadyFull++;
      continue;
    }

    try {
      await prisma.holySite.update({ where: { id: s.id }, data: patch });
      enriched++;
    } catch (e: any) {
      errors++;
      console.error(`  ✗ ${s.name}: ${e?.message ?? e}`);
    }
  }

  console.log(`\n=== 结果 ===`);
  console.log(`  pilot 跳过 (已手写): ${pilotSkipped}`);
  console.log(`  本轮深化:            ${enriched}`);
  console.log(`  已深化跳过:          ${alreadyFull}`);
  console.log(`  无模板跳过:          ${noTemplate}`);
  console.log(`  错误:                ${errors}`);
  console.log(`  合计处理:            ${sites.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
