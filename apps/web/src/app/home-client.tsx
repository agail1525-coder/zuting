"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";
import type { Religion, HolySite, Temple, Patriarch, Route } from "@/lib/api";

interface Props {
  religions: Religion[];
  holySites: HolySite[];
  temples: Temple[];
  patriarchs: Patriarch[];
  featuredRoutes: Route[];
  error?: boolean;
}

/* ─── Constants ─── */

const SEARCH_TABS = [
  { key: "sites", label: "圣地朝圣", placeholder: "搜索圣地、寺庙、目的地..." },
  { key: "routes", label: "文化路线", placeholder: "搜索路线名称、目的地..." },
  { key: "ai", label: "AI规划", placeholder: "描述你的旅行需求，如：3天禅宗路线，预算5000..." },
  { key: "wiki", label: "文化百科", placeholder: "搜索宗教、祖师、祖训..." },
] as const;

/* SVG icon paths for category buttons */
const CategorySvg = {
  zen: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3C7 8 4 12 4 15a8 8 0 0016 0c0-3-3-7-8-12z" />,
  buddhist: <><circle cx="12" cy="12" r="9" strokeWidth={1.5} /><path strokeLinecap="round" strokeWidth={1.5} d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" /></>,
  taoist: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 0c-2.8 0-5 4.5-5 10s2.2 10 5 10M12 7a2.5 2.5 0 110 5M12 12a2.5 2.5 0 110 5" />,
  christian: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16M6 9h12" />,
  islamic: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 4a8 8 0 11-6 15 6 6 0 106-15zM17 7l1-2.5L19 7" />,
  cross: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15 15 0 014 10 15 15 0 01-4 10M12 2a15 15 0 00-4 10 15 15 0 004 10" />,
  ai: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  book: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
};

const CATEGORY_ICONS = [
  { label: "禅宗路线", svg: CategorySvg.zen, href: "/routes?category=ZEN" },
  { label: "佛教圣地", svg: CategorySvg.buddhist, href: "/routes?category=BUDDHIST" },
  { label: "道教寻根", svg: CategorySvg.taoist, href: "/routes?category=TAOIST" },
  { label: "基督文化", svg: CategorySvg.christian, href: "/routes?category=CHRISTIAN" },
  { label: "丝路探秘", svg: CategorySvg.islamic, href: "/routes?category=ISLAMIC" },
  { label: "跨文化之旅", svg: CategorySvg.cross, href: "/routes?category=CROSS_CULTURAL" },
  { label: "AI智能规划", svg: CategorySvg.ai, href: "/chat" },
  { label: "文化百科", svg: CategorySvg.book, href: "/religions" },
];

const CATEGORY_LABELS: Record<string, string> = {
  ZEN: "禅宗", BUDDHIST: "佛教", TAOIST: "道教", CHRISTIAN: "基督教",
  ISLAMIC: "伊斯兰", CROSS_CULTURAL: "跨文化", HINDU: "印度教",
};

/* Platform highlights — SVG icons + unified blue palette */
const HighlightSvg = {
  globe: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15 15 0 014 10 15 15 0 01-4 10M12 2a15 15 0 00-4 10 15 15 0 004 10" />,
  pin: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>,
  chat: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
  edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
};

const PLATFORM_HIGHLIGHTS = [
  { svg: HighlightSvg.globe, title: "12大信仰", subtitle: "全球宗教文化深度探索", href: "/religions", cta: "了解更多" },
  { svg: HighlightSvg.pin, title: "60+圣地", subtitle: "精选全球文化朝圣目的地", href: "/holy-sites", cta: "立即探索" },
  { svg: HighlightSvg.chat, title: "AI规划师", subtitle: "智能推荐个性化朝圣路线", href: "/chat", cta: "开始对话" },
  { svg: HighlightSvg.edit, title: "朝圣日志", subtitle: "记录你的文化旅行感悟", href: "/journals/create", cta: "写日志" },
];

const PILGRIM_STORIES = [
  { title: "在南华寺的禅修感悟", excerpt: "晨钟暮鼓中，找到了内心的宁静。六祖慧能大师的禅法，在这里依然流传千年...", siteName: "南华寺", author: "明心", avatar: "M" },
  { title: "耶路撒冷朝圣之旅", excerpt: "走过苦路十四站，感受千年信仰的力量。圣墓教堂的烛光中，时间仿佛静止...", siteName: "耶路撒冷", author: "Peter", avatar: "P" },
  { title: "武当山问道记", excerpt: "太极拳中悟大道，紫霄宫里听松涛。道法自然，在武当山的清晨中体悟...", siteName: "武当山", author: "道心", avatar: "D" },
  { title: "菩提伽耶觉悟之旅", excerpt: "在菩提树下静坐，感受佛陀觉悟的力量。两千五百年的智慧，触手可及...", siteName: "菩提伽耶", author: "慧明", avatar: "H" },
];

const REC_TABS = ["祖庭", "祖师", "圣地"] as const;

