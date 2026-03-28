"use client";

import Link from "next/link";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import type { Route, ItineraryDay } from "@/lib/api";

const CATEGORY_LABELS: Record<string, string> = {
  ZEN: "禅宗路线",
  BUDDHIST: "佛教圣地",
  TAOIST: "道教寻根",
  CHRISTIAN: "基督文化",
  ISLAMIC: "伊斯兰文化",
  CROSS_CULTURAL: "跨文化融合",
  HINDU: "印度教",
  JEWISH: "犹太教",
  CULTURAL_HERITAGE: "文化遗产",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "bg-green-100 text-green-700",
  MODERATE: "bg-amber-100 text-amber-700",
  CHALLENGING: "bg-red-100 text-red-700",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "轻松",
  MODERATE: "适中",
  CHALLENGING: "挑战",
};

export default function RouteDetailClient({ route }: { route: Route }) {
  const price = (route.priceFrom / 100).toLocaleString();

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Header />
      <main className="pt-16 pb-24">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <Link href="/routes" className="hover:text-amber-400 transition-colors">路线</Link>
              <span>/</span>
              <span className="text-gray-300">{route.title}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {CATEGORY_LABELS[route.category] ?? route.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[route.difficulty] ?? "bg-gray-100 text-gray-700"}`}>
                    {DIFFICULTY_LABELS[route.difficulty] ?? route.difficulty}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">{route.title}</h1>
                <p className="text-lg text-gray-300 mt-2">{route.subtitle}</p>
                <p className="text-sm text-gray-400 mt-1">{route.titleEn}</p>

                <div className="flex flex-wrap items-center gap-4 mt-6 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="text-lg">📅</span>
                    {route.duration}天{route.nights}晚
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-lg">🌤</span>
                    {route.season}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-lg">👥</span>
                    {route.groupSize}
                  </span>
                  {route.rating && (
                    <span className="flex items-center gap-1.5">
                      <span className="text-amber-400">★</span>
                      {route.rating.toFixed(1)} ({route.reviewCount}评)
                    </span>
                  )}
                </div>
              </div>

              {/* Price Card */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 md:min-w-[280px] border border-white/10">
                <div className="text-center">
                  <p className="text-sm text-gray-400">起价</p>
                  <p className="text-3xl font-bold text-amber-400 mt-1">
                    ¥{price}<span className="text-base font-normal text-gray-400">/人</span>
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <Link
                    href="/chat"
                    className="block w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-center transition-colors"
                  >
                    AI规划师咨询
                  </Link>
                  <button className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 text-white font-medium transition-colors">
                    收藏路线
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">
                  已有 {route.bookCount} 人预订
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          {/* Highlights */}
          <div className="flex flex-wrap gap-2 mt-8">
            {route.highlights.map((h) => (
              <span key={h} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-100">
                {h}
              </span>
            ))}
          </div>

          {/* Description */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">路线介绍</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{route.description}</p>
          </div>

          {/* Itinerary */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">逐日行程</h2>
            <div className="space-y-6">
              {(route.itinerary as ItineraryDay[]).map((day) => (
                <div key={day.day} className="relative pl-8 pb-6 border-l-2 border-amber-200 last:border-transparent">
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{day.day}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Day {day.day}: {day.title}
                  </h3>
                  {day.activities && day.activities.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {day.activities.map((act, i) => (
                          <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                            {act}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {day.meals && day.meals.length > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      🍽 {day.meals.join(" | ")}
                    </p>
                  )}
                  {day.accommodation && (
                    <p className="text-sm text-gray-500 mt-1">
                      🏨 {day.accommodation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Included / Excluded */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">费用包含</h2>
              <ul className="space-y-2">
                {route.included.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">费用不含</h2>
              <ul className="space-y-2">
                {route.excluded.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-red-500">✗</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tips */}
          {route.tips.length > 0 && (
            <div className="mt-8 bg-amber-50 rounded-2xl p-6 border border-amber-100">
              <h2 className="text-lg font-bold text-amber-900 mb-3">出行贴士</h2>
              <ul className="space-y-2">
                {route.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                    <span className="mt-0.5">💡</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Sites */}
          {route.sites && route.sites.length > 0 && (
            <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">途经圣地</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {route.sites.map((rs) => (
                  <Link
                    key={rs.id}
                    href={`/holy-sites`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-amber-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 font-bold text-sm">
                      D{rs.day}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{rs.site.name}</p>
                      <p className="text-xs text-gray-500">{rs.site.country} · {rs.duration ?? ""}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-amber-500/25"
            >
              <span className="text-xl">🤖</span>
              让AI规划师为你定制行程
            </Link>
            <p className="text-sm text-gray-400 mt-3">
              或 <Link href="/routes" className="text-amber-600 hover:underline">浏览更多路线</Link>
            </p>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
