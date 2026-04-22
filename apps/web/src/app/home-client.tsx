"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";
import HomepageRecommendations from "@/components/HomepageRecommendations";
import type { Religion, HolySite, Temple, Patriarch, Route, GuideItem, QuestionItem, Teaching } from "@/lib/api";
import { fetchTrending } from "@/lib/api";

interface Props {
  religions: Religion[];
  holySites: HolySite[];
  temples: Temple[];
  patriarchs: Patriarch[];
  featuredRoutes: Route[];
  teachings: Teaching[];
  error?: boolean;
}

/* ─── Constants ─── */

function getSearchTabs(t: (key: string) => string) {
  return [
    { key: "sites", label: t("home.searchTab.sites"), placeholder: t("home.searchTab.sitesPlaceholder") },
    { key: "routes", label: t("home.searchTab.routes"), placeholder: t("home.searchTab.routesPlaceholder") },
    { key: "ai", label: t("home.searchTab.ai"), placeholder: t("home.searchTab.aiPlaceholder") },
    { key: "wiki", label: t("home.searchTab.wiki"), placeholder: t("home.searchTab.wikiPlaceholder") },
  ] as const;
}

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

function getCategoryIcons(t: (key: string) => string) {
  return [
    { label: t("home.category.zen"), svg: CategorySvg.zen, href: "/holy-sites?category=ZEN" },
    { label: t("home.category.buddhist"), svg: CategorySvg.buddhist, href: "/holy-sites?category=BUDDHIST" },
    { label: t("home.category.taoist"), svg: CategorySvg.taoist, href: "/holy-sites?category=TAOIST" },
    { label: t("home.category.christian"), svg: CategorySvg.christian, href: "/holy-sites?category=CHRISTIAN" },
    { label: t("home.category.islamic"), svg: CategorySvg.islamic, href: "/holy-sites?category=ISLAMIC" },
    { label: t("home.category.crossCultural"), svg: CategorySvg.cross, href: "/holy-sites?category=CROSS_CULTURAL" },
    { label: t("home.category.aiPlanning"), svg: CategorySvg.ai, href: "/chat" },
    { label: t("home.category.wiki"), svg: CategorySvg.book, href: "/religions" },
  ];
}

function getCategoryLabels(t: (key: string) => string): Record<string, string> {
  return {
    ZEN: t("home.categoryLabel.zen"), BUDDHIST: t("home.categoryLabel.buddhist"),
    TAOIST: t("home.categoryLabel.taoist"), CHRISTIAN: t("home.categoryLabel.christian"),
    ISLAMIC: t("home.categoryLabel.islamic"), CROSS_CULTURAL: t("home.categoryLabel.crossCultural"),
    HINDU: t("home.categoryLabel.hindu"),
  };
}

function getExploreTabs(t: (key: string) => string) {
  return [
    { key: "all", label: t("home.exploreTab.all") },
    { key: "buddhism", label: t("home.exploreTab.buddhism") },
    { key: "taoism", label: t("home.exploreTab.taoism") },
    { key: "christianity", label: t("home.exploreTab.christianity") },
    { key: "islam", label: t("home.exploreTab.islam") },
    { key: "hinduism", label: t("home.exploreTab.hinduism") },
  ];
}

const RELIGION_KEYWORD_MAP: Record<string, string[]> = {
  buddhism: ["佛", "buddhis", "禅", "zen"],
  taoism: ["道", "taois"],
  christianity: ["基督", "christian", "天主", "catholi"],
  islam: ["伊斯兰", "islam", "穆斯林", "muslim"],
  hinduism: ["印度", "hindu"],
};

/* ─── Sub Components ─── */

