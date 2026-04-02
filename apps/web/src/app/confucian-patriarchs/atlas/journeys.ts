// ═══════════════════════════════════════════════════════════════════════════
// 儒教先贤大图谱 — 28位先贤坐标 + 3位核心先贤人生轨迹数据
// Grand Confucianism Patriarch Atlas — Geographic & Journey Data
// ═══════════════════════════════════════════════════════════════════════════

import type { PatriarchMapData } from "@/components/atlas";

export const SCHOOL_COLORS: Record<string, string> = {
  先秦儒学: "#DC2626",
  汉唐经学: "#EF4444",
  宋明理学: "#F87171",
  心学: "#FCA5A5",
  气学: "#DC2626",
  阳明学: "#FECACA",
  当代新儒学: "#B91C1C",
};

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 1 — 3位核心先贤（完整人生轨迹）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── 1. 孔子 (551-479BC) ──────────────────────────────────────────────
  {
    name: "孔子",
    nameEn: "Confucius",
    school: "先秦儒学",
    primaryLat: 35.60,
    primaryLng: 116.99,
    journeyWaypoints: [
      {
        lat: 35.60, lng: 116.99, year: -551, type: "birth",
        event: "诞生于鲁国陬邑（今山东曲阜），名丘字仲尼。父叔梁纥为鲁国武士，母颜徵在。三岁丧父，家道中落，自幼好学不倦",
        eventEn: "Born in Zou, State of Lu (modern Qufu, Shandong). Named Qiu, styled Zhongni. Father Shuliang He was a Lu warrior. Lost father at 3, studied diligently despite poverty.",
      },
      {
        lat: 35.60, lng: 116.99, year: -520, type: "teaching",
        event: "在曲阜杏坛设教授徒，有教无类、因材施教，弟子三千、贤者七十二人。教授六艺：礼、乐、射、御、书、数",
        eventEn: "Established school at Xingtan (Apricot Altar) in Qufu. Taught 3,000 students regardless of origin, 72 became sages. Taught Six Arts: rites, music, archery, charioteering, calligraphy, mathematics.",
      },
      {
        lat: 34.80, lng: 114.30, year: -497, type: "pilgrimage",
        event: "因鲁国季氏专权，携弟子周游列国十四年，历卫、陈、蔡、楚等国。困于陈蔡断粮七日，弦歌不辍，曰「君子固穷」",
        eventEn: "Left Lu due to Ji clan's usurpation. Traveled 14 years through Wei, Chen, Cai, Chu. Besieged without food for 7 days between Chen and Cai, continued playing music: 'The noble endures poverty.'",
      },
      {
        lat: 34.76, lng: 112.45, year: -518, type: "pilgrimage",
        event: "赴洛阳问礼于老子，观明堂、太庙制度。老子送别曰：「聪明深察而近于死者，好议人者也」。归而叹：「老子其犹龙邪」",
        eventEn: "Traveled to Luoyang to consult Laozi on rites. Laozi warned: 'Those who probe deeply endanger themselves.' Confucius returned marveling: 'Laozi is like a dragon!'",
      },
      {
        lat: 35.60, lng: 116.99, year: -484, type: "teaching",
        event: "晚年归鲁，致力于编订六经（诗、书、礼、乐、易、春秋），整理三千年华夏文明之精华，为万世立教",
        eventEn: "Returned to Lu in later years. Devoted to compiling the Six Classics (Poetry, Documents, Rites, Music, Changes, Spring and Autumn), distilling 3,000 years of Chinese civilization.",
      },
      {
        lat: 35.60, lng: 116.99, year: -479, type: "death",
        event: "辞世于曲阜，葬于泗水之上（孔林）。临终叹「泰山坏乎！梁柱摧乎！哲人萎乎！」弟子守墓三年，子贡守六年",
        eventEn: "Passed in Qufu, buried at Kong Forest by the Si River. Last words: 'Mount Tai crumbles! The pillar breaks! The sage withers!' Disciples mourned 3 years; Zigong mourned 6.",
      },
    ],
  },

  // ── 2. 朱熹 (1130-1200) ─────────────────────────────────────────────
  {
    name: "朱熹",
    nameEn: "Zhu Xi",
    school: "宋明理学",
    primaryLat: 27.76,
    primaryLng: 118.03,
    journeyWaypoints: [
      {
        lat: 26.17, lng: 118.19, year: 1130, type: "birth",
        event: "诞生于福建尤溪，父朱松为进士出身的理学家。自幼聪慧，四岁能问天，十四岁丧父后从学于武夷三先生（刘子翚等）",
        eventEn: "Born in Youxi, Fujian. Father Zhu Song was a Neo-Confucian jinshi scholar. Precocious — asked about heaven at 4. After father's death at 14, studied under Three Masters of Wuyi.",
      },
      {
        lat: 26.65, lng: 117.97, year: 1160, type: "dharma",
        event: "拜延平李侗为师，得程颢、程颐「洛学」正传。在李侗处静坐体悟，终大悟天理流行、格物致知之义，建立理学体系核心",
        eventEn: "Studied under Li Tong in Yanping, inheriting the Luo School of Cheng Hao and Cheng Yi. Through quiet sitting, awakened to 'investigation of things and extension of knowledge.'",
      },
      {
        lat: 29.32, lng: 115.97, year: 1179, type: "teaching",
        event: "知南康军时重修庐山白鹿洞书院，亲定《白鹿洞书院揭示》为学规，与陆九渊在鹅湖之会辩论「尊德性」与「道问学」",
        eventEn: "As prefect of Nankang, restored White Deer Hollow Academy on Mount Lu. Wrote its regulations. Debated Lu Jiuyuan at Ehu Meeting on 'honoring virtue' vs 'following inquiry.'",
      },
      {
        lat: 27.76, lng: 118.03, year: 1183, type: "founding",
        event: "在武夷山紫阳书院讲学著述，历时十余年。编注《四书章句集注》，以《大学》《中庸》《论语》《孟子》为理学纲领，影响科举七百年",
        eventEn: "Lectured at Ziyang Academy, Wuyi Mountain for over a decade. Compiled Four Books commentary, making Great Learning, Doctrine of Mean, Analerta, Mencius the Neo-Confucian canon for 700 years of imperial exams.",
      },
      {
        lat: 27.33, lng: 118.12, year: 1200, type: "death",
        event: "辞世于建阳考亭，终年七十一。临终犹改《大学诚意章》注。虽曾遭庆元党禁、学说被斥为「伪学」，死后平反，谥文，配享孔庙",
        eventEn: "Passed at Kaoting, Jianyang, aged 71. Still revising annotations on his deathbed. Though banned during Qingyuan Prohibition as 'false learning,' posthumously restored and enshrined in Confucian Temple.",
      },
    ],
  },

  // ── 3. 王阳明 (1472-1529) ──────────────────────────────────────────
  {
    name: "王阳明",
    nameEn: "Wang Yangming",
    school: "心学",
    primaryLat: 30.04,
    primaryLng: 121.15,
    journeyWaypoints: [
      {
        lat: 30.04, lng: 121.15, year: 1472, type: "birth",
        event: "诞生于浙江余姚，名守仁，号阳明。父王华为状元，家学渊源。少年即立志「做圣贤」，遍读朱子之书，格竹七日而病",
        eventEn: "Born in Yuyao, Zhejiang. Named Shouren, styled Yangming. Father Wang Hua was a zhuangyuan. Aspired to sagehood as a youth; fell ill 'investigating bamboo' for seven days following Zhu Xi's method.",
      },
      {
        lat: 26.82, lng: 106.63, year: 1508, type: "exile",
        event: "因上疏触怒宦官刘瑾，被贬至贵州龙场驿（今修文县）。蛮荒绝境之中，大悟「圣人之道，吾性自足」，史称「龙场悟道」，心学由此诞生",
        eventEn: "Exiled to Longchang in Guizhou for offending eunuch Liu Jin. In the wilderness, awakened: 'The sage's Way is complete within my own nature.' The Longchang Enlightenment — birth of Heart-Mind Learning.",
      },
      {
        lat: 28.68, lng: 115.89, year: 1510, type: "teaching",
        event: "任江西庐陵知县，后升南赣巡抚，平定宁王朱宸濠叛乱。于南昌设帐讲学，提出「知行合一」「致良知」，弟子云集，心学大兴",
        eventEn: "Appointed magistrate of Luling, later Governor of Southern Jiangxi. Suppressed Prince Zhu Chenhao's rebellion. Lectured in Nanchang on 'Unity of Knowledge and Action' and 'Extension of Innate Knowledge.'",
      },
      {
        lat: 29.87, lng: 120.58, year: 1521, type: "teaching",
        event: "归越后在绍兴稽山书院讲学，提出「四句教」：无善无恶心之体，有善有恶意之动，知善知恶是良知，为善去恶是格物",
        eventEn: "Returned to Shaoxing, lectured at Jishan Academy. Formulated the Four Maxims: 'The substance of mind is beyond good and evil; the movement of intention has good and evil; knowing good and evil is innate knowledge; doing good and removing evil is the investigation of things.'",
      },
      {
        lat: 25.40, lng: 114.40, year: 1529, type: "death",
        event: "奉命征广西思恩田州叛乱途中，病逝于江西南安（今大余县）。弟子问遗言，答曰「此心光明，亦复何言」，谥文成",
        eventEn: "Died en route to suppress a rebellion in Guangxi, at Nan'an, Jiangxi (modern Dayu). When asked for last words: 'My heart is bright — what more is there to say?' Posthumous title: Wencheng.",
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 2 — 其他先贤（坐标数据）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "孟子", nameEn: "Mencius", school: "先秦儒学",
    primaryLat: 35.40, primaryLng: 116.99, journeyWaypoints: [],
  },
  {
    name: "荀子", nameEn: "Xunzi", school: "先秦儒学",
    primaryLat: 35.60, primaryLng: 116.99, journeyWaypoints: [],
  },
  {
    name: "颜回", nameEn: "Yan Hui", school: "先秦儒学",
    primaryLat: 35.60, primaryLng: 116.99, journeyWaypoints: [],
  },
  {
    name: "曾子", nameEn: "Zengzi", school: "先秦儒学",
    primaryLat: 35.35, primaryLng: 117.32, journeyWaypoints: [],
  },
  {
    name: "子思", nameEn: "Zisi", school: "先秦儒学",
    primaryLat: 35.60, primaryLng: 116.99, journeyWaypoints: [],
  },
  {
    name: "董仲舒", nameEn: "Dong Zhongshu", school: "汉唐经学",
    primaryLat: 37.73, primaryLng: 115.70, journeyWaypoints: [],
  },
  {
    name: "韩愈", nameEn: "Han Yu", school: "汉唐经学",
    primaryLat: 34.76, primaryLng: 112.45, journeyWaypoints: [],
  },
  {
    name: "程颢", nameEn: "Cheng Hao", school: "宋明理学",
    primaryLat: 34.76, primaryLng: 112.45, journeyWaypoints: [],
  },
  {
    name: "程颐", nameEn: "Cheng Yi", school: "宋明理学",
    primaryLat: 34.76, primaryLng: 112.45, journeyWaypoints: [],
  },
  {
    name: "张载", nameEn: "Zhang Zai", school: "宋明理学",
    primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [],
  },
  {
    name: "周敦颐", nameEn: "Zhou Dunyi", school: "宋明理学",
    primaryLat: 28.68, primaryLng: 115.89, journeyWaypoints: [],
  },
  {
    name: "邵雍", nameEn: "Shao Yong", school: "宋明理学",
    primaryLat: 34.76, primaryLng: 112.45, journeyWaypoints: [],
  },
  {
    name: "陆九渊", nameEn: "Lu Jiuyuan", school: "心学",
    primaryLat: 27.92, primaryLng: 116.87, journeyWaypoints: [],
  },
  {
    name: "薛瑄", nameEn: "Xue Xuan", school: "宋明理学",
    primaryLat: 34.50, primaryLng: 110.42, journeyWaypoints: [],
  },
  {
    name: "王夫之", nameEn: "Wang Fuzhi", school: "宋明理学",
    primaryLat: 27.24, primaryLng: 112.74, journeyWaypoints: [],
  },
  {
    name: "顾炎武", nameEn: "Gu Yanwu", school: "宋明理学",
    primaryLat: 31.38, primaryLng: 120.96, journeyWaypoints: [],
  },
  {
    name: "黄宗羲", nameEn: "Huang Zongxi", school: "心学",
    primaryLat: 30.04, primaryLng: 121.15, journeyWaypoints: [],
  },
  {
    name: "方孝孺", nameEn: "Fang Xiaoru", school: "宋明理学",
    primaryLat: 28.00, primaryLng: 120.65, journeyWaypoints: [],
  },
  {
    name: "刘宗周", nameEn: "Liu Zongzhou", school: "心学",
    primaryLat: 29.87, primaryLng: 120.58, journeyWaypoints: [],
  },
  {
    name: "戴震", nameEn: "Dai Zhen", school: "汉唐经学",
    primaryLat: 30.10, primaryLng: 118.00, journeyWaypoints: [],
  },
  {
    name: "梁漱溟", nameEn: "Liang Shuming", school: "当代新儒学",
    primaryLat: 39.90, primaryLng: 116.40, journeyWaypoints: [],
  },
  {
    name: "熊十力", nameEn: "Xiong Shili", school: "当代新儒学",
    primaryLat: 30.58, primaryLng: 114.28, journeyWaypoints: [],
  },
  {
    name: "冯友兰", nameEn: "Feng Youlan", school: "当代新儒学",
    primaryLat: 39.90, primaryLng: 116.40, journeyWaypoints: [],
  },
  {
    name: "唐君毅", nameEn: "Tang Junyi", school: "当代新儒学",
    primaryLat: 29.57, primaryLng: 106.55, journeyWaypoints: [],
  },
  {
    name: "牟宗三", nameEn: "Mou Zongsan", school: "当代新儒学",
    primaryLat: 39.90, primaryLng: 116.40, journeyWaypoints: [],
  },
];
