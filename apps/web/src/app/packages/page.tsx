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
          <>
            <div className="py-12 text-center text-gray-400">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <p className="font-medium text-gray-900 mb-1">套餐即将上线</p>
              <p className="text-sm text-gray-500">我们正在精心策划更多朝圣套餐，敬请期待</p>
              {(type || search) && (
                <button onClick={() => { setType(""); setSearch(""); }} className="mt-3 text-sm text-[#0066FF] hover:underline">清除筛选条件</button>
              )}
            </div>

            {/* Showcase: What packages will include */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">精品套餐即将推出</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { title: "禅修体验·五台山3日", type: "深度体验", duration: "3天2晚", price: "¥2,980", desc: "深入五台山核心寺院，体验晨钟暮鼓的禅修生活" },
                  { title: "丝路朝圣·敦煌5日VIP", type: "尊享VIP", duration: "5天4晚", price: "¥8,980", desc: "专属导游+豪华住宿，探访莫高窟、月牙泉等丝路圣地" },
                  { title: "东南亚佛教圣地7日团", type: "经典朝圣", duration: "7天6晚", price: "¥5,680", desc: "泰国+柬埔寨双国联游，探访吴哥窟、玉佛寺等经典圣地" },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <svg className="w-16 h-16 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-[#0066FF] text-white text-xs rounded-full">{item.type}</span>
                        <span className="text-xs text-gray-400">{item.duration}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">{item.desc}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-lg font-bold text-[#0066FF]">{item.price}<span className="text-xs text-gray-400 font-normal">起</span></span>
                        <span className="text-xs text-gray-400">即将上线</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}

        {/* Why choose packages */}
        <div className="mt-14 bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">为什么选择套餐</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: "免费取消", desc: "出发前7天可免费取消" },
              { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: "最低价保障", desc: "同路线同日期最低价" },
              { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "即时确认", desc: "下单后秒级确认出行" },
              { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", title: "专业导游", desc: "持证专业文化讲解员" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">常见问题</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: "套餐包含哪些服务？", a: "套餐通常包含交通、住宿、景点门票和专业导游。具体包含项以套餐详情页为准，部分套餐还提供餐饮和保险。" },
              { q: "如何选择适合自己的套餐？", a: "可以根据预算、时间和体力状况筛选。经典朝圣适合首次出行，深度体验适合资深朝圣者，VIP提供最高品质服务。" },
              { q: "套餐可以定制吗？", a: "可以！点击下方\"AI规划师定制\"按钮，描述您的需求，AI会为您量身打造专属套餐方案。" },
              { q: "多人出行有优惠吗？", a: "3人以上同行可享团队折扣，部分套餐提供早鸟价和会员专属价，最高可节省25%。" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm mb-2">{item.q}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 hero-bg rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">找不到合适的套餐？</h2>
          <p className="text-blue-100 mb-5">告诉AI规划师你的需求，为你量身定制专属朝圣方案</p>
          <Link href="/chat" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-[#0066FF] font-bold rounded-xl hover:bg-blue-50 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            AI智能定制
          </Link>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
