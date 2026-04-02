// ═══════════════════════════════════════════════════════════════════════════
// 基督教先贤大图谱 — 28位先贤坐标 + 3位核心先贤人生轨迹数据
// Grand Christianity Patriarch Atlas — Geographic & Journey Data
// ═══════════════════════════════════════════════════════════════════════════

import type { PatriarchMapData } from "@/components/atlas";

export const SCHOOL_COLORS: Record<string, string> = {
  天主教: "#3B82F6",
  东正教: "#60A5FA",
  新教: "#93C5FD",
  圣公会: "#2563EB",
  科普特教会: "#1D4ED8",
  早期教会: "#BFDBFE",
};

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 1 — 3位核心先贤（完整人生轨迹）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── 1. 耶稣 (~4BC-30AD) ──────────────────────────────────────────────
  {
    name: "耶稣",
    nameEn: "Jesus Christ",
    school: "早期教会",
    primaryLat: 31.78,
    primaryLng: 35.24,
    journeyWaypoints: [
      {
        lat: 31.70, lng: 35.21, year: -4, type: "birth",
        event: "诞生于犹大伯利恒的马槽中，母亲马利亚因圣灵感孕，东方三博士循星而来朝拜，天使向牧羊人报信「大喜的信息」",
        eventEn: "Born in a manger in Bethlehem of Judea. Virgin Mary conceived by the Holy Spirit. Magi followed the star; angels announced to shepherds.",
      },
      {
        lat: 32.70, lng: 35.30, year: 6, type: "other",
        event: "在加利利拿撒勒长大，为木匠约瑟之养子。十二岁随父母上耶路撒冷过逾越节，在圣殿中与教师讨论律法，令众人惊异",
        eventEn: "Grew up in Nazareth of Galilee as son of carpenter Joseph. At 12, discussed Torah with teachers in the Jerusalem Temple.",
      },
      {
        lat: 31.84, lng: 35.55, year: 27, type: "ordination",
        event: "在约旦河接受先知施洗约翰的洗礼，天开了，圣灵如鸽子降在他身上，天上有声音说「这是我的爱子，我所喜悦的」",
        eventEn: "Baptized by John the Baptist in the Jordan River. The heavens opened, the Spirit descended like a dove: 'This is my beloved Son.'",
      },
      {
        lat: 32.83, lng: 35.59, year: 28, type: "teaching",
        event: "在加利利海沿岸传道三年，行五饼二鱼、水上行走等神迹，登山宝训传授「八福」与主祷文，召选十二使徒",
        eventEn: "Three years of ministry around the Sea of Galilee. Miracles of loaves and fishes, walking on water. Sermon on the Mount, chose Twelve Apostles.",
      },
      {
        lat: 31.78, lng: 35.24, year: 30, type: "death",
        event: "在耶路撒冷被犹大出卖，经犹太公议会与罗马总督彼拉多审判，于各各他山被钉十字架。第三日从死里复活，四十日后升天",
        eventEn: "Betrayed by Judas in Jerusalem, tried by Sanhedrin and Pontius Pilate, crucified at Golgotha. Rose from the dead on the third day, ascended after 40 days.",
      },
    ],
  },

  // ── 2. 保罗 (~5-67AD) ───────────────────────────────────────────────
  {
    name: "保罗",
    nameEn: "Paul the Apostle",
    school: "早期教会",
    primaryLat: 41.90,
    primaryLng: 12.50,
    journeyWaypoints: [
      {
        lat: 36.92, lng: 34.89, year: 5, type: "birth",
        event: "诞生于基利家的塔尔苏斯（今土耳其），罗马公民，法利赛人，师从耶路撒冷著名拉比迦玛列，精通摩西律法与希腊哲学",
        eventEn: "Born in Tarsus of Cilicia (modern Turkey), Roman citizen, Pharisee, studied under Rabbi Gamaliel in Jerusalem.",
      },
      {
        lat: 33.51, lng: 36.29, year: 34, type: "dharma",
        event: "前往大马士革途中，忽有大光从天降下，听见主声音说「扫罗，你为什么逼迫我？」三日失明后被亚拿尼亚医治，归信基督",
        eventEn: "On the road to Damascus, struck by a great light from heaven: 'Saul, why do you persecute me?' Blinded three days, healed by Ananias, converted.",
      },
      {
        lat: 36.20, lng: 36.16, year: 47, type: "teaching",
        event: "以安提阿为基地展开三次宣教旅程，在此门徒首次被称为「基督徒」。与巴拿巴同工，向外邦人传福音，突破犹太律法藩篱",
        eventEn: "Based in Antioch, launched three missionary journeys. Disciples first called 'Christians' here. Partnered with Barnabas to preach to Gentiles.",
      },
      {
        lat: 37.94, lng: 27.34, year: 52, type: "pilgrimage",
        event: "在以弗所建立教会，驻留三年传道，写下多封书信（哥林多书、加拉太书等）。在推喇奴学房每日辩论，使全亚西亚听闻福音",
        eventEn: "Established church in Ephesus, stayed three years. Wrote epistles (Corinthians, Galatians). Debated daily at Tyrannus' hall, spreading the Gospel across Asia.",
      },
      {
        lat: 41.90, lng: 12.50, year: 67, type: "death",
        event: "被押解至罗马受审，在狱中写下「监狱书信」（以弗所书、腓立比书等）。尼禄皇帝迫害期间于罗马殉道，被斩首于三泉修道院附近",
        eventEn: "Taken to Rome for trial, wrote 'Prison Epistles' (Ephesians, Philippians). Martyred under Emperor Nero, beheaded near Tre Fontane Abbey.",
      },
    ],
  },

  // ── 3. 方济各 (1182-1226) ───────────────────────────────────────────
  {
    name: "方济各",
    nameEn: "Francis of Assisi",
    school: "天主教",
    primaryLat: 43.07,
    primaryLng: 12.62,
    journeyWaypoints: [
      {
        lat: 43.07, lng: 12.62, year: 1182, type: "birth",
        event: "诞生于意大利翁布里亚阿西西的富裕布商家庭，少年时追求骑士荣耀与世俗享乐，参加佩鲁贾战争后被俘一年",
        eventEn: "Born in Assisi, Umbria to a wealthy cloth merchant. Pursued knightly glory, captured for a year in the Perugia war.",
      },
      {
        lat: 43.06, lng: 12.62, year: 1205, type: "dharma",
        event: "在圣达米亚诺残破教堂祈祷时，十字架上的基督像对他说话「方济各，去修复我的教会」。变卖家产，拥抱贫穷，与父亲决裂",
        eventEn: "Praying in the ruined San Damiano chapel, the crucifix spoke: 'Francis, go repair my Church.' Sold possessions, embraced poverty, broke with his father.",
      },
      {
        lat: 30.04, lng: 31.24, year: 1219, type: "pilgrimage",
        event: "在第五次十字军东征期间，只身穿越战线面见埃及苏丹马利克·卡米勒，以和平对话取代武力，开创宗教间对话的先河",
        eventEn: "During the Fifth Crusade, crossed battle lines to meet Sultan al-Kamil of Egypt. Pioneered interfaith dialogue through peaceful encounter.",
      },
      {
        lat: 43.07, lng: 12.62, year: 1209, type: "founding",
        event: "获教皇英诺森三世口头批准创立方济各会（小兄弟会），以绝对贫穷、谦卑服务为宗旨，弟兄们赤足托钵，服务麻风病人",
        eventEn: "Pope Innocent III verbally approved the Franciscan Order (Order of Friars Minor). Absolute poverty, humility, service to lepers.",
      },
      {
        lat: 43.07, lng: 12.62, year: 1226, type: "death",
        event: "在波尔齐翁库拉小堂（Porziuncola）辞世，遗言「我已做完我该做的，愿基督教导你们该做的」。两年后被教皇额我略九世封圣",
        eventEn: "Died at the Porziuncola chapel. Last words: 'I have done what is mine; may Christ teach you what is yours.' Canonized two years later by Pope Gregory IX.",
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 2 — 其他先贤（坐标数据）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "彼得", nameEn: "Peter the Apostle", school: "早期教会",
    primaryLat: 31.78, primaryLng: 35.24, journeyWaypoints: [],
  },
  {
    name: "约翰", nameEn: "John the Apostle", school: "早期教会",
    primaryLat: 37.94, primaryLng: 27.34, journeyWaypoints: [],
  },
  {
    name: "奥古斯丁", nameEn: "Augustine of Hippo", school: "早期教会",
    primaryLat: 36.37, primaryLng: 7.75, journeyWaypoints: [],
  },
  {
    name: "阿奎那", nameEn: "Thomas Aquinas", school: "天主教",
    primaryLat: 41.90, primaryLng: 12.50, journeyWaypoints: [],
  },
  {
    name: "马丁·路德", nameEn: "Martin Luther", school: "新教",
    primaryLat: 51.87, primaryLng: 12.65, journeyWaypoints: [],
  },
  {
    name: "加尔文", nameEn: "John Calvin", school: "新教",
    primaryLat: 46.20, primaryLng: 6.15, journeyWaypoints: [],
  },
  {
    name: "约翰·卫斯理", nameEn: "John Wesley", school: "新教",
    primaryLat: 51.51, primaryLng: -0.13, journeyWaypoints: [],
  },
  {
    name: "君士坦丁", nameEn: "Constantine the Great", school: "早期教会",
    primaryLat: 41.01, primaryLng: 28.98, journeyWaypoints: [],
  },
  {
    name: "亚他那修", nameEn: "Athanasius of Alexandria", school: "早期教会",
    primaryLat: 31.20, primaryLng: 29.92, journeyWaypoints: [],
  },
  {
    name: "巴西略", nameEn: "Basil the Great", school: "东正教",
    primaryLat: 38.65, primaryLng: 35.48, journeyWaypoints: [],
  },
  {
    name: "金口约翰", nameEn: "John Chrysostom", school: "东正教",
    primaryLat: 41.01, primaryLng: 28.98, journeyWaypoints: [],
  },
  {
    name: "耶柔米", nameEn: "Jerome", school: "早期教会",
    primaryLat: 43.76, primaryLng: 15.44, journeyWaypoints: [],
  },
  {
    name: "额我略一世", nameEn: "Pope Gregory I", school: "天主教",
    primaryLat: 41.90, primaryLng: 12.50, journeyWaypoints: [],
  },
  {
    name: "本笃", nameEn: "Benedict of Nursia", school: "天主教",
    primaryLat: 41.72, primaryLng: 13.81, journeyWaypoints: [],
  },
  {
    name: "伊格纳丢", nameEn: "Ignatius of Antioch", school: "早期教会",
    primaryLat: 36.20, primaryLng: 36.16, journeyWaypoints: [],
  },
  {
    name: "多马", nameEn: "Thomas the Apostle", school: "早期教会",
    primaryLat: 13.09, primaryLng: 80.27, journeyWaypoints: [],
  },
  {
    name: "德兰修女", nameEn: "Mother Teresa", school: "天主教",
    primaryLat: 42.70, primaryLng: 23.32, journeyWaypoints: [],
  },
  {
    name: "约翰·诺克斯", nameEn: "John Knox", school: "新教",
    primaryLat: 55.95, primaryLng: -3.19, journeyWaypoints: [],
  },
  {
    name: "慈运理", nameEn: "Huldrych Zwingli", school: "新教",
    primaryLat: 47.37, primaryLng: 8.54, journeyWaypoints: [],
  },
  {
    name: "坎特伯雷的安瑟伦", nameEn: "Anselm of Canterbury", school: "天主教",
    primaryLat: 51.28, primaryLng: 1.08, journeyWaypoints: [],
  },
  {
    name: "托马斯·莫尔", nameEn: "Thomas More", school: "天主教",
    primaryLat: 51.51, primaryLng: -0.13, journeyWaypoints: [],
  },
  {
    name: "希尔德加德", nameEn: "Hildegard of Bingen", school: "天主教",
    primaryLat: 49.98, primaryLng: 7.87, journeyWaypoints: [],
  },
  {
    name: "迈斯特·埃克哈特", nameEn: "Meister Eckhart", school: "天主教",
    primaryLat: 51.08, primaryLng: 13.74, journeyWaypoints: [],
  },
  {
    name: "朋霍费尔", nameEn: "Dietrich Bonhoeffer", school: "新教",
    primaryLat: 52.52, primaryLng: 13.41, journeyWaypoints: [],
  },
];
