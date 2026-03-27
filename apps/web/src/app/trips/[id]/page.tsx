"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchTrip, type TripDetail, type TripStatus } from "@/lib/api";
import ReviewSection from "@/components/ReviewSection";

const STATUS_STEPS: { key: TripStatus; label: string; icon: string }[] = [
  { key: "DRAFT", label: "草稿", icon: "📝" },
  { key: "PLANNING", label: "规划", icon: "📋" },
  { key: "SUBMITTED", label: "提交", icon: "📤" },
  { key: "CONFIRMED", label: "确认", icon: "✅" },
  { key: "PAID", label: "已付", icon: "💰" },
  { key: "PREPARING", label: "筹备", icon: "🎒" },
  { key: "IN_PROGRESS", label: "朝圣", icon: "🙏" },
  { key: "COMPLETED", label: "圆满", icon: "🏛" },
  { key: "REVIEWING", label: "评价", icon: "📖" },
];

function getStatusIndex(status: TripStatus): number {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

function formatDate(d: string | null): string {
  if (!d) return "待定";
  return d.slice(0, 10);
}

function formatBudget(n: number | null): string {
  if (n == null) return "待定";
  return `¥${n.toLocaleString()}`;
}

export default function TripDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchTrip(id)
      .then(setTrip)
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4 animate-pulse">🏛</div>
        <p className="text-temple-500">加载行程详情...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🏛</div>
        <h1 className="text-2xl font-serif text-temple-200 mb-4">
          {error?.includes("404") ? "行程未找到" : error ?? "行程未找到"}
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
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-temple-500 block mb-0.5">日期</span>
            <span className="text-temple-200">
              {formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}
            </span>
          </div>
          <div>
            <span className="text-temple-500 block mb-0.5">人数</span>
            <span className="text-temple-200">{trip.persons ?? 1} 人</span>
          </div>
          <div>
            <span className="text-temple-500 block mb-0.5">预算</span>
            <span className="text-temple-200">{formatBudget(trip.totalBudget)}</span>
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
      {trip.sites.length > 0 && (
        <div className="card-glow rounded-2xl bg-temple-800/50 p-6 mb-6">
          <h2 className="text-lg font-serif font-semibold text-temple-100 mb-4">
            朝圣圣地
          </h2>
          <div className="space-y-3">
            {trip.sites.map((ts) => (
              <div
                key={ts.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-temple-700/30 border border-temple-700/50"
              >
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-xs font-bold text-gold">
                  {ts.order}
                </div>
                <div className="flex-1">
                  <span className="text-temple-100 font-medium">
                    {ts.site.name}
                  </span>
                  <span className="text-temple-500 text-sm ml-2">
                    {ts.site.country}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="mb-6">
        <ReviewSection targetType="TRIP" targetId={trip.id} />
      </div>

      {/* Status History */}
      {trip.statusHistory.length > 0 && (
        <div className="card-glow rounded-2xl bg-temple-800/50 p-6">
          <h2 className="text-lg font-serif font-semibold text-temple-100 mb-4">
            状态历史
          </h2>
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gold/20" />
            <div className="space-y-5">
              {trip.statusHistory.map((item) => (
                <div key={item.id} className="relative">
                  <div className="absolute left-[-21px] top-1.5 w-3 h-3 rounded-full border-2 border-gold/40 bg-temple-800" />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-temple-200">
                        {item.action}
                      </span>
                      <span className="text-xs text-temple-500">
                        {item.createdAt.slice(0, 10)}
                      </span>
                    </div>
                    {item.reason && (
                      <p className="text-sm text-temple-400">{item.reason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
