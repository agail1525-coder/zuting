"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import { fetchJournals, type JournalItem } from "@/lib/api";

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

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0066FF]">
            {t("journal.listTitle")}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {t("journal.listSubtitle")}
          </p>
        </div>
        <Link
          href="/journals/create"
          className="px-5 py-2.5 bg-[#0066FF] text-white font-semibold rounded-full text-sm hover:bg-[#0052CC] transition-colors shadow-lg shadow-[#0066FF]/20"
        >
          {t("journal.writeJournal")}
        </Link>
      </div>

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

      {/* Journal Cards */}
      {journals.length > 0 && (
        <div className="space-y-4">
          {journals.map((journal, i) => {
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
                      <img
                        src={journal.images[0]}
                        alt={journal.title}
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
    </div>
  );
}
