// ═══════════════════════════════════════════════════════════════════════════
// 净土宗祖师大图谱 — 13位祖师坐标 + 3位核心祖师人生轨迹
// Grand Pure Land Patriarch Atlas — Geographic & Journey Data
// ═══════════════════════════════════════════════════════════════════════════

import type { PatriarchMapData } from "@/components/atlas";

export const SCHOOL_COLORS: Record<string, string> = {
  净土宗: "#C4A265",
};

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  // ── 慧远 (334-416) 净土宗初祖 ──
  {
    name: "慧远", nameEn: "Huiyuan", school: "净土宗",
    primaryLat: 29.58, primaryLng: 115.97,
    journeyWaypoints: [
      { lat: 34.76, lng: 112.45, year: 334, type: "birth", event: "出生于雁门楼烦（今山西代县），少习儒道百家", eventEn: "Born in Yanmen, Shanxi. Studied Confucianism and Daoism in youth." },
      { lat: 29.58, lng: 115.97, year: 381, type: "founding", event: "入庐山东林寺，开山立净土宗，结白莲社念佛", eventEn: "Founded Donglin Temple on Mount Lu. Established the White Lotus Society for Pure Land practice." },
      { lat: 29.58, lng: 115.97, year: 402, type: "teaching", event: "率一百二十三人于东林寺前般若台立誓往生西方极乐世界", eventEn: "Led 123 devotees in vowing rebirth in the Western Pure Land at Donglin Temple." },
      { lat: 29.58, lng: 115.97, year: 416, type: "death", event: "圆寂于庐山东林寺，世寿八十三岁", eventEn: "Passed away at Donglin Temple, Mount Lu. Aged 83." },
    ],
  },
  // ── 善导 (613-681) 净土宗二祖 ──
  {
    name: "善导", nameEn: "Shandao", school: "净土宗",
    primaryLat: 34.26, primaryLng: 108.94,
    journeyWaypoints: [
      { lat: 36.81, lng: 118.31, year: 613, type: "birth", event: "出生于临淄（今山东淄博），自幼志向出家", eventEn: "Born in Linzi (modern Zibo, Shandong). Aspired to monastic life from childhood." },
      { lat: 34.00, lng: 108.90, year: 640, type: "dharma", event: "往终南山悟真寺依道绰法师学《观无量寿经》，尽得净土要旨", eventEn: "Studied under Master Daochuo at Wuzhen Temple, Zhongnan Mountains. Mastered Pure Land teachings." },
      { lat: 34.26, lng: 108.94, year: 650, type: "teaching", event: "住长安光明寺、慈恩寺弘净土法门，长安城内满城念佛", eventEn: "Taught at Guangming Temple in Chang'an. The entire capital resonated with Amitabha chanting." },
      { lat: 34.26, lng: 108.94, year: 681, type: "death", event: "圆寂于长安，善导流净土遍传日本，影响法然、亲鸾", eventEn: "Passed away in Chang'an. His Pure Land lineage later deeply influenced Japanese Buddhism." },
    ],
  },
  // ── 印光 (1862-1940) 净土宗十三祖 ──
  {
    name: "印光", nameEn: "Yinguang", school: "净土宗",
    primaryLat: 31.26, primaryLng: 120.44,
    journeyWaypoints: [
      { lat: 35.24, lng: 110.15, year: 1862, type: "birth", event: "出生于陕西合阳，幼年多病，因病思佛理", eventEn: "Born in Heyang, Shaanxi. Illness in childhood led to Buddhist contemplation." },
      { lat: 34.00, lng: 108.90, year: 1882, type: "ordination", event: "终南山莲花洞出家，苦行精修净土", eventEn: "Ordained at Lianhua Cave, Zhongnan Mountains. Practiced Pure Land austerities." },
      { lat: 31.26, lng: 120.44, year: 1930, type: "teaching", event: "住苏州灵岩山寺，以书信弘法度众无数，被推为净土宗十三祖", eventEn: "Resided at Lingyan Mountain Temple, Suzhou. Spread dharma through correspondence. Honored as 13th Patriarch." },
      { lat: 31.26, lng: 120.44, year: 1940, type: "death", event: "圆寂于灵岩山寺，临终念佛往生，世寿七十九岁", eventEn: "Passed away at Lingyan Mountain Temple while chanting Amitabha. Aged 79." },
    ],
  },
  // ── 其余祖师（坐标标注） ──
  { name: "昙鸾", nameEn: "Tanluan", school: "净土宗", primaryLat: 34.50, primaryLng: 112.40, journeyWaypoints: [] },
  { name: "道绰", nameEn: "Daochuo", school: "净土宗", primaryLat: 34.50, primaryLng: 112.40, journeyWaypoints: [] },
  { name: "少康", nameEn: "Shaokang", school: "净土宗", primaryLat: 28.47, primaryLng: 119.92, journeyWaypoints: [] },
  { name: "省常", nameEn: "Shengchang", school: "净土宗", primaryLat: 30.25, primaryLng: 120.17, journeyWaypoints: [] },
  { name: "莲池", nameEn: "Lianchi", school: "净土宗", primaryLat: 30.25, primaryLng: 120.17, journeyWaypoints: [] },
  { name: "蕅益", nameEn: "Ouyi", school: "净土宗", primaryLat: 30.25, primaryLng: 120.17, journeyWaypoints: [] },
  { name: "截流", nameEn: "Jieliu", school: "净土宗", primaryLat: 32.39, primaryLng: 119.42, journeyWaypoints: [] },
  { name: "彻悟", nameEn: "Chewu", school: "净土宗", primaryLat: 39.90, primaryLng: 116.40, journeyWaypoints: [] },
  { name: "法然", nameEn: "Hōnen", school: "净土宗", primaryLat: 35.01, primaryLng: 135.77, journeyWaypoints: [] },
  { name: "亲鸾", nameEn: "Shinran", school: "净土宗", primaryLat: 35.01, primaryLng: 135.77, journeyWaypoints: [] },
];
