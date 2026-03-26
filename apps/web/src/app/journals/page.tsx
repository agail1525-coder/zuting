"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getAccessToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

interface JournalItem {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  images: string[];
  isPublic: boolean;
  createdAt: string;
  trip?: { id: string; title: string } | null;
  holySite?: { id: string; name: string } | null;
}

const MOOD_EMOJI: Record<string, string> = {
  "觉悟": "🪷",
  "平静": "🌅",
  "感动": "🙏",
  "振奋": "⚡",
  "喜悦": "😊",
  "感悟": "💡",
  "震撼": "⚡",
  "虔诚": "🪷",
};

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function getExcerpt(content: string, maxLen = 120): string {
  if (!content) return "";
  return content.length > maxLen ? content.slice(0, maxLen) + "..." : content;
}

export default function JournalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

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
    const fetchJournals = async () => {
      try {
        const token = getAccessToken();
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_URL}/journals?userId=${user.id}`, {
          headers,
        });
        if (!res.ok) throw new Error("日记加载失败");
        const data = await res.json();
        setJournals(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };
    fetchJournals();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-3" />
          <p className="text-temple-400 text-sm font-serif">加载中...</p>
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
          <h1 className="text-3xl font-serif font-bold text-gradient-gold">
            朝圣日记
          </h1>
          <p className="text-temple-400 mt-1 text-sm">
            记录每一次心灵的触动与觉醒
          </p>
        </div>
        <Link
          href="/journals/create"
          className="px-5 py-2.5 bg-gold text-temple-900 font-semibold rounded-full text-sm hover:bg-gold-light transition-colors shadow-lg shadow-gold/20"
        >
          + 写日记
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
        <div className="card-glow rounded-2xl bg-temple-800/50 p-12 text-center">
          <div className="text-5xl mb-4">📖</div>
          <h2 className="text-xl font-serif text-temple-200 mb-3">
            还没有日记
          </h2>
          <p className="text-temple-400 text-sm mb-6">
            开始记录您的朝圣感悟吧
          </p>
          <Link
            href="/journals/create"
            className="inline-block px-6 py-3 rounded-xl bg-gold/20 border border-gold/40 text-gold font-semibold hover:bg-gold/30 transition-colors"
          >
            写第一篇日记
          </Link>
        </div>
      )}

      {/* Journal Cards */}
      {journals.length > 0 && (
        <div className="space-y-4">
          {journals.map((journal, i) => {
            const moodEmoji = journal.mood
              ? MOOD_EMOJI[journal.mood] || "📝"
              : "📝";
            return (
              <Link
                key={journal.id}
                href={`/journals/${journal.id}`}
                className="block card-glow rounded-2xl bg-temple-800/50 p-5 hover:bg-temple-800/70 transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Image or Emoji Placeholder */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold/10 to-temple-700/50 border border-gold/10 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
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
                    <h3 className="text-lg font-serif font-semibold text-temple-100 mb-1 truncate">
                      {journal.title}
                    </h3>
                    <p className="text-sm text-temple-400 leading-relaxed line-clamp-2 mb-3">
                      {getExcerpt(journal.content)}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-temple-500">
                        {formatDate(journal.createdAt)}
                      </span>
                      {journal.mood && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gold/10 border border-gold/20 text-gold/80">
                          {moodEmoji} {journal.mood}
                        </span>
                      )}
                      {journal.trip && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-temple-700/50 border border-temple-600 text-temple-300">
                          🗺 {journal.trip.title}
                        </span>
                      )}
                      {journal.holySite && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-temple-700/50 border border-temple-600 text-temple-300">
                          🏛 {journal.holySite.name}
                        </span>
                      )}
                      {journal.isPublic && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                          公开
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
