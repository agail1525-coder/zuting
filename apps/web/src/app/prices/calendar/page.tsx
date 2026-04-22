"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchPriceCalendar, fetchRoutes, type PriceCalendarItem } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import PriceSourceBadge from "@/components/PriceSourceBadge";

interface EntityOption {
  type: string;
  id: string;
  label: string;
}

function formatPrice(cents: number): string {
  return `¥${(cents / 100).toFixed(0)}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function getPriceColor(price: number, prices: number[]): string {
  if (prices.length === 0) return "bg-gray-50 text-gray-400";
  const sorted = [...prices].sort((a, b) => a - b);
  const p20 = sorted[Math.floor(sorted.length * 0.2)] ?? sorted[0];
  const p80 = sorted[Math.floor(sorted.length * 0.8)] ?? sorted[sorted.length - 1];
  if (price <= p20) return "bg-green-50 text-green-700 border-green-200";
  if (price >= p80) return "bg-red-50 text-red-700 border-red-200";
  return "bg-yellow-50 text-yellow-700 border-yellow-200";
}

export default function PriceCalendarPage() {
  const { t } = useTranslation();

  const WEEKDAYS = [
    t("prices.calendar.weekdays.sun"),
    t("prices.calendar.weekdays.mon"),
    t("prices.calendar.weekdays.tue"),
    t("prices.calendar.weekdays.wed"),
    t("prices.calendar.weekdays.thu"),
    t("prices.calendar.weekdays.fri"),
    t("prices.calendar.weekdays.sat"),
  ];
  const MONTH_NAMES = [
    t("prices.calendar.months.jan"), t("prices.calendar.months.feb"), t("prices.calendar.months.mar"),
    t("prices.calendar.months.apr"), t("prices.calendar.months.may"), t("prices.calendar.months.jun"),
    t("prices.calendar.months.jul"), t("prices.calendar.months.aug"), t("prices.calendar.months.sep"),
    t("prices.calendar.months.oct"), t("prices.calendar.months.nov"), t("prices.calendar.months.dec"),
  ];
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [entityOptions, setEntityOptions] = useState<EntityOption[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<EntityOption | null>(null);
  const [calendarData, setCalendarData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load real routes from API on mount
  useEffect(() => {
    let cancelled = false;
    async function loadRoutes() {
      setLoadingRoutes(true);
      try {
        const data = await fetchRoutes({ pageSize: 50 });
        if (cancelled) return;
        const options: EntityOption[] = (data.items ?? []).map((r) => ({
          type: "route",
          id: r.id,
          label: r.title,
        }));
        if (options.length > 0) {
          setEntityOptions(options);
          setSelectedEntity(options[0]);
        } else {
          setEntityOptions([]);
          setSelectedEntity(null);
          setError(t("prices.calendar.noRoutes"));
        }
      } catch {
        if (cancelled) return;
        setEntityOptions([]);
        setSelectedEntity(null);
        setError(t("prices.calendar.routeLoadFail"));
      } finally {
        if (!cancelled) setLoadingRoutes(false);
      }
    }
    loadRoutes();
    return () => { cancelled = true; };
  }, []);

  const loadCalendar = useCallback(async () => {
    if (!selectedEntity) return;
    setLoading(true);
    setError(null);
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = getDaysInMonth(year, month);
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    try {
      const items: PriceCalendarItem[] = await fetchPriceCalendar(
        selectedEntity.type,
        selectedEntity.id,
        startDate,
        endDate
      );
      const map: Record<string, number> = {};
      items.forEach((item) => { map[item.date] = item.price; });
      setCalendarData(map);
    } catch {
      setCalendarData({});
      setError(t("prices.calendar.noData") || "暂无价格数据");
    } finally {
      setLoading(false);
    }
  }, [year, month, selectedEntity]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const prices = Object.values(calendarData);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfMonth(year, month);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <Link href="/prices" className="text-sm text-[#0066FF] flex items-center gap-1 mb-6 hover:underline">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("prices.backToPrices")}
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("prices.calendar.title")}</h1>

        {/* Entity selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <label className="block text-sm text-gray-600 mb-2 font-medium">{t("prices.calendar.selectRoute")}</label>
          {loadingRoutes ? (
            <div className="text-sm text-gray-400 py-2">{t("prices.calendar.loadingRoutes")}</div>
          ) : entityOptions.length === 0 ? (
            <div className="text-sm text-gray-400 py-2">{t("prices.calendar.noRoutes")}</div>
          ) : (
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30"
              value={selectedEntity?.id ?? ""}
              onChange={(e) => {
                const opt = entityOptions.find(o => o.id === e.target.value);
                if (opt) setSelectedEntity(opt);
              }}
            >
              {entityOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          )}
        </div>

        {/* Calendar card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label={t("prices.calendar.prevMonth")}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-gray-900">
              {t("prices.calendar.yearMonth").replace("{year}", String(year)).replace("{month}", MONTH_NAMES[month])}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label={t("prices.calendar.nextMonth")}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2 mb-4 border border-yellow-200">
              {error}
            </div>
          )}

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">{t("prices.calendar.loading")}</div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const price = calendarData[dateStr];
                const colorClass = price !== undefined ? getPriceColor(price, prices) : "bg-gray-50 text-gray-300";
                const isSelected = selectedDay === dateStr;
                const isToday = dateStr === today.toISOString().slice(0, 10);
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                    className={`
                      relative rounded-lg border p-1.5 text-center transition-all cursor-pointer
                      ${colorClass}
                      ${isSelected ? "ring-2 ring-[#0066FF] ring-offset-1" : "border-transparent hover:border-gray-300"}
                      ${isToday ? "font-bold underline" : ""}
                    `}
                  >
                    <div className="text-xs leading-none mb-0.5">{day}</div>
                    {price !== undefined && (
                      <div className="text-[10px] leading-none font-medium truncate">
                        {formatPrice(price)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected day tooltip */}
          {selectedDay && calendarData[selectedDay] !== undefined && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm">
              <div className="font-semibold text-blue-900">{selectedDay}</div>
              <div className="text-blue-700 mt-1">
                {t("prices.calendar.price")}: <strong>{formatPrice(calendarData[selectedDay])}</strong>
                {calendarData[selectedDay] === minPrice && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">{t("prices.calendar.lowestPrice")}</span>
                )}
                {calendarData[selectedDay] === maxPrice && (
                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">{t("prices.calendar.highestPrice")}</span>
                )}
              </div>
              <Link
                href={`/prices/alerts`}
                className="mt-2 inline-block text-xs text-[#0066FF] hover:underline"
              >
                {t("prices.calendar.setAlert")}
              </Link>
            </div>
          )}

          {/* Price range summary */}
          {prices.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-xs text-gray-400">{t("prices.calendar.monthLowest")}</div>
                <div className="text-lg font-bold text-green-600">{formatPrice(minPrice)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">{t("prices.calendar.monthHighest")}</div>
                <div className="text-lg font-bold text-red-600">{formatPrice(maxPrice)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-green-50 border border-green-200" />
            {t("prices.calendar.legend.low")}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-yellow-50 border border-yellow-200" />
            {t("prices.calendar.legend.mid")}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-red-50 border border-red-200" />
            {t("prices.calendar.legend.high")}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200" />
            {t("prices.calendar.legend.noData")}
          </div>
        </div>

        <PriceSourceBadge source="baseline" />
      </div>
      <MobileNav />
    </main>
  );
}
