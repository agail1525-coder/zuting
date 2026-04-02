import type { PatriarchMapData } from "@/components/atlas";

export const SCHOOL_COLORS: Record<string, string> = { 华严宗: "#C4A265" };

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  {
    name: "法藏", nameEn: "Fazang", school: "华严宗",
    primaryLat: 34.26, primaryLng: 108.94,
    journeyWaypoints: [
      { lat: 34.26, lng: 108.94, year: 643, type: "birth", event: "出生于长安，祖籍康居（中亚），故称「康藏法师」", eventEn: "Born in Chang'an. Ancestral roots in Kangju (Central Asia), hence called 'Master Kangzang'." },
      { lat: 34.26, lng: 108.94, year: 668, type: "dharma", event: "师从智俨学华严义理，尽得华严玄旨", eventEn: "Studied Avatamsaka philosophy under Zhiyan. Mastered the profound teachings." },
      { lat: 34.76, lng: 112.45, year: 695, type: "teaching", event: "武则天朝任国师，以金狮子譬喻华严法界，名震天下", eventEn: "Served as National Master under Empress Wu. Explained Huayan through the Golden Lion metaphor." },
      { lat: 34.26, lng: 108.94, year: 712, type: "death", event: "圆寂于长安，被尊为华严宗三祖（实际集大成者）", eventEn: "Passed away in Chang'an. Honored as the systematizer of Huayan School." },
    ],
  },
  {
    name: "澄观", nameEn: "Chengguan", school: "华严宗",
    primaryLat: 34.26, primaryLng: 108.94,
    journeyWaypoints: [
      { lat: 29.87, lng: 121.55, year: 738, type: "birth", event: "出生于越州（今浙江绍兴），博学多闻", eventEn: "Born in Yuezhou (modern Shaoxing, Zhejiang). Widely learned and erudite." },
      { lat: 39.00, lng: 113.60, year: 776, type: "pilgrimage", event: "入五台山修行，撰《华严经疏》六十卷，为华严经最权威注疏", eventEn: "Entered Mount Wutai. Wrote 60-volume commentary on Avatamsaka Sutra — the definitive Huayan text." },
      { lat: 34.26, lng: 108.94, year: 796, type: "teaching", event: "唐德宗赐号「清凉国师」，历事七朝，为华严宗巅峰", eventEn: "Emperor Dezong bestowed title 'Qingliang National Master'. Served seven reigns. Pinnacle of Huayan." },
      { lat: 34.26, lng: 108.94, year: 839, type: "death", event: "圆寂于长安，世寿一百零二岁，被尊为华严宗四祖", eventEn: "Passed away in Chang'an. Lived to 102. Honored as Fourth Patriarch of Huayan." },
    ],
  },
  { name: "杜顺", nameEn: "Dushun", school: "华严宗", primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [] },
  { name: "智俨", nameEn: "Zhiyan", school: "华严宗", primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [] },
  { name: "宗密", nameEn: "Zongmi", school: "华严宗", primaryLat: 34.00, primaryLng: 108.90, journeyWaypoints: [] },
];