function RouteCard({ route, t }: { route: Route; t: (key: string) => string }) {
  const price = ((route.priceFrom ?? 0) / 100).toLocaleString();
  const categoryLabels = getCategoryLabels(t);
  return (
    <Link href={`/holy-sites/routes/${route.slug}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
        <div className="relative h-52 overflow-hidden">
          {route.coverImage ? (
            <OptimizedImage src={route.coverImage} alt={route.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-600">
              {categoryLabels[route.category] ?? route.category} · {route.duration ?? 0}{t("home.days")}{route.nights ?? 0}{t("home.nights")}
            </span>
          </div>
          {/* Booking.com style: booking count badge */}
          {(route.bookCount ?? 0) > 0 && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white">
                {route.bookCount}+ {t("home.booked")}
              </span>
            </div>
          )}
          {/* Free cancellation badge (Booking.com) */}
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-600 text-white">
              {t("home.freeCancellation")}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{route.title}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{route.subtitle}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-gray-900 font-bold">¥{price}<span className="text-xs text-gray-500 font-normal">{t("home.perPerson")}</span></span>
            <div className="flex items-center gap-1.5">
              {typeof route.rating === "number" && route.rating > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-xs font-bold">{route.rating.toFixed(1)}</span>
              )}
              {(route.reviewCount ?? 0) > 0 && (
                <span className="text-xs text-gray-400">{route.reviewCount}{t("home.reviews")}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FlashDealBanner({ routes, t }: { routes: Route[]; t: (key: string) => string }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const dealRoutes = useMemo(() => (routes || []).slice(0, 3), [routes]);

  useEffect(() => {
    function calcRemaining() {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      return {
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      };
    }
    setTimeLeft(calcRemaining());
    const timer = setInterval(() => setTimeLeft(calcRemaining()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (dealRoutes.length === 0) return null;

  return (
    <section className="py-12 max-w-6xl mx-auto px-4">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <h2 className="text-base font-bold text-gray-900">{t("home.flashDeal.title")}</h2>
            <span className="text-xs text-gray-500">{t("home.flashDeal.subtitle")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">{t("home.flashDeal.remaining")}</span>
            <span className="text-sm font-mono font-bold text-gray-900">
              {String(timeLeft.h).padStart(2, "0")}:{String(timeLeft.m).padStart(2, "0")}:{String(timeLeft.s).padStart(2, "0")}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {dealRoutes.map((route) => {
            const price = Math.round((route.priceFrom ?? 0) / 100);
            return (
              <Link key={route.id} href={`/holy-sites/routes/${route.slug}`} className="group p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                    {route.coverImage ? (
                      <OptimizedImage src={route.coverImage} alt={route.title} width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 line-clamp-1 group-hover:text-blue-600">{route.title}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{route.duration ?? 0}{t("home.days")}{route.nights ?? 0}{t("home.nights")}</p>
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="font-bold text-gray-900">¥{price.toLocaleString()}{t("home.perPerson")}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="text-center py-3 border-t border-gray-100">
          <Link href="/promotions" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
            {t("home.flashDeal.viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function DestinationCard({ site }: { site: HolySite }) {
  return (
    <Link href={`/holy-sites/${site.id}`} className="group">
      <div className="relative h-56 md:h-64 rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300">
        {site.imageUrl ? (
          <OptimizedImage src={site.imageUrl} alt={site.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg">{site.name}</h3>
          <p className="text-white/80 text-sm">{site.country}</p>
        </div>
      </div>
    </Link>
  );
}

/* ─── Social Proof Ticker (vertical slide-up, 10s interval) ─── */

const TICKER_MESSAGES_KEYS = [
  "home.socialProof",
  "home.socialProof2",
  "home.socialProof3",
  "home.socialProof4",
];

function SocialProofTicker({ t }: { t: (key: string) => string }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % TICKER_MESSAGES_KEYS.length);
        setIsAnimating(false);
      }, 500);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border-b border-gray-100 py-2 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative h-5 overflow-hidden flex justify-center">
          <div
            className={`flex items-center gap-2 text-sm text-gray-500 absolute transition-all duration-500 ease-in-out ${
              isAnimating ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
            <span>{t(TICKER_MESSAGES_KEYS[currentIdx])}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export default function HomeClient({ religions, holySites, temples, patriarchs, featuredRoutes, teachings, error }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchTab, setActiveSearchTab] = useState<string>("sites");
  const [trendingGuides, setTrendingGuides] = useState<GuideItem[]>([]);
  const [trendingQuestions, setTrendingQuestions] = useState<QuestionItem[]>([]);
  const [exploreTab, setExploreTab] = useState("all");
  const [recentlyViewed, setRecentlyViewed] = useState<Array<{ id: string; name: string; type: string; image?: string }>>([]);

  useEffect(() => {
    fetchTrending()
      .then((data) => {
        if (Array.isArray(data?.hotGuides)) setTrendingGuides(data.hotGuides.slice(0, 4));
        if (Array.isArray(data?.hotQuestions)) setTrendingQuestions(data.hotQuestions.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  // Recently Viewed (Airbnb style) — read from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("zuting_recently_viewed");
      if (stored) setRecentlyViewed(JSON.parse(stored).slice(0, 4));
    } catch { /* ignore */ }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    if (activeSearchTab === "ai") {
      window.location.href = `/chat`;
    } else if (activeSearchTab === "routes") {
      window.location.href = `/holy-sites?q=${encodeURIComponent(q)}`;
    } else if (activeSearchTab === "wiki") {
      window.location.href = `/search?q=${encodeURIComponent(q)}&type=all`;
    } else {
      window.location.href = `/search?q=${encodeURIComponent(q)}`;
    }
  };

  const searchTabs = useMemo(() => getSearchTabs(t), [t]);
  const categoryIcons = useMemo(() => getCategoryIcons(t), [t]);
  const exploreTabs = useMemo(() => getExploreTabs(t), [t]);
  const currentPlaceholder = searchTabs.find(tab => tab.key === activeSearchTab)?.placeholder || "";
  // 首页优先展示有深度内容（photoStory / 多图画廊）的旗舰圣地,其余按默认顺序兜底
  // HOME_BLOCKLIST: 图片质量不达标的圣地,首页所有卡片场景统一过滤,待补图后解除
  const HOME_BLOCKLIST = useMemo(() => new Set<string>(["万松书院"]), []);
  const destinations = useMemo(() => {
    const arr = (holySites || []).filter((s) => !HOME_BLOCKLIST.has(s.name));
    const weight = (s: HolySite) => {
      const photoN = Array.isArray(s.photoStory) ? s.photoStory.length : 0;
      const galleryN = Array.isArray(s.galleryImages) ? s.galleryImages.length : 0;
      return photoN * 10 + galleryN;
    };
    return [...arr].sort((a, b) => weight(b) - weight(a)).slice(0, 8);
  }, [holySites, HOME_BLOCKLIST]);
  const safeTemples = temples || [];
  const safePatriarchs = patriarchs || [];
  const safeReligions = religions || [];
  const safeTeachings = teachings || [];

  // Explore by category — filter holySites + temples by religion keyword
  const exploreItems = useMemo(() => {
    const filteredHolySites = (holySites || []).filter((s) => !HOME_BLOCKLIST.has(s.name));
    const filteredTemples = safeTemples.filter((t) => !HOME_BLOCKLIST.has(t.name));
    const allItems = [
      ...filteredHolySites.map(s => ({ id: s.id, name: s.name, image: s.imageUrl, subtitle: s.country || "", type: "holy-site" as const, religionName: s.religion?.name || "" })),
      ...filteredTemples.map(t => ({ id: t.id, name: t.name, image: t.imageUrl, subtitle: t.country || "", type: "temple" as const, religionName: t.religion?.name || "" })),
    ];
    if (exploreTab === "all") return allItems.slice(0, 8);
    const keywords = RELIGION_KEYWORD_MAP[exploreTab] || [];
    const filtered = allItems.filter(item => keywords.some(kw => item.religionName.toLowerCase().includes(kw)));
    return filtered.length > 0 ? filtered.slice(0, 8) : allItems.slice(0, 8);
  }, [holySites, safeTemples, exploreTab, HOME_BLOCKLIST]);

  // Random teaching for "Daily Wisdom"
  const dailyTeaching = useMemo(() => {
    if (safeTeachings.length === 0) return null;
    const dayIndex = new Date().getDate() % safeTeachings.length;
    return safeTeachings[dayIndex];
  }, [safeTeachings]);

  return (
    <div className="min-h-screen bg-white">

      {/* ══════ Error Banner ══════ */}
      {error && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-red-700">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{t("home.loadError")}</span>
          </div>
        </div>
      )}

      {/* ══════ Section 1: Hero + Search + Category Nav ══════ */}
      <section className="relative hero-bg pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          {/* Personalized Greeting (Trip.com style) */}
          {user && (
            <p className="text-white/60 text-sm mb-2">{t("home.greeting", { name: user.nickname })}</p>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white tracking-tight">
            {t("home.heroTitle")}
          </h1>
          <p className="text-white/80 text-lg md:text-xl mt-4 max-w-2xl mx-auto">
            {t("home.heroSubtitle")}
          </p>

          {/* Search Card */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] overflow-hidden">
              <div className="flex border-b border-gray-100">
                {searchTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveSearchTab(tab.key)}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                      activeSearchTab === tab.key
                        ? "text-blue-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab.label}
                    {activeSearchTab === tab.key && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-blue-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
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
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm shrink-0"
                >
                  {activeSearchTab === "ai" ? t("home.startPlanning") : t("home.search")}
                </button>
              </form>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-6">
            {categoryIcons.map((cat) => (
              <Link key={cat.label} href={cat.href} className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{cat.svg}</svg>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>

          <p className="text-white/50 text-xs mt-5">
            {t("home.heroTagline")}
          </p>
        </div>
      </section>

      {/* ══════ Social Proof Ticker — Vertical Slide-Up ══════ */}
      <SocialProofTicker t={t} />

      {/* ══════ Seasonal Banner (Agoda style) ══════ */}
      <div className="max-w-6xl mx-auto px-4 mt-2 relative z-10 mb-6">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="cherry blossom">&#127800;</span>
            <div>
              <p className="font-bold text-gray-900 text-sm">{t("home.seasonalTitle")}</p>
              <p className="text-xs text-gray-500">{t("home.seasonalDesc")}</p>
            </div>
          </div>
          <Link href="/holy-sites#routes" className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors shrink-0">
            {t("home.seasonalCta")}
          </Link>
        </div>
      </div>

      {/* ══════ Section 2: Featured Routes ══════ */}
      {(featuredRoutes || []).length > 0 && (
        <section className="py-14 max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">{t("home.featuredRoutes")}</h2>
              <p className="text-base text-gray-500 mt-2">{t("home.featuredRoutesDesc")}</p>
            </div>
            <Link href="/holy-sites#routes" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
              {t("home.viewAll")} →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(featuredRoutes || []).slice(0, 8).map((route) => (
              <RouteCard key={route.id} route={route} t={t} />
            ))}
          </div>
        </section>
      )}

      {/* ══════ Section 2.5: Team Culture B2B Banner ══════ */}
      <section className="py-14 max-w-6xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3264ff] via-[#4a7aff] to-[#1e4dcc] shadow-2xl shadow-blue-200">
          {/* Decorative gradient orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative grid lg:grid-cols-2 gap-8 p-8 md:p-12">
            {/* Left: Copy */}
            <div className="flex flex-col justify-center">
              <span className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white/15 border border-white/30 text-white text-xs font-semibold mb-4">
                ✨ {t("teamCulture.homeBadge")}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {t("teamCulture.heroTitle")}
              </h2>
              <p className="text-lg text-white/90 mb-3">{t("teamCulture.heroKicker")}</p>
              <p className="text-sm md:text-base text-white/80 mb-6 leading-relaxed">
                {t("teamCulture.heroSubtitle")}
              </p>

              {/* Org type tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  "teamCulture.orgEnterpriseLabel",
                  "teamCulture.orgExecutiveLabel",
                  "teamCulture.orgFamilyOfficeLabel",
                  "teamCulture.orgNGOLabel",
                  "teamCulture.orgGovernmentLabel",
                ].map((k) => (
                  <span
                    key={k}
                    className="px-3 py-1 rounded-md bg-white/10 border border-white/30 text-white text-xs"
                  >
                    {t(k)}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/team-culture"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#3264ff] font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20 hover:-translate-y-0.5"
                >
                  {t("teamCulture.ctaInquiry")} →
                </Link>
                <Link
                  href="/team-culture#cases"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 hover:border-white/60 transition-all"
                >
                  {t("teamCulture.ctaCases")}
                </Link>
              </div>
            </div>

            {/* Right: Feature cards */}
            <div className="grid gap-4 content-center">
              {[
                { icon: "🎯", titleKey: "teamCulture.homeFeature1", descKey: "teamCulture.homeFeature1Desc" },
                { icon: "🌍", titleKey: "teamCulture.homeFeature2", descKey: "teamCulture.homeFeature2Desc" },
                { icon: "✨", titleKey: "teamCulture.homeFeature3", descKey: "teamCulture.homeFeature3Desc" },
              ].map((f) => (
                <div
                  key={f.titleKey}
                  className="flex items-start gap-4 p-5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/15 hover:border-white/40 transition-all"
                >
                  <span className="text-3xl flex-shrink-0">{f.icon}</span>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{t(f.titleKey)}</h3>
                    <p className="text-white/75 text-sm">{t(f.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ Section 3: Explore by Category ══════ */}
      {exploreItems.length > 0 && (
        <section className="py-14 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">{t("home.exploreByTradition")}</h2>
                <p className="text-base text-gray-500 mt-2">{t("home.exploreByTraditionDesc")}</p>
              </div>
              <Link href="/holy-sites" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors hidden md:block">
                {t("home.viewAll")} →
              </Link>
            </div>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {exploreTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setExploreTab(tab.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    exploreTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {exploreItems.map((item) => (
                <Link key={`${item.type}-${item.id}`} href={`/${item.type === "temple" ? "temples" : "holy-sites"}/${item.id}`} className="group">
                  <div className="relative h-48 md:h-56 rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300">
                    {item.image ? (
                      <OptimizedImage src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-bold">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-white/70 text-xs">{item.subtitle}</span>
                        <span className="text-white/50 text-xs">·</span>
                        <span className="text-white/70 text-xs">{item.type === "temple" ? t("home.temple") : t("home.holySite")}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════ Section 4: Flash Deals ══════ */}
      <FlashDealBanner routes={featuredRoutes} t={t} />

      {/* ══════ Section 5: AI Planner Banner ══════ */}
      <section className="py-14 max-w-6xl mx-auto px-4">
        <div className="rounded-2xl overflow-hidden hero-bg">
          <div className="flex flex-col md:flex-row items-center p-8 md:p-12 gap-8">
            <div className="flex-1">
              <span className="text-white/60 text-xs font-medium tracking-wider uppercase">{t("home.aiPlannerLabel")}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 tracking-tight">{t("home.aiTitle")}</h2>
              <p className="text-white/80 mt-3 text-base leading-relaxed">
                {t("home.aiDesc")}
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg transition-all hover:bg-gray-50 shadow-lg"
              >
                {t("home.startAI")}
              </Link>
            </div>
            <div className="flex-1 max-w-md">
              <div className="bg-white/95 backdrop-blur rounded-xl p-5 space-y-3 shadow-xl">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div className="bg-gray-50 rounded-lg rounded-tl-sm px-3 py-2 text-gray-900 text-sm flex-1">
                    {t("home.chatDemo.userMsg")}
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <div className="bg-gray-50 rounded-lg rounded-tl-sm px-3 py-2 text-gray-900 text-sm flex-1">
                    {t("home.chatDemo.aiMsg")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ Section 6: Popular Destinations ══════ */}
      {destinations.length > 0 && (
        <section className="py-14 max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">{t("home.popularDest")}</h2>
              <p className="text-base text-gray-500 mt-2">{t("home.popularDestDesc")}</p>
            </div>
            <Link href="/holy-sites" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
              {t("home.viewAll")} →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {destinations.map((site) => (
              <DestinationCard key={site.id} site={site} />
            ))}
          </div>
        </section>
      )}

      {/* ══════ Section 7: Temples & Patriarchs ══════ */}
      {(safeTemples.length > 0 || safePatriarchs.length > 0) && (
        <section className="py-14 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">{t("home.templesAndPatriarchs")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Temples column */}
              {safeTemples.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{t("home.famousTemples")}</h3>
                    <Link href="/temples" className="text-blue-600 hover:text-blue-700 text-sm font-medium">{t("home.viewAll")} →</Link>
                  </div>
                  <div className="space-y-3">
                    {safeTemples.slice(0, 5).map((temple) => (
                      <Link key={temple.id} href={`/temples/${temple.id}`} className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all group">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {temple.imageUrl ? (
                            <OptimizedImage src={temple.imageUrl} alt={temple.name} width={56} height={56} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{temple.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{temple.country}{temple.religion?.name ? ` · ${temple.religion.name}` : ""}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {/* Patriarchs column */}
              {safePatriarchs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{t("home.historicPatriarchs")}</h3>
                    <Link href="/patriarchs" className="text-blue-600 hover:text-blue-700 text-sm font-medium">{t("home.viewAll")} →</Link>
                  </div>
                  <div className="space-y-3">
                    {safePatriarchs.slice(0, 5).map((p) => (
                      <Link key={p.id} href={`/patriarchs/${p.id}`} className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all group">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 shrink-0">
                          {p.imageUrl ? (
                            <OptimizedImage src={p.imageUrl} alt={p.name} width={56} height={56} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{p.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.title || (p.religion?.name ?? "")}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════ Section 8: Personalized Recommendations ══════ */}
      <HomepageRecommendations />

      {/* ══════ Section 9: Community Showcase ══════ */}
      {(trendingGuides.length > 0 || trendingQuestions.length > 0) && (
        <section className="py-14 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">{t("home.communityUpdates")}</h2>
                <p className="text-base text-gray-500 mt-2">{t("home.communityUpdatesDesc")}</p>
              </div>
              <Link href="/community" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                {t("home.enterCommunity")} →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Guides column */}
              {trendingGuides.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{t("home.hotGuides")}</h3>
                  <div className="space-y-3">
                    {trendingGuides.map((guide) => (
                      <Link key={guide.id} href={`/guides/${guide.id}`} className="flex gap-3 p-3 bg-white rounded-xl hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all group">
                        <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {guide.coverImage ? (
                            <OptimizedImage src={guide.coverImage} alt={guide.title} width={80} height={64} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{guide.title}</h4>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                            <span>{guide.user?.nickname || t("home.traveler")}</span>
                            <span className="flex items-center gap-0.5">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              {(guide.viewCount ?? 0).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                              {guide.likeCount ?? 0}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {/* Questions column */}
              {trendingQuestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{t("home.hotQuestions")}</h3>
                  <div className="space-y-3">
                    {trendingQuestions.map((q) => (
                      <Link key={q.id} href={`/questions/${q.id}`} className="block p-4 bg-white rounded-xl hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all group">
                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{q.title}</h4>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                            {q.answerCount ?? 0} {t("home.answers")}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            {(q.viewCount ?? 0).toLocaleString()} {t("home.views")}
                          </span>
                          {Array.isArray(q.tags) && q.tags.length > 0 && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-500">{q.tags[0]}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════ Testimonials (AmEx Travel style) ══════ */}
      <section className="py-14 max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t("home.testimonials")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {([1, 2, 3] as const).map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-amber-400">&#9733;</span>
                ))}
              </div>
              <p className="text-gray-600 text-sm italic leading-relaxed">&ldquo;{t(`home.testimonial${i}.text`)}&rdquo;</p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {(t(`home.testimonial${i}.name`) || "?")[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t(`home.testimonial${i}.name`)}</p>
                  <p className="text-xs text-gray-500">{t(`home.testimonial${i}.route`)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ Trust & Guarantee Badges (Booking.com/AmEx style) ══════ */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🛡️", title: t("home.trust.secureBooking"), desc: t("home.trust.secureBookingDesc") },
              { icon: "💯", title: t("home.trust.bestPrice"), desc: t("home.trust.bestPriceDesc") },
              { icon: "🔄", title: t("home.trust.freeCancel"), desc: t("home.trust.freeCancelDesc") },
              { icon: "🎧", title: t("home.trust.support"), desc: t("home.trust.supportDesc") },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <span className="text-3xl block mb-2">{item.icon}</span>
                <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ Section 10: Trending Guides (visual cards) ══════ */}
      {trendingGuides.length > 0 && (
        <section className="py-14 max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">{t("home.travelJournals")}</h2>
              <p className="text-base text-gray-500 mt-2">{t("home.travelJournalsDesc")}</p>
            </div>
            <Link href="/community" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
              {t("home.viewMore")} →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trendingGuides.map((guide) => (
              <Link key={guide.id} href={`/guides/${guide.id}`} className="group">
                <div className="bg-white rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    {guide.coverImage ? (
                      <OptimizedImage src={guide.coverImage} alt={guide.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-2 left-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-gray-900 text-[10px] font-bold">
                        {(guide.user?.nickname || "U")[0]}
                      </div>
                      <span className="text-xs text-white font-medium drop-shadow-sm">
                        {guide.user?.nickname || t("home.traveler")}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{guide.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        {(guide.viewCount ?? 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        {guide.likeCount ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══════ Section 11: Daily Wisdom ══════ */}
      {dailyTeaching && (
        <section className="py-14 max-w-6xl mx-auto px-4">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center">
            <span className="text-sm text-gray-400 tracking-widest uppercase font-medium">{t("home.dailyWisdom")}</span>
            <blockquote className="text-xl md:text-2xl font-serif text-gray-900 mt-4 leading-relaxed max-w-3xl mx-auto">
              &ldquo;{dailyTeaching.originalText}&rdquo;
            </blockquote>
            {dailyTeaching.sourceText && (
              <p className="text-gray-500 mt-3 text-sm">— {dailyTeaching.sourceText}{dailyTeaching.religion?.name ? ` · ${dailyTeaching.religion.name}` : ""}</p>
            )}
            <Link href="/teachings" className="inline-block mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
              {t("home.exploreMoreWisdom")} →
            </Link>
          </div>
        </section>
      )}

      {/* ══════ Section 12: App Download Banner ══════ */}
      <section className="py-10 max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl p-6 shadow-sm border border-gray-100 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{t("home.downloadApp")}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{t("home.downloadAppDesc")}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="#" className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              App Store
            </Link>
            <Link href="#" className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
              Google Play
            </Link>
          </div>
        </div>
      </section>

      {/* ══════ Section 13: Cultural Traditions ══════ */}
      {safeReligions.length > 0 && (
        <section className="py-14 max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">{t("home.traditions")}</h2>
            <Link href="/religions" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
              {t("home.wikiLink")} →
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {safeReligions.map((r) => (
              <Link
                key={r.id}
                href={`/religions/${r.slug}`}
                className="flex flex-col items-center gap-2.5 p-5 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{r.symbol ?? "◉"}</span>
                <span className="text-sm text-gray-600 group-hover:text-blue-600 text-center font-medium transition-colors">{r.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══════ Section 14: Trust & Partners ══════ */}
      <section className="py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">100,000+</p>
              <p className="text-sm text-gray-500 mt-1">{t("home.trust.registeredUsers")}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">5,000+</p>
              <p className="text-sm text-gray-500 mt-1">{t("home.trust.realReviews")}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">98%</p>
              <p className="text-sm text-gray-500 mt-1">{t("home.trust.positiveRate")}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">7×24</p>
              <p className="text-sm text-gray-500 mt-1">{t("home.trust.supportOnline")}</p>
            </div>
          </div>
          {/* Payment methods */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 items-center">
            {[t("home.payment.wechat"), t("home.payment.alipay"), "Visa", "Mastercard", t("home.payment.unionpay")].map((name) => (
              <span key={name} className="text-xs text-gray-400 font-medium px-3 py-1.5 bg-gray-50 rounded-md">{name}</span>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            {t("home.trust.securityInfo")}
          </p>
        </div>
      </section>

      {/* ══════ Recently Viewed (Airbnb style) ══════ */}
      {recentlyViewed.length > 0 && (
        <section className="py-14 max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("home.recentlyViewed")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentlyViewed.map((item) => (
              <Link key={item.id} href={`/${item.type}/${item.id}`} className="group">
                <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="relative h-32 overflow-hidden bg-gray-50">
                    {item.image ? (
                      <OptimizedImage src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{item.type.replace("-", " ")}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══════ Section 15: Footer CTA + Newsletter ══════ */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{t("home.ctaTitle")}</h2>
          <p className="text-base text-gray-500 mt-3 max-w-lg mx-auto">
            {t("home.ctaDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link href="/holy-sites#routes" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm">
              {t("home.browseRoutes")}
            </Link>
            <Link href="/chat" className="px-8 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-colors text-sm shadow-sm">
              {t("home.aiPlan")}
            </Link>
          </div>

          {/* Newsletter */}
          <div className="mt-10 max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t("home.newsletter.emailPlaceholder")}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm shrink-0">
                {t("home.newsletter.subscribe")}
              </button>
            </div>
            <p className="text-gray-400 text-xs mt-2">{t("home.newsletter.hint")}</p>
          </div>
        </div>
      </section>

      {/* ══════ Floating AI Chat Button (Booking mobile style) ══════ */}
      <Link
        href="/chat"
        className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-[#0066FF] text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-110 transition-transform md:bottom-8"
        aria-label={t("home.aiChat")}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </Link>

      <MobileNav />
    </div>
  );
}
