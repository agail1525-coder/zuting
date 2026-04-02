// ═══════════════════════════════════════════════════════════════════════════
// 印度教圣贤大图谱 — 28位圣贤坐标 + 3位核心圣贤人生轨迹数据
// Grand Hindu Sages Atlas — Geographic & Journey Data
// ═══════════════════════════════════════════════════════════════════════════

import type { PatriarchMapData } from "@/components/atlas";

// School color mapping
export const SCHOOL_COLORS: Record<string, string> = {
  吠檀多: "#F97316",
  毗湿奴派: "#FB923C",
  湿婆派: "#FDBA74",
  性力派: "#FED7AA",
  瑜伽派: "#EA580C",
  数论派: "#D97706",
  近代改革: "#C2410C",
};

export function getSchoolColor(school: string): string {
  return SCHOOL_COLORS[school] || "#F97316";
}

// ═══════════════════════════════════════════════════════════════════════════
// 28位印度教圣贤完整坐标数据
// ═══════════════════════════════════════════════════════════════════════════

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 1 — 3位核心圣贤（完整人生轨迹）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── 1. 商羯罗 (788-820) ──────────────────────────────────────────────
  {
    name: "商羯罗",
    nameEn: "Adi Shankara",
    school: "吠檀多",
    primaryLat: 10.23,
    primaryLng: 76.10,
    journeyWaypoints: [
      {
        lat: 10.23, lng: 76.10, year: 788, type: "birth",
        event: "出生于喀拉拉邦卡拉迪村，婆罗门家庭，传说为湿婆化身降世",
        eventEn: "Born in Kaladi, Kerala. Brahmin family, believed to be an incarnation of Shiva.",
      },
      {
        lat: 22.30, lng: 73.20, year: 800, type: "dharma",
        event: "北上求师，渡纳尔马达河，拜乔毗陀婆陀·巴伽瓦帕达为师，修学不二吠檀多",
        eventEn: "Traveled north, crossed the Narmada River, studied Advaita Vedanta under Govinda Bhagavatpada.",
      },
      {
        lat: 14.08, lng: 75.40, year: 810, type: "founding",
        event: "建南方修道院——希尔格里什伽摩谛，传承不二论法脉于南印度",
        eventEn: "Founded Sringeri Sharada Peetham, the southern monastery, establishing Advaita lineage in South India.",
      },
      {
        lat: 22.24, lng: 68.97, year: 812, type: "founding",
        event: "建西方修道院——德瓦尔卡夏拉达摩谛，统领西印度哲学传承",
        eventEn: "Founded Dwaraka Sharada Peetham, the western monastery, overseeing philosophical tradition in West India.",
      },
      {
        lat: 30.74, lng: 79.49, year: 814, type: "founding",
        event: "建北方修道院——巴德里那特乔提摩谛，坐落喜马拉雅圣域",
        eventEn: "Founded Jyotir Math at Badrinath, the northern monastery, nestled in the sacred Himalayas.",
      },
      {
        lat: 19.81, lng: 85.83, year: 816, type: "founding",
        event: "建东方修道院——普里戈瓦尔丹摩谛，完成四方修道院体系",
        eventEn: "Founded Govardhan Math at Puri, the eastern monastery, completing the four-cardinal-direction system.",
      },
      {
        lat: 30.73, lng: 79.07, year: 820, type: "death",
        event: "于喜马拉雅凯达尔那特圆寂，年仅三十二岁，留下逾三百部论著",
        eventEn: "Passed away at Kedarnath in the Himalayas, aged only 32, leaving over 300 philosophical works.",
      },
    ],
  },

  // ── 2. 维韦卡南达 (1863-1902) ──────────────────────────────────────────
  {
    name: "维韦卡南达",
    nameEn: "Swami Vivekananda",
    school: "近代改革",
    primaryLat: 22.57,
    primaryLng: 88.36,
    journeyWaypoints: [
      {
        lat: 22.57, lng: 88.36, year: 1863, type: "birth",
        event: "出生于加尔各答贵族家庭，原名纳兰德拉纳特·达塔，自幼聪颖过人",
        eventEn: "Born in Calcutta to an aristocratic family, original name Narendranath Datta, exceptionally gifted from youth.",
      },
      {
        lat: 22.65, lng: 88.36, year: 1881, type: "dharma",
        event: "达克希涅什瓦尔寺师从罗摩克里希那，接受其「万教归一」教导，获灵性启悟",
        eventEn: "Studied under Ramakrishna at Dakshineswar Temple, received his teaching of 'unity of all religions' and spiritual awakening.",
      },
      {
        lat: 8.08, lng: 77.55, year: 1892, type: "pilgrimage",
        event: "徒步遍历印度，至科摩林角冥想三日，立志将印度哲学传播世界",
        eventEn: "Walked across India on foot, meditated for three days at Kanyakumari, resolved to spread Indian philosophy worldwide.",
      },
      {
        lat: 41.88, lng: -87.63, year: 1893, type: "teaching",
        event: "出席芝加哥世界宗教大会，以「美国的兄弟姐妹们」开场震动全场，将印度教哲学引入西方",
        eventEn: "Addressed the Parliament of World's Religions in Chicago. 'Sisters and Brothers of America' opening electrified the audience.",
      },
      {
        lat: 22.63, lng: 88.35, year: 1897, type: "founding",
        event: "创建贝鲁尔修道院及罗摩克里希那传教会，倡导服务即崇拜",
        eventEn: "Founded Belur Math and the Ramakrishna Mission, advocating 'service is worship'.",
      },
      {
        lat: 22.63, lng: 88.35, year: 1902, type: "death",
        event: "于贝鲁尔修道院入大三昧圆寂，年仅三十九岁，被誉为近代印度文艺复兴的先驱",
        eventEn: "Entered Mahasamadhi at Belur Math, aged only 39, hailed as a pioneer of the modern Indian Renaissance.",
      },
    ],
  },

  // ── 3. 甘地 (1869-1948) ──────────────────────────────────────────────
  {
    name: "甘地",
    nameEn: "Mahatma Gandhi",
    school: "近代改革",
    primaryLat: 21.64,
    primaryLng: 69.60,
    journeyWaypoints: [
      {
        lat: 21.64, lng: 69.60, year: 1869, type: "birth",
        event: "出生于古吉拉特邦波尔班达，毗湿奴派印度教家庭，自幼受非暴力思想熏陶",
        eventEn: "Born in Porbandar, Gujarat, to a Vaishnavite Hindu family, imbued with ahimsa (non-violence) from childhood.",
      },
      {
        lat: 51.51, lng: -0.13, year: 1888, type: "pilgrimage",
        event: "赴伦敦学习法律，深受《薄伽梵歌》与托尔斯泰非暴力思想影响",
        eventEn: "Studied law in London, deeply influenced by the Bhagavad Gita and Tolstoy's non-violence philosophy.",
      },
      {
        lat: -29.86, lng: 31.02, year: 1893, type: "teaching",
        event: "南非领导反种族歧视运动二十一年，创立非暴力不合作的「真理坚持」思想",
        eventEn: "Led anti-racial discrimination movement in South Africa for 21 years, developed Satyagraha (truth-force) philosophy.",
      },
      {
        lat: 28.61, lng: 77.21, year: 1915, type: "teaching",
        event: "回到印度领导独立运动，发起食盐长征、非暴力不合作运动，成为「圣雄」",
        eventEn: "Returned to India to lead the independence movement. Launched the Salt March and non-cooperation movements, became 'Mahatma'.",
      },
      {
        lat: 28.61, lng: 77.21, year: 1948, type: "death",
        event: "于新德里比尔拉宅邸祈祷时遇刺身亡，临终言「嗨，罗摩」",
        eventEn: "Assassinated while praying at Birla House, New Delhi. Last words: 'He Ram' (Oh God).",
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 2 — 25位圣贤（坐标 + 基本信息）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "毗耶娑", nameEn: "Vyasa", school: "吠檀多",
    primaryLat: 30.74, primaryLng: 79.49, journeyWaypoints: [],
  },
  {
    name: "帕坦伽利", nameEn: "Patanjali", school: "瑜伽派",
    primaryLat: 25.32, primaryLng: 82.99, journeyWaypoints: [],
  },
  {
    name: "罗摩奴阇", nameEn: "Ramanuja", school: "毗湿奴派",
    primaryLat: 12.95, primaryLng: 79.16, journeyWaypoints: [],
  },
  {
    name: "摩陀婆", nameEn: "Madhvacharya", school: "毗湿奴派",
    primaryLat: 13.35, primaryLng: 74.74, journeyWaypoints: [],
  },
  {
    name: "楠比", nameEn: "Nambi", school: "毗湿奴派",
    primaryLat: 10.78, primaryLng: 79.13, journeyWaypoints: [],
  },
  {
    name: "遮提旦耶", nameEn: "Chaitanya Mahaprabhu", school: "毗湿奴派",
    primaryLat: 23.43, primaryLng: 87.33, journeyWaypoints: [],
  },
  {
    name: "图西达斯", nameEn: "Tulsidas", school: "毗湿奴派",
    primaryLat: 25.32, primaryLng: 82.99, journeyWaypoints: [],
  },
  {
    name: "米拉白", nameEn: "Mirabai", school: "毗湿奴派",
    primaryLat: 26.92, primaryLng: 75.79, journeyWaypoints: [],
  },
  {
    name: "苏尔达斯", nameEn: "Surdas", school: "毗湿奴派",
    primaryLat: 27.50, primaryLng: 77.67, journeyWaypoints: [],
  },
  {
    name: "罗摩克里希那", nameEn: "Ramakrishna", school: "吠檀多",
    primaryLat: 22.65, primaryLng: 88.36, journeyWaypoints: [],
  },
  {
    name: "室利·奥罗宾多", nameEn: "Sri Aurobindo", school: "瑜伽派",
    primaryLat: 12.97, primaryLng: 79.82, journeyWaypoints: [],
  },
  {
    name: "泰戈尔", nameEn: "Rabindranath Tagore", school: "近代改革",
    primaryLat: 22.57, primaryLng: 88.36, journeyWaypoints: [],
  },
  {
    name: "达雅南达", nameEn: "Dayananda Saraswati", school: "近代改革",
    primaryLat: 22.30, primaryLng: 73.20, journeyWaypoints: [],
  },
  {
    name: "辨喜弟子", nameEn: "Sister Nivedita", school: "近代改革",
    primaryLat: 22.63, primaryLng: 88.35, journeyWaypoints: [],
  },
  {
    name: "阿南达玛依", nameEn: "Anandamayi Ma", school: "性力派",
    primaryLat: 23.43, primaryLng: 87.33, journeyWaypoints: [],
  },
  {
    name: "拉马纳·马哈希", nameEn: "Ramana Maharshi", school: "吠檀多",
    primaryLat: 12.23, primaryLng: 79.06, journeyWaypoints: [],
  },
  {
    name: "瑜伽南达", nameEn: "Paramahansa Yogananda", school: "瑜伽派",
    primaryLat: 22.57, primaryLng: 88.36, journeyWaypoints: [],
  },
  {
    name: "萨特亚·赛巴巴", nameEn: "Sathya Sai Baba", school: "吠檀多",
    primaryLat: 14.17, primaryLng: 77.81, journeyWaypoints: [],
  },
  {
    name: "希瓦南达", nameEn: "Sivananda Saraswati", school: "瑜伽派",
    primaryLat: 30.09, primaryLng: 78.27, journeyWaypoints: [],
  },
  {
    name: "钦莫伊", nameEn: "Sri Chinmoy", school: "瑜伽派",
    primaryLat: 22.57, primaryLng: 88.36, journeyWaypoints: [],
  },
  {
    name: "马哈维亚", nameEn: "Mahavira (Hindu context)", school: "吠檀多",
    primaryLat: 25.60, primaryLng: 85.14, journeyWaypoints: [],
  },
  {
    name: "奥修", nameEn: "Osho (Rajneesh)", school: "近代改革",
    primaryLat: 21.15, primaryLng: 79.09, journeyWaypoints: [],
  },
  {
    name: "阿玛", nameEn: "Amma (Mata Amritanandamayi)", school: "吠檀多",
    primaryLat: 9.10, primaryLng: 76.48, journeyWaypoints: [],
  },
  {
    name: "斯瓦米·韦瓦卡南达", nameEn: "Swami Vivekananda (disciple)", school: "吠檀多",
    primaryLat: 22.57, primaryLng: 88.36, journeyWaypoints: [],
  },
  {
    name: "萨达纳达", nameEn: "Sadananda", school: "吠檀多",
    primaryLat: 25.32, primaryLng: 82.99, journeyWaypoints: [],
  },
];
