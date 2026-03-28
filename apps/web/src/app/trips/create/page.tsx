"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import { createTrip } from "@/lib/api";

export default function TripCreatePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [persons, setPersons] = useState(1);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

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
      setError(t("trip.titleRequired"));
      return;
    }
    if (!startDate || !endDate) {
      setError(t("trip.dateRequired"));
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError(t("trip.dateInvalid"));
      return;
    }

    setSubmitting(true);
    try {
      const trip = await createTrip({
        title: title.trim(),
        startDate,
        endDate,
        persons,
        contactName: contactName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        note: note.trim() || undefined,
      });
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("trip.createFailed"));
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
            <div className="text-4xl mb-3">&#x2708;&#xFE0F;</div>
            <h1 className="text-2xl font-serif font-bold text-gradient-gold">
              {t("trip.createTitle")}
            </h1>
            <p className="text-temple-400 text-sm mt-2">
              {t("trip.createSubtitle")}
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
                {t("trip.labelTitleRequired")}
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("trip.titlePlaceholder")}
                className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 placeholder-temple-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm text-temple-300 mb-1.5"
                >
                  {t("trip.labelStartDateRequired")}
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm text-temple-300 mb-1.5"
                >
                  {t("trip.labelEndDateRequired")}
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="persons"
                  className="block text-sm text-temple-300 mb-1.5"
                >
                  {t("trip.persons")}
                </label>
                <input
                  id="persons"
                  type="number"
                  min={1}
                  max={20}
                  value={persons}
                  onChange={(e) =>
                    setPersons(
                      Math.min(20, Math.max(1, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="contactPhone"
                  className="block text-sm text-temple-300 mb-1.5"
                >
                  {t("trip.contactPhone")}
                </label>
                <input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder={t("trip.contactPhonePlaceholder")}
                  className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 placeholder-temple-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="contactName"
                className="block text-sm text-temple-300 mb-1.5"
              >
                {t("trip.contactName")}
              </label>
              <input
                id="contactName"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder={t("trip.contactNamePlaceholder")}
                className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 placeholder-temple-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="note"
                className="block text-sm text-temple-300 mb-1.5"
              >
                {t("trip.note")}
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("trip.notePlaceholder")}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-temple-900/80 border border-temple-600/30 text-temple-100 placeholder-temple-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gold/20 border border-gold/40 text-gold font-semibold hover:bg-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t("trip.creating") : t("trip.createSubmit")}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/trips"
              className="text-temple-400 text-sm hover:text-gold transition-colors"
            >
              {t("trip.backToList")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
