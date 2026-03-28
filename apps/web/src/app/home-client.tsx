"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";
import type { Religion, HolySite, Route } from "@/lib/api";

interface Props {
  religions: Religion[];
  holySites: HolySite[];
  featuredRoutes: Route[];
  error?: boolean;
}

const CATEGORY_ICONS = [
  { label: "禅宗路线", icon: "禅", href: "/routes?category=ZEN", color: "#78716C" },
  { label: "佛教圣地", icon: "佛", href: "/routes?category=BUDDHIST", color: "#F59E0B" },
  { label: "道教寻根", icon: "道", href: "/routes?category=TAOIST", color: "#10B981" },
  { label: "基督文化", icon: "十", href: "/routes?category=CHRISTIAN", color: "#3B82F6" },
  { label: "丝路探秘", icon: "丝", href: "/routes?category=ISLAMIC", color: "#059669" },
  { label: "跨文化之旅", icon: "融", href: "/routes?category=CROSS_CULTURAL", color: "#7C3AED" },
  { label: "AI智能规划", icon: "AI", href: "/chat", color: "#0066FF" },
  { label: "文化百科", icon: "典", href: "/religions", color: "#0891B2" },
];

const CATEGORY_LABELS: Record<string, string> = {
  ZEN: "禅宗", BUDDHIST: "佛教", TAOIST: "道教", CHRISTIAN: "基督教",
  ISLAMIC: "伊斯兰", CROSS_CULTURAL: "跨文化", HINDU: "印度教",
};

