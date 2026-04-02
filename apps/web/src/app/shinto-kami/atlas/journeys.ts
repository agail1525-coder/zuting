// ═══════════════════════════════════════════════════════════════════════════
// 神道教神灵大图谱 — 25位神灵与神道家坐标 + 3位核心人物人生轨迹数据
// Grand Shinto Kami Atlas — Geographic & Journey Data
// ═══════════════════════════════════════════════════════════════════════════

import type { PatriarchMapData } from "@/components/atlas";

// School color mapping
export const SCHOOL_COLORS: Record<string, string> = {
  古代神道: "#E11D48",
  伊势神道: "#F43F5E",
  吉田神道: "#FB7185",
  国学神道: "#FDA4AF",
  教派神道: "#BE123C",
  神社神道: "#9F1239",
};

export function getSchoolColor(school: string): string {
  return SCHOOL_COLORS[school] || "#E11D48";
}

// ═══════════════════════════════════════════════════════════════════════════
// 25位神道教神灵与神道家完整坐标数据
// ═══════════════════════════════════════════════════════════════════════════

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 1 — 3位核心人物（完整人生轨迹）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── 1. 天照大神 ──────────────────────────────────────────────
  {
    name: "天照大神",
    nameEn: "Amaterasu Omikami",
    school: "古代神道",
    primaryLat: 34.45,
    primaryLng: 136.73,
    journeyWaypoints: [
      {
        lat: 34.45, lng: 136.73, year: null, type: "birth",
        event: "自高天原降临，为伊邪那岐左目所生之日神，三贵子之首，天界至高主宰",
        eventEn: "Descended from Takamagahara, born from the left eye of Izanagi. Supreme deity of the heavens, first of the Three Noble Children.",
      },
      {
        lat: 32.73, lng: 131.37, year: null, type: "founding",
        event: "天岩户事件：因素戔嗚尊暴行而隐于天岩户，天地陷入黑暗，众神以祭祀与舞蹈请出",
        eventEn: "Ama-no-Iwato incident: withdrew into the Heavenly Rock Cave due to Susanoo's violence. World plunged into darkness until gods lured her out with ritual and dance.",
      },
      {
        lat: 34.45, lng: 136.73, year: null, type: "teaching",
        event: "授天孙琼琼杵尊三种神器（八咫镜、天丛云剑、八尺琼勾玉），颁天壤无穷之神勅，令统治瑞穂国",
        eventEn: "Bestowed the Three Sacred Treasures upon Ninigi-no-Mikoto (mirror, sword, jewel). Decreed the divine rule of the Land of Abundant Rice.",
      },
      {
        lat: 34.45, lng: 136.73, year: -4, type: "founding",
        event: "伊势神宫奉祀天照大神为内宫主祭神，为日本神道最高圣地，式年迁宫制度延续至今",
        eventEn: "Ise Grand Shrine enshrines Amaterasu as the chief deity of the Inner Shrine. Supreme Shinto holy site, with the Shikinen Sengu tradition continuing to this day.",
      },
    ],
  },

  // ── 2. 本居宣长 (1730-1801) ──────────────────────────────────────────
  {
    name: "本居宣长",
    nameEn: "Motoori Norinaga",
    school: "国学神道",
    primaryLat: 34.58,
    primaryLng: 136.53,
    journeyWaypoints: [
      {
        lat: 34.58, lng: 136.53, year: 1730, type: "birth",
        event: "出生于伊势国松阪（今三重县松阪市），商人之家，自幼嗜书好学",
        eventEn: "Born in Matsusaka, Ise Province (now Mie Prefecture), to a merchant family. Loved reading from childhood.",
      },
      {
        lat: 35.01, lng: 135.77, year: 1752, type: "dharma",
        event: "赴京都学习医学与儒学，偶读契冲著作而倾心国学，立志研究日本古典",
        eventEn: "Studied medicine and Confucianism in Kyoto. Encountering Keichu's works, devoted himself to National Learning and Japanese classics.",
      },
      {
        lat: 34.58, lng: 136.53, year: 1763, type: "teaching",
        event: "于松阪铃屋开始三十五年《古事記传》研究，夜以继日考证上古神话，弟子遍布全国",
        eventEn: "Began 35 years of research on the Kojiki-den at the Suzunoya studio in Matsusaka. Meticulous study of ancient myths, disciples across Japan.",
      },
      {
        lat: 34.58, lng: 136.53, year: 1798, type: "founding",
        event: "完成四十四卷《古事記传》，以「物哀」美学阐释日本精神，确立国学神道理论体系",
        eventEn: "Completed the 44-volume Kojiki-den. Articulated Japanese spirit through 'mono no aware' aesthetics, establishing the National Learning Shinto theoretical system.",
      },
      {
        lat: 34.58, lng: 136.53, year: 1801, type: "death",
        event: "于松阪辞世，遗愿葬于山室山，墓旁植樱花，碑铭「敷島の大和心を人問はば 朝日ににほふ山ざくら花」",
        eventEn: "Passed in Matsusaka. Wished to be buried at Mt. Yamamuro with cherry trees. Epitaph: 'If asked about the Japanese spirit — mountain cherry blossoms fragrant in the morning sun.'",
      },
    ],
  },

  // ── 3. 出口王仁三郎 (1871-1948) ──────────────────────────────────────
  {
    name: "出口王仁三郎",
    nameEn: "Deguchi Onisaburo",
    school: "教派神道",
    primaryLat: 35.01,
    primaryLng: 135.58,
    journeyWaypoints: [
      {
        lat: 35.01, lng: 135.58, year: 1871, type: "birth",
        event: "出生于京都府龟冈（保津川畔），原名上田喜三郎，农家子弟",
        eventEn: "Born in Kameoka, Kyoto Prefecture (by the Hozu River). Original name Ueda Kisaburo, son of a farming family.",
      },
      {
        lat: 35.01, lng: 135.58, year: 1898, type: "dharma",
        event: "于高熊山获得一周间的灵的体验（帰神），声称灵魂游历神界，获得神示",
        eventEn: "Experienced a week-long spiritual revelation (kishin) on Mount Takakuma. Claimed his soul traveled through the divine realm, receiving divine messages.",
      },
      {
        lat: 35.30, lng: 135.25, year: 1899, type: "founding",
        event: "与出口直合流，于綾部开教大本教，融合古神道与万教归一思想，信众迅速扩大",
        eventEn: "Joined Deguchi Nao in Ayabe, founding the Omoto religion. Fused ancient Shinto with universalist thought, followers grew rapidly.",
      },
      {
        lat: 41.80, lng: 123.43, year: 1924, type: "teaching",
        event: "远赴满洲蒙古布教，试图建立「东亚宗教联盟」，后遭日本军部镇压（第一次大本事件）",
        eventEn: "Traveled to Manchuria and Mongolia for missionary work, attempting to build an 'East Asian Religious Alliance.' Later suppressed by the Japanese military (First Omoto Incident).",
      },
      {
        lat: 35.01, lng: 135.58, year: 1948, type: "death",
        event: "战后于龟冈辞世，一生两度入狱，著有《霊界物語》八十一卷，被誉为近代新宗教之父",
        eventEn: "Died in Kameoka after the war. Imprisoned twice. Authored the 81-volume Reikai Monogatari, hailed as the father of modern new religions.",
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 2 — 22位神灵与神道家（坐标 + 基本信息）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "素戔嗚尊", nameEn: "Susanoo-no-Mikoto", school: "古代神道",
    primaryLat: 35.47, primaryLng: 132.68, journeyWaypoints: [],
  },
  {
    name: "大国主命", nameEn: "Okuninushi-no-Mikoto", school: "古代神道",
    primaryLat: 35.47, primaryLng: 132.68, journeyWaypoints: [],
  },
  {
    name: "猿田彦", nameEn: "Sarutahiko Okami", school: "古代神道",
    primaryLat: 34.45, primaryLng: 136.73, journeyWaypoints: [],
  },
  {
    name: "神武天皇", nameEn: "Emperor Jimmu", school: "古代神道",
    primaryLat: 34.69, primaryLng: 135.20, journeyWaypoints: [],
  },
  {
    name: "日本武尊", nameEn: "Yamato Takeru", school: "古代神道",
    primaryLat: 34.97, primaryLng: 136.91, journeyWaypoints: [],
  },
  {
    name: "圣德太子", nameEn: "Prince Shotoku", school: "古代神道",
    primaryLat: 34.69, primaryLng: 135.76, journeyWaypoints: [],
  },
  {
    name: "役小角", nameEn: "En no Ozunu", school: "古代神道",
    primaryLat: 34.38, primaryLng: 135.95, journeyWaypoints: [],
  },
  {
    name: "空也", nameEn: "Kuya", school: "古代神道",
    primaryLat: 35.01, primaryLng: 135.77, journeyWaypoints: [],
  },
  {
    name: "吉田兼倶", nameEn: "Yoshida Kanetomo", school: "吉田神道",
    primaryLat: 35.01, primaryLng: 135.77, journeyWaypoints: [],
  },
  {
    name: "度会家行", nameEn: "Watarai Ieyuki", school: "伊势神道",
    primaryLat: 34.45, primaryLng: 136.73, journeyWaypoints: [],
  },
  {
    name: "荷田春満", nameEn: "Kada no Azumamaro", school: "国学神道",
    primaryLat: 34.97, primaryLng: 135.77, journeyWaypoints: [],
  },
  {
    name: "贺茂真淵", nameEn: "Kamo no Mabuchi", school: "国学神道",
    primaryLat: 34.69, primaryLng: 137.73, journeyWaypoints: [],
  },
  {
    name: "平田篤胤", nameEn: "Hirata Atsutane", school: "国学神道",
    primaryLat: 39.72, primaryLng: 140.10, journeyWaypoints: [],
  },
  {
    name: "黒住宗忠", nameEn: "Kurozumi Munetada", school: "教派神道",
    primaryLat: 34.67, primaryLng: 133.92, journeyWaypoints: [],
  },
  {
    name: "天理教中山みき", nameEn: "Nakayama Miki (Tenrikyo)", school: "教派神道",
    primaryLat: 34.60, primaryLng: 135.84, journeyWaypoints: [],
  },
  {
    name: "金光教赤沢文治", nameEn: "Akazawa Bunji (Konkokyo)", school: "教派神道",
    primaryLat: 34.65, primaryLng: 133.60, journeyWaypoints: [],
  },
  {
    name: "国常立尊", nameEn: "Kunitokotachi-no-Mikoto", school: "古代神道",
    primaryLat: 34.45, primaryLng: 136.73, journeyWaypoints: [],
  },
  {
    name: "少彦名命", nameEn: "Sukunahikona-no-Mikoto", school: "古代神道",
    primaryLat: 33.84, primaryLng: 132.77, journeyWaypoints: [],
  },
  {
    name: "菅原道真", nameEn: "Sugawara no Michizane", school: "神社神道",
    primaryLat: 33.59, primaryLng: 130.40, journeyWaypoints: [],
  },
  {
    name: "楠木正成", nameEn: "Kusunoki Masashige", school: "神社神道",
    primaryLat: 34.10, primaryLng: 135.46, journeyWaypoints: [],
  },
  {
    name: "東郷平八郎", nameEn: "Togo Heihachiro", school: "神社神道",
    primaryLat: 35.68, primaryLng: 139.74, journeyWaypoints: [],
  },
  {
    name: "明治天皇", nameEn: "Emperor Meiji", school: "神社神道",
    primaryLat: 35.68, primaryLng: 139.74, journeyWaypoints: [],
  },
  {
    name: "伊邪那岐", nameEn: "Izanagi-no-Mikoto", school: "古代神道",
    primaryLat: 34.23, primaryLng: 135.17, journeyWaypoints: [],
  },
  {
    name: "伊邪那美", nameEn: "Izanami-no-Mikoto", school: "古代神道",
    primaryLat: 34.23, primaryLng: 135.17, journeyWaypoints: [],
  },
];
