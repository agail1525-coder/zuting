"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchMyPriceAlerts, createPriceAlert, deletePriceAlert, type PriceAlertItem } from "@/lib/api";

const ENTITY_OPTIONS = [
  { type: "package", id: "pkg-001", name: "峨眉山朝圣7日游", currentPrice: 89800 },
  { type: "package", id: "pkg-002", name: "麦加朝觐精华团", currentPrice: 128000 },
  { type: "package", id: "pkg-003", name: "耶路撒冷圣地探访", currentPrice: 105000 },
  { type: "package", id: "pkg-004", name: "恒河瓦拉纳西净心之旅", currentPrice: 79800 },
];

function formatPrice(cents: number): string {
  return `¥${(cents / 100).toFixed(0)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

// Mock alerts for demo when not logged in
const MOCK_ALERTS: PriceAlertItem[] = [
  {
    id: "alert-1", entityType: "package", entityId: "pkg-001", entityName: "峨眉山朝圣7日游",
    targetPrice: 79800, currentPrice: 89800, isTriggered: false, isActive: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "alert-2", entityType: "package", entityId: "pkg-004", entityName: "恒河瓦拉纳西净心之旅",
    targetPrice: 75000, currentPrice: 74900, isTriggered: true, isActive: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

export default function PriceAlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingMock, setUsingMock] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formEntity, setFormEntity] = useState(ENTITY_OPTIONS[0]);
  const [targetPriceStr, setTargetPriceStr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMyPriceAlerts();
      setAlerts(res.items);
      setUsingMock(false);
    } catch {
      setAlerts(MOCK_ALERTS);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  async function handleCreate() {
    const targetCents = Math.round(parseFloat(targetPriceStr) * 100);
    if (isNaN(targetCents) || targetCents <= 0) {
      setFormError("请输入有效的目标价格");
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
      // Add mock alert
      const mock: PriceAlertItem = {
        id: `mock-${Date.now()}`,
        entityType: formEntity.type,
        entityId: formEntity.id,
        entityName: formEntity.name,
        targetPrice: targetCents,
        currentPrice: formEntity.currentPrice,
        isTriggered: targetCents >= formEntity.currentPrice,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setAlerts(prev => [mock, ...prev]);
      setShowForm(false);
      setTargetPriceStr("");
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
          返回价格工具
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">价格提醒</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0066FF] text-white rounded-full text-sm font-medium hover:bg-[#0052CC] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            创建提醒
          </button>
        </div>

        {usingMock && (
          <div className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2 mb-4 border border-yellow-200">
            演示模式 — 登录后可管理真实提醒
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#0066FF]/20 p-5 mb-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">新建价格提醒</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">选择套餐</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30"
                  value={formEntity.id}
                  onChange={(e) => {
                    const opt = ENTITY_OPTIONS.find(o => o.id === e.target.value);
                    if (opt) setFormEntity(opt);
                  }}
                >
                  {ENTITY_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} (当前: {formatPrice(opt.currentPrice)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  目标价格 (元)
                  <span className="text-gray-400 ml-2 text-xs">
                    当前价: {formatPrice(formEntity.currentPrice)}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                  <input
                    type="number"
                    value={targetPriceStr}
                    onChange={(e) => setTargetPriceStr(e.target.value)}
                    placeholder={String(Math.floor(formEntity.currentPrice / 100 * 0.9))}
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
                  {submitting ? "创建中..." : "确认创建"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setFormError(null); }}
                  className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">加载中...</div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-3">🔔</div>
            <p className="text-gray-500 text-sm">暂无价格提醒</p>
            <p className="text-gray-400 text-xs mt-1">点击「创建提醒」，当价格降至目标价时立即通知您</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Triggered alerts */}
            {triggeredAlerts.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  已触发 ({triggeredAlerts.length})
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
                  等待降价 ({activeAlerts.length})
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
    </main>
  );
}

function AlertCard({ alert, onDelete }: { alert: PriceAlertItem; onDelete: (id: string) => void }) {
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
            目标价: <strong className="text-gray-800">{formatPrice(alert.targetPrice)}</strong>
          </span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500">
            当前: <strong className={isTriggered ? "text-green-700" : "text-gray-800"}>
              {formatPrice(alert.currentPrice)}
            </strong>
          </span>
          {!isTriggered && diff > 0 && (
            <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              还差 {formatPrice(diff)} ({pct}%)
            </span>
          )}
          {isTriggered && (
            <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              已达目标价
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-1">创建于 {formatDate(alert.createdAt)}</div>
      </div>
      <button
        onClick={() => onDelete(alert.id)}
        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 shrink-0"
        aria-label="删除提醒"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
