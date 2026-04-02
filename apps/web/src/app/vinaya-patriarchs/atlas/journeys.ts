import type { PatriarchMapData } from "@/components/atlas";

export const SCHOOL_COLORS: Record<string, string> = { 律宗: "#C4A265" };

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  {
    name: "道宣", nameEn: "Daoxuan", school: "律宗",
    primaryLat: 34.00, primaryLng: 108.90,
    journeyWaypoints: [
      { lat: 32.20, lng: 119.45, year: 596, type: "birth", event: "出生于润州丹徒（今江苏镇江），书香世家", eventEn: "Born in Dantu (modern Zhenjiang, Jiangsu). From a scholarly family." },
      { lat: 34.26, lng: 108.94, year: 611, type: "ordination", event: "长安日严寺出家，受具足戒", eventEn: "Ordained at Riyan Temple in Chang'an." },
      { lat: 34.00, lng: 108.90, year: 624, type: "founding", event: "居终南山净业寺，创南山律宗，撰《四分律删繁补阙行事钞》", eventEn: "Founded Nanshan Vinaya School at Jingye Temple, Zhongnan Mountains. Wrote definitive Vinaya commentaries." },
      { lat: 34.00, lng: 108.90, year: 667, type: "death", event: "圆寂于终南山，被尊为律宗开山祖师", eventEn: "Passed away at Zhongnan Mountains. Honored as founder of Vinaya School." },
    ],
  },
  {
    name: "鉴真", nameEn: "Jianzhen (Ganjin)", school: "律宗",
    primaryLat: 34.68, primaryLng: 135.78,
    journeyWaypoints: [
      { lat: 32.39, lng: 119.42, year: 688, type: "birth", event: "出生于扬州江阳，十四岁出家", eventEn: "Born in Yangzhou, Jiangsu. Ordained at age 14." },
      { lat: 32.40, lng: 119.43, year: 720, type: "teaching", event: "住扬州大明寺，弘律二十余年，为淮南戒律权威", eventEn: "Taught Vinaya at Daming Temple, Yangzhou for over 20 years. Supreme authority on precepts." },
      { lat: 32.39, lng: 119.42, year: 743, type: "pilgrimage", event: "应日僧荣叡、普照之请，发愿东渡日本传律。前五次均失败，双目失明", eventEn: "Resolved to bring Vinaya to Japan. Five failed attempts; lost his eyesight." },
      { lat: 34.68, lng: 135.78, year: 754, type: "founding", event: "第六次东渡成功抵达日本奈良，建唐招提寺，授戒传律", eventEn: "Sixth attempt succeeded. Arrived in Nara, Japan. Founded Tōshōdai-ji Temple." },
      { lat: 34.68, lng: 135.78, year: 763, type: "death", event: "圆寂于唐招提寺，被尊为日本律宗开祖", eventEn: "Passed away at Tōshōdai-ji. Revered as founder of Japanese Vinaya." },
    ],
  },
  { name: "昙无德", nameEn: "Dharmagupta", school: "律宗", primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [] },
  { name: "法聪", nameEn: "Facong", school: "律宗", primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [] },
  { name: "道洪", nameEn: "Daohong", school: "律宗", primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [] },
  { name: "智首", nameEn: "Zhishou", school: "律宗", primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [] },
  { name: "弘一", nameEn: "Hongyi (Li Shutong)", school: "律宗", primaryLat: 24.91, primaryLng: 118.59, journeyWaypoints: [] },
  { name: "读体", nameEn: "Duti", school: "律宗", primaryLat: 30.25, primaryLng: 120.17, journeyWaypoints: [] },
  { name: "见月", nameEn: "Jianyue", school: "律宗", primaryLat: 32.06, primaryLng: 118.79, journeyWaypoints: [] },
  { name: "圆照", nameEn: "Yuanzhao", school: "律宗", primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [] },
  { name: "元照", nameEn: "Yuanzhao of Song", school: "律宗", primaryLat: 30.25, primaryLng: 120.17, journeyWaypoints: [] },
];
