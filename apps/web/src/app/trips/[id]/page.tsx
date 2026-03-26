"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

type TripStatus =
  | "draft"
  | "planning"
  | "submitted"
  | "reviewing"
  | "confirmed"
  | "preparing"
  | "departing"
  | "pilgrimage"
  | "returning"
  | "reflecting"
  | "completed"
  | "archived";

interface TripSite {
  order: number;
  name: string;
  country: string;
  emoji: string;
}

interface StatusHistoryItem {
  status: string;
  label: string;
  date: string;
  note: string;
}

const STATUS_STEPS: { key: TripStatus; label: string; icon: string }[] = [
  { key: "draft", label: "草稿", icon: "📝" },
  { key: "planning", label: "规划", icon: "📋" },
  { key: "submitted", label: "提交", icon: "📤" },
  { key: "reviewing", label: "审核", icon: "🔍" },
  { key: "confirmed", label: "确认", icon: "✅" },
  { key: "preparing", label: "筹备", icon: "🎒" },
  { key: "departing", label: "出发", icon: "✈️" },
  { key: "pilgrimage", label: "朝圣", icon: "🙏" },
  { key: "returning", label: "返程", icon: "🏠" },
  { key: "reflecting", label: "省思", icon: "📖" },
  { key: "completed", label: "圆满", icon: "🏛" },
  { key: "archived", label: "归档", icon: "📁" },
];

const MOCK_TRIPS: Record<
  string,
  {
    title: string;
    status: TripStatus;
    startDate: string;
    endDate: string;
    persons: number;
    budget: string;
    sites: TripSite[];
    history: StatusHistoryItem[];
  }
> = {
  "trip-1": {
    title: "东方禅宗祖庭朝圣之旅",
    status: "confirmed",
    startDate: "2026-04-15",
    endDate: "2026-04-28",
    persons: 2,
    budget: "¥28,000",
    sites: [
      { order: 1, name: "嵩山少林寺", country: "中国", emoji: "☸" },
      { order: 2, name: "南华寺", country: "中国", emoji: "🪷" },
      { order: 3, name: "峨眉山金顶", country: "中国", emoji: "⛰" },
      { order: 4, name: "金阁寺", country: "日本", emoji: "⛩" },
      { order: 5, name: "高野山", country: "日本", emoji: "🏔" },
    ],
    history: [
      {
        status: "draft",
        label: "创建行程",
        date: "2026-02-20",
        note: "创建了东方禅宗祖庭朝圣之旅",
      },
      {
        status: "planning",
        label: "开始规划",
        date: "2026-02-22",
        note: "添加了5个朝圣圣地",
      },
      {
        status: "submitted",
        label: "提交审核",
        date: "2026-03-01",
        note: "行程规划完成，提交审核",
      },
      {
        status: "reviewing",
        label: "审核中",
        date: "2026-03-02",
        note: "小鸿正在审核行程可行性",
      },
      {
        status: "confirmed",
        label: "行程确认",
        date: "2026-03-05",
        note: "行程已确认，请准备出发",
      },
    ],
  },
  "trip-2": {
    title: "耶路撒冷三教圣地巡礼",
    status: "planning",
    startDate: "2026-06-01",
    endDate: "2026-06-14",
    persons: 4,
    budget: "¥65,000",
    sites: [
      { order: 1, name: "圣殿山", country: "以色列", emoji: "✡" },
      { order: 2, name: "圣墓教堂", country: "以色列", emoji: "✝" },
      { order: 3, name: "阿克萨清真寺", country: "以色列", emoji: "☪" },
      { order: 4, name: "哭墙", country: "以色列", emoji: "🕍" },
      { order: 5, name: "橄榄山", country: "以色列", emoji: "⛰" },
      { order: 6, name: "伯利恒圣诞教堂", country: "巴勒斯坦", emoji: "⭐" },
      { order: 7, name: "死海", country: "以色列", emoji: "🌊" },
      { order: 8, name: "马萨达", country: "以色列", emoji: "🏰" },
    ],
    history: [
      {
        status: "draft",
        label: "创建行程",
        date: "2026-03-10",
        note: "创建了耶路撒冷三教圣地巡礼",
      },
      {
        status: "planning",
        label: "规划中",
        date: "2026-03-12",
        note: "正在添加圣地和规划路线",
      },
    ],
  },
  "trip-3": {
    title: "印度佛陀足迹朝圣",
    status: "completed",
    startDate: "2026-01-10",
    endDate: "2026-01-22",
    persons: 3,
    budget: "¥35,000",
    sites: [
      { order: 1, name: "菩提伽耶", country: "印度", emoji: "🪷" },
      { order: 2, name: "鹿野苑", country: "印度", emoji: "🦌" },
      { order: 3, name: "拘尸那迦", country: "印度", emoji: "🙏" },
      { order: 4, name: "蓝毗尼", country: "尼泊尔", emoji: "🏛" },
    ],
    history: [
      {
        status: "draft",
        label: "创建行程",
        date: "2025-11-15",
        note: "创建行程",
      },
      {
        status: "confirmed",
        label: "行程确认",
        date: "2025-12-01",
        note: "行程已确认",
      },
      {
        status: "pilgrimage",
        label: "开始朝圣",
        date: "2026-01-10",
        note: "正式出发",
      },
      {
        status: "completed",
        label: "朝圣圆满",
        date: "2026-01-22",
        note: "圆满完成，收获颇丰",
      },
    ],
  },
  "trip-4": {
    title: "日本神道与禅宗之旅",
    status: "planning",
    startDate: "2026-05-10",
    endDate: "2026-05-20",
    persons: 2,
    budget: "¥42,000",
    sites: [
      { order: 1, name: "伊势神宫", country: "日本", emoji: "⛩" },
      { order: 2, name: "金阁寺", country: "日本", emoji: "🏯" },
      { order: 3, name: "东大寺", country: "日本", emoji: "🦌" },
      { order: 4, name: "高野山", country: "日本", emoji: "🏔" },
      { order: 5, name: "永平寺", country: "日本", emoji: "☸" },
      { order: 6, name: "出云大社", country: "日本", emoji: "⛩" },
    ],
    history: [
      {
        status: "draft",
        label: "创建行程",
        date: "2026-03-18",
        note: "创建了日本神道与禅宗之旅",
      },
      {
        status: "planning",
        label: "规划中",
        date: "2026-03-20",
        note: "正在完善行程细节",
      },
    ],
  },
};

