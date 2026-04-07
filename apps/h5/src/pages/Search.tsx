import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchSearch, fetchHotKeywords, fetchSearchSuggestions, type SearchResultItem, type HotKeyword } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

const TYPE_TABS = ["all", "religion", "holySite", "temple", "patriarch", "teaching", "seal"];

const typeLinks: Record<string, (item: SearchResultItem) => string> = {
  religion: (i) => `/religions/${i.slug || i.id}`,
  holySite: (i) => `/holy-sites/${i.id}`,
  temple: (i) => `/temples/${i.id}`,
  patriarch: (i) => `/patriarchs/${i.id}`,
  teaching: (i) => `/teachings/${i.id}`,
  seal: (i) => `/seals/${i.id}`,
};

export default function Search() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hotKeys, setHotKeys] = useState<HotKeyword[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchHotKeywords().then((r) => setHotKeys(r.keywords || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSearchSuggestions(query).then((r) => setSuggestions(r.keywords || [])).catch(() => {});
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const doSearch = (q?: string) => {
    const term = (q || query).trim();
    if (!term) return;
    setQuery(term);
    setLoading(true);
    fetchSearch(term, type === "all" ? "all" : type)
      .then((r) => { setResults(r.results); setTotal(r.total); setSuggestions([]); })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  };

  const getLink = (item: SearchResultItem) => {
    const fn = typeLinks[item.type];
    return fn ? fn(item) : `/search`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search input */}
      <div className="bg-white px-4 pt-3 pb-2 border-b border-gray-100">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder={t("search.placeholder")}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="mt-1 bg-white border border-gray-100 rounded-lg shadow-sm">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => doSearch(s)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Type tabs */}
      <div className="overflow-x-auto scrollbar-hide bg-white border-b border-gray-100">
        <div className="flex gap-1 px-4 py-2 min-w-max">
          {TYPE_TABS.map((tb) => (
            <button
              key={tb}
              onClick={() => { setType(tb); if (query.trim()) doSearch(); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition ${
                type === tb ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {t(`search.tab.${tb}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3">
        {/* Hot keywords (shown when no query) */}
        {!query.trim() && !loading && results.length === 0 && hotKeys.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">{t("search.hotSearches")}</h3>
            <div className="flex flex-wrap gap-2">
              {hotKeys.map((k, i) => (
                <button
                  key={i}
                  onClick={() => doSearch(k.keyword)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600"
                >
                  {k.keyword}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : results.length === 0 && query.trim() ? (
          <EmptyState icon="🔍" message={t("search.noResults", { query })} />
        ) : results.length > 0 ? (
          <>
            <p className="text-xs text-gray-400 mb-3">{t("search.resultCount", { total: String(total) })}</p>
            <div className="space-y-2">
              {results.map((item) => (
                <Link key={`${item.type}-${item.id}`} to={getLink(item)} className="flex gap-3 bg-white rounded-xl p-3 shadow-sm">
                  {item.image && <img src={item.image} alt="" className="w-14 h-14 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 text-[9px] font-medium bg-blue-50 text-blue-600 rounded">{t(`search.type.${item.type}`)}</span>
                      {item.religion && <span className="text-[9px]" style={{ color: item.religion.color || undefined }}>{item.religion.symbol} {item.religion.name}</span>}
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mt-0.5 line-clamp-1">{item.title}</h4>
                    {item.descriptionSnippet && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.descriptionSnippet}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
