// Mobile APP - 四部曲 + 爬虫视频 + 排行榜 API client
// 路径: apps/mobile/src/lib/api-pillars.ts
// 与 apps/web/src/lib/api/{culture-life,faith-assessment,personal-growth,family-harmony}.ts 对齐
import { getAccessToken } from './auth';

const BASE_URL = __DEV__
  ? 'http://192.168.1.22:3002/api'
  : 'https://zuting.fszyl.top/api';

async function jsonGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function jsonPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `API ${res.status}`);
  }
  return res.json();
}

// ── Culture-Life (M40) ────────────────────────────────
export const LIFE_QUESTION_CODES = [
  'ORIGIN_PURPOSE', 'SUFFERING', 'LOVE_RELATIONSHIP', 'WEALTH_DESIRE',
  'FREEDOM_FATE', 'DEATH_TRANSCENDENCE', 'SIN_REDEMPTION', 'KNOWLEDGE',
  'SELF_OTHER', 'TIME_ETERNITY', 'BODY_SOUL', 'LEGACY_IMMORTALITY',
] as const;
export type LifeQuestionCode = typeof LIFE_QUESTION_CODES[number];

export const LIFE_STAGES = ['BIRTH', 'GROWTH', 'MARRIAGE', 'CAREER', 'MIDLIFE', 'AGING', 'DEATH'] as const;
export type LifeStage = typeof LIFE_STAGES[number];

export const LIFE_QUESTION_META: Record<LifeQuestionCode, { title: string; emoji: string }> = {
  ORIGIN_PURPOSE:      { title: '生命的起源与目的', emoji: '🌱' },
  SUFFERING:           { title: '苦难的意义',       emoji: '🔥' },
  LOVE_RELATIONSHIP:   { title: '爱与关系',         emoji: '💞' },
  WEALTH_DESIRE:       { title: '财富与欲望',       emoji: '⚖️' },
  FREEDOM_FATE:        { title: '自由与命运',       emoji: '🦅' },
  DEATH_TRANSCENDENCE: { title: '死亡与超越',       emoji: '🕊️' },
  SIN_REDEMPTION:      { title: '罪与救赎',         emoji: '✝️' },
  KNOWLEDGE:           { title: '知识与无知',       emoji: '📜' },
  SELF_OTHER:          { title: '自我与他者',       emoji: '👥' },
  TIME_ETERNITY:       { title: '时间与永恒',       emoji: '⏳' },
  BODY_SOUL:           { title: '身体与灵魂',       emoji: '🌬️' },
  LEGACY_IMMORTALITY:  { title: '传承与不朽',       emoji: '🌳' },
};

export const LIFE_STAGE_META: Record<LifeStage, { title: string; emoji: string; age: string }> = {
  BIRTH:    { title: '诞生',  emoji: '👶', age: '0-3' },
  GROWTH:   { title: '成长',  emoji: '🌱', age: '4-17' },
  MARRIAGE: { title: '成家',  emoji: '💍', age: '18-30' },
  CAREER:   { title: '立业',  emoji: '💼', age: '25-45' },
  MIDLIFE:  { title: '中年',  emoji: '🌓', age: '40-60' },
  AGING:    { title: '老年',  emoji: '🍂', age: '60+' },
  DEATH:    { title: '临终',  emoji: '🕯️', age: '—' },
};

export interface ReligionBadge {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  symbol: string | null;
  color: string | null;
}

export interface LifeQuestion {
  id: string;
  code: LifeQuestionCode;
  title: string;
  titleEn: string;
  question: string;
  philosophicalDepth: string;
  sortOrder: number;
}

export interface ScriptureRef { scripture: string; chapter?: string; quote: string; translation?: string }
export interface MasterQuote  { master: string; quote: string; source?: string }

export interface LifePerspective {
  id: string;
  religionId: string;
  questionId: string;
  corePosition: string;
  elaboration: string;
  scriptureRefs: ScriptureRef[] | null;
  masterQuotes: MasterQuote[] | null;
  practiceGuide: string | null;
  aiReflection: string | null;
  religion?: ReligionBadge;
  question?: LifeQuestion;
}

export interface LifeStageGuide {
  id: string;
  religionId: string;
  stage: LifeStage;
  title: string;
  keyWisdom: string;
  rituals: Array<{ name: string; purpose?: string; howTo?: string }> | null;
  challenges: Array<{ challenge: string; guidance: string }> | null;
  scriptureRef: string | null;
  religion?: ReligionBadge;
}

export const fetchLifeQuestions = () =>
  jsonGet<{ items: LifeQuestion[]; total: number }>('/culture-life/questions');

export const fetchQuestionMatrix = (code: string) =>
  jsonGet<LifeQuestion & { perspectives: LifePerspective[] }>(`/culture-life/questions/${code}`);

