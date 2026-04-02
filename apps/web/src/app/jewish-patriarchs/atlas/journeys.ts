// ═══════════════════════════════════════════════════════════════════════════
// 犹太教先知大图谱 — 25位先知坐标 + 3位核心先知人生轨迹数据
// Grand Jewish Patriarchs Atlas — Geographic & Journey Data
// ═══════════════════════════════════════════════════════════════════════════

import type { PatriarchMapData } from "@/components/atlas";

// School color mapping
export const SCHOOL_COLORS: Record<string, string> = {
  圣经时代: "#6366F1",
  拉比时代: "#818CF8",
  中世纪: "#A5B4FC",
  哈西德派: "#C7D2FE",
  现代正统: "#4F46E5",
  改革派: "#4338CA",
  保守派: "#3730A3",
};

export function getSchoolColor(school: string): string {
  return SCHOOL_COLORS[school] || "#6366F1";
}

// ═══════════════════════════════════════════════════════════════════════════
// 25位犹太教先知完整坐标数据
// ═══════════════════════════════════════════════════════════════════════════

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 1 — 3位核心先知（完整人生轨迹）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── 1. 亚伯拉罕 (~2000BC) ──────────────────────────────────────────────
  {
    name: "亚伯拉罕",
    nameEn: "Abraham",
    school: "圣经时代",
    primaryLat: 31.78,
    primaryLng: 35.24,
    journeyWaypoints: [
      {
        lat: 30.96, lng: 46.10, year: -2000, type: "birth",
        event: "出生于美索不达米亚乌尔城，迦勒底人之后，原名亚伯兰",
        eventEn: "Born in Ur of the Chaldees, Mesopotamia. Originally named Abram.",
      },
      {
        lat: 36.87, lng: 39.03, year: -1950, type: "pilgrimage",
        event: "随父他拉迁居哈兰，在此蒙上帝呼召：「你要离开本地、本族、父家」",
        eventEn: "Moved to Haran with father Terah. Received God's call: 'Leave your country, your people, your father's household.'",
      },
      {
        lat: 31.78, lng: 35.24, year: -1925, type: "founding",
        event: "进入迦南地，与上帝立约，受应许「我必叫你成为大国」，改名亚伯拉罕",
        eventEn: "Entered Canaan, made covenant with God. Promised 'I will make you a great nation.' Renamed Abraham.",
      },
      {
        lat: 30.04, lng: 31.24, year: -1920, type: "pilgrimage",
        event: "因饥荒暂居埃及，后返回迦南，信仰更加坚定",
        eventEn: "Sojourned in Egypt due to famine, later returned to Canaan with strengthened faith.",
      },
      {
        lat: 31.53, lng: 35.10, year: -1860, type: "death",
        event: "安葬于希伯仑麦比拉洞，享寿一百七十五岁，为以色列、阿拉伯共同的信仰之父",
        eventEn: "Buried in the Cave of Machpelah, Hebron. Lived 175 years. Father of faith for Israel and the Arab nations.",
      },
    ],
  },

  // ── 2. 摩西 (~1300BC) ──────────────────────────────────────────────
  {
    name: "摩西",
    nameEn: "Moses",
    school: "圣经时代",
    primaryLat: 28.55,
    primaryLng: 33.97,
    journeyWaypoints: [
      {
        lat: 30.04, lng: 31.24, year: -1300, type: "birth",
        event: "出生于埃及，利未族人，被法老女儿收养于王宫，习埃及一切学问",
        eventEn: "Born in Egypt, tribe of Levi. Adopted by Pharaoh's daughter, educated in all the wisdom of Egypt.",
      },
      {
        lat: 28.55, lng: 33.97, year: -1260, type: "dharma",
        event: "何烈山（西奈山）遇燃烧荆棘，上帝显现：「我是自有永有的」，蒙召带领以色列人出埃及",
        eventEn: "Encountered the burning bush at Horeb. God revealed: 'I AM WHO I AM.' Called to lead Israel out of Egypt.",
      },
      {
        lat: 28.55, lng: 33.97, year: -1250, type: "founding",
        event: "西奈山顶四十昼夜领受十诫与律法，与上帝立西奈之约，奠定犹太教律法根基",
        eventEn: "Received the Ten Commandments and Torah on Mount Sinai over 40 days. Established the Sinai Covenant, foundation of Jewish law.",
      },
      {
        lat: 30.60, lng: 34.80, year: -1250, yearEnd: -1210, type: "pilgrimage",
        event: "率以色列人旷野漂泊四十年，经历吗哪降下、磐石出水等神迹",
        eventEn: "Led Israel through 40 years of wilderness wandering. Witnessed miracles: manna from heaven, water from rock.",
      },
      {
        lat: 31.77, lng: 35.72, year: -1210, type: "death",
        event: "于尼波山顶远眺应许之地后安息，享寿一百二十岁，「眼目没有昏花，精神没有衰败」",
        eventEn: "Viewed the Promised Land from Mount Nebo before passing at 120. 'His eyes were not dim, nor his vigor diminished.'",
      },
    ],
  },

  // ── 3. 迈蒙尼德 (1138-1204) ──────────────────────────────────────────
  {
    name: "迈蒙尼德",
    nameEn: "Maimonides (Rambam)",
    school: "中世纪",
    primaryLat: 30.04,
    primaryLng: 31.24,
    journeyWaypoints: [
      {
        lat: 37.88, lng: -4.77, year: 1138, type: "birth",
        event: "出生于西班牙科尔多瓦，犹太学者世家，自幼受犹太律法与阿拉伯哲学教育",
        eventEn: "Born in Cordoba, Spain, to a scholarly Jewish family. Educated in Jewish law and Arabic philosophy from youth.",
      },
      {
        lat: 35.17, lng: -3.93, year: 1148, type: "exile",
        event: "穆瓦希德王朝迫害犹太人，全家被迫逃离科尔多瓦，辗转北非",
        eventEn: "Almohad persecution of Jews forced the family to flee Cordoba, wandering through North Africa.",
      },
      {
        lat: 34.03, lng: -5.00, year: 1160, type: "pilgrimage",
        event: "定居非斯，潜心学术研究，撰写《密释纳评注》，融合犹太传统与亚里士多德哲学",
        eventEn: "Settled in Fez, devoted to scholarship. Wrote Commentary on the Mishnah, synthesizing Jewish tradition with Aristotelian philosophy.",
      },
      {
        lat: 30.04, lng: 31.24, year: 1168, type: "founding",
        event: "移居开罗，任埃及犹太社区领袖暨苏丹御医，完成巨著《密释纳·托拉》与《迷途指津》",
        eventEn: "Moved to Cairo, became head of the Egyptian Jewish community and court physician. Completed Mishneh Torah and Guide for the Perplexed.",
      },
      {
        lat: 30.04, lng: 31.24, year: 1204, type: "death",
        event: "于开罗逝世，遗体运往太巴列安葬，被誉为「从摩西到摩西，无人如摩西」",
        eventEn: "Died in Cairo, buried in Tiberias. Praised: 'From Moses to Moses, there arose none like Moses.'",
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 2 — 22位先知（坐标 + 基本信息）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "以撒", nameEn: "Isaac", school: "圣经时代",
    primaryLat: 31.53, primaryLng: 35.10, journeyWaypoints: [],
  },
  {
    name: "雅各", nameEn: "Jacob", school: "圣经时代",
    primaryLat: 31.53, primaryLng: 35.10, journeyWaypoints: [],
  },
  {
    name: "约瑟", nameEn: "Joseph", school: "圣经时代",
    primaryLat: 30.04, primaryLng: 31.24, journeyWaypoints: [],
  },
  {
    name: "大卫", nameEn: "King David", school: "圣经时代",
    primaryLat: 31.78, primaryLng: 35.24, journeyWaypoints: [],
  },
  {
    name: "所罗门", nameEn: "King Solomon", school: "圣经时代",
    primaryLat: 31.78, primaryLng: 35.24, journeyWaypoints: [],
  },
  {
    name: "以利亚", nameEn: "Elijah", school: "圣经时代",
    primaryLat: 32.83, primaryLng: 35.59, journeyWaypoints: [],
  },
  {
    name: "以赛亚", nameEn: "Isaiah", school: "圣经时代",
    primaryLat: 31.78, primaryLng: 35.24, journeyWaypoints: [],
  },
  {
    name: "耶利米", nameEn: "Jeremiah", school: "圣经时代",
    primaryLat: 31.78, primaryLng: 35.24, journeyWaypoints: [],
  },
  {
    name: "以斯拉", nameEn: "Ezra", school: "圣经时代",
    primaryLat: 31.78, primaryLng: 35.24, journeyWaypoints: [],
  },
  {
    name: "希勒尔", nameEn: "Hillel the Elder", school: "拉比时代",
    primaryLat: 31.78, primaryLng: 35.24, journeyWaypoints: [],
  },
  {
    name: "阿奇瓦", nameEn: "Rabbi Akiva", school: "拉比时代",
    primaryLat: 31.78, primaryLng: 35.24, journeyWaypoints: [],
  },
  {
    name: "犹大·哈纳西", nameEn: "Judah ha-Nasi", school: "拉比时代",
    primaryLat: 32.70, primaryLng: 35.30, journeyWaypoints: [],
  },
  {
    name: "拉什", nameEn: "Rashi", school: "中世纪",
    primaryLat: 48.30, primaryLng: 3.53, journeyWaypoints: [],
  },
  {
    name: "纳赫曼尼德", nameEn: "Nachmanides (Ramban)", school: "中世纪",
    primaryLat: 41.38, primaryLng: 2.18, journeyWaypoints: [],
  },
  {
    name: "约瑟夫·卡罗", nameEn: "Joseph Karo", school: "中世纪",
    primaryLat: 32.97, primaryLng: 35.50, journeyWaypoints: [],
  },
  {
    name: "以撒·卢里亚", nameEn: "Isaac Luria (Ari)", school: "中世纪",
    primaryLat: 32.97, primaryLng: 35.50, journeyWaypoints: [],
  },
  {
    name: "巴尔·谢姆·托夫", nameEn: "Baal Shem Tov", school: "哈西德派",
    primaryLat: 48.68, primaryLng: 26.57, journeyWaypoints: [],
  },
  {
    name: "维尔纳·加昂", nameEn: "Vilna Gaon", school: "拉比时代",
    primaryLat: 54.69, primaryLng: 25.28, journeyWaypoints: [],
  },
  {
    name: "摩西·门德尔松", nameEn: "Moses Mendelssohn", school: "改革派",
    primaryLat: 52.52, primaryLng: 13.41, journeyWaypoints: [],
  },
  {
    name: "赫茨尔", nameEn: "Theodor Herzl", school: "现代正统",
    primaryLat: 48.21, primaryLng: 16.37, journeyWaypoints: [],
  },
  {
    name: "拉比·库克", nameEn: "Rabbi Abraham Isaac Kook", school: "现代正统",
    primaryLat: 31.78, primaryLng: 35.24, journeyWaypoints: [],
  },
  {
    name: "马丁·布伯", nameEn: "Martin Buber", school: "现代正统",
    primaryLat: 50.11, primaryLng: 8.68, journeyWaypoints: [],
  },
];
