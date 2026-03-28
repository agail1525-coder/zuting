"use client";

import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
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
  EASY: "bg-green-900/40 text-green-300 border-green-600/30",
  MODERATE: "bg-amber-900/40 text-amber-300 border-amber-600/30",
  CHALLENGING: "bg-red-900/40 text-red-300 border-red-600/30",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "轻松",
  MODERATE: "适中",
  CHALLENGING: "挑战",
};

export default function RouteDetailClient({ route }: { route: Route }) {
  const price = (route.priceFrom / 100).toLocaleString();

  return (
    <div className="min-h-screen bg-gradient-to-b from-temple-800 via-temple-900 to-temple-900">
      <main className="pt-16 pb-24">
        {/* Hero Section */}
        <div className="relative">
          {/* Hero Image */}
          {route.coverImage && (
            <div className="absolute inset-0 h-[400px]">
              <OptimizedImage src={route.coverImage} alt={route.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-temple-900/60 via-temple-900/80 to-temple-900" />
            </div>
          )}

          <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-16 text-white" style={{ minHeight: route.coverImage ? '350px' : undefined }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-temple-400 mb-6">
              <Link href="/routes" className="hover:text-gold transition-colors">路线</Link>
              <span>/</span>
              <span className="text-temple-300">{route.title}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {CATEGORY_LABELS[route.category] ?? route.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${DIFFICULTY_COLORS[route.difficulty] ?? "bg-temple-700/60 text-temple-300 border-temple-600/30"}`}>
                    {DIFFICULTY_LABELS[route.difficulty] ?? route.difficulty}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">{route.title}</h1>
                <p className="text-lg text-temple-300 mt-2">{route.subtitle}</p>
                <p className="text-sm text-temple-400 mt-1">{route.titleEn}</p>

                <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-temple-300">
                  <span className="flex items-center gap-1.5">📅 {route.duration}天{route.nights}晚</span>
                  <span className="flex items-center gap-1.5">🌤 {route.season}</span>
                  <span className="flex items-center gap-1.5">👥 {route.groupSize}</span>
                  {route.rating && (
                    <span className="flex items-center gap-1.5">
                      <span className="text-amber-400">★</span>
                      {route.rating.toFixed(1)} ({route.reviewCount}评)
                    </span>
                  )}
                </div>
              </div>

              {/* Price Card */}
              <div className="card-glow bg-temple-800/70 backdrop-blur-xl rounded-2xl p-6 md:min-w-[280px]">
                <div className="text-center">
                  <p className="text-sm text-temple-400">起价</p>
                  <p className="text-3xl font-bold text-gold mt-1">
                    ¥{price}<span className="text-base font-normal text-temple-400">/人</span>
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <Link
                    href="/chat"
                    className="block w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-center transition-colors shadow-lg shadow-amber-500/20"
                  >
                    AI规划师咨询
                  </Link>
                  <button className="w-full py-3 rounded-xl border border-gold/20 hover:bg-gold/10 text-white font-medium transition-colors">
                    收藏路线
                  </button>
                </div>
                <p className="text-xs text-temple-500 text-center mt-3">
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
              <span key={h} className="px-3 py-1.5 bg-amber-500/10 text-amber-300 rounded-full text-sm font-medium border border-amber-500/20">
                {h}
              </span>
            ))}
          </div>

          {/* Description */}
          <div className="mt-8 card-glow bg-temple-800/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">路线介绍</h2>
            <p className="text-temple-300 leading-relaxed whitespace-pre-line">{route.description}</p>
          </div>

          {/* Image Gallery */}
          {route.images && route.images.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-white mb-4">路线图集</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {route.images.map((img, i) => (
                  <div key={i} className="relative h-48 rounded-xl overflow-hidden card-glow">
                    <OptimizedImage src={img} alt={`${route.title} ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itinerary */}
          <div className="mt-8 card-glow bg-temple-800/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">逐日行程</h2>
            <div className="space-y-6">
              {(route.itinerary as ItineraryDay[]).map((day) => (
                <div key={day.day} className="relative pl-8 pb-6 border-l-2 border-gold/30 last:border-transparent">
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <span className="text-white text-xs font-bold">{day.day}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Day {day.day}: {day.title}
                  </h3>
                  {day.activities && day.activities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {day.activities.map((act, i) => (
                        <span key={i} className="px-2.5 py-1 bg-blue-900/30 text-blue-300 rounded text-sm border border-blue-600/20">
                          {act}
                        </span>
                      ))}
                    </div>
                  )}
                  {day.meals && day.meals.length > 0 && (
                    <p className="text-sm text-temple-400 mt-2">🍽 {day.meals.join(" | ")}</p>
                  )}
                  {day.accommodation && (
                    <p className="text-sm text-temple-400 mt-1">🏨 {day.accommodation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Included / Excluded */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="card-glow bg-temple-800/50 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">费用包含</h2>
              <ul className="space-y-2">
                {route.included.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-temple-300">
                    <span className="text-emerald-400">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-glow bg-temple-800/50 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">费用不含</h2>
              <ul className="space-y-2">
                {route.excluded.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-temple-300">
                    <span className="text-red-400">✗</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tips */}
          {route.tips.length > 0 && (
            <div className="mt-8 card-glow bg-amber-900/20 rounded-2xl p-6 border border-amber-500/10">
              <h2 className="text-lg font-bold text-amber-300 mb-3">出行贴士</h2>
              <ul className="space-y-2">
                {route.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-200/80">
                    <span className="mt-0.5">💡</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Sites */}
          {route.sites && route.sites.length > 0 && (
            <div className="mt-8 card-glow bg-temple-800/50 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">途经圣地</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {route.sites.map((rs) => (
                  <Link
                    key={rs.id}
                    href={`/holy-sites`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-temple-700/30 hover:bg-temple-700/50 transition-colors border border-temple-600/20 hover:border-gold/20"
                  >
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 font-bold text-sm border border-amber-500/20">
                      D{rs.day}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{rs.site.name}</p>
                      <p className="text-xs text-temple-400">{rs.site.country} · {rs.duration ?? ""}</p>
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
            >
              ✨ 让AI规划师为你定制行程
            </Link>
            <p className="text-sm text-temple-500 mt-3">
              或 <Link href="/routes" className="text-gold hover:underline">浏览更多路线</Link>
            </p>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
