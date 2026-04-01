// ═══════════════════════════════════════════════════════════════════════════
// 禅宗祖师大图谱 — 63位祖师坐标 + 15位核心祖师人生轨迹数据
// Grand Zen Patriarch Atlas — Geographic & Journey Data
// ═══════════════════════════════════════════════════════════════════════════

export type WaypointType =
  | "birth"
  | "ordination"
  | "dharma"
  | "teaching"
  | "founding"
  | "pilgrimage"
  | "exile"
  | "death"
  | "other";

export interface JourneyWaypoint {
  lat: number;
  lng: number;
  year: number | null;
  yearEnd?: number;
  event: string;
  eventEn: string;
  type: WaypointType;
}

export interface PatriarchMapData {
  name: string;
  nameEn: string;
  school: string;
  primaryLat: number;
  primaryLng: number;
  journeyWaypoints: JourneyWaypoint[];
}

// School color mapping
export const SCHOOL_COLORS: Record<string, string> = {
  曹洞宗: "#C4A265",
  临济宗: "#E85D4A",
  云门宗: "#6BA368",
  法眼宗: "#5B8FD4",
  沩仰宗: "#D4A05B",
  日本曹洞宗: "#FF6B8A",
  日本临济宗: "#FF6B8A",
  韩国禅宗: "#4ECDC4",
  越南禅宗: "#FFD93D",
  西方禅宗: "#9B59B6",
};

export function getSchoolColor(school: string): string {
  return SCHOOL_COLORS[school] || "#C4A265";
}

