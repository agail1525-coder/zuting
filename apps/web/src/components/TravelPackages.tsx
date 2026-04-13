"use client";
import { useEffect, useState } from "react";

type Tier = "LUXURY" | "BUSINESS" | "STANDARD" | "BUDGET";
type Category = "HOTEL" | "RESTAURANT" | "TRANSPORT" | "EXPERIENCE" | "SHOPPING" | "GUIDE" | "GROUND_TEAM";

interface Package {
  id: string;
  tier: Tier;
  category: Category;
  title: string;
  titleEn?: string | null;
  description: string;
  priceMin: number;
  priceMax: number;
  currency: string;
  priceUnit: string;
  groundTeamName?: string | null;
  groundTeamPhone?: string | null;
  groundTeamHours?: string | null;
  groundTeamNote?: string | null;
  sourceUrls: string[];
  leadTimeDays: number;
  bestMonths: number[];
}

const TIER_META: Record<Tier, { label: string; color: string; bg: string; desc: string }> = {
  LUXURY: { label: "尊贵游", color: "#8B6914", bg: "#FDF6E3", desc: "奢华私享 · 学者级深度" },
  BUSINESS: { label: "商务游", color: "#1E3A8A", bg: "#EFF6FF", desc: "高效精致 · 商务品质" },
  STANDARD: { label: "标准游", color: "#059669", bg: "#ECFDF5", desc: "经典跟团 · 性价比高" },
  BUDGET: { label: "自助游", color: "#D97706", bg: "#FFFBEB", desc: "经济自由 · 背包随行" },
};

const CAT_META: Record<Category, { label: string; icon: string }> = {
  HOTEL: { label: "住", icon: "🏨" },
  RESTAURANT: { label: "食", icon: "🍽️" },
  TRANSPORT: { label: "行", icon: "🚗" },
  EXPERIENCE: { label: "游", icon: "🎭" },
  SHOPPING: { label: "购", icon: "🛍️" },
  GUIDE: { label: "向导", icon: "🧭" },
  GROUND_TEAM: { label: "地接", icon: "📞" },
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3002/api";

function fmtMoney(min: number, max: number, currency: string, unit: string) {
  if (min === 0 && max === 0) return `${unit}`;
  const symbol = currency === "USD" ? "$" : "¥";
  const minY = (min / 100).toLocaleString();
  const maxY = (max / 100).toLocaleString();
  return `${symbol}${minY} - ${symbol}${maxY} / ${unit}`;
}

export default function TravelPackages({ siteId }: { siteId: string }) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [tier, setTier] = useState<Tier>("STANDARD");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/destination-packages?holySiteId=${siteId}&tier=${tier}`)
      .then((r) => r.json())
      .then((data) => {
        setPackages(Array.isArray(data) ? data : (data?.items ?? []));
      })
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, [siteId, tier]);

  const meta = TIER_META[tier];
  const byCat = packages.reduce<Record<string, Package[]>>((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  return (
    <section className="mt-6">
      <h2 className="text-lg font-bold text-[#0f294d] mb-3">
        旅游配套 <span className="text-xs font-normal text-[#8592a6]">· 4 档分级 · 7 类全矩阵</span>
      </h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(TIER_META) as Tier[]).map((t) => {
          const m = TIER_META[t];
          const active = t === tier;
          return (
            <button
              key={t}
              onClick={() => setTier(t)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition border"
              style={{
                backgroundColor: active ? m.color : m.bg,
                color: active ? "#fff" : m.color,
                borderColor: m.color,
              }}
            >
              {m.label}
              <span className="ml-1 opacity-70 text-xs">{m.desc}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-8 text-[#8592a6]">加载中...</div>
      ) : packages.length === 0 ? (
        <div className="text-center py-8 text-[#8592a6]">该档次暂无配套，请切换其他档次或咨询当地地接服务团队</div>
      ) : (
        <div className="space-y-4">
          {(Object.keys(CAT_META) as Category[]).map((cat) => {
            const items = byCat[cat];
            if (!items || items.length === 0) return null;
            const cm = CAT_META[cat];
            return (
              <div key={cat} className="rounded-xl border border-gray-200 p-4" style={{ backgroundColor: meta.bg }}>
                <h3 className="font-bold text-[#0f294d] mb-2 flex items-center gap-2">
                  <span className="text-xl">{cm.icon}</span>
                  {cm.label}
                  <span className="text-xs font-normal text-[#8592a6]">({items.length})</span>
                </h3>
                <div className="space-y-2">
                  {items.map((p) => (
                    <div key={p.id} className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="font-semibold text-[#0f294d]">{p.title}</div>
                          <div className="text-sm text-[#5b6b85] mt-1 line-clamp-2">{p.description}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-sm" style={{ color: meta.color }}>
                            {fmtMoney(p.priceMin, p.priceMax, p.currency, p.priceUnit)}
                          </div>
                          <div className="text-xs text-[#8592a6] mt-1">
                            {p.leadTimeDays > 0 && `提前 ${p.leadTimeDays} 天 · `}
                            {p.bestMonths.length > 0 && `${p.bestMonths.join("/")} 月最佳`}
                          </div>
                        </div>
                      </div>
                      {(p.groundTeamName || p.groundTeamPhone) && (
                        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-[#5b6b85]">
                          <span className="font-semibold">📞 地接：</span>
                          {p.groundTeamName}
                          {p.groundTeamPhone && ` · ${p.groundTeamPhone}`}
                          {p.groundTeamHours && ` · ${p.groundTeamHours}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 text-xs text-[#8592a6]">
        💡 具体酒店/餐厅/向导由当地持证地接团队按需求定制。请咨询当地地接服务团队确认价格与可用性。
      </div>
    </section>
  );
}
