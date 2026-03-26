const BASE_URL = __DEV__
  ? 'http://localhost:3002/api'
  : 'https://api.zuting.com/api';

async function request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export interface Religion {
  id: string;
  slug: string;
  nameZh: string;
  nameEn: string;
  symbol: string;
  description: string;
  color?: string;
}

export interface HolySite {
  id: string;
  nameZh: string;
  nameEn: string;
  country: string;
  city?: string;
  latitude: number;
  longitude: number;
  utcOffset: number;
  description: string;
  religionId: string;
  religion?: Religion;
}

export interface Temple {
  id: string;
  nameZh: string;
  nameEn: string;
  country: string;
  city?: string;
  description: string;
  religionId: string;
  religion?: Religion;
}

export interface Patriarch {
  id: string;
  nameZh: string;
  nameEn: string;
  era: string;
  title: string;
  biography: string;
  religionId: string;
  religion?: Religion;
}

export interface Teaching {
  id: string;
  title: string;
  originalText: string;
  source: string;
  religionId: string;
  religion?: Religion;
}

export interface Seal {
  id: string;
  number: number;
  nameZh: string;
  nameEn: string;
  series: string;
  poem: string;
  essence: string;
  practice: string;
  vow: string;
}

export const api = {
  getReligions: (slug?: string) =>
    request<Religion[]>('/religions', slug ? { slug } : undefined),

  getHolySites: (religionId?: string) =>
    request<HolySite[]>('/holy-sites', religionId ? { religionId } : undefined),

  getTemples: (religionId?: string) =>
    request<Temple[]>('/temples', religionId ? { religionId } : undefined),

  getPatriarchs: (religionId?: string) =>
    request<Patriarch[]>('/patriarchs', religionId ? { religionId } : undefined),

  getTeachings: (religionId?: string) =>
    request<Teaching[]>('/teachings', religionId ? { religionId } : undefined),

  getSeals: (series?: string) =>
    request<Seal[]>('/seals', series ? { series } : undefined),
};
