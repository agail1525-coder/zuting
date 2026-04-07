"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import {
  createTrip,
  addSiteToTrip,
  fetchFeaturedRoutes,
  fetchReligions,
  fetchHolySites,
  type Route,
  type Religion,
  type HolySite,
} from "@/lib/api";
import { toast } from "@/lib/toast";
import MobileNav from "@/components/MobileNav";

const STEPS = [
  { num: 1, key: "tripCreate.step1Label" },
  { num: 2, key: "tripCreate.step2Label" },
  { num: 3, key: "tripCreate.step3Label" },
];

const BUDGET_TIERS = [
  { key: "economy", cents: 200000, icon: "🎒" },
  { key: "standard", cents: 500000, icon: "🏨" },
  { key: "luxury", cents: 1000000, icon: "👑" },
  { key: "custom", cents: 0, icon: "✏️" },
];

function calcDuration(start: string, end: string) {
  if (!start || !end) return { days: 0, nights: 0 };
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const days = Math.max(1, Math.ceil(ms / 86400000) + 1);
  return { days, nights: days - 1 };
}

function formatPrice(cents: number) {
  return `¥${(cents / 100).toLocaleString()}`;
}

export default function TripCreatePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  // Wizard
  const [step, setStep] = useState(1);

  // Step 1
  const [routes, setRoutes] = useState<Route[]>([]);
  const [religions, setReligionsData] = useState<Religion[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [religionFilter, setReligionFilter] = useState("");
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  // Step 2
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [persons, setPersons] = useState(2);
  const [budgetTier, setBudgetTier] = useState("standard");
  const [customBudget, setCustomBudget] = useState("");
  const [contactExpanded, setContactExpanded] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [note, setNote] = useState("");

  // Step 3
  const [holySites, setHolySites] = useState<HolySite[]>([]);
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [siteReligionFilter, setSiteReligionFilter] = useState("");
  const [loadingSites, setLoadingSites] = useState(false);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/trips/create");
    }
  }, [authLoading, user, router]);

  // Load routes + religions on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [r, rel] = await Promise.all([
          fetchFeaturedRoutes(12),
          fetchReligions(),
        ]);
        if (!cancelled) {
          setRoutes(r);
          setReligionsData(rel);
        }
      } catch {
        if (!cancelled) toast.error(t("tripCreate.loadFailed"));
      } finally {
        if (!cancelled) setLoadingRoutes(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [t]);

  // Lazy load holy sites when entering step 3
  const loadHolySites = useCallback(async () => {
    if (holySites.length > 0) return;
    setLoadingSites(true);
    try {
      const sites = await fetchHolySites();
      setHolySites(sites);
    } catch {
      toast.error(t("tripCreate.siteLoadFailed"));
    } finally {
      setLoadingSites(false);
    }
  }, [holySites.length, t]);

  // Select a route → auto-fill step 2
  const selectRoute = (route: Route) => {
    setSelectedRoute(route);
    setTitle(route.title);
    // Auto-suggest dates: start in 7 days, end = start + duration
    const start = new Date();
    start.setDate(start.getDate() + 7);
    const end = new Date(start);
    end.setDate(end.getDate() + route.duration - 1);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    setPersons(2);
    // Pre-select route sites
    if (route.sites && route.sites.length > 0) {
      setSelectedSiteIds(route.sites.map((rs) => rs.site.id));
    }
    // Auto-set budget based on route price
    if (route.priceFrom > 0) {
      setBudgetTier("custom");
      setCustomBudget(String(route.priceFrom / 100));
    }
    setStep(2);
  };

  // Choose custom trip
  const startCustom = () => {
    setSelectedRoute(null);
    setTitle("");
    setStartDate("");
    setEndDate("");
    setPersons(2);
    setBudgetTier("standard");
    setSelectedSiteIds([]);
    setStep(2);
  };

  // Step 2 → 3 validation
  const goToStep3 = async () => {
    setError("");
    if (!title.trim()) {
      setError(t("tripCreate.titleRequired"));
      return;
    }
    if (!startDate || !endDate) {
      setError(t("tripCreate.dateRequired"));
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError(t("tripCreate.dateInvalid"));
      return;
    }
    await loadHolySites();
    setStep(3);
  };

  // Toggle site selection
  const toggleSite = (siteId: string) => {
    setSelectedSiteIds((prev) =>
      prev.includes(siteId)
        ? prev.filter((id) => id !== siteId)
        : [...prev, siteId]
    );
  };

  // Remove site from chips
  const removeSite = (siteId: string) => {
    setSelectedSiteIds((prev) => prev.filter((id) => id !== siteId));
  };

  // Final submission
  const handleCreate = async () => {
    setError("");
    setSubmitting(true);

    const budgetCents =
      budgetTier === "custom"
        ? Math.round(parseFloat(customBudget || "0") * 100)
        : BUDGET_TIERS.find((b) => b.key === budgetTier)?.cents || 0;

    try {
      const trip = await createTrip({
        title: title.trim(),
        startDate,
        endDate,
        persons,
        totalBudget: budgetCents > 0 ? budgetCents : undefined,
        contactName: contactName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        note: note.trim() || undefined,
      });

      // Add selected sites sequentially
      for (let i = 0; i < selectedSiteIds.length; i++) {
        try {
          await addSiteToTrip(trip.id, selectedSiteIds[i], i);
        } catch {
          // Partial failure is OK — trip still created
        }
      }

      toast.success(t("tripCreate.success"));
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("tripCreate.createFailed")
      );
      setSubmitting(false);
    }
  };

  // Get budget display
  const getBudgetAmount = () => {
    if (budgetTier === "custom") {
      const val = parseFloat(customBudget || "0");
      return val > 0 ? `¥${val.toLocaleString()}` : "--";
    }
    const tier = BUDGET_TIERS.find((b) => b.key === budgetTier);
    return tier ? formatPrice(tier.cents) : "--";
  };

  // Duration display
  const duration = calcDuration(startDate, endDate);

  // Filtered routes
  const filteredRoutes = religionFilter
    ? routes.filter((r) => r.religionId === religionFilter)
    : routes;

  // Filtered sites
  const filteredSites = siteReligionFilter
    ? holySites.filter((s) => s.religionId === siteReligionFilter)
    : holySites;

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-50 to-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-4">
          <Link
            href="/trips"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0066FF] mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("trip.backToList")}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("tripCreate.heroTitle")}
          </h1>
          <p className="text-gray-500 mt-1">{t("tripCreate.heroSubtitle")}</p>
        </div>
      </div>

      {/* Step Progress */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-0 mb-2">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => s.num < step && setStep(s.num)}
                disabled={s.num > step}
                className="flex items-center gap-2"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= s.num
                      ? "bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/30"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > s.num ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    step >= s.num ? "text-[#0066FF]" : "text-gray-400"
                  }`}
                >
                  {t(s.key)}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-12 sm:w-20 h-0.5 mx-2 ${
                    step > s.num ? "bg-[#0066FF]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="max-w-md mx-auto">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0066FF] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-5xl mx-auto px-4 mb-4">
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
            {error}
          </div>
        </div>
      )}

      {/* ═══════ STEP 1: Choose Journey ═══════ */}
      {step === 1 && (
        <div className="max-w-5xl mx-auto px-4">
          {/* Religion Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            <button
              onClick={() => setReligionFilter("")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                !religionFilter
                  ? "bg-[#0066FF] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#0066FF]"
              }`}
            >
              {t("tripCreate.filterAll")}
            </button>
            {religions.map((rel) => (
              <button
                key={rel.id}
                onClick={() =>
                  setReligionFilter(religionFilter === rel.id ? "" : rel.id)
                }
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  religionFilter === rel.id
                    ? "text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
                }`}
                style={
                  religionFilter === rel.id
                    ? { backgroundColor: rel.color || "#0066FF" }
                    : undefined
                }
              >
                {rel.symbol && <span>{rel.symbol}</span>}
                {rel.name}
              </button>
            ))}
          </div>

          {/* Featured Routes Section */}
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🗺️</span> {t("tripCreate.fromRoute")}
          </h2>
          <p className="text-sm text-gray-500 mb-4">{t("tripCreate.fromRouteDesc")}</p>

          {loadingRoutes ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin" />
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {t("tripCreate.noRoutes")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {filteredRoutes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => selectRoute(route)}
                  className="group text-left rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#0066FF]/30 transition-all overflow-hidden"
                >
                  {/* Cover Image */}
                  <div className="relative h-40 bg-gradient-to-br from-blue-100 to-blue-50 overflow-hidden">
                    {route.coverImage ? (
                      <Image
                        src={route.coverImage}
                        alt={route.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-4xl">
                        {route.religion?.symbol || "🏛️"}
                      </div>
                    )}
                    {/* Duration badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
                      {route.duration}{t("tripCreate.routeDays")} {route.nights}{t("tripCreate.routeNights")}
                    </div>
                    {/* Religion badge */}
                    {route.religion && (
                      <div
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm"
                        style={{ backgroundColor: (route.religion.color || "#666") + "CC" }}
                      >
                        {route.religion.symbol} {route.religion.name}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#0066FF] transition-colors line-clamp-1">
                      {route.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {route.subtitle}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {route.rating ? (
                          <>
                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">
                              {route.rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({route.reviewCount})
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {t("tripCreate.newRoute")}
                          </span>
                        )}
                      </div>
                      {route.priceFrom > 0 && (
                        <div className="text-right">
                          <span className="text-xs text-gray-400">{t("tripCreate.perPerson")}</span>
                          <span className="text-[#0066FF] font-bold ml-1">
                            {formatPrice(route.priceFrom)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">{t("tripCreate.orDivider")}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Custom Trip CTA */}
          <button
            onClick={startCustom}
            className="w-full rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#0066FF] bg-white hover:bg-blue-50/50 p-8 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  ✏️
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#0066FF] transition-colors">
                    {t("tripCreate.customTrip")}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {t("tripCreate.customTripDesc")}
                  </p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-[#0066FF] group-hover:translate-x-1 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      )}

      {/* ═══════ STEP 2: Trip Details ═══════ */}
      {step === 2 && (
        <div className="max-w-5xl mx-auto px-4">
          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
            {/* Left: Form */}
            <div className="space-y-6">
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <span>📝</span> {t("tripCreate.detailTitle")}
                </h2>

                {/* Title */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("tripCreate.labelTitle")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("tripCreate.titlePlaceholder")}
                    maxLength={200}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
                  />
                </div>

                {/* Dates */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("tripCreate.labelDates")} <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 mb-1 block">
                        {t("tripCreate.labelStartDate")}
                      </span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 mb-1 block">
                        {t("tripCreate.labelEndDate")}
                      </span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || undefined}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
                      />
                    </div>
                  </div>
                  {duration.days > 0 && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0066FF] text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {t("tripCreate.durationDisplay", { days: duration.days, nights: duration.nights })}
                    </div>
                  )}
                </div>

                {/* Persons */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("tripCreate.labelPersons")}
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setPersons(Math.max(1, persons - 1))}
                      className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#0066FF] hover:text-[#0066FF] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-xl font-bold text-gray-900 w-12 text-center">
                      {persons}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPersons(Math.min(20, persons + 1))}
                      className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#0066FF] hover:text-[#0066FF] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <span className="text-sm text-gray-500">
                      {t("tripCreate.personsUnit")}
                    </span>
                  </div>
                </div>

                {/* Budget Tiers */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("tripCreate.labelBudget")}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {BUDGET_TIERS.map((tier) => (
                      <button
                        key={tier.key}
                        type="button"
                        onClick={() => setBudgetTier(tier.key)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          budgetTier === tier.key
                            ? "border-[#0066FF] bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="text-xl mb-1">{tier.icon}</div>
                        <div
                          className={`text-sm font-medium ${
                            budgetTier === tier.key ? "text-[#0066FF]" : "text-gray-700"
                          }`}
                        >
                          {t(`tripCreate.budget${tier.key.charAt(0).toUpperCase() + tier.key.slice(1)}`)}
                        </div>
                        {tier.cents > 0 && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            {formatPrice(tier.cents)}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {budgetTier === "custom" && (
                    <div className="mt-3">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          ¥
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={customBudget}
                          onChange={(e) => setCustomBudget(e.target.value)}
                          placeholder={t("tripCreate.budgetCustomPlaceholder")}
                          className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact (collapsible) */}
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={() => setContactExpanded(!contactExpanded)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#0066FF] transition-colors"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${contactExpanded ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {t("tripCreate.labelContact")}
                  </button>
                  {contactExpanded && (
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500 mb-1 block">
                          {t("tripCreate.contactName")}
                        </span>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder={t("tripCreate.contactNamePlaceholder")}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 mb-1 block">
                          {t("tripCreate.contactPhone")}
                        </span>
                        <input
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder={t("tripCreate.contactPhonePlaceholder")}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("tripCreate.labelNote")}
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t("tripCreate.notePlaceholder")}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  {t("tripCreate.back")}
                </button>
                <button
                  type="button"
                  onClick={goToStep3}
                  className="flex-1 py-3 rounded-xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC] transition-colors"
                >
                  {t("tripCreate.next")}
                </button>
              </div>
            </div>

            {/* Right: Summary Sidebar (desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📋</span> {t("tripCreate.summaryTitle")}
                </h3>

                {selectedRoute && selectedRoute.coverImage && (
                  <div className="relative h-32 rounded-xl overflow-hidden mb-4">
                    <Image
                      src={selectedRoute.coverImage}
                      alt={selectedRoute.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  {selectedRoute && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t("tripCreate.summaryRoute")}</span>
                      <span className="font-medium text-gray-900 text-right max-w-[160px] truncate">
                        {selectedRoute.title}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("tripCreate.summaryDates")}</span>
                    <span className="font-medium text-gray-900">
                      {startDate && endDate
                        ? `${startDate} ~ ${endDate}`
                        : "--"}
                    </span>
                  </div>
                  {duration.days > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t("tripCreate.durationLabel")}</span>
                      <span className="font-medium text-[#0066FF]">
                        {duration.days}{t("tripCreate.routeDays")} {duration.nights}{t("tripCreate.routeNights")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("tripCreate.summaryPersons")}</span>
                    <span className="font-medium text-gray-900">
                      {persons} {t("tripCreate.personsUnit")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("tripCreate.summaryBudget")}</span>
                    <span className="font-medium text-gray-900">
                      {getBudgetAmount()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("tripCreate.summarySites")}</span>
                    <span className="font-medium text-gray-900">
                      {selectedSiteIds.length} {t("tripCreate.sitesUnit")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ STEP 3: Select Sites & Confirm ═══════ */}
      {step === 3 && (
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>🏛️</span> {t("tripCreate.selectSitesTitle")}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {t("tripCreate.selectSitesSubtitle")}
          </p>

          {/* Selected Sites Chips */}
          {selectedSiteIds.length > 0 && (
            <div className="mb-5">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                {t("tripCreate.selectedSites")} ({selectedSiteIds.length})
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {selectedSiteIds.map((siteId, idx) => {
                  const site = holySites.find((s) => s.id === siteId);
                  const routeSite = selectedRoute?.sites?.find(
                    (rs) => rs.site.id === siteId
                  );
                  const name = site?.name || routeSite?.site?.name || siteId;
                  return (
                    <div
                      key={siteId}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-[#0066FF] text-sm font-medium whitespace-nowrap"
                    >
                      <span className="text-xs text-blue-400">{idx + 1}.</span>
                      {name}
                      <button
                        type="button"
                        onClick={() => removeSite(siteId)}
                        className="ml-1 w-4 h-4 rounded-full bg-blue-200/60 hover:bg-blue-300 flex items-center justify-center"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Religion Filter for Sites */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            <button
              onClick={() => setSiteReligionFilter("")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                !siteReligionFilter
                  ? "bg-[#0066FF] text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {t("tripCreate.filterAll")}
            </button>
            {religions.map((rel) => (
              <button
                key={rel.id}
                onClick={() =>
                  setSiteReligionFilter(
                    siteReligionFilter === rel.id ? "" : rel.id
                  )
                }
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  siteReligionFilter === rel.id
                    ? "text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
                style={
                  siteReligionFilter === rel.id
                    ? { backgroundColor: rel.color || "#0066FF" }
                    : undefined
                }
              >
                {rel.symbol} {rel.name}
              </button>
            ))}
          </div>

          {/* Sites Grid */}
          {loadingSites ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin" />
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {t("tripCreate.noSitesFound")}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {filteredSites.map((site) => {
                const selected = selectedSiteIds.includes(site.id);
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => toggleSite(site.id)}
                    className={`group text-left rounded-xl overflow-hidden border-2 transition-all ${
                      selected
                        ? "border-[#0066FF] shadow-md"
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-24 bg-gradient-to-br from-gray-100 to-gray-50">
                      {site.imageUrl ? (
                        <Image
                          src={site.imageUrl}
                          alt={site.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-2xl text-gray-300">
                          🏛️
                        </div>
                      )}
                      {/* Selection indicator */}
                      <div
                        className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          selected
                            ? "bg-[#0066FF] text-white"
                            : "bg-white/80 text-gray-400 border border-gray-200"
                        }`}
                      >
                        {selected ? (
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-2.5">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                        {site.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{site.country}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Trip Summary & Confirm */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              {t("tripCreate.confirmSummary")}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gray-50 text-center">
                <div className="text-xs text-gray-500">{t("tripCreate.labelTitle")}</div>
                <div className="font-medium text-gray-900 mt-1 text-sm truncate">
                  {title || "--"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 text-center">
                <div className="text-xs text-gray-500">{t("tripCreate.labelDates")}</div>
                <div className="font-medium text-gray-900 mt-1 text-sm">
                  {duration.days > 0 ? `${duration.days}${t("tripCreate.routeDays")} ${duration.nights}${t("tripCreate.routeNights")}` : "--"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 text-center">
                <div className="text-xs text-gray-500">{t("tripCreate.labelPersons")}</div>
                <div className="font-medium text-gray-900 mt-1 text-sm">
                  {persons} {t("tripCreate.personsUnit")}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 text-center">
                <div className="text-xs text-gray-500">{t("tripCreate.summarySites")}</div>
                <div className="font-medium text-[#0066FF] mt-1 text-sm">
                  {selectedSiteIds.length} {t("tripCreate.sitesUnit")}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              {t("tripCreate.back")}
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-[#0066FF] text-white font-semibold hover:bg-[#0052CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("tripCreate.creating")}
                </>
              ) : (
                t("tripCreate.confirmCreate")
              )}
            </button>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
