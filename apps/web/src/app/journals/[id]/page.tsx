"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAccessToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

interface Journal {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  images: string[];
  isPublic: boolean;
  createdAt: string;
  trip?: { id: string; title: string } | null;
  user?: { nickname: string } | null;
  holySite?: { id: string; name: string } | null;
}

const MOOD_MAP: Record<string, { emoji: string; label: string }> = {
  "感悟": { emoji: "💡", label: "感悟" },
  "喜悦": { emoji: "😊", label: "喜悦" },
  "平静": { emoji: "🕊️", label: "平静" },
  "震撼": { emoji: "⚡", label: "震撼" },
  "觉悟": { emoji: "🪷", label: "觉悟" },
  "感动": { emoji: "🙏", label: "感动" },
  "振奋": { emoji: "⚡", label: "振奋" },
  "虔诚": { emoji: "🪷", label: "虔诚" },
};

export default function JournalDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchJournal = async () => {
      try {
        const token = getAccessToken();
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_URL}/journals/${id}`, { headers });
        if (!res.ok) {
          if (res.status === 404) {
            setError("not_found");
          } else {
            throw new Error("日志加载失败");
          }
          return;
        }
        setJournal(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };
    fetchJournal();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-3" />
          <p className="text-temple-400 text-sm font-serif">加载中...</p>
        </div>
      </div>
    );
  }

  if (error === "not_found" || (!journal && !error)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📖</div>
        <h1 className="text-2xl font-serif text-temple-200 mb-4">
          日志未找到
        </h1>
        <Link
          href="/journals"
          className="text-gold hover:text-gold-light transition-colors"
        >
          返回日记列表
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-serif text-temple-200 mb-4">{error}</h1>
        <Link
          href="/journals"
          className="text-gold hover:text-gold-light transition-colors"
        >
          返回日记列表
        </Link>
      </div>
    );
  }

  if (!journal) return null;

  const mood = journal.mood ? MOOD_MAP[journal.mood] : null;
  const date = new Date(journal.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/journals"
        className="inline-flex items-center gap-1 text-sm text-temple-400 hover:text-gold transition-colors mb-6"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        返回日记列表
      </Link>

      {/* Article */}
      <article className="card-glow rounded-2xl bg-temple-800/50 p-6 md:p-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gradient-gold mb-3">
            {journal.title}
          </h1>
          <div className="flex items-center gap-3 flex-wrap text-sm">
            <span className="text-temple-500">{date}</span>
            {mood && (
              <span className="px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-gold/80 text-xs">
                {mood.emoji} {mood.label}
              </span>
            )}
            {journal.trip && (
              <Link
                href={`/trips/${journal.trip.id}`}
                className="px-2 py-0.5 rounded-full bg-temple-700/50 border border-temple-600 text-temple-300 text-xs hover:text-gold transition-colors"
              >
                {journal.trip.title}
              </Link>
            )}
            {journal.holySite && (
              <span className="px-2 py-0.5 rounded-full bg-temple-700/50 border border-temple-600 text-temple-300 text-xs">
                🏛 {journal.holySite.name}
              </span>
            )}
            {journal.user && (
              <span className="text-temple-500 text-xs">
                {journal.user.nickname}
              </span>
            )}
          </div>
        </header>

        {/* Images */}
        {journal.images && journal.images.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3">
            {journal.images.map((img, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border border-temple-700/50"
              >
                <img
                  src={img}
                  alt={`${journal.title} - ${i + 1}`}
                  className="w-full h-48 object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="text-temple-300 leading-relaxed whitespace-pre-wrap">
            {journal.content}
          </div>
        </div>
      </article>
    </div>
  );
}