function RouteCard({ route }: { route: Route }) {
  const price = (route.priceFrom / 100).toLocaleString();
  return (
    <Link href={`/routes/${route.slug}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
        <div className="relative h-44 overflow-hidden">
          {route.coverImage ? (
            <OptimizedImage src={route.coverImage} alt={route.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-5xl opacity-30">
                {route.category === "ZEN" ? "🏯" : route.category === "TAOIST" ? "☯" : route.category === "CHRISTIAN" ? "⛪" : route.category === "ISLAMIC" ? "🕌" : "☸"}
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm">
              {CATEGORY_LABELS[route.category] ?? route.category} · {route.duration}天{route.nights}晚
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors">{route.title}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{route.subtitle}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-gray-900 font-bold">¥{price}<span className="text-xs text-gray-400 font-normal">/人</span></span>
            {route.rating && (
              <span className="text-sm flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded bg-[#0066FF] text-white text-xs font-bold">{route.rating.toFixed(1)}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function DestinationCard({ site }: { site: HolySite }) {
  return (
    <Link href={`/holy-sites/${site.id}`} className="group">
      <div className="relative h-48 md:h-56 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
        {site.imageUrl ? (
          <OptimizedImage src={site.imageUrl} alt={site.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-4xl opacity-30">{site.religion?.symbol || "🏛"}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg drop-shadow-lg">{site.name}</h3>
          <p className="text-white/80 text-sm">{site.country}</p>
        </div>
      </div>
    </Link>
  );
}

export default function HomeClient({ religions, holySites, featuredRoutes, error }: Props) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const destinations = holySites.slice(0, 8);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section — Blue gradient banner */}
      <section className="relative hero-bg pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
            加入我们，探索世界
          </h1>
          <p className="text-white/80 text-lg md:text-xl mt-4 max-w-2xl mx-auto">
            探索全球60+文化圣地，体验千年智慧之旅
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-5 text-white/70 text-sm">
            <span className="flex items-center gap-1.5">⭐ 专业路线策划</span>
            <span className="hidden sm:flex items-center gap-1.5">💬 AI旅行顾问</span>
            <span className="flex items-center gap-1.5">🌍 12大文化传统</span>
          </div>

          {/* Search Bar — White on blue */}
          <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("home.searchPlaceholder") || "搜索目的地、路线或文化关键词..."}
              className="w-full px-6 py-4 pl-12 rounded-xl bg-white text-gray-900 placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-white/50 text-base shadow-2xl"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg font-medium transition-colors">
              {t("home.search") || "搜索"}
            </button>
          </form>

          {/* Hot Tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {["#禅宗路线", "#耶路撒冷", "#六祖慧能", "#丝路文化", "#武当问道"].map((tag) => (
              <Link key={tag} href={`/search?q=${encodeURIComponent(tag.slice(1))}`} className="px-3 py-1.5 rounded-full text-sm bg-white/20 text-white hover:bg-white/30 transition-all backdrop-blur-sm">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category Icons Grid — White card */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 grid grid-cols-4 md:grid-cols-8 gap-4">
          {CATEGORY_ICONS.map((cat) => (
            <Link key={cat.label} href={cat.href} className="flex flex-col items-center gap-2 group">
              <span
                className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full group-hover:scale-110 transition-all duration-300 text-base font-bold text-white"
                style={{ backgroundColor: cat.color }}
              >
                {cat.icon}
              </span>
              <span className="text-xs text-gray-600 group-hover:text-[#0066FF] transition-colors text-center leading-tight font-medium">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Routes */}
      {featuredRoutes.length > 0 && (
        <section className="mt-14 md:mt-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t("home.featuredRoutes") || "精选路线"}</h2>
                <p className="text-gray-500 text-sm mt-1">{t("home.featuredRoutesDesc") || "深度文化之旅，精心策划每一天"}</p>
              </div>
              <Link href="/routes" className="text-[#0066FF] hover:text-[#0052CC] text-sm font-medium flex items-center gap-1 transition-colors">
                {t("home.viewAll") || "查看全部"} <span>→</span>
              </Link>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredRoutes.slice(0, 8).map((route) => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AI Planner Showcase */}
      <section className="mt-14 md:mt-20 max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] rounded-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center p-8 md:p-12 gap-8">
            <div className="flex-1">
              <span className="text-white/70 text-sm font-medium tracking-wider uppercase">AI Travel Planner</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mt-2">{t("home.aiTitle") || "AI旅行规划师"}</h2>
              <p className="text-white/80 mt-3 leading-relaxed">
                {t("home.aiDesc") || "告诉AI你的偏好——文化类型、天数、预算，获得个性化路线推荐。还能帮你查询目的地攻略、规划逐日行程。"}
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-[#0066FF] font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:bg-gray-50"
              >
                💬 {t("home.startAI") || "开始AI规划"}
              </Link>
            </div>
            <div className="flex-1 max-w-md">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5 space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm flex-shrink-0">👤</div>
                  <div className="bg-white/15 rounded-xl rounded-tl-sm px-4 py-2.5 text-white text-sm flex-1">
                    我想走一条禅宗路线，3-5天，预算5000以内
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm flex-shrink-0">💬</div>
                  <div className="bg-white/15 rounded-xl rounded-tl-sm px-4 py-2.5 text-white text-sm flex-1">
                    推荐「六祖慧能路线」5天4晚，走访国恩寺→南华寺→光孝寺，起价¥3,280/人。要看详细行程吗？
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      {destinations.length > 0 && (
        <section className="mt-14 md:mt-20 max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t("home.popularDest") || "热门目的地"}</h2>
              <p className="text-gray-500 text-sm mt-1">{t("home.popularDestDesc") || "全球文化圣地等你探索"}</p>
            </div>
            <Link href="/holy-sites" className="text-[#0066FF] hover:text-[#0052CC] text-sm font-medium flex items-center gap-1 transition-colors">
              {t("home.viewAll") || "查看全部"} <span>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destinations.map((site) => (
              <DestinationCard key={site.id} site={site} />
            ))}
          </div>
        </section>
      )}

      {/* Cultural Traditions */}
      {religions.length > 0 && (
        <section className="mt-14 md:mt-20 max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t("home.traditions") || "12大文化传统"}</h2>
            <Link href="/religions" className="text-[#0066FF] hover:text-[#0052CC] text-sm font-medium transition-colors">
              {t("home.wikiLink") || "文化百科"} →
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {religions.map((r) => (
              <Link
                key={r.id}
                href={`/religions/${r.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{r.symbol ?? "◉"}</span>
                <span className="text-xs text-gray-700 group-hover:text-[#0066FF] text-center font-medium transition-colors">{r.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="mt-14 md:mt-20 bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-[#0066FF]">12</p>
              <p className="text-sm text-gray-500 mt-1">{t("home.statTraditions") || "大文化传统"}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-[#0066FF]">60+</p>
              <p className="text-sm text-gray-500 mt-1">{t("home.statSites") || "文化圣地"}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-[#0066FF]">{featuredRoutes.length}+</p>
              <p className="text-sm text-gray-500 mt-1">{t("home.statRoutes") || "深度路线"}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-[#0066FF]">50000+</p>
              <p className="text-sm text-gray-500 mt-1">{t("home.statTravelers") || "旅行者"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-20 text-center max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t("home.ctaTitle") || "开启你的文化之旅"}</h2>
        <p className="text-gray-500 mt-3 max-w-lg mx-auto">
          {t("home.ctaDesc") || "千年智慧，一路同行。从禅宗到丝路，从耶路撒冷到京都，探索全球最深邃的文化旅行体验。"}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/routes" className="px-8 py-3.5 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-200">
            {t("home.browseRoutes") || "浏览路线"}
          </Link>
          <Link href="/chat" className="px-8 py-3.5 bg-white hover:bg-gray-50 text-[#0066FF] font-semibold rounded-xl transition-all border border-[#0066FF]/30 hover:border-[#0066FF]/50">
            {t("home.aiPlan") || "AI帮你规划"}
          </Link>
        </div>
      </section>

      <MobileNav />
    </div>
  );
}