export const fetchReligionPerspectives = (religionSlug: string) =>
  jsonGet<{ religion: ReligionBadge; perspectives: LifePerspective[] }>(
    `/culture-life/perspectives/${religionSlug}`,
  );

export const fetchStages = () =>
  jsonGet<{ items: LifeStageGuide[]; total: number }>('/culture-life/stages');

export const fetchStageMatrix = (stage: string) =>
  jsonGet<{ stage: string; items: LifeStageGuide[] }>(`/culture-life/stages/${stage}`);

export const submitDialogue = (situation: string, questionCode?: string) =>
  jsonPost<{ reply: string; citedPerspectives?: LifePerspective[] }>(
    '/culture-life/dialogue',
    { situation, ...(questionCode ? { questionCode } : {}) },
  );

// ── Faith-Assessment (M36) ────────────────────────────
export type FaithMode = 'PERSONAL' | 'FAMILY' | 'ENTERPRISE';

export interface FaithQuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
  score: number;
  crossScores?: Record<string, number>;
}

export interface FaithQuestion {
  id: string;
  dimension: string;
  sortOrder: number;
  questionText: string;
  options: FaithQuestionOption[];
}

export interface FaithAssessmentResult {
  id: string;
  mode: FaithMode;
  scores: {
    awareness: number;
    resilience: number;
    vision: number;
    connection: number;
    legacy: number;
  };
  totalScore: number;
  level: string;
  levelCode: string;
  levelColor: string;
  strongestDimension: string;
  weakestDimension: string;
  recommendedThemes: string[];
  pointsEarned: number;
}

export interface FaithStats {
  totalAssessments: number;
  avgScore: number;
  avgDimensions: Record<string, number>;
  byMode: { mode: string; count: number; avgScore: number }[];
}

export const fetchFaithQuestions = (mode: FaithMode) =>
  jsonGet<{ items: FaithQuestion[]; total: number }>(`/faith-assessment/questions?mode=${mode}`);

export const submitFaithAssessment = (
  mode: FaithMode,
  answers: { questionId: string; selectedOption: string }[],
) =>
  jsonPost<FaithAssessmentResult>('/faith-assessment/submit', { mode, answers });

export const fetchFaithResult = (id: string) =>
  jsonGet<FaithAssessmentResult>(`/faith-assessment/results/${id}`);

export const fetchFaithStats = () =>
  jsonGet<FaithStats>('/faith-assessment/stats');

// ── Personal-Growth (M34) ─────────────────────────────
export interface PersonalGrowthRichContent {
  dimension?: { code: string; label: string; kicker: string };
  entrepreneurPainPoint?: { title: string; body: string; signs?: string[]; stage?: string };
  philosophy?: { title: string; body: string; quotes?: Array<{ source: string; text: string; translation?: string }> };
  dailyItinerary?: Array<{ day: number; title: string; location: string; dawn?: string; morning?: string; afternoon?: string; evening?: string; soloTime?: string; rituals?: string[] }>;
  mentorProfile?: { name: string; title: string; bio: string; expertise?: string[]; philosophy?: string };
  transformationPath?: string[];
  targetAudience?: string[];
  testimonials?: Array<{ name: string; role: string; company: string; quote: string; before: string; after: string }>;
  gallery?: string[];
}

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

export const fetchPgThemes = (page = 1, pageSize = 12) =>
  jsonGet<{ items: PersonalGrowthTheme[]; total: number; page: number; pageSize: number }>(
    `/personal-growth/themes?page=${page}&pageSize=${pageSize}`,
  );

export const fetchPgTheme = (slug: string) =>
  jsonGet<PersonalGrowthTheme>(`/personal-growth/themes/${slug}`);

export const fetchPgCases = (page = 1, pageSize = 12) =>
  jsonGet<{ items: PersonalGrowthCase[]; total: number; page: number; pageSize: number }>(
    `/personal-growth/cases?page=${page}&pageSize=${pageSize}`,
  );

export const fetchPgCase = (slug: string) =>
  jsonGet<PersonalGrowthCase>(`/personal-growth/cases/${slug}`);

export const submitPgInquiry = (payload: {
  themeId?: string;
  contactName: string;
  phone: string;
  email?: string;
  orgName?: string;
  message?: string;
  source?: string;
}) => jsonPost('/personal-growth/inquiries', payload as Record<string, unknown>);

// ── Family-Harmony (M35) ──────────────────────────────
export interface FamilyHarmonyRichContent {
  dimension?: { code: string; label: string; kicker: string };
  familyPainPoint?: { title: string; body: string; signs?: string[]; familyType?: string };
  philosophy?: { title: string; body: string; quotes?: Array<{ source: string; text: string; translation?: string }> };
  dailyItinerary?: Array<{ day: number; title: string; location: string; dawn?: string; morning?: string; afternoon?: string; evening?: string; familyTime?: string; rituals?: string[] }>;
  mentorProfile?: { name: string; title: string; bio: string; expertise?: string[]; philosophy?: string };
  healingPath?: string[];
  targetAudience?: string[];
  testimonials?: Array<{ name: string; role: string; familySize: number; quote: string; before: string; after: string }>;
  gallery?: string[];
}

