"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchPromotions, type PromotionItem } from "@/lib/api";

function useCountdown(target: Date | null) {
  const compute = () => {
    if (!target) return { h: 0, m: 0, s: 0, done: true };
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      done: diff === 0,
    };
  };
  const [t, setT] = useState(compute);
  useEffect(() => {
    const id = setInterval(() => setT(compute()), 1000);
    return () => clearInterval(id);
  });
  return t;
}

export default function PriceFlashDeal() {
  const [promo, setPromo] = useState<PromotionItem | null>(null);

  useEffect(() => {
    let alive = true;
    fetchPromotions("FLASH_SALE", 1)
      .then((data) => {
        if (!alive) return;
        const arr = Array.isArray(data?.items) ? data.items : [];
        const first = arr.find((p) => p.type?.toUpperCase() === "FLASH_SALE") || arr[0];
        if (first) setPromo(first);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const endsAt = useMemo(() => {
    if (!promo?.endAt) return null;
    const d = new Date(promo.endAt);
    return isNaN(d.getTime()) ? null : d;
  }, [promo]);

  const cd = useCountdown(endsAt);

  if (!promo) {
    return (
      <section className="relative rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-2">🎁</div>
          <p className="text-sm font-semibold text-gray-700">暂无限时闪购</p>
          <p className="text-xs text-gray-400 mt-1">新一波活动即将上线</p>
        </div>
      </section>
    );
  }

  const discountText =
    promo.discountType === "PERCENT"
      ? `${promo.discountValue}% OFF`
      : `立减 ¥${(promo.discountValue / 100).toFixed(0)}`;

  return (
    <section className="relative rounded-2xl overflow-hidden shadow-sm border border-red-100">
      <div
        className="h-full bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 text-white p-5"
        style={promo.coverImage ? { backgroundImage: `linear-gradient(135deg, rgba(220,38,38,0.92), rgba(249,115,22,0.9)), url(${promo.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-black uppercase tracking-widest">今日闪购</span>
          <span className="text-lg">⚡</span>
        </div>
        <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{promo.name}</h3>
        {promo.description && <p className="text-xs text-white/80 mb-3 line-clamp-2">{promo.description}</p>}
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-black leading-none">{discountText}</p>
            {endsAt && !cd.done && (
              <p className="text-[11px] text-white/80 mt-2 font-mono">
                剩 {String(cd.h).padStart(2, "0")}:{String(cd.m).padStart(2, "0")}:{String(cd.s).padStart(2, "0")}
              </p>
            )}
          </div>
          <Link
            href={`/promotions/${promo.id}`}
            className="px-4 py-2 rounded-xl bg-white text-rose-600 text-xs font-bold whitespace-nowrap hover:bg-rose-50 transition-colors"
          >
            立即抢
          </Link>
        </div>
      </div>
    </section>
  );
}
