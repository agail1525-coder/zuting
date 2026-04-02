import type { PatriarchMapData } from "@/components/atlas";

export const SCHOOL_COLORS: Record<string, string> = { 密宗: "#C4A265", 真言宗: "#C4A265" };

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  {
    name: "不空", nameEn: "Amoghavajra", school: "密宗",
    primaryLat: 34.26, primaryLng: 108.94,
    journeyWaypoints: [
      { lat: 7.87, lng: 79.89, year: 705, type: "birth", event: "出生于狮子国（今斯里兰卡），随叔父至唐", eventEn: "Born in Simhala (modern Sri Lanka). Came to Tang China with uncle." },
      { lat: 23.13, lng: 113.26, year: 720, type: "pilgrimage", event: "经海路至广州，师从金刚智三藏学密法灌顶", eventEn: "Arrived in Guangzhou by sea. Studied esoteric Buddhism under Vajrabodhi." },
      { lat: 34.26, lng: 108.94, year: 746, type: "teaching", event: "住长安大兴善寺，为三朝国师，翻译密典百余部", eventEn: "Resided at Daxingshan Temple, Chang'an. Served as National Master for three reigns. Translated over 100 esoteric texts." },
      { lat: 34.26, lng: 108.94, year: 774, type: "death", event: "圆寂于长安，为开元三大士之一，唐密传承核心人物", eventEn: "Passed away in Chang'an. One of the Three Kaiyuan Masters. Core figure of Tang Esoteric Buddhism." },
    ],
  },
  {
    name: "空海", nameEn: "Kūkai", school: "真言宗",
    primaryLat: 34.21, primaryLng: 135.59,
    journeyWaypoints: [
      { lat: 34.34, lng: 134.04, year: 774, type: "birth", event: "出生于日本赞岐国（今香川县），俗姓佐伯", eventEn: "Born in Sanuki Province (modern Kagawa), Japan." },
      { lat: 34.26, lng: 108.94, year: 804, type: "pilgrimage", event: "入唐求法，至长安青龙寺从惠果阿闍黎受灌顶传法", eventEn: "Traveled to Tang China. Received esoteric transmission from Huiguo at Qinglong Temple, Chang'an." },
      { lat: 34.26, lng: 108.94, year: 805, type: "dharma", event: "惠果阿闍黎倾囊相授金胎两部大法，嘱其东传", eventEn: "Master Huiguo transmitted the complete Vajradhatu and Garbhadhatu teachings. Entrusted to bring them east." },
      { lat: 34.21, lng: 135.59, year: 816, type: "founding", event: "获嵯峨天皇赐高野山，建金刚峯寺，创日本真言宗", eventEn: "Received Mount Kōya from Emperor Saga. Founded Kongōbu-ji Temple. Established Japanese Shingon School." },
      { lat: 34.21, lng: 135.59, year: 835, type: "death", event: "入定于高野山，信众相信其永入禅定，至今仍在定中", eventEn: "Entered eternal meditation at Mount Kōya. Devotees believe he remains in samādhi to this day." },
    ],
  },
  { name: "善无畏", nameEn: "Śubhakarasiṃha", school: "密宗", primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [] },
  { name: "金刚智", nameEn: "Vajrabodhi", school: "密宗", primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [] },
  { name: "惠果", nameEn: "Huiguo", school: "密宗", primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [] },
];
