"use client";

import { useState, useMemo, useCallback, useEffect, Fragment } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";
import type { Route, PaginatedRoutes } from "@/lib/api";
import { fetchRoutes } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

/* ── Lazy-load Leaflet map (SSR-safe) ── */
const RouteMapView = dynamic(() => import("./route-map-view"), { ssr: false });

/* ── Config ── */
function getCategories(t: (key: string) => string) {
  return [
    { value: "", label: t("routes.category.all"), icon: "🌏" },
    { value: "ZEN", label: t("routes.category.zen"), icon: "🏯" },
    { value: "BUDDHIST", label: t("routes.category.buddhist"), icon: "☸️" },
    { value: "TAOIST", label: t("routes.category.taoist"), icon: "☯️" },
    { value: "CHRISTIAN", label: t("routes.category.christian"), icon: "✝️" },
    { value: "ISLAMIC", label: t("routes.category.islamic"), icon: "☪️" },
    { value: "CROSS_CULTURAL", label: t("routes.category.crossCultural"), icon: "🌐" },
    { value: "HINDU", label: t("routes.category.hindu"), icon: "🕉️" },
  ];
}

function getDifficulties(t: (key: string) => string) {
  return [
    { value: "", label: t("routes.difficulty.all") },
    { value: "EASY", label: t("routes.difficulty.easy") },
    { value: "MODERATE", label: t("routes.difficulty.moderate") },
    { value: "CHALLENGING", label: t("routes.difficulty.challenging") },
  ];
}

function getDurationFilters(t: (key: string) => string) {
  return [
    { value: "", label: t("routes.duration.all") },
    { value: "1-3", label: t("routes.duration.short") },
    { value: "4-7", label: t("routes.duration.medium") },
    { value: "8+", label: t("routes.duration.long") },
  ];
}

function getSortOptions(t: (key: string) => string) {
  return [
    { value: "createdAt", label: t("routes.sort.newest") },
    { value: "price", label: t("routes.sort.priceLow") },
    { value: "price_desc", label: t("routes.sort.priceHigh") },
    { value: "rating", label: t("routes.sort.topRated") },
    { value: "duration", label: t("routes.sort.durationShort") },
    { value: "popular", label: t("routes.sort.popular") },
  ];
}

function getDifficultyLabels(t: (key: string) => string): Record<string, string> {
  return {
    EASY: t("routes.difficulty.easy"),
    MODERATE: t("routes.difficulty.moderate"),
    CHALLENGING: t("routes.difficulty.challenging"),
  };
}

function getTrustBadges(t: (key: string) => string) {
  return [
    { icon: "🛡️", text: t("routes.trust.freeCancel") },
    { icon: "💰", text: t("routes.trust.bestPrice") },
    { icon: "⚡", text: t("routes.trust.instantConfirm") },
    { icon: "👨‍🏫", text: t("routes.trust.proGuide") },
    { icon: "📱", text: t("routes.trust.eTicket") },
  ];
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  ZEN:            { bg: "bg-stone-100",   text: "text-stone-700" },
  BUDDHIST:       { bg: "bg-amber-50",    text: "text-amber-700" },
  TAOIST:         { bg: "bg-emerald-50",  text: "text-emerald-700" },
  CHRISTIAN:      { bg: "bg-blue-50",     text: "text-blue-700" },
  ISLAMIC:        { bg: "bg-green-50",    text: "text-green-700" },
  CROSS_CULTURAL: { bg: "bg-violet-50",   text: "text-violet-700" },
  HINDU:          { bg: "bg-orange-50",   text: "text-orange-700" },
  JEWISH:         { bg: "bg-indigo-50",   text: "text-indigo-700" },
  CULTURAL_HERITAGE: { bg: "bg-teal-50",  text: "text-teal-700" },
};

