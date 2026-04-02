import type { PatriarchMapData } from "@/components/atlas";

export const SCHOOL_COLORS: Record<string, string> = { 法相宗: "#C4A265", 唯识宗: "#C4A265" };

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  {
    name: "玄奘", nameEn: "Xuanzang", school: "法相宗",
    primaryLat: 34.26, primaryLng: 108.94,
    journeyWaypoints: [
      { lat: 34.72, lng: 112.79, year: 602, type: "birth", event: "出生于洛阳偃师陈河村，俗姓陈，名祎", eventEn: "Born in Yanshi, Luoyang. Family name Chen." },
      { lat: 34.76, lng: 112.45, year: 615, type: "ordination", event: "洛阳净土寺出家，少年博览经论，慨叹中土佛典缺失", eventEn: "Ordained at Jingtu Temple, Luoyang. Lamented incomplete Chinese Buddhist texts." },
      { lat: 40.50, lng: 95.00, year: 627, type: "pilgrimage", event: "从长安西行，经河西走廊、玉门关、西域诸国，穿越大漠戈壁", eventEn: "Set out westward from Chang'an through Hexi Corridor, Yumen Pass, crossing Gobi Desert." },
      { lat: 25.14, lng: 85.44, year: 631, type: "pilgrimage", event: "抵达印度那烂陀寺，从戒贤论师学唯识、因明，留学五年", eventEn: "Arrived at Nalanda University, India. Studied Yogacara and Logic under Śīlabhadra for 5 years." },
      { lat: 34.26, lng: 108.94, year: 645, type: "teaching", event: "携657部梵文经典回长安，住大慈恩寺译经院，翻译75部1335卷", eventEn: "Returned to Chang'an with 657 Sanskrit texts. Translated 75 works (1335 volumes) at Daci'en Temple." },
      { lat: 35.10, lng: 109.10, year: 664, type: "death", event: "圆寂于玉华宫，临终犹在译经。其西行之路成为丝绸之路文化巅峰", eventEn: "Passed away at Yuhua Palace, still translating. His journey became the pinnacle of Silk Road cultural exchange." },
    ],
  },
  { name: "窥基", nameEn: "Kuiji", school: "法相宗", primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [] },
  { name: "圆测", nameEn: "Woncheuk", school: "法相宗", primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [] },
  { name: "智周", nameEn: "Zhizhou", school: "法相宗", primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [] },
];
