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
  { labelKey: "home.cat.zen", label: "禅宗路线", icon: "🏯", href: "/routes?category=ZEN", color: "from-stone-700/60 to-stone-800/60" },
  { labelKey: "home.cat.buddhist", label: "佛教圣地", icon: "☸", href: "/routes?category=BUDDHIST", color: "from-amber-700/60 to-amber-800/60" },
  { labelKey: "home.cat.taoist", label: "道教寻根", icon: "☯", href: "/routes?category=TAOIST", color: "from-emerald-700/60 to-emerald-800/60" },
  { labelKey: "home.cat.christian", label: "基督文化", icon: "⛪", href: "/routes?category=CHRISTIAN", color: "from-blue-700/60 to-blue-800/60" },
  { labelKey: "home.cat.silkroad", label: "丝路探秘", icon: "🕌", href: "/routes?category=ISLAMIC", color: "from-green-700/60 to-green-800/60" },
  { labelKey: "home.cat.cross", label: "跨文化之旅", icon: "🌏", href: "/routes?category=CROSS_CULTURAL", color: "from-violet-700/60 to-violet-800/60" },
  { labelKey: "home.cat.ai", label: "AI智能规划", icon: "✨", href: "/chat", color: "from-amber-600/60 to-amber-700/60" },
  { labelKey: "home.cat.wiki", label: "文化百科", icon: "📖", href: "/religions", color: "from-cyan-700/60 to-cyan-800/60" },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  ZEN:            { bg: "bg-stone-800/60",   text: "text-stone-200" },
  BUDDHIST:       { bg: "bg-amber-900/50",   text: "text-amber-200" },
  TAOIST:         { bg: "bg-emerald-900/50",  text: "text-emerald-200" },
  CHRISTIAN:      { bg: "bg-blue-900/50",    text: "text-blue-200" },
  ISLAMIC:        { bg: "bg-green-900/50",   text: "text-green-200" },
  CROSS_CULTURAL: { bg: "bg-violet-900/50",  text: "text-violet-200" },
  HINDU:          { bg: "bg-orange-900/50",  text: "text-orange-200" },
};

const CATEGORY_LABELS: Record<string, string> = {
  ZEN: "禅宗", BUDDHIST: "佛教", TAOIST: "道教", CHRISTIAN: "基督教",
  ISLAMIC: "伊斯兰", CROSS_CULTURAL: "跨文化", HINDU: "印度教",
};

// Religion gradient for cards
const RELIGION_GRADIENT: Record<string, string> = {
  buddhism: "from-amber-600/20 to-amber-900/30",
  taoism: "from-emerald-600/20 to-emerald-900/30",
  christianity: "from-blue-600/20 to-blue-900/30",
  islam: "from-green-600/20 to-green-900/30",
  hinduism: "from-orange-600/20 to-orange-900/30",
  judaism: "from-indigo-600/20 to-indigo-900/30",
  confucianism: "from-red-600/20 to-red-900/30",
  sikhism: "from-orange-600/20 to-orange-900/30",
  shinto: "from-rose-600/20 to-rose-900/30",
  "tibetan-buddhism": "from-purple-600/20 to-purple-900/30",
  indigenous: "from-stone-600/20 to-stone-900/30",
  bahai: "from-cyan-600/20 to-cyan-900/30",
};