// ═══════════════════════════════════════════════════════════════════════════
// 63位禅宗祖师完整坐标数据
// ═══════════════════════════════════════════════════════════════════════════

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 1 — 6位核心祖师（完整人生轨迹）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── 1. 六祖惠能 (638-713) ──────────────────────────────────────────────
  {
    name: "六祖惠能",
    nameEn: "Huineng, Sixth Patriarch",
    school: "曹洞宗",
    primaryLat: 24.82,
    primaryLng: 113.60,
    journeyWaypoints: [
      {
        lat: 22.70, lng: 112.05, year: 638, type: "birth",
        event: "出生于广东新州（今云浮新兴），樵夫之家，自幼丧父",
        eventEn: "Born in Xinzhou (modern Xinxing, Yunfu), Guangdong. Son of a woodcutter, lost father early.",
      },
      {
        lat: 30.20, lng: 115.95, year: 661, type: "dharma",
        event: "黄梅东山寺得法，五祖弘忍夜传衣钵，作偈「菩提本无树，明镜亦非台」",
        eventEn: "Received dharma at Dongshan Temple, Huangmei. Fifth Patriarch Hongren transmitted robe and bowl at night.",
      },
      {
        lat: 23.35, lng: 112.70, year: 661, yearEnd: 676, type: "exile",
        event: "四会隐修十五载，混迹猎人队中，「但吃肉边菜」",
        eventEn: "Hidden practice in Sihui for 15 years, living among hunters. 'I only eat vegetables beside the meat.'",
      },
      {
        lat: 23.13, lng: 113.26, year: 676, type: "ordination",
        event: "广州光孝寺剃度出家，印宗法师为之落发，「不是风动，不是幡动，仁者心动」",
        eventEn: "Ordained at Guangxiao Temple, Guangzhou. 'Neither the wind nor the banner moves — your mind moves.'",
      },
      {
        lat: 24.82, lng: 113.60, year: 677, yearEnd: 713, type: "teaching",
        event: "韶关南华寺弘法三十六年，说《坛经》，度弟子四十三人得法",
        eventEn: "Taught at Nanhua Temple, Shaoguan for 36 years. Delivered the Platform Sutra. 43 disciples attained dharma.",
      },
      {
        lat: 22.70, lng: 112.05, year: 713, type: "death",
        event: "圆寂于新兴国恩寺，「兀兀不修善，腾腾不造恶，寂寂断见闻，荡荡心无着」",
        eventEn: "Passed at Guoen Temple, Xinxing. 'Neither cultivating good, nor creating evil — mind unattached.'",
      },
    ],
  },

  // ── 2. 洞山良价 (807-869) ──────────────────────────────────────────────
  {
    name: "洞山良价",
    nameEn: "Dongshan Liangjie",
    school: "曹洞宗",
    primaryLat: 28.39,
    primaryLng: 114.78,
    journeyWaypoints: [
      {
        lat: 30.00, lng: 120.58, year: 807, type: "birth",
        event: "出生于会稽（今浙江绍兴），俗姓俞",
        eventEn: "Born in Kuaiji (modern Shaoxing, Zhejiang), surname Yu.",
      },
      {
        lat: 27.87, lng: 114.38, year: null, type: "dharma",
        event: "参云岩昙晟禅师得法，闻「如是如是」，过水睹影大悟，创五位君臣偈",
        eventEn: "Attained dharma under Yunyan Tansheng. Seeing his reflection crossing a stream, he was greatly awakened.",
      },
      {
        lat: 28.39, lng: 114.78, year: 860, type: "founding",
        event: "开山宜丰洞山，创曹洞宗，立五位君臣、偏正回互之旨",
        eventEn: "Founded monastery at Dongshan, Yifeng. Established Caodong school with Five Ranks doctrine.",
      },
      {
        lat: 28.39, lng: 114.78, year: 869, type: "death",
        event: "圆寂于洞山，嘱弟子「莫作空解」，谥号悟本禅师",
        eventEn: "Passed at Dongshan. Advised disciples: 'Do not cling to emptiness.' Posthumous title: Wuben Chanshi.",
      },
    ],
  },

  // ── 3. 曹山本寂 (840-901) ──────────────────────────────────────────────
  {
    name: "曹山本寂",
    nameEn: "Caoshan Benji",
    school: "曹洞宗",
    primaryLat: 27.55,
    primaryLng: 116.24,
    journeyWaypoints: [
      {
        lat: 24.90, lng: 118.59, year: 840, type: "birth",
        event: "出生于泉州莆田，俗姓黄",
        eventEn: "Born in Putian, Quanzhou, Fujian. Surname Huang.",
      },
      {
        lat: 28.39, lng: 114.78, year: null, type: "dharma",
        event: "参洞山良价得法，深悟五位偏正回互之旨",
        eventEn: "Attained dharma under Dongshan Liangjie. Deeply understood the Five Ranks.",
      },
      {
        lat: 27.55, lng: 116.24, year: 870, type: "founding",
        event: "开山宜黄曹山，与洞山并称「曹洞」，完善五位君臣理论",
        eventEn: "Founded Caoshan monastery in Yihuang. Together with Dongshan, named 'Caodong' school.",
      },
      {
        lat: 27.55, lng: 116.24, year: 901, type: "death",
        event: "圆寂于曹山，世寿六十二，谥号元证禅师",
        eventEn: "Passed at Caoshan, aged 62. Posthumous title: Yuanzheng Chanshi.",
      },
    ],
  },

  // ── 4. 虚云古岩 (1840-1959) ────────────────────────────────────────────
  {
    name: "虚云古岩",
    nameEn: "Xu Yun (Empty Cloud)",
    school: "曹洞宗",
    primaryLat: 29.10,
    primaryLng: 115.55,
    journeyWaypoints: [
      {
        lat: 24.90, lng: 118.59, year: 1840, type: "birth",
        event: "出生于福建泉州，俗姓萧，父为官宦",
        eventEn: "Born in Quanzhou, Fujian. Surname Xiao, from an official family.",
      },
      {
        lat: 26.05, lng: 119.40, year: 1858, type: "ordination",
        event: "鼓山涌泉寺出家，法名古岩，字德清",
        eventEn: "Ordained at Gushan Yongquan Temple, Fuzhou. Dharma name: Guyan.",
      },
      {
        lat: 30.00, lng: 122.39, year: 1882, type: "pilgrimage",
        event: "从普陀山起香，三步一拜朝五台山，历时三年",
        eventEn: "Set out from Putuo Mountain, prostrating every three steps to Wutai Mountain. Journey took 3 years.",
      },
      {
        lat: 39.08, lng: 113.58, year: 1884, type: "pilgrimage",
        event: "抵达五台山，感文殊菩萨化身文吉相救",
        eventEn: "Arrived at Wutai Mountain. Saved by Manjushri manifesting as the beggar Wenji.",
      },
      {
        lat: 25.97, lng: 100.35, year: 1903, type: "founding",
        event: "重兴云南鸡足山祝圣寺",
        eventEn: "Restored Zhusheng Temple on Jizu Mountain, Yunnan.",
      },
      {
        lat: 24.82, lng: 113.60, year: 1934, type: "founding",
        event: "重修韶关南华寺，恢复六祖道场",
        eventEn: "Rebuilt Nanhua Temple, Shaoguan — restoring the Sixth Patriarch's monastery.",
      },
      {
        lat: 24.68, lng: 113.05, year: 1943, type: "founding",
        event: "重兴韶关乳源云门寺，复云门宗法脉",
        eventEn: "Restored Yunmen Temple, Ruyuan — reviving the Yunmen school lineage.",
      },
      {
        lat: 29.10, lng: 115.55, year: 1953, yearEnd: 1959, type: "teaching",
        event: "驻锡江西永修云居山真如禅寺，一百二十岁圆寂，一身兼承五宗法脉",
        eventEn: "Resided at Zhenru Temple, Yunju Mountain. Passed at 120, holding all five Zen lineages simultaneously.",
      },
    ],
  },

  // ── 5. 道元禅師 (1200-1253) ────────────────────────────────────────────
  {
    name: "道元禅師",
    nameEn: "Dōgen Zenji",
    school: "日本曹洞宗",
    primaryLat: 36.09,
    primaryLng: 136.35,
    journeyWaypoints: [
      {
        lat: 35.01, lng: 135.77, year: 1200, type: "birth",
        event: "出生于京都贵族之家，三岁丧父，八岁丧母",
        eventEn: "Born in Kyoto to a noble family. Lost father at 3, mother at 8.",
      },
      {
        lat: 29.80, lng: 121.55, year: 1223, yearEnd: 1227, type: "dharma",
        event: "入宋求法，在天童山从天童如净禅师学禅，得「身心脱落」之悟",
        eventEn: "Traveled to Song China. Studied under Tiantong Rujing at Tiantong Mountain. Attained 'dropping off body and mind.'",
      },
      {
        lat: 34.89, lng: 135.80, year: 1233, type: "founding",
        event: "开创兴圣寺（宇治），著《正法眼藏》，弘「只管打坐」",
        eventEn: "Founded Kōshō-ji in Uji. Wrote Shōbōgenzō. Taught 'just sitting' (shikantaza).",
      },
      {
        lat: 36.09, lng: 136.35, year: 1244, type: "founding",
        event: "开山永平寺（福井），日本曹洞宗大本山，至今为宗门中心",
        eventEn: "Founded Eihei-ji in Fukui — the head temple of Japanese Soto Zen to this day.",
      },
      {
        lat: 35.01, lng: 135.77, year: 1253, type: "death",
        event: "圆寂于京都，世寿五十四，遗偈「五十四年照第一天，打个筋斗触破大千」",
        eventEn: "Passed in Kyoto, aged 54. 'For 54 years, illuminating the first heaven. One somersault shatters the universe.'",
      },
    ],
  },

  // ── 6. 临济义玄 (?-866) ────────────────────────────────────────────────
  {
    name: "临济义玄",
    nameEn: "Linji Yixuan",
    school: "临济宗",
    primaryLat: 38.14,
    primaryLng: 114.57,
    journeyWaypoints: [
      {
        lat: 35.24, lng: 115.44, year: null, type: "birth",
        event: "出生于曹州南华（今山东菏泽），俗姓邢",
        eventEn: "Born in Nanhua, Caozhou (modern Heze, Shandong). Surname Xing.",
      },
      {
        lat: 28.72, lng: 115.95, year: null, type: "dharma",
        event: "参黄檗希运禅师，三度问法三度被打，后大悟「佛法无多子」",
        eventEn: "Studied under Huangbo Xiyun. Asked three times, struck three times. Then awakened: 'There's not much to Buddha-dharma.'",
      },
      {
        lat: 38.14, lng: 114.57, year: 854, type: "founding",
        event: "驻锡河北正定临济寺，创临济宗，以棒喝接引学人",
        eventEn: "Resided at Linji Temple, Zhengding, Hebei. Founded Linji school. Used shouts and blows to teach.",
      },
      {
        lat: 38.14, lng: 114.57, year: 866, type: "death",
        event: "圆寂于临济寺，谥号慧照禅师，「临济喝」震古烁今",
        eventEn: "Passed at Linji Temple. Posthumous title: Huizhao Chanshi. His 'Linji Shout' echoes through the ages.",
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 2 — 9位重要祖师（完整人生轨迹）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── 7. 达摩祖师 (?-536) ────────────────────────────────────────────────
  {
    name: "菩提达摩",
    nameEn: "Bodhidharma",
    school: "曹洞宗",
    primaryLat: 34.51,
    primaryLng: 112.95,
    journeyWaypoints: [
      {
        lat: 11.02, lng: 76.95, year: null, type: "birth",
        event: "出生于南天竺（今印度南部），刹帝利种姓，为香至国三王子",
        eventEn: "Born in South India, Kshatriya caste. Third prince of Pallava kingdom.",
      },
      {
        lat: 23.13, lng: 113.26, year: 527, type: "pilgrimage",
        event: "航海至广州，梁武帝问「何为功德」，答「净智妙圆，体自空寂，如是功德，不以世求」",
        eventEn: "Arrived in Guangzhou by sea. Emperor Wu asked about merit. 'True merit is empty and wondrous — not sought through worldly deeds.'",
      },
      {
        lat: 34.51, lng: 112.95, year: 527, type: "teaching",
        event: "一苇渡江至嵩山少林寺，面壁九年，等「一花开五叶」之机",
        eventEn: "Crossed the Yangtze on a reed to Shaolin Temple, Mount Song. Faced the wall for 9 years.",
      },
      {
        lat: 34.51, lng: 112.95, year: 536, type: "death",
        event: "圆寂后只履西归，「吾本来兹土，传法救迷情，一花开五叶，结果自然成」",
        eventEn: "After passing, seen walking west with one sandal. 'One flower opens five petals, bearing fruit naturally.'",
      },
    ],
  },

  // ── 8. 云居道膺 (835-902) ──────────────────────────────────────────────
  {
    name: "云居道膺",
    nameEn: "Yunju Daoying",
    school: "曹洞宗",
    primaryLat: 29.10,
    primaryLng: 115.55,
    journeyWaypoints: [
      {
        lat: 30.30, lng: 120.15, year: 835, type: "birth",
        event: "出生于浙江幽州，俗姓王",
        eventEn: "Born in Youzhou, Zhejiang. Surname Wang.",
      },
      {
        lat: 28.39, lng: 114.78, year: null, type: "dharma",
        event: "参洞山良价得法，为曹洞宗命脉唯一传人",
        eventEn: "Attained dharma under Dongshan Liangjie. Sole surviving lineage holder of Caodong school.",
      },
      {
        lat: 29.10, lng: 115.55, year: 880, type: "founding",
        event: "开山江西永修云居山，建真如禅寺，道场延续至今",
        eventEn: "Founded monastery on Yunju Mountain, Yongxiu. Zhenru Temple continues to this day.",
      },
    ],
  },

  // ── 9. 宏智正觉 (1091-1157) ────────────────────────────────────────────
  {
    name: "宏智正觉",
    nameEn: "Hongzhi Zhengjue",
    school: "曹洞宗",
    primaryLat: 29.80,
    primaryLng: 121.55,
    journeyWaypoints: [
      {
        lat: 35.10, lng: 114.35, year: 1091, type: "birth",
        event: "出生于隰州（今山西隰县），俗姓李",
        eventEn: "Born in Xizhou (modern Xixian, Shanxi). Surname Li.",
      },
      {
        lat: 29.80, lng: 121.55, year: 1129, yearEnd: 1157, type: "teaching",
        event: "驻锡天童山景德寺三十年，系统化「默照禅」，与大慧宗杲「看话禅」并为宋代禅门双璧",
        eventEn: "Presided over Tiantong Jingde Temple for 30 years. Systematized 'Silent Illumination' meditation.",
      },
      {
        lat: 29.80, lng: 121.55, year: 1157, type: "death",
        event: "圆寂于天童山，世寿六十七，著《默照铭》《坐禅箴》",
        eventEn: "Passed at Tiantong Mountain, aged 67. Authored 'Inscription on Silent Illumination.'",
      },
    ],
  },

  // ── 10. 天童如净 (1163-1228) ───────────────────────────────────────────
  {
    name: "天童如净",
    nameEn: "Tiantong Rujing",
    school: "曹洞宗",
    primaryLat: 29.80,
    primaryLng: 121.55,
    journeyWaypoints: [
      {
        lat: 31.30, lng: 121.50, year: 1163, type: "birth",
        event: "出生于明州（今浙江），早年遍参诸方",
        eventEn: "Born in Mingzhou (modern Zhejiang). Traveled extensively in his youth.",
      },
      {
        lat: 29.80, lng: 121.55, year: 1224, type: "teaching",
        event: "住持天童山景德寺，力倡纯粹坐禅，反对公案文字禅",
        eventEn: "Became abbot of Tiantong Jingde Temple. Advocated pure zazen, opposed literary koan practice.",
      },
      {
        lat: 29.80, lng: 121.55, year: 1225, type: "dharma",
        event: "传法日本道元禅师，一句「身心脱落」令道元大悟，曹洞法脉由此东渡",
        eventEn: "Transmitted dharma to Japanese monk Dōgen. 'Dropping off body and mind' — Caodong dharma crossed to Japan.",
      },
    ],
  },

  // ── 11. 云门文偃 (864-949) ─────────────────────────────────────────────
  {
    name: "云门文偃",
    nameEn: "Yunmen Wenyan",
    school: "云门宗",
    primaryLat: 24.68,
    primaryLng: 113.05,
    journeyWaypoints: [
      {
        lat: 31.30, lng: 121.47, year: 864, type: "birth",
        event: "出生于嘉兴（今浙江），俗姓张",
        eventEn: "Born in Jiaxing, Zhejiang. Surname Zhang.",
      },
      {
        lat: 24.80, lng: 113.40, year: null, type: "dharma",
        event: "参雪峰义存得法，过门被夹折脚而大悟",
        eventEn: "Attained dharma under Xuefeng Yicun. Awakened when his leg was caught in a closing door.",
      },
      {
        lat: 24.68, lng: 113.05, year: 923, type: "founding",
        event: "开山韶州云门山大觉禅寺，创云门宗，以「一字关」「函盖乾坤」著称",
        eventEn: "Founded Dajue Temple on Yunmen Mountain. Established Yunmen school, famous for 'one-word barriers.'",
      },
      {
        lat: 24.68, lng: 113.05, year: 949, type: "death",
        event: "圆寂于云门山，舌根不坏，全身供养，世寿八十六",
        eventEn: "Passed at Yunmen Mountain, aged 86. Tongue relic remained intact.",
      },
    ],
  },

  // ── 12. 沩山灵祐 (771-853) ─────────────────────────────────────────────
  {
    name: "沩山灵祐",
    nameEn: "Guishan Lingyou",
    school: "沩仰宗",
    primaryLat: 27.75,
    primaryLng: 111.80,
    journeyWaypoints: [
      {
        lat: 26.08, lng: 119.30, year: 771, type: "birth",
        event: "出生于福州长溪，俗姓赵",
        eventEn: "Born in Changxi, Fuzhou. Surname Zhao.",
      },
      {
        lat: 28.23, lng: 112.94, year: null, type: "dharma",
        event: "参百丈怀海得法，百丈以「拨炉见火」印可",
        eventEn: "Attained dharma under Baizhang Huaihai. Baizhang confirmed him by 'poking the furnace to find fire.'",
      },
      {
        lat: 27.75, lng: 111.80, year: 820, type: "founding",
        event: "开山湖南沩山密印寺，与仰山慧寂共创沩仰宗",
        eventEn: "Founded Miyin Temple on Mount Gui, Hunan. Co-founded Guiyang school with Yangshan Huiji.",
      },
    ],
  },

  // ── 13. 法眼文益 (885-958) ─────────────────────────────────────────────
  {
    name: "法眼文益",
    nameEn: "Fayan Wenyi",
    school: "法眼宗",
    primaryLat: 32.06,
    primaryLng: 118.80,
    journeyWaypoints: [
      {
        lat: 30.30, lng: 120.15, year: 885, type: "birth",
        event: "出生于余杭（今浙江杭州），俗姓鲁",
        eventEn: "Born in Yuhang (modern Hangzhou, Zhejiang). Surname Lu.",
      },
      {
        lat: 24.50, lng: 117.65, year: null, type: "dharma",
        event: "参罗汉桂琛得法，闻「不知最亲切」而大悟",
        eventEn: "Attained dharma under Luohan Guichen. Awakened upon hearing 'not-knowing is most intimate.'",
      },
      {
        lat: 32.06, lng: 118.80, year: 937, type: "founding",
        event: "驻锡南京清凉寺，创法眼宗，融华严入禅，提出六相圆融",
        eventEn: "Resided at Qingliang Temple, Nanjing. Founded Fayan school, integrating Huayan philosophy into Zen.",
      },
    ],
  },

  // ── 14. 明庵栄西 (1141-1215) ───────────────────────────────────────────
  {
    name: "明庵栄西",
    nameEn: "Myōan Eisai",
    school: "日本临济宗",
    primaryLat: 35.00,
    primaryLng: 135.77,
    journeyWaypoints: [
      {
        lat: 34.67, lng: 133.92, year: 1141, type: "birth",
        event: "出生于备中国（今冈山县），神官之家",
        eventEn: "Born in Bitchū Province (modern Okayama), to a Shinto priest family.",
      },
      {
        lat: 29.80, lng: 121.55, year: 1168, type: "pilgrimage",
        event: "第一次入宋求法，参天台山",
        eventEn: "First trip to Song China. Visited Mount Tiantai.",
      },
      {
        lat: 29.88, lng: 121.67, year: 1187, yearEnd: 1191, type: "dharma",
        event: "第二次入宋，从虚庵怀敞得临济黄龙派法脉，携茶种回日本",
        eventEn: "Second trip to China. Received Linji-Huanglong lineage from Xuan Huaichang. Brought tea seeds to Japan.",
      },
      {
        lat: 35.00, lng: 135.77, year: 1202, type: "founding",
        event: "开创建仁寺（京都），日本最初之禅寺，著《兴禅护国论》《喫茶养生记》",
        eventEn: "Founded Kennin-ji in Kyoto — Japan's first Zen temple. Wrote treatises on Zen and tea.",
      },
    ],
  },

  // ── 15. 鈴木俊隆 (1904-1971) ──────────────────────────────────────────
  {
    name: "鈴木俊隆",
    nameEn: "Shunryū Suzuki",
    school: "西方禅宗",
    primaryLat: 37.77,
    primaryLng: -122.42,
    journeyWaypoints: [
      {
        lat: 34.98, lng: 138.38, year: 1904, type: "birth",
        event: "出生于静冈县，父亲为曹洞宗住持",
        eventEn: "Born in Shizuoka Prefecture. Father was a Soto Zen priest.",
      },
      {
        lat: 35.45, lng: 136.76, year: 1925, type: "ordination",
        event: "�的驹�的大学学习，师从曹洞宗玉渓沢木兴道老师",
        eventEn: "Studied at Komazawa University. Trained under Gyokujun So-on, a Soto Zen master.",
      },
      {
        lat: 37.77, lng: -122.42, year: 1959, type: "founding",
        event: "赴美创立旧金山禅中心，著《禅者的初心》，影响整个西方禅宗运动",
        eventEn: "Moved to San Francisco. Founded SF Zen Center. 'Zen Mind, Beginner's Mind' transformed Western Zen.",
      },
      {
        lat: 37.77, lng: -122.42, year: 1971, type: "death",
        event: "圆寂于旧金山，传法弟子理查德·贝克，禅中心延续至今",
        eventEn: "Passed in San Francisco. Transmitted dharma to Richard Baker. SF Zen Center continues today.",
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 其余48位祖师（仅primaryLat/primaryLng，无详细轨迹）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── 曹洞宗传承 ─────────────────────────────────────────────────────────
  { name: "同安道丕", nameEn: "Tongan Daobi", school: "曹洞宗", primaryLat: 28.68, primaryLng: 115.89, journeyWaypoints: [] },
  { name: "同安观志", nameEn: "Tongan Guanzhi", school: "曹洞宗", primaryLat: 28.68, primaryLng: 115.89, journeyWaypoints: [] },
  { name: "梁山缘观", nameEn: "Liangshan Yuanguan", school: "曹洞宗", primaryLat: 31.73, primaryLng: 107.50, journeyWaypoints: [] },
  { name: "大阳警玄", nameEn: "Dayang Jingxuan", school: "曹洞宗", primaryLat: 33.77, primaryLng: 112.52, journeyWaypoints: [] },
  { name: "投子义青", nameEn: "Touzi Yiqing", school: "曹洞宗", primaryLat: 30.63, primaryLng: 117.05, journeyWaypoints: [] },
  { name: "芙蓉道楷", nameEn: "Furong Daokai", school: "曹洞宗", primaryLat: 34.79, primaryLng: 114.31, journeyWaypoints: [] },
  { name: "丹霞子淳", nameEn: "Dantsia Zichun", school: "曹洞宗", primaryLat: 25.04, primaryLng: 113.73, journeyWaypoints: [] },
  { name: "长芦真歇清了", nameEn: "Changlu Zhenxie Qingliao", school: "曹洞宗", primaryLat: 30.37, primaryLng: 120.10, journeyWaypoints: [] },
  { name: "天童宗珏", nameEn: "Tiantong Zongjue", school: "曹洞宗", primaryLat: 29.80, primaryLng: 121.55, journeyWaypoints: [] },
  { name: "雪窦智鉴", nameEn: "Xuedou Zhijian", school: "曹洞宗", primaryLat: 29.75, primaryLng: 121.22, journeyWaypoints: [] },
  { name: "鹿门自觉", nameEn: "Lumen Zijue", school: "曹洞宗", primaryLat: 31.95, primaryLng: 112.13, journeyWaypoints: [] },
  { name: "青州普照一辩", nameEn: "Qingzhou Puzhao Yibian", school: "曹洞宗", primaryLat: 36.70, primaryLng: 118.48, journeyWaypoints: [] },
  { name: "大明僧宝", nameEn: "Daming Sengbao", school: "曹洞宗", primaryLat: 36.70, primaryLng: 118.48, journeyWaypoints: [] },
  { name: "玉山师体", nameEn: "Yushan Shiti", school: "曹洞宗", primaryLat: 28.68, primaryLng: 118.25, journeyWaypoints: [] },
  { name: "雪岩慧满", nameEn: "Xueyan Huiman", school: "曹洞宗", primaryLat: 30.27, primaryLng: 120.16, journeyWaypoints: [] },
  { name: "万松行秀", nameEn: "Wansong Xingxiu", school: "曹洞宗", primaryLat: 39.90, primaryLng: 116.40, journeyWaypoints: [] },
  { name: "长芦了性", nameEn: "Changlu Liaoxing", school: "曹洞宗", primaryLat: 30.37, primaryLng: 120.10, journeyWaypoints: [] },
  { name: "雪庭福裕", nameEn: "Xueting Fuyu", school: "曹洞宗", primaryLat: 34.51, primaryLng: 112.95, journeyWaypoints: [] },
  { name: "宗镜宗书", nameEn: "Zongjing Zongshu", school: "曹洞宗", primaryLat: 34.51, primaryLng: 112.95, journeyWaypoints: [] },
  { name: "廪山常忠", nameEn: "Linshan Changzhong", school: "曹洞宗", primaryLat: 27.80, primaryLng: 114.40, journeyWaypoints: [] },
  { name: "无明慧经", nameEn: "Wuming Huijing", school: "曹洞宗", primaryLat: 27.80, primaryLng: 114.40, journeyWaypoints: [] },
  { name: "永觉元贤", nameEn: "Yongjue Yuanxian", school: "曹洞宗", primaryLat: 26.05, primaryLng: 119.40, journeyWaypoints: [] },
  { name: "为霖道霈", nameEn: "Weilin Daopei", school: "曹洞宗", primaryLat: 26.05, primaryLng: 119.40, journeyWaypoints: [] },
  { name: "惟静道安", nameEn: "Weijing Daoan", school: "曹洞宗", primaryLat: 26.05, primaryLng: 119.40, journeyWaypoints: [] },
  { name: "恒涛大心", nameEn: "Hengtao Daxin", school: "曹洞宗", primaryLat: 26.05, primaryLng: 119.40, journeyWaypoints: [] },
  { name: "圆玉兴五", nameEn: "Yuanyu Xingwu", school: "曹洞宗", primaryLat: 26.05, primaryLng: 119.40, journeyWaypoints: [] },
  { name: "象先法印", nameEn: "Xiangxian Fayin", school: "曹洞宗", primaryLat: 26.05, primaryLng: 119.40, journeyWaypoints: [] },
  { name: "淡然法文", nameEn: "Danran Fawen", school: "曹洞宗", primaryLat: 26.05, primaryLng: 119.40, journeyWaypoints: [] },
  { name: "堂敏法澹", nameEn: "Tangmin Fadan", school: "曹洞宗", primaryLat: 26.05, primaryLng: 119.40, journeyWaypoints: [] },
  { name: "遍照兴隆", nameEn: "Bianzhao Xinglong", school: "曹洞宗", primaryLat: 26.05, primaryLng: 119.40, journeyWaypoints: [] },
  { name: "鼎峰耀成", nameEn: "Dingfeng Yaocheng", school: "曹洞宗", primaryLat: 26.05, primaryLng: 119.40, journeyWaypoints: [] },
  { name: "圆瑛宏悟", nameEn: "Yuanying Hongwu", school: "曹洞宗", primaryLat: 26.05, primaryLng: 119.40, journeyWaypoints: [] },

  // ── 五家七宗其他祖师 ───────────────────────────────────────────────────
  { name: "大慧宗杲", nameEn: "Dahui Zonggao", school: "临济宗", primaryLat: 30.29, primaryLng: 120.16, journeyWaypoints: [] },
  { name: "仰山慧寂", nameEn: "Yangshan Huiji", school: "沩仰宗", primaryLat: 27.62, primaryLng: 114.10, journeyWaypoints: [] },

  // ── 海外禅宗祖师 ───────────────────────────────────────────────────────
  // 日本
  { name: "大燈国師宗峰妙超", nameEn: "Shūhō Myōchō (Daitō Kokushi)", school: "日本临济宗", primaryLat: 35.04, primaryLng: 135.74, journeyWaypoints: [] },
  { name: "白隠慧鶴", nameEn: "Hakuin Ekaku", school: "日本临济宗", primaryLat: 35.10, primaryLng: 138.95, journeyWaypoints: [] },
  { name: "瑩山紹瑾", nameEn: "Keizan Jōkin", school: "日本曹洞宗", primaryLat: 37.07, primaryLng: 136.96, journeyWaypoints: [] },
  { name: "一休宗純", nameEn: "Ikkyū Sōjun", school: "日本临济宗", primaryLat: 34.83, primaryLng: 135.78, journeyWaypoints: [] },
  { name: "千利休", nameEn: "Sen no Rikyū", school: "日本临济宗", primaryLat: 34.69, primaryLng: 135.50, journeyWaypoints: [] },
  { name: "良寛", nameEn: "Ryōkan Taigu", school: "日本曹洞宗", primaryLat: 37.70, primaryLng: 138.95, journeyWaypoints: [] },
  { name: "前角博雄", nameEn: "Taizan Maezumi", school: "日本曹洞宗", primaryLat: 34.05, primaryLng: -118.24, journeyWaypoints: [] },
  // 韩国
  { name: "知訥", nameEn: "Jinul (Bojo Guksa)", school: "韩国禅宗", primaryLat: 35.00, primaryLng: 127.10, journeyWaypoints: [] },
  { name: "休静", nameEn: "Hyujeong (Seosan Daesa)", school: "韩国禅宗", primaryLat: 38.47, primaryLng: 128.52, journeyWaypoints: [] },
  { name: "性徹", nameEn: "Seongcheol", school: "韩国禅宗", primaryLat: 35.80, primaryLng: 128.10, journeyWaypoints: [] },
  { name: "崇山行願", nameEn: "Seung Sahn", school: "韩国禅宗", primaryLat: 42.35, primaryLng: -71.06, journeyWaypoints: [] },
  // 越南
  { name: "毘尼多羅支", nameEn: "Vinitaruci", school: "越南禅宗", primaryLat: 21.03, primaryLng: 105.85, journeyWaypoints: [] },
  { name: "草堂", nameEn: "Thảo Đường", school: "越南禅宗", primaryLat: 21.03, primaryLng: 105.85, journeyWaypoints: [] },
  { name: "竹林大士", nameEn: "Trần Nhân Tông", school: "越南禅宗", primaryLat: 21.05, primaryLng: 106.72, journeyWaypoints: [] },
  { name: "一行禅师", nameEn: "Thích Nhất Hạnh", school: "越南禅宗", primaryLat: 43.74, primaryLng: 3.28, journeyWaypoints: [] },
  // 西方
  { name: "菲利普·凯普洛", nameEn: "Philip Kapleau", school: "西方禅宗", primaryLat: 43.16, primaryLng: -77.61, journeyWaypoints: [] },
  { name: "罗伯特·艾特肯", nameEn: "Robert Aitken", school: "西方禅宗", primaryLat: 21.31, primaryLng: -157.86, journeyWaypoints: [] },
  { name: "夏绿蒂·净慧·贝克", nameEn: "Charlotte Joko Beck", school: "西方禅宗", primaryLat: 32.72, primaryLng: -117.16, journeyWaypoints: [] },
];
