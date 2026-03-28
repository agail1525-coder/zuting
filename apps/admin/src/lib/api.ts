import { getToken, logout } from './auth';
import type {
  Religion, HolySite, Temple, Patriarch, Teaching, Seal,
  Trip, Order, Journal, Review, Coupon, CreateCouponDto,
  Report, ReportStats, Upload, DeleteResponse, User,
  XiaohongChatResponse, NotificationSendResponse,
} from '../types';

// ---- DTO Interfaces (R-01: 严禁any) ----

export interface CreateReligionDto {
  name: string;
  nameEn: string;
  slug: string;
  symbol?: string;
  color?: string;
}

export interface CreateHolySiteDto {
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

export interface CreateTempleDto {
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

export interface CreatePatriarchDto {
  name: string;
  nameEn?: string;
  dates?: string;
  title?: string;
  biography: string;
  coreTeaching: string;
  imageUrl?: string;
  religionId: string;
}

export interface CreateTeachingDto {
  name: string;
  originalText: string;
  sourceText?: string;
  translationCn?: string;
  religionId: string;
}

export interface CreateSealDto {
  id: number;
  name: string;
  series: string;
  poem: string;
  essence: string;
  practice: string;
  vow: string;
  color?: string;
}

const BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${url}`, {
    ...init,
    headers,
  });
  if (res.status === 401) {
    logout();
    throw new Error('Session expired');
  }
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = Array.isArray(body.message) ? body.message.join('; ') : body.message;
    } catch {
      // non-JSON response, fall through
    }
    throw new Error(detail || `API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

// ---- Religions ----
export const getReligions = (slug?: string) =>
  fetchJson<Religion[]>(slug ? `/religions?slug=${slug}` : '/religions');
export const createReligion = (data: CreateReligionDto) =>
  fetchJson<CreateReligionDto & { id: string }>('/religions', { method: 'POST', body: JSON.stringify(data) });
export const updateReligion = (id: string, data: Partial<CreateReligionDto>) =>
  fetchJson<CreateReligionDto & { id: string }>(`/religions/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteReligion = (id: string) =>
  fetchJson<DeleteResponse>(`/religions/${id}`, { method: 'DELETE' });

// ---- Holy Sites ----
export const getHolySites = (religionId?: string) =>
  fetchJson<HolySite[]>(religionId ? `/holy-sites?religionId=${religionId}` : '/holy-sites');
export const createHolySite = (data: CreateHolySiteDto) =>
  fetchJson<CreateHolySiteDto & { id: string }>('/holy-sites', { method: 'POST', body: JSON.stringify(data) });
export const updateHolySite = (id: string, data: Partial<CreateHolySiteDto>) =>
  fetchJson<CreateHolySiteDto & { id: string }>(`/holy-sites/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteHolySite = (id: string) =>
  fetchJson<DeleteResponse>(`/holy-sites/${id}`, { method: 'DELETE' });

// ---- Temples ----
export const getTemples = (religionId?: string) =>
  fetchJson<Temple[]>(religionId ? `/temples?religionId=${religionId}` : '/temples');
export const createTemple = (data: CreateTempleDto) =>
  fetchJson<CreateTempleDto & { id: string }>('/temples', { method: 'POST', body: JSON.stringify(data) });
export const updateTemple = (id: string, data: Partial<CreateTempleDto>) =>
  fetchJson<CreateTempleDto & { id: string }>(`/temples/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteTemple = (id: string) =>
  fetchJson<DeleteResponse>(`/temples/${id}`, { method: 'DELETE' });

// ---- Patriarchs ----
export const getPatriarchs = (religionId?: string) =>
  fetchJson<Patriarch[]>(religionId ? `/patriarchs?religionId=${religionId}` : '/patriarchs');
export const createPatriarch = (data: CreatePatriarchDto) =>
  fetchJson<CreatePatriarchDto & { id: string }>('/patriarchs', { method: 'POST', body: JSON.stringify(data) });
export const updatePatriarch = (id: string, data: Partial<CreatePatriarchDto>) =>
  fetchJson<CreatePatriarchDto & { id: string }>(`/patriarchs/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deletePatriarch = (id: string) =>
  fetchJson<DeleteResponse>(`/patriarchs/${id}`, { method: 'DELETE' });

// ---- Teachings ----
export const getTeachings = (religionId?: string) =>
  fetchJson<Teaching[]>(religionId ? `/teachings?religionId=${religionId}` : '/teachings');
export const createTeaching = (data: CreateTeachingDto) =>
  fetchJson<CreateTeachingDto & { id: string }>('/teachings', { method: 'POST', body: JSON.stringify(data) });
export const updateTeaching = (id: string, data: Partial<CreateTeachingDto>) =>
  fetchJson<CreateTeachingDto & { id: string }>(`/teachings/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteTeaching = (id: string) =>
  fetchJson<DeleteResponse>(`/teachings/${id}`, { method: 'DELETE' });

// ---- Seals ----
export const getSeals = (series?: string) =>
  fetchJson<Seal[]>(series ? `/seals?series=${series}` : '/seals');
export const createSeal = (data: CreateSealDto) =>
  fetchJson<Seal>('/seals', { method: 'POST', body: JSON.stringify(data) });
export const updateSeal = (id: number, data: Partial<CreateSealDto>) =>
  fetchJson<Seal>(`/seals/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteSeal = (id: number) =>
  fetchJson<Seal>(`/seals/${id}`, { method: 'DELETE' });

// ---- Trips ----
export const getTrips = (page = 1, limit = 20, status?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  return fetchJson<{ data: Trip[]; total: number; page: number; limit: number }>(
    `/trips?${params.toString()}`,
  );
};
export const getTrip = (id: string) => fetchJson<Trip>(`/trips/${id}`);
export const updateTripStatus = (id: string, status: string) =>
  fetchJson<Trip>(`/trips/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
export const transitionTrip = (id: string, action: string, reason?: string) =>
  fetchJson<Trip>(`/trips/${id}/transition`, {
    method: 'POST',
    body: JSON.stringify({ action, ...(reason ? { reason } : {}) }),
  });

// ---- Orders ----
export const getOrders = (page = 1, limit = 20, status?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  return fetchJson<{ data: Order[]; total: number; page: number; limit: number }>(
    `/orders?${params.toString()}`,
  );
};
export const getOrder = (id: string) => fetchJson<Order>(`/orders/${id}`);
export const refundOrder = (id: string) =>
  fetchJson<Order>(`/orders/${id}/refund`, { method: 'POST' });

// ---- Reviews ----
export const getReviews = (page = 1, limit = 20, targetType?: string, targetId?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (targetType) params.set('targetType', targetType);
  if (targetId) params.set('targetId', targetId);
  return fetchJson<{ data: Review[]; total: number; page: number; limit: number }>(
    `/reviews?${params.toString()}`,
  );
};
export const deleteReview = (id: string) =>
  fetchJson<DeleteResponse>(`/reviews/${id}`, { method: 'DELETE' });

// ---- Notifications ----
export const sendNotification = (userIds: string[], title: string, content: string) =>
  fetchJson<NotificationSendResponse>('/notifications/send', {
    method: 'POST',
    body: JSON.stringify({ userIds, title, content }),
  });

// ---- Uploads ----
export const getUploads = () => fetchJson<Upload[]>('/uploads').catch((): Upload[] => []);

// ---- Journals ----
export const getJournals = (page = 1, limit = 20) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return fetchJson<{ data: Journal[]; total: number; page: number; limit: number }>(
    `/journals?${params.toString()}`,
  );
};
export const updateJournal = (id: string, data: { isPublic?: boolean }) =>
  fetchJson<{ id: string }>(`/journals/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// ---- AI Config ----
export interface AiConfig {
  id: string;
  key: string;
  value: string;
  label: string;
  description: string | null;
  category: string;
  updatedAt: string;
}
export const getAiConfigs = () =>
  fetchJson<AiConfig[]>('/ai-config');
export const updateAiConfig = (key: string, value: string) =>
  fetchJson<AiConfig>(`/ai-config/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });

// ---- Xiaohong (AI) ----
export interface XiaohongSuggestion {
  text: string;
  category: string;
}
export const getXiaohongSuggestions = () =>
  fetchJson<XiaohongSuggestion[]>('/xiaohong/suggestions').catch((): XiaohongSuggestion[] => []);
export const createXiaohongSuggestion = (data: { text: string; category?: string }) =>
  fetchJson<XiaohongSuggestion>('/xiaohong/suggestions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateXiaohongSuggestion = (index: number, data: { text?: string; category?: string }) =>
  fetchJson<XiaohongSuggestion>(`/xiaohong/suggestions/${index}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
export const deleteXiaohongSuggestion = (index: number) =>
  fetchJson<{ message: string }>(`/xiaohong/suggestions/${index}`, { method: 'DELETE' });
export const chatWithXiaohong = (message: string) =>
  fetchJson<XiaohongChatResponse>('/xiaohong/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

// ---- Reports (Moderation) ----
export const getReports = (page = 1, limit = 20, status?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  return fetchJson<{ data: Report[]; total: number; page: number; limit: number }>(
    `/reports?${params.toString()}`,
  );
};
export const getReportStats = () =>
  fetchJson<ReportStats>('/reports/stats');
export const getReport = (id: string) =>
  fetchJson<Report>(`/reports/${id}`);
export const reviewReport = (id: string, action: 'approve' | 'dismiss') =>
  fetchJson<Report>(`/reports/${id}/review`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  });

// ---- Coupons ----
export const getCoupons = (page = 1, limit = 20) =>
  fetchJson<{ data: Coupon[]; total: number; page: number; limit: number }>(
    `/coupons?page=${page}&limit=${limit}`,
  );
export const createCoupon = (data: CreateCouponDto) =>
  fetchJson<Coupon>('/coupons', { method: 'POST', body: JSON.stringify(data) });
export const updateCoupon = (id: string, data: Partial<CreateCouponDto>) =>
  fetchJson<Coupon>(`/coupons/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deactivateCoupon = (id: string) =>
  fetchJson<Coupon>(`/coupons/${id}`, { method: 'DELETE' });

// ---- Users (Admin) ----
export const getUsers = (params?: { page?: number; limit?: number; search?: string; role?: string; isActive?: string }) => {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.search) qs.set('search', params.search);
  if (params?.role) qs.set('role', params.role);
  if (params?.isActive !== undefined) qs.set('isActive', params.isActive);
  const query = qs.toString();
  return fetchJson<{ data: User[]; total: number; page: number; limit: number }>(
    query ? `/users?${query}` : '/users',
  );
};
export const updateUser = (id: string, data: { role?: string; isActive?: boolean }) =>
  fetchJson<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// ---- Dashboard stats helper ----
// [R-64] Explicit take limits to prevent OOM as data grows
export async function getDashboardStats() {
  const [religions, holySites, temples, patriarchs, teachings, seals] =
    await Promise.all([
      fetchJson<Religion[]>('/religions?take=100').catch(() => [] as Religion[]),
      fetchJson<HolySite[]>('/holy-sites?take=100').catch(() => [] as HolySite[]),
      fetchJson<Temple[]>('/temples?take=100').catch(() => [] as Temple[]),
      fetchJson<Patriarch[]>('/patriarchs?take=100').catch(() => [] as Patriarch[]),
      fetchJson<Teaching[]>('/teachings?take=100').catch(() => [] as Teaching[]),
      fetchJson<Seal[]>('/seals?take=100').catch(() => [] as Seal[]),
    ]);
  return { religions, holySites, temples, patriarchs, teachings, seals };
}
