"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import EncyclopediaToolbar from "@/components/EncyclopediaToolbar";
import MobileNav from "@/components/MobileNav";
import type { Religion, Teaching } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";

// ─── Constants ───────────────────────────────────────────────────────────────

const RELIGION_ICONS: Record<string, string> = {
  佛教: "☸️", 道教: "☯️", 基督教: "✝️", 伊斯兰教: "☪️",
  印度教: "🕉️", 犹太教: "✡️", 儒教: "📜", 锡克教: "🪯",
  神道教: "⛩️", 藏传佛教: "🏔️", 巴哈伊教: "✨",
};

const LS_KEY = "teachings_bookmarks";
const PAGE_SIZE = 12;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Pick the "daily" teaching: rotate by calendar date so it changes every day. */
function getDailyTeaching(teachings: Teaching[]): Teaching | null {
  if (!teachings.length) return null;
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return teachings[dayOfYear % teachings.length];
}

/** Escape a string for use in a RegExp. */
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Wrap matching keyword with a <mark> span. Returns React nodes. */
function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// ─── Sort options hook ────────────────────────────────────────────────────────

function useSortOptions(t: (key: string) => string) {
  return [
    { value: "name-asc", label: t("teachings.sort.nameAsc") },
    { value: "name-desc", label: t("teachings.sort.nameDesc") },
    { value: "source-asc", label: t("teachings.sort.source") },
    { value: "religion", label: t("teachings.sort.religion") },
  ];
}

// ─── Bookmark button ──────────────────────────────────────────────────────────

interface BookmarkBtnProps {
  id: string;
  bookmarks: Set<string>;
  onToggle: (id: string) => void;
  savedLabel: string;
  saveLabel: string;
}

function BookmarkBtn({ id, bookmarks, onToggle, savedLabel, saveLabel }: BookmarkBtnProps) {
  const saved = bookmarks.has(id);
  return (
    <button
      aria-label={saved ? savedLabel : saveLabel}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(id);
      }}
      className={`
        p-1.5 rounded-lg transition-all
        ${saved
          ? "text-[#0066FF] bg-blue-50 hover:bg-blue-100"
          : "text-gray-300 hover:text-[#0066FF] hover:bg-blue-50"}
      `}
    >
      <svg
        className="w-4 h-4"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}

// ─── Share (copy-quote) button ────────────────────────────────────────────────

interface ShareBtnProps {
  teaching: Teaching;
  copiedLabel: string;
  shareLabel: string;
}

function ShareBtn({ teaching, copiedLabel, shareLabel }: ShareBtnProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const text = [
        `「${teaching.name}」`,
        teaching.originalText ?? "",
        teaching.sourceText ? `—— ${teaching.sourceText}` : "",
        teaching.religion?.name ? `【${teaching.religion.name}】` : "",
        "",
        "via JOINUS.COM 祖庭之旅",
      ]
        .filter(Boolean)
        .join("\n");

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard not available
      }
    },
    [teaching]
  );

  return (
    <button
      aria-label={shareLabel}
      onClick={handleCopy}
      className={`
        p-1.5 rounded-lg transition-all
        ${copied
          ? "text-green-600 bg-green-50"
          : "text-gray-300 hover:text-gray-600 hover:bg-gray-100"}
      `}
      title={copied ? copiedLabel : shareLabel}
    >
      {copied ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      )}
    </button>
  );
}

// ─── Teaching Card ────────────────────────────────────────────────────────────

interface TeachingCardProps {
  teaching: Teaching;
  readingMode: boolean;
  searchQuery: string;
  bookmarks: Set<string>;
  onBookmarkToggle: (id: string) => void;
  t: (key: string) => string;
}