export interface FamilyHarmonyTheme extends Omit<PersonalGrowthTheme, 'richContent'> {
  richContent: FamilyHarmonyRichContent | null;
}

export interface FamilyHarmonyCase extends PersonalGrowthCase {}

export const fetchFhThemes = (page = 1, pageSize = 12) =>
  jsonGet<{ items: FamilyHarmonyTheme[]; total: number; page: number; pageSize: number }>(
    `/family-harmony/themes?page=${page}&pageSize=${pageSize}`,
  );

export const fetchFhTheme = (slug: string) =>
  jsonGet<FamilyHarmonyTheme>(`/family-harmony/themes/${slug}`);

export const fetchFhCases = (page = 1, pageSize = 12) =>
  jsonGet<{ items: FamilyHarmonyCase[]; total: number; page: number; pageSize: number }>(
    `/family-harmony/cases?page=${page}&pageSize=${pageSize}`,
  );

export const fetchFhCase = (slug: string) =>
  jsonGet<FamilyHarmonyCase>(`/family-harmony/cases/${slug}`);

export const submitFhInquiry = (payload: {
  themeId?: string;
  contactName: string;
  phone: string;
  email?: string;
  message?: string;
  source?: string;
}) => jsonPost('/family-harmony/inquiries', payload as Record<string, unknown>);

// ── Crawler Videos (CW-YT) ────────────────────────────
export interface CrawlerVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  channel: string | null;
  publishedAt: string | null;
  durationSec: number | null;
  viewCount: number | null;
}

export const fetchCrawlerVideos = async (
  targetType: 'holySite' | 'religion',
  targetId: string,
  limit = 12,
): Promise<CrawlerVideo[]> => {
  try {
    const res = await jsonGet<{ items: CrawlerVideo[] }>(
      `/crawlers/videos?targetType=${targetType}&targetId=${encodeURIComponent(targetId)}&limit=${limit}`,
    );
    return Array.isArray(res?.items) ? res.items : [];
  } catch {
    return [];
  }
};

// ── Community Rankings ────────────────────────────────
export interface RankingEntry {
  userId: string;
  nickname: string;
  avatar: string | null;
  count: number;
  rank: number;
}

export const fetchRankings = async (
  type: 'guide' | 'review' | 'trip' | 'journal',
  period: 'week' | 'month' | 'all' = 'month',
): Promise<RankingEntry[]> => {
  try {
    return await jsonGet<RankingEntry[]>(
      `/community/leaderboard?type=${type}&period=${period}`,
    );
  } catch {
    return [];
  }
};

// ── TP++ Tiered Packages ──────────────────────────────
export type TpTier = 'LUXURY' | 'BUSINESS' | 'STANDARD' | 'BUDGET';

export interface TpPackageItem {
  id: string;
  tier: TpTier;
  category: string;
  name: string;
  description: string | null;
  priceFrom: number;
  currency: string;
  rating: number | null;
  coverImage: string | null;
  holySiteId: string | null;
  merchantId: string | null;
}

export const fetchTpPackages = async (
  holySiteId?: string,
  tier?: TpTier,
): Promise<TpPackageItem[]> => {
  try {
    const qs = new URLSearchParams();
    if (holySiteId) qs.set('holySiteId', holySiteId);
    if (tier) qs.set('tier', tier);
    const res = await jsonGet<{ items?: TpPackageItem[] } | TpPackageItem[]>(
      `/destination-package?${qs.toString()}`,
    );
    if (Array.isArray(res)) return res;
    return Array.isArray(res?.items) ? res.items : [];
  } catch {
    return [];
  }
};

export const TP_TIER_META: Record<TpTier, { name: string; color: string; icon: string }> = {
  LUXURY:   { name: '尊贵', color: '#8B6914', icon: '👑' },
  BUSINESS: { name: '商务', color: '#1E40AF', icon: '💼' },
  STANDARD: { name: '标准', color: '#3264ff', icon: '✨' },
  BUDGET:   { name: '自助', color: '#059669', icon: '🎒' },
};

// ── User public profile ──────────────────────────────
export interface PublicUserProfile {
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  pilgrimLevel: number;
  totalTrips: number;
  totalSites: number;
  guideCount: number;
  reviewCount: number;
}

export const fetchPublicUserProfile = (userId: string) =>
  jsonGet<PublicUserProfile>(`/users/${userId}/profile`);
