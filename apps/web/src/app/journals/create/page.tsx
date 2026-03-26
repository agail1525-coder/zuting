"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getAccessToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

interface TripOption {
  id: string;
  title: string;
}

const MOOD_OPTIONS = [
  { value: "感悟", label: "感悟", emoji: "💡" },
  { value: "喜悦", label: "喜悦", emoji: "😊" },
  { value: "平静", label: "平静", emoji: "🕊️" },
  { value: "震撼", label: "震撼", emoji: "⚡" },
];

export default function JournalCreatePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [tripId, setTripId] = useState("");
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Fetch user's trips for linking
  useEffect(() => {
    if (!user) return;
    const token = getAccessToken();
    if (!token) return;
    fetch(`${API_URL}/trips`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setTrips(data.map((t: { id: string; title: string }) => ({ id: t.id, title: t.title })));
        }
      })
      .catch(() => {});
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-temple-400 text-sm font-serif">加载中...</p>
      </div>
    );
  }

  if (!user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("请输入日记标题");
      return;
    }
    if (!content.trim()) {
      setError("请输入日记内容");
      return;
    }

    setSubmitting(true);
    try {
      const token = getAccessToken();
      const body: Record<string, unknown> = {
        title: title.trim(),
        content: content.trim(),
        isPublic,
      };
      if (mood) body.mood = mood;
      if (tripId) body.tripId = tripId;

      const res = await fetch(`${API_URL}/journals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "创建失败");
      }

      const journal = await res.json();
      router.push(`/journals/${journal.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建日记失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">📖</div>
            <h1 className="text-2xl font-serif font-bold text-gradient-gold">
              写朝圣日记
            </h1>
            <p className="text-temple-400 text-sm mt-2">
              记录您心灵的触动与觉醒
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="title"
                className="block text-sm text-temple-300 mb-1.5"
              >
                标题 *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="如：菩提树下的觉悟"
                className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 placeholder-temple-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm text-temple-300 mb-1.5"
              >
                内容 *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下您的朝圣感悟..."
                rows={8}
                className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 placeholder-temple-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="mood"
                  className="block text-sm text-temple-300 mb-1.5"
                >
                  心情
                </label>
                <select
                  id="mood"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
                >
                  <option value="">选择心情</option>
                  {MOOD_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.emoji} {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="trip"
                  className="block text-sm text-temple-300 mb-1.5"
                >
                  关联行程
                </label>
                <select
                  id="trip"
                  value={tripId}
                  onChange={(e) => setTripId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
                >
                  <option value="">不关联</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Public toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-temple-900/50 border border-temple-600/20">
              <div>
                <span className="text-sm text-temple-200">公开日记</span>
                <p className="text-xs text-temple-500 mt-0.5">
                  公开后其他朝圣者可以看到
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isPublic
                    ? "bg-gold/30 border border-gold/50"
                    : "bg-temple-700 border border-temple-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                    isPublic
                      ? "left-6 bg-gold"
                      : "left-0.5 bg-temple-400"
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gold/20 border border-gold/40 text-gold font-semibold hover:bg-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "发布中..." : "发布日记"}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/journals"
              className="text-temple-400 text-sm hover:text-gold transition-colors"
            >
              返回日记列表
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
