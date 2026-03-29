"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
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

function CheckinCalendar({ year, month, checkedDates }: { year: number; month: number; checkedDates: Set<string> }) {
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
        {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
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

export default function MembershipPage() {
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
      setError(e instanceof Error ? e.message : "加载失败");
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
      setCheckinMsg(`签到成功！+${res.points}积分${res.bonus > 0 ? `（连续${res.streak}天，额外+${res.bonus}）` : ""}`);
      await loadData();
    } catch (e) {
      setCheckinMsg(e instanceof Error ? e.message : "签到失败");
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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0066FF] to-[#0052CC] rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm mb-2">我的会员等级</p>
            {membership ? (
              <LevelBadge level={membership.level} name={membership.levelName} />
            ) : (
              <span className="text-white/60 text-sm">-</span>
            )}
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">可用积分</p>
            <p className="text-3xl font-bold text-[#D4A855]">
              {membership?.availablePoints?.toLocaleString() ?? "-"}
            </p>
          </div>
        </div>

        {membership && nextLevel && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-blue-100 mb-1.5">
              <span>已有 {membership.totalPoints.toLocaleString()} 积分</span>
              <span>升级需 {nextLevel.minPoints.toLocaleString()} 积分</span>
            </div>
            <ProgressBar current={membership.totalPoints} next={nextLevel.minPoints} />
            <p className="text-xs text-blue-200 mt-1.5">
              距 {nextLevel.name} 还差 {Math.max(0, nextLevel.minPoints - membership.totalPoints).toLocaleString()} 积分
            </p>
          </div>
        )}

        {/* Checkin */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleCheckin}
            disabled={checkingIn}
            className="px-5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition-colors disabled:opacity-60 text-sm border border-white/30"
          >
            {checkingIn ? "签到中..." : "每日签到"}
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
          { label: "积分商城", href: "/points-mall", icon: "🛍️" },
          { label: "分销中心", href: "/membership/referral", icon: "👥" },
          { label: "邀请好友", href: "/membership/referral", icon: "🎁" },
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

      {/* Checkin Calendar */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          {year}年{month}月签到记录
        </h2>
        <CheckinCalendar year={year} month={month} checkedDates={calendarDates} />
      </div>

      {/* Level Comparison */}
      {levels.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">等级权益</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">等级</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">所需积分</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">专属权益</th>
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
                          <span className="ml-2 text-xs text-[#0066FF] font-medium">当前</span>
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

      {/* Points History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">积分记录</h2>
          <span className="text-xs text-gray-400">最近50条</span>
        </div>
        {pointsHistory.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
            暂无积分记录
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
    </div>
  );
}
