"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import MobileNav from "@/components/MobileNav";
import { fetchPackages, type PackageItem } from "@/lib/api";

const TYPE_TABS = [
  { key: "", label: "全部", icon: "🌏" },
  { key: "CLASSIC", label: "经典朝圣", icon: "🕌" },
  { key: "DEEP", label: "深度体验", icon: "🧘" },
  { key: "VIP", label: "尊享VIP", icon: "👑" },
  { key: "FREE", label: "自由行", icon: "🎒" },
  { key: "GROUP", label: "团队", icon: "👥" },
];

const SORT_OPTIONS = [
  { key: "price_asc", label: "价格从低到高" },
  { key: "price_desc", label: "价格从高到低" },
  { key: "duration_asc", label: "时长从短到长" },
  { key: "duration_desc", label: "时长从长到短" },
  { key: "popular", label: "最受欢迎" },
];

const TRUST_BADGES = [
  { icon: "🛡️", text: "免费取消" },
  { icon: "💰", text: "最低价保障" },
  { icon: "⚡", text: "即时确认" },
  { icon: "👨‍🏫", text: "专业导游" },
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
  const savings = pkg.memberPrice != null ? Math.round((1 - pkg.memberPrice / pkg.basePrice) * 100) : 0;

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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-5xl">🌏</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {/* Duration badge */}
        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
          {pkg.duration}天{pkg.duration - 1}晚
        </div>
        {/* Type badge */}
        <div className="absolute top-3 left-3 bg-[#0066FF] text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {TYPE_TABS.find((t) => t.key === pkg.packageType)?.label ?? pkg.packageType}
        </div>
        {/* Member savings badge */}
        {savings > 0 && (
          <div className="absolute bottom-3 left-3 bg-[#D4A855] text-white text-xs font-bold px-2.5 py-1 rounded-full">
            会员省{savings}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-[#0066FF] transition-colors">
          {pkg.name}
        </h3>

        {pkg.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{pkg.description}</p>
        )}

        {/* Includes icons */}
        <div className="flex gap-3 mb-3">
          {Object.entries(INCLUDE_ICONS).map(([key, info]) => {
            const included = pkg.includes?.[key];
            return (
              <span
                key={key}
                title={included ? `包含${info.label}` : `不含${info.label}`}
                className={`flex items-center gap-1 text-xs ${included ? "text-gray-700" : "text-gray-300"}`}
              >
                <span className="text-sm">{info.icon}</span>
                {included && <span>{info.label}</span>}
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span>最多{pkg.maxPersons}人</span>
          <span>·</span>
          <span>{pkg.duration}天行程</span>
        </div>

        {/* Pricing */}
        <div className="flex items-end justify-between pt-3 border-t border-gray-100">
          <div>
            {memberPrice && (
              <p className="text-[#D4A855] text-sm font-semibold">
                会员价 {memberPrice}起
              </p>
            )}
            <p
              className={`font-bold ${
                memberPrice ? "text-gray-400 line-through text-sm" : "text-xl text-gray-900"
              }`}
            >
              {price}起
            </p>
          </div>
          <Link
            href={`/packages/${pkg.id}`}
            className="px-4 py-2 bg-[#0066FF] text-white text-sm font-semibold rounded-xl hover:bg-[#0052CC] transition-colors shadow-sm shadow-blue-500/20"
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
  const [search, setSearch] = useState("");
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPackages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPackages({ type: type || undefined, page: 1 });
      setPackages(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const filtered = useMemo(() => {
    let items = packages;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === "price_asc") items = [...items].sort((a, b) => a.basePrice - b.basePrice);
    else if (sort === "price_desc") items = [...items].sort((a, b) => b.basePrice - a.basePrice);
    else if (sort === "duration_asc") items = [...items].sort((a, b) => a.duration - b.duration);
    else if (sort === "duration_desc") items = [...items].sort((a, b) => b.duration - a.duration);
    else if (sort === "popular") items = [...items].sort((a, b) => b.maxPersons - a.maxPersons);

    return items;
  }, [packages, search, sort]);

  // Price stats
  const priceStats = useMemo(() => {
    if (packages.length === 0) return null;
    const prices = packages.map((p) => p.basePrice / 100);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      count: packages.length,
    };
  }, [packages]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">旅行套餐</h1>
          <p className="text-gray-500 mt-2 text-lg">
            精选朝圣路线，一站式服务，让每次旅行更从容
          </p>
          {priceStats && (
            <p className="text-sm text-gray-400 mt-1">
              {priceStats.count} 个套餐 · ¥{priceStats.min.toLocaleString()} - ¥{priceStats.max.toLocaleString()}
            </p>
          )}
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mb-8">
          {TRUST_BADGES.map((badge) => (
            <div key={badge.text} className="flex items-center gap-1.5 text-sm text-gray-600">
              <span>{badge.icon}</span>
              <span className="font-medium">{badge.text}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索套餐名称或描述..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Type tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 flex-1 scrollbar-none">
              {TYPE_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    type === t.key
                      ? "bg-[#0066FF] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>{t.icon}</span> {t.label}
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
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active filter summary */}
          {(type || search) && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-gray-400">
                找到 {filtered.length} 个套餐
              </span>
              <button
                onClick={() => {
                  setType("");
                  setSearch("");
                }}
                className="text-[#0066FF] hover:underline text-xs"
              >
                清除筛选
              </button>
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">加载中...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <div className="text-5xl mb-4">🌏</div>
            <p className="text-sm">暂无套餐</p>
            {(type || search) && (
              <button
                onClick={() => {
                  setType("");
                  setSearch("");
                }}
                className="mt-3 text-sm text-[#0066FF] hover:underline"
              >
                清除筛选条件
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400 mb-3">找不到合适的？</p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            ✨ 让AI规划师定制专属套餐
          </Link>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