function RouteCard({ route }: { route: Route }) {
  const price = (route.priceFrom / 100).toLocaleString();
  const colors = CATEGORY_COLORS[route.category] ?? { bg: "bg-temple-700/60", text: "text-temple-200" };
  return (
    <Link href={`/routes/${route.slug}`} className="group flex-shrink-0 w-72 md:w-80">
      <div className="card-glow rounded-2xl overflow-hidden bg-temple-800/50 hover:bg-temple-800/70 transition-all duration-300">
        <div className="relative h-44 overflow-hidden">
          {route.coverImage ? (
            <OptimizedImage src={route.coverImage} alt={route.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-temple-700 to-temple-800 flex items-center justify-center">
              <span className="text-5xl opacity-30">
                {route.category === "ZEN" ? "🏯" : route.category === "TAOIST" ? "☯" : route.category === "CHRISTIAN" ? "⛪" : route.category === "ISLAMIC" ? "🕌" : "☸"}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-temple-900/60 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10 ${colors.bg} ${colors.text}`}>
              {CATEGORY_LABELS[route.category] ?? route.category} · {route.duration}天{route.nights}晚
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-white group-hover:text-gold transition-colors">{route.title}</h3>
          <p className="text-sm text-temple-400 mt-1 line-clamp-1">{route.subtitle}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-amber-400 font-bold">¥{price}<span className="text-xs text-temple-500 font-normal">/人</span></span>
            {route.rating && (
              <span className="text-sm text-temple-400 flex items-center gap-0.5">
                <span className="text-amber-400">★</span>{route.rating.toFixed(1)}
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
      <div className="relative h-48 md:h-56 rounded-2xl overflow-hidden card-glow">
        {site.imageUrl ? (
          <OptimizedImage src={site.imageUrl} alt={site.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-temple-700 to-temple-800 flex items-center justify-center">
            <span className="text-4xl opacity-30">{site.religion?.symbol || "🏛"}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-temple-900/90 via-temple-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg drop-shadow-lg">{site.name}</h3>
          <p className="text-white/70 text-sm">{site.country}</p>
        </div>
        {site.religion && (
          <div className="absolute top-3 right-3">
            <span
              className="text-xs px-2 py-1 rounded-full backdrop-blur-sm border border-white/10"
              style={{ backgroundColor: `${site.religion.color ?? '#D4A855'}30`, color: site.religion.color ?? '#D4A855' }}
            >
              {site.religion.symbol}
            </span>
          </div>
        )}
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
    <div className="min-h-screen bg-gradient-to-b from-temple-800 via-temple-900 to-temple-900">
      {/* Hero Section */}
      <section className="relative hero-bg pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight">
            <span className="text-gradient-gold">走祖庭，看世界</span>
          </h1>
          <p className="text-temple-300 text-lg md:text-xl mt-4 max-w-2xl mx-auto">
            探索全球60+文化圣地，体验千年智慧之旅
          </p>

          {/* Search Bar - Glassmorphism */}
          <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("home.searchPlaceholder") || "搜索目的地、路线或文化关键词..."}
              className="w-full px-6 py-4 pl-12 rounded-2xl bg-temple-800/60 backdrop-blur-xl text-white placeholder-temple-400 border border-gold/20 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 text-base shadow-2xl"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-temple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-amber-500/20">
              {t("home.search") || "搜索"}
            </button>
          </form>

          {/* Hot Tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {["#禅宗路线", "#耶路撒冷", "#六祖慧能", "#丝路文化", "#武当问道"].map((tag) => (
              <Link key={tag} href={`/search?q=${encodeURIComponent(tag.slice(1))}`} className="px-3 py-1.5 rounded-full text-sm bg-temple-700/60 text-temple-300 border border-temple-600/30 hover:bg-temple-600/60 hover:text-gold hover:border-gold/20 transition-all backdrop-blur-sm">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category Icons Grid */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        <div className="card-glow bg-temple-800/70 backdrop-blur-xl rounded-2xl p-6 grid grid-cols-4 md:grid-cols-8 gap-4">
          {CATEGORY_ICONS.map((cat) => (
            <Link key={cat.label} href={cat.href} className="flex flex-col items-center gap-2 group">
              <span className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br ${cat.color} group-hover:scale-110 transition-all duration-300 text-2xl border border-white/5`}>
                {cat.icon}
              </span>
              <span className="text-xs text-temple-300 group-hover:text-gold transition-colors text-center leading-tight">
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
                <h2 className="text-2xl font-bold text-white">{t("home.featuredRoutes") || "精选路线"}</h2>
                <p className="text-temple-400 text-sm mt-1">{t("home.featuredRoutesDesc") || "深度文化之旅，精心策划每一天"}</p>
              </div>
              <Link href="/routes" className="text-gold hover:text-gold-light text-sm font-medium flex items-center gap-1 transition-colors">
                {t("home.viewAll") || "查看全部"} <span>→</span>
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 px-4 md:px-[max(1rem,calc((100%-72rem)/2+1rem))] pb-4">
              {featuredRoutes.map((route) => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AI Planner Showcase */}
      <section className="mt-14 md:mt-20 max-w-6xl mx-auto px-4">
        <div className="card-glow bg-gradient-to-r from-temple-800/80 to-temple-700/50 rounded-3xl overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center p-8 md:p-12 gap-8">
            <div className="flex-1">
              <span className="text-amber-400 text-sm font-medium tracking-wider uppercase">{t("home.aiPlanning") || "AI智能规划"}</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mt-2">{t("home.aiTitle") || "小鸿AI旅行规划师"}</h2>
              <p className="text-temple-300 mt-3 leading-relaxed">
                {t("home.aiDesc") || "告诉小鸿你的偏好——文化类型、天数、预算，获得个性化路线推荐。还能帮你查询目的地攻略、规划逐日行程。"}
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
              >
                ✨ {t("home.startAI") || "开始AI规划"}
              </Link>
            </div>
            <div className="flex-1 max-w-md">
              <div className="bg-temple-900/50 backdrop-blur rounded-2xl p-5 border border-gold/10 space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm flex-shrink-0">👤</div>
                  <div className="bg-temple-700/60 rounded-xl rounded-tl-sm px-4 py-2.5 text-temple-200 text-sm flex-1 border border-temple-600/30">
                    我想走一条禅宗路线，3-5天，预算5000以内
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-sm flex-shrink-0">✨</div>
                  <div className="bg-amber-500/10 rounded-xl rounded-tl-sm px-4 py-2.5 text-amber-100 text-sm flex-1 border border-amber-500/20">
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
              <h2 className="text-2xl font-bold text-white">{t("home.popularDest") || "热门目的地"}</h2>
              <p className="text-temple-400 text-sm mt-1">{t("home.popularDestDesc") || "全球文化圣地等你探索"}</p>
            </div>
            <Link href="/holy-sites" className="text-gold hover:text-gold-light text-sm font-medium flex items-center gap-1 transition-colors">
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
            <h2 className="text-2xl font-bold text-white">{t("home.traditions") || "12大文化传统"}</h2>
            <Link href="/religions" className="text-gold hover:text-gold-light text-sm font-medium transition-colors">
              {t("home.wikiLink") || "文化百科"} →
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {religions.map((r) => {
              const gradient = RELIGION_GRADIENT[r.slug] || "from-gold/20 to-temple-800";
              return (
                <Link
                  key={r.id}
                  href={`/religions/${r.slug}`}
                  className={`card-glow flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${gradient} backdrop-blur-sm group`}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{r.symbol ?? "◉"}</span>
                  <span className="text-xs text-temple-200 group-hover:text-gold text-center font-medium transition-colors">{r.name}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="mt-14 md:mt-20">
        <div className="divider-gold" />
        <div className="py-12 bg-temple-800/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-gold">12</p>
                <p className="text-sm text-temple-400 mt-1">{t("home.statTraditions") || "大文化传统"}</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-gold">60+</p>
                <p className="text-sm text-temple-400 mt-1">{t("home.statSites") || "文化圣地"}</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-gold">{featuredRoutes.length}+</p>
                <p className="text-sm text-temple-400 mt-1">{t("home.statRoutes") || "深度路线"}</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-gold">50000+</p>
                <p className="text-sm text-temple-400 mt-1">{t("home.statTravelers") || "旅行者"}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="divider-gold" />
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-20 text-center max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white">{t("home.ctaTitle") || "开启你的文化之旅"}</h2>
        <p className="text-temple-400 mt-3 max-w-lg mx-auto">
          {t("home.ctaDesc") || "千年智慧，一路同行。从禅宗到丝路，从耶路撒冷到京都，探索全球最深邃的文化旅行体验。"}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/routes" className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30">
            {t("home.browseRoutes") || "浏览路线"}
          </Link>
          <Link href="/chat" className="px-8 py-3.5 bg-temple-700/60 hover:bg-temple-600/60 text-white font-semibold rounded-xl transition-all border border-gold/20 hover:border-gold/30 backdrop-blur-sm">
            {t("home.aiPlan") || "AI帮你规划"}
          </Link>
        </div>
      </section>

      <MobileNav />
    </div>
  );
}
