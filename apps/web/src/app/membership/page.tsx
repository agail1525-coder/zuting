"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import {
  fetchMyMembership,
  fetchPointsHistory,
  fetchLevels,
  fetchCheckinCalendar,
  checkin,
  type MembershipData,
  type PointsTransactionItem,
  type LevelInfo,
} from "@/lib/api";

function formatDate(str: string) {
  return new Date(str).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatPrice(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`;
}

const LEVEL_COLORS: Record<number, string> = {
  1: "#6B7280",
  2: "#3B82F6",
  3: "#8B5CF6",
  4: "#D4A855",
  5: "#EF4444",
};

function LevelBadge({ level, name }: { level: number; name: string }) {
  const color = LEVEL_COLORS[level] ?? "#6B7280";
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm font-bold"
      style={{ backgroundColor: color }}
    >
      Lv.{level} {name}
    </span>
  );
}

function ProgressBar({ current, next }: { current: number; next: number }) {
  const pct = next > 0 ? Math.min(100, (current / next) * 100) : 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: "#D4A855" }}
      />
    </div>
  );
}

function CheckinCalendar({ year, month, checkedDates, t }: { year: number; month: number; checkedDates: Set<string>; t: (key: string) => string }) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {[t("membership.weekSun"), t("membership.weekMon"), t("membership.weekTue"), t("membership.weekWed"), t("membership.weekThu"), t("membership.weekFri"), t("membership.weekSat")].map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isChecked = checkedDates.has(dateStr);
          const isToday = dateStr === todayStr;
          return (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                isChecked
                  ? "bg-[#0066FF] text-white"
                  : isToday
                  ? "border-2 border-[#0066FF] text-[#0066FF]"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════ Quick Benefit Highlight Row ══════ */
function BenefitHighlights({ level, t }: { level: number; t: (key: string) => string }) {
  const benefits = useMemo(() => {
    const base = [
      { icon: "🏷️", label: t("membership.benefitDiscount"), value: level >= 3 ? "10%" : level >= 2 ? "5%" : "3%" },
      { icon: "⚡", label: t("membership.benefitPoints"), value: level >= 4 ? "3x" : level >= 3 ? "2x" : "1.5x" },
      { icon: "🎯", label: t("membership.benefitPriority"), value: level >= 3 ? "VIP" : level >= 2 ? "Fast" : "-" },
      { icon: "💬", label: t("membership.benefitSupport"), value: level >= 4 ? "24/7" : level >= 2 ? "12h" : "-" },
    ];
    return base;
  }, [level, t]);

  return (
    <div className="grid grid-cols-4 gap-2">
      {benefits.map((b) => (
        <div
          key={b.label}
          className="flex flex-col items-center gap-1.5 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
        >
          <span className="text-xl">{b.icon}</span>
          <span className="text-xs text-blue-100 text-center leading-tight">{b.label}</span>
          <span className="text-sm font-bold text-white">{b.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════ Level Progress Visualization ══════ */
function LevelProgressVisualization({ levels, currentLevel, membership, t }: {
  levels: LevelInfo[];
  currentLevel: number;
  membership: MembershipData;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-3">
      {levels.map((lv) => {
        const isMe = lv.level === currentLevel;
        const isPast = lv.level < currentLevel;
        const pct = isPast
          ? 100
          : isMe
          ? lv.level < levels.length
            ? Math.min(100, Math.round((membership.totalPoints / (levels.find((l) => l.level === lv.level + 1)?.minPoints ?? membership.totalPoints)) * 100))
            : 100
          : 0;
        const color = LEVEL_COLORS[lv.level] ?? "#6B7280";

        return (
          <div key={lv.level} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${isMe ? "bg-blue-50 border-blue-200 ring-1 ring-blue-300" : "bg-white border-gray-200"}`}>
            <div className="shrink-0 w-20">
              <LevelBadge level={lv.level} name={lv.name} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{lv.minPoints.toLocaleString()} {t("membership.pointsUnit")}</span>
                <span>{pct}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
            {isMe && (
              <span className="shrink-0 text-xs font-bold text-[#0066FF] bg-blue-100 px-2 py-0.5 rounded-full">{t("membership.current")}</span>
            )}
            {isPast && (
              <span className="shrink-0 text-green-500 text-sm">&#10003;</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MembershipPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [levels, setLevels] = useState<LevelInfo[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsTransactionItem[]>([]);
  const [calendarDates, setCalendarDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinMsg, setCheckinMsg] = useState("");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [mem, lvls, hist, cal] = await Promise.all([
        fetchMyMembership(),
        fetchLevels(),
        fetchPointsHistory(1),
        fetchCheckinCalendar(year, month),
      ]);
      setMembership(mem);
      setLevels(Array.isArray(lvls) ? lvls : []);
      setPointsHistory(Array.isArray(hist.items) ? hist.items : []);
      setCalendarDates(new Set(cal.dates ?? []));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("membership.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const handleCheckin = async () => {
    setCheckingIn(true);
    setCheckinMsg("");
    try {
      const res = await checkin();
      setCheckinMsg(t("membership.checkinSuccess", { points: res.points }) + (res.bonus > 0 ? t("membership.checkinBonus", { streak: res.streak, bonus: res.bonus }) : ""));
      await loadData();
    } catch (e) {
      setCheckinMsg(e instanceof Error ? e.message : t("membership.checkinFailed"));
    } finally {
      setCheckingIn(false);
    }
  };

  const currentLevel = levels.find((l) => l.level === membership?.level);
  const nextLevel = levels.find((l) => l.level === (membership?.level ?? 0) + 1);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0066FF] to-[#0052CC] rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm mb-2">{t("membership.myLevel")}</p>
            {membership ? (
              <LevelBadge level={membership.level} name={membership.levelName} />
            ) : (
              <span className="text-white/60 text-sm">-</span>
            )}
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">{t("membership.availablePoints")}</p>
            <p className="text-3xl font-bold text-[#D4A855]">
              {membership?.availablePoints?.toLocaleString() ?? "-"}
            </p>
          </div>
        </div>

        {membership && nextLevel && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-blue-100 mb-1.5">
              <span>{t("membership.hasPoints", { n: membership.totalPoints.toLocaleString() })}</span>
              <span>{t("membership.upgradeNeed", { n: nextLevel.minPoints.toLocaleString() })}</span>
            </div>
            <ProgressBar current={membership.totalPoints} next={nextLevel.minPoints} />
            <p className="text-xs text-blue-200 mt-1.5">
              {t("membership.pointsToNext", { level: nextLevel.name, n: Math.max(0, nextLevel.minPoints - membership.totalPoints).toLocaleString() })}
            </p>
          </div>
        )}

        {/* Quick Benefit Highlights */}
        {membership && (
          <div className="mt-5">
            <BenefitHighlights level={membership.level} t={t} />
          </div>
        )}

        {/* Checkin */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleCheckin}
            disabled={checkingIn}
            className="px-5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition-colors disabled:opacity-60 text-sm border border-white/30"
          >
            {checkingIn ? t("membership.checkingIn") : t("membership.dailyCheckin")}
          </button>
          {checkinMsg && (
            <span className="text-xs text-blue-100 flex-1">{checkinMsg}</span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t("membership.pointsMall"), href: "/points-mall", icon: "🛍️" },
          { label: t("membership.referralCenter"), href: "/membership/referral", icon: "👥" },
          { label: t("membership.inviteFriends"), href: "/membership/referral", icon: "🎁" },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#0066FF]/40 hover:shadow-md transition-all"
          >
            <span className="text-2xl">{a.icon}</span>
            <span className="text-sm font-medium text-gray-700">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* ══════ Missions Board (对标Booking Genius/Agoda任务系统) ══════ */}
      {/* 静态展示：待后端API接入 — 任务列表为规划中的功能预览，完成状态仅签到项为实时数据 */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span>🎯</span> {t("membership.missions")}
        </h2>
        <div className="space-y-2">
          {[
            { icon: "✅", label: t("membership.missionCheckin"), points: 10, done: calendarDates.has(`${year}-${String(month).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`) },
            { icon: "📝", label: t("membership.missionJournal"), points: 50, done: false, href: "/journals/create" },
            { icon: "⭐", label: t("membership.missionReview"), points: 30, done: false, href: "/routes" },
            { icon: "👥", label: t("membership.missionInvite"), points: 100, done: false, href: "/membership/referral" },
            { icon: "🛒", label: t("membership.missionBooking"), points: 200, done: false, href: "/routes" },
          ].map((mission) => (
            <div
              key={mission.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                mission.done
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-gray-200 hover:border-[#0066FF]/30 hover:shadow-sm"
              }`}
            >
              <span className="text-lg">{mission.icon}</span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${mission.done ? "text-green-600 line-through" : "text-gray-800"}`}>
                  {mission.label}
                </p>
              </div>
              <span className={`text-sm font-bold ${mission.done ? "text-green-500" : "text-[#D4A855]"}`}>
                {mission.done ? "✓" : `+${mission.points}`}
              </span>
              {!mission.done && mission.href && (
                <Link href={mission.href} className="text-xs text-[#0066FF] hover:underline shrink-0">
                  {t("membership.missionGo")}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ══════ Streak Counter (对标Duolingo连续签到) ══════ */}
      {membership && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔥</span>
              <div>
                <p className="font-bold text-gray-900">{t("membership.streakTitle")}</p>
                <p className="text-sm text-gray-500">{t("membership.streakDesc")}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#D4A855]">{calendarDates.size}</p>
              <p className="text-xs text-gray-400">{t("membership.daysThisMonth")}</p>
            </div>
          </div>
          {/* Streak milestones */}
          <div className="flex items-center gap-2 mt-4">
            {[7, 14, 21, 30].map((milestone) => {
              const reached = calendarDates.size >= milestone;
              return (
                <div
                  key={milestone}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-medium transition-all ${
                    reached
                      ? "bg-[#D4A855] text-white"
                      : "bg-white border border-gray-200 text-gray-400"
                  }`}
                >
                  {t("membership.milestoneDays", { n: milestone })}{reached ? " ✓" : ""}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Checkin Calendar */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          {t("membership.checkinRecord", { year, month })}
        </h2>
        <CheckinCalendar year={year} month={month} checkedDates={calendarDates} t={t} />
      </div>

      {/* Level Progress Visualization */}
      {levels.length > 0 && membership && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">{t("membership.levelPerks")}</h2>
          <LevelProgressVisualization
            levels={levels}
            currentLevel={membership.level}
            membership={membership}
            t={t}
          />
        </div>
      )}

      {/* Level Comparison Table */}
      {levels.length > 0 && (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">{t("membership.levelCol")}</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">{t("membership.requiredPoints")}</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">{t("membership.exclusivePerks")}</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((lv) => {
                  const isMe = lv.level === membership?.level;
                  return (
                    <tr
                      key={lv.level}
                      className={`border-t border-gray-100 ${isMe ? "bg-blue-50" : "hover:bg-gray-50"}`}
                    >
                      <td className="px-4 py-3">
                        <LevelBadge level={lv.level} name={lv.name} />
                        {isMe && (
                          <span className="ml-2 text-xs text-[#0066FF] font-medium">{t("membership.current")}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{lv.minPoints.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(lv.perks ?? []).map((p) => (
                            <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════ Member Exclusive Deals (对标Booking Genius优惠) ══════ */}
      {/* 静态展示：待后端API接入 — 会员专属权益为规划中的功能预览，后续接入促销/优惠券API实现动态展示 */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span>💎</span> {t("membership.exclusiveDeals")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "🎫", title: t("membership.dealCouponTitle"), desc: t("membership.dealCouponDesc"), href: "/coupons", color: "from-blue-500/10 to-blue-600/10" },
            { icon: "💰", title: t("membership.dealDiscountTitle"), desc: t("membership.dealDiscountDesc"), href: "/routes", color: "from-amber-500/10 to-yellow-500/10" },
            { icon: "⚡", title: t("membership.dealPriorityTitle"), desc: t("membership.dealPriorityDesc"), href: "/routes", color: "from-purple-500/10 to-violet-500/10" },
            { icon: "🎁", title: t("membership.dealPointsTitle"), desc: t("membership.dealPointsDesc"), href: "/points-mall", color: "from-green-500/10 to-emerald-500/10" },
          ].map((deal) => (
            <Link
              key={deal.title}
              href={deal.href}
              className={`bg-gradient-to-br ${deal.color} rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all group`}
            >
              <span className="text-2xl block mb-2">{deal.icon}</span>
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors">{deal.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{deal.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ══════ Achievement Badges (gamification, 对标AmEx/Booking Genius) ══════ */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span>🏅</span> {t("membership.achievements")}
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: "🏛", name: t("membership.badge.firstVisit"), unlocked: true },
            { icon: "📝", name: t("membership.badge.firstJournal"), unlocked: true },
            { icon: "⭐", name: t("membership.badge.firstReview"), unlocked: false },
            { icon: "🗺", name: t("membership.badge.fiveRoutes"), unlocked: false },
            { icon: "🔥", name: t("membership.badge.weekStreak"), unlocked: true },
            { icon: "🌍", name: t("membership.badge.threeContinents"), unlocked: false },
            { icon: "📸", name: t("membership.badge.photoContributor"), unlocked: false },
            { icon: "💎", name: t("membership.badge.vipMember"), unlocked: false },
          ].map((badge, i) => (
            <div key={i} className={`text-center p-3 rounded-xl border ${badge.unlocked ? 'bg-white border-amber-200' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
              <span className="text-2xl block mb-1">{badge.icon}</span>
              <span className="text-[10px] text-gray-600 font-medium">{badge.name}</span>
              {badge.unlocked && <span className="block text-[8px] text-amber-600 mt-0.5">&#10003; {t("membership.unlocked")}</span>}
            </div>
          ))}
        </div>
      </section>

      {/* ══════ Referral Widget (viral growth) ══════ */}
      <section className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">{t("membership.referralTitle")}</h2>
            <p className="text-sm text-gray-500 mt-1">{t("membership.referralDesc")}</p>
          </div>
          <Link href="/referral" className="px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
            {t("membership.inviteFriends")}
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">200</p>
            <p className="text-xs text-gray-500">{t("membership.referralPoints")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">&infin;</p>
            <p className="text-xs text-gray-500">{t("membership.referralLimit")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">10%</p>
            <p className="text-xs text-gray-500">{t("membership.referralBonus")}</p>
          </div>
        </div>
      </section>

      {/* ══════ Points Activity Timeline ══════ */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t("membership.recentActivity")}</h2>
        <div className="space-y-3">
          {[
            { action: t("membership.activity.checkin"), points: "+10", time: t("membership.activity.today"), icon: "✅" },
            { action: t("membership.activity.review"), points: "+50", time: t("membership.activity.yesterday"), icon: "⭐" },
            { action: t("membership.activity.booking"), points: "+200", time: t("membership.activity.3daysAgo"), icon: "🎫" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.action}</p>
                <p className="text-xs text-gray-400">{item.time}</p>
              </div>
              <span className="text-sm font-bold text-green-600">{item.points}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Points History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">{t("membership.pointsHistory")}</h2>
          <span className="text-xs text-gray-400">{t("membership.recent50")}</span>
        </div>
        {pointsHistory.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
            {t("membership.noPointsHistory")}
          </div>
        ) : (
          <div className="space-y-2">
            {pointsHistory.map((item) => {
              const isEarn = item.amount > 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.description || item.source}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.createdAt)}</p>
                  </div>
                  <span
                    className={`text-base font-bold ${isEarn ? "text-green-600" : "text-red-500"}`}
                  >
                    {isEarn ? "+" : ""}{item.amount}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════ Upgrade Path CTA ══════ */}
      {membership && nextLevel && (
        <div className="bg-gradient-to-r from-[#0066FF]/5 to-blue-50 rounded-xl p-5 border border-[#0066FF]/10 text-center">
          <p className="text-lg font-bold text-gray-900">
            {t("membership.upgradeToNext", { level: nextLevel.name })}
          </p>
          <p className="text-3xl font-bold text-[#0066FF] mt-1">
            {Math.max(0, nextLevel.minPoints - membership.totalPoints).toLocaleString()} {t("membership.pointsUnit")}
          </p>
          <p className="text-sm text-gray-400 mt-2">{t("membership.upgradeHint")}</p>
          <Link
            href="/routes"
            className="inline-block mt-4 px-6 py-2.5 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-colors text-sm shadow-lg shadow-blue-500/20"
          >
            {t("membership.browseRoutes")}
          </Link>
        </div>
      )}

      {/* ══════ Member Exclusive VIP CTA ══════ */}
      <section className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-6 text-white text-center">
        <h2 className="text-xl font-bold">{t("membership.vipCta")}</h2>
        <p className="text-white/80 text-sm mt-2">{t("membership.vipCtaDesc")}</p>
        <Link href="/routes" className="inline-block mt-4 px-8 py-3 bg-white text-amber-600 font-bold rounded-lg hover:bg-amber-50 transition-colors">
          {t("membership.startJourney")}
        </Link>
      </section>

      <MobileNav />
    </div>
  );
}
