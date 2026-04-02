// ═══════════════════════════════════════════════════════════════════════════
// 伊斯兰先贤大图谱 — 25位先贤坐标 + 3位核心先贤人生轨迹数据
// Grand Islam Patriarch Atlas — Geographic & Journey Data
// ═══════════════════════════════════════════════════════════════════════════

import type { PatriarchMapData } from "@/components/atlas";

export const SCHOOL_COLORS: Record<string, string> = {
  逊尼派: "#059669",
  什叶派: "#10B981",
  苏菲派: "#34D399",
  伊巴德派: "#059669",
  艾什尔里学派: "#059669",
  马图里迪学派: "#059669",
  汉巴里学派: "#059669",
  沙斐仪学派: "#059669",
  马利基学派: "#059669",
  哈乃斐学派: "#059669",
};

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 1 — 3位核心先贤（完整人生轨迹）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── 1. 穆罕默德 (570-632) ────────────────────────────────────────────
  {
    name: "穆罕默德",
    nameEn: "Prophet Muhammad",
    school: "逊尼派",
    primaryLat: 21.42,
    primaryLng: 39.83,
    journeyWaypoints: [
      {
        lat: 21.42, lng: 39.83, year: 570, type: "birth",
        event: "诞生于麦加古莱什族哈希姆家族，幼年丧父丧母，由祖父阿卜杜勒·穆塔利布和叔父阿布·塔利布抚养长大",
        eventEn: "Born in Mecca to the Hashim clan of Quraysh. Orphaned early, raised by grandfather and uncle Abu Talib.",
      },
      {
        lat: 21.46, lng: 39.86, year: 610, type: "dharma",
        event: "在麦加东北希拉山洞（Hira Cave）冥想时，天使吉卜利勒降临传达真主启示，首降《古兰经》第96章「血块章」，从此受命为先知",
        eventEn: "Received first revelation from Angel Jibril in Cave Hira — Surah 96 Al-Alaq. Called to prophethood.",
      },
      {
        lat: 24.47, lng: 39.61, year: 622, type: "pilgrimage",
        event: "希吉拉（Hijra）——从麦加迁徙至麦地那（雅斯里布），建立第一个穆斯林社区与清真寺（先知清真寺），伊斯兰历法以此为纪元",
        eventEn: "The Hijra — migrated from Mecca to Medina (Yathrib), establishing the first Muslim community and mosque.",
      },
      {
        lat: 21.42, lng: 39.83, year: 630, type: "teaching",
        event: "率万名穆斯林和平收复麦加，清除天房（克尔白）中360座偶像，统一阿拉伯半岛各部落归于伊斯兰信仰",
        eventEn: "Conquered Mecca peacefully with 10,000 followers, cleansed the Kaaba of 360 idols, unifying Arabia under Islam.",
      },
      {
        lat: 24.47, lng: 39.61, year: 632, type: "death",
        event: "归真于麦地那，葬于先知清真寺（绿穹殿）。辞朝演说：「我给你们留下两件宝物——真主的经典和先知的圣训」",
        eventEn: "Passed in Medina, buried at the Prophet's Mosque (Green Dome). Farewell sermon: 'I leave you the Quran and Sunnah.'",
      },
    ],
  },

  // ── 2. 鲁米 (1207-1273) ─────────────────────────────────────────────
  {
    name: "鲁米",
    nameEn: "Jalal ad-Din Rumi",
    school: "苏菲派",
    primaryLat: 37.87,
    primaryLng: 32.48,
    journeyWaypoints: [
      {
        lat: 36.76, lng: 66.90, year: 1207, type: "birth",
        event: "诞生于大呼罗珊巴尔赫（今阿富汗境内），父亲巴哈丁·瓦拉德为著名神学家与苏菲导师，幼承家学",
        eventEn: "Born in Balkh (modern Afghanistan). Father Baha ud-Din Walad was a renowned theologian and Sufi master.",
      },
      {
        lat: 33.51, lng: 36.29, year: 1228, type: "pilgrimage",
        event: "随家人辗转西行避蒙古入侵，途经尼沙普尔会见阿塔尔，在大马士革从学伊本·阿拉比弟子，精研苏菲义理与教法学",
        eventEn: "Fled Mongol invasion westward, met Attar in Nishapur, studied Sufi theology in Damascus under disciples of Ibn Arabi.",
      },
      {
        lat: 37.87, lng: 32.48, year: 1244, type: "founding",
        event: "在科尼亚遇见游方苏菲行者舍姆斯·塔布里兹，灵魂觉醒，从此由学者转变为神秘诗人，创立梅夫拉维教团（旋转托钵僧教团），以旋转舞（萨玛）通向神圣合一",
        eventEn: "Met wandering dervish Shams-i-Tabrizi in Konya, spiritually transformed from scholar to mystic poet. Founded the Mevlevi Order (Whirling Dervishes).",
      },
      {
        lat: 37.87, lng: 32.48, year: 1273, type: "death",
        event: "归真于科尼亚，葬于梅夫拉那博物馆（绿色穹顶）。遗留巨著《玛斯纳维》六卷与《大迪万》抒情诗集，被誉为「爱的导师」",
        eventEn: "Passed in Konya, buried at the Mevlana Museum (Green Dome). Left the Masnavi and Divan-e Shams, known as 'Teacher of Love.'",
      },
    ],
  },

  // ── 3. 伊本·白图泰 (1304-1369) ──────────────────────────────────────
  {
    name: "伊本·白图泰",
    nameEn: "Ibn Battuta",
    school: "逊尼派",
    primaryLat: 35.78,
    primaryLng: -5.80,
    journeyWaypoints: [
      {
        lat: 35.78, lng: -5.80, year: 1304, type: "birth",
        event: "诞生于摩洛哥丹吉尔的柏柏尔学者家庭，自幼接受马利基学派教法教育，21岁立志朝觐麦加",
        eventEn: "Born in Tangier, Morocco to a Berber scholarly family. Educated in Maliki jurisprudence, set out for Hajj at 21.",
      },
      {
        lat: 21.42, lng: 39.83, year: 1326, type: "pilgrimage",
        event: "历经两年抵达麦加完成朝觐（哈吉），此后三十年间七次重返圣城，足迹遍及伊斯兰世界每一个角落",
        eventEn: "Reached Mecca after two years, completing Hajj. Returned seven times over thirty years, traveling the entire Islamic world.",
      },
      {
        lat: 28.61, lng: 77.21, year: 1334, type: "pilgrimage",
        event: "受德里苏丹穆罕默德·图格鲁克延聘为卡迪（伊斯兰法官），居留印度八年，见证德里苏丹国的辉煌与动荡",
        eventEn: "Appointed Qadi (Islamic judge) by Delhi Sultan Muhammad Tughluq. Spent eight years in India witnessing Sultanate's glory and turmoil.",
      },
      {
        lat: 24.87, lng: 118.68, year: 1346, type: "pilgrimage",
        event: "经海路抵达中国泉州（刺桐城），游历广州、杭州，记录元代中国穆斯林社区的繁荣商贸与清真寺建筑",
        eventEn: "Arrived in Quanzhou (Zaytun) by sea, visited Guangzhou and Hangzhou, documenting Yuan Dynasty Muslim communities and mosques.",
      },
      {
        lat: 34.03, lng: -5.00, year: 1354, type: "death",
        event: "归返摩洛哥非斯，应马林王朝苏丹之命口述旅行见闻，由伊本·朱扎伊整理为《旅行者的欢乐》（Rihla），记录44国12万公里行程",
        eventEn: "Returned to Fez, dictated his travels (Rihla) to Ibn Juzayy by order of the Marinid Sultan. Documented 44 countries and 120,000 km.",
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 2 — 其他先贤（坐标数据）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "阿布·伯克尔", nameEn: "Abu Bakr al-Siddiq", school: "逊尼派",
    primaryLat: 24.47, primaryLng: 39.61, journeyWaypoints: [],
  },
  {
    name: "欧麦尔", nameEn: "Umar ibn al-Khattab", school: "逊尼派",
    primaryLat: 24.47, primaryLng: 39.61, journeyWaypoints: [],
  },
  {
    name: "奥斯曼", nameEn: "Uthman ibn Affan", school: "逊尼派",
    primaryLat: 24.47, primaryLng: 39.61, journeyWaypoints: [],
  },
  {
    name: "阿里", nameEn: "Ali ibn Abi Talib", school: "什叶派",
    primaryLat: 32.62, primaryLng: 44.02, journeyWaypoints: [],
  },
  {
    name: "哈桑·巴士里", nameEn: "Hasan al-Basri", school: "苏菲派",
    primaryLat: 30.52, primaryLng: 47.78, journeyWaypoints: [],
  },
  {
    name: "伊玛目沙菲仪", nameEn: "Imam al-Shafi'i", school: "逊尼派",
    primaryLat: 30.04, primaryLng: 31.24, journeyWaypoints: [],
  },
  {
    name: "伊玛目马利克", nameEn: "Imam Malik ibn Anas", school: "逊尼派",
    primaryLat: 24.47, primaryLng: 39.61, journeyWaypoints: [],
  },
  {
    name: "伊玛目艾布·哈尼法", nameEn: "Imam Abu Hanifa", school: "逊尼派",
    primaryLat: 33.31, primaryLng: 44.37, journeyWaypoints: [],
  },
  {
    name: "伊玛目罕百里", nameEn: "Imam Ahmad ibn Hanbal", school: "逊尼派",
    primaryLat: 33.31, primaryLng: 44.37, journeyWaypoints: [],
  },
  {
    name: "安萨里", nameEn: "Al-Ghazali", school: "逊尼派",
    primaryLat: 36.27, primaryLng: 59.62, journeyWaypoints: [],
  },
  {
    name: "伊本·阿拉比", nameEn: "Ibn Arabi", school: "苏菲派",
    primaryLat: 37.39, primaryLng: -5.98, journeyWaypoints: [],
  },
  {
    name: "伊本·泰米叶", nameEn: "Ibn Taymiyyah", school: "逊尼派",
    primaryLat: 33.51, primaryLng: 36.29, journeyWaypoints: [],
  },
  {
    name: "伊本·赫勒敦", nameEn: "Ibn Khaldun", school: "逊尼派",
    primaryLat: 36.81, primaryLng: 10.17, journeyWaypoints: [],
  },
  {
    name: "萨拉丁", nameEn: "Saladin (Salah ad-Din)", school: "逊尼派",
    primaryLat: 33.51, primaryLng: 36.29, journeyWaypoints: [],
  },
  {
    name: "奥斯曼一世", nameEn: "Osman I", school: "逊尼派",
    primaryLat: 40.19, primaryLng: 29.06, journeyWaypoints: [],
  },
  {
    name: "法蒂玛", nameEn: "Fatimah al-Zahra", school: "什叶派",
    primaryLat: 24.47, primaryLng: 39.61, journeyWaypoints: [],
  },
  {
    name: "阿伊莎", nameEn: "Aisha bint Abu Bakr", school: "逊尼派",
    primaryLat: 24.47, primaryLng: 39.61, journeyWaypoints: [],
  },
  {
    name: "拉比亚", nameEn: "Rabia al-Adawiyya", school: "苏菲派",
    primaryLat: 30.52, primaryLng: 47.78, journeyWaypoints: [],
  },
  {
    name: "纳格什班迪", nameEn: "Baha-ud-Din Naqshband", school: "苏菲派",
    primaryLat: 39.65, primaryLng: 66.96, journeyWaypoints: [],
  },
  {
    name: "阿卜杜勒·卡迪尔·吉拉尼", nameEn: "Abdul Qadir Gilani", school: "苏菲派",
    primaryLat: 33.31, primaryLng: 44.37, journeyWaypoints: [],
  },
  {
    name: "穆罕默德·阿布都", nameEn: "Muhammad Abduh", school: "逊尼派",
    primaryLat: 30.04, primaryLng: 31.24, journeyWaypoints: [],
  },
  {
    name: "赛义德·库特布", nameEn: "Sayyid Qutb", school: "逊尼派",
    primaryLat: 30.04, primaryLng: 31.24, journeyWaypoints: [],
  },
];
