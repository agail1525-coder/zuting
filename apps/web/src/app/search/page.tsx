"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";
import {
  fetchSearch,
  fetchSearchSuggestions,
  fetchHotKeywords,
  fetchReligions,
  type SearchResultItem,
  type SearchResponse,
  type SearchSuggestion,
  type HotKeyword,
  type Religion,
} from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

const TAB_KEYS = ["all", "religion", "holy-site", "temple", "patriarch", "teaching", "seal"] as const;

const TAB_I18N_KEYS: Record<string, string> = {
  all: "search.tab.all",
  religion: "search.tab.religion",
  "holy-site": "search.tab.holySite",
  temple: "search.tab.temple",
  patriarch: "search.tab.patriarch",
  teaching: "search.tab.teaching",
  seal: "search.tab.seal",
};

const TYPE_I18N_KEYS: Record<string, string> = {
  religion: "search.type.religion",
  "holy-site": "search.type.holySite",
  temple: "search.type.temple",
  patriarch: "search.type.patriarch",
  teaching: "search.type.teaching",
  seal: "search.type.seal",
};

const TYPE_BADGE_STYLES: Record<string, string> = {
  religion: "bg-amber-50 text-amber-700 border-amber-200",
  "holy-site": "bg-emerald-50 text-emerald-700 border-emerald-200",
  temple: "bg-blue-50 text-blue-700 border-blue-200",
  patriarch: "bg-purple-50 text-purple-700 border-purple-200",
  teaching: "bg-rose-50 text-rose-700 border-rose-200",
  seal: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const COUNTRY_I18N_KEYS = [
  "search.country.china",
  "search.country.india",
  "search.country.japan",
  "search.country.israel",
  "search.country.saudiArabia",
  "search.country.turkey",
  "search.country.italy",
  "search.country.spain",
  "search.country.france",
  "search.country.germany",
  "search.country.uk",
  "search.country.cambodia",
  "search.country.myanmar",
  "search.country.indonesia",
  "search.country.nepal",
  "search.country.bhutan",
  "search.country.australia",
  "search.country.peru",
  "search.country.mexico",
  "search.country.usa",
  "search.country.palestine",
  "search.country.pakistan",
  "search.country.iraq",
] as const;

const RECENT_SEARCHES_KEY = "zuting_recent_searches";
const MAX_RECENT_SEARCHES = 8;

function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  try {
    const recent = getRecentSearches().filter((q) => q !== query);
    recent.unshift(query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_SEARCHES)));
  } catch {
    // ignore
  }
}

