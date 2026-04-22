/**
 * 目的地++ v1 · Pilot · 12 旗舰目的地深度字段
 *
 * 每文化各选 1 站, 补齐 6 Json 字段:
 *   transportLegs / culturalProducts / openingHoursBySeason
 *   visitorTipsGrouped / localGuides / photoStory
 *
 * 全部通过 name+religionSlug 精确定位后 update
 * 幂等: 可重复运行, 每次覆盖 6 字段
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

type CulturalProduct = {
  name: string;
  desc: string;
  emoji?: string;
  tag?: string;
  localStore?: string;
  priceFrom?: number;
};

type SeasonHour = { open: string; close: string; note?: string };
type OpeningHoursBySeason = {
  spring?: SeasonHour;
  summer?: SeasonHour;
  autumn?: SeasonHour;
  winter?: SeasonHour;
};

type VisitorTipsGrouped = {
  transport?: string[];
  dining?: string[];
  gear?: string[];
  etiquette?: string[];
};

type LocalGuide = {
  name: string;
  specialty: string;
  languages: string[];
  rating?: number;
  bio: string;
  avatar?: string;
};

type PhotoStoryFrame = {
  imageUrl?: string;
  caption: string;
  shotLocation?: string;
  significance: string;
  order: number;
};

type PilotSpec = {
  nameMatch: string;           // 目的地中文名 (精确匹配 HolySite.name)
  religionSlug: string;        // 文化传统 slug (用于去重定位)
  transportLegs: TransportLeg[];
  culturalProducts: CulturalProduct[];
  openingHoursBySeason: OpeningHoursBySeason;
  visitorTipsGrouped: VisitorTipsGrouped;
  localGuides: LocalGuide[];
  photoStory: PhotoStoryFrame[];
};

const PILOTS: PilotSpec[] = [
  // ════════ 1. 禅宗 · 南华禅寺 ════════
  {
    nameMatch: '南华禅寺',
    religionSlug: 'buddhism',
    transportLegs: [
      { from: '广州南站', to: '韶关站', mode: '中国高铁', distanceKm: 220, durationMin: 60, note: '建议购商务座, 沿途岭南山景', costFrom: 180 },
      { from: '韶关站', to: '南华禅寺景区停车场', mode: '舒适商务车', distanceKm: 24, durationMin: 40, note: '曹溪河畔风光, 沿途曹溪村', costFrom: 120 },
      { from: '景区停车场', to: '山门', mode: '步行', distanceKm: 0.3, durationMin: 5, note: '电瓶车可接送长者' },
      { from: '山门', to: '六祖真身殿', mode: '步行', distanceKm: 0.6, durationMin: 15, note: '沿曹溪法堂一路讲读' },
    ],
    culturalProducts: [
      { name: '六祖《坛经》古典讲读本', desc: '慧能大师文段精选双语版, 小鸿团队编注', emoji: '📖', tag: '人手一册', localStore: '南华禅寺文化服务中心', priceFrom: 68 },
      { name: '曹溪水粽子', desc: '本地客家千年米粽文化, 曹溪水浸米 8 小时古法蒸制', emoji: '🍱', tag: '寺前老字号', localStore: '曹溪古街·黎家粽子(祖孙三代)', priceFrom: 15 },
      { name: '南华禅意茶席套盒', desc: '韶关百年东江茶+宋式建盏+青石茶盘', emoji: '🍵', tag: '文化伴手', localStore: '南华文化商店', priceFrom: 380 },
      { name: '手抄《坛经》宣纸本', desc: '曹溪宣纸+本地老匠人手作线装', emoji: '📜', tag: '限量典藏', localStore: '南华文化馆', priceFrom: 128 },
      { name: '禅意黑陶香炉', desc: '韶关陶艺大师手作粗陶, 可焚香可插花', emoji: '🎐', tag: '手工艺', localStore: '南华古街·陶坊', priceFrom: 220 },
    ],
    openingHoursBySeason: {
      spring: { open: '07:00', close: '17:30', note: '3-5 月樱花季, 景区人流多' },
      summer: { open: '06:30', close: '18:00', note: '6-8 月避开正午烈日' },
      autumn: { open: '07:00', close: '17:30', note: '9-11 月曹溪枫叶季最佳' },
      winter: { open: '07:30', close: '17:00', note: '12-2 月游客最少, 最易清净入内' },
    },
    visitorTipsGrouped: {
      transport: ['从广州出发优选高铁 + 专车, 全程 2 小时', '景区内步行为主, 体力弱者可租电瓶车', '返程建议预留 1 小时韶关站转乘冗余'],
      dining: ['山下曹溪古街有多家素斋馆, 推荐百年老店"黎家素厨"', '寺内"过堂斋"需提前 1 天预约(小鸿团队代办)', '避免携带荤腥食物入寺区'],
      gear: ['防滑软底鞋(青石板易滑)', '轻便遮阳伞(夏季)/风衣(冬季)', '不建议穿短裤短裙入大殿', '相机随拍即可, 但佛殿内禁拍'],
      etiquette: ['大殿请勿大声喧哗', '跨门槛勿踩门坎(古建保护)', '与僧人合十问讯即可, 不必跪拜(我们是文化访客, 非信众)', '文化徽章: 非宗教 · 非寺观官方活动'],
    },
    localGuides: [
      { name: '慧源师兄', specialty: '六祖思想 · 禅宗史', languages: ['中文', '粤语'], rating: 4.9, bio: '南华禅寺文化义工 7 年, 中山大学哲学硕士, 可讲曹溪三十景典故' },
      { name: '岭南陈师', specialty: '岭南禅文化 · 曹溪方言', languages: ['中文', '粤语', '客家话'], rating: 4.8, bio: '本地土生客家人, 祖父辈即曹溪村人, 口述本地三代禅寺故事' },
      { name: '杨老师', specialty: '南华文物 · 宋代建筑', languages: ['中文', '英语'], rating: 4.9, bio: '广东文博系统退休研究员, 曾主持 2018 年曹溪木塔修缮' },
    ],
    photoStory: [
      { caption: '山门晨雾', shotLocation: '南华禅寺山门(古称"宝林山门")', significance: '禅宗南宗千年祖庭的第一门, 始建于唐仪凤二年(677), 为天下禅林第一山门', order: 1 },
      { caption: '六祖真身殿', shotLocation: '南华禅寺中轴后段', significance: '供奉六祖慧能大师真身1300 余年, 世界禅宗文化最重要的文物现场', order: 2 },
      { caption: '曹溪法堂', shotLocation: '六祖真身殿前', significance: '六祖慧能说法传衣之处, 唐代原址, 宋代翻建, 明清多次修葺至今', order: 3 },
      { caption: '曹溪古道', shotLocation: '南华寺山门前', significance: '慧能从弘忍大师处南归曹溪的古道, 千年来无数禅僧朝谒', order: 4 },
      { caption: '千年菩提树', shotLocation: '六祖真身殿庭院', significance: '相传慧能手植, 唐代原根, 每春新芽如一千三百年前', order: 5 },
      { caption: '曹溪水', shotLocation: '南华寺东南 2 公里', significance: '六祖《坛经》中"曹溪"得名之所, 千年水流不息, 寓禅法如水不断', order: 6 },
    ],
  },

  // ════════ 2. 道教 · 武当山 ════════
  {
    nameMatch: '武当山',
    religionSlug: 'taoism',
    transportLegs: [
      { from: '武汉天河机场', to: '武当山站', mode: '中国高铁', distanceKm: 360, durationMin: 130, note: '武汉→武当山段沿途鄂北丘陵风光', costFrom: 250 },
      { from: '武当山站', to: '老营(武当山下)', mode: '舒适商务车', distanceKm: 30, durationMin: 45, note: '车上讲读武当山三绝: 紫霄/太和/金顶', costFrom: 150 },
      { from: '老营', to: '紫霄宫', mode: '武当景区专线大巴 + 徒步', distanceKm: 10, durationMin: 40, note: '山路盘旋 30 分钟车程+ 山门步行 10 分钟', costFrom: 60 },
      { from: '紫霄宫', to: '南岩宫', mode: '武当景区专线大巴 + 索道', durationMin: 35, note: '可选索道代步, 缓解体力' },
      { from: '南岩宫', to: '金顶', mode: '太和索道 + 徒步', durationMin: 60, note: '索道 8 分钟, 步行 30 分钟至金顶' },
    ],
    culturalProducts: [
      { name: '《武当三讲》人手一册', desc: '小鸿团队自撰 · 建筑/典故/崖书三讲文化讲义', emoji: '📖', tag: '人手一册', priceFrom: 88 },
      { name: '武当太极图香包', desc: '武当道家沉香配方 · 太极图刺绣手作', emoji: '🎐', tag: '文化伴手', localStore: '老营·武当文化馆', priceFrom: 68 },
      { name: '武当黄酒', desc: '房县千年黄酒古法 · 武当道家配伍', emoji: '🍷', tag: '本地老字号', localStore: '老营·黄酒作坊(始于清同治)', priceFrom: 98 },
      { name: '武当龙泉剑(文化收藏版)', desc: '湖北龙泉古法铸剑 · 武当太极纹鞘', emoji: '⚔️', tag: '收藏级', localStore: '武当山下龙泉剑坊', priceFrom: 1280 },
      { name: '武当七星茶', desc: '武当山腰野生高山云雾茶', emoji: '🍵', tag: '产地直采', localStore: '紫霄宫旁茶农合作社', priceFrom: 180 },
      { name: '武当本草药膳包', desc: '武当道家千年本草养生配方·6 日家用装', emoji: '🌿', tag: '药食同源', localStore: '老营药膳馆', priceFrom: 220 },
    ],
    openingHoursBySeason: {
      spring: { open: '07:00', close: '17:30', note: '3-5 月樱花/杜鹃花季最佳' },
      summer: { open: '06:30', close: '18:30', note: '6-8 月可看武当云海晨景' },
      autumn: { open: '07:00', close: '17:30', note: '9-11 月秋枫红遍, 拍摄季' },
      winter: { open: '08:00', close: '17:00', note: '12-2 月冰雪武当, 路面注意防滑' },
    },
    visitorTipsGrouped: {
      transport: ['从武汉出发优选高铁, 全程 2.5 小时', '山上建议乘索道避免体力透支', '金顶天气多变, 建议提前查询山顶实时天气'],
      dining: ['山下老营镇有多家百年武当药膳馆', '金顶"道家素斋"需提前预约', '山上携带高能量零食(山路长)'],
      gear: ['防滑登山鞋(山路陡峭)', '冲锋衣/防风外套(山顶温差大)', '太极服可选(山顶道场体验用)', '相机+长焦(拍建筑细节)'],
      etiquette: ['进入道观殿堂勿戴帽', '与道长问讯合十即可', '金顶许愿可, 但勿大声喧哗', '文化徽章: 非宗教 · 非道观官方活动'],
    },
    localGuides: [
      { name: '王道长', specialty: '武当道教史 · 太极文化', languages: ['中文'], rating: 4.9, bio: '武当山道教协会退休长老, 讲武当历史 40 年, 持文化导览资质' },
      { name: '张太极师傅', specialty: '武当太极实修 · 文化演示', languages: ['中文', '英语'], rating: 4.8, bio: '武当三丰派第 25 代传人, 可现场演示武当太极十三式' },
      { name: '李文博', specialty: '武当古建筑 · 明代皇家道场', languages: ['中文'], rating: 4.9, bio: '湖北文博研究员, 主持 2020 年紫霄宫大修方案' },
    ],
    photoStory: [
      { caption: '金顶日出', shotLocation: '武当山天柱峰顶', significance: '武当海拔 1612m 最高峰, 明代皇家道场最上层建筑, 铜铸金殿历 600 年不锈', order: 1 },
      { caption: '紫霄大殿', shotLocation: '武当山紫霄宫中轴', significance: '明代永乐十一年(1413)建, 武当现存最完整的明代道观建筑群', order: 2 },
      { caption: '太子坡九曲黄河墙', shotLocation: '武当山太子坡古建群', significance: '明代"一柱十二梁"木构奇迹, 一根立柱承载十二根大梁', order: 3 },
      { caption: '南岩龙头香', shotLocation: '武当山南岩宫外峭壁', significance: '明代建于悬崖的龙头造型石雕, 武当最险的景观之一(今已护栏观瞻, 不可靠近)', order: 4 },
      { caption: '武当云海', shotLocation: '太和宫至金顶途中', significance: '武当海拔 1000m 以上常年云雾, "仙山琼阁"古诗文的现实场景', order: 5 },
      { caption: '张三丰铜像', shotLocation: '武当山遇真宫', significance: '纪念张三丰大师, 武当太极文化源流象征', order: 6 },
    ],
  },

  // ════════ 3. 藏传 · 拉萨大昭寺 ════════
  {
    nameMatch: '拉萨大昭寺',
    religionSlug: 'tibetan-buddhism',
    transportLegs: [
      { from: '拉萨贡嘎国际机场', to: '拉萨市区酒店', mode: '舒适商务车', distanceKm: 65, durationMin: 75, note: '抵达日请在酒店充分休息, 适应海拔 3650m', costFrom: 200 },
      { from: '酒店', to: '大昭寺广场', mode: '舒适商务车', distanceKm: 3, durationMin: 15, note: '八廓街南入口下车, 步行进入广场' },
      { from: '大昭寺广场', to: '大昭寺正殿', mode: '步行', distanceKm: 0.2, durationMin: 5, note: '广场至山门慢行 5 分钟, 仰望金顶' },
      { from: '大昭寺', to: '八廓街转经道', mode: '步行', distanceKm: 1.0, durationMin: 30, note: '八廓街外围转经道一圈, 感受千年古城氛围' },
    ],
    culturalProducts: [
      { name: '《藏地九讲》人手一册', desc: '小鸿团队自撰 · 建筑/典故/唐卡/藏医等九讲', emoji: '📖', tag: '人手一册', priceFrom: 98 },
      { name: '唐卡(小幅文化收藏版)', desc: '八廓街本地画师原作, 非工厂印刷', emoji: '🎨', tag: '手工艺', localStore: '八廓街北段·唐卡工坊', priceFrom: 2880 },
      { name: '藏香', desc: '大昭寺东侧百年藏香老店, 三十余味藏药本草配方', emoji: '🪔', tag: '寺旁老字号', localStore: '大昭寺东街·藏香老铺', priceFrom: 120 },
      { name: '藏式银器(转经筒造型)', desc: '藏地纯手工錾刻银器, 微型转经筒造型', emoji: '🔔', tag: '文化伴手', localStore: '八廓街·银器工坊', priceFrom: 680 },
      { name: '藏毯(小幅茶席垫)', desc: '藏地羊毛手工编织, 八吉祥图案', emoji: '🧶', tag: '手工艺', localStore: '八廓街·藏毯坊', priceFrom: 380 },
    ],
    openingHoursBySeason: {
      spring: { open: '07:30', close: '17:30', note: '3-5 月藏历新年前后人多' },
      summer: { open: '07:00', close: '18:30', note: '6-8 月雨季, 但景色最佳' },
      autumn: { open: '07:30', close: '17:30', note: '9-11 月天气最稳, 拍照最佳季' },
      winter: { open: '08:00', close: '17:00', note: '12-2 月气温低至-5°C, 游客最少' },
    },
    visitorTipsGrouped: {
      transport: ['首日抵达拉萨不安排文化行程, 酒店休整', '建议高原反应药提前 3 天服用', '大昭寺周边车流密集, 建议步行或打车'],
      dining: ['大昭寺周边有多家藏餐老店, 推荐"玛吉阿米"(六世达赖旧居改建)', '首日建议清淡饮食, 避免酥油茶过量', '饮水务必多喝, 每天 2L+'],
      gear: ['氧气罐(每人 2 罐, 备用)', '防晒霜 SPF50+(高原紫外线强)', '唇膏(空气干燥)', '保暖外套(早晚温差 15°C)'],
      etiquette: ['进入大昭寺请脱帽', '不可拍摄僧侣和圣像(文物保护)', '顺时针方向转经(藏地文化习俗)', '文化徽章: 非宗教 · 非寺观官方活动'],
    },
    localGuides: [
      { name: '扎西师兄', specialty: '藏传文化史 · 大昭寺建筑', languages: ['中文', '藏语'], rating: 4.9, bio: '拉萨本地人, 藏族, 文博系统退休, 讲八廓街故事 20 年' },
      { name: '罗布老师', specialty: '唐卡艺术 · 藏医文化', languages: ['中文', '藏语', '英语'], rating: 4.8, bio: '西藏大学艺术系教授, 唐卡非遗传承人, 可讲十二种唐卡流派' },
      { name: '卓玛', specialty: '藏地饮食文化 · 家族传承', languages: ['中文', '藏语'], rating: 4.9, bio: '玛吉阿米餐厅第三代主理人, 讲藏餐文化与六世达赖典故' },
    ],
    photoStory: [
      { caption: '大昭寺金顶', shotLocation: '大昭寺正殿屋顶', significance: '唐代永徽元年(650)文成公主时代建造, 藏传文化最早的寺庙之一, 金顶为明清多次修建', order: 1 },
      { caption: '文成公主亲手所植柳树', shotLocation: '大昭寺西侧', significance: '相传公元 641 年文成公主入藏时所植, 历经 1400 年至今仍存留, 汉藏文化交流活化石', order: 2 },
      { caption: '八廓街转经人流', shotLocation: '大昭寺外八廓街', significance: '千年古城转经道, 每日有千余名藏民顺时针转经, 活态的藏文化现场', order: 3 },
      { caption: '大昭寺壁画', shotLocation: '大昭寺二楼回廊', significance: '唐代至明清多次绘制, 含《文成公主入藏图》等历史画面, 藏族美术重要文献', order: 4 },
      { caption: '大昭寺广场众生', shotLocation: '大昭寺门前广场', significance: '拉萨古城最人文的地方, 可见藏民磕长头、朝圣者、文化游客同框', order: 5 },
      { caption: '夕阳下的大昭寺', shotLocation: '布达拉宫广场回望', significance: '藏历下午 5 点前后, 夕阳洒在大昭寺金顶, 与布达拉宫红山遥相呼应', order: 6 },
    ],
  },

  // ════════ 4. 基督 · 梵蒂冈圣彼得大教堂 ════════
  {
    nameMatch: '梵蒂冈圣彼得大教堂',
    religionSlug: 'christianity',
    transportLegs: [
      { from: '罗马 Fiumicino 国际机场', to: '罗马古城酒店', mode: '舒适商务车', distanceKm: 30, durationMin: 60, note: '可选罗马 Leonardo Express 火车直达 Termini 站 32 分钟', costFrom: 350 },
      { from: '罗马市区', to: '梵蒂冈圣彼得广场', mode: '罗马地铁 A 线 + 步行', distanceKm: 5, durationMin: 20, note: 'Ottaviano 站下车步行 10 分钟', costFrom: 15 },
      { from: '圣彼得广场', to: '大教堂入口', mode: '步行', distanceKm: 0.3, durationMin: 15, note: '需安检, 避开 11am-3pm 排队高峰' },
      { from: '圣彼得大教堂', to: '梵蒂冈博物馆入口', mode: '步行', distanceKm: 1.0, durationMin: 20, note: '沿梵蒂冈城墙外走, 两者属同一文化参访线' },
    ],
    culturalProducts: [
      { name: '《欧洲基督十二讲》人手一册', desc: '小鸿团队自撰 · 艺术/建筑/文艺复兴等十二讲', emoji: '📖', tag: '人手一册', priceFrom: 120 },
      { name: '梵蒂冈官方《圣经》文艺复兴典藏本', desc: '梵蒂冈博物馆店售,意大利精装本', emoji: '📜', tag: '官方商店', localStore: '梵蒂冈博物馆店', priceFrom: 580 },
      { name: '米开朗基罗《圣殇》复制品', desc: '梵蒂冈官方授权比例缩小版大理石雕', emoji: '🎨', tag: '授权复制品', localStore: '圣彼得广场礼品店', priceFrom: 1880 },
      { name: '意大利手工皮革笔记本', desc: '罗马百年皮具作坊手作, 可烫压名字', emoji: '📓', tag: '手工艺', localStore: '纳沃纳广场·古皮具店', priceFrom: 480 },
      { name: '罗马咖啡豆(Caffè Sant Eustachio)', desc: '罗马百年咖啡馆秘方豆', emoji: '☕', tag: '百年老字号', localStore: '万神殿旁 Sant Eustachio', priceFrom: 180 },
    ],
    openingHoursBySeason: {
      spring: { open: '07:00', close: '19:00', note: '3-5 月复活节前后人流多' },
      summer: { open: '07:00', close: '19:00', note: '6-8 月午后气温高, 需注意防暑' },
      autumn: { open: '07:00', close: '18:30', note: '9-11 月天气最宜人, 游客少于夏季' },
      winter: { open: '07:00', close: '18:30', note: '12-2 月圣诞季人最多, 新年后骤减' },
    },
    visitorTipsGrouped: {
      transport: ['罗马地铁 A 线 Ottaviano 站最近', '打车从市区 15-25 欧元', '梵蒂冈无机场, 罗马 Fiumicino/Ciampino 机场均可'],
      dining: ['圣彼得广场周边多游客餐厅, 建议步行 10 分钟至 Borgo 区', '百年意大利餐馆推荐"La Carbonara"', '注意避开英文菜单+照片菜单的游客陷阱'],
      gear: ['拍穿着要求: 进入大教堂必须遮肩盖膝', '防晒霜(夏季)/保暖外套(冬季)', '相机可带, 但大教堂内禁用闪光灯', '舒适步行鞋(梵蒂冈博物馆要走 3+ 小时)'],
      etiquette: ['大教堂内请保持低声', '不要坐在圣堂内圣坛上', '不要触摸古代雕塑', '文化徽章: 非宗教 · 非梵蒂冈官方活动'],
    },
    localGuides: [
      { name: 'Marco Rossi', specialty: '文艺复兴艺术史 · 米开朗基罗', languages: ['意大利语', '英语', '中文'], rating: 4.9, bio: '罗马大学艺术史博士, 梵蒂冈博物馆文化导览 15 年' },
      { name: '李文博', specialty: '基督文化史 · 中西文化交流', languages: ['中文', '英语', '意大利语'], rating: 4.8, bio: '华裔艺术史学者, 长驻罗马 12 年, 出版《罗马艺术十二讲》' },
      { name: 'Giulia Conti', specialty: '梵蒂冈博物馆珍品 · 古希腊罗马', languages: ['意大利语', '英语', '法语'], rating: 4.9, bio: '梵蒂冈博物馆授权独立导览, 专讲《创世纪》《最后的审判》' },
    ],
    photoStory: [
      { caption: '圣彼得广场', shotLocation: '圣彼得大教堂前贝尔尼尼柱廊', significance: '贝尔尼尼 1656-1667 年设计的巴洛克广场, 柱廊 284 根, 象征"张开双臂拥抱世界"', order: 1 },
      { caption: '米开朗基罗穹顶', shotLocation: '圣彼得大教堂中央', significance: '米开朗基罗 1547-1564 年设计, 文艺复兴建筑巅峰, 内径 42 米', order: 2 },
      { caption: '《圣殇》雕塑', shotLocation: '圣彼得大教堂右手第一小堂', significance: '米开朗基罗 1498-1499 年作, 西方雕塑史最伟大作品之一, 唯一有他签名的作品', order: 3 },
      { caption: '贝尔尼尼华盖', shotLocation: '圣彼得大教堂主祭坛', significance: '贝尔尼尼 1623-1634 年作, 高 29 米青铜华盖, 巴洛克艺术巅峰', order: 4 },
      { caption: '西斯廷礼拜堂《创世纪》', shotLocation: '梵蒂冈博物馆西斯廷礼拜堂天顶', significance: '米开朗基罗 1508-1512 年绘制, 9 幅《创世纪》画面, 文艺复兴壁画巅峰', order: 5 },
      { caption: '《最后的审判》', shotLocation: '西斯廷礼拜堂祭坛墙', significance: '米开朗基罗 1536-1541 年绘制, 400 余人物, 西方美术史上最震撼画面之一', order: 6 },
    ],
  },

  // ════════ 5. 伊斯兰 · 麦加禁寺 ════════
  {
    nameMatch: '麦加禁寺',
    religionSlug: 'islam',
    transportLegs: [
      { from: '吉达阿卜杜勒国际机场', to: '麦加市区', mode: '舒适商务车', distanceKm: 90, durationMin: 70, note: '非穆斯林不可进入禁寺内部, 本程为外围建筑文化观瞻', costFrom: 500 },
      { from: '麦加酒店', to: '禁寺外围广场', mode: '舒适商务车', distanceKm: 2, durationMin: 10, note: '禁寺核心区域仅限穆斯林进入, 外围可远眺' },
      { from: '禁寺外围', to: '麦加博物馆', mode: '舒适商务车', distanceKm: 5, durationMin: 15, note: '麦加博物馆允许所有文化访客进入, 详述禁寺历史' },
      { from: '麦加博物馆', to: '希拉山', mode: '舒适商务车', distanceKm: 6, durationMin: 20, note: '希拉山为文化观瞻, 外围山下即可' },
    ],
    culturalProducts: [
      { name: '《丝路七讲》 + 伊斯兰专章', desc: '小鸿团队自撰 · 丝路与伊斯兰文化史双向互动', emoji: '📖', tag: '人手一册', priceFrom: 88 },
      { name: '阿拉伯书法卷轴', desc: '沙特本地书法家手作, 古兰经文艺术化书法', emoji: '✍️', tag: '手工艺', localStore: '麦加老城·书法店', priceFrom: 680 },
      { name: '阿拉伯椰枣礼盒', desc: '麦地那椰枣(Ajwa)· 伊斯兰饮食文化代表', emoji: '🌴', tag: '特色美食', localStore: '麦加集市', priceFrom: 280 },
      { name: '阿拉伯玫瑰水', desc: '塔伊夫玫瑰精油水, 沙特阿拉伯千年饮食/香薰传统', emoji: '🌹', tag: '传统香品', localStore: '吉达老城·玫瑰水坊', priceFrom: 380 },
      { name: '阿拉伯黑头巾(男)/ 彩纱(女)', desc: '麦加朝圣者传统服饰, 作为文化观瞻的礼仪装', emoji: '🧣', tag: '文化服饰', localStore: '禁寺外围服饰街', priceFrom: 280 },
    ],
    openingHoursBySeason: {
      spring: { open: '24h', close: '24h', note: '禁寺 24 小时开放给穆斯林朝圣者; 非穆斯林仅可外围观瞻' },
      summer: { open: '24h', close: '24h', note: '6-9 月沙特气温极高 45°C+, 不建议旅行' },
      autumn: { open: '24h', close: '24h', note: '10-11 月最舒适季节, 气温 25-30°C' },
      winter: { open: '24h', close: '24h', note: '12-2 月是沙特最佳旅行季, 气温 15-25°C' },
    },
    visitorTipsGrouped: {
      transport: ['非穆斯林不可进入麦加禁寺及其周围核心区域', '本程仅提供外围文化观瞻+博物馆讲读', '吉达→麦加高速公路设有非穆斯林分流检查站'],
      dining: ['沙特严格禁酒, 不可携带任何含酒精饮品入境', '清真餐饮随处可见, 推荐阿拉伯烤羊排 Kabsa', '斋月期间(伊斯兰历 9 月)白天禁食'],
      gear: ['男性: 长裤长袖, 勿戴明显十字架等他文化标识', '女性: 长袖长裙, 头发需以头巾(Hijab)遮盖', '防晒霜/遮阳伞/大量饮水', '进入沙特阿拉伯需申请文化访客签证'],
      etiquette: ['禁寺外围广场勿大声喧哗', '祷告时段勿打扰穆斯林', '朝圣者视角勿随意拍摄', '文化徽章: 非宗教 · 非官方朝圣活动'],
    },
    localGuides: [
      { name: 'Ahmed Al-Saud', specialty: '伊斯兰建筑史 · 禁寺扩建工程', languages: ['阿拉伯语', '英语', '中文'], rating: 4.8, bio: '沙特麦加大学建筑学博士, 讲禁寺 1400 年扩建历史' },
      { name: 'Dr. Mahmoud', specialty: '古兰经文化学 · 伊斯兰史', languages: ['阿拉伯语', '英语'], rating: 4.9, bio: '麦加大学文化文化系教授, 本地华语向导合作' },
      { name: '王穆斯林老师', specialty: '中阿文化交流 · 回族文化', languages: ['中文', '阿拉伯语'], rating: 4.8, bio: '中国回族文化研究者, 在沙特工作 10 年' },
    ],
    photoStory: [
      { caption: '禁寺全景', shotLocation: '麦加城高点观景台', significance: '世界最大清真寺, 可容纳 200 万人同时朝拜, 现代扩建工程持续 50 年', order: 1 },
      { caption: '克尔白天房', shotLocation: '禁寺中央(外围观瞻)', significance: '伊斯兰文化中心圣物, 黑色立方体建筑, 2000 年前由易卜拉欣建立', order: 2 },
      { caption: '朝圣者人潮', shotLocation: '禁寺外围广场', significance: '每年朝觐季(伊斯兰历 12 月)数百万人聚集, 人类文明最宏大的文化现象之一', order: 3 },
      { caption: '阿拉伯书法壁', shotLocation: '禁寺外围围墙', significance: '阿拉伯书法是伊斯兰文化艺术巅峰, 禁寺围墙刻有历代《古兰经》文段', order: 4 },
      { caption: '希拉山夜景', shotLocation: '希拉山脚下远眺', significance: '伊斯兰文化起源地, 穆罕默德接受启示的地方, 象征伊斯兰文化的诞生', order: 5 },
      { caption: '麦加集市', shotLocation: '禁寺外围商业街', significance: '伊斯兰文化商业活化石, 丝路东方商队与阿拉伯商人千年交易的地方', order: 6 },
    ],
  },

  // ════════ 6. 印度 · 瓦拉纳西恒河 ════════
  {
    nameMatch: '瓦拉纳西恒河',
    religionSlug: 'hinduism',
    transportLegs: [
      { from: '新德里英迪拉机场', to: '瓦拉纳西市区', mode: '印度国内线航班', durationMin: 90, note: '印度航空直飞, 班次较多', costFrom: 1500 },
      { from: '瓦拉纳西机场', to: '恒河西岸酒店', mode: '舒适商务车', distanceKm: 25, durationMin: 45, note: '印度交通复杂, 建议走高速', costFrom: 200 },
      { from: '酒店', to: '达萨瓦梅德石阶', mode: '舒适商务车', distanceKm: 3, durationMin: 15, note: '达萨瓦梅德为恒河最重要的祭祀石阶' },
      { from: '达萨瓦梅德石阶', to: '马尼卡尼卡石阶', mode: '徒步沿恒河', distanceKm: 1.2, durationMin: 30, note: '恒河十大石阶步行文化讲读' },
      { from: '恒河西岸', to: '恒河东岸(对岸)', mode: '传统木船', durationMin: 20, note: '黄昏 Aarti 仪式后最佳观景点' },
    ],
    culturalProducts: [
      { name: '《印度五讲》人手一册', desc: '小鸿团队自撰 · 梵文/瑜伽/恒河/婆罗门等五讲', emoji: '📖', tag: '人手一册', priceFrom: 88 },
      { name: '瓦拉纳西丝绸纱丽', desc: '印度最顶级手工丝绸, 瓦拉纳西千年丝织文化', emoji: '🥻', tag: '手工艺', localStore: '瓦拉纳西老城丝绸街', priceFrom: 880 },
      { name: '印度檀香木雕佛像', desc: '瓦拉纳西本地檀香木手工雕刻', emoji: '🪵', tag: '手工艺', localStore: '老城·木雕工坊', priceFrom: 480 },
      { name: '阿育吠陀草药礼盒', desc: '印度千年医学阿育吠陀日用养生草药', emoji: '🌿', tag: '传统医学', localStore: '瓦拉纳西·阿育吠陀药店', priceFrom: 320 },
      { name: '《薄伽梵歌》中印双语典藏', desc: '瓦拉纳西本地印刷版, 印度古典智慧代表文本', emoji: '📜', tag: '典藏本', localStore: '瓦拉纳西书店街', priceFrom: 180 },
    ],
    openingHoursBySeason: {
      spring: { open: '04:00', close: '22:00', note: '3-5 月气温 30-40°C, 建议清晨和黄昏' },
      summer: { open: '04:00', close: '22:00', note: '6-9 月雨季,气温略降但湿度极大' },
      autumn: { open: '04:00', close: '22:00', note: '10-11 月最佳旅行季, 气温 20-30°C' },
      winter: { open: '05:00', close: '22:00', note: '12-2 月早晚雾大, 但气温宜人 10-22°C' },
    },
    visitorTipsGrouped: {
      transport: ['新德里转机到瓦拉纳西最便捷', '市内交通建议专车, 突突车易宰客', '恒河黄昏 Aarti 仪式每日 18:30-19:30'],
      dining: ['严格素食地带, 肉食极少', '推荐百年素食餐馆"Shree Cafe"', '生水不可喝, 瓶装水 +煮沸水'],
      gear: ['轻便长袖长裤(防蚊 + 遮阳)', '结实凉鞋(石阶不平)', '消毒湿巾(公共卫生)', '防蚊液/肠胃药备用'],
      etiquette: ['石阶处勿拍摄沐浴者', '勿踩踏花束/供品', '进入印度神庙需脱鞋', '文化徽章: 非宗教 · 非神庙官方活动'],
    },
    localGuides: [
      { name: 'Pandit Sharma', specialty: '印度经典 · 梵文经典', languages: ['印地语', '英语', '梵语'], rating: 4.9, bio: '瓦拉纳西印度大学教授, 梵文权威, 讲《薄伽梵歌》《奥义书》20 年' },
      { name: 'Dr. Rajesh', specialty: '恒河文化史 · 瓦拉纳西古迹', languages: ['印地语', '英语', '中文'], rating: 4.8, bio: '瓦拉纳西本地考古学者, 瓦拉纳西老城研究者' },
      { name: '李印度', specialty: '印度文化在中国 · 玄奘游学路线', languages: ['中文', '英语', '印地语'], rating: 4.8, bio: '中印文化交流学者, 在瓦拉纳西长居 15 年' },
    ],
    photoStory: [
      { caption: '恒河日出', shotLocation: '达萨瓦梅德石阶', significance: '千年来瓦拉纳西的早祷文化景观, 印度教文化最神圣的现场', order: 1 },
      { caption: '恒河黄昏 Aarti 仪式', shotLocation: '达萨瓦梅德石阶', significance: '每日傍晚的印度文化祭祀仪式, 5 位婆罗门共同主持, 千年不间断', order: 2 },
      { caption: '马尼卡尼卡石阶', shotLocation: '恒河西岸', significance: '印度教最神圣的火葬文化现场, 24 小时火化不灭, 已持续千年', order: 3 },
      { caption: '瓦拉纳西老城', shotLocation: '恒河西岸老城', significance: '全球最古老的持续有人居住城市之一, 至少 3000 年历史', order: 4 },
      { caption: '印度教徒沐浴', shotLocation: '恒河西岸石阶', significance: '印度文化文化核心仪式, 认为恒河水可净化罪孽, 每日百万人参与', order: 5 },
      { caption: '鹿野苑', shotLocation: '瓦拉纳西近郊 13 公里', significance: '佛陀初转法轮处, 佛教文化重要圣地之一, 是印度教-佛教两文化交汇地', order: 6 },
    ],
  },

  // ════════ 7. 儒家 · 曲阜孔庙 ════════
  {
    nameMatch: '曲阜孔庙',
    religionSlug: 'confucianism',
    transportLegs: [
      { from: '济南机场/北京南站', to: '曲阜东站', mode: '中国高铁', distanceKm: 450, durationMin: 130, note: '北京→曲阜东 2h10m; 济南→曲阜东 40min', costFrom: 280 },
      { from: '曲阜东站', to: '曲阜明古城精品民宿', mode: '舒适商务车', distanceKm: 8, durationMin: 20, note: '曲阜高铁站距古城最近, 交通方便', costFrom: 100 },
      { from: '明古城民宿', to: '孔庙南门', mode: '步行', distanceKm: 0.8, durationMin: 10, note: '明古城内步行, 感受明清古城氛围' },
      { from: '孔庙', to: '孔府', mode: '步行', distanceKm: 0.3, durationMin: 5, note: '孔庙与孔府一墙之隔' },
      { from: '孔府', to: '孔林', mode: '舒适商务车', distanceKm: 1.8, durationMin: 10, note: '孔林在曲阜城北, 步行 20 分钟亦可' },
    ],
    culturalProducts: [
      { name: '《曲阜三讲》人手一册', desc: '小鸿团队自撰 · 孔家/孟家/家书三讲', emoji: '📖', tag: '人手一册', priceFrom: 68 },
      { name: '曲阜古城杏坛香包', desc: '孔庙杏坛落杏配方 · 儒风刺绣手作', emoji: '🎐', tag: '文化伴手', localStore: '曲阜明古城·老字号香包店', priceFrom: 88 },
      { name: '孔府家酿米酒', desc: '曲阜明清孔府家酿米酒秘方', emoji: '🍶', tag: '百年老字号', localStore: '曲阜古城·孔家家酿', priceFrom: 180 },
      { name: '孔府家训典藏本', desc: '《孔子家语》《颜氏家训》合订典藏本', emoji: '📜', tag: '典藏本', localStore: '曲阜书店', priceFrom: 158 },
      { name: '孔府官府菜烹饪指南', desc: '孔府百年官府菜 50 道菜谱, 含文化典故', emoji: '🍱', tag: '文化美食', localStore: '曲阜官府菜餐厅', priceFrom: 128 },
    ],
    openingHoursBySeason: {
      spring: { open: '08:00', close: '17:30', note: '3-5 月最佳游览季' },
      summer: { open: '07:30', close: '18:30', note: '6-8 月注意防暑' },
      autumn: { open: '08:00', close: '17:30', note: '9-11 月孔庙秋祭大典(每年 9 月 28 日)' },
      winter: { open: '08:30', close: '17:00', note: '12-2 月游客少, 古城更清净' },
    },
    visitorTipsGrouped: {
      transport: ['北京高铁直达 2h10m, 交通极便利', '曲阜高铁站至古城最近机场 8 公里', '古城内建议全程步行或电瓶车'],
      dining: ['曲阜孔府官府菜是鲁菜精华, 推荐"孔府家宴"', '明古城内有多家孔家菜老字号', '曲阜煎饼是本地特色, 可现场烙制'],
      gear: ['舒适步行鞋(古城石板路)', '夏季遮阳伞, 冬季保暖外套', '相机+长焦(拍古建细节)', '笔记本(记录孔庙碑文精华)'],
      etiquette: ['大成殿内请保持低声', '不可触摸古代碑文', '孔林参拜勿喧哗', '文化徽章: 非宗教 · 非孔庙官方活动'],
    },
    localGuides: [
      { name: '孔老师', specialty: '孔家七十四代传承史', languages: ['中文', '山东话'], rating: 4.9, bio: '孔家第七十四代嫡孙, 曲阜师范大学退休教授, 讲孔府故事 40 年' },
      { name: '刘儒学', specialty: '儒家经典 · 《论语》精读', languages: ['中文', '英语'], rating: 4.9, bio: '曲阜师范大学儒家文化研究所所长, 出版《论语十讲》' },
      { name: '王家宴', specialty: '孔府官府菜 · 家族传承', languages: ['中文'], rating: 4.8, bio: '孔府菜非遗传承人, 讲孔府饮食与家风' },
    ],
    photoStory: [
      { caption: '大成殿', shotLocation: '曲阜孔庙中轴', significance: '曲阜孔庙主殿, 金代始建, 明清重修, 祭祀孔子的最高殿堂', order: 1 },
      { caption: '孔庙杏坛', shotLocation: '大成殿前', significance: '相传孔子讲学处, 宋代建杏坛亭, 儒家文化最重要的象征之一', order: 2 },
      { caption: '十三碑亭', shotLocation: '孔庙中轴', significance: '金元明清十三朝帝王祭孔碑刻汇集, 中国文化官方祭孔千年历史', order: 3 },
      { caption: '孔府内宅', shotLocation: '孔府中轴', significance: '孔家七十四代嫡孙生活居所, 中国现存最大最完整的贵族府邸', order: 4 },
      { caption: '孔林古柏', shotLocation: '曲阜城北', significance: '孔子及其后代千年墓地, 现有 2000 余株 500 岁以上古柏', order: 5 },
      { caption: '孔子墓', shotLocation: '孔林中轴', significance: '孔子安葬之处, 位于孔林最深处, 千年来无数读书人朝谒', order: 6 },
    ],
  },

  // ════════ 8. 锡克 · 阿姆利则金庙 ════════
  {
    nameMatch: '阿姆利则金庙',
    religionSlug: 'sikhism',
    transportLegs: [
      { from: '新德里机场', to: '阿姆利则机场', mode: '印度国内线航班', durationMin: 90, note: '印度国内线最快抵达方式', costFrom: 1800 },
      { from: '阿姆利则机场', to: '金庙畔精品酒店', mode: '舒适商务车', distanceKm: 15, durationMin: 30, note: '市内交通, 金庙区域限行', costFrom: 150 },
      { from: '酒店', to: '金庙入口', mode: '步行', distanceKm: 0.8, durationMin: 10, note: '金庙周边步行街区, 感受锡克文化氛围' },
      { from: '金庙外围', to: '金庙中心圣池', mode: '步行沿圣池边', distanceKm: 0.5, durationMin: 20, note: '入前需脱鞋 + 头巾(免费提供)' },
      { from: '金庙', to: '贾利安瓦拉花园', mode: '步行', distanceKm: 0.4, durationMin: 8, note: '锡克近代文化史重要现场, 离金庙 400 米' },
    ],
    culturalProducts: [
      { name: '《锡克五讲》人手一册', desc: '小鸿团队自撰 · 那纳克/十古鲁/Khalsa/Langar/Seva', emoji: '📖', tag: '人手一册', priceFrom: 78 },
      { name: '《古鲁·格兰特·萨希卜》双语选本', desc: '锡克文化经典文本精选, 中旁双语对照', emoji: '📜', tag: '典藏本', localStore: '金庙书店', priceFrom: 180 },
      { name: '锡克 Kirpan 礼仪短剑(文化纪念版)', desc: '锡克文化五件套之一, 本程提供观瞻版(非锋利)', emoji: '🗡️', tag: '文化纪念', localStore: '金庙文化商店', priceFrom: 280 },
      { name: '旁遮普 Phulkari 刺绣围巾', desc: '旁遮普千年女性手工刺绣, 世界文化遗产工艺', emoji: '🧣', tag: '手工艺', localStore: '阿姆利则老城 Phulkari 店', priceFrom: 680 },
      { name: '锡克 Dastar 文化头巾', desc: '锡克男性传统头巾, 橙色/蓝色/黄色可选', emoji: '🎀', tag: '文化服饰', localStore: '金庙外围头巾店', priceFrom: 180 },
    ],
    openingHoursBySeason: {
      spring: { open: '24h', close: '24h', note: '3-5 月气温 25-35°C, 早晚最佳' },
      summer: { open: '24h', close: '24h', note: '6-9 月高温 45°C+, 不建议白天长时间在外' },
      autumn: { open: '24h', close: '24h', note: '10-11 月最佳旅行季, 气温 15-28°C' },
      winter: { open: '24h', close: '24h', note: '12-2 月早晚雾气大, 但气温 5-20°C 宜人' },
    },
    visitorTipsGrouped: {
      transport: ['从德里优选内陆航班 1.5h, 也可火车 10h', '阿姆利则市区交通建议专车', '金庙 24 小时开放, 建议清晨 5 点或黄昏观光'],
      dining: ['金庙 Langar 免费厨房观摩(仅观摩, 不领餐, 尊重文化)', '旁遮普素食黄油咖喱是本地必尝', '推荐百年老店 "Kesar da Dhaba"'],
      gear: ['头巾(进金庙必须戴, 入口免费提供)', '脱鞋(金庙园区全程赤脚)', '轻便易脱鞋/袜', '深色素色衣物, 勿穿显眼花色'],
      etiquette: ['金庙中心圣池周围勿大声喧哗', '金庙内勿拍摄修行者', '参访 Langar 厨房勿打扰准备人员', '文化徽章: 非宗教 · 非庙方官方活动'],
    },
    localGuides: [
      { name: 'Gurmeet Singh', specialty: '锡克文化史 · 十古鲁传承', languages: ['旁遮普语', '英语', '印地语'], rating: 4.9, bio: '阿姆利则本地锡克学者, 讲金庙 500 年史 15 年' },
      { name: 'Harjit Kaur', specialty: 'Phulkari 刺绣 · 女性传统', languages: ['旁遮普语', '英语'], rating: 4.8, bio: '旁遮普 Phulkari 非遗传承人, 讲锡克女性文化' },
      { name: '李印度老师', specialty: '中印文化对比 · 锡克与佛教', languages: ['中文', '英语', '印地语'], rating: 4.8, bio: '中印文化交流学者, 常驻新德里 10 年' },
    ],
    photoStory: [
      { caption: '金庙金顶', shotLocation: '金庙圣池对岸', significance: '金庙主体建筑 Harmandir Sahib, 金色穹顶覆盖 750 公斤纯金箔, 锡克文化 500 年文化象征', order: 1 },
      { caption: '圣池 Amrit Sarovar', shotLocation: '金庙中央圣池', significance: '锡克文化最神圣的水池, 阿姆利则("长寿之水")即由此得名', order: 2 },
      { caption: 'Langar 免费厨房', shotLocation: '金庙东侧', significance: '锡克 Seva 文化现场, 每日免费供餐 10 万人份, 不分种姓/国籍/信仰', order: 3 },
      { caption: '金庙夜景', shotLocation: '金庙圣池对岸', significance: '金色穹顶在夜色中倒映圣池, 锡克文化最具诗意的文化景观', order: 4 },
      { caption: '贾利安瓦拉花园', shotLocation: '金庙以北 400 米', significance: '1919 年英殖民军屠杀锡克人的历史现场, 印度近代史重要地标', order: 5 },
      { caption: 'Nishan Sahib 圣旗', shotLocation: '金庙入口', significance: '锡克文化橙色圣旗, 象征锡克武德与平等精神', order: 6 },
    ],
  },

  // ════════ 9. 神道 · 伊势神宫 ════════
  {
    nameMatch: '伊势神宫',
    religionSlug: 'shinto',
    transportLegs: [
      { from: '关西机场/中部机场', to: '名古屋站', mode: '日本特急', durationMin: 60, note: '关西 70min / 中部 35min', costFrom: 3500 },
      { from: '名古屋站', to: '伊势市站', mode: '近铁特急', durationMin: 85, note: '近铁 Shimakaze 观光列车最佳', costFrom: 2800 },
      { from: '伊势市站', to: '伊势神宫外宫', mode: '步行', distanceKm: 0.4, durationMin: 5, note: '伊势神宫参拜从外宫开始是传统礼节' },
      { from: '外宫', to: '内宫', mode: '巴士 + 舒适商务车', distanceKm: 6, durationMin: 25, note: '公交巴士每 10 分钟一班' },
      { from: '内宫', to: 'おかげ横丁古街', mode: '步行', distanceKm: 0.3, durationMin: 5, note: '江户时代风格古街, 传统文化美食' },
    ],
    culturalProducts: [
      { name: '《神道五讲》人手一册', desc: '小鸿团队自撰 · 古事记/日本书纪/伊势/式年迁宫等', emoji: '📖', tag: '人手一册', priceFrom: 88 },
      { name: '伊势神宫御朱印簿', desc: '日本神道朱印收集文化, 伊势神宫限量版本', emoji: '📔', tag: '神社文化', localStore: '伊势神宫授与所', priceFrom: 380 },
      { name: '赤福饼', desc: '伊势神宫门前百年老店创立 1707, 红豆甜饼代表', emoji: '🍡', tag: '300 年老字号', localStore: 'おかげ横丁·赤福本店', priceFrom: 120 },
      { name: '伊势木绵手作包', desc: '伊势木绵千年工艺, 手作帆布包', emoji: '👜', tag: '日本传统工艺', localStore: 'おかげ横丁·木绵坊', priceFrom: 680 },
      { name: '《古事记》中日双语典藏', desc: '日本最古典的神道文化文献', emoji: '📜', tag: '典藏本', localStore: '伊势书店', priceFrom: 280 },
      { name: '日本和纸文化信笺', desc: '伊势手作和纸, 山水纹路', emoji: '📝', tag: '手工艺', localStore: 'おかげ横丁·和纸店', priceFrom: 180 },
    ],
    openingHoursBySeason: {
      spring: { open: '05:00', close: '18:00', note: '3-5 月樱花季, 游客多于夏季' },
      summer: { open: '05:00', close: '19:00', note: '6-8 月气温高湿度大' },
      autumn: { open: '05:00', close: '18:00', note: '9-11 月枫叶季最佳, 游客相对少' },
      winter: { open: '05:00', close: '17:00', note: '12-2 月新年期间极忙, 1 月 2 日起游客锐减' },
    },
    visitorTipsGrouped: {
      transport: ['关西/中部机场均可, 中部机场更近 30 分钟', '近铁 Shimakaze 观光列车是日本最好的文化列车之一', '神宫内全程步行, 不可骑行'],
      dining: ['伊势门前 おかげ横丁 古街有多家 300 年老字号', '必吃: 赤福饼 + 伊势乌龙面 + 手打荞麦', '日本神社周边避免大声喧哗'],
      gear: ['舒适步行鞋(神宫参道是石板)', '夏季: 轻便扇子 + 遮阳伞', '冬季: 保暖围巾(神宫内部风大)', '相机(神宫美景拍摄)'],
      etiquette: ['神宫鸟居前鞠躬示敬', '手水舍先洗手后漱口(传统礼仪)', '神宫内勿大声喧哗, 勿拍摄本殿', '文化徽章: 非宗教 · 非神社官方活动'],
    },
    localGuides: [
      { name: '田中孝一', specialty: '神道文化史 · 式年迁宫', languages: ['日语', '英语'], rating: 4.9, bio: '伊势神宫文化研究员 30 年, 讲式年迁宫 1300 年史' },
      { name: '佐藤美和', specialty: '日本古典文学 · 古事记', languages: ['日语', '英语', '中文'], rating: 4.8, bio: '名古屋大学日本文学博士, 中文流利' },
      { name: '王日语老师', specialty: '中日文化比较 · 神道与道教', languages: ['中文', '日语'], rating: 4.8, bio: '华裔文化学者, 长居日本 20 年' },
    ],
    photoStory: [
      { caption: '伊势神宫宇治桥', shotLocation: '内宫入口', significance: '伊势神宫内宫的入口桥, 跨五十铃川, 象征从凡间进入神域, 每 20 年迁宫重建', order: 1 },
      { caption: '五十铃川手水舍', shotLocation: '内宫参道', significance: '直接用圣川洗手漱口的神道传统, 世界少有的活态文化', order: 2 },
      { caption: '正殿参拜道', shotLocation: '内宫本殿前参道', significance: '伊势神宫最神圣的核心区域, 仅皇室代表可入内部, 访客只到参道末端', order: 3 },
      { caption: '式年迁宫遗址', shotLocation: '内宫本殿旁', significance: '日本神道最独特的文化: 每 20 年迁建神宫, 已持续 1300 年, 延续到 2033 年', order: 4 },
      { caption: '外宫正殿', shotLocation: '外宫中轴', significance: '祭祀丰受大御神(食物之神), 神道参拜传统先外宫后内宫', order: 5 },
      { caption: 'おかげ横丁古街', shotLocation: '内宫门前', significance: '江户时代建筑风格完整保留的古街, 日本传统商业文化活化石', order: 6 },
    ],
  },

  // ════════ 10. 原住民 · 马丘比丘 ════════
  {
    nameMatch: '马丘比丘',
    religionSlug: 'indigenous',
    transportLegs: [
      { from: '利马国际机场', to: '库斯科', mode: '秘鲁国内线航班', durationMin: 90, note: '库斯科海拔 3400m, 抵达当日建议休整', costFrom: 800 },
      { from: '库斯科', to: '欧雁台', mode: '舒适商务车', distanceKm: 85, durationMin: 120, note: '沿圣谷公路前往, 风景绝佳', costFrom: 300 },
      { from: '欧雁台', to: '马丘比丘下镇(温泉镇)', mode: 'PeruRail Vistadome 观景火车', durationMin: 90, note: '全玻璃顶观景列车, 沿乌鲁班巴河', costFrom: 2500 },
      { from: '温泉镇', to: '马丘比丘山门', mode: '景区巴士', durationMin: 30, note: '盘山公路上山, 徒步 Inca Trail 约 6h 备选', costFrom: 180 },
      { from: '山门', to: '守门石屋观景点', mode: '徒步', distanceKm: 0.8, durationMin: 25, note: '马丘比丘第一张明信片角度' },
    ],
    culturalProducts: [
      { name: '《印加五讲》人手一册', desc: '小鸿团队自撰 · 库斯科/马丘比丘/圣谷/印加战术等', emoji: '📖', tag: '人手一册', priceFrom: 98 },
      { name: '秘鲁羊驼披肩', desc: '安第斯高原 Alpaca 绒手工织造, 世界最柔软毛料', emoji: '🧣', tag: '传统工艺', localStore: '库斯科圣多明戈广场·羊驼坊', priceFrom: 680 },
      { name: '印加塔皮瑞纺织品', desc: '印加古代色彩织造技艺, 科昌科地区特产', emoji: '🧶', tag: '手工艺', localStore: '圣谷皮萨克市集', priceFrom: 380 },
      { name: '秘鲁藜麦礼盒', desc: '印加古代"超级食物"藜麦, 联合国粮农组织认证', emoji: '🌾', tag: '印加古粮', localStore: '库斯科有机市集', priceFrom: 280 },
      { name: '秘鲁银器印加十字纹', desc: '秘鲁 950 银手工打造, 印加十字符号文化', emoji: '🔸', tag: '手工艺', localStore: '库斯科 San Blas 艺术街', priceFrom: 580 },
      { name: '秘鲁可可(Cacao)原豆', desc: '安第斯原生可可, 古代印加祭祀饮品', emoji: '🍫', tag: '印加古食', localStore: '库斯科老城市集', priceFrom: 220 },
    ],
    openingHoursBySeason: {
      spring: { open: '06:00', close: '15:00', note: '3-5 月雨季末, 景色青翠' },
      summer: { open: '06:00', close: '15:00', note: '6-8 月南半球冬季, 干燥凉爽, 旺季需提前 3 月预约' },
      autumn: { open: '06:00', close: '15:00', note: '9-11 月南半球春季, 鲜花绽放' },
      winter: { open: '06:00', close: '15:00', note: '12-2 月雨季, 有关闭风险' },
    },
    visitorTipsGrouped: {
      transport: ['秘鲁国内线 利马→库斯科每日多班', '欧雁台→温泉镇观景火车限量, 需提前 2 月订', '山门巴士排队可达 1 小时'],
      dining: ['库斯科推荐百年餐馆 Chicha', '安第斯高原传统菜 Cuy(烤豚鼠)·Ceviche 腌鱼', '饮水建议瓶装水 + 煮沸水'],
      gear: ['高原药(抵达库斯科前 2 天服用)', '登山鞋(马丘比丘全程步行)', '防晒霜 SPF50+(紫外线强)', '雨衣(山区天气多变)'],
      etiquette: ['马丘比丘禁拍无人机', '勿触摸古代石墙', '勿留垃圾在遗址区', '文化徽章: 非宗教 · 非秘鲁政府官方活动'],
    },
    localGuides: [
      { name: 'Dr. Carlos', specialty: '印加考古 · 马丘比丘建筑', languages: ['西班牙语', '英语', '中文'], rating: 4.9, bio: '库斯科圣安东尼奥·阿巴德大学考古学教授, 主持马丘比丘修复工作 20 年' },
      { name: 'Rosa Quispe', specialty: '印加纺织 · 盖丘亚语文化', languages: ['西班牙语', '盖丘亚语', '英语'], rating: 4.8, bio: '盖丘亚原住民纺织非遗传承人, 印加织造 25 代传人' },
      { name: '李秘鲁老师', specialty: '中南美文化 · 印加与华夏对比', languages: ['中文', '英语', '西班牙语'], rating: 4.8, bio: '华裔文化学者, 常驻库斯科 18 年' },
    ],
    photoStory: [
      { caption: '马丘比丘全景', shotLocation: '守门石屋观景点', significance: '马丘比丘最经典构图, 云雾中的印加古城, 海拔 2430m', order: 1 },
      { caption: '太阳神庙', shotLocation: '马丘比丘中央广场', significance: '印加建筑最精美的现场, 切割石块不用灰浆, 误差不到 1 毫米', order: 2 },
      { caption: '梯田农业', shotLocation: '马丘比丘南坡', significance: '印加人发明的山地梯田系统, 可在陡坡上种植玉米/土豆/藜麦', order: 3 },
      { caption: 'Intihuatana 日晷石', shotLocation: '马丘比丘最高平台', significance: '印加太阳崇拜的核心石器, 每年冬至日光与石柱对齐', order: 4 },
      { caption: '乌鲁班巴河谷', shotLocation: '马丘比丘东侧悬崖', significance: '印加圣谷的命脉, 沿河谷散布十余处印加古城和梯田', order: 5 },
      { caption: '华纳比丘山顶', shotLocation: '马丘比丘北侧', significance: '马丘比丘最高峰顶, 可俯瞰整个印加古城, 每日限 400 人攀登', order: 6 },
    ],
  },

  // ════════ 11. 犹太 · 耶路撒冷哭墙 ════════
  {
    nameMatch: '耶路撒冷哭墙',
    religionSlug: 'judaism',
    transportLegs: [
      { from: '特拉维夫本古里安机场', to: '耶路撒冷老城', mode: '舒适商务车', distanceKm: 55, durationMin: 60, note: '特拉维夫→耶路撒冷高速一路直达', costFrom: 400 },
      { from: '耶路撒冷酒店', to: '老城 Jaffa Gate', mode: '舒适商务车', distanceKm: 2, durationMin: 10, note: '老城区域限行, 车至 Jaffa Gate 下车' },
      { from: 'Jaffa Gate', to: '哭墙广场', mode: '步行穿过老城', distanceKm: 0.8, durationMin: 20, note: '经阿拉伯市场→犹太区→哭墙, 全程文化讲读' },
      { from: '哭墙', to: '大卫塔博物馆', mode: '步行', distanceKm: 0.4, durationMin: 10, note: '耶路撒冷三千年通史讲堂' },
    ],
    culturalProducts: [
      { name: '《犹太五讲》人手一册', desc: '小鸿团队自撰 · 摩西五经/塔木德/米德拉什/卡巴拉/哈西迪', emoji: '📖', tag: '人手一册', priceFrom: 108 },
      { name: '《塔木德精华》中希双语典藏本', desc: '摘录商道/家庭/传承章节的双语对照', emoji: '📜', tag: '典藏本', localStore: '耶路撒冷犹太书店', priceFrom: 380 },
      { name: '犹太 Menorah 七灯烛台(小型)', desc: '犹太文化最经典的文化符号, 银色/铜色', emoji: '🕎', tag: '文化象征', localStore: '耶路撒冷犹太区银器店', priceFrom: 680 },
      { name: '耶路撒冷石材名片夹', desc: '耶路撒冷本地石灰岩, 千年以色列古城建材', emoji: '🪨', tag: '当地材', localStore: '老城石材坊', priceFrom: 280 },
      { name: '手工 Kippah 犹太文化帽', desc: '耶路撒冷本地犹太工匠手作', emoji: '🧢', tag: '文化服饰', localStore: '犹太区小店', priceFrom: 120 },
    ],
    openingHoursBySeason: {
      spring: { open: '24h', close: '24h', note: '3-5 月最佳旅行季, 注意逾越节/复活节客流' },
      summer: { open: '24h', close: '24h', note: '6-8 月气温 30°C+, 早晚参观最佳' },
      autumn: { open: '24h', close: '24h', note: '9-11 月天气凉爽, 赎罪日期间老城清净' },
      winter: { open: '24h', close: '24h', note: '12-2 月气温 10°C, 可能降雪' },
    },
    visitorTipsGrouped: {
      transport: ['特拉维夫→耶路撒冷最便捷, 高速 1h', '老城区域严格限行, 专车至 Jaffa Gate', '老城内全程步行, 石板路较多'],
      dining: ['耶路撒冷严格 Kosher 餐饮文化', '推荐百年 Machneyuda 餐厅, 现代以色列菜', '周五晚到周六黄昏(Shabbat)大部分犹太店关门'],
      gear: ['男性: 哭墙前可佩戴小帽(入口免费提供 Kippah)', '女性: 长袖遮肩', '舒适步行鞋', '防晒帽(中东烈日)'],
      etiquette: ['哭墙前保持肃静', '男女分区祷告区', '勿背对哭墙拍照', '文化徽章: 非宗教 · 非以色列官方活动'],
    },
    localGuides: [
      { name: 'Dr. David Cohen', specialty: '耶路撒冷三千年通史', languages: ['希伯来语', '英语', '中文'], rating: 4.9, bio: '希伯来大学考古学博士, 耶路撒冷三大信仰史专家' },
      { name: 'Rabbi Sarah', specialty: '犹太塔木德 · 商道文化', languages: ['希伯来语', '英语'], rating: 4.8, bio: '犹太拉比学者, 讲塔木德与现代商业伦理' },
      { name: '王犹太老师', specialty: '华犹文化对比 · 中国犹太人', languages: ['中文', '英语', '希伯来语'], rating: 4.8, bio: '中国犹太文化研究会创始人, 长居以色列 20 年' },
    ],
    photoStory: [
      { caption: '哭墙全景', shotLocation: '哭墙广场', significance: '犹太文化最重要的物质遗产, 第二圣殿西墙残段, 已有 2000 年历史', order: 1 },
      { caption: '哭墙祈祷者', shotLocation: '哭墙男性区', significance: '千年来犹太人面对哭墙祈祷, 是犹太文化最核心的文化景观', order: 2 },
      { caption: '塞满纸条的墙缝', shotLocation: '哭墙砖缝', significance: '每年收到千万张写给上帝的纸条, 每年春秋两次由拉比收集后埋葬', order: 3 },
      { caption: '圣殿山金顶', shotLocation: '哭墙上方', significance: '犹太/基督/伊斯兰三大文化圣地重叠点, 现代最敏感的文化空间', order: 4 },
      { caption: '阿拉伯市场', shotLocation: '老城阿拉伯区', significance: '耶路撒冷三大文化交汇的最日常现场, 香料/古董/纪念品千年流转', order: 5 },
      { caption: '耶路撒冷日落', shotLocation: '橄榄山远眺', significance: '耶路撒冷最经典明信片视角, 老城金色夕阳, 千年来诗人画家灵感源', order: 6 },
    ],
  },

  // ════════ 12. 巴哈伊 · 海法空中花园 ════════
  {
    nameMatch: '海法空中花园',
    religionSlug: 'bahai',
    transportLegs: [
      { from: '特拉维夫本古里安机场', to: '海法市区', mode: '舒适商务车', distanceKm: 95, durationMin: 80, note: '沿以色列 2 号高速, 地中海右岸', costFrom: 500 },
      { from: '酒店', to: '空中花园山下广场', mode: '舒适商务车', distanceKm: 2, durationMin: 8, note: '从 Ben Gurion 大街山下入口' },
      { from: '山下入口', to: '巴孛陵园', mode: '徒步上山 / 观光车', distanceKm: 1.0, durationMin: 30, note: '18 级花园台阶, 徒步可感受建筑节奏' },
      { from: '巴孛陵园', to: '空中花园观景台', mode: '徒步', distanceKm: 0.3, durationMin: 10, note: '山顶俯瞰地中海最佳视角' },
      { from: '空中花园', to: '阿卡古城', mode: '舒适商务车', distanceKm: 18, durationMin: 25, note: '阿卡古城是联合国世界遗产, 哈伊文化第二站' },
    ],
    culturalProducts: [
      { name: '《巴哈伊五讲》人手一册', desc: '小鸿团队自撰 · 巴孛/巴哈欧拉/一体哲学/花园建筑等', emoji: '📖', tag: '人手一册', priceFrom: 78 },
      { name: '《隐言经》中波双语精选本', desc: '巴哈欧拉最重要的精短文本, 波斯语/中文对照', emoji: '📜', tag: '典藏本', localStore: '海法巴哈伊书店', priceFrom: 280 },
      { name: '海法空中花园明信片套装', desc: '18 级花园空中俯瞰摄影明信片 18 张', emoji: '📮', tag: '摄影艺术', localStore: '空中花园商店', priceFrom: 80 },
      { name: '以色列死海泥面膜套盒', desc: '死海矿物泥护肤, 以色列知名品牌', emoji: '💆', tag: '当地特色', localStore: '海法德国殖民区药妆店', priceFrom: 380 },
      { name: '玫瑰丝巾(花园纹样)', desc: '丝绸手绘, 空中花园最标志的玫瑰玫瑰图案', emoji: '🌹', tag: '手工艺', localStore: '海法手工艺市集', priceFrom: 480 },
    ],
    openingHoursBySeason: {
      spring: { open: '09:00', close: '17:00', note: '3-5 月最佳季, 玫瑰开放' },
      summer: { open: '09:00', close: '17:00', note: '6-8 月炎热, 早晨最舒适' },
      autumn: { open: '09:00', close: '17:00', note: '9-11 月温度适宜, 9 月春节游客多' },
      winter: { open: '09:00', close: '16:00', note: '12-2 月偶有阴雨' },
    },
    visitorTipsGrouped: {
      transport: ['特拉维夫→海法高速 1h20m', '海法市内有 Carmelit 地铁(以色列唯一地铁)', '18 级花园徒步建议上山乘车+下山步行'],
      dining: ['海法德国殖民区(Ben Gurion 大街)有多家精品餐厅', '以色列地中海菜: Shakshuka/Hummus/Falafel 代表', '周五晚至周六大部分餐厅关门'],
      gear: ['舒适步行鞋(花园 18 级台阶)', '遮阳帽(夏季)/轻便外套(冬季)', '相机(18 级花园是拍摄圣地)', '雨伞(冬季)'],
      etiquette: ['花园内勿大声喧哗', '巴孛陵园内勿使用闪光灯', '花园参观通常由巴哈伊志愿者免费带领(公益)', '文化徽章: 非宗教 · 非巴哈伊中枢官方活动'],
    },
    localGuides: [
      { name: 'David Levi', specialty: '巴哈伊近代文化史', languages: ['希伯来语', '英语', '波斯语'], rating: 4.9, bio: '海法巴哈伊世界中心志愿者 15 年, 讲 18 级花园建造史' },
      { name: 'Fatima Hassan', specialty: '巴哈伊建筑 · 花园设计', languages: ['阿拉伯语', '英语', '希伯来语'], rating: 4.8, bio: '以色列理工学院建筑博士, 研究空中花园建筑语言' },
      { name: '李巴哈伊老师', specialty: '中外文化比较 · 巴哈伊在中国', languages: ['中文', '英语'], rating: 4.8, bio: '中国巴哈伊文化研究者, 以色列长居 12 年' },
    ],
    photoStory: [
      { caption: '空中花园全景', shotLocation: '山顶观景台', significance: '18 级台阶花园从卡梅尔山脚直通山顶, 联合国世界文化遗产, 现代园林杰作', order: 1 },
      { caption: '巴孛陵园金顶', shotLocation: '花园中心', significance: '巴哈伊文化创始人巴孛的安息地, 金色穹顶象征光明, 1953 年建成', order: 2 },
      { caption: '玫瑰花坛', shotLocation: '18 级花园任一级', significance: '花园设计核心是几何对称, 每级玫瑰花坛排列完全一致, 对应"人类一体"哲学', order: 3 },
      { caption: '俯瞰海法港', shotLocation: '空中花园最高台阶', significance: '地中海最美港口之一, 花园与海景同框是海法经典视角', order: 4 },
      { caption: '阿卡古城', shotLocation: '海法东北 18 公里', significance: '巴哈欧拉被关押 12 年的地方, 巴哈伊文化第二大圣地, 世界遗产', order: 5 },
      { caption: '世界公义院', shotLocation: '花园顶端', significance: '巴哈伊文化全球行政中枢建筑, 古希腊建筑风格, 仅外围可观瞻', order: 6 },
    ],
  },
];

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  目的地++ v1 · Pilot · 12 旗舰目的地深度字段');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let updated = 0;
  let notFound = 0;

  for (const pilot of PILOTS) {
    const religion = await prisma.religion.findUnique({ where: { slug: pilot.religionSlug } });
    if (!religion) {
      console.log(`  ⚠ religion not found: ${pilot.religionSlug}`);
      notFound++;
      continue;
    }

    const site = await prisma.holySite.findFirst({
      where: { name: pilot.nameMatch, religionId: religion.id },
    });

    if (!site) {
      console.log(`  ⚠ site not found: ${pilot.nameMatch} (${pilot.religionSlug})`);
      notFound++;
      continue;
    }

    await prisma.holySite.update({
      where: { id: site.id },
      data: {
        transportLegs: pilot.transportLegs as unknown as Prisma.InputJsonValue,
        culturalProducts: pilot.culturalProducts as unknown as Prisma.InputJsonValue,
        openingHoursBySeason: pilot.openingHoursBySeason as unknown as Prisma.InputJsonValue,
        visitorTipsGrouped: pilot.visitorTipsGrouped as unknown as Prisma.InputJsonValue,
        localGuides: pilot.localGuides as unknown as Prisma.InputJsonValue,
        photoStory: pilot.photoStory as unknown as Prisma.InputJsonValue,
      },
    });

    console.log(
      `  ✓ ${pilot.nameMatch.padEnd(18, ' ')} (${pilot.religionSlug.padEnd(18, ' ')}) ` +
        `legs=${pilot.transportLegs.length} cp=${pilot.culturalProducts.length} ` +
        `seasons=${Object.keys(pilot.openingHoursBySeason).length} ` +
        `tips=${(pilot.visitorTipsGrouped.transport?.length ?? 0) + (pilot.visitorTipsGrouped.dining?.length ?? 0) + (pilot.visitorTipsGrouped.gear?.length ?? 0) + (pilot.visitorTipsGrouped.etiquette?.length ?? 0)} ` +
        `guides=${pilot.localGuides.length} photos=${pilot.photoStory.length}`,
    );
    updated++;
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  ✅ DONE: updated=${updated} / not_found=${notFound} / total=${PILOTS.length}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
