const BASE_URL = __DEV__
  ? 'http://localhost:3002/api'
  : 'https://zuting.fszyl.top/api';

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

export type TripStatus =
  | 'DRAFT'
  | 'PLANNING'
  | 'SUBMITTED'
  | 'CONFIRMED'
  | 'PAID'
  | 'PREPARING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REVIEWING'
  | 'CANCELLED'
  | 'REFUNDING'
  | 'REFUNDED';

export interface TripSiteItem {
  id: string;
  order: number;
  visitDate: string | null;
  site: HolySite;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  status: TripStatus;
  totalBudget: number | null;
  persons: number;
  contactName: string | null;
  contactPhone: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  sites: TripSiteItem[];
  _count: { orders: number; journals: number };
}

export interface PaginatedTrips {
  data: Trip[];
  total: number;
  page: number;
  limit: number;
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

  getTrips: (params?: { userId?: string; status?: string; page?: string; limit?: string }) =>
    request<PaginatedTrips>('/trips', params),

  getJournals: (params?: { page?: string; limit?: string; isPublic?: string }) =>
    request<PaginatedJournals>('/journals', params),
};

export interface Journal {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  isPublic: boolean;
  images: string[];
  siteId: string | null;
  tripId: string | null;
  user?: { id: string; nickname: string; avatar: string | null };
  trip?: { id: string; title: string } | null;
  createdAt: string;
}

export interface PaginatedJournals {
  data: Journal[];
  total: number;
  page: number;
  limit: number;
}
