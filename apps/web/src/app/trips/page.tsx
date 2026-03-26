"use client";

import Link from "next/link";
import { useState } from "react";

type TripStatus = "planning" | "confirmed" | "pilgrimage" | "completed";

interface Trip {
  id: string;
  title: string;
  sitesCount: number;
  startDate: string;
  endDate: string;
  status: TripStatus;
  coverEmoji: string;
}

const STATUS_CONFIG: Record<
  TripStatus,
  { label: string; color: string; bgColor: string }
> = {
  planning: {
    label: "规划中",
    color: "text-incense",
    bgColor: "bg-incense/10 border-incense/20",
  },
  confirmed: {
    label: "已确认",
    color: "text-jade",
    bgColor: "bg-jade/10 border-jade/20",
  },
  pilgrimage: {
    label: "朝圣中",
    color: "text-gold",
    bgColor: "bg-gold/10 border-gold/20",
  },
  completed: {
    label: "已完成",
    color: "text-temple-400",
    bgColor: "bg-temple-600/10 border-temple-600/20",
  },
};

const MOCK_TRIPS: Trip[] = [
  {
    id: "trip-1",
    title: "东方禅宗祖庭朝圣之旅",
    sitesCount: 5,
    startDate: "2026-04-15",
    endDate: "2026-04-28",
    status: "confirmed",
    coverEmoji: "☸",
  },
  {
    id: "trip-2",
    title: "耶路撒冷三教圣地巡礼",
    sitesCount: 8,
    startDate: "2026-06-01",
    endDate: "2026-06-14",
    status: "planning",
    coverEmoji: "✡",
  },
  {
    id: "trip-3",
    title: "印度佛陀足迹朝圣",
    sitesCount: 4,
    startDate: "2026-01-10",
    endDate: "2026-01-22",
    status: "completed",
    coverEmoji: "🪷",
  },
  {
    id: "trip-4",
    title: "日本神道与禅宗之旅",
    sitesCount: 6,
    startDate: "2026-05-10",
    endDate: "2026-05-20",
    status: "planning",
    coverEmoji: "⛩",
  },
];

const TABS: { key: "all" | TripStatus; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "planning", label: "规划中" },
  { key: "confirmed", label: "已确认" },
  { key: "pilgrimage", label: "朝圣中" },
  { key: "completed", label: "已完成" },
];

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState<"all" | TripStatus>("all");

  const filtered =
    activeTab === "all"
      ? MOCK_TRIPS
      : MOCK_TRIPS.filter((t) => t.status === activeTab);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gradient-gold">
            我的朝圣之旅
          </h1>
          <p className="text-temple-400 mt-1 text-sm">
            规划、记录您的每一次心灵旅程
          </p>
        </div>
        <Link
          href="/trips/create"
          className="px-5 py-2.5 bg-gold text-temple-900 font-semibold rounded-full text-sm hover:bg-gold-light transition-colors shadow-lg shadow-gold/20"
        >
          + 创建新行程
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-gold/15 text-gold border border-gold/30"
                : "text-temple-400 hover:text-temple-200 border border-transparent hover:border-temple-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trip Cards */}
      <div className="space-y-4">
        {filtered.map((trip, i) => {
          const sc = STATUS_CONFIG[trip.status];
          return (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="block card-glow rounded-2xl bg-temple-800/50 p-5 hover:bg-temple-800/70 transition-all animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-start gap-4">
                {/* Cover Emoji */}
                <div className="w-14 h-14 rounded-xl bg-temple-700/50 border border-gold/10 flex items-center justify-center text-2xl shrink-0">
                  {trip.coverEmoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-serif font-semibold text-temple-100 truncate">
                      {trip.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full border ${sc.bgColor} ${sc.color} shrink-0`}
                    >
                      {sc.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-temple-400">
                    <span>{trip.sitesCount} 个圣地</span>
                    <span>
                      {trip.startDate} ~ {trip.endDate}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <svg
                  className="w-5 h-5 text-temple-500 shrink-0 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-temple-500">
          <div className="text-5xl mb-4">🏛</div>
          <p>暂无此状态的行程</p>
        </div>
      )}
    </div>
  );
}
