import { API_BASE } from "../api";

export interface FamilyHarmonyTheme {
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
  richContent: FamilyHarmonyRichContent | null;
  priceFrom: number | null;
  durationDays: number | null;
}

export interface FamilyHarmonyRichContent {
  dimension?: { code: string; label: string; kicker: string };
  familyPainPoint?: {
    title: string;
    body: string;
    signs?: string[];
    familyType?: string;
  };
  philosophy?: {
    title: string;
    body: string;
    quotes?: Array<{ source: string; text: string; translation?: string }>;
  };
  dailyItinerary?: Array<{
    day: number;
    title: string;
    location: string;
    dawn?: string;
    morning?: string;
    afternoon?: string;
    evening?: string;
    familyTime?: string;
    rituals?: string[];
  }>;
  mentorProfile?: {
    name: string;
    title: string;
    bio: string;
    expertise?: string[];
    philosophy?: string;
  };
  healingPath?: string[];
  targetAudience?: string[];
  testimonials?: Array<{
    name: string;
    role: string;
    familySize: number;
    quote: string;
    before: string;
    after: string;
  }>;
  gallery?: string[];
}

export interface FamilyHarmonyCase {
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

export function listThemes(page = 1, pageSize = 12) {
  return jsonFetch<Paginated<FamilyHarmonyTheme>>(
    `/api/family-harmony/themes?page=${page}&pageSize=${pageSize}`,
  );
}

export function getTheme(slug: string) {
  return jsonFetch<FamilyHarmonyTheme>(`/api/family-harmony/themes/${slug}`);
}

export function listCases(page = 1, pageSize = 12) {
  return jsonFetch<Paginated<FamilyHarmonyCase>>(
    `/api/family-harmony/cases?page=${page}&pageSize=${pageSize}`,
  );
}

export function getCase(slug: string) {
  return jsonFetch<FamilyHarmonyCase>(`/api/family-harmony/cases/${slug}`);
}

export interface SubmitFamilyInquiryPayload {
  themeId?: string;
  contactName: string;
  contactRole?: string;
  phone: string;
  email?: string;
  orgName?: string;
  headcount?: number;
  budget?: number;
  preferredAt?: string;
  message?: string;
  source?: string;
}

export function submitInquiry(payload: SubmitFamilyInquiryPayload) {
  return jsonFetch(`/api/family-harmony/inquiries`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
