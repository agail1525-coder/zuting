import type { PatriarchMapData } from "@/components/atlas";

export const SCHOOL_COLORS: Record<string, string> = { 三论宗: "#C4A265" };

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  {
    name: "鸠摩罗什", nameEn: "Kumārajīva", school: "三论宗",
    primaryLat: 34.26, primaryLng: 108.94,
    journeyWaypoints: [
      { lat: 41.72, lng: 82.96, year: 344, type: "birth", event: "出生于龟兹国（今新疆库车），父天竺人，母龟兹公主", eventEn: "Born in Kucha (modern Kuqa, Xinjiang). Father from India, mother a Kuchan princess." },
      { lat: 34.08, lng: 74.80, year: 356, type: "dharma", event: "赴克什米尔从盘陀达多学大乘空义，尽通三藏", eventEn: "Traveled to Kashmir to study Mahayana Śūnyatā under Bandhudatta. Mastered the Tripitaka." },
      { lat: 38.49, lng: 102.64, year: 385, type: "exile", event: "前秦吕光劫至凉州（今甘肃武威），被幽禁十七年", eventEn: "Captured by Lü Guang and imprisoned in Liangzhou (modern Wuwei, Gansu) for 17 years." },
      { lat: 34.26, lng: 108.94, year: 401, type: "teaching", event: "后秦姚兴迎至长安逍遥园，主持国家译场，翻译《中论》《百论》《十二门论》等经典", eventEn: "Welcomed to Chang'an by Emperor Yao Xing. Led the national translation bureau. Translated the Three Treatises and other seminal texts." },
      { lat: 34.26, lng: 108.94, year: 413, type: "death", event: "圆寂于长安，临终发愿：所译经论若无谬误，焚身后舌不烂。果如其言", eventEn: "Passed away in Chang'an. His vow: if translations are accurate, his tongue will survive cremation. It did." },
    ],
  },
  { name: "僧肇", nameEn: "Sengzhao", school: "三论宗", primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [] },
  { name: "吉藏", nameEn: "Jizang", school: "三论宗", primaryLat: 32.06, primaryLng: 118.79, journeyWaypoints: [] },
  { name: "僧朗", nameEn: "Senglang", school: "三论宗", primaryLat: 32.06, primaryLng: 118.79, journeyWaypoints: [] },
];
