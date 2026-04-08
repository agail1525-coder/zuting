import { API_BASE } from "../api";

export interface PersonalGrowthTheme {
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
  richContent: PersonalGrowthRichContent | null;
  priceFrom: number | null;
  durationDays: number | null;
}

export interface PersonalGrowthRichContent {
  dimension?: { code: string; label: string; kicker: string };
  entrepreneurPainPoint?: {
    title: string;
    body: string;
    signs?: string[];
    stage?: string;
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
    soloTime?: string;
    rituals?: string[];
  }>;
  mentorProfile?: {
    name: string;
    title: string;
    bio: string;
    expertise?: string[];
    philosophy?: string;
  };
  transformationPath?: string[];
  targetAudience?: string[];
  testimonials?: Array<{
    name: string;
    role: string;
    company: string;
    quote: string;
    before: string;
    after: string;
  }>;
  gallery?: string[];
}

export interface PersonalGrowthCase {
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
  return jsonFetch<Paginated<PersonalGrowthTheme>>(
    `/api/personal-growth/themes?page=${page}&pageSize=${pageSize}`,
  );
}

export function getTheme(slug: string) {
  return jsonFetch<PersonalGrowthTheme>(`/api/personal-growth/themes/${slug}`);
}

export function listCases(page = 1, pageSize = 12) {
  return jsonFetch<Paginated<PersonalGrowthCase>>(
    `/api/personal-growth/cases?page=${page}&pageSize=${pageSize}`,
  );
}

export function getCase(slug: string) {
  return jsonFetch<PersonalGrowthCase>(`/api/personal-growth/cases/${slug}`);
}

export interface SubmitPersonalInquiryPayload {
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

export function submitInquiry(payload: SubmitPersonalInquiryPayload) {
  return jsonFetch(`/api/personal-growth/inquiries`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
