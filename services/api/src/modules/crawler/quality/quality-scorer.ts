/**
 * 爬虫++ 质量评分器 (CW-QG)
 *
 * 输入: 清洗后 title + content + imageUrls + 原始 raw text (用于污染率)
 * 输出: score ∈ [0, 1], reasons[] 详细解释
 *
 * 六维度加权:
 *   length      0.20 — 正文字数 200-3000 最佳
 *   images      0.15 — 图片 1-8 张最佳
 *   linkDensity 0.20 — 外链 < 2% 最佳
 *   adDensity   0.20 — 广告短语占比 < 1% 最佳
 *   title       0.15 — 非 clickbait, 长度适中
 *   originality 0.10 — 非模板化段落占比
 *
 * 阈值: ≥0.7 APPROVED, 0.4-0.7 PENDING_REVIEW, <0.4 REJECTED
 */
import { AD_PHRASES, CLICKBAIT_PATTERNS } from './ad-blacklist';

export interface QualityInput {
  title: string;
  content: string;
  imageUrls: string[];
  rawAdPhraseHits?: number; // sanitize removed 数, 用来算污染率
}

export interface QualityResult {
  score: number; // 0-1
  breakdown: {
    length: number;
    images: number;
    linkDensity: number;
    adDensity: number;
    title: number;
    originality: number;
  };
  reasons: string[];
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function scoreLength(len: number): number {
  if (len < 80) return 0.1;
  if (len < 200) return 0.5;
  if (len <= 3000) return 1.0;
  if (len <= 6000) return 0.8;
  return 0.6;
}

function scoreImages(n: number): number {
  if (n === 0) return 0.4;
  if (n <= 8) return 1.0;
  if (n <= 15) return 0.7;
  return 0.4;
}

function scoreLinkDensity(content: string): number {
  const urlMatches = content.match(/https?:\/\/[^\s)】」"']+/g) || [];
  const ratio = urlMatches.length / Math.max(1, content.length / 500);
  if (ratio < 1) return 1.0;
  if (ratio < 2) return 0.7;
  if (ratio < 4) return 0.4;
  return 0.1;
}

function scoreAdDensity(content: string, rawAdHits = 0): number {
  let hits = rawAdHits;
  for (const phrase of AD_PHRASES) {
    if (content.includes(phrase)) hits++;
  }
  const ratio = hits / Math.max(1, content.length / 500);
  if (ratio < 0.2) return 1.0;
  if (ratio < 0.5) return 0.7;
  if (ratio < 1) return 0.4;
  return 0.1;
}

function scoreTitle(title: string): number {
  if (!title || title.length < 4) return 0.2;
  if (title.length > 80) return 0.5;
  for (const pat of CLICKBAIT_PATTERNS) {
    if (pat.test(title)) return 0.4;
  }
  return 1.0;
}

function scoreOriginality(content: string): number {
  const paras = content.split(/\n{2,}/).filter((p) => p.trim().length >= 20);
  if (paras.length === 0) return 0.3;
  const freq = new Map<string, number>();
  for (const p of paras) freq.set(p, (freq.get(p) || 0) + 1);
  const unique = [...freq.values()].filter((v) => v === 1).length;
  return clamp01(unique / paras.length);
}

export function scoreQuality(input: QualityInput): QualityResult {
  const len = (input.content || '').length;
  const breakdown = {
    length: scoreLength(len),
    images: scoreImages((input.imageUrls || []).length),
    linkDensity: scoreLinkDensity(input.content || ''),
    adDensity: scoreAdDensity(input.content || '', input.rawAdPhraseHits || 0),
    title: scoreTitle(input.title || ''),
    originality: scoreOriginality(input.content || ''),
  };

  const score =
    breakdown.length * 0.2 +
    breakdown.images * 0.15 +
    breakdown.linkDensity * 0.2 +
    breakdown.adDensity * 0.2 +
    breakdown.title * 0.15 +
    breakdown.originality * 0.1;

  const reasons: string[] = [];
  if (breakdown.length < 0.5) reasons.push(`正文过短/过长 (${len} 字)`);
  if (breakdown.images < 0.5) reasons.push(`图片数异常 (${(input.imageUrls || []).length})`);
  if (breakdown.linkDensity < 0.5) reasons.push('外链密度过高');
  if (breakdown.adDensity < 0.5) reasons.push('广告短语密度过高');
  if (breakdown.title < 0.5) reasons.push('标题 clickbait 嫌疑');
  if (breakdown.originality < 0.5) reasons.push('段落重复率过高');

  return { score: clamp01(score), breakdown, reasons };
}

export const QUALITY_APPROVE_THRESHOLD = 0.7;
export const QUALITY_REVIEW_THRESHOLD = 0.4;

export function classifyQuality(score: number): 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED' {
  if (score >= QUALITY_APPROVE_THRESHOLD) return 'APPROVED';
  if (score >= QUALITY_REVIEW_THRESHOLD) return 'PENDING_REVIEW';
  return 'REJECTED';
}
