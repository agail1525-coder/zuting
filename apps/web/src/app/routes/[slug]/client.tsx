"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";
import PhotoMosaic from "@/components/PhotoMosaic";
import SocialProof from "@/components/SocialProof";
import PriceForecast from "@/components/PriceForecast";
import SaveButton from "@/components/SaveButton";
import ShareButton from "@/components/ShareButton";
import RouteMap from "@/components/RouteMap";
import ReviewSection from "@/components/ReviewSection";
import QASection from "@/components/QASection";
import type { Route, ItineraryDay } from "@/lib/api";
import { fetchRoutes } from "@/lib/api";

/* ─── static maps ─── */

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
  EASY: "bg-green-50 text-green-600 border-green-200",
  MODERATE: "bg-amber-50 text-amber-600 border-amber-200",
  CHALLENGING: "bg-red-50 text-red-600 border-red-200",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "轻松",
  MODERATE: "适中",
  CHALLENGING: "挑战",
};

const CANCELLATION_POLICIES = [
  { icon: "✅", text: "出发前14天：全额退款" },
  { icon: "🔄", text: "出发前7-13天：退款80%" },
  { icon: "⚠️", text: "出发前3-6天：退款50%" },
  { icon: "❌", text: "出发前3天内：不可退款" },
];

const TRUST_BADGES = [
  { icon: "🛡️", label: "免费取消", sub: "14天内" },
  { icon: "⚡", label: "即时确认", sub: "预订秒确" },
  { icon: "🎫", label: "电子票", sub: "无需打印" },
  { icon: "👨‍🏫", label: "专业导游", sub: "持证上岗" },
  { icon: "💬", label: "24/7客服", sub: "全天候" },
  { icon: "🔒", label: "安全支付", sub: "加密保障" },
];

/* ─── SimilarRoutes sub-component ─── */

