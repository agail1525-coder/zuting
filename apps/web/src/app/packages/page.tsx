"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchPackages, type PackageItem } from "@/lib/api";

const TYPE_TABS = [
  { key: "", label: "全部" },
  { key: "CLASSIC", label: "经典朝圣" },
  { key: "DEEP", label: "深度体验" },
  { key: "VIP", label: "尊享VIP" },
  { key: "FREE", label: "自由行" },
  { key: "GROUP", label: "团队" },
];

const SORT_OPTIONS = [
  { key: "price_asc", label: "价格从低到高" },
  { key: "price_desc", label: "价格从高到低" },
  { key: "duration_asc", label: "时长从短到长" },
  { key: "duration_desc", label: "时长从长到短" },
];

function formatPrice(cents: number) {
  return `¥${(cents / 100).toFixed(0)}`;
}

const INCLUDE_ICONS: Record<string, { icon: string; label: string }> = {
  hotel: { icon: "🏨", label: "住宿" },
  transport: { icon: "🚗", label: "交通" },
  guide: { icon: "👤", label: "导游" },
  meals: { icon: "🍽", label: "餐饮" },
};

function PackageCard({ pkg }: { pkg: PackageItem }) {
  const price = formatPrice(pkg.basePrice);
  const memberPrice = pkg.memberPrice != null ? formatPrice(pkg.memberPrice) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
      {/* Cover */}
      <div className="relative w-full h-48 bg-gray-100">
        {pkg.coverImage ? (
          <Image
            src={pkg.coverImage}
            alt={pkg.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">🌏</span>
          </div>
        )}
        {/* Duration badge */}
        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {pkg.duration}天{pkg.duration - 1}晚
        </div>
        {/* Type badge */}
        <div className="absolute top-3 left-3 bg-[#0066FF] text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {pkg.packageType}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">{pkg.name}</h3>

        {/* Includes icons */}
        <div className="flex gap-2 mb-3">
          {Object.entries(INCLUDE_ICONS).map(([key, info]) => {
            const included = pkg.includes?.[key];
            return (
              <span
                key={key}
                title={info.label}
                className={`text-base ${included ? "opacity-100" : "opacity-20"}`}
              >
                {info.icon}
              </span>
            );
          })}
          <span className="text-xs text-gray-500 ml-1">最多{pkg.maxPersons}人</span>
        </div>

        {/* Pricing */}
        <div className="flex items-end justify-between mt-2">
          <div>
            {memberPrice && (
              <p className="text-[#D4A855] text-sm font-semibold">
                会员价 {memberPrice}起
              </p>
            )}
            <p className={`text-lg font-bold ${memberPrice ? "text-gray-400 line-through text-sm" : "text-gray-900"}`}>
              {price}起
            </p>
          </div>
          <Link
            href={`/packages/${pkg.id}`}
            className="px-4 py-2 bg-[#0066FF] text-white text-sm font-semibold rounded-xl hover:bg-[#0052CC] transition-colors"
          >
            立即预订
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PackagesPage() {
  const [type, setType] = useState("");
  const [sort, setSort] = useState("price_asc");
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPackages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPackages({ type: type || undefined, page: 1 });
      let items = Array.isArray(data.items) ? data.items : [];

      // Client-side sort
      if (sort === "price_asc") items = [...items].sort((a, b) => a.basePrice - b.basePrice);
      else if (sort === "price_desc") items = [...items].sort((a, b) => b.basePrice - a.basePrice);
      else if (sort === "duration_asc") items = [...items].sort((a, b) => a.duration - b.duration);
      else if (sort === "duration_desc") items = [...items].sort((a, b) => b.duration - a.duration);

      setPackages(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [type, sort]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">旅行套餐</h1>
        <p className="text-gray-500 mt-1">精选朝圣路线，一站式服务，让每次旅行更从容</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Type tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1 scrollbar-none">
          {TYPE_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                type === t.key
                  ? "bg-[#0066FF] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="shrink-0 px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">加载中...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <div className="text-5xl mb-4">🌏</div>
          <p className="text-sm">暂无套餐</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  );
}
