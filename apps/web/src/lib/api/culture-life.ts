import { API_BASE } from "../api";

export const LIFE_QUESTION_CODES = [
  'ORIGIN_PURPOSE', 'SUFFERING', 'LOVE_RELATIONSHIP', 'WEALTH_DESIRE',
  'FREEDOM_FATE', 'DEATH_TRANSCENDENCE', 'SIN_REDEMPTION', 'KNOWLEDGE',
  'SELF_OTHER', 'TIME_ETERNITY', 'BODY_SOUL', 'LEGACY_IMMORTALITY',
] as const;
export type LifeQuestionCode = typeof LIFE_QUESTION_CODES[number];

export const LIFE_STAGES = ['BIRTH', 'GROWTH', 'MARRIAGE', 'CAREER', 'MIDLIFE', 'AGING', 'DEATH'] as const;
export type LifeStage = typeof LIFE_STAGES[number];

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

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${API_BASE}${url}`, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(t);
  }
}

export async function fetchLifeQuestions() {
  return fetchJson<{ items: LifeQuestion[]; total: number }>("/api/culture-life/questions");
}

export async function fetchQuestionMatrix(code: string) {
  return fetchJson<LifeQuestion & { perspectives: LifePerspective[] }>(
    `/api/culture-life/questions/${code}`,
  );
}

export async function fetchReligionPerspectives(religionSlug: string) {
  return fetchJson<{ religion: ReligionBadge; perspectives: LifePerspective[] }>(
    `/api/culture-life/perspectives/${religionSlug}`,
  );
}

export async function fetchStages() {
  return fetchJson<{ items: LifeStageGuide[]; total: number }>("/api/culture-life/stages");
}

export async function fetchStageMatrix(stage: string) {
  return fetchJson<{ stage: string; items: LifeStageGuide[] }>(
    `/api/culture-life/stages/${stage}`,
  );
}

export const LIFE_QUESTION_META: Record<LifeQuestionCode, { title: string; emoji: string; gradient: string }> = {
  ORIGIN_PURPOSE:      { title: '生命的起源与目的', emoji: '🌱', gradient: 'from-emerald-500/20 to-teal-500/20' },
  SUFFERING:           { title: '苦难的意义',       emoji: '🔥', gradient: 'from-orange-500/20 to-red-500/20' },
  LOVE_RELATIONSHIP:   { title: '爱与关系',         emoji: '💞', gradient: 'from-pink-500/20 to-rose-500/20' },
  WEALTH_DESIRE:       { title: '财富与欲望',       emoji: '⚖️', gradient: 'from-yellow-500/20 to-amber-500/20' },
  FREEDOM_FATE:        { title: '自由与命运',       emoji: '🦅', gradient: 'from-sky-500/20 to-indigo-500/20' },
  DEATH_TRANSCENDENCE: { title: '死亡与超越',       emoji: '🕊️', gradient: 'from-slate-500/20 to-gray-500/20' },
  SIN_REDEMPTION:      { title: '罪与救赎',         emoji: '✝️', gradient: 'from-purple-500/20 to-violet-500/20' },
  KNOWLEDGE:           { title: '知识与无知',       emoji: '📜', gradient: 'from-blue-500/20 to-cyan-500/20' },
  SELF_OTHER:          { title: '自我与他者',       emoji: '👥', gradient: 'from-fuchsia-500/20 to-pink-500/20' },
  TIME_ETERNITY:       { title: '时间与永恒',       emoji: '⏳', gradient: 'from-indigo-500/20 to-purple-500/20' },
  BODY_SOUL:           { title: '身体与灵魂',       emoji: '🌬️', gradient: 'from-teal-500/20 to-emerald-500/20' },
  LEGACY_IMMORTALITY:  { title: '传承与不朽',       emoji: '🌳', gradient: 'from-amber-500/20 to-yellow-500/20' },
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
