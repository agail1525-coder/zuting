// ═══════════════════════════════════════════════════════════════════════════
// 藏传佛教祖师大图谱 — 25位祖师坐标 + 3位核心祖师人生轨迹
// Tibetan Buddhism Patriarch Atlas — Geographic & Journey Data
// ═══════════════════════════════════════════════════════════════════════════

import type { PatriarchMapData } from "@/components/atlas";

export const SCHOOL_COLORS: Record<string, string> = {
  宁玛派: "#7C3AED",
  噶举派: "#8B5CF6",
  萨迦派: "#A78BFA",
  格鲁派: "#C4B5FD",
  噶当派: "#DDD6FE",
  觉囊派: "#6D28D9",
  苯教: "#5B21B6",
};

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 1 — 3位核心祖师（完整人生轨迹）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── 1. 莲花生大士 (8世纪) ──────────────────────────────────────────────
  {
    name: "莲花生",
    nameEn: "Padmasambhava (Guru Rinpoche)",
    school: "宁玛派",
    primaryLat: 29.33,
    primaryLng: 91.51,
    journeyWaypoints: [
      {
        lat: 35.22, lng: 72.34, year: 717, type: "birth",
        event: "降生于乌仗那国（今巴基斯坦斯瓦特河谷），传说由莲花中化生，被因陀罗部提王收养为太子",
        eventEn: "Born in Oddiyana (modern Swat Valley, Pakistan), said to have appeared miraculously in a lotus blossom, adopted by King Indrabhuti.",
      },
      {
        lat: 25.14, lng: 85.44, year: 750, type: "dharma",
        event: "于印度那烂陀寺修学密法，师从多位大成就者，精通金刚乘八大修行法门，获「莲花生大士」尊号",
        eventEn: "Studied tantric Buddhism at Nalanda, learned from numerous mahasiddhas, mastered the eight great practices of Vajrayana.",
      },
      {
        lat: 27.72, lng: 85.32, year: 761, type: "pilgrimage",
        event: "应赤松德赞之邀入藏，经尼泊尔翻越喜马拉雅山脉，沿途降伏诸多妖魔鬼怪，为密法入藏开辟道路",
        eventEn: "Invited by King Trisong Detsen, crossed the Himalayas via Nepal, subduing demons along the way to clear the path for tantric Buddhism.",
      },
      {
        lat: 29.33, lng: 91.51, year: 762, type: "founding",
        event: "创建桑耶寺——西藏历史上第一座佛法僧三宝俱全的寺院，降伏本土鬼神纳为护法，奠定藏传佛教基础",
        eventEn: "Founded Samye Monastery — Tibet's first complete Buddhist monastery with Buddha, Dharma, and Sangha. Subdued local spirits as dharma protectors.",
      },
      {
        lat: 29.65, lng: 91.10, year: 770, type: "teaching",
        event: "在拉萨及卫藏各地传授密法，降伏苯教势力，翻译大量梵文经典为藏文，培养二十五大弟子",
        eventEn: "Taught tantric dharma across Lhasa and central Tibet, overcame Bon opposition, translated numerous Sanskrit texts, trained the 25 principal disciples.",
      },
      {
        lat: 27.48, lng: 90.50, year: 780, type: "pilgrimage",
        event: "赴不丹本塘谷地（帕罗虎穴寺所在），于悬崖洞穴中禅修降魔，留下「虎穴寺」等众多圣迹，最终隐入铜色吉祥山净土",
        eventEn: "Journeyed to Bumthang Valley, Bhutan (Tiger's Nest), meditated in cliff caves subduing demons, left sacred sites before departing to the Copper-Colored Mountain pure land.",
      },
    ],
  },

  // ── 2. 宗喀巴大师 (1357-1419) ──────────────────────────────────────────
  {
    name: "宗喀巴",
    nameEn: "Tsongkhapa",
    school: "格鲁派",
    primaryLat: 29.75,
    primaryLng: 91.47,
    journeyWaypoints: [
      {
        lat: 36.48, lng: 101.57, year: 1357, type: "birth",
        event: "诞生于青海湟中宗喀地区（今塔尔寺所在地），三岁受近事戒于噶玛噶举派黑帽系四世活佛若比多杰座下",
        eventEn: "Born in Tsongkha region of Amdo (modern Huangzhong, Qinghai, where Kumbum Monastery now stands), took lay vows at age 3.",
      },
      {
        lat: 29.65, lng: 91.10, year: 1373, type: "pilgrimage",
        event: "十六岁入藏求法，赴拉萨及卫藏各大寺院遍访名师，学习因明、中观、俱舍、律藏等显教经论",
        eventEn: "Entered Tibet at age 16, traveled to Lhasa and visited major monasteries across U-Tsang, studying logic, Madhyamaka, Abhidharma, and Vinaya.",
      },
      {
        lat: 29.27, lng: 89.17, year: 1385, type: "dharma",
        event: "于萨迦寺、夏鲁寺等各派道场遍学显密教法，师从萨迦派仁达瓦、噶举派楚臣仁钦等四十余位善知识",
        eventEn: "Studied at Sakya, Shalu and other monasteries across all schools, learning from over 40 masters including Rendawa of Sakya and Chokyi Rinchen of Kagyu.",
      },
      {
        lat: 29.75, lng: 91.47, year: 1409, type: "founding",
        event: "创建甘丹寺，正式开创格鲁派（黄教），倡导严守戒律、先显后密的修学次第，著《菩提道次第广论》《密宗道次第广论》",
        eventEn: "Founded Ganden Monastery, formally establishing the Gelug school (Yellow Hat), advocating strict discipline and graduated sutra-then-tantra path.",
      },
      {
        lat: 29.65, lng: 91.10, year: 1409, type: "teaching",
        event: "在拉萨大昭寺创立传召大法会（默朗钦莫），万僧云集，盛况空前，此后每年正月举行，延续五百余年",
        eventEn: "Established the Great Prayer Festival (Monlam Chenmo) at Jokhang Temple in Lhasa, attracting tens of thousands of monks, continuing for over 500 years.",
      },
      {
        lat: 29.75, lng: 91.47, year: 1419, type: "death",
        event: "于甘丹寺圆寂，世寿六十三岁。弟子贾曹杰、克主杰相继住持甘丹法座，格鲁派迅速成为藏传佛教最大宗派",
        eventEn: "Passed away at Ganden Monastery at age 63. Disciples Gyaltsab Je and Khedrup Je succeeded him, and Gelug rapidly became the largest Tibetan Buddhist school.",
      },
    ],
  },

  // ── 3. 达赖喇嘛十四世 (1935-) ──────────────────────────────────────────
  {
    name: "达赖喇嘛十四世",
    nameEn: "14th Dalai Lama (Tenzin Gyatso)",
    school: "格鲁派",
    primaryLat: 32.22,
    primaryLng: 76.32,
    journeyWaypoints: [
      {
        lat: 36.48, lng: 101.57, year: 1935, type: "birth",
        event: "诞生于青海省湟中县红崖村（塔尔寺附近）一户农家，本名拉莫顿珠，两岁时被认定为十三世达赖喇嘛转世灵童",
        eventEn: "Born as Lhamo Thondup in Taktser village near Kumbum Monastery, Amdo (Qinghai). Recognized as reincarnation of the 13th Dalai Lama at age 2.",
      },
      {
        lat: 29.65, lng: 91.10, year: 1940, type: "ordination",
        event: "于布达拉宫正式坐床登基，年仅五岁，受沙弥戒，开始接受系统的佛学教育与政务训练",
        eventEn: "Enthroned at the Potala Palace at age 5, received novice monk vows, began systematic Buddhist education and political training.",
      },
      {
        lat: 29.65, lng: 91.10, year: 1950, type: "teaching",
        event: "十五岁提前亲政，面对巨变时局，努力维护西藏自治，与各方斡旋交涉，同时精进显密修学",
        eventEn: "Assumed full political power at age 15 amid crisis, worked to maintain Tibetan autonomy while continuing intensive Buddhist studies.",
      },
      {
        lat: 32.22, lng: 76.32, year: 1959, type: "exile",
        event: "流亡印度达兰萨拉，建立西藏流亡政府与社区，保存藏传佛教文化传承，创办寺院学校，安置十余万藏民",
        eventEn: "Fled to Dharamsala, India, established the Tibetan government-in-exile, preserved Tibetan Buddhist culture, founded monasteries and schools for over 100,000 refugees.",
      },
      {
        lat: 59.91, lng: 10.75, year: 1989, type: "teaching",
        event: "荣获诺贝尔和平奖（挪威奥斯陆），此后走遍全球六十余国弘法开示，倡导慈悲、非暴力与宗教和谐对话",
        eventEn: "Awarded the Nobel Peace Prize in Oslo, Norway. Traveled to over 60 countries teaching compassion, non-violence, and interfaith dialogue.",
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 2 — 22位重要祖师（标记点位）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "赤松德赞",
    nameEn: "Trisong Detsen",
    school: "宁玛派",
    primaryLat: 29.33, primaryLng: 91.51,
    journeyWaypoints: [],
  },
  {
    name: "阿底峡",
    nameEn: "Atisha",
    school: "噶当派",
    primaryLat: 29.65, primaryLng: 91.10,
    journeyWaypoints: [],
  },
  {
    name: "仲敦巴",
    nameEn: "Dromtonpa",
    school: "噶当派",
    primaryLat: 29.65, primaryLng: 91.10,
    journeyWaypoints: [],
  },
  {
    name: "玛尔巴",
    nameEn: "Marpa the Translator",
    school: "噶举派",
    primaryLat: 28.85, primaryLng: 87.18,
    journeyWaypoints: [],
  },
  {
    name: "米拉日巴",
    nameEn: "Milarepa",
    school: "噶举派",
    primaryLat: 28.63, primaryLng: 86.71,
    journeyWaypoints: [],
  },
  {
    name: "冈波巴",
    nameEn: "Gampopa",
    school: "噶举派",
    primaryLat: 28.85, primaryLng: 87.18,
    journeyWaypoints: [],
  },
  {
    name: "噶玛巴一世",
    nameEn: "1st Karmapa Dusum Khyenpa",
    school: "噶举派",
    primaryLat: 28.85, primaryLng: 87.18,
    journeyWaypoints: [],
  },
  {
    name: "噶玛巴十七世",
    nameEn: "17th Karmapa Ogyen Trinley Dorje",
    school: "噶举派",
    primaryLat: 32.22, primaryLng: 76.32,
    journeyWaypoints: [],
  },
  {
    name: "萨迦·贡嘎坚赞",
    nameEn: "Sakya Pandita Kunga Gyaltsen",
    school: "萨迦派",
    primaryLat: 29.27, primaryLng: 89.17,
    journeyWaypoints: [],
  },
  {
    name: "八思巴",
    nameEn: "Drogon Chogyal Phagpa",
    school: "萨迦派",
    primaryLat: 39.90, primaryLng: 116.40,
    journeyWaypoints: [],
  },
  {
    name: "布顿",
    nameEn: "Buton Rinchen Drub",
    school: "觉囊派",
    primaryLat: 29.33, primaryLng: 91.51,
    journeyWaypoints: [],
  },
  {
    name: "龙钦巴",
    nameEn: "Longchenpa",
    school: "宁玛派",
    primaryLat: 27.48, primaryLng: 90.50,
    journeyWaypoints: [],
  },
  {
    name: "嘉央·却杰",
    nameEn: "Jamyang Choje",
    school: "格鲁派",
    primaryLat: 29.27, primaryLng: 89.17,
    journeyWaypoints: [],
  },
  {
    name: "第一世达赖根敦朱巴",
    nameEn: "1st Dalai Lama Gendun Drup",
    school: "格鲁派",
    primaryLat: 29.27, primaryLng: 89.17,
    journeyWaypoints: [],
  },
  {
    name: "第五世达赖",
    nameEn: "5th Dalai Lama Ngawang Lobsang Gyatso",
    school: "格鲁派",
    primaryLat: 29.65, primaryLng: 91.10,
    journeyWaypoints: [],
  },
  {
    name: "班禅一世",
    nameEn: "1st Panchen Lama Khedrup Je",
    school: "格鲁派",
    primaryLat: 29.27, primaryLng: 89.17,
    journeyWaypoints: [],
  },
  {
    name: "章嘉·若必多吉",
    nameEn: "Changkya Rolpai Dorje",
    school: "格鲁派",
    primaryLat: 39.90, primaryLng: 116.40,
    journeyWaypoints: [],
  },
  {
    name: "土观·洛桑却吉尼玛",
    nameEn: "Thuken Losang Chokyi Nyima",
    school: "格鲁派",
    primaryLat: 36.48, primaryLng: 101.57,
    journeyWaypoints: [],
  },
  {
    name: "更敦群培",
    nameEn: "Gendun Choephel",
    school: "宁玛派",
    primaryLat: 29.65, primaryLng: 91.10,
    journeyWaypoints: [],
  },
  {
    name: "根敦确吉尼玛",
    nameEn: "Gedhun Choekyi Nyima (11th Panchen Lama)",
    school: "格鲁派",
    primaryLat: 29.27, primaryLng: 89.17,
    journeyWaypoints: [],
  },
  {
    name: "土登嘉措",
    nameEn: "Thubten Gyatso (13th Dalai Lama)",
    school: "格鲁派",
    primaryLat: 29.65, primaryLng: 91.10,
    journeyWaypoints: [],
  },
  {
    name: "措尼仁波切",
    nameEn: "Tsoknyi Rinpoche",
    school: "噶举派",
    primaryLat: 27.72, primaryLng: 85.32,
    journeyWaypoints: [],
  },
];
