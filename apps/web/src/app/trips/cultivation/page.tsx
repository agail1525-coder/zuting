"use client";

import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import {
  fetchCompass,
  getDailyPracticeTimeline,
  fetchOxPath,
  fetchWisdomHistory,
  fetchKarmaTimeline,
  fetchThreeLives,
  fetchScriptureRecommended,
  type CompassResponse,
  type DailyPracticeTimeline,
  type OxPathResponse,
  type WisdomQuery,
  type KarmaEvent,
  type ThreeLifeVision,
  type ScriptureItem,
} from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

const FIVE_MIN = 5 * 60 * 1000;
const ONE_MIN = 60 * 1000;
const TEN_MIN = 10 * 60 * 1000;

export default function CultivationOverviewPage() {
  const { t } = useTranslation();
  const realmLabel = (k: string) => t(`cultivation.realms.${k}`);
  const traditionLabel = (k: string) => t(`cultivation.traditions.${k}`);

  const results = useQueries({
    queries: [
      { queryKey: ["cultivation", "compass"], queryFn: fetchCompass, staleTime: FIVE_MIN },
      { queryKey: ["cultivation", "daily-practice", "timeline"], queryFn: () => getDailyPracticeTimeline(), staleTime: ONE_MIN },
      { queryKey: ["cultivation", "ox-path"], queryFn: fetchOxPath, staleTime: FIVE_MIN },
      { queryKey: ["cultivation", "wisdom", "history", 1, 3], queryFn: () => fetchWisdomHistory(1, 3), staleTime: ONE_MIN },
      { queryKey: ["cultivation", "karma", "timeline", 1, 3], queryFn: () => fetchKarmaTimeline(1, 3), staleTime: ONE_MIN },
      { queryKey: ["cultivation", "three-lives"], queryFn: fetchThreeLives, staleTime: FIVE_MIN },
      { queryKey: ["cultivation", "scripture", "recommended"], queryFn: fetchScriptureRecommended, staleTime: TEN_MIN },
    ],
  });

  const compassQ = results[0] as { data?: CompassResponse; isLoading: boolean; error: unknown };
  const timelineQ = results[1] as { data?: DailyPracticeTimeline };
  const oxPathQ = results[2] as { data?: OxPathResponse };
  const wisdomQ = results[3] as { data?: { items: WisdomQuery[] } };
  const karmaQ = results[4] as { data?: { items: KarmaEvent[] } };
  const threeLivesQ = results[5] as { data?: ThreeLifeVision };
  const scriptureQ = results[6] as { data?: ScriptureItem[] };

  const loading = results.some((r) => r.isLoading);
  if (loading && !compassQ.data) return <div className="text-amber-200/60 py-20 text-center">加载总观...</div>;
  if (compassQ.error || !compassQ.data) {
    return <div className="text-rose-300 py-20 text-center">无法加载总观数据,请稍后重试</div>;
  }

  const compass = compassQ.data;
  const timeline = timelineQ.data ?? null;
  const oxPath = oxPathQ.data ?? null;
  const wisdom = wisdomQ.data?.items ?? [];
  const karma = karmaQ.data?.items ?? [];
  const threeLives = threeLivesQ.data ?? null;
  const scripture = scriptureQ.data ?? [];
  const { journey, currentSymbol, streakDays } = compass;

  // 今日功课完成度
  const todayTotal = timeline?.slots.length ?? 0;
  const todayDone = timeline?.todayLogs.filter((l) => l.status === "DONE").length ?? 0;
  const todayFestival = timeline?.festivals?.[0] ?? null;
  const sealProgress = timeline?.sealProgress ?? null;

  return (
    <div className="space-y-5">
      {/* ── Hero 境界卡 ── */}
      <div className="rounded-3xl border border-amber-900/50 bg-gradient-to-br from-amber-950/60 to-[#1a1410] p-7 shadow-xl">
        <div className="flex items-start gap-6">
          <div className="shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-5xl shadow-lg shadow-amber-500/30 animate-pulse">
            ☸
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-amber-300/60 text-xs uppercase tracking-widest mb-1">
              当前境界 · {traditionLabel(journey.primaryTradition)}
            </p>
            <h1 className="text-3xl font-bold text-amber-100 mb-1">
              {realmLabel(journey.currentRealm)}
            </h1>
            <p className="text-amber-200/60 text-sm mb-4">
              愿行 第 {journey.oxStage} 阶 · 连击 {streakDays} 天 · {journey.karmaPoints} 因缘点
            </p>
            {currentSymbol && (
              <div className="rounded-xl bg-amber-950/40 border border-amber-900/40 p-4">
                <p className="text-amber-300 font-semibold text-sm mb-1">{currentSymbol.symbolName}</p>
                <p className="text-amber-100/70 text-sm leading-relaxed">{currentSymbol.originalText}</p>
                <p className="text-amber-100/40 text-xs mt-2">— {currentSymbol.source}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 今日焦点条 ── */}
      <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-amber-300 font-bold text-sm">🔥 今日焦点</span>
          {sealProgress && sealProgress.seal && (
            <Link
              href="/trips/cultivation/daily-practice"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs hover:bg-amber-500/25"
            >
              🪷 {sealProgress.seal.name} · 第 {sealProgress.day}/{sealProgress.total} 天
              {sealProgress.todayDone && <span className="text-emerald-300">✓</span>}
            </Link>
          )}
          {todayFestival && (
            <Link
              href="/trips/cultivation/daily-practice"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs hover:bg-rose-500/25"
            >
              {todayFestival.icon ?? "🕉"} {todayFestival.name}
              <span className="text-rose-300/60">
                · {traditionLabel(todayFestival.tradition)}
              </span>
            </Link>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs">
            ✓ 今日 {todayDone}/{todayTotal} 功课
          </span>
          {!sealProgress && !todayFestival && todayTotal === 0 && (
            <span className="text-amber-200/40 text-xs">今日尚未设置功课,去每日功课看看 →</span>
          )}
        </div>
      </div>

      {/* ── 两列栅格 · 六模块卡 ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 愿行进度 */}
        <ProgressCard
          icon="🐂"
          title="愿行 · 十牛图"
          href="/trips/cultivation/ox-path"
          cta="继续愿行"
          empty="十牛图数据未加载"
        >
          {oxPath && (
            <>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-amber-100">第 {oxPath.currentStage}</span>
                <span className="text-amber-200/50 text-sm">/ {oxPath.stages.length} 阶</span>
              </div>
              <div className="h-2 rounded-full bg-amber-950/60 overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
                  style={{ width: `${(oxPath.currentStage / oxPath.stages.length) * 100}%` }}
                />
              </div>
              <p className="text-amber-100/70 text-sm">
                {oxPath.stages.find((s) => s.current)?.name ?? "—"}
              </p>
              {oxPath.house && (
                <p className="text-amber-300/50 text-xs mt-1">宗风: {oxPath.house.name}</p>
              )}
            </>
          )}
        </ProgressCard>

        {/* 每日功课 */}
        <ProgressCard
          icon="🪷"
          title="每日功课"
          href="/trips/cultivation/daily-practice"
          cta="去打卡"
          empty="暂无功课数据"
        >
          {timeline && (
            <>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-amber-100">{streakDays}</span>
                <span className="text-amber-200/50 text-sm">天连击</span>
              </div>
              <div className="h-2 rounded-full bg-amber-950/60 overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                  style={{ width: todayTotal > 0 ? `${(todayDone / todayTotal) * 100}%` : "0%" }}
                />
              </div>
              <p className="text-amber-100/70 text-sm">
                今日 {todayDone} / {todayTotal} 完成
                {timeline.nextSlot && (
                  <span className="text-amber-300/60">
                    {" "}
                    · 下一场 {timeline.nextSlot.time}
                  </span>
                )}
              </p>
            </>
          )}
        </ProgressCard>

        {/* 融通动态 */}
        <FeedCard
          icon="💬"
          title="智慧融通"
          href="/trips/cultivation/wisdom"
          cta="更多问答"
          emptyCta="发起第一次融通 →"
          empty={wisdom.length === 0}
        >
          {wisdom.map((w) => (
            <div key={w.id} className="py-2 border-b border-amber-900/30 last:border-0">
              <p className="text-amber-100 text-sm truncate">{w.question}</p>
              <p className="text-amber-200/40 text-xs mt-0.5">
                {w.chosenTrads.length} 传统对话 · {new Date(w.createdAt).toLocaleDateString("zh-CN")}
              </p>
            </div>
          ))}
        </FeedCard>

        {/* 因缘动态 */}
        <FeedCard
          icon="📖"
          title="因缘日志"
          href="/trips/cultivation/karma"
          cta="更多日志"
          emptyCta="写第一条因缘 →"
          empty={karma.length === 0}
        >
          {karma.map((k) => (
            <div key={k.id} className="py-2 border-b border-amber-900/30 last:border-0">
              <p className="text-amber-100 text-sm truncate">{k.title}</p>
              <p className="text-amber-200/40 text-xs mt-0.5">
                {k.aiRealmTag && (
                  <span className="text-amber-300/60 mr-2">境界·{k.aiRealmTag}</span>
                )}
                {new Date(k.eventAt).toLocaleDateString("zh-CN")}
              </p>
            </div>
          ))}
        </FeedCard>

        {/* 修行库 */}
        <ProgressCard
          icon="🏠"
          title="修行库 · 三生愿景"
          href="/trips/cultivation/three-lives"
          cta="进入修行库"
          empty="暂未设愿"
        >
          {threeLives ? (
            <div className="space-y-1.5 text-sm">
              <p className="text-amber-100/80 truncate">
                <span className="text-amber-300/50 mr-1.5">个人</span>
                {threeLives.personalGoal ?? "—"}
              </p>
              <p className="text-amber-100/80 truncate">
                <span className="text-amber-300/50 mr-1.5">家庭</span>
                {threeLives.familyGoal ?? "—"}
              </p>
              <p className="text-amber-100/80 truncate">
                <span className="text-amber-300/50 mr-1.5">事业</span>
                {threeLives.businessGoal ?? "—"}
              </p>
            </div>
          ) : (
            <p className="text-amber-200/40 text-sm">尚未设立三生愿景</p>
          )}
        </ProgressCard>

        {/* 经论速览 */}
        <FeedCard
          icon="📜"
          title="经论大系统"
          href="/trips/cultivation/scriptures"
          cta="进入经论"
          emptyCta="探索经论 →"
          empty={scripture.length === 0}
        >
          {scripture.slice(0, 3).map((s) => (
            <div key={s.id} className="py-2 border-b border-amber-900/30 last:border-0">
              <p className="text-amber-100 text-sm truncate">{s.title}</p>
              <p className="text-amber-200/40 text-xs mt-0.5">
                <span className="text-amber-300/60 mr-2">
                  {traditionLabel(s.tradition)}
                </span>
                第 {s.ring} 环 · 难度 {s.difficulty}
              </p>
            </div>
          ))}
        </FeedCard>
      </div>
    </div>
  );
}

function ProgressCard({
  icon,
  title,
  href,
  cta,
  empty,
  children,
}: {
  icon: string;
  title: string;
  href: string;
  cta: string;
  empty: string;
  children: React.ReactNode;
}) {
  const hasContent = Array.isArray(children) ? children.some(Boolean) : Boolean(children);
  return (
    <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-5 hover:border-amber-700 transition-all">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-amber-100 text-sm">{title}</h3>
      </div>
      {hasContent ? children : <p className="text-amber-200/40 text-sm">{empty}</p>}
      <Link
        href={href}
        className="mt-3 inline-block text-xs text-amber-300 hover:text-amber-200"
      >
        {cta} →
      </Link>
    </div>
  );
}

function FeedCard({
  icon,
  title,
  href,
  cta,
  empty,
  emptyCta,
  children,
}: {
  icon: string;
  title: string;
  href: string;
  cta: string;
  empty: boolean;
  emptyCta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-5 hover:border-amber-700 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-amber-100 text-sm">{title}</h3>
      </div>
      {empty ? (
        <Link href={href} className="block py-3 text-amber-300/70 text-sm hover:text-amber-200">
          {emptyCta}
        </Link>
      ) : (
        <>
          <div>{children}</div>
          <Link
            href={href}
            className="mt-2 inline-block text-xs text-amber-300 hover:text-amber-200"
          >
            {cta} →
          </Link>
        </>
      )}
    </div>
  );
}
