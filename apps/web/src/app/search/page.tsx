"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchSearch, type SearchResultItem, type SearchResponse } from "@/lib/api";

const TYPE_TABS = [
  { key: "all", label: "全部", labelEn: "All" },
  { key: "religion", label: "信仰", labelEn: "Religions" },
  { key: "holy-site", label: "圣地", labelEn: "Holy Sites" },
  { key: "temple", label: "祖庭", labelEn: "Temples" },
  { key: "patriarch", label: "祖师", labelEn: "Patriarchs" },
  { key: "teaching", label: "祖训", labelEn: "Teachings" },
  { key: "seal", label: "印", labelEn: "Seals" },
];

const TYPE_BADGE_STYLES: Record<string, string> = {
  religion: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "holy-site": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  temple: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  patriarch: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  teaching: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  seal: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

const TYPE_LABELS: Record<string, string> = {
  religion: "信仰",
  "holy-site": "圣地",
  temple: "祖庭",
  patriarch: "祖师",
  teaching: "祖训",
  seal: "印",
};

function getDetailHref(item: SearchResultItem): string {
  switch (item.type) {
    case "religion":
      return item.slug ? `/religions/${item.slug}` : `/religions`;
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

  const initialQ = searchParams.get("q") || "";
  const initialType = searchParams.get("type") || "all";

  const [query, setQuery] = useState(initialQ);
  const [activeType, setActiveType] = useState(initialType);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(
    async (q: string, type: string, p: number) => {
      if (!q.trim()) {
        setResults(null);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchSearch(q.trim(), type, p, 20);
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Sync URL params
  useEffect(() => {
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set("q", query.trim());
      if (activeType !== "all") params.set("type", activeType);
      if (page > 1) params.set("page", String(page));
      router.replace(`/search?${params.toString()}`, { scroll: false });
    }
  }, [query, activeType, page, router]);

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      doSearch(query, activeType, 1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeType, doSearch]);

  // Search on page change
  useEffect(() => {
    if (page > 1) doSearch(query, activeType, page);
  }, [page, query, activeType, doSearch]);

  const totalPages = results ? Math.ceil(results.total / results.limit) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold mb-2">
          全局搜索
        </h1>
        <p className="text-temple-400">Search across religions, holy sites, temples, patriarchs, teachings, and seals</p>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-temple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入关键词搜索... / Search keywords..."
          className="w-full pl-12 pr-4 py-3.5 bg-temple-800/50 border border-gold/20 rounded-xl text-temple-100 placeholder-temple-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all text-lg"
          autoFocus
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults(null); }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-temple-400 hover:text-gold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveType(tab.key); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all border ${
              activeType === tab.key
                ? "bg-gold/20 text-gold border-gold/40 font-semibold"
                : "bg-temple-800/30 text-temple-400 border-temple-700/30 hover:text-gold hover:border-gold/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state - no query */}
      {!loading && !query.trim() && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 opacity-30">&#x1F50D;</div>
          <p className="text-temple-400 text-lg">输入关键词开始搜索</p>
          <p className="text-temple-500 text-sm mt-1">Enter keywords to start searching</p>
        </div>
      )}

      {/* Empty state - no results */}
      {!loading && query.trim() && results && results.results.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 opacity-30">&#x1F6AB;</div>
          <p className="text-temple-400 text-lg">
            未找到与 &ldquo;{query}&rdquo; 相关的结果
          </p>
          <p className="text-temple-500 text-sm mt-1">No results found. Try different keywords.</p>
        </div>
      )}

      {/* Results */}
      {!loading && results && results.results.length > 0 && (
        <>
          <p className="text-temple-400 text-sm mb-4">
            共找到 <span className="text-gold font-semibold">{results.total}</span> 条结果
          </p>

          <div className="space-y-3">
            {results.results.map((item, i) => (
              <Link
                key={`${item.type}-${item.id}-${i}`}
                href={getDetailHref(item)}
                className="block bg-temple-800/30 border border-temple-700/30 rounded-xl p-4 hover:border-gold/30 hover:bg-temple-800/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Image or placeholder */}
                  {item.image ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-temple-700/30">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg shrink-0 bg-temple-700/30 flex items-center justify-center">
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
                          TYPE_BADGE_STYLES[item.type] || "bg-temple-700/30 text-temple-300 border-temple-600/30"
                        }`}
                      >
                        {TYPE_LABELS[item.type] || item.type}
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

                    <h3 className="text-temple-100 font-semibold group-hover:text-gold transition-colors truncate">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-temple-400 text-sm truncate">{item.subtitle}</p>
                    )}
                    {item.descriptionSnippet && (
                      <p className="text-temple-500 text-sm mt-1 line-clamp-2">
                        {item.descriptionSnippet}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="shrink-0 self-center text-temple-500 group-hover:text-gold transition-colors">
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
                className="px-4 py-2 rounded-lg border border-temple-700/30 text-temple-300 hover:border-gold/30 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                上一页
              </button>
              <span className="text-temple-400 text-sm">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg border border-temple-700/30 text-temple-300 hover:border-gold/30 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