function removeRecentSearch(query: string) {
  try {
    const recent = getRecentSearches().filter((q) => q !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
  } catch {
    // ignore
  }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}

function getDetailHref(item: SearchResultItem | SearchSuggestion): string {
  const asResult = item as SearchResultItem;
  switch (item.type) {
    case "religion":
      return asResult.slug ? `/religions/${asResult.slug}` : `/religions`;
    case "holy-site":
      return `/holy-sites/${item.id}`;
    case "temple":
      return `/temples/${item.id}`;
    case "patriarch":
      return `/patriarchs/${item.id}`;
    case "teaching":
      return `/teachings/${item.id}`;
    case "seal":
      return `/seals/${item.id}`;
    default:
      return "/";
  }
}

// Simple "did you mean" heuristic: suggest common pinyin/english aliases
const DID_YOU_MEAN_MAP: Record<string, string> = {
  "buddhism": "佛教",
  "buddism": "佛教",
  "taoism": "道教",
  "daoism": "道教",
  "islam": "伊斯兰教",
  "christianity": "基督教",
  "hinduism": "印度教",
  "judaism": "犹太教",
  "confucianism": "儒教",
  "sikhism": "锡克教",
  "shinto": "神道教",
  "tibet": "西藏",
  "xizang": "西藏",
  "mecca": "麦加",
  "jerualem": "耶路撒冷",
  "jeruaslem": "耶路撒冷",
  "jerusalem": "耶路撒冷",
  "varanasi": "瓦拉纳西",
  "shaolin": "少林寺",
  "shaollin": "少林寺",
};

function getDidYouMean(query: string): string | null {
  const lower = query.toLowerCase().trim();
  return DID_YOU_MEAN_MAP[lower] ?? null;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const initialQ = searchParams.get("q") || "";
  const initialType = searchParams.get("type") || "all";

  const [query, setQuery] = useState(initialQ);
  const [activeType, setActiveType] = useState(initialType);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"relevance" | "name" | "popular">("relevance");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [religionId, setReligionId] = useState<string>("");
  const [country, setCountry] = useState<string>("");

  // View mode
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Search analytics
  const [searchDuration, setSearchDuration] = useState<number | null>(null);
  const searchStartRef = useRef<number>(0);

  // Hot keywords
  const [hotKeywords, setHotKeywords] = useState<HotKeyword[]>([]);
  const [hotLoading, setHotLoading] = useState(false);

  // Suggestions
  const [suggestions, setSuggestions] = useState<{ entities: SearchSuggestion[]; keywords: string[] } | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const suggestAbortRef = useRef<AbortController | null>(null);

  // Recent searches
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Religions for filter
  const [religions, setReligions] = useState<Religion[]>([]);

  // Refs
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Load religions for filter
  useEffect(() => {
    fetchReligions()
      .then(setReligions)
      .catch((err) => { console.error("Fetch religions failed:", err); });
  }, []);

  // Load hot keywords on mount
  useEffect(() => {
    setHotLoading(true);
    fetchHotKeywords()
      .then((res) => setHotKeywords(res.keywords ?? []))
      .catch(() => setHotKeywords([]))
      .finally(() => setHotLoading(false));
  }, []);

  const doSearch = useCallback(
    async (q: string, type: string, p: number, rid: string, s: string, ctry: string, sOrder: string) => {
      if (!q.trim()) {
        setResults(null);
        setError(null);
        setSearchDuration(null);
        return;
      }
      setLoading(true);
      setError(null);
      searchStartRef.current = Date.now();
      try {
        const data = await fetchSearch(
          q.trim(), type, p, 20,
          rid || undefined,
          s !== "relevance" ? s : undefined,
          ctry || undefined,
          sOrder !== "asc" ? sOrder : undefined
        );
        const elapsed = Date.now() - searchStartRef.current;
        setSearchDuration(elapsed);
        setResults(data);
        // Save to recent searches on successful result
        saveRecentSearch(q.trim());
        setRecentSearches(getRecentSearches());
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
        setResults(null);
        setSearchDuration(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Suggestions fetch with debounce + abort
  const fetchSuggestions = useCallback((q: string) => {
    if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current);
    if (q.length < 2) {
      setSuggestions(null);
      return;
    }
    suggestDebounceRef.current = setTimeout(async () => {
      if (suggestAbortRef.current) suggestAbortRef.current.abort();
      const controller = new AbortController();
      suggestAbortRef.current = controller;
      setSuggestionsLoading(true);
      try {
        const data = await fetchSearchSuggestions(q);
        if (!controller.signal.aborted) setSuggestions(data);
      } catch {
        if (!controller.signal.aborted) setSuggestions(null);
      } finally {
        if (!controller.signal.aborted) setSuggestionsLoading(false);
      }
    }, 200);
  }, []);

  // Sync URL params
  useEffect(() => {
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set("q", query.trim());
      if (activeType !== "all") params.set("type", activeType);
      if (page > 1) params.set("page", String(page));
      if (religionId) params.set("religionId", religionId);
      if (sort !== "relevance") params.set("sort", sort);
      if (sortOrder !== "asc") params.set("sortOrder", sortOrder);
      if (country) params.set("country", country);
      router.replace(`/search?${params.toString()}`, { scroll: false });
    }
  }, [query, activeType, page, religionId, sort, sortOrder, country, router]);

  // Debounced search on query/filter/sort change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      doSearch(query, activeType, 1, religionId, sort, country, sortOrder);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeType, religionId, sort, country, sortOrder, doSearch]);

  // Search on page change
  useEffect(() => {
    if (page > 1) doSearch(query, activeType, page, religionId, sort, country, sortOrder);
  }, [page, query, activeType, religionId, sort, country, sortOrder, doSearch]);

  // Update suggestions as user types
  useEffect(() => {
    fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setInputFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const totalPages = results ? Math.ceil(results.total / results.limit) : 0;

  const showRecentSearches = inputFocused && !query.trim() && recentSearches.length > 0;
  const showHotKeywords = inputFocused && !query.trim() && hotKeywords.length > 0;
  const showSuggestions = inputFocused && query.length >= 2 && (suggestionsLoading || (suggestions && (suggestions.entities.length > 0 || suggestions.keywords.length > 0)));
  const showDropdown = showRecentSearches || showHotKeywords || showSuggestions;

  const didYouMean = query.trim() && results && results.results.length === 0
    ? getDidYouMean(query.trim())
    : null;

  function applyKeyword(kw: string) {
    setQuery(kw);
    setInputFocused(false);
    setSuggestions(null);
  }

  function handleRemoveRecent(e: React.MouseEvent, kw: string) {
    e.stopPropagation();
    e.preventDefault();
    removeRecentSearch(kw);
    setRecentSearches(getRecentSearches());
  }

  function handleClearRecent(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    clearRecentSearches();
    setRecentSearches([]);
  }

  // Active filter count (for badge)
  const activeFilterCount = [religionId, country].filter(Boolean).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#0066FF] mb-2">
          {t("search.title")}
        </h1>
        <p className="text-gray-500">{t("search.subtitle")}</p>
      </div>

      {/* Search Input + Dropdown */}
      <div className="relative mb-4">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setInputFocused(false);
              setSuggestions(null);
            }
          }}
          placeholder={t("search.placeholder")}
          className="w-full pl-12 pr-24 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]/30 transition-all text-lg"
          autoFocus
          autoComplete="off"
        />

        {/* Right-side actions: clear + voice */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
          {/* Voice search placeholder (Booking.com style) */}
          <button
            type="button"
            title={t("search.voiceSearch")}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#0066FF] hover:bg-[#0066FF]/8 transition-colors"
            onClick={() => {
              // Voice search placeholder — browser Web Speech API hook point
              if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
                // future: wire up speech recognition
              }
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          {/* Clear button */}
          {query && (
            <button
              onClick={() => { setQuery(""); setResults(null); setError(null); setSuggestions(null); setSearchDuration(null); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#0066FF] hover:bg-[#0066FF]/8 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Suggestions / Hot keywords / Recent searches dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {/* Recent searches panel */}
            {showRecentSearches && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    {t("search.recentSearches")}
                  </p>
                  <button
                    onMouseDown={handleClearRecent}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {t("search.clearAll")}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((kw) => (
                    <div key={kw} className="flex items-center gap-1 group">
                      <button
                        onMouseDown={(e) => { e.preventDefault(); applyKeyword(kw); }}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-gray-50 text-gray-600 hover:bg-[#0066FF]/8 hover:text-[#0066FF] border border-gray-200 transition-colors"
                      >
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {kw}
                      </button>
                      <button
                        onMouseDown={(e) => handleRemoveRecent(e, kw)}
                        className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hot keywords panel */}
            {showHotKeywords && (
              <div className="p-4">
                <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">
                  {t("search.hotSearches")}
                </p>
                {hotLoading ? (
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-7 w-16 bg-gray-100 rounded-full animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {hotKeywords.map((hk) => (
                      <button
                        key={hk.keyword}
                        onMouseDown={(e) => { e.preventDefault(); applyKeyword(hk.keyword); }}
                        className="px-3 py-1 bg-[#0066FF]/8 text-[#0066FF] rounded-full text-sm hover:bg-[#0066FF]/15 transition-colors border border-[#0066FF]/20"
                      >
                        {hk.keyword}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Suggestions panel */}
            {showSuggestions && (
              <div>
                {suggestionsLoading && (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin" />
                  </div>
                )}
                {!suggestionsLoading && suggestions && (
                  <>
                    {/* Entity suggestions */}
                    {suggestions.entities.length > 0 && (
                      <div>
                        <p className="px-4 pt-3 pb-1 text-xs text-gray-400 font-medium uppercase tracking-wide">
                          {t("search.relatedResults")}
                        </p>
                        {suggestions.entities.map((entity) => (
                          <Link
                            key={`${entity.type}-${entity.id}`}
                            href={getDetailHref(entity)}
                            onMouseDown={() => setInputFocused(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                          >
                            {entity.image ? (
                              <OptimizedImage
                                src={entity.image}
                                alt={entity.title}
                                width={80}
                                height={80}
                                className="w-9 h-9 rounded-lg object-cover shrink-0 bg-gray-100"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                <span className="text-gray-400 text-sm">&#x1F3DB;</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 truncate font-medium">{entity.title}</p>
                              {entity.subtitle && (
                                <p className="text-xs text-gray-400 truncate">{entity.subtitle}</p>
                              )}
                            </div>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
                                TYPE_BADGE_STYLES[entity.type] || "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                            >
                              {t(TYPE_I18N_KEYS[entity.type] || `search.type.${entity.type}`)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                    {/* Keyword suggestions */}
                    {suggestions.keywords.length > 0 && (
                      <div className="border-t border-gray-100">
                        <p className="px-4 pt-3 pb-1 text-xs text-gray-400 font-medium uppercase tracking-wide">
                          {t("search.searchSuggestions")}
                        </p>
                        {suggestions.keywords.map((kw) => (
                          <button
                            key={kw}
                            onMouseDown={(e) => { e.preventDefault(); applyKeyword(kw); }}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                          >
                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="text-sm text-gray-700">{kw}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Type Tabs + Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        {/* Type tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1 scrollbar-hide">
          {TAB_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => { setActiveType(key); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all border ${
                activeType === key
                  ? "bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/30 font-semibold"
                  : "bg-white text-gray-500 border-gray-200 hover:text-[#0066FF] hover:border-[#0066FF]/20"
              }`}
            >
              {t(TAB_I18N_KEYS[key])}
            </button>
          ))}
        </div>

        {/* Right controls: Advanced Filter toggle + Sort + View mode */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Advanced Filters toggle button */}
          <button
            onClick={() => setShowAdvancedFilters((v) => !v)}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all ${
              showAdvancedFilters || activeFilterCount > 0
                ? "bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/30 font-medium"
                : "bg-white text-gray-500 border-gray-200 hover:text-[#0066FF] hover:border-[#0066FF]/20"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 4a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm3 4a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z" />
            </svg>
            {t("search.filters")}
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#0066FF] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort buttons */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => { setSort("relevance"); setPage(1); }}
              className={`px-3 py-2 text-sm transition-colors ${
                sort === "relevance"
                  ? "bg-[#0066FF]/10 text-[#0066FF] font-medium"
                  : "bg-white text-gray-500 hover:text-[#0066FF]"
              }`}
            >
              {t("search.sortRelevance")}
            </button>
            <div className="w-px bg-gray-200" />
            <button
              onClick={() => { setSort("name"); setPage(1); }}
              className={`px-3 py-2 text-sm transition-colors ${
                sort === "name"
                  ? "bg-[#0066FF]/10 text-[#0066FF] font-medium"
                  : "bg-white text-gray-500 hover:text-[#0066FF]"
              }`}
            >
              {t("search.sortName")}
            </button>
            <div className="w-px bg-gray-200" />
            <button
              onClick={() => { setSort("popular"); setPage(1); }}
              className={`px-3 py-2 text-sm transition-colors ${
                sort === "popular"
                  ? "bg-[#0066FF]/10 text-[#0066FF] font-medium"
                  : "bg-white text-gray-500 hover:text-[#0066FF]"
              }`}
            >
              {t("search.sortPopular")}
            </button>
          </div>

          {/* Sort direction toggle */}
          <button
            onClick={() => { setSortOrder((prev) => prev === "asc" ? "desc" : "asc"); setPage(1); }}
            className="px-2.5 py-2 rounded-lg text-sm border border-gray-200 bg-white text-gray-500 hover:text-[#0066FF] hover:border-[#0066FF]/30 transition-colors"
            title={sortOrder === "asc" ? t("search.sortAsc") : t("search.sortDesc")}
          >
            {sortOrder === "asc" ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h5m8-8v16m0 0l-4-4m4 4l4-4" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h9m8-8v16m0 0l-4-4m4 4l4-4" />
              </svg>
            )}
          </button>

          {/* View mode toggle (List/Grid — Airbnb style) */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              title={t("search.viewList")}
              className={`px-2.5 py-2 transition-colors ${
                viewMode === "list"
                  ? "bg-[#0066FF]/10 text-[#0066FF]"
                  : "bg-white text-gray-400 hover:text-[#0066FF]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <div className="w-px bg-gray-200" />
            <button
              onClick={() => setViewMode("grid")}
              title={t("search.viewGrid")}
              className={`px-2.5 py-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-[#0066FF]/10 text-[#0066FF]"
                  : "bg-white text-gray-400 hover:text-[#0066FF]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel (Kayak/Skyscanner style) */}
      {showAdvancedFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">{t("search.advancedFilters")}</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setReligionId(""); setCountry(""); setPage(1); }}
                className="text-xs text-red-500 hover:text-red-600 transition-colors"
              >
                {t("search.clearFilters")}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Religion filter */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">{t("search.filterByReligion")}</label>
              <select
                value={religionId}
                onChange={(e) => { setReligionId(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white text-gray-600 focus:outline-none focus:border-[#0066FF]/50 transition-colors"
              >
                <option value="">{t("search.filterAllReligions")}</option>
                {religions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.symbol ? `${r.symbol} ` : ""}{r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Country filter */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">{t("search.filterByCountry")}</label>
              <select
                value={country}
                onChange={(e) => { setCountry(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white text-gray-600 focus:outline-none focus:border-[#0066FF]/50 transition-colors"
              >
                <option value="">{t("search.filterAllCountries")}</option>
                {COUNTRY_I18N_KEYS.map((key) => (
                  <option key={key} value={t(key)}>{t(key)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">{t("search.activeFilters")}:</span>
              {religionId && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-[#0066FF]/8 text-[#0066FF] text-xs rounded-full border border-[#0066FF]/20">
                  {religions.find((r) => r.id === religionId)?.name ?? religionId}
                  <button onClick={() => setReligionId("")} className="hover:text-red-500 transition-colors">×</button>
                </span>
              )}
              {country && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-[#0066FF]/8 text-[#0066FF] text-xs rounded-full border border-[#0066FF]/20">
                  {country}
                  <button onClick={() => setCountry("")} className="hover:text-red-500 transition-colors">×</button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 opacity-30">&#x26A0;</div>
          <p className="text-red-500 text-lg">{t("search.error")}</p>
          <button
            onClick={() => doSearch(query, activeType, page, religionId, sort, country, sortOrder)}
            className="mt-4 px-6 py-2 rounded-lg border border-[#0066FF]/30 text-[#0066FF] hover:bg-[#0066FF]/10 transition-all"
          >
            {t("search.retry")}
          </button>
        </div>
      )}

      {/* Empty state - no query */}
      {!loading && !error && !query.trim() && (
        <div className="py-12">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 opacity-30">&#x1F50D;</div>
            <p className="text-gray-500 text-lg">{t("search.emptyPrompt")}</p>
          </div>

          {/* Recent searches + Hot keywords side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    {t("search.recentSearches")}
                  </h2>
                  <button
                    onClick={() => { clearRecentSearches(); setRecentSearches([]); }}
                    className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                  >
                    {t("search.clearAll")}
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.slice(0, 6).map((kw) => (
                    <button
                      key={kw}
                      onClick={() => applyKeyword(kw)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0066FF] transition-colors text-left group"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#0066FF]/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="flex-1 truncate">{kw}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hot keywords */}
            {hotKeywords.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  {t("search.hotSearches")}
                </h2>
                {hotLoading ? (
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-8 w-20 bg-gray-100 rounded-full animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {hotKeywords.map((hk, idx) => (
                      <button
                        key={hk.keyword}
                        onClick={() => applyKeyword(hk.keyword)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm border border-[#0066FF]/20 text-[#0066FF] hover:bg-[#0066FF]/8 transition-colors"
                      >
                        {idx < 3 && (
                          <span className={`text-xs font-bold ${idx === 0 ? "text-red-500" : idx === 1 ? "text-orange-500" : "text-yellow-500"}`}>
                            {idx + 1}
                          </span>
                        )}
                        {hk.keyword}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state - no results */}
      {!loading && !error && query.trim() && results && results.results.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 opacity-30">&#x1F6AB;</div>
          <p className="text-gray-500 text-lg">
            {t("search.noResults").replace("{query}", query)}
          </p>
          <p className="text-gray-400 text-sm mt-1">{t("search.noResultsHint")}</p>

          {/* Did you mean? */}
          {didYouMean && (
            <div className="mt-4">
              <p className="text-gray-500 text-sm">
                {t("search.didYouMean")}{" "}
                <button
                  onClick={() => applyKeyword(didYouMean)}
                  className="text-[#0066FF] underline underline-offset-2 hover:no-underline font-medium"
                >
                  {didYouMean}
                </button>
                {" "}?
              </p>
            </div>
          )}

          {/* Search Tips */}
          <div className="mt-8 max-w-md mx-auto bg-white border border-gray-100 rounded-2xl p-6 text-left">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {t("search.tips.title")}
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-[#0066FF]/60 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t("search.tips.broaderTerms")}
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-[#0066FF]/60 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t("search.tips.checkSpelling")}
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-[#0066FF]/60 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t("search.tips.differentFilters")}
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-[#0066FF]/60 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t("search.tips.fewerWords")}
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && !error && results && results.results.length > 0 && (
        <>
          {/* Results meta bar: count + duration + save alert concept */}
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <p className="text-gray-500 text-sm">
                {t("search.resultCount").replace("{total}", String(results.total))}
              </p>
              {searchDuration !== null && (
                <span className="text-gray-300 text-xs hidden sm:inline">
                  {t("search.searchDuration").replace("{ms}", String(searchDuration))}
                </span>
              )}
            </div>
            {/* Save Search Alert concept (Kayak style) */}
            <button
              onClick={() => {
                // Save current search params to localStorage as an alert
                try {
                  const alerts = JSON.parse(localStorage.getItem("zuting_search_alerts") ?? "[]") as { q: string; type: string; savedAt: string }[];
                  const exists = alerts.some((a) => a.q === query.trim() && a.type === activeType);
                  if (!exists) {
                    alerts.unshift({ q: query.trim(), type: activeType, savedAt: new Date().toISOString() });
                    localStorage.setItem("zuting_search_alerts", JSON.stringify(alerts.slice(0, 10)));
                  }
                } catch {
                  // ignore
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-500 hover:text-[#0066FF] hover:border-[#0066FF]/30 transition-all"
              title={t("search.saveSearch")}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {t("search.saveSearch")}
            </button>
          </div>

          {/* List view */}
          {viewMode === "list" && (
            <div className="space-y-3">
              {results.results.map((item, i) => (
                <Link
                  key={`${item.type}-${item.id}-${i}`}
                  href={getDetailHref(item)}
                  className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-[#0066FF]/30 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-4">
                    {item.image ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        <OptimizedImage
                          src={item.image}
                          alt={item.title}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg shrink-0 bg-gray-100 flex items-center justify-center">
                        {item.religion?.symbol ? (
                          <span className="text-2xl opacity-60">{item.religion.symbol}</span>
                        ) : (
                          <span className="text-2xl opacity-30">&#x1F3DB;</span>
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full border ${
                            TYPE_BADGE_STYLES[item.type] || "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          {t(TYPE_I18N_KEYS[item.type] || `search.type.${item.type}`)}
                        </span>
                        {item.religion && item.type !== "religion" && (
                          <span
                            className="px-2 py-0.5 text-xs rounded-full border"
                            style={{
                              backgroundColor: item.religion.color ? `${item.religion.color}20` : undefined,
                              borderColor: item.religion.color ? `${item.religion.color}40` : undefined,
                              color: item.religion.color || undefined,
                            }}
                          >
                            {item.religion.symbol} {item.religion.name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-gray-900 font-semibold group-hover:text-[#0066FF] transition-colors truncate">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-gray-500 text-sm truncate">{item.subtitle}</p>
                      )}
                      {item.descriptionSnippet && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{item.descriptionSnippet}</p>
                      )}
                    </div>

                    <div className="shrink-0 self-center text-gray-400 group-hover:text-[#0066FF] transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Grid view (Airbnb/TripAdvisor style) */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.results.map((item, i) => (
                <Link
                  key={`${item.type}-${item.id}-${i}`}
                  href={getDetailHref(item)}
                  className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#0066FF]/30 hover:shadow-md transition-all group"
                >
                  {/* Card image */}
                  <div className="w-full h-36 bg-gray-100 relative overflow-hidden">
                    {item.image ? (
                      <OptimizedImage
                        src={item.image}
                        alt={item.title}
                        width={400}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.religion?.symbol ? (
                          <span className="text-4xl opacity-30">{item.religion.symbol}</span>
                        ) : (
                          <span className="text-4xl opacity-20">&#x1F3DB;</span>
                        )}
                      </div>
                    )}
                    {/* Type badge overlay */}
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 text-xs rounded-full border backdrop-blur-sm ${
                        TYPE_BADGE_STYLES[item.type] || "bg-white/80 text-gray-600 border-gray-200"
                      }`}
                    >
                      {t(TYPE_I18N_KEYS[item.type] || `search.type.${item.type}`)}
                    </span>
                  </div>
                  {/* Card body */}
                  <div className="p-3">
                    <h3 className="text-gray-900 font-semibold group-hover:text-[#0066FF] transition-colors truncate text-sm">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-gray-400 text-xs truncate mt-0.5">{item.subtitle}</p>
                    )}
                    {item.religion && item.type !== "religion" && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <span className="text-xs" style={{ color: item.religion.color || undefined }}>
                          {item.religion.symbol}
                        </span>
                        <span className="text-xs text-gray-400">{item.religion.name}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-[#0066FF]/30 hover:text-[#0066FF] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {t("search.prevPage")}
              </button>
              {/* Page number buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                  const pageNum = totalPages <= 5
                    ? idx + 1
                    : page <= 3
                      ? idx + 1
                      : page >= totalPages - 2
                        ? totalPages - 4 + idx
                        : page - 2 + idx;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm border transition-all ${
                        page === pageNum
                          ? "bg-[#0066FF] text-white border-[#0066FF]"
                          : "border-gray-200 text-gray-600 hover:border-[#0066FF]/30 hover:text-[#0066FF]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-[#0066FF]/30 hover:text-[#0066FF] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {t("search.nextPage")}
              </button>
            </div>
          )}
        </>
      )}
      <MobileNav />
    </div>
  );
}
