// ═══════════════════════════════════════════════════════════════════════════
// 巴哈伊教大图谱 — 18位圣贤坐标 + 2位核心人物人生轨迹
// Bahá'í Faith Atlas — Geographic & Journey Data
// ═══════════════════════════════════════════════════════════════════════════

import type { PatriarchMapData } from "@/components/atlas";

export const SCHOOL_COLORS: Record<string, string> = {
  先知: "#0891B2",
  圣护: "#06B6D4",
  万国正义院: "#22D3EE",
  杰出信徒: "#67E8F9",
};

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 1 — 2位核心人物（完整人生轨迹）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── 1. 巴哈欧拉 (1817-1892) ───────────────────────────────────────────
  {
    name: "巴哈欧拉",
    nameEn: "Bahá'u'lláh (Mirza Husayn Ali Nuri)",
    school: "先知",
    primaryLat: 32.93,
    primaryLng: 35.07,
    journeyWaypoints: [
      {
        lat: 35.69, lng: 51.39, year: 1817, type: "birth",
        event: "诞生于波斯德黑兰一个贵族家庭，父亲是卡扎尔王朝大臣，自幼聪慧过人，拒绝入朝为官，倾心济贫行善",
        eventEn: "Born in Tehran to a noble family; his father was a minister of the Qajar dynasty. Prodigiously gifted, he declined government office, devoting himself to charity.",
      },
      {
        lat: 35.69, lng: 51.39, year: 1853, type: "dharma",
        event: "被囚于德黑兰锡亚·查尔地牢（黑坑），在暗无天日的地下监狱中获得神圣启示，感受到上帝使命的呼召",
        eventEn: "Imprisoned in the Siyah-Chal (Black Pit) dungeon in Tehran. In the lightless underground prison, received divine revelation and the call of God's mission.",
      },
      {
        lat: 33.31, lng: 44.37, year: 1853, type: "exile",
        event: "被流放至奥斯曼帝国巴格达，在底格里斯河畔居住十年，撰写《隐言经》《确信经》等核心经典，信众日增",
        eventEn: "Exiled to Baghdad, Ottoman Empire. Lived along the Tigris for ten years, composed core scriptures including Hidden Words and Book of Certitude, attracting growing followers.",
      },
      {
        lat: 33.31, lng: 44.37, year: 1863, type: "founding",
        event: "在巴格达里兹万花园向追随者宣示自己即是「上帝将要显示的祂」，正式创立巴哈伊信仰，此日成为最神圣节日",
        eventEn: "In the Garden of Ridvan, Baghdad, declared himself 'He Whom God Shall Make Manifest', formally founding the Bahá'í Faith. This day became the holiest Bahá'í festival.",
      },
      {
        lat: 41.01, lng: 28.98, year: 1863, type: "exile",
        event: "被奥斯曼政府进一步流放至君士坦丁堡（伊斯坦布尔），仅停留四个月即被再次驱逐",
        eventEn: "Further exiled by the Ottoman government to Constantinople (Istanbul), stayed only four months before being expelled again.",
      },
      {
        lat: 41.68, lng: 26.56, year: 1863, type: "exile",
        event: "被流放至阿德里安堡（今埃迪尔内），在此居住近五年，向各国君主发出著名的致书信函，宣告世界和平与统一的愿景",
        eventEn: "Exiled to Adrianople (modern Edirne), lived there nearly five years. Addressed famous letters to world leaders proclaiming the vision of world peace and unity.",
      },
      {
        lat: 32.93, lng: 35.07, year: 1868, type: "exile",
        event: "被最终流放至巴勒斯坦阿卡古城（今以色列），囚禁于城堡监狱中，后迁居城外巴吉宅邸，继续著述传教",
        eventEn: "Final exile to the prison-city of Akka, Palestine (modern Israel). Imprisoned in the citadel, later moved to the Mansion of Bahji outside the city, continuing to write and teach.",
      },
      {
        lat: 32.93, lng: 35.07, year: 1892, type: "death",
        event: "于阿卡巴吉宅邸升天，世寿七十五岁。其陵寝成为巴哈伊信仰最神圣的朝圣地，遗嘱指定长子阿博都巴哈为继承者",
        eventEn: "Ascended at the Mansion of Bahji, Akka, age 75. His shrine became the holiest Bahá'í pilgrimage site. His Will designated eldest son Abdu'l-Bahá as successor.",
      },
    ],
  },

  // ── 2. 阿博都巴哈 (1844-1921) ─────────────────────────────────────────
  {
    name: "阿博都巴哈",
    nameEn: "Abdu'l-Bahá (Abbas Effendi)",
    school: "先知",
    primaryLat: 32.82,
    primaryLng: 34.99,
    journeyWaypoints: [
      {
        lat: 35.69, lng: 51.39, year: 1844, type: "birth",
        event: "诞生于德黑兰，巴哈欧拉长子，自幼随父亲经历流放与囚禁，童年即展现非凡的智慧与慈悲心",
        eventEn: "Born in Tehran, eldest son of Bahá'u'lláh. From childhood accompanied his father through exile and imprisonment, showing extraordinary wisdom and compassion.",
      },
      {
        lat: 32.93, lng: 35.07, year: 1868, type: "exile",
        event: "随父亲被囚于阿卡古城，在狱中度过近四十年，期间协助父亲处理教务，接待各国信众，被尊为「仆人中的仆人」",
        eventEn: "Imprisoned with his father in Akka for nearly 40 years, assisted in managing the Faith, received believers from many nations, known as 'Servant of the Servants'.",
      },
      {
        lat: 51.51, lng: -0.13, year: 1911, type: "teaching",
        event: "获释后首赴欧洲传教，在伦敦、巴黎等地公开演讲，阐述男女平等、消除偏见、世界和平等核心教义",
        eventEn: "After release, traveled to Europe for the first time, gave public lectures in London, Paris and other cities on gender equality, elimination of prejudice, and world peace.",
      },
      {
        lat: 40.71, lng: -74.01, year: 1912, type: "teaching",
        event: "横渡大西洋赴美国巡回传教八个月，从纽约到旧金山遍访各城市，在教堂、大学、和平会议上演讲数百场",
        eventEn: "Crossed the Atlantic for an eight-month speaking tour of America, visiting cities from New York to San Francisco, giving hundreds of talks at churches, universities, and peace conferences.",
      },
      {
        lat: 32.82, lng: 34.99, year: 1909, type: "founding",
        event: "在海法卡梅尔山主持巴布陵寝的建造，奠定巴哈伊世界中心的基础，规划阶梯花园的宏伟蓝图",
        eventEn: "Supervised construction of the Shrine of the Báb on Mount Carmel in Haifa, laying the foundation of the Bahá'í World Centre and envisioning the grand terraced gardens.",
      },
      {
        lat: 32.82, lng: 34.99, year: 1921, type: "death",
        event: "于海法升天，世寿七十七岁。遗嘱指定外孙师尊·艾芬迪为信仰圣护，确立了巴哈伊行政秩序的根基",
        eventEn: "Ascended in Haifa, age 77. His Will designated grandson Shoghi Effendi as Guardian of the Faith, establishing the foundation of the Bahá'í administrative order.",
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 2 — 16位重要人物（标记点位）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "巴布",
    nameEn: "The Báb (Siyyid Ali-Muhammad)",
    school: "先知",
    primaryLat: 29.62, primaryLng: 52.53,
    journeyWaypoints: [],
  },
  {
    name: "师尊·艾芬迪",
    nameEn: "Shoghi Effendi",
    school: "圣护",
    primaryLat: 32.82, primaryLng: 34.99,
    journeyWaypoints: [],
  },
  {
    name: "塔希莉",
    nameEn: "Tahirih (Qurratu'l-Ayn)",
    school: "杰出信徒",
    primaryLat: 37.28, primaryLng: 49.58,
    journeyWaypoints: [],
  },
  {
    name: "穆拉·侯赛因",
    nameEn: "Mulla Husayn",
    school: "杰出信徒",
    primaryLat: 32.55, primaryLng: 52.68,
    journeyWaypoints: [],
  },
  {
    name: "古杜斯",
    nameEn: "Quddus (Muhammad-Ali Barfurushi)",
    school: "杰出信徒",
    primaryLat: 36.85, primaryLng: 53.06,
    journeyWaypoints: [],
  },
  {
    name: "巴迪",
    nameEn: "Badi' (Aqa Buzurg Khurasani)",
    school: "杰出信徒",
    primaryLat: 35.69, primaryLng: 51.39,
    journeyWaypoints: [],
  },
  {
    name: "纳比勒·阿扎姆",
    nameEn: "Nabil-i-A'zam",
    school: "杰出信徒",
    primaryLat: 33.31, primaryLng: 44.37,
    journeyWaypoints: [],
  },
  {
    name: "哈吉·阿明",
    nameEn: "Haji Amin (Trustee of Huququ'llah)",
    school: "杰出信徒",
    primaryLat: 32.93, primaryLng: 35.07,
    journeyWaypoints: [],
  },
  {
    name: "马斯·阿德哈姆",
    nameEn: "Mishkin-Qalam (Master Calligrapher)",
    school: "杰出信徒",
    primaryLat: 33.31, primaryLng: 44.37,
    journeyWaypoints: [],
  },
  {
    name: "路希叶·哈努姆",
    nameEn: "Ruhiyyih Khanum",
    school: "圣护",
    primaryLat: 32.82, primaryLng: 34.99,
    journeyWaypoints: [],
  },
  {
    name: "科拉佐努",
    nameEn: "Leonora Armstrong (Brazil Pioneer)",
    school: "杰出信徒",
    primaryLat: -23.55, primaryLng: -46.63,
    journeyWaypoints: [],
  },
  {
    name: "菲比·赫斯特",
    nameEn: "Phoebe Hearst",
    school: "杰出信徒",
    primaryLat: 40.71, primaryLng: -74.01,
    journeyWaypoints: [],
  },
  {
    name: "玛莎·鲁特",
    nameEn: "Martha Root",
    school: "杰出信徒",
    primaryLat: 40.71, primaryLng: -74.01,
    journeyWaypoints: [],
  },
  {
    name: "基思·兰东",
    nameEn: "Keith Ransom-Kehler",
    school: "杰出信徒",
    primaryLat: 51.51, primaryLng: -0.13,
    journeyWaypoints: [],
  },
  {
    name: "手的原因",
    nameEn: "Hands of the Cause (Haifa)",
    school: "万国正义院",
    primaryLat: 32.82, primaryLng: 34.99,
    journeyWaypoints: [],
  },
  {
    name: "穆罕默德·阿里·巴弗奇",
    nameEn: "Muhammad-Ali Baforqi",
    school: "杰出信徒",
    primaryLat: 32.66, primaryLng: 51.68,
    journeyWaypoints: [],
  },
];
