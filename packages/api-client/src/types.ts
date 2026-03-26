/** 12 major faiths */
export interface Religion {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  symbol: string | null;
  color: string | null;
  description: string;
}

/** 60 holy sites with GPS coordinates */
export interface HolySite {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  latitude: number;
  longitude: number;
  utcOffset: number;
  description: string;
  imageUrl: string | null;
  soundEffect: string | null;
  religionId: string;
  religion?: Religion;
}

/** 27 ancestral temples */
export interface Temple {
  id: string;
  name: string;
  nameEn: string | null;
  country: string;
  foundingDate: string | null;
  description: string;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  religionId: string;
  religion?: Religion;
}

/** 28 patriarchs */
export interface Patriarch {
  id: string;
  name: string;
  nameEn: string | null;
  dates: string | null;
  title: string | null;
  biography: string;
  coreTeaching: string;
  imageUrl: string | null;
  religionId: string;
  religion?: Religion;
}

/** 39 ancestral teachings */
export interface Teaching {
  id: string;
  name: string;
  originalText: string;
  sourceText: string | null;
  translationCn: string | null;
  religionId: string;
  religion?: Religion;
}

/** 曹溪愿命三十印 (30 seals across 5 series) */
export interface Seal {
  id: number;
  name: string;
  series: 'CHUYIN' | 'ZHONGYIN' | 'YINGUOYIN' | 'CHENGDAOYIN' | 'GUIYUANYIN';
  poem: string;
  essence: string;
  practice: string;
  vow: string;
  color: string | null;
}
