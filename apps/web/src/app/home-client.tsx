"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import type { Religion, HolySite, Route } from "@/lib/api";

interface Props {
  religions: Religion[];
  holySites: HolySite[];
  featuredRoutes: Route[];
  error?: boolean;
}

const CATEGORY_ICONS = [
  { label: "禅宗路线", icon: "🏯", href: "/routes?category=ZEN" },
  { label: "佛教圣地", icon: "☸", href: "/routes?category=BUDDHIST" },
  { label: "道教寻根", icon: "☯", href: "/routes?category=TAOIST" },
  { label: "基督文化", icon: "⛪", href: "/routes?category=CHRISTIAN" },
  { label: "丝路探秘", icon: "☪", href: "/routes?category=ISLAMIC" },
  { label: "跨文化之旅", icon: "🌏", href: "/routes?category=CROSS_CULTURAL" },
  { label: "AI智能规划", icon: "🤖", href: "/chat" },
  { label: "文化百科", icon: "📖", href: "/religions" },
];

const CATEGORY_COLORS: Record<string, string> = {
  ZEN: "bg-stone-100 text-stone-700",
  BUDDHIST: "bg-amber-100 text-amber-700",
  TAOIST: "bg-emerald-100 text-emerald-700",
  CHRISTIAN: "bg-red-100 text-red-700",
  ISLAMIC: "bg-green-100 text-green-700",
  CROSS_CULTURAL: "bg-violet-100 text-violet-700",
  HINDU: "bg-orange-100 text-orange-700",
};

const CATEGORY_LABELS: Record<string, string> = {
  ZEN: "禅宗", BUDDHIST: "佛教", TAOIST: "道教", CHRISTIAN: "基督教",
  ISLAMIC: "伊斯兰", CROSS_CULTURAL: "跨文化", HINDU: "印度教",
};

