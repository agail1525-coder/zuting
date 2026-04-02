// ═══════════════════════════════════════════════════════════════════════════
// 原住民灵性大图谱 — 22位先知坐标 + 2位核心人物人生轨迹
// Indigenous Spirituality Atlas — Geographic & Journey Data
// ═══════════════════════════════════════════════════════════════════════════

import type { PatriarchMapData } from "@/components/atlas";

export const SCHOOL_COLORS: Record<string, string> = {
  北美原住民: "#78716C",
  中美原住民: "#A8A29E",
  南美原住民: "#D6D3D1",
  非洲传统: "#57534E",
  大洋洲原住民: "#44403C",
  东亚萨满: "#292524",
};

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 1 — 2位核心人物（完整人生轨迹）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── 1. 坐牛 (Sitting Bull, 1831-1890) ─────────────────────────────────
  {
    name: "坐牛",
    nameEn: "Sitting Bull (Tatanka Iyotake)",
    school: "北美原住民",
    primaryLat: 46.00,
    primaryLng: -100.30,
    journeyWaypoints: [
      {
        lat: 46.00, lng: -100.30, year: 1831, type: "birth",
        event: "诞生于南达科他大平原的大河畔，亨克帕帕拉科塔苏族部落，幼名「跳跃的獾」，十四岁首次参战后获名「坐牛」",
        eventEn: "Born along the Grand River in South Dakota, Hunkpapa Lakota Sioux. Originally named 'Jumping Badger', earned the name 'Sitting Bull' after his first battle at 14.",
      },
      {
        lat: 46.00, lng: -100.30, year: 1856, type: "teaching",
        event: "成为亨克帕帕部落的圣人与精神领袖，主持太阳舞仪式，以神圣异象引领族人，被尊为拉科塔联盟最高领袖",
        eventEn: "Became holy man and spiritual leader of the Hunkpapa, presided over Sun Dance ceremonies, guided people through sacred visions, recognized as supreme chief of the Lakota confederation.",
      },
      {
        lat: 45.57, lng: -107.43, year: 1876, type: "exile",
        event: "小大角河战役——率拉科塔与夏安联军大败卡斯特第七骑兵团，这是美洲原住民抵抗运动的最辉煌胜利",
        eventEn: "Battle of Little Bighorn — led Lakota and Cheyenne warriors to defeat Custer's 7th Cavalry, the greatest victory of the Native American resistance movement.",
      },
      {
        lat: 49.50, lng: -104.00, year: 1877, type: "pilgrimage",
        event: "率部越境流亡加拿大萨斯喀彻温省，在「祖母的土地」上居住四年，拒绝美国政府的招降条件",
        eventEn: "Led his people across the border into Saskatchewan, Canada ('Grandmother's Land'), lived there for four years, rejecting US government surrender terms.",
      },
      {
        lat: 46.08, lng: -100.89, year: 1890, type: "death",
        event: "在大河保留地被印第安警察击杀，年五十九岁。其精神至今激励全球原住民权利运动，被视为抵抗殖民压迫的永恒象征",
        eventEn: "Killed by Indian agency police at Standing Rock Reservation, age 59. His spirit continues to inspire global indigenous rights movements as an eternal symbol of resistance against colonial oppression.",
      },
    ],
  },

  // ── 2. 克雷齐霍斯 (Crazy Horse, 1840-1877) ───────────────────────────
  {
    name: "克雷齐霍斯",
    nameEn: "Crazy Horse (Tashunka Witko)",
    school: "北美原住民",
    primaryLat: 43.88,
    primaryLng: -103.46,
    journeyWaypoints: [
      {
        lat: 43.88, lng: -103.46, year: 1840, type: "birth",
        event: "诞生于南达科他黑山附近，奥格拉拉拉科塔苏族，因少年时期的神圣异象获得「Crazy Horse」之名",
        eventEn: "Born near the Black Hills, South Dakota, Oglala Lakota Sioux. Received the name 'Crazy Horse' after a sacred vision in youth.",
      },
      {
        lat: 43.88, lng: -103.46, year: 1864, type: "teaching",
        event: "成为奥格拉拉部落最勇猛的战士与精神领袖，以超凡的骑术与战术闻名，从不允许他人为自己画像或拍照",
        eventEn: "Became the most renowned warrior and spiritual leader of the Oglala, famed for extraordinary horsemanship and tactics, never allowing anyone to draw or photograph him.",
      },
      {
        lat: 45.57, lng: -107.43, year: 1876, type: "exile",
        event: "小大角河战役中率骑兵冲锋，与坐牛联手大败卡斯特，此役彻底粉碎了美军不可战胜的神话",
        eventEn: "Led the cavalry charge at the Battle of Little Bighorn alongside Sitting Bull, decisively defeating Custer and shattering the myth of US military invincibility.",
      },
      {
        lat: 42.67, lng: -103.47, year: 1877, type: "death",
        event: "在内布拉斯加罗宾逊堡投降后被刺杀，年仅三十七岁。黑山巨型石雕纪念碑至今仍在建造中，是世界最大雕塑工程",
        eventEn: "Stabbed to death after surrendering at Fort Robinson, Nebraska, age 37. The Crazy Horse Memorial in the Black Hills, the world's largest sculpture project, remains under construction.",
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 2 — 20位重要人物（标记点位）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "羽蛇神",
    nameEn: "Quetzalcoatl",
    school: "中美原住民",
    primaryLat: 19.69, primaryLng: -98.84,
    journeyWaypoints: [],
  },
  {
    name: "帕查库特克",
    nameEn: "Pachacuti (Inca Emperor)",
    school: "南美原住民",
    primaryLat: -13.52, primaryLng: -71.97,
    journeyWaypoints: [],
  },
  {
    name: "特库姆塞",
    nameEn: "Tecumseh",
    school: "北美原住民",
    primaryLat: 40.14, primaryLng: -83.45,
    journeyWaypoints: [],
  },
  {
    name: "杰罗尼莫",
    nameEn: "Geronimo (Goyaale)",
    school: "北美原住民",
    primaryLat: 33.17, primaryLng: -109.95,
    journeyWaypoints: [],
  },
  {
    name: "萨卡加维亚",
    nameEn: "Sacagawea",
    school: "北美原住民",
    primaryLat: 45.59, primaryLng: -112.63,
    journeyWaypoints: [],
  },
  {
    name: "波卡洪塔斯",
    nameEn: "Pocahontas",
    school: "北美原住民",
    primaryLat: 37.54, primaryLng: -77.43,
    journeyWaypoints: [],
  },
  {
    name: "黑麋鹿",
    nameEn: "Black Elk (Hehaka Sapa)",
    school: "北美原住民",
    primaryLat: 43.88, primaryLng: -103.46,
    journeyWaypoints: [],
  },
  {
    name: "维拉科查",
    nameEn: "Viracocha (Inca Creator God)",
    school: "南美原住民",
    primaryLat: -15.50, primaryLng: -70.02,
    journeyWaypoints: [],
  },
  {
    name: "蒙特祖马",
    nameEn: "Montezuma II (Aztec Emperor)",
    school: "中美原住民",
    primaryLat: 19.43, primaryLng: -99.13,
    journeyWaypoints: [],
  },
  {
    name: "图帕克·阿马鲁",
    nameEn: "Tupac Amaru II",
    school: "南美原住民",
    primaryLat: -14.49, primaryLng: -71.13,
    journeyWaypoints: [],
  },
  {
    name: "曼丁哥·格里奥特",
    nameEn: "Mandinka Griot (West African Oral Keeper)",
    school: "非洲传统",
    primaryLat: 12.65, primaryLng: -8.00,
    journeyWaypoints: [],
  },
  {
    name: "尚戈",
    nameEn: "Shango (Yoruba Thunder God)",
    school: "非洲传统",
    primaryLat: 7.60, primaryLng: 3.90,
    journeyWaypoints: [],
  },
  {
    name: "奥莫尔",
    nameEn: "Oduduwa (Yoruba Ancestor)",
    school: "非洲传统",
    primaryLat: 6.50, primaryLng: 3.40,
    journeyWaypoints: [],
  },
  {
    name: "恩古尼祖先",
    nameEn: "Nguni Ancestors (Southern Africa)",
    school: "非洲传统",
    primaryLat: -29.86, primaryLng: 31.02,
    journeyWaypoints: [],
  },
  {
    name: "毛利酋长",
    nameEn: "Maori Rangatira (New Zealand Chief)",
    school: "大洋洲原住民",
    primaryLat: -41.29, primaryLng: 174.78,
    journeyWaypoints: [],
  },
  {
    name: "乌鲁鲁长老",
    nameEn: "Uluru Elder (Australian Aboriginal)",
    school: "大洋洲原住民",
    primaryLat: -25.34, primaryLng: 131.04,
    journeyWaypoints: [],
  },
  {
    name: "通加里罗",
    nameEn: "Tongariro (Maori Sacred Mountain Spirit)",
    school: "大洋洲原住民",
    primaryLat: -39.28, primaryLng: 175.63,
    journeyWaypoints: [],
  },
  {
    name: "白牛女",
    nameEn: "White Buffalo Calf Woman",
    school: "北美原住民",
    primaryLat: 44.00, primaryLng: -103.00,
    journeyWaypoints: [],
  },
  {
    name: "华纳科里",
    nameEn: "Huanacauri (Inca Sacred Ancestor)",
    school: "南美原住民",
    primaryLat: -13.52, primaryLng: -71.97,
    journeyWaypoints: [],
  },
  {
    name: "伊图里俾格米",
    nameEn: "Ituri Pygmy Elder (Central Africa)",
    school: "非洲传统",
    primaryLat: 1.50, primaryLng: 28.50,
    journeyWaypoints: [],
  },
];