/* ─── Sub Components ─── */

function RouteCard({ route }: { route: Route }) {
  const price = (route.priceFrom / 100).toLocaleString();
  return (
    <Link href={`/routes/${route.slug}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        <div className="relative h-44 overflow-hidden">
          {route.coverImage ? (
            <OptimizedImage src={route.coverImage} alt={route.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
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
          <h3 className="font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors line-clamp-1">{route.title}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{route.subtitle}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-gray-900 font-bold">¥{price}<span className="text-xs text-gray-400 font-normal">/人起</span></span>
            {route.rating && (
              <span className="px-1.5 py-0.5 rounded bg-[#0066FF] text-white text-xs font-bold">{route.rating.toFixed(1)}</span>
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
      <div className="relative h-48 md:h-56 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        {site.imageUrl ? (
          <OptimizedImage src={site.imageUrl} alt={site.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
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

function RecommendCard({ name, subtitle, imageUrl, href, symbol }: {
  name: string; subtitle: string; imageUrl: string | null; href: string; symbol?: string | null;
}) {
  return (
    <Link href={href} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        <div className="relative h-40 overflow-hidden">
          {imageUrl ? (
            <OptimizedImage src={imageUrl} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <span className="text-4xl opacity-40">{symbol || "🏛"}</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors text-sm line-clamp-1">{name}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{subtitle}</p>
        </div>
      </div>
    </Link>
  );
}

/* ─── Main Component ─── */

export default function HomeClient({ religions, holySites, temples, patriarchs, featuredRoutes, error }: Props) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchTab, setActiveSearchTab] = useState<string>("sites");
  const [activeRecTab, setActiveRecTab] = useState<typeof REC_TABS[number]>("祖庭");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    if (activeSearchTab === "ai") {
      window.location.href = `/chat`;
    } else if (activeSearchTab === "routes") {
      window.location.href = `/routes?q=${encodeURIComponent(q)}`;
    } else if (activeSearchTab === "wiki") {
      window.location.href = `/search?q=${encodeURIComponent(q)}&type=all`;
    } else {
      window.location.href = `/search?q=${encodeURIComponent(q)}`;
    }
  };

  const currentPlaceholder = SEARCH_TABS.find(t => t.key === activeSearchTab)?.placeholder || "";
  const destinations = holySites.slice(0, 8);

  return (
    <div className="min-h-screen bg-white">

      {/* ══════ Section 1: Hero + Tab Search ══════ */}
      <section className="relative hero-bg pt-28 pb-24 md:pt-36 md:pb-32">
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
            帮助100万人走祖庭
          </h1>
          <p className="text-white/80 text-lg md:text-xl mt-4 max-w-2xl mx-auto">
            探索全球60+文化圣地，体验千年智慧之旅
          </p>

          {/* Tab Search Card */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                {SEARCH_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveSearchTab(tab.key)}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                      activeSearchTab === tab.key
                        ? "text-[#0066FF]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                    {activeSearchTab === tab.key && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#0066FF] rounded-full" />
                    )}
                  </button>
                ))}
              </div>
              {/* Search Input */}
              <form onSubmit={handleSearch} className="flex items-center p-3 gap-2">
                <svg className="w-5 h-5 text-gray-400 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={currentPlaceholder}
                  className="flex-1 text-gray-900 placeholder-gray-400 outline-none text-sm py-2"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg font-medium transition-colors text-sm shrink-0"
                >
                  {activeSearchTab === "ai" ? "开始规划" : "搜索"}
                </button>
              </form>
            </div>
          </div>

          {/* Hot Tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {["#禅宗路线", "#耶路撒冷", "#六祖慧能", "#丝路文化", "#武当问道"].map((tag) => (
              <Link key={tag} href={`/search?q=${encodeURIComponent(tag.slice(1))}`} className="px-3 py-1.5 rounded-full text-sm bg-white/20 text-white hover:bg-white/30 transition-all backdrop-blur-sm">
                {tag}
              </Link>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-4 text-white/70 text-sm">
            <span className="flex items-center gap-1.5">⭐ 专业路线策划</span>
            <span className="hidden sm:flex items-center gap-1.5">💬 AI旅行顾问</span>
            <span className="flex items-center gap-1.5">🌍 12大文化传统</span>
          </div>
        </div>
      </section>

      {/* ══════ Section 2: Category Icons ══════ */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 grid grid-cols-4 md:grid-cols-8 gap-4">
          {CATEGORY_ICONS.map((cat) => (
            <Link key={cat.label} href={cat.href} className="flex flex-col items-center gap-2 group">
              <span className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-blue-50 group-hover:bg-[#0066FF] group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-[#0066FF] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {cat.svg}
                </svg>
              </span>
              <span className="text-xs text-gray-600 group-hover:text-[#0066FF] transition-colors text-center leading-tight font-medium">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════ Section 3: Platform Highlights ══════ */}
      <section className="mt-12 md:mt-16 max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PLATFORM_HIGHLIGHTS.map((item) => (
            <Link key={item.title} href={item.href} className="group">
              <div className="bg-white rounded-xl p-5 h-full flex flex-col justify-between border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0066FF]/20 hover:-translate-y-0.5 transition-all duration-300 min-h-[140px]">
                <div>
                  <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 mb-3">
                    <svg className="w-5 h-5 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {item.svg}
                    </svg>
                  </span>
                  <h3 className="text-gray-900 font-bold text-lg">{item.title}</h3>
                  <p className="text-gray-500 text-xs mt-1">{item.subtitle}</p>
                </div>
                <span className="text-[#0066FF] text-xs font-medium mt-3 group-hover:underline">
                  {item.cta} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════ Section 4: Pilgrim Stories UGC (对标美妙旅程) ══════ */}
      <section className="mt-14 md:mt-20 max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">朝圣故事</h2>
            <p className="text-gray-500 text-sm mt-1">来自旅行者的真实感悟</p>
          </div>
          <Link href="/journals" className="text-[#0066FF] hover:text-[#0052CC] text-sm font-medium flex items-center gap-1 transition-colors">
            查看全部 <span>→</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PILGRIM_STORIES.map((story, idx) => {
            // Match story to a real holySite image by site name
            const matchedSite = holySites.find(s => s.name.includes(story.siteName));
            const storyImage = matchedSite?.imageUrl;
            return (
              <div key={story.title} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="h-36 relative overflow-hidden">
                  {storyImage ? (
                    <OptimizedImage src={storyImage} alt={story.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    // Fallback: use the idx-th holySite image if available
                    holySites[idx]?.imageUrl ? (
                      <OptimizedImage src={holySites[idx].imageUrl!} alt={story.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )
                  )}
                  {/* Dark gradient overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {/* Author avatar overlay */}
                  <div className="absolute bottom-2 left-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#0066FF] flex items-center justify-center text-white text-[10px] font-bold shadow-sm border border-white/50">
                      {story.avatar}
                    </div>
                    <span className="text-xs text-white font-medium drop-shadow-sm">
                      {story.author}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-[#0066FF] transition-colors">{story.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{story.excerpt}</p>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {matchedSite ? `${matchedSite.country}·${matchedSite.name}` : (holySites[idx] ? `${holySites[idx].country}·${holySites[idx].name}` : story.siteName)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════ Section 5: Featured Routes ══════ */}
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

      {/* ══════ Section 6: AI Planner Showcase ══════ */}
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
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm shrink-0">👤</div>
                  <div className="bg-white/15 rounded-xl rounded-tl-sm px-4 py-2.5 text-white text-sm flex-1">
                    我想走一条禅宗路线，3-5天，预算5000以内
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm shrink-0">💬</div>
                  <div className="bg-white/15 rounded-xl rounded-tl-sm px-4 py-2.5 text-white text-sm flex-1">
                    推荐「六祖慧能路线」5天4晚，走访国恩寺→南华寺→光孝寺，起价¥3,280/人。要看详细行程吗？
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ Section 7: Popular Destinations ══════ */}
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

      {/* ══════ Section 8: Hot Recommendations Tabs (对标Trip.com推薦) ══════ */}
      {(temples.length > 0 || patriarchs.length > 0) && (
        <section className="mt-14 md:mt-20 max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">热门推荐</h2>
              <p className="text-gray-500 text-sm mt-1">探索祖庭、祖师与文化圣地</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {REC_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveRecTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeRecTab === tab
                    ? "bg-[#0066FF] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Content */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeRecTab === "祖庭" && temples.slice(0, 8).map((t) => (
              <RecommendCard
                key={t.id}
                name={t.name}
                subtitle={t.country + (t.foundingDate ? ` · ${t.foundingDate}` : "")}
                imageUrl={t.imageUrl}
                href={`/temples/${t.id}`}
                symbol={t.religion?.symbol}
              />
            ))}
            {activeRecTab === "祖师" && patriarchs.slice(0, 8).map((p) => (
              <RecommendCard
                key={p.id}
                name={p.name}
                subtitle={p.title || p.dates || ""}
                imageUrl={p.imageUrl}
                href={`/patriarchs/${p.id}`}
                symbol={p.religion?.symbol}
              />
            ))}
            {activeRecTab === "圣地" && holySites.slice(0, 8).map((s) => (
              <RecommendCard
                key={s.id}
                name={s.name}
                subtitle={s.country}
                imageUrl={s.imageUrl}
                href={`/holy-sites/${s.id}`}
                symbol={s.religion?.symbol}
              />
            ))}
          </div>
        </section>
      )}

      {/* ══════ Section 8.5: Cultural Traditions ══════ */}
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
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{r.symbol ?? "◉"}</span>
                <span className="text-xs text-gray-700 group-hover:text-[#0066FF] text-center font-medium transition-colors">{r.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══════ Section 9: Stats + CTA ══════ */}
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
