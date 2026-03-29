"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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

const TYPE_LABEL_ZH: Record<string, string> = {
  religion: "信仰",
  "holy-site": "圣地",
  temple: "祖庭",
  patriarch: "祖师",
  teaching: "祖训",
  seal: "印",
};

const COUNTRY_OPTIONS = [
  "中国", "印度", "日本", "以色列", "沙特", "土耳其",
  "意大利", "西班牙", "法国", "德国", "英国", "柬埔寨",
  "缅甸", "印尼", "尼泊尔", "不丹", "澳大利亚", "秘鲁",
  "墨西哥", "美国", "巴勒斯坦", "巴基斯坦", "伊拉克",
] as const;

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

  // Hot keywords
  const [hotKeywords, setHotKeywords] = useState<HotKeyword[]>([]);
  const [hotLoading, setHotLoading] = useState(false);

  // Suggestions
  const [suggestions, setSuggestions] = useState<{ entities: SearchSuggestion[]; keywords: string[] } | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const suggestAbortRef = useRef<AbortController | null>(null);

  // Religions for filter
  const [religions, setReligions] = useState<Religion[]>([]);

  // Refs
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load religions for filter
  useEffect(() => {
    fetchReligions()
      .then(setReligions)
      .catch(() => {});
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
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSearch(
          q.trim(), type, p, 20,
          rid || undefined,
          s !== "relevance" ? s : undefined,
          ctry || undefined,
          sOrder !== "asc" ? sOrder : undefined
        );
        setResults(data);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
        setResults(null);
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

  const showHotKeywords = inputFocused && !query.trim() && hotKeywords.length > 0;
  const showSuggestions = inputFocused && query.length >= 2 && (suggestionsLoading || (suggestions && (suggestions.entities.length > 0 || suggestions.keywords.length > 0)));

  function applyKeyword(kw: string) {
    setQuery(kw);
    setInputFocused(false);
    setSuggestions(null);
  }

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
      <div className="relative mb-6">
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
          placeholder={t("search.placeholder")}
          className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]/30 transition-all text-lg"
          autoFocus
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults(null); setError(null); setSuggestions(null); }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#0066FF] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Suggestions / Hot keywords dropdown */}
        {(showHotKeywords || showSuggestions) && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {/* Hot keywords panel */}
            {showHotKeywords && (
              <div className="p-4">
                <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">
                  热门搜索 / Hot Searches
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
                          相关结果 / Results
                        </p>
                        {suggestions.entities.map((entity) => (
                          <Link
                            key={`${entity.type}-${entity.id}`}
                            href={getDetailHref(entity)}
                            onMouseDown={() => setInputFocused(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                          >
                            {entity.image ? (
                              <img
                                src={entity.image}
                                alt={entity.title}
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
                              {TYPE_LABEL_ZH[entity.type] || entity.type}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                    {/* Keyword suggestions */}
                    {suggestions.keywords.length > 0 && (
                      <div className="border-t border-gray-100">
                        <p className="px-4 pt-3 pb-1 text-xs text-gray-400 font-medium uppercase tracking-wide">
                          搜索建议 / Suggestions
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

      {/* Type Tabs + Religion Filter + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
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

        {/* Religion filter + Country filter + Sort */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Religion filter */}
          <select
            value={religionId}
            onChange={(e) => { setReligionId(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white text-gray-600 focus:outline-none focus:border-[#0066FF]/50 transition-colors"
          >
            <option value="">全部信仰 / All</option>
            {religions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.symbol ? `${r.symbol} ` : ""}{r.name}
              </option>
            ))}
          </select>

          {/* Country filter */}
          <select
            value={country}
            onChange={(e) => { setCountry(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white text-gray-600 focus:outline-none focus:border-[#0066FF]/50 transition-colors"
          >
            <option value="">全部国家 / Country</option>
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

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
              相关度
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
              名称
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
              热门
            </button>
          </div>

          {/* Sort direction toggle */}
          <button
            onClick={() => { setSortOrder((prev) => prev === "asc" ? "desc" : "asc"); setPage(1); }}
            className="px-2.5 py-2 rounded-lg text-sm border border-gray-200 bg-white text-gray-500 hover:text-[#0066FF] hover:border-[#0066FF]/30 transition-colors"
            title={sortOrder === "asc" ? "升序 / Ascending" : "降序 / Descending"}
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
        </div>
      </div>

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
            重试 / Retry
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

          {/* Hot keywords section below empty prompt */}
          {hotKeywords.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 max-w-2xl mx-auto">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                热门搜索 / Hot Searches
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
      )}

      {/* Empty state - no results */}
      {!loading && !error && query.trim() && results && results.results.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 opacity-30">&#x1F6AB;</div>
          <p className="text-gray-500 text-lg">
            {t("search.noResults").replace("{query}", query)}
          </p>
          <p className="text-gray-400 text-sm mt-1">{t("search.noResultsHint")}</p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && results && results.results.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 text-sm">
              {t("search.resultCount").replace("{total}", String(results.total))}
            </p>
          </div>

          <div className="space-y-3">
            {results.results.map((item, i) => (
              <Link
                key={`${item.type}-${item.id}-${i}`}
                href={getDetailHref(item)}
                className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-[#0066FF]/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Image or placeholder */}
                  {item.image ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.title}
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
                    <div className="flex items-center gap-2 mb-1">
                      {/* Type badge */}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full border ${
                          TYPE_BADGE_STYLES[item.type] || "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {t(TYPE_I18N_KEYS[item.type] || `search.type.${item.type}`)}
                      </span>
                      {/* Religion badge */}
                      {item.religion && item.type !== "religion" && (
                        <span
                          className="px-2 py-0.5 text-xs rounded-full border"
                          style={{
                            backgroundColor: item.religion.color
                              ? `${item.religion.color}20`
                              : undefined,
                            borderColor: item.religion.color
                              ? `${item.religion.color}40`
                              : undefined,
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
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {item.descriptionSnippet}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="shrink-0 self-center text-gray-400 group-hover:text-[#0066FF] transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

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
              <span className="text-gray-500 text-sm">
                {page} / {totalPages}
              </span>
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
    </div>
  );
}
