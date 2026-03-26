/** Admin CRUD 页面接口定义 — 与 Prisma Schema 对齐 */

export interface Religion {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  symbol?: string;
  color?: string;
  description?: string;
}

export interface HolySite {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  latitude: number;
  longitude: number;
  utcOffset: number;
  description: string;
  imageUrl?: string;
  soundEffect?: string;
  religionId: string;
}

export interface Temple {
  id: string;
  name: string;
  nameEn?: string;
  country: string;
  address?: string;
  foundingDate?: string;
  description: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  religionId: string;
}

export interface Patriarch {
  id: string;
  name: string;
  nameEn?: string;
  dates?: string;
  title?: string;
  biography: string;
  coreTeaching: string;
  imageUrl?: string;
  religionId: string;
}

export interface Teaching {
  id: string;
  name: string;
  originalText: string;
  sourceText?: string;
  translationCn?: string;
  religionId: string;
  language?: string;
}

export interface Seal {
  id: number;
  name: string;
  nameEn?: string;
  order?: number;
  series: string;
  description?: string;
  verse?: string;
  poem: string;
  essence: string;
  practice: string;
  vow: string;
  color?: string;
}
