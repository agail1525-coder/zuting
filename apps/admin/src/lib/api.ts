import { getToken, logout } from './auth';

const BASE = '/api';

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
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

// ---- Religions ----
export const getReligions = (slug?: string) =>
  fetchJson<any[]>(slug ? `/religions?slug=${slug}` : '/religions');
export const createReligion = (data: any) =>
  fetchJson<any>('/religions', { method: 'POST', body: JSON.stringify(data) });
export const updateReligion = (id: string, data: any) =>
  fetchJson<any>(`/religions/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteReligion = (id: string) =>
  fetchJson<any>(`/religions/${id}`, { method: 'DELETE' });

// ---- Holy Sites ----
export const getHolySites = (religionId?: string) =>
  fetchJson<any[]>(religionId ? `/holy-sites?religionId=${religionId}` : '/holy-sites');
export const createHolySite = (data: any) =>
  fetchJson<any>('/holy-sites', { method: 'POST', body: JSON.stringify(data) });
export const updateHolySite = (id: string, data: any) =>
  fetchJson<any>(`/holy-sites/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteHolySite = (id: string) =>
  fetchJson<any>(`/holy-sites/${id}`, { method: 'DELETE' });

// ---- Temples ----
export const getTemples = (religionId?: string) =>
  fetchJson<any[]>(religionId ? `/temples?religionId=${religionId}` : '/temples');
export const createTemple = (data: any) =>
  fetchJson<any>('/temples', { method: 'POST', body: JSON.stringify(data) });
export const updateTemple = (id: string, data: any) =>
  fetchJson<any>(`/temples/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteTemple = (id: string) =>
  fetchJson<any>(`/temples/${id}`, { method: 'DELETE' });

// ---- Patriarchs ----
export const getPatriarchs = (religionId?: string) =>
  fetchJson<any[]>(religionId ? `/patriarchs?religionId=${religionId}` : '/patriarchs');
export const createPatriarch = (data: any) =>
  fetchJson<any>('/patriarchs', { method: 'POST', body: JSON.stringify(data) });
export const updatePatriarch = (id: string, data: any) =>
  fetchJson<any>(`/patriarchs/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deletePatriarch = (id: string) =>
  fetchJson<any>(`/patriarchs/${id}`, { method: 'DELETE' });

// ---- Teachings ----
export const getTeachings = (religionId?: string) =>
  fetchJson<any[]>(religionId ? `/teachings?religionId=${religionId}` : '/teachings');
export const createTeaching = (data: any) =>
  fetchJson<any>('/teachings', { method: 'POST', body: JSON.stringify(data) });
export const updateTeaching = (id: string, data: any) =>
  fetchJson<any>(`/teachings/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteTeaching = (id: string) =>
  fetchJson<any>(`/teachings/${id}`, { method: 'DELETE' });

// ---- Seals ----
export const getSeals = (series?: string) =>
  fetchJson<any[]>(series ? `/seals?series=${series}` : '/seals');

// ---- Trips ----
export const getTrips = () => fetchJson<any[]>('/trips');
export const getTrip = (id: string) => fetchJson<any>(`/trips/${id}`);
export const updateTripStatus = (id: string, status: string) =>
  fetchJson<any>(`/trips/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
export const transitionTrip = (id: string, action: string, reason?: string) =>
  fetchJson<any>(`/trips/${id}/transition`, {
    method: 'POST',
    body: JSON.stringify({ action, ...(reason ? { reason } : {}) }),
  });

// ---- Orders ----
export const getOrders = () => fetchJson<any[]>('/orders');
export const getOrder = (id: string) => fetchJson<any>(`/orders/${id}`);
export const refundOrder = (id: string) =>
  fetchJson<any>(`/orders/${id}/refund`, { method: 'POST' });

// ---- Reviews ----
export const getReviews = (targetType?: string, targetId?: string) => {
  const params = new URLSearchParams();
  if (targetType) params.set('targetType', targetType);
  if (targetId) params.set('targetId', targetId);
  const qs = params.toString();
  return fetchJson<any[]>(qs ? `/reviews?${qs}` : '/reviews');
};
export const deleteReview = (id: string) =>
  fetchJson<any>(`/reviews/${id}`, { method: 'DELETE' });

// ---- Notifications ----
export const sendNotification = (userIds: string[], title: string, content: string) =>
  fetchJson<any>('/notifications/send', {
    method: 'POST',
    body: JSON.stringify({ userIds, title, content }),
  });

// ---- Uploads ----
export const getUploads = () => fetchJson<any[]>('/uploads').catch(() => []);

// ---- Journals ----
export const getJournals = () => fetchJson<any[]>('/journals');

// ---- Xiaohong (AI) ----
export const getXiaohongSuggestions = () => fetchJson<any[]>('/xiaohong/suggestions').catch(() => []);
export const chatWithXiaohong = (message: string) =>
  fetchJson<any>('/xiaohong/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

// ---- Dashboard stats helper ----
export async function getDashboardStats() {
  const [religions, holySites, temples, patriarchs, teachings, seals] =
    await Promise.all([
      getReligions().catch(() => []),
      getHolySites().catch(() => []),
      getTemples().catch(() => []),
      getPatriarchs().catch(() => []),
      getTeachings().catch(() => []),
      getSeals().catch(() => []),
    ]);
  return { religions, holySites, temples, patriarchs, teachings, seals };
}
