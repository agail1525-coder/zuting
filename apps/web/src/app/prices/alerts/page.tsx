"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchMyPriceAlerts, createPriceAlert, deletePriceAlert, fetchRoutes, type PriceAlertItem, type Route } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";

interface EntityOption { type: string; id: string; name: string; currentPrice: number }

function formatPrice(cents: number): string {
  return `¥${(cents / 100).toFixed(0)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

export default function PriceAlertsPage() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<PriceAlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Entity options from real routes
  const [entityOptions, setEntityOptions] = useState<EntityOption[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formEntity, setFormEntity] = useState<EntityOption | null>(null);
  const [targetPriceStr, setTargetPriceStr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load routes as entity options
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchRoutes({ pageSize: 50 });
        const opts: EntityOption[] = (res.items || []).map((r: Route) => ({
          type: "route",
          id: r.id,
          name: r.title,
          currentPrice: r.priceFrom,
        }));
        setEntityOptions(opts);
        if (opts.length > 0) setFormEntity(opts[0]);
      } catch {
        // Routes unavailable — form will be disabled
      } finally {
        setLoadingRoutes(false);
      }
    })();
  }, []);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMyPriceAlerts();
      setAlerts(res.items || []);
    } catch {
      setAlerts([]);
      setError(t("prices.alerts.loginRequired"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  async function handleCreate() {
    if (!formEntity) return;
    const targetCents = Math.round(parseFloat(targetPriceStr) * 100);
    if (isNaN(targetCents) || targetCents <= 0) {
      setFormError(t("prices.alerts.invalidPrice"));
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const newAlert = await createPriceAlert({
        entityType: formEntity.type,
        entityId: formEntity.id,
        entityName: formEntity.name,
        targetPrice: targetCents,
        currentPrice: formEntity.currentPrice,
      });
      setAlerts(prev => [newAlert, ...prev]);
      setShowForm(false);
      setTargetPriceStr("");
    } catch {
      setFormError(t("prices.alerts.createFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePriceAlert(id);
    } catch {
      // Proceed optimistically
    }
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  const triggeredAlerts = alerts.filter(a => a.isTriggered);
  const activeAlerts = alerts.filter(a => !a.isTriggered && a.isActive);

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/prices" className="text-sm text-[#0066FF] flex items-center gap-1 mb-6 hover:underline">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("prices.backToPrices")}
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t("prices.alerts.title")}</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0066FF] text-white rounded-full text-sm font-medium hover:bg-[#0052CC] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t("prices.alerts.createAlert")}
          </button>
        </div>

        {error && (
          <div className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2 mb-4 border border-yellow-200">
            {error}
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0066FF]/20 p-5 mb-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">{t("prices.alerts.newAlert")}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">{t("prices.alerts.selectRoute")}</label>
                {loadingRoutes ? (
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-400">{t("prices.alerts.loadingRoutes")}</div>
                ) : entityOptions.length === 0 ? (
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-400">{t("prices.alerts.noRoutes")}</div>
                ) : (
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30"
                  value={formEntity?.id ?? ""}
                  onChange={(e) => {
                    const opt = entityOptions.find(o => o.id === e.target.value);
                    if (opt) setFormEntity(opt);
                  }}
                >
                  {entityOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} ({t("prices.alerts.currentPriceLabel")}: {formatPrice(opt.currentPrice)})
                    </option>
                  ))}
                </select>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  {t("prices.alerts.targetPrice")}
                  {formEntity && (
                  <span className="text-gray-400 ml-2 text-xs">
                    {t("prices.alerts.currentPriceLabel")}: {formatPrice(formEntity.currentPrice)}
                  </span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                  <input
                    type="number"
                    value={targetPriceStr}
                    onChange={(e) => setTargetPriceStr(e.target.value)}
                    placeholder={formEntity ? String(Math.floor(formEntity.currentPrice / 100 * 0.9)) : ""}
                    className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30"
                    min="1"
                  />
                </div>
                {formError && <p className="text-xs text-red-500 mt-1">{formError}</p>}
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleCreate}
                  disabled={submitting}
                  className="flex-1 py-2 bg-[#0066FF] text-white rounded-lg text-sm font-medium hover:bg-[#0052CC] transition-colors disabled:opacity-50"
                >
                  {submitting ? t("prices.alerts.creating") : t("prices.alerts.confirm")}
                </button>
                <button
                  onClick={() => { setShowForm(false); setFormError(null); }}
                  className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  {t("prices.alerts.cancel")}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">{t("prices.alerts.loading")}</div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-3">🔔</div>
            <p className="text-gray-500 text-sm">{t("prices.alerts.empty")}</p>
            <p className="text-gray-400 text-xs mt-1">{t("prices.alerts.emptyHint")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Triggered alerts */}
            {triggeredAlerts.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {t("prices.alerts.triggered")} ({triggeredAlerts.length})
                </h2>
                <div className="space-y-3">
                  {triggeredAlerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}
            {/* Waiting alerts */}
            {activeAlerts.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  {t("prices.alerts.waiting")} ({activeAlerts.length})
                </h2>
                <div className="space-y-3">
                  {activeAlerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <MobileNav />
    </main>
  );
}

function AlertCard({ alert, onDelete }: { alert: PriceAlertItem; onDelete: (id: string) => void }) {
  const { t } = useTranslation();
  const isTriggered = alert.isTriggered;
  const diff = alert.currentPrice - alert.targetPrice;
  const pct = Math.round((diff / alert.currentPrice) * 100);

  return (
    <div className={`bg-white rounded-xl border p-4 shadow-sm flex items-start gap-4 ${
      isTriggered ? "border-green-200 bg-green-50/30" : "border-gray-200"
    }`}>
      <div className={`text-2xl ${isTriggered ? "text-green-500" : "text-gray-300"}`}>
        {isTriggered ? "🎉" : "🔔"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{alert.entityName}</div>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap text-sm">
          <span className="text-gray-500">
            {t("prices.alerts.targetPriceLabel")}: <strong className="text-gray-800">{formatPrice(alert.targetPrice)}</strong>
          </span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500">
            {t("prices.alerts.currentLabel")}: <strong className={isTriggered ? "text-green-700" : "text-gray-800"}>
              {formatPrice(alert.currentPrice)}
            </strong>
          </span>
          {!isTriggered && diff > 0 && (
            <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              {t("prices.alerts.remaining").replace("{price}", formatPrice(diff)).replace("{pct}", String(pct))}
            </span>
          )}
          {isTriggered && (
            <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              {t("prices.alerts.reached")}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-1">{t("prices.alerts.createdAt").replace("{date}", formatDate(alert.createdAt))}</div>
      </div>
      <button
        onClick={() => onDelete(alert.id)}
        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 shrink-0"
        aria-label={t("prices.alerts.deleteLabel")}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
