"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import { createTrip } from "@/lib/api";
import MobileNav from "@/components/MobileNav";

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
        <p className="text-gray-500 text-sm font-serif">{t("common.loading")}</p>
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
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">&#x2708;&#xFE0F;</div>
            <h1 className="text-2xl font-serif font-bold text-[#0066FF]">
              {t("trip.createTitle")}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
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
                className="block text-sm text-gray-600 mb-1.5"
              >
                {t("trip.labelTitleRequired")}
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("trip.titlePlaceholder")}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm text-gray-600 mb-1.5"
                >
                  {t("trip.labelStartDateRequired")}
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm text-gray-600 mb-1.5"
                >
                  {t("trip.labelEndDateRequired")}
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="persons"
                  className="block text-sm text-gray-600 mb-1.5"
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
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="contactPhone"
                  className="block text-sm text-gray-600 mb-1.5"
                >
                  {t("trip.contactPhone")}
                </label>
                <input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder={t("trip.contactPhonePlaceholder")}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="contactName"
                className="block text-sm text-gray-600 mb-1.5"
              >
                {t("trip.contactName")}
              </label>
              <input
                id="contactName"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder={t("trip.contactNamePlaceholder")}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="note"
                className="block text-sm text-gray-600 mb-1.5"
              >
                {t("trip.note")}
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("trip.notePlaceholder")}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t("trip.creating") : t("trip.createSubmit")}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/trips"
              className="text-gray-500 text-sm hover:text-[#0066FF] transition-colors"
            >
              {t("trip.backToList")}
            </Link>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
