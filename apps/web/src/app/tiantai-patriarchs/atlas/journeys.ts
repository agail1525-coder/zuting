import type { PatriarchMapData } from "@/components/atlas";

export const SCHOOL_COLORS: Record<string, string> = { 天台宗: "#C4A265" };

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  {
    name: "智顗", nameEn: "Zhiyi", school: "天台宗",
    primaryLat: 29.13, primaryLng: 121.03,
    journeyWaypoints: [
      { lat: 30.35, lng: 112.24, year: 538, type: "birth", event: "出生于荆州华容（今湖北），少即聪慧过人", eventEn: "Born in Jingzhou (modern Hubei). Extraordinarily gifted from youth." },
      { lat: 31.80, lng: 114.00, year: 560, type: "dharma", event: "大苏山拜慧思为师，修法华三昧证「旋陀罗尼」大悟", eventEn: "Studied under Huisi at Dasu Mountain. Achieved great awakening through Lotus Samadhi." },
      { lat: 29.13, lng: 121.03, year: 575, type: "founding", event: "入天台山修禅，建国清寺，创天台宗，开一念三千、三谛圆融", eventEn: "Entered Mount Tiantai. Founded Guoqing Temple and Tiantai School. Developed 'Three Thousand Realms in a Single Thought'." },
      { lat: 32.06, lng: 118.79, year: 587, type: "teaching", event: "应诏入金陵（南京）弘法，为隋炀帝授菩萨戒，号「智者大师」", eventEn: "Summoned to Jinling (Nanjing) to teach. Conferred Bodhisattva precepts on Emperor Yang. Titled 'Great Master Zhizhe'." },
      { lat: 29.13, lng: 121.03, year: 597, type: "death", event: "回天台山圆寂，世寿六十岁，被尊为天台宗实际创始人", eventEn: "Returned to Mount Tiantai and passed away. Aged 60. Revered as true founder of Tiantai School." },
    ],
  },
  {
    name: "湛然", nameEn: "Zhanran", school: "天台宗",
    primaryLat: 29.13, primaryLng: 121.03,
    journeyWaypoints: [
      { lat: 31.78, lng: 119.97, year: 711, type: "birth", event: "出生于常州（今江苏），俗姓戚", eventEn: "Born in Changzhou, Jiangsu." },
      { lat: 29.13, lng: 121.03, year: 731, type: "dharma", event: "从左溪玄朗学天台教义，深入止观修行", eventEn: "Studied Tiantai teachings under Zuoxi Xuanlang. Deepened meditation practice." },
      { lat: 29.13, lng: 121.03, year: 750, type: "teaching", event: "中兴天台宗，提出「无情有性」说，著《金刚錍》等，使天台宗复兴", eventEn: "Revived Tiantai School. Proposed 'inanimate objects possess Buddha-nature'. Wrote seminal texts." },
      { lat: 29.13, lng: 121.03, year: 782, type: "death", event: "圆寂于天台山，被尊为天台宗九祖（中兴之祖）", eventEn: "Passed away at Mount Tiantai. Honored as the reviver of Tiantai." },
    ],
  },
  { name: "慧文", nameEn: "Huiwen", school: "天台宗", primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [] },
  { name: "慧思", nameEn: "Huisi", school: "天台宗", primaryLat: 27.24, primaryLng: 112.74, journeyWaypoints: [] },
  { name: "灌顶", nameEn: "Guanding", school: "天台宗", primaryLat: 29.13, primaryLng: 121.03, journeyWaypoints: [] },
  { name: "知礼", nameEn: "Zhili", school: "天台宗", primaryLat: 29.87, primaryLng: 121.55, journeyWaypoints: [] },
];
