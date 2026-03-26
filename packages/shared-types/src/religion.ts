/** 12大信仰 */
export type ReligionSlug =
  | 'buddhism'
  | 'taoism'
  | 'christianity'
  | 'islam'
  | 'hinduism'
  | 'judaism'
  | 'confucianism'
  | 'sikhism'
  | 'shinto'
  | 'tibetan-buddhism'
  | 'indigenous'
  | 'bahai';

export interface Religion {
  id: string;
  name: string;        // "佛教"
  nameEn: string;      // "Buddhism"
  slug: ReligionSlug;
  symbol?: string;     // 宗教符号
  color?: string;      // 主题色
}

/** 圣地 */
export interface HolySite {
  id: string;
  name: string;        // "菩提伽耶"
  nameEn: string;      // "Bodh Gaya"
  country: string;
  latitude: number;
  longitude: number;
  utcOffset: number;
  description: string;
  imageUrl?: string;
  soundEffect?: string;
  religionId: string;
}

/** 祖庭 */
export interface Temple {
  id: string;
  name: string;
  nameEn?: string;
  country: string;
  foundingDate?: string;
  description: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  religionId: string;
}

/** 祖师 */
export interface Patriarch {
  id: string;
  name: string;
  nameEn?: string;
  dates?: string;       // "563 BCE - 483 BCE"
  title?: string;
  biography: string;
  coreTeaching: string;
  imageUrl?: string;
  religionId: string;
}

/** 祖训 */
export interface Teaching {
  id: string;
  name: string;
  originalText: string;
  sourceText?: string;
  translationCn?: string;
  religionId: string;
}
