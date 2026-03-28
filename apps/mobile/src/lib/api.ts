import { getAccessToken } from './auth';

const BASE_URL = __DEV__
  ? 'http://192.168.1.22:3002/api'
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

async function requestMutateAuth<T>(
  endpoint: string,
  method: string,
  body: Record<string, unknown>,
  token: string,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function requestMutate<T>(endpoint: string, method: string, body: Record<string, unknown>): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `API Error: ${response.status} ${response.statusText}`);
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

  getHolySiteById: (id: string) =>
    request<HolySite>(`/holy-sites/${id}`),

  getTemples: (religionId?: string) =>
    request<Temple[]>('/temples', religionId ? { religionId } : undefined),

  getTempleById: (id: string) =>
    request<Temple>(`/temples/${id}`),

  getPatriarchs: (religionId?: string) =>
    request<Patriarch[]>('/patriarchs', religionId ? { religionId } : undefined),

  getPatriarchById: (id: string) =>
    request<Patriarch>(`/patriarchs/${id}`),

  getTeachings: (religionId?: string) =>
    request<Teaching[]>('/teachings', religionId ? { religionId } : undefined),

  getTeachingById: (id: string) =>
    request<Teaching>(`/teachings/${id}`),

  getSeals: (series?: string) =>
    request<Seal[]>('/seals', series ? { series } : undefined),

  getSealById: (id: string) =>
    request<Seal>(`/seals/${id}`),

  getTrips: (params?: { userId?: string; status?: string; page?: string; limit?: string }) =>
    request<PaginatedTrips>('/trips', params),

  getTripById: (id: string) =>
    request<Trip>(`/trips/${id}`),

  getJournals: (params?: { page?: string; limit?: string; isPublic?: string }) =>
    request<PaginatedJournals>('/journals', params),

  getJournalById: (id: string) =>
    request<Journal>(`/journals/${id}`),

  createTrip: (data: {
    title: string;
    startDate: string;
    endDate: string;
    persons: number;
    contactName?: string;
    contactPhone?: string;
    note?: string;
  }, token: string) => requestMutateAuth<Trip>('/trips', 'POST', data, token),

  transitionTrip: (id: string, action: string, reason?: string) =>
    requestMutate<Trip>(`/trips/${id}/transition`, 'POST', { action, reason }),

  createJournal: (data: {
    title: string;
    content: string;
    mood?: string;
    isPublic?: boolean;
    tripId?: string;
  }) => requestMutate<Journal>('/journals', 'POST', data),

  search: (q: string, type = 'all', page = 1, limit = 20) =>
    request<SearchResponse>('/search', {
      q,
      type,
      page: String(page),
      limit: String(limit),
    }),
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

export interface SearchResultItem {
  type: string;
  id: string | number;
  title: string;
  subtitle: string | null;
  descriptionSnippet: string | null;
  image: string | null;
  religion: { name: string; symbol: string | null; color: string | null } | null;
}

export interface SearchResponse {
  query: string;
  type: string;
  page: number;
  limit: number;
  total: number;
  results: SearchResultItem[];
}
