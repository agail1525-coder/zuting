"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import { fetchJournals, type JournalItem } from "@/lib/api";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";

const MOOD_EMOJI: Record<string, { emoji: string; key: string }> = {
  "觉悟": { emoji: "🪷", key: "journal.mood.awakening" },
  "平静": { emoji: "🌅", key: "journal.mood.calm" },
  "感动": { emoji: "🙏", key: "journal.mood.touched" },
  "振奋": { emoji: "⚡", key: "journal.mood.excited" },
  "喜悦": { emoji: "😊", key: "journal.mood.joy" },
  "感悟": { emoji: "💡", key: "journal.mood.insight" },
  "震撼": { emoji: "⚡", key: "journal.mood.awe" },
  "虔诚": { emoji: "🪷", key: "journal.mood.devout" },
};

function getExcerpt(content: string, maxLen = 120): string {
  if (!content) return "";
  return content.length > maxLen ? content.slice(0, maxLen) + "..." : content;
}

export default function JournalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t, locale } = useTranslation();

  const [journals, setJournals] = useState<JournalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const loadJournals = async () => {
      try {
        const res = await fetchJournals({ userId: user.id });
        setJournals(Array.isArray(res) ? res : res.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("journal.loadFailed"));
      } finally {
        setLoading(false);
      }
    };
    loadJournals();
  }, [user]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-serif">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Client-side filtering
  const displayJournals = useMemo(() => {
    let result = journals;
    if (moodFilter) result = result.filter((j) => j.mood === moodFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.content.toLowerCase().includes(q)
      );
    }
    return result;
  }, [journals, searchQuery, moodFilter]);

  // Stats
  const stats = useMemo(() => {
    const moods: Record<string, number> = {};
    let publicCount = 0;
    journals.forEach((j) => {
      if (j.mood) moods[j.mood] = (moods[j.mood] || 0) + 1;
      if (j.isPublic) publicCount++;
    });
    return { total: journals.length, publicCount, moods };
  }, [journals]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0066FF]">
            {t("journal.listTitle")}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {t("journal.listSubtitle")}
            {journals.length > 0 && (
              <span className="ml-2 text-gray-400">
                · {stats.total} 篇日志 · {stats.publicCount} 篇公开
              </span>
            )}
          </p>
        </div>
        <Link
          href="/journals/create"
          className="px-5 py-2.5 bg-[#0066FF] text-white font-semibold rounded-full text-sm hover:bg-[#0052CC] transition-colors shadow-lg shadow-[#0066FF]/20"
        >
          {t("journal.writeJournal")}
        </Link>
      </div>

      {/* Search + Mood Filter */}
      {journals.length > 0 && (
        <div className="space-y-3 mb-6">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索日志标题或内容..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setMoodFilter(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !moodFilter ? "bg-[#0066FF] text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              全部心境
            </button>
            {Object.entries(MOOD_EMOJI).map(([mood, info]) => {
              const count = stats.moods[mood] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={mood}
                  onClick={() => setMoodFilter(moodFilter === mood ? null : mood)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    moodFilter === mood ? "bg-[#0066FF] text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {info.emoji} {mood} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!error && journals.length === 0 && (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">📖</div>
          <h2 className="text-xl font-serif text-gray-700 mb-3">
            {t("journal.emptyTitle")}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {t("journal.emptyDesc")}
          </p>
          <Link
            href="/journals/create"
            className="inline-block px-6 py-3 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/30 text-[#0066FF] font-semibold hover:bg-[#0066FF]/20 transition-colors"
          >
            {t("journal.writeFirst")}
          </Link>
        </div>
      )}

      {/* Search empty */}
      {!error && journals.length > 0 && displayJournals.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p>没有找到匹配的日志</p>
          <button onClick={() => { setSearchQuery(""); setMoodFilter(null); }} className="mt-2 text-sm text-[#0066FF] hover:underline">
            清除筛选
          </button>
        </div>
      )}

      {/* Journal Cards */}
      {displayJournals.length > 0 && (
        <div className="space-y-4">
          {displayJournals.map((journal, i) => {
            const moodInfo = journal.mood ? MOOD_EMOJI[journal.mood] : null;
            const moodEmoji = moodInfo?.emoji || "📝";
            return (
              <Link
                key={journal.id}
                href={`/journals/${journal.id}`}
                className="block rounded-2xl bg-white shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Image or Emoji Placeholder */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0066FF]/10 to-gray-50 border border-gray-200 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                    {journal.images && journal.images.length > 0 ? (
                      <OptimizedImage
                        src={journal.images[0]}
                        alt={journal.title}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      moodEmoji
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-serif font-semibold text-gray-900 mb-1 truncate">
                      {journal.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
                      {getExcerpt(journal.content)}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-gray-400">
                        {formatDate(journal.createdAt)}
                      </span>
                      {journal.mood && moodInfo && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 text-[#0066FF]/80">
                          {moodInfo.emoji} {t(moodInfo.key)}
                        </span>
                      )}
                      {journal.trip && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-50 border border-gray-200 text-gray-600">
                          🗺 {journal.trip.title}
                        </span>
                      )}
                      {journal.holySite && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-50 border border-gray-200 text-gray-600">
                          🏛 {journal.holySite.name}
                        </span>
                      )}
                      {journal.isPublic && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                          {t("journal.publicTag")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      {!error && journals.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-[#0066FF]/5 to-blue-50 rounded-2xl p-6 border border-[#0066FF]/10 text-center">
          <span className="text-2xl block mb-2">🏛</span>
          <h3 className="text-base font-semibold text-gray-900">探索更多圣地，记录更多感悟</h3>
          <p className="text-gray-500 text-xs mt-1">每一次文化之旅都值得记录</p>
          <Link
            href="/holy-sites"
            className="inline-block mt-4 px-6 py-2.5 bg-[#0066FF] text-white font-semibold rounded-xl text-sm hover:bg-[#0052CC] transition-colors"
          >
            浏览圣地 →
          </Link>
        </div>
      )}
      </div>
      <MobileNav />
    </div>
  );
}