function SimilarRoutes({ currentRouteId, category }: { currentRouteId: string; category: string }) {
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    fetchRoutes({ category, pageSize: 5, sort: "rating" })
      .then((res) => {
        setRoutes(res.items.filter((r) => r.id !== currentRouteId).slice(0, 4));
      })
      .catch(() => {});
  }, [currentRouteId, category]);

  if (routes.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">你可能也喜欢</h2>
        <Link href="/routes" className="text-sm text-[#0066FF] hover:underline">
          查看全部 →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {routes.map((r) => {
          const p = (r.priceFrom / 100).toLocaleString();
          return (
            <Link key={r.id} href={`/routes/${r.slug}`} className="group block">
              <div className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all duration-300">
                <div className="relative h-40 overflow-hidden">
                  {r.coverImage ? (
                    <OptimizedImage
                      src={r.coverImage}
                      alt={r.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-5xl opacity-30">🌏</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-black/30 text-white backdrop-blur-sm">
                      {r.duration}天{r.nights}晚
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-[#0066FF] transition-colors line-clamp-1">
                    {r.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{r.subtitle}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-sm font-bold text-[#0066FF]">¥{p}<span className="text-xs font-normal text-gray-400">/人</span></span>
                    {r.rating && (
                      <span className="flex items-center gap-0.5 text-xs text-gray-500">
                        <span className="text-amber-400">★</span> {r.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── BookingWidget sub-component ─── */

function BookingWidget({ route }: { route: Route }) {
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(1);

  const unitPrice = route.priceFrom / 100;
  const total = unitPrice * guests;

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="bg-white shadow-lg border border-gray-100 rounded-2xl p-6 md:min-w-[300px]">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500">起价</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">
          ¥{unitPrice.toLocaleString()}
          <span className="text-base font-normal text-gray-500">/人</span>
        </p>
      </div>

      {/* Date picker */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">出发日期</label>
          <input
            type="date"
            value={date}
            min={minDateStr}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">出行人数</label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="px-4 py-2.5 text-gray-500 hover:bg-gray-50 transition-colors font-semibold"
            >
              −
            </button>
            <span className="flex-1 text-center font-semibold text-gray-900">{guests}</span>
            <button
              onClick={() => setGuests((g) => Math.min(20, g + 1))}
              className="px-4 py-2.5 text-gray-500 hover:bg-gray-50 transition-colors font-semibold"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      {guests > 1 && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>¥{unitPrice.toLocaleString()} × {guests}人</span>
            <span>¥{total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <Link
          href={`/routes/checkout?route=${route.slug}&date=${date}&guests=${guests}`}
          className="block w-full py-3 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold text-center transition-colors shadow-lg shadow-blue-500/20"
        >
          {date ? "立即预订" : "选择日期预订"}
        </Link>
        <Link
          href="/chat"
          className="block w-full py-2.5 rounded-xl border border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF]/5 font-medium text-center text-sm transition-colors"
        >
          AI规划师咨询
        </Link>
      </div>

      <div className="flex items-center justify-center gap-3 mt-3">
        <SaveButton entityType="ROUTE" entityId={route.slug ?? route.id} size="md" />
        <ShareButton
          title={route.title}
          description={route.subtitle}
          url={typeof window !== "undefined" ? window.location.href : ""}
          image={route.coverImage ?? undefined}
          entityType="ROUTE"
          entityId={route.slug ?? route.id}
          className="text-sm"
        />
      </div>

      <p className="text-xs text-gray-400 text-center mt-3">
        已有 {route.bookCount} 人预订 · 预订后14天内免费取消
      </p>
    </div>
  );
}

/* ─── main page ─── */

export default function RouteDetailClient({ route }: { route: Route }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-16 pb-24">
        {/* ========== Hero Section ========== */}
        <div className="relative">
          {route.coverImage && (
            <div className="absolute inset-0 h-[400px]">
              <OptimizedImage src={route.coverImage} alt={route.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
            </div>
          )}

          <div
            className="relative max-w-6xl mx-auto px-4 py-12 md:py-16 text-white"
            style={{ minHeight: route.coverImage ? "350px" : undefined }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
              <Link href="/routes" className="hover:text-white transition-colors">路线</Link>
              <span>/</span>
              <span className="text-white/80">{route.title}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                    {CATEGORY_LABELS[route.category] ?? route.category}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${
                      route.coverImage
                        ? "bg-white/20 text-white border-white/30"
                        : DIFFICULTY_COLORS[route.difficulty] ?? "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {DIFFICULTY_LABELS[route.difficulty] ?? route.difficulty}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">{route.title}</h1>
                <p className="text-lg text-white/80 mt-2">{route.subtitle}</p>
                <p className="text-sm text-white/60 mt-1">{route.titleEn}</p>

                <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-white/80">
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

              {/* Booking Widget (enhanced) */}
              <BookingWidget route={route} />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          {/* ========== Trust Badges ========== */}
          <div className="mt-6 bg-white shadow-sm border border-gray-100 rounded-2xl p-4">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {TRUST_BADGES.map((badge) => (
                <div key={badge.label} className="flex flex-col items-center text-center gap-1">
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="text-xs font-semibold text-gray-800">{badge.label}</span>
                  <span className="text-[10px] text-gray-400">{badge.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ========== Highlights ========== */}
          <div className="flex flex-wrap gap-2 mt-8">
            {route.highlights.map((h) => (
              <span
                key={h}
                className="px-3 py-1.5 bg-[#0066FF]/5 text-[#0066FF] rounded-full text-sm font-medium border border-[#0066FF]/20"
              >
                {h}
              </span>
            ))}
          </div>

          {/* ========== Price Forecast (mobile visible too) ========== */}
          <div className="mt-6">
            <PriceForecast routeId={route.slug ?? route.id} currentPrice={route.priceFrom / 100} />
          </div>

          {/* ========== Description ========== */}
          <div className="mt-8 bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">路线介绍</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{route.description}</p>
          </div>

          {/* ========== Social Proof ========== */}
          <div className="mt-6">
            <SocialProof entityType="ROUTE" entityId={route.slug ?? route.id} variant="banner" />
          </div>

          {/* ========== Interactive Route Map ========== */}
          {route.sites && route.sites.length > 0 && (
            <div className="mt-8 bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">路线地图</h2>
              <p className="text-sm text-gray-500 mb-4">
                途经 {route.sites.length} 个圣地，全程 {route.duration} 天 {route.nights} 晚
              </p>
              <RouteMap sites={route.sites} height="400px" />
            </div>
          )}

          {/* ========== Image Gallery (Mosaic) ========== */}
          {route.images && route.images.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">路线图集</h2>
              <PhotoMosaic images={route.images} alt={route.title} />
            </div>
          )}

          {/* ========== Itinerary ========== */}
          <div className="mt-8 bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">逐日行程</h2>
            <div className="space-y-6">
              {(route.itinerary as ItineraryDay[]).map((day) => (
                <div
                  key={day.day}
                  className="relative pl-8 pb-6 border-l-2 border-[#0066FF]/30 last:border-transparent"
                >
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-[#0066FF] rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="text-white text-xs font-bold">{day.day}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Day {day.day}: {day.title}
                  </h3>
                  {day.activities && day.activities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {day.activities.map((act, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded text-sm border border-blue-200"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  )}
                  {day.meals && day.meals.length > 0 && (
                    <p className="text-sm text-gray-500 mt-2">🍽 {day.meals.join(" | ")}</p>
                  )}
                  {day.accommodation && (
                    <p className="text-sm text-gray-500 mt-1">🏨 {day.accommodation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ========== Included / Excluded ========== */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">费用包含</h2>
              <ul className="space-y-2">
                {route.included.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-emerald-400">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">费用不含</h2>
              <ul className="space-y-2">
                {route.excluded.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-red-400">✗</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ========== Cancellation Policy ========== */}
          <div className="mt-8 bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">取消与退款政策</h2>
            <div className="space-y-3">
              {CANCELLATION_POLICIES.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-sm text-gray-600">{p.text}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
              * 如遇不可抗力（自然灾害、疫情等），可申请全额退款。退款将在7个工作日内原路返还。
            </p>
          </div>

          {/* ========== Tips ========== */}
          {route.tips.length > 0 && (
            <div className="mt-8 bg-amber-50 rounded-2xl p-6 border border-amber-200">
              <h2 className="text-lg font-bold text-amber-600 mb-3">出行贴士</h2>
              <ul className="space-y-2">
                {route.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="mt-0.5">💡</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ========== Related Sites ========== */}
          {route.sites && route.sites.length > 0 && (
            <div className="mt-8 bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">途经圣地</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {route.sites.map((rs) => (
                  <Link
                    key={rs.id}
                    href="/holy-sites"
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 hover:border-[#0066FF]/30"
                  >
                    <div className="w-10 h-10 bg-[#0066FF]/10 rounded-lg flex items-center justify-center text-[#0066FF] font-bold text-sm border border-[#0066FF]/20">
                      D{rs.day}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{rs.site.name}</p>
                      <p className="text-xs text-gray-500">
                        {rs.site.country} · {rs.duration ?? ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ========== Reviews (UGC) ========== */}
          <div className="mt-10">
            <ReviewSection targetType="ROUTE" targetId={route.id} />
          </div>

          {/* ========== Q&A Section ========== */}
          <div className="mt-10">
            <QASection entityType="ROUTE" entityId={route.id} />
          </div>

          {/* ========== Similar Routes ========== */}
          <SimilarRoutes currentRouteId={route.id} category={route.category} />

          {/* ========== Bottom CTA ========== */}
          <div className="mt-12 text-center">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-2xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              ✨ 让AI规划师为你定制行程
            </Link>
            <p className="text-sm text-gray-400 mt-3">
              或{" "}
              <Link href="/routes" className="text-[#0066FF] hover:underline">
                浏览更多路线
              </Link>
            </p>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
