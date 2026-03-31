"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { fetchMerchants, type Merchant } from "@/lib/api";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";

const MERCHANT_TYPES = [
  { key: "", labelKey: "common.all" },
  { key: "TEMPLE", labelKey: "merchant.type.TEMPLE" },
  { key: "GUIDE", labelKey: "merchant.type.GUIDE" },
  { key: "ACCOMMODATION", labelKey: "merchant.type.ACCOMMODATION" },
  { key: "TRANSPORT", labelKey: "merchant.type.TRANSPORT" },
];

const PAGE_SIZE = 12;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function TypeBadge({ type, t }: { type: string; t: (k: string) => string }) {
  const colorMap: Record<string, string> = {
    TEMPLE: "bg-red-50 text-red-700 border-red-200",
    GUIDE: "bg-green-50 text-green-700 border-green-200",
    ACCOMMODATION: "bg-purple-50 text-purple-700 border-purple-200",
    TRANSPORT: "bg-blue-50 text-blue-700 border-blue-200",
  };
  const cls = colorMap[type] || "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>
      {t(`merchant.type.${type}`) || type}
    </span>
  );
}

function MerchantCard({ merchant, t }: { merchant: Merchant; t: (k: string) => string }) {
  return (
    <Link
      href={`/merchants/${merchant.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group border border-gray-100"
    >
      <div className="aspect-[3/2] bg-gray-100 overflow-hidden relative">
        {merchant.logo ? (
          <OptimizedImage
            src={merchant.logo}
            alt={merchant.name}
            width={64}
            height={64}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <span className="text-5xl">
              {merchant.type === "TEMPLE" ? "🏛️" : merchant.type === "GUIDE" ? "🧭" : merchant.type === "ACCOMMODATION" ? "🏨" : "🚐"}
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <TypeBadge type={merchant.type} t={t} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-gray-900 font-semibold text-base leading-snug mb-1 group-hover:text-[#0066FF] transition-colors">
          {merchant.name}
        </h3>
        <StarRating rating={merchant.rating} />
        {merchant.description && (
          <p className="text-gray-500 text-sm line-clamp-2 mt-2">
            {merchant.description}
          </p>
        )}
        {merchant.address && (
          <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{merchant.address}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
          <span>{merchant.totalOrders} orders</span>
        </div>
      </div>
    </Link>
  );
}

export default function MerchantsPage() {
  const { t } = useTranslation();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeType, setActiveType] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetchMerchants({ type: activeType || undefined, page, pageSize: PAGE_SIZE })
      .then((res) => {
        setMerchants(res.items);
        setTotal(res.total);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [activeType, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const displayMerchants = useMemo(() => {
    if (!search.trim()) return merchants;
    const q = search.toLowerCase();
    return merchants.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.address?.toLowerCase().includes(q)
    );
  }, [merchants, search]);

  const stats = useMemo(() => {
    const avgRating = merchants.length > 0
      ? merchants.reduce((sum, m) => sum + m.rating, 0) / merchants.length
      : 0;
    return { total, avgRating };
  }, [merchants, total]);

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t("merchant.title")}</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            {t("merchant.subtitle") || "Discover trusted partners for your spiritual journey"}
          </p>

          {/* Stats */}
          {!loading && total > 0 && (
            <div className="flex items-center justify-center gap-8 mt-6">
              <div>
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-blue-200 text-xs">认证商家</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)} ★</p>
                <p className="text-blue-200 text-xs">平均评分</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-blue-200 text-xs">服务类型</p>
              </div>
            </div>
          )}

          <Link
            href="/merchants/register"
            className="inline-block mt-6 px-6 py-3 bg-white text-[#0066FF] font-semibold rounded-full hover:bg-blue-50 transition-colors shadow-lg"
          >
            {t("merchant.register")}
          </Link>
        </div>
      </section>

      {/* Filters + Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5">
        <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex flex-wrap gap-1 flex-1">
            {MERCHANT_TYPES.map((mt) => (
              <button
                key={mt.key}
                onClick={() => { setActiveType(mt.key); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeType === mt.key
                    ? "bg-[#0066FF] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {mt.key ? t(mt.labelKey) : (t("common.all") || "All")}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索商家名称..."
            className="w-full sm:w-56 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-[3/2] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{t("common.error") || "Failed to load data"}</p>
            <button
              onClick={() => { setError(false); setLoading(true); setPage(1); }}
              className="mt-4 px-6 py-2 bg-[#0066FF] text-white rounded-lg hover:bg-[#0052CC] transition-colors"
            >
              {t("common.retry") || "Retry"}
            </button>
          </div>
        ) : merchants.length === 0 ? (
          <>
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <p className="font-medium text-gray-900 mb-1">商家入驻招募中</p>
              <p className="text-sm text-gray-500 mb-4">我们正在邀请全球优质文化旅行服务商入驻平台</p>
              <Link href="/merchants/register" className="inline-block px-6 py-2.5 bg-[#0066FF] text-white rounded-xl font-medium hover:bg-[#0052CC] transition-colors text-sm">
                立即入驻
              </Link>
            </div>

            {/* Merchant categories */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">招募服务类型</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", title: "寺庙道场", desc: "佛教寺院、道教宫观、教堂等宗教场所", count: "50+" },
                  { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z", title: "专业导游", desc: "持证文化讲解员、朝圣领队", count: "100+" },
                  { icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", title: "住宿服务", desc: "禅修民宿、文化主题酒店、修行中心", count: "200+" },
                  { icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4", title: "交通服务", desc: "朝圣专线巴士、包车、接送机", count: "30+" },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{item.desc}</p>
                    <span className="text-xs text-[#0066FF] font-medium">目标招募{item.count}家</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits of joining */}
            <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">入驻优势</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "海量精准流量", desc: "平台汇聚全球朝圣爱好者，精准匹配您的服务", stat: "100,000+" },
                  { title: "零佣金入驻", desc: "首年免平台服务费，零门槛开始您的线上业务", stat: "0%" },
                  { title: "专属运营支持", desc: "提供店铺装修、营销策划、数据分析等全方位支持", stat: "7×24" },
                ].map((item, i) => (
                  <div key={i} className="text-center p-4">
                    <div className="text-3xl font-bold text-[#0066FF] mb-2">{item.stat}</div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10 hero-bg rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-2">成为合作商家</h2>
              <p className="text-blue-100 mb-5 max-w-xl mx-auto">加入全球最大的宗教文化旅行平台，连接百万朝圣者</p>
              <Link href="/merchants/register" className="inline-block px-8 py-3 bg-white text-[#0066FF] font-bold rounded-xl hover:bg-blue-50 transition-colors">
                免费申请入驻
              </Link>
            </div>
          </>
        ) : displayMerchants.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500">未找到匹配「{search}」的商家</p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 text-[#0066FF] hover:underline text-sm"
            >
              清除搜索
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayMerchants.map((m) => (
                <MerchantCard key={m.id} merchant={m} t={t} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  &laquo;
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        page === p
                          ? "bg-[#0066FF] text-white"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <MobileNav />
    </main>
  );
}