function TeachingCard({
  teaching,
  readingMode,
  searchQuery,
  bookmarks,
  onBookmarkToggle,
  t,
}: TeachingCardProps) {
  const religionName = teaching.religion?.name ?? "";
  const religionIcon = teaching.religion?.symbol ?? RELIGION_ICONS[religionName] ?? "📜";
  const religionColor = teaching.religion?.color ?? "#0066FF";

  return (
    <Link key={teaching.id} href={`/teachings/${teaching.id}`}>
      <div
        className={`
          shadow-sm border border-gray-100 rounded-xl bg-white group cursor-pointer h-full flex
          hover:shadow-md hover:border-[#0066FF]/20 transition-all overflow-hidden
          ${readingMode ? "flex-col" : ""}
        `}
      >
        {/* Accent strip */}
        <div
          className={`
            flex-shrink-0 flex items-center justify-center gap-2
            ${readingMode ? "w-full flex-row px-5 pt-5 pb-0" : "w-16 flex-col py-4"}
          `}
          style={{ backgroundColor: readingMode ? "transparent" : `${religionColor}10` }}
        >
          <span className={readingMode ? "text-xl" : "text-2xl"}>{religionIcon}</span>
          <span
            className={`font-medium ${readingMode ? "text-xs" : "text-[10px]"}`}
            style={{
              color: religionColor,
              writingMode: readingMode ? "horizontal-tb" : "vertical-rl",
            }}
          >
            {religionName}
          </span>
        </div>

        {/* Content */}
        <div className={`p-5 flex-1 flex flex-col ${readingMode ? "pt-3" : ""}`}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className={`
                font-serif font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors
                ${readingMode ? "text-lg" : ""}
              `}
            >
              {highlight(teaching.name, searchQuery)}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <ShareBtn
                teaching={teaching}
                copiedLabel={t("teachings.share.copied")}
                shareLabel={t("teachings.share.button")}
              />
              <BookmarkBtn
                id={teaching.id}
                bookmarks={bookmarks}
                onToggle={onBookmarkToggle}
                savedLabel={t("teachings.bookmark.saved")}
                saveLabel={t("teachings.bookmark.save")}
              />
            </div>
          </div>

          <blockquote
            className={`
              text-gray-600 font-serif leading-relaxed flex-1 border-l-2 border-gray-200 pl-3
              ${readingMode ? "text-base line-clamp-6" : "text-sm line-clamp-3"}
            `}
          >
            {searchQuery.trim()
              ? highlight(teaching.originalText ?? "", searchQuery)
              : teaching.originalText}
          </blockquote>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            {teaching.sourceText ? (
              <span className="text-gray-400 text-xs">
                — {searchQuery.trim()
                  ? highlight(teaching.sourceText, searchQuery)
                  : teaching.sourceText}
              </span>
            ) : (
              <span />
            )}
            <span className="text-xs text-[#0066FF] opacity-0 group-hover:opacity-100 transition-opacity">
              {t("teachings.readMore")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  religions: Religion[];
  teachings: Teaching[];
  error?: boolean;
}

export default function TeachingsClient({ religions, teachings, error }: Props) {
  const { t } = useTranslation();
  const SORT_OPTIONS = useSortOptions(t);

  // Filter / search / sort state
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Feature states
  const [readingMode, setReadingMode] = useState(false);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  // Load bookmarks from localStorage (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setBookmarks(new Set(JSON.parse(raw) as string[]));
    } catch {
      // ignore
    }
  }, []);

  const handleBookmarkToggle = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Daily wisdom (rotates by calendar date)
  const dailyTeaching = useMemo(() => getDailyTeaching(teachings), [teachings]);

  // Filtered + sorted list
  const filtered = useMemo(() => {
    let result = teachings;
    if (filter) result = result.filter((td) => td.religionId === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (td) =>
          td.name.toLowerCase().includes(q) ||
          (td.originalText ?? "").toLowerCase().includes(q) ||
          (td.sourceText ?? "").toLowerCase().includes(q)
      );
    }
    if (showBookmarkedOnly) {
      result = result.filter((td) => bookmarks.has(td.id));
    }
    result = [...result].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name, "zh");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "zh");
      if (sort === "source-asc") return (a.sourceText ?? "").localeCompare(b.sourceText ?? "", "zh");
      if (sort === "religion") return (a.religion?.name ?? "").localeCompare(b.religion?.name ?? "", "zh");
      return 0;
    });
    return result;
  }, [teachings, filter, search, sort, showBookmarkedOnly, bookmarks]);

  // Show daily wisdom only when no active filters/search
  const showDailyWisdom = !filter && !search && !showBookmarkedOnly;

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">
              {t("section.allTeachings")}
            </h1>
          </div>
          <DataLoadError />
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${readingMode ? "bg-amber-50" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0066FF] mb-4">
            {t("section.allTeachings")}
          </h1>
          <p className="text-gray-500 text-lg">{t("encyclopedia.teachingsSubtitle")}</p>
          <p className="text-sm text-gray-400 mt-2">
            {t("teachings.statsLine")
              .replace("{total}", String(teachings.length))
              .replace("{religions}", String(religions.length))}
          </p>

          {/* ── Feature toggles row ──────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            {/* Reading Mode toggle */}
            <button
              onClick={() => setReadingMode((v) => !v)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                border transition-all
                ${readingMode
                  ? "bg-amber-100 text-amber-800 border-amber-300 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#0066FF]/30 hover:text-[#0066FF]"}
              `}
              aria-pressed={readingMode}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {readingMode ? t("teachings.readingMode.off") : t("teachings.readingMode.on")}
            </button>

            {/* Bookmarked only toggle */}
            <button
              onClick={() => {
                setShowBookmarkedOnly((v) => !v);
                setVisibleCount(PAGE_SIZE);
              }}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                border transition-all
                ${showBookmarkedOnly
                  ? "bg-blue-50 text-[#0066FF] border-[#0066FF]/40 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#0066FF]/30 hover:text-[#0066FF]"}
              `}
              aria-pressed={showBookmarkedOnly}
            >
              <svg
                className="w-3.5 h-3.5"
                fill={showBookmarkedOnly ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {t("teachings.bookmark.filterLabel")}
              {bookmarks.size > 0 && (
                <span className="ml-1 bg-[#0066FF] text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                  {bookmarks.size}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Daily Wisdom Banner ──────────────────────────────────────────── */}
        {showDailyWisdom && dailyTeaching && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">
                ✦ {t("teachings.dailyWisdom")}
              </span>
              <span className="text-xs text-gray-400">{t("teachings.dailyWisdomSubtitle")}</span>
            </div>
            <Link href={`/teachings/${dailyTeaching.id}`} className="block group">
              <div
                className={`
                  rounded-2xl p-8 text-white relative overflow-hidden
                  bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900
                  ${readingMode ? "from-amber-900 via-amber-800 to-amber-900" : ""}
                `}
              >
                {/* Background icon */}
                <div className="absolute top-4 right-4 text-[120px] opacity-5 select-none pointer-events-none">
                  {RELIGION_ICONS[dailyTeaching.religion?.name ?? ""] ?? "📜"}
                </div>

                <div className="relative">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-medium mb-4 border border-white/10">
                    ✨ {t("teachings.dailyFeatured")}
                  </span>

                  <h2 className="text-2xl font-serif font-bold mb-3 group-hover:text-[#66A3FF] transition-colors">
                    {dailyTeaching.name}
                  </h2>

                  <blockquote className="text-white/70 font-serif text-lg leading-relaxed line-clamp-4 border-l-2 border-white/20 pl-4">
                    {dailyTeaching.originalText}
                  </blockquote>

                  <div className="flex items-center justify-between mt-5">
                    {dailyTeaching.religion && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {dailyTeaching.religion.symbol ??
                            RELIGION_ICONS[dailyTeaching.religion.name] ??
                            "🙏"}
                        </span>
                        <span className="text-sm text-white/50">{dailyTeaching.religion.name}</span>
                        {dailyTeaching.sourceText && (
                          <span className="text-sm text-white/30">· {dailyTeaching.sourceText}</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <ShareBtn
                        teaching={dailyTeaching}
                        copiedLabel={t("teachings.share.copied")}
                        shareLabel={t("teachings.share.button")}
                      />
                      <BookmarkBtn
                        id={dailyTeaching.id}
                        bookmarks={bookmarks}
                        onToggle={handleBookmarkToggle}
                        savedLabel={t("teachings.bookmark.saved")}
                        saveLabel={t("teachings.bookmark.save")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <EncyclopediaToolbar
            religions={religions}
            selectedReligionId={filter}
            onReligionChange={(v) => {
              setFilter(v);
              setVisibleCount(PAGE_SIZE);
            }}
            searchQuery={search}
            onSearchChange={(q) => {
              setSearch(q);
              setVisibleCount(PAGE_SIZE);
            }}
            sortValue={sort}
            onSortChange={setSort}
            sortOptions={SORT_OPTIONS}
            resultCount={filtered.length}
            placeholder={t("teachings.searchPlaceholder")}
          />
          {/* Active filter pills */}
          {showBookmarkedOnly && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-gray-500">
                {t("teachings.bookmarkedOnly")}:
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[#0066FF] text-xs rounded-full border border-[#0066FF]/20">
                {t("teachings.bookmark.count").replace("{count}", String(filtered.length))}
              </span>
            </div>
          )}
        </div>

        {/* ── Teaching Cards Grid ──────────────────────────────────────────── */}
        <div
          className={`grid gap-6 ${
            readingMode
              ? "grid-cols-1 max-w-3xl mx-auto"
              : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {filtered.slice(0, visibleCount).map((teaching) => (
            <TeachingCard
              key={teaching.id}
              teaching={teaching}
              readingMode={readingMode}
              searchQuery={search}
              bookmarks={bookmarks}
              onBookmarkToggle={handleBookmarkToggle}
              t={t}
            />
          ))}
        </div>

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            {showBookmarkedOnly ? (
              <>
                <span className="text-4xl block mb-4">🔖</span>
                <p className="text-gray-700 font-medium">{t("teachings.bookmark.emptyTitle")}</p>
                <p className="text-gray-400 text-sm mt-1">{t("teachings.bookmark.emptyDesc")}</p>
                <button
                  onClick={() => setShowBookmarkedOnly(false)}
                  className="mt-4 text-sm text-[#0066FF] hover:underline"
                >
                  {t("teachings.viewAll")}
                </button>
              </>
            ) : (
              <>
                <span className="text-4xl block mb-4">📜</span>
                <p className="text-gray-500">{t("common.noResults")}</p>
                {(filter || search) && (
                  <button
                    onClick={() => {
                      setFilter(null);
                      setSearch("");
                    }}
                    className="mt-3 text-sm text-[#0066FF] hover:underline"
                  >
                    {t("teachings.clearFilters")}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Load more ────────────────────────────────────────────────────── */}
        {visibleCount < filtered.length && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              className="px-6 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              {t("teachings.loadMore").replace("{count}", String(filtered.length - visibleCount))}
            </button>
          </div>
        )}

        {/* ── CTA Banner ───────────────────────────────────────────────────── */}
        {teachings.length > 0 && !showBookmarkedOnly && (
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white p-8 text-center">
            <p className="text-xl font-serif font-bold mb-2">{t("teachings.cta.title")}</p>
            <p className="text-white/70 text-sm mb-5">{t("teachings.cta.subtitle")}</p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#0066FF] font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              {t("teachings.cta.aiPlan")}
            </Link>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
