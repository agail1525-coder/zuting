"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";

/**
 * AI 文化之旅方案规划等待页 — 进度条 + 阶段 + 禅意诗句轮播
 *
 * 进度策略 (伪进度,给用户安全感):
 *  0-5s    → 0-30%   📚 翻阅祖庭典籍
 *  5-30s   → 30-70%  🙏 为您匹配大师足迹
 *  30-90s  → 70-95%  ✍️ 精心设计旅途配套
 *  >90s    → 95%死等 → 真实返回时跳到 100%
 *
 * 12 句禅意诗句每 4s 切换一次,淡入淡出。
 */
export function AiPlanningProgress({
  enrichingCount = 0,
}: {
  /** AI 知识库正在补全的祖庭数量 (>0 时显示提示) */
  enrichingCount?: number;
}) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  // Progress tween — runs once per mount
  useEffect(() => {
    const startedAt = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      let next: number;
      let stage: number;
      if (elapsed < 5) {
        next = (elapsed / 5) * 30;
        stage = 0;
      } else if (elapsed < 30) {
        next = 30 + ((elapsed - 5) / 25) * 40;
        stage = 1;
      } else if (elapsed < 90) {
        next = 70 + ((elapsed - 30) / 60) * 25;
        stage = 2;
      } else {
        next = 95;
        stage = 3;
      }
      setProgress(next);
      setStageIndex(stage);
    }, 200);
    return () => clearInterval(id);
  }, []);

  // Quote rotation — 12 quotes, 4s each, with fade
  useEffect(() => {
    const id = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % 12);
        setQuoteVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const stageKeys = [
    "tripCreate.aiStage1",
    "tripCreate.aiStage2",
    "tripCreate.aiStage3",
    "tripCreate.aiStage4",
  ];

  return (
    <div className="mb-8 rounded-3xl bg-gradient-to-br from-[#0066FF]/5 via-white to-amber-50 border border-[#0066FF]/15 p-8 sm:p-12">
      {/* Lotus spinner */}
      <div className="flex justify-center mb-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-[#0066FF]/15" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#0066FF] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-3xl">
            🪷
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-center text-xl sm:text-2xl font-bold text-gray-900 mb-2">
        {t("tripCreate.aiPlanningHeadline")}
      </h3>

      {/* Stage label */}
      <p className="text-center text-sm text-gray-600 mb-6 transition-opacity duration-300">
        {t(stageKeys[stageIndex])}
      </p>

      {/* Progress bar */}
      <div className="relative h-2 rounded-full bg-gray-200 overflow-hidden mb-2">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#0066FF] to-amber-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-xs text-gray-400 mb-8 tabular-nums">
        {Math.round(progress)}%
      </p>

      {/* Enrichment hint */}
      {enrichingCount > 0 && (
        <p className="text-center text-xs text-amber-600 mb-4">
          ✨ {t("tripCreate.aiEnriching", { count: enrichingCount })}
        </p>
      )}

      {/* Zen quote — fade in/out */}
      <div className="min-h-[3.5rem] flex items-center justify-center">
        <p
          className={`text-center text-base sm:text-lg italic text-[#0066FF]/80 font-serif transition-opacity duration-400 ${
            quoteVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          「{t(`tripCreate.aiQuote${quoteIndex + 1}`)}」
        </p>
      </div>
    </div>
  );
}
