const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

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
  mode: string;
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

export function getQuestions(mode: string) {
  return jsonFetch<{ items: FaithQuestion[]; total: number }>(
    `${API}/faith-assessment/questions?mode=${mode}`,
  );
}

export function submitAssessment(
  mode: string,
  answers: { questionId: string; selectedOption: string }[],
) {
  return jsonFetch<FaithAssessmentResult>(`${API}/faith-assessment/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, answers }),
  });
}

export function getResult(id: string) {
  return jsonFetch<FaithAssessmentResult>(`${API}/faith-assessment/results/${id}`);
}

export function getStats() {
  return jsonFetch<FaithStats>(`${API}/faith-assessment/stats`);
}
