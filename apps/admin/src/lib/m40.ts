// M40 Admin Cockpit API client — separate from legacy api.ts
import { getToken, logout } from './auth';

const BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${url}`, { ...init, headers });
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
      /* non-json */
    }
    throw new Error(detail || `API ${res.status}: ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ===== Types =====

export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'PANO360';

export interface MediaAsset {
  id: string;
  url: string;
  type: MediaType;
  width?: number | null;
  height?: number | null;
  size?: number | null;
  hash?: string | null;
  altText?: string | null;
  description?: string | null;
  tags: string[];
  aiGenerated: boolean;
  folder?: string | null;
  uploadedBy?: string | null;
  references?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type AdminActionKind =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'AI_GENERATE'
  | 'AI_TRANSLATE'
  | 'AI_MODERATE'
  | 'ROLLBACK';

export interface AuditLog {
  id: string;
  adminId: string;
  action: AdminActionKind;
  resource: string;
  resourceId?: string | null;
  diff?: unknown;
  aiTraceId?: string | null;
  ip?: string | null;
  ua?: string | null;
  createdAt: string;
}

export interface AiTrace {
  id: string;
  scenario: string;
  model: string;
  prompt: string;
  output?: string | null;
  tokensIn?: number | null;
  tokensOut?: number | null;
  latencyMs?: number | null;
  cost?: string | null;
  approved: boolean;
  approvedBy?: string | null;
  adminId: string;
  resource?: string | null;
  resourceId?: string | null;
  createdAt: string;
}

export interface AdminRoleRecord {
  id: string;
  name: string;
  permissions: string[];
  description?: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===== Content Entity CRUD (Studio) =====

export interface GalleryItem {
  url: string;
  caption?: string;
  sortOrder?: number;
}

export interface AudioGuide {
  url: string;
  lang?: string;
  title?: string;
}

export const getHolySiteDetail = (id: string) =>
  request<Record<string, unknown>>(`/holy-sites/${id}`);

export const patchHolySite = (id: string, data: Record<string, unknown>) =>
  request<Record<string, unknown>>(`/holy-sites/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const getTempleDetail = (id: string) =>
  request<Record<string, unknown>>(`/temples/${id}`);

export const patchTemple = (id: string, data: Record<string, unknown>) =>
  request<Record<string, unknown>>(`/temples/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const getPatriarchDetail = (id: string) =>
  request<Record<string, unknown>>(`/patriarchs/${id}`);

export const patchPatriarch = (id: string, data: Record<string, unknown>) =>
  request<Record<string, unknown>>(`/patriarchs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const getTeachingDetail = (id: string) =>
  request<Record<string, unknown>>(`/teachings/${id}`);

export const patchTeaching = (id: string, data: Record<string, unknown>) =>
  request<Record<string, unknown>>(`/teachings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export interface ScriptureRecord {
  id: string;
  slug: string;
  title: string;
  titleEn?: string | null;
  author?: string | null;
  era?: string | null;
  categoryId: string;
  tradition: string;
  ring: number;
  summary: string;
  significance?: string | null;
  coverUrl?: string | null;
  chapterCount: number;
  readingMins?: number | null;
  difficulty: number;
  oxStageMin: number;
  oxStageMax: number;
  relatedIds: string[];
  tags: string[];
  isPublished: boolean;
  viewCount: number;
  sortOrder: number;
  category?: { id: string; name: string; slug: string } | null;
  chapters?: Array<{ id: string; chapterNo: number; title: string; subtitle?: string | null }>;
}

export const listScriptures = (params: {
  q?: string;
  tradition?: string;
  page?: number;
  pageSize?: number;
}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  return request<Paginated<ScriptureRecord>>(`/admin/scriptures?${qs.toString()}`);
};

export const getScriptureDetail = (id: string) =>
  request<ScriptureRecord>(`/admin/scriptures/${id}`);

export const patchScripture = (id: string, data: Partial<ScriptureRecord>) =>
  request<ScriptureRecord>(`/admin/scriptures/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const createScripture = (data: Partial<ScriptureRecord> & { slug: string; title: string }) =>
  request<ScriptureRecord>(`/admin/scriptures`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const deleteScripture = (id: string) =>
  request<{ id: string }>(`/admin/scriptures/${id}`, { method: 'DELETE' });

// ===== Route =====

export const getRouteDetail = (id: string) =>
  request<Record<string, unknown>>(`/routes/${id}`);

export const patchRoute = (id: string, data: Record<string, unknown>) =>
  request<Record<string, unknown>>(`/routes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// ===== Coupon =====

export const getCouponDetail = (id: string) =>
  request<Record<string, unknown>>(`/coupons/${id}`);

export const patchCoupon = (id: string, data: Record<string, unknown>) =>
  request<Record<string, unknown>>(`/coupons/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// ===== Promotion =====

export const getPromotionDetail = (id: string) =>
  request<Record<string, unknown>>(`/promotions/${id}`);

export const patchPromotion = (id: string, data: Record<string, unknown>) =>
  request<Record<string, unknown>>(`/promotions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// ===== Guide / Question (Community) =====

export const getGuideDetail = (id: string) =>
  request<Record<string, unknown>>(`/guides/${id}`);

export const patchGuide = (id: string, data: Record<string, unknown>) =>
  request<Record<string, unknown>>(`/guides/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const getQuestionDetail = (id: string) =>
  request<Record<string, unknown>>(`/questions/${id}`);

export const patchQuestion = (id: string, data: Record<string, unknown>) =>
  request<Record<string, unknown>>(`/questions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// ===== Media Library =====

export const listMedia = (params: {
  type?: MediaType;
  folder?: string;
  tag?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  return request<Paginated<MediaAsset>>(`/admin/media?${qs.toString()}`);
};

export const createMediaAsset = (data: Partial<MediaAsset> & { url: string }) =>
  request<MediaAsset>('/admin/media', { method: 'POST', body: JSON.stringify(data) });

export const updateMediaAsset = (
  id: string,
  data: { altText?: string; description?: string; tags?: string[]; folder?: string },
) => request<MediaAsset>(`/admin/media/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteMediaAsset = (id: string) =>
  request<{ id: string }>(`/admin/media/${id}`, { method: 'DELETE' });

export const aiDescribeMedia = (id: string) =>
  request<MediaAsset>(`/admin/media/${id}/ai-describe`, { method: 'POST' });

export const aiGenerateImage = (data: { prompt: string; style?: string; size?: string }) =>
  request<MediaAsset>('/admin/media/ai-generate', { method: 'POST', body: JSON.stringify(data) });

export const getMediaReferences = (id: string) =>
  request<{ id: string; references: unknown }>(`/admin/media/${id}/references`);

// ===== Audit =====

export const listAuditLogs = (params: {
  resource?: string;
  resourceId?: string;
  adminId?: string;
  action?: AdminActionKind;
  page?: number;
  pageSize?: number;
}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  return request<Paginated<AuditLog>>(`/admin/audit-logs?${qs.toString()}`);
};

export const getResourceHistory = (resource: string, id: string) =>
  request<AuditLog[]>(`/admin/audit-logs/${resource}/${id}`);

// ===== AI Gateway =====

export type SupportedLang = 'zh' | 'en' | 'ja' | 'ko' | 'th' | 'hi' | 'ar';

export const aiTranslate = (data: {
  text: string;
  sourceLang?: SupportedLang;
  targetLangs: SupportedLang[];
}) =>
  request<{ results: Record<string, string>; traceIds: string[] }>(
    '/admin/ai/translate',
    { method: 'POST', body: JSON.stringify(data) },
  );

export const aiContentGenerate = (data: {
  resource: string;
  fieldName: string;
  context?: string;
  style?: string;
  language?: string;
}) =>
  request<{ output: string; traceId: string }>('/admin/ai/content/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const aiSeo = (data: { resource: string; id: string; language?: string }) =>
  request<{ output: string; traceId: string }>('/admin/ai/seo', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const aiModerate = (data: { text?: string; imageUrl?: string }) =>
  request<{ label: string; score: number; output: string; traceId: string }>(
    '/admin/ai/moderate',
    { method: 'POST', body: JSON.stringify(data) },
  );

export const aiInsight = (question: string) =>
  request<{ answer: string; traceId: string }>('/admin/ai/insight', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });

export const aiCommand = (utterance: string) =>
  request<{
    parsed: { action: string; confirmed: boolean };
    output: string;
    traceId: string;
    requiresConfirmation: boolean;
  }>('/admin/ai/command', { method: 'POST', body: JSON.stringify({ utterance }) });

export const aiPromptLabRun = (data: {
  prompt: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}) =>
  request<{
    output: string;
    latencyMs: number;
    tokensIn: number;
    tokensOut: number;
    traceId: string;
  }>('/admin/ai/prompt-lab/run', { method: 'POST', body: JSON.stringify(data) });

export const listAiTraces = (params: {
  scenario?: string;
  adminId?: string;
  page?: number;
  pageSize?: number;
}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  return request<Paginated<AiTrace>>(`/admin/ai/traces?${qs.toString()}`);
};

export const approveAiTrace = (id: string) =>
  request<AiTrace>(`/admin/ai/traces/${id}/approve`, { method: 'POST' });

// ===== Roles =====

export const listAdminRoles = () => request<AdminRoleRecord[]>('/admin/roles');
export const listAdminPermissions = () =>
  request<{ resources: string[]; actions: string[]; all: string[] }>('/admin/roles/permissions');
export const seedSystemRoles = () =>
  request<AdminRoleRecord[]>('/admin/roles/seed', { method: 'POST' });
export const createAdminRole = (data: {
  name: string;
  description?: string;
  permissions: string[];
}) => request<AdminRoleRecord>('/admin/roles', { method: 'POST', body: JSON.stringify(data) });
export const updateAdminRole = (
  id: string,
  data: { description?: string; permissions?: string[] },
) => request<AdminRoleRecord>(`/admin/roles/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteAdminRole = (id: string) =>
  request<{ id: string }>(`/admin/roles/${id}`, { method: 'DELETE' });
