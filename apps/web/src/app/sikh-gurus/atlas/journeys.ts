// ═══════════════════════════════════════════════════════════════════════════
// 锡克教古鲁大图谱 — 22位古鲁坐标 + 2位核心古鲁人生轨迹数据
// Grand Sikh Gurus Atlas — Geographic & Journey Data
// ═══════════════════════════════════════════════════════════════════════════

import type { PatriarchMapData } from "@/components/atlas";

// School color mapping
export const SCHOOL_COLORS: Record<string, string> = {
  十大古鲁: "#EA580C",
  殉道者: "#DC2626",
  圣徒: "#F97316",
  近现代: "#C2410C",
};

export function getSchoolColor(school: string): string {
  return SCHOOL_COLORS[school] || "#EA580C";
}

// ═══════════════════════════════════════════════════════════════════════════
// 22位锡克教古鲁完整坐标数据
// ═══════════════════════════════════════════════════════════════════════════

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 1 — 2位核心古鲁（完整人生轨迹）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── 1. 古鲁·那纳克 (1469-1539) ──────────────────────────────────────────
  {
    name: "那纳克",
    nameEn: "Guru Nanak",
    school: "十大古鲁",
    primaryLat: 31.45,
    primaryLng: 73.13,
    journeyWaypoints: [
      {
        lat: 31.45, lng: 73.13, year: 1469, type: "birth",
        event: "出生于旁遮普塔尔万迪村（今巴基斯坦纳卡纳萨希布），印度教刹帝利家庭",
        eventEn: "Born in Talwandi (now Nankana Sahib, Pakistan), a Khatri Hindu family in Punjab.",
      },
      {
        lat: 31.22, lng: 75.88, year: 1499, type: "dharma",
        event: "苏尔坦普尔河边沐浴时消失三日，归来宣告「没有印度教徒，没有穆斯林，只有上帝的道路」",
        eventEn: "Disappeared in the River Bein at Sultanpur for three days. Returned declaring: 'There is no Hindu, no Muslim, only God's path.'",
      },
      {
        lat: 25.32, lng: 82.99, year: 1500, type: "pilgrimage",
        event: "第一次乌达西（东行传道），遍历贝拿勒斯、阿萨姆等地，与印度教学者辩论真理",
        eventEn: "First Udasi (eastward mission), traveling through Varanasi, Assam, debating truth with Hindu scholars.",
      },
      {
        lat: 7.87, lng: 79.89, year: 1510, type: "pilgrimage",
        event: "第二次乌达西（南行传道），远至斯里兰卡，传播一神论与平等思想",
        eventEn: "Second Udasi (southward mission), reaching Sri Lanka, spreading monotheism and egalitarianism.",
      },
      {
        lat: 31.50, lng: 79.00, year: 1515, type: "pilgrimage",
        event: "第三次乌达西（北行传道），进入西藏高原与喜马拉雅山区，与佛教僧侣交流",
        eventEn: "Third Udasi (northward mission), entered the Tibetan Plateau and Himalayas, exchanging ideas with Buddhist monks.",
      },
      {
        lat: 21.42, lng: 39.83, year: 1520, type: "pilgrimage",
        event: "第四次乌达西（西行传道），远至麦加朝圣，在天房前指出上帝无处不在",
        eventEn: "Fourth Udasi (westward mission), traveled to Mecca. At the Kaaba, demonstrated that God is omnipresent.",
      },
      {
        lat: 32.45, lng: 75.04, year: 1521, type: "founding",
        event: "在卡塔尔普尔建立第一个锡克社区（圣所），推行公共厨房（兰格尔），践行人人平等",
        eventEn: "Founded the first Sikh community at Kartarpur. Established the Langar (communal kitchen), practicing equality for all.",
      },
      {
        lat: 32.45, lng: 75.04, year: 1539, type: "death",
        event: "于卡塔尔普尔升天归主，临终指定安格德为继承者，印度教徒与穆斯林均前来悼念",
        eventEn: "Ascended at Kartarpur, appointed Angad as successor. Both Hindus and Muslims came to mourn.",
      },
    ],
  },

  // ── 2. 古鲁·戈宾德·辛格 (1666-1708) ──────────────────────────────────
  {
    name: "戈宾德·辛格",
    nameEn: "Guru Gobind Singh",
    school: "十大古鲁",
    primaryLat: 25.61,
    primaryLng: 85.14,
    journeyWaypoints: [
      {
        lat: 25.61, lng: 85.14, year: 1666, type: "birth",
        event: "出生于帕特纳，第九代古鲁德格·巴哈杜尔之子，九岁时父亲为信仰殉道",
        eventEn: "Born in Patna, son of the ninth Guru Tegh Bahadur. Father martyred for the faith when he was nine.",
      },
      {
        lat: 31.24, lng: 76.50, year: 1699, type: "teaching",
        event: "阿南德普尔创立卡尔萨（纯洁之军），以「五K」标志塑造锡克军事身份，万人受洗",
        eventEn: "Created the Khalsa at Anandpur. Established the '5 Ks' as Sikh martial identity. Thousands were baptized.",
      },
      {
        lat: 31.24, lng: 76.50, year: 1700, type: "founding",
        event: "将《阿迪·格兰特》编定为锡克教永恒经典，宣布此后不再有人间古鲁，经典即古鲁",
        eventEn: "Compiled the Adi Granth as the eternal Sikh scripture, declaring no more human Gurus — the scripture is the Guru.",
      },
      {
        lat: 30.88, lng: 76.53, year: 1704, type: "pilgrimage",
        event: "查姆考尔之战，以四十勇士对抗莫卧儿大军，两个儿子英勇战死，悲壮而不屈",
        eventEn: "Battle of Chamkaur — 40 warriors against the Mughal army. Two sons killed heroically. Tragic but unyielding.",
      },
      {
        lat: 19.18, lng: 77.32, year: 1708, type: "death",
        event: "于南德特（今马哈拉施特拉）遇刺后升天，是最后一位人间古鲁",
        eventEn: "Assassinated at Nanded, Maharashtra. The last human Guru of Sikhism ascended to the divine.",
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 2 — 20位古鲁与圣者（坐标 + 基本信息）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "古鲁·安格德", nameEn: "Guru Angad", school: "十大古鲁",
    primaryLat: 31.35, primaryLng: 75.65, journeyWaypoints: [],
  },
  {
    name: "古鲁·阿马尔达斯", nameEn: "Guru Amar Das", school: "十大古鲁",
    primaryLat: 31.35, primaryLng: 75.65, journeyWaypoints: [],
  },
  {
    name: "古鲁·拉姆达斯", nameEn: "Guru Ram Das", school: "十大古鲁",
    primaryLat: 31.63, primaryLng: 74.87, journeyWaypoints: [],
  },
  {
    name: "古鲁·阿尔琼", nameEn: "Guru Arjan", school: "殉道者",
    primaryLat: 31.63, primaryLng: 74.87, journeyWaypoints: [],
  },
  {
    name: "古鲁·哈戈宾德", nameEn: "Guru Hargobind", school: "十大古鲁",
    primaryLat: 31.63, primaryLng: 74.87, journeyWaypoints: [],
  },
  {
    name: "古鲁·哈拉伊", nameEn: "Guru Har Rai", school: "十大古鲁",
    primaryLat: 30.73, primaryLng: 76.78, journeyWaypoints: [],
  },
  {
    name: "古鲁·哈克里尚", nameEn: "Guru Har Krishan", school: "十大古鲁",
    primaryLat: 28.61, primaryLng: 77.21, journeyWaypoints: [],
  },
  {
    name: "古鲁·德格·巴哈杜尔", nameEn: "Guru Tegh Bahadur", school: "殉道者",
    primaryLat: 31.63, primaryLng: 74.87, journeyWaypoints: [],
  },
  {
    name: "班达·辛格·巴哈杜尔", nameEn: "Banda Singh Bahadur", school: "殉道者",
    primaryLat: 30.38, primaryLng: 76.78, journeyWaypoints: [],
  },
  {
    name: "玛哈拉贾·兰吉特·辛格", nameEn: "Maharaja Ranjit Singh", school: "近现代",
    primaryLat: 31.63, primaryLng: 74.87, journeyWaypoints: [],
  },
  {
    name: "巴巴·迪普·辛格", nameEn: "Baba Deep Singh", school: "殉道者",
    primaryLat: 31.63, primaryLng: 74.87, journeyWaypoints: [],
  },
  {
    name: "巴巴·布达", nameEn: "Baba Buddha", school: "圣徒",
    primaryLat: 31.63, primaryLng: 74.87, journeyWaypoints: [],
  },
  {
    name: "博伊·米安·米尔", nameEn: "Mian Mir", school: "圣徒",
    primaryLat: 31.55, primaryLng: 74.35, journeyWaypoints: [],
  },
  {
    name: "圣兵达尔", nameEn: "Bhai Gurdas", school: "圣徒",
    primaryLat: 31.63, primaryLng: 74.87, journeyWaypoints: [],
  },
  {
    name: "塔拉·辛格", nameEn: "Master Tara Singh", school: "近现代",
    primaryLat: 31.63, primaryLng: 74.87, journeyWaypoints: [],
  },
  {
    name: "坎瓦尔·辛格", nameEn: "Kanwar Singh", school: "近现代",
    primaryLat: 31.63, primaryLng: 74.87, journeyWaypoints: [],
  },
  {
    name: "巴伊·马尼·辛格", nameEn: "Bhai Mani Singh", school: "殉道者",
    primaryLat: 31.63, primaryLng: 74.87, journeyWaypoints: [],
  },
  {
    name: "巴巴·阿贾帕尔·辛格", nameEn: "Baba Ajpal Singh", school: "圣徒",
    primaryLat: 31.24, primaryLng: 76.50, journeyWaypoints: [],
  },
  {
    name: "巴伊·拉洛", nameEn: "Bhai Lalo", school: "圣徒",
    primaryLat: 31.45, primaryLng: 73.13, journeyWaypoints: [],
  },
];
