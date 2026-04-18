import { useEffect, useState } from "react";
import { fetchTpPackages, TP_TIER_META, type TpPackageItem, type TpTier } from "@/lib/api";

const TIERS: TpTier[] = ["LUXURY", "BUSINESS", "STANDARD", "BUDGET"];

interface Props {
  holySiteId: string;
}

export default function TpPackages({ holySiteId }: Props) {
  const [tier, setTier] = useState<TpTier>("STANDARD");
  const [items, setItems] = useState<TpPackageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTpPackages(holySiteId, tier)
      .then((r) => {
        if (!cancelled) setItems(r);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [holySiteId, tier]);

  const tierMeta = TP_TIER_META[tier];

  return (
    <section className="bg-white rounded-2xl p-4 mb-4">
      <header className="flex items-center gap-2 mb-3 px-2">
        <span className="text-lg" style={{ color: tierMeta.color }}>🏷️</span>
        <h3 className="text-base font-bold text-gray-900">旅游配套</h3>
      </header>

      <div className="flex gap-2 overflow-x-auto mb-3 px-2">
        {TIERS.map((tn) => {
          const m = TP_TIER_META[tn];
          const active = tn === tier;
          return (
            <button
              key={tn}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                active ? "text-white" : "bg-gray-100 text-gray-700"
              }`}
              style={active ? { backgroundColor: m.color } : undefined}
              onClick={() => setTier(tn)}
            >
              {m.icon} {m.name}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-gray-400">加载中…</div>
      ) : items.length === 0 ? (
        <div className="py-6 text-center text-xs text-gray-400">该档位暂无配套</div>
      ) : (
        <div className="space-y-2 px-2">
          {items.slice(0, 6).map((it) => (
            <div
              key={it.id}
              className="flex border border-gray-200 rounded-lg overflow-hidden"
              style={{ borderLeftWidth: 4, borderLeftColor: tierMeta.color }}
            >
              {it.coverImage ? (
                <img src={it.coverImage} alt={it.name} className="w-24 h-24 object-cover bg-gray-100" />
              ) : (
                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="#9ca3af" className="w-7 h-7">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
              )}
              <div className="flex-1 p-2.5 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold tracking-wide" style={{ color: tierMeta.color }}>
                    {it.category}
                  </span>
                  {it.rating ? (
                    <span className="flex items-center gap-0.5 text-[11px] text-gray-500">
                      <span className="text-yellow-400">★</span>
                      {it.rating.toFixed(1)}
                    </span>
                  ) : null}
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mt-1 truncate">{it.name}</h4>
                {it.description ? (
                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">{it.description}</p>
                ) : null}
                <p className="text-sm font-bold mt-1" style={{ color: tierMeta.color }}>
                  {it.currency === "CNY" ? "￥" : it.currency} {it.priceFrom.toLocaleString()}起
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