/* ── Skeleton card ── */
function RouteCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-[280px] h-52 md:h-auto md:min-h-[220px] bg-gray-200 shrink-0" />
        <div className="flex-1 p-5 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="flex gap-3 items-center">
            <div className="w-3 h-3 rounded-full bg-gray-200" />
            <div className="flex-1 h-px bg-gray-200" />
            <div className="w-3 h-3 rounded-full bg-gray-200" />
            <div className="flex-1 h-px bg-gray-200" />
            <div className="w-3 h-3 rounded-full bg-gray-200" />
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-24" />
            <div className="h-5 bg-gray-100 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Featured Route Card (Hot Routes Carousel) ── */
function FeaturedRouteCard({ route, t }: { route: Route; t: (key: string) => string }) {
  const sites = route.sites ?? [];
  const itinerary = route.itinerary ?? [];
  const price = (route.priceFrom / 100).toLocaleString();

  return (
    <Link href={`/routes/${route.slug}`} className="snap-center shrink-0 w-[340px] md:w-[440px]">
      <div className="relative h-[260px] rounded-2xl overflow-hidden group cursor-pointer">
        {route.coverImage ? (
          <OptimizedImage src={route.coverImage} alt={route.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-900 to-stone-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {/* Journey path dots — top area */}
        {sites.length > 0 && (
          <div className="absolute top-4 left-4 right-16 flex items-center">
            {sites.slice(0, 4).map((site, i, arr) => (
              <Fragment key={site.id}>
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white shadow" />
                  <span className="text-[9px] text-white/80 mt-0.5 max-w-[70px] truncate text-center">{site.site.name}</span>
                </div>
                {i < arr.length - 1 && <div className="flex-1 min-w-[12px] h-px border-t border-dashed border-white/40 -mt-3" />}
              </Fragment>
            ))}
            {sites.length > 4 && <span className="text-[10px] text-white/50 ml-1 -mt-3">+{sites.length - 4}</span>}
          </div>
        )}

        {/* Duration badge */}
        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
          {route.duration}{t("routes.card.daysNights").replace("{days}", String(route.duration)).replace("{nights}", String(route.nights)).replace(route.duration + "", "").trim()}
        </div>

        {/* Hot badge */}
        {route.bookCount > 30 && (
          <div className="absolute top-14 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
            🔥 {t("routes.badge.hot")}
          </div>
        )}

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-xl font-bold text-white">{route.title}</h3>
          {itinerary.length > 0 && (
            <div className="flex gap-3 mt-1.5">
              {itinerary.slice(0, 2).map((day) => (
                <span key={day.day} className="text-xs text-white/60">
                  D{day.day}: {day.title}
                </span>
              ))}
              {itinerary.length > 2 && <span className="text-xs text-white/40">...</span>}
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-amber-400">¥{price}<span className="text-xs text-white/50 font-normal">/人</span></span>
            {route.rating && (
              <span className="flex items-center gap-1 text-white text-sm">
                ★ {route.rating.toFixed(1)}
                <span className="text-white/40 text-xs">({route.reviewCount})</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Journey Route Card (Horizontal Layout) ── */
function JourneyRouteCard({
  route,
  t,
  categories,
  difficultyLabels,
  compareIds,
  onToggleCompare,
}: {
  route: Route;
  t: (key: string) => string;
  categories: ReturnType<typeof getCategories>;
  difficultyLabels: Record<string, string>;
  compareIds: string[];
  onToggleCompare: (id: string) => void;
}) {
  const price = (route.priceFrom / 100).toLocaleString();
  const categoryLabel = categories.find((c) => c.value === route.category)?.label ?? route.category;
  const colors = CATEGORY_COLORS[route.category] ?? { bg: "bg-gray-100", text: "text-gray-700" };
  const isComparing = compareIds.includes(route.id);
  const sites = route.sites ?? [];
  const itinerary = route.itinerary ?? [];

  const isBestSeller = route.bookCount > 30;
  const isTopRated = !isBestSeller && (route.rating ?? 0) >= 4.5 && route.reviewCount > 5;

  return (
    <div className="group relative">
      <Link href={`/routes/${route.slug}`} className="block">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-amber-200/50 transition-all duration-300">
          <div className="flex flex-col md:flex-row">
            {/* Image section */}
            <div className="relative md:w-[280px] h-52 md:h-auto md:min-h-[240px] shrink-0 overflow-hidden">
              {route.coverImage ? (
                <OptimizedImage src={route.coverImage} alt={route.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-800 to-stone-700 flex items-center justify-center">
                  <span className="text-5xl opacity-30">{categories.find((c) => c.value === route.category)?.icon ?? "🌏"}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/10" />

              {/* Badges */}
              {isBestSeller && (
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                  🔥 {t("routes.bestSeller")}
                </span>
              )}
              {isTopRated && (
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                  ★ {t("routes.topRated")}
                </span>
              )}

              {/* Duration overlay */}
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
                {t("routes.card.daysNights").replace("{days}", String(route.duration)).replace("{nights}", String(route.nights))}
              </div>

              {/* Hot badge */}
              {route.bookCount > 50 && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
                  {t("routes.badge.hot")}
                </div>
              )}
            </div>

            {/* Content section */}
            <div className="flex-1 p-5 flex flex-col">
              {/* Top: category + difficulty */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>{categoryLabel}</span>
                <span className="text-xs text-gray-400">{difficultyLabels[route.difficulty] ?? route.difficulty}</span>
                {route.bookCount > 10 && route.bookCount <= 50 && (
                  <span className="ml-auto px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded">
                    {t("routes.badge.weeklyBookings").replace("{count}", String(route.bookCount))}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-800 transition-colors mt-2">{route.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">{route.subtitle}</p>

              {/* Journey path visualization */}
              {sites.length > 0 && (
                <div className="mt-3 flex items-start gap-0 overflow-hidden">
                  {sites.slice(0, 5).map((site, i, arr) => (
                    <Fragment key={site.id}>
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                          i === 0 ? "bg-amber-500 border-amber-500" :
                          i === arr.length - 1 ? "bg-emerald-500 border-emerald-500" :
                          "bg-white border-amber-400"
                        }`} />
                        <span className="text-[9px] text-gray-400 mt-0.5 max-w-[60px] truncate text-center leading-tight">{site.site.name}</span>
                      </div>
                      {i < arr.length - 1 && <div className="flex-1 min-w-[12px] max-w-[40px] h-px border-t border-dashed border-amber-300 mt-[5px]" />}
                    </Fragment>
                  ))}
                  {sites.length > 5 && <span className="text-[10px] text-gray-400 ml-1 mt-0.5">+{sites.length - 5}</span>}
                </div>
              )}

              {/* Mini itinerary preview */}
              {itinerary.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {itinerary.slice(0, 3).map((day) => (
                    <span key={day.day} className="text-xs text-gray-500">
                      <span className="font-semibold text-amber-700">D{day.day}</span> {day.title}
                    </span>
                  ))}
                  {itinerary.length > 3 && <span className="text-xs text-gray-400">...</span>}
                </div>
              )}

              {/* Highlights */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {route.highlights.slice(0, 3).map((h) => (
                  <span key={h} className="px-2 py-0.5 text-xs bg-amber-50 text-amber-700 rounded border border-amber-200/50">{h}</span>
                ))}
                {route.highlights.length > 3 && <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-400 rounded">+{route.highlights.length - 3}</span>}
              </div>

              {/* Bottom: price + rating + social proof */}
              <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-400">{t("routes.card.priceFrom")}</span>
                  <span className="text-xl font-bold text-amber-800 ml-1">¥{price}</span>
                  <span className="text-xs text-gray-400">{t("routes.card.perPerson")}</span>
                </div>
                <div className="flex items-center gap-3">
                  {route.rating && (
                    <span className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 rounded text-amber-700 font-bold text-xs">
                      ★ {route.rating.toFixed(1)}
                    </span>
                  )}
                  {route.bookCount > 0 && (
                    <span className="text-xs text-gray-400">{t("routes.card.departed").replace("{count}", String(route.bookCount))}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Compare toggle */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleCompare(route.id); }}
        className={`absolute top-3 right-3 md:top-3 md:right-auto md:left-[248px] z-10 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border ${
          isComparing
            ? "bg-amber-700 text-white border-amber-700 shadow-md"
            : "bg-white/90 text-gray-600 border-gray-200 hover:border-amber-500 hover:text-amber-700 opacity-0 group-hover:opacity-100"
        }`}
      >
        {isComparing ? t("routes.compare.remove") : t("routes.compare.add")}
      </button>
    </div>
  );
}

/* ── Comparison Panel ── */
function ComparisonBar({
  routes,
  compareIds,
  t,
  difficultyLabels,
  onRemove,
  onClear,
}: {
  routes: Route[];
  compareIds: string[];
  t: (key: string) => string;
  difficultyLabels: Record<string, string>;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const compareRoutes = compareIds.map((id) => routes.find((r) => r.id === id)).filter(Boolean) as Route[];
  if (compareIds.length === 0) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 z-50">
      {expanded && (
        <div className="bg-white border-t border-gray-200 shadow-2xl max-h-[60vh] overflow-auto">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{t("routes.compare.title")}</h3>
              <button onClick={() => setExpanded(false)} className="text-sm text-gray-500 hover:text-gray-700">{t("routes.compare.close")}</button>
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: `120px repeat(${compareRoutes.length}, 1fr)` }}>
              <div />
              {compareRoutes.map((r) => (
                <div key={r.id} className="text-center">
                  <Link href={`/routes/${r.slug}`} className="text-sm font-bold text-gray-900 hover:text-amber-700 line-clamp-2">{r.title}</Link>
                  <button onClick={() => onRemove(r.id)} className="block mx-auto mt-1 text-[10px] text-red-500 hover:underline">{t("routes.compare.remove")}</button>
                </div>
              ))}
              <div className="text-xs font-medium text-gray-500 flex items-center">{t("routes.compare.price")}</div>
              {compareRoutes.map((r) => <div key={r.id} className="text-center text-sm font-bold text-amber-800">¥{(r.priceFrom / 100).toLocaleString()}</div>)}
              <div className="text-xs font-medium text-gray-500 flex items-center">{t("routes.compare.duration")}</div>
              {compareRoutes.map((r) => <div key={r.id} className="text-center text-sm text-gray-700">{r.duration}天{r.nights}晚</div>)}
              <div className="text-xs font-medium text-gray-500 flex items-center">{t("routes.compare.difficulty")}</div>
              {compareRoutes.map((r) => <div key={r.id} className="text-center text-sm text-gray-700">{difficultyLabels[r.difficulty] ?? r.difficulty}</div>)}
              <div className="text-xs font-medium text-gray-500 flex items-center">{t("routes.compare.rating")}</div>
              {compareRoutes.map((r) => <div key={r.id} className="text-center text-sm text-gray-700">{r.rating ? `★ ${r.rating.toFixed(1)}` : t("routes.compare.noRating")}</div>)}
              <div className="text-xs font-medium text-gray-500 flex items-center">{t("routes.compare.highlights")}</div>
              {compareRoutes.map((r) => (
                <div key={r.id} className="text-center">
                  <div className="flex flex-wrap justify-center gap-1">
                    {r.highlights.slice(0, 4).map((h) => <span key={h} className="px-1.5 py-0.5 text-[10px] bg-amber-50 text-amber-700 rounded">{h}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">{t("routes.compare.count").replace("{count}", String(compareIds.length))}</span>
            <div className="flex -space-x-2">
              {compareRoutes.slice(0, 3).map((r) => (
                <div key={r.id} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  {r.coverImage ? (
                    <OptimizedImage src={r.coverImage} alt={r.title} width={32} height={32} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">🌏</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClear} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5">{t("routes.compare.clear")}</button>
            <button onClick={() => setExpanded(!expanded)} className="px-4 py-2 bg-amber-700 text-white text-sm font-medium rounded-lg hover:bg-amber-800 transition-colors">
              {t("routes.compare.view")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Price Range Filter ── */
function PriceRangeFilter({
  minPrice, maxPrice, priceRange, onPriceRangeChange, onReset, t,
}: {
  minPrice: number; maxPrice: number; priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void; onReset: () => void;
  t: (key: string) => string;
}) {
  const isActive = priceRange[0] > minPrice || priceRange[1] < maxPrice;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500 font-medium">{t("routes.priceRange.label")}:</span>
      <div className="flex items-center gap-1.5">
        <input type="number" min={minPrice} max={priceRange[1]} value={priceRange[0]}
          onChange={(e) => onPriceRangeChange([Math.max(minPrice, Number(e.target.value)), priceRange[1]])}
          className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-amber-500/40" />
        <span className="text-gray-300">—</span>
        <input type="number" min={priceRange[0]} max={maxPrice} value={priceRange[1]}
          onChange={(e) => onPriceRangeChange([priceRange[0], Math.min(maxPrice, Number(e.target.value))])}
          className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-amber-500/40" />
      </div>
      <div className="hidden sm:flex items-center gap-1 flex-1 min-w-[100px] max-w-[200px]">
        <span className="text-[10px] text-gray-400">¥{minPrice.toLocaleString()}</span>
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full relative">
          <div className="absolute h-full bg-amber-600 rounded-full" style={{
            left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
            right: `${100 - ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`,
          }} />
        </div>
        <span className="text-[10px] text-gray-400">¥{maxPrice.toLocaleString()}</span>
      </div>
      {isActive && <button onClick={onReset} className="text-[10px] text-amber-700 hover:underline">{t("routes.priceRange.reset")}</button>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════════ */
interface Props {
  initialData: PaginatedRoutes;
  featuredRoutes: Route[];
  error?: boolean;
}

export default function RoutesClient({ initialData, featuredRoutes, error }: Props) {
  const { t } = useTranslation();

  const categories = useMemo(() => getCategories(t), [t]);
  const difficulties = useMemo(() => getDifficulties(t), [t]);
  const durationFilters = useMemo(() => getDurationFilters(t), [t]);
  const sortOptions = useMemo(() => getSortOptions(t), [t]);
  const difficultyLabels = useMemo(() => getDifficultyLabels(t), [t]);
  const trustBadges = useMemo(() => getTrustBadges(t), [t]);

  const [routes, setRoutes] = useState(initialData.items);
  const [total, setTotal] = useState(initialData.total);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const PAGE_SIZE = 12;

  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999]);
  const [priceInitialized, setPriceInitialized] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Hero image cycling
  const heroImages = useMemo(() => featuredRoutes.filter((r) => r.coverImage).map((r) => r.coverImage!), [featuredRoutes]);
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => setHeroIdx((i) => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const priceStats = useMemo(() => {
    if (routes.length === 0) return null;
    const prices = routes.map((r) => r.priceFrom / 100);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (!priceInitialized && min < max) {
      setPriceRange([min, max]);
      setPriceInitialized(true);
    }
    return { min, max };
  }, [routes, priceInitialized]);

  const displayRoutes = useMemo(() => {
    let items = routes;
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((r) =>
        r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q) || r.highlights.some((h) => h.toLowerCase().includes(q))
      );
    }
    if (durationFilter === "1-3") items = items.filter((r) => r.duration <= 3);
    else if (durationFilter === "4-7") items = items.filter((r) => r.duration >= 4 && r.duration <= 7);
    else if (durationFilter === "8+") items = items.filter((r) => r.duration >= 8);
    if (priceStats) {
      const [minP, maxP] = priceRange;
      if (minP > priceStats.min || maxP < priceStats.max) {
        items = items.filter((r) => { const p = r.priceFrom / 100; return p >= minP && p <= maxP; });
      }
    }
    return items;
  }, [routes, search, durationFilter, priceRange, priceStats]);

  const loadRoutes = async (cat: string, diff: string, s: string, p: number) => {
    setLoading(true);
    try {
      const data = await fetchRoutes({ category: cat || undefined, difficulty: diff || undefined, sort: s, page: p, pageSize: PAGE_SIZE });
      setRoutes(data.items);
      setTotal(data.total);
    } catch { /* keep existing */ } finally { setLoading(false); }
  };

  const handleFilter = async (newCategory?: string, newDifficulty?: string, newSort?: string) => {
    const cat = newCategory ?? category;
    const diff = newDifficulty ?? difficulty;
    const s = newSort ?? sort;
    setCategory(cat); setDifficulty(diff); setSort(s); setPage(1);
    loadRoutes(cat, diff, s, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage); loadRoutes(category, difficulty, sort, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setCategory(""); setDifficulty(""); setDurationFilter(""); setSort("createdAt"); setSearch(""); setPage(1);
    if (priceStats) setPriceRange([priceStats.min, priceStats.max]);
    loadRoutes("", "", "createdAt", 1);
  };

  const handleToggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, []);

  const hasActiveFilters = !!(category || difficulty || durationFilter || search ||
    (priceStats && (priceRange[0] > priceStats.min || priceRange[1] < priceStats.max)));

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── Hero: Cinematic ── */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {/* Background images with crossfade */}
        {heroImages.map((src, i) => (
          <div key={src} className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIdx ? "opacity-100" : "opacity-0"}`}>
            <OptimizedImage src={src} alt="" fill className="object-cover" priority={i === 0} />
          </div>
        ))}
        {heroImages.length === 0 && <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-stone-900" />

        {/* SVG journey path */}
        <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1400 600">
          <path d="M-20,400 C200,300 350,450 550,280 S850,400 1050,250 S1300,350 1420,200"
            stroke="white" strokeWidth="2" strokeDasharray="8 6" fill="none" style={{ animation: "dash 20s linear infinite" }} />
          <circle cx="200" cy="350" r="5" fill="#F59E0B" opacity="0.8" />
          <circle cx="550" cy="280" r="5" fill="#F59E0B" opacity="0.8" />
          <circle cx="850" cy="340" r="5" fill="#F59E0B" opacity="0.8" />
          <circle cx="1150" cy="260" r="5" fill="#F59E0B" opacity="0.8" />
        </svg>

        {/* Content overlay */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <span className="text-amber-400 text-sm font-medium tracking-[0.3em] uppercase mb-4">
            {t("routes.hero.eyebrow")}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white max-w-4xl leading-tight">
            {t("routes.hero.title")}
          </h1>
          <p className="text-lg text-white/70 mt-4 max-w-2xl">
            {t("routes.hero.subtitle").replace("{total}", String(total))}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 md:gap-8 mt-8 text-white/90">
            <div className="text-center">
              <div className="text-2xl font-bold">{total}+</div>
              <div className="text-xs text-white/50">{t("routes.hero.statRoutes")}</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold">6</div>
              <div className="text-xs text-white/50">{t("routes.hero.statTraditions")}</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold">15+</div>
              <div className="text-xs text-white/50">{t("routes.hero.statCountries")}</div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 animate-bounce text-white/40">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </div>
        </div>
      </section>

      {/* ── Trust Badges (dark strip) ── */}
      <div className="bg-stone-900 py-3 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {trustBadges.map((b) => (
            <span key={b.text} className="flex items-center gap-1.5 text-xs text-stone-300">
              <span>{b.icon}</span><span className="font-medium">{b.text}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Hot Routes Carousel ── */}
      {featuredRoutes.length > 0 && !hasActiveFilters && (
        <section className="relative z-20 max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <h2 className="text-2xl font-bold text-gray-900">{t("routes.featured.title")}</h2>
            </div>
            <span className="text-sm text-gray-400 hidden sm:block">{t("routes.featured.subtitle")}</span>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
            {featuredRoutes.map((route) => <FeaturedRouteCard key={route.id} route={route} t={t} />)}
          </div>
        </section>
      )}

      <main className={featuredRoutes.length > 0 && !hasActiveFilters ? "pb-24" : "pt-4 pb-24"}>
        {/* ── Category Tabs (underline style) ── */}
        <div className="max-w-7xl mx-auto px-4 mt-4 mb-4">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-gray-200">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => handleFilter(c.value, undefined, undefined)}
                className={`shrink-0 px-4 py-3 text-sm font-medium transition-all flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
                  category === c.value
                    ? "border-amber-700 text-amber-800"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Filter Toolbar (inline, no card) ── */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-3 py-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={t("routes.search.placeholder")}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
              />
            </div>

            <select value={difficulty} onChange={(e) => handleFilter(undefined, e.target.value, undefined)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30">
              {difficulties.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>

            <select value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30">
              {durationFilters.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>

            <select value={sort} onChange={(e) => handleFilter(undefined, undefined, e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30">
              {sortOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 ml-auto">
              <button onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "grid" ? "bg-white text-amber-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                {t("routes.viewGrid")}
              </button>
              <button onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "map" ? "bg-white text-amber-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                {t("routes.viewMap")}
              </button>
            </div>
          </div>

          {/* Price Range */}
          {priceStats && priceStats.min < priceStats.max && (
            <div className="pb-3 border-b border-gray-200">
              <PriceRangeFilter minPrice={priceStats.min} maxPrice={priceStats.max} priceRange={priceRange}
                onPriceRangeChange={setPriceRange} onReset={() => setPriceRange([priceStats.min, priceStats.max])} t={t} />
            </div>
          )}

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="py-2 flex items-center gap-2 text-sm">
              <span className="text-gray-400">{t("routes.filter.found").replace("{count}", String(displayRoutes.length))}</span>
              <button onClick={clearAllFilters} className="text-amber-700 hover:underline text-xs">{t("routes.filter.clearAll")}</button>
            </div>
          )}
        </div>

        {/* ── Route Grid / Map ── */}
        <div className="max-w-7xl mx-auto px-4 mt-6">
          {error && (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl block mb-3">😞</span>
              <p className="text-lg">{t("routes.error.loadFailed")}</p>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => <RouteCardSkeleton key={i} />)}
            </div>
          )}

          {!error && !loading && displayRoutes.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <span className="text-5xl block mb-4">🔍</span>
              <p className="text-lg">{t("routes.empty.title")}</p>
              <p className="text-sm text-gray-400 mt-1">{t("routes.empty.subtitle")}</p>
              <button onClick={clearAllFilters} className="mt-4 text-amber-700 hover:underline text-sm">{t("routes.empty.clearFilters")}</button>
            </div>
          )}

          {!loading && !error && viewMode === "map" && displayRoutes.length > 0 && (
            <RouteMapView routes={displayRoutes} t={t} />
          )}

          {!loading && viewMode === "grid" && displayRoutes.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {displayRoutes.map((route) => (
                <JourneyRouteCard key={route.id} route={route} t={t} categories={categories}
                  difficultyLabels={difficultyLabels} compareIds={compareIds} onToggleCompare={handleToggleCompare} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && total > PAGE_SIZE && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                {t("routes.pagination.prev")}
              </button>
              {Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === Math.ceil(total / PAGE_SIZE) || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-gray-300 mx-1">...</span>}
                    <button onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === page ? "bg-amber-700 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
                      {p}
                    </button>
                  </span>
                ))
              }
              <button onClick={() => handlePageChange(page + 1)} disabled={page >= Math.ceil(total / PAGE_SIZE)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                {t("routes.pagination.next")}
              </button>
            </div>
          )}
          {!loading && total > 0 && (
            <p className="text-center text-sm text-gray-400 mt-4">
              {t("routes.pagination.info").replace("{page}", String(page)).replace("{total}", String(total))}
            </p>
          )}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="max-w-7xl mx-auto px-4 mt-12">
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl p-8 border border-amber-200/50">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-gray-900">{t("routes.cta.title")}</h2>
                <p className="text-gray-500 text-sm mt-1">{t("routes.cta.subtitle")}</p>
              </div>
              <div className="flex gap-3">
                <Link href="/chat"
                  className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-amber-900/20 text-sm">
                  {t("routes.cta.aiCustomize")}
                </Link>
                <Link href="/packages"
                  className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors border border-gray-200 text-sm">
                  {t("routes.cta.browsePackages")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Comparison Bar */}
      <ComparisonBar routes={routes} compareIds={compareIds} t={t} difficultyLabels={difficultyLabels}
        onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))} onClear={() => setCompareIds([])} />

      <MobileNav />

      {/* CSS animation for hero SVG */}
      <style jsx global>{`
        @keyframes dash { to { stroke-dashoffset: -100; } }
      `}</style>
    </div>
  );
}