function getStatusIndex(status: TripStatus): number {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

function getActionButton(status: TripStatus): { label: string; show: boolean } {
  switch (status) {
    case "draft":
    case "planning":
      return { label: "提交行程", show: true };
    case "confirmed":
    case "preparing":
      return { label: "开始朝圣", show: true };
    case "pilgrimage":
      return { label: "完成朝圣", show: true };
    case "returning":
      return { label: "开始省思", show: true };
    case "reflecting":
      return { label: "标记完成", show: true };
    default:
      return { label: "", show: false };
  }
}

export default function TripDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const trip = MOCK_TRIPS[id];

  if (!trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🏛</div>
        <h1 className="text-2xl font-serif text-temple-200 mb-4">
          行程未找到
        </h1>
        <Link
          href="/trips"
          className="text-gold hover:text-gold-light transition-colors"
        >
          返回行程列表
        </Link>
      </div>
    );
  }

  const currentIndex = getStatusIndex(trip.status);
  const action = getActionButton(trip.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/trips"
        className="inline-flex items-center gap-1 text-sm text-temple-400 hover:text-gold transition-colors mb-6"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        返回行程列表
      </Link>

      {/* Trip Header */}
      <div className="card-glow rounded-2xl bg-temple-800/50 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gradient-gold">
            {trip.title}
          </h1>
          {action.show && (
            <button className="px-5 py-2 bg-gold text-temple-900 font-semibold rounded-full text-sm hover:bg-gold-light transition-colors shadow-lg shadow-gold/20 shrink-0">
              {action.label}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-temple-500 block mb-0.5">日期</span>
            <span className="text-temple-200">
              {trip.startDate} ~ {trip.endDate}
            </span>
          </div>
          <div>
            <span className="text-temple-500 block mb-0.5">人数</span>
            <span className="text-temple-200">{trip.persons} 人</span>
          </div>
          <div>
            <span className="text-temple-500 block mb-0.5">预算</span>
            <span className="text-temple-200">{trip.budget}</span>
          </div>
          <div>
            <span className="text-temple-500 block mb-0.5">圣地</span>
            <span className="text-temple-200">{trip.sites.length} 处</span>
          </div>
        </div>
      </div>

      {/* Status Steps */}
      <div className="card-glow rounded-2xl bg-temple-800/50 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold text-temple-100 mb-4">
          行程状态
        </h2>
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-0 min-w-max">
            {STATUS_STEPS.map((step, i) => {
              const isPast = i <= currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border transition-all ${
                        isCurrent
                          ? "bg-gold/20 border-gold text-gold scale-110 shadow-lg shadow-gold/20"
                          : isPast
                          ? "bg-gold/10 border-gold/30 text-gold/70"
                          : "bg-temple-700/50 border-temple-600 text-temple-500"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={`text-[10px] mt-1 whitespace-nowrap ${
                        isCurrent
                          ? "text-gold font-semibold"
                          : isPast
                          ? "text-temple-300"
                          : "text-temple-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={`w-6 h-px mx-0.5 mt-[-12px] ${
                        i < currentIndex ? "bg-gold/40" : "bg-temple-600"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sites List */}
      <div className="card-glow rounded-2xl bg-temple-800/50 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold text-temple-100 mb-4">
          朝圣圣地
        </h2>
        <div className="space-y-3">
          {trip.sites.map((site) => (
            <div
              key={site.order}
              className="flex items-center gap-3 p-3 rounded-xl bg-temple-700/30 border border-temple-700/50"
            >
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-xs font-bold text-gold">
                {site.order}
              </div>
              <span className="text-lg">{site.emoji}</span>
              <div className="flex-1">
                <span className="text-temple-100 font-medium">{site.name}</span>
                <span className="text-temple-500 text-sm ml-2">
                  {site.country}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status History */}
      <div className="card-glow rounded-2xl bg-temple-800/50 p-6">
        <h2 className="text-lg font-serif font-semibold text-temple-100 mb-4">
          状态历史
        </h2>
        <div className="relative pl-6">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gold/20" />
          <div className="space-y-5">
            {trip.history.map((item, i) => (
              <div key={i} className="relative">
                <div className="absolute left-[-21px] top-1.5 w-3 h-3 rounded-full border-2 border-gold/40 bg-temple-800" />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-temple-200">
                      {item.label}
                    </span>
                    <span className="text-xs text-temple-500">{item.date}</span>
                  </div>
                  <p className="text-sm text-temple-400">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