function RouteCard({ route }: { route: Route }) {
  const price = (route.priceFrom / 100).toLocaleString();
  return (
    <Link href={`/routes/${route.slug}`} className="group flex-shrink-0 w-72 md:w-80">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-amber-200">
        <div className="relative h-44 bg-gradient-to-br from-amber-50 to-stone-100">
          {route.coverImage ? (
            <img src={route.coverImage} alt={route.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl opacity-30">
                {route.category === "ZEN" ? "🏯" : route.category === "TAOIST" ? "☯" : route.category === "CHRISTIAN" ? "⛪" : route.category === "ISLAMIC" ? "🕌" : "☸"}
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[route.category] ?? "bg-gray-100 text-gray-700"}`}>
              {CATEGORY_LABELS[route.category] ?? route.category} · {route.duration}天{route.nights}晚
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">{route.title}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{route.subtitle}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-red-600 font-bold">¥{price}<span className="text-xs text-gray-400 font-normal">/人</span></span>
            {route.rating && (
              <span className="text-sm text-gray-500 flex items-center gap-0.5">
                <span className="text-amber-500">★</span>{route.rating.toFixed(1)}
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
    <Link href={`/holy-sites`} className="group">
      <div className="relative h-48 md:h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
        {site.imageUrl ? (
          <img src={site.imageUrl} alt={site.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-stone-200">
            <span className="text-4xl opacity-40">🏛</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg">{site.name}</h3>
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

  // Pick 8 representative destinations
  const destinations = holySites.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#1E293B] via-[#1E293B] to-[#334155] pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            走祖庭，看世界
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mt-4 max-w-2xl mx-auto">
            探索全球60+文化圣地，体验千年智慧之旅
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索目的地、路线或文化关键词..."
              className="w-full px-6 py-4 pl-12 rounded-2xl bg-white text-gray-900 placeholder-gray-400 shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-400/30 text-base"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors">
              搜索
            </button>
          </form>

          {/* Hot Tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {["#禅宗路线", "#耶路撒冷", "#六祖慧能", "#丝路文化", "#武当问道"].map((tag) => (
              <Link key={tag} href={`/search?q=${encodeURIComponent(tag.slice(1))}`} className="px-3 py-1 rounded-full text-sm bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category Icons Grid */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-4 md:grid-cols-8 gap-4">
          {CATEGORY_ICONS.map((cat) => (
            <Link key={cat.label} href={cat.href} className="flex flex-col items-center gap-2 group">
              <span className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl bg-amber-50 group-hover:bg-amber-100 transition-colors text-2xl">
                {cat.icon}
              </span>
              <span className="text-xs text-gray-600 group-hover:text-amber-700 transition-colors text-center leading-tight">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Routes */}
      {featuredRoutes.length > 0 && (
        <section className="mt-12 md:mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">精选路线</h2>
                <p className="text-gray-500 text-sm mt-1">深度文化之旅，精心策划每一天</p>
              </div>
              <Link href="/routes" className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1">
                查看全部 <span>→</span>
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
      <section className="mt-12 md:mt-16 max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-[#1E293B] to-[#334155] rounded-3xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center p-8 md:p-12 gap-8">
            <div className="flex-1">
              <span className="text-amber-400 text-sm font-medium">AI智能规划</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mt-2">小鸿AI旅行规划师</h2>
              <p className="text-gray-300 mt-3 leading-relaxed">
                告诉小鸿你的偏好——文化类型、天数、预算，获得个性化路线推荐。
                还能帮你查询目的地攻略、规划逐日行程。
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
              >
                <span>🤖</span> 开始AI规划
              </Link>
            </div>
            <div className="flex-1 max-w-md">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10 space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm">👤</div>
                  <div className="bg-white/10 rounded-xl px-4 py-2.5 text-white text-sm flex-1">
                    我想走一条禅宗路线，3-5天，预算5000以内
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-sm">🤖</div>
                  <div className="bg-amber-500/20 rounded-xl px-4 py-2.5 text-amber-100 text-sm flex-1">
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
        <section className="mt-12 md:mt-16 max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">热门目的地</h2>
              <p className="text-gray-500 text-sm mt-1">全球文化圣地等你探索</p>
            </div>
            <Link href="/holy-sites" className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1">
              查看全部 <span>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destinations.map((site) => (
              <DestinationCard key={site.id} site={site} />
            ))}
          </div>
        </section>
      )}

      {/* Cultural Traditions (compact) */}
      {religions.length > 0 && (
        <section className="mt-12 md:mt-16 max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">12大文化传统</h2>
            <Link href="/religions" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
              文化百科 →
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {religions.map((r) => (
              <Link
                key={r.id}
                href={`/religions`}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all group"
              >
                <span className="text-2xl">{r.symbol ?? "◉"}</span>
                <span className="text-xs text-gray-700 group-hover:text-amber-700 text-center font-medium">{r.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="mt-12 md:mt-16 bg-[#1E293B] text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-amber-400">12</p>
              <p className="text-sm text-gray-400 mt-1">大文化传统</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400">60+</p>
              <p className="text-sm text-gray-400 mt-1">文化圣地</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400">{featuredRoutes.length}+</p>
              <p className="text-sm text-gray-400 mt-1">深度路线</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400">50000+</p>
              <p className="text-sm text-gray-400 mt-1">旅行者</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 text-center max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">开启你的文化之旅</h2>
        <p className="text-gray-500 mt-3 max-w-lg mx-auto">
          千年智慧，一路同行。从禅宗到丝路，从耶路撒冷到京都，探索全球最深邃的文化旅行体验。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/routes" className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-amber-500/25">
            浏览路线
          </Link>
          <Link href="/chat" className="px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl transition-colors border border-gray-200 shadow-sm">
            AI帮你规划
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-gray-400 py-8 text-center text-sm">
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2026 全球祖庭旅行平台 · 走祖庭，看世界</p>
          <div className="flex justify-center gap-6 mt-3">
            <Link href="/about" className="hover:text-white transition-colors">关于我们</Link>
            <Link href="/terms" className="hover:text-white transition-colors">用户协议</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">隐私政策</Link>
          </div>
        </div>
      </footer>

      <MobileNav />
    </div>
  );
}
