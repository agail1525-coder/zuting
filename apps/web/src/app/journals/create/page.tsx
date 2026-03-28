"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import { fetchTrips, createJournal } from "@/lib/api";

interface TripOption {
  id: string;
  title: string;
}

export default function JournalCreatePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const MOOD_OPTIONS = [
    { value: "感悟", label: t("journal.mood.insight"), emoji: "💡" },
    { value: "喜悦", label: t("journal.mood.joy"), emoji: "😊" },
    { value: "平静", label: t("journal.mood.peace"), emoji: "🕊️" },
    { value: "震撼", label: t("journal.mood.awe"), emoji: "⚡" },
  ];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [tripId, setTripId] = useState("");
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [error, setError] = useState("");
  const [tripError, setTripError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetchTrips()
      .then((res) => {
        const list = Array.isArray(res) ? res : res.data || [];
        setTrips(list.map((t: { id: string; title: string }) => ({ id: t.id, title: t.title })));
      })
      .catch((e: Error) => setTripError(e.message || t("journal.tripLoadFailed")));
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-temple-400 text-sm font-serif">{t("common.loading")}</p>
      </div>
    );
  }

  if (!user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError(t("journal.titleRequired"));
      return;
    }
    if (!content.trim()) {
      setError(t("journal.contentRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const data: Parameters<typeof createJournal>[0] = {
        title: title.trim(),
        content: content.trim(),
        isPublic,
      };
      if (mood) data.mood = mood;
      if (tripId) data.tripId = tripId;

      const journal = await createJournal(data);
      router.push(`/journals/${journal.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("journal.createFailed"));
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
              {t("journal.createTitle")}
            </h1>
            <p className="text-temple-400 text-sm mt-2">
              {t("journal.createSubtitle")}
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
                {t("journal.title")} *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("journal.titlePlaceholder")}
                className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 placeholder-temple-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm text-temple-300 mb-1.5"
              >
                {t("journal.content")} *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t("journal.contentPlaceholder")}
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
                  {t("journal.mood")}
                </label>
                <select
                  id="mood"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
                >
                  <option value="">{t("journal.selectMood")}</option>
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
                  {t("journal.linkedTrip")}
                </label>
                <select
                  id="trip"
                  value={tripId}
                  onChange={(e) => setTripId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
                >
                  <option value="">{t("journal.noLink")}</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Trip load error */}
            {tripError && (
              <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs text-center">
                {tripError}
              </div>
            )}

            {/* Public toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-temple-900/50 border border-temple-600/20">
              <div>
                <span className="text-sm text-temple-200">{t("journal.publicJournal")}</span>
                <p className="text-xs text-temple-500 mt-0.5">
                  {t("journal.publicDesc")}
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
              {submitting ? t("journal.publishing") : t("journal.publish")}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/journals"
              className="text-temple-400 text-sm hover:text-gold transition-colors"
            >
              {t("journal.backToList")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
