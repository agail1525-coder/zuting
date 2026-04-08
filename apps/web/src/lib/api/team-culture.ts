import { API_BASE } from "../api";

export interface ThemeRichContent {
  dimension?: { code: string; label: string; kicker: string };
  founderPainPoint?: { title: string; body: string; signs?: string[] };
  philosophy?: {
    title: string;
    body: string;
    quotes?: Array<{ source: string; text: string; translation?: string }>;
  };
  dailyItinerary?: Array<{
    day: number;
    title: string;
    location: string;
    morning?: string;
    afternoon?: string;
    evening?: string;
    rituals?: string[];
  }>;
  mentorTeam?: Array<{ name: string; title: string; bio: string }>;
  deliverables?: string[];
  targetAudience?: string[];
  whyZuting?: string[];
  gallery?: string[];
}

export interface TeamCultureTheme {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  color: string;
  icon: string | null;
  coverUrl: string | null;
  keywords: string[];
  holySites: string[];
  routes: string[];
  rituals: Array<{ name: string; durationMin: number; description: string }> | null;
  richContent: ThemeRichContent | null;
  priceFrom: number | null;
  durationDays: number | null;
}

export interface TeamCase {
  id: string;
  slug: string;
  teamName: string;
  orgType: string;
  industry: string | null;
  headcount: number;
  story: string;
  highlights: string[];
  photos: string[];
  videoUrl: string | null;
  testimonial: string | null;
  publishedAt: string | null;
  viewCount: number;
  theme: { id: string; slug: string; title: string; color: string } | null;
}

export interface TeamSummary {
  id: string;
  name: string;
  slug: string;
  orgType: string;
  industry: string | null;
  size: number;
  logoUrl: string | null;
  coverUrl: string | null;
  city: string | null;
  ownerId: string;
  createdAt: string;
  role: string;
  _count: { members: number; certificates: number };
}

interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`API ${res.status}: ${text || res.statusText}`);
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Public ─────────────────────────────────────────────
export function listThemes(page = 1, pageSize = 12) {
  return jsonFetch<Paginated<TeamCultureTheme>>(
    `/api/team-culture/themes?page=${page}&pageSize=${pageSize}`,
  );
}

export function getTheme(slug: string) {
  return jsonFetch<TeamCultureTheme>(`/api/team-culture/themes/${slug}`);
}

export function listCases(page = 1, pageSize = 12) {
  return jsonFetch<Paginated<TeamCase>>(
    `/api/team-culture/cases?page=${page}&pageSize=${pageSize}`,
  );
}

export function getCase(slug: string) {
  return jsonFetch<TeamCase>(`/api/team-culture/cases/${slug}`);
}

export interface SubmitInquiryPayload {
  themeId?: string;
  contactName: string;
  contactRole?: string;
  phone: string;
  email?: string;
  orgName: string;
  headcount: number;
  budget?: number;
  preferredAt?: string;
  message?: string;
  source?: string;
}

export function submitInquiry(payload: SubmitInquiryPayload) {
  return jsonFetch(`/api/team-culture/inquiries`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Authenticated ──────────────────────────────────────
export function getMyTeams(token: string) {
  return jsonFetch<TeamSummary[]>(`/api/team-culture/teams/me`, {
    headers: authHeaders(token),
  });
}

export function createTeam(token: string, payload: Partial<TeamSummary> & { name: string; orgType: string }) {
  return jsonFetch<TeamSummary>(`/api/team-culture/teams`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function getTeam(token: string, id: string) {
  return jsonFetch<TeamSummary>(`/api/team-culture/teams/${id}`, {
    headers: authHeaders(token),
  });
}

export function listTeamMembers(token: string, id: string) {
  return jsonFetch<Array<{ id: string; role: string; joinedAt: string; user: { id: string; nickname: string; avatar: string | null } }>>(
    `/api/team-culture/teams/${id}/members`,
    { headers: authHeaders(token) },
  );
}

export function listTeamCertificates(token: string, id: string) {
  return jsonFetch<Array<{ id: string; title: string; serialNo: string; issuedAt: string; pdfUrl: string | null; imageUrl: string | null }>>(
    `/api/team-culture/teams/${id}/certificates`,
    { headers: authHeaders(token) },
  );
}

export function inviteMember(token: string, id: string, role: "ADMIN" | "MEMBER" | "GUEST" = "MEMBER") {
  return jsonFetch<{ token: string; expiresAt: string }>(
    `/api/team-culture/teams/${id}/members/invite`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ role }),
    },
  );
}

export function acceptInvite(token: string, inviteToken: string) {
  return jsonFetch<{ teamId: string; role: string }>(
    `/api/team-culture/teams/join/${inviteToken}`,
    { method: "POST", headers: authHeaders(token) },
  );
}
