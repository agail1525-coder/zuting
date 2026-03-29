"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { fetchMerchants, type Merchant } from "@/lib/api";

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
          <img
            src={merchant.logo}
            alt={merchant.name}
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

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t("merchant.title")}</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            {t("merchant.subtitle") || "Discover trusted partners for your spiritual journey"}
          </p>
          <Link
            href="/merchants/register"
            className="inline-block mt-6 px-6 py-3 bg-white text-[#0066FF] font-semibold rounded-full hover:bg-blue-50 transition-colors shadow-lg"
          >
            {t("merchant.register")}
          </Link>
        </div>
      </section>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5">
        <div className="bg-white rounded-xl shadow-sm p-2 flex flex-wrap gap-1">
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
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏪</div>
            <p className="text-gray-500 text-lg">{t("common.empty") || "No merchants found"}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {merchants.map((m) => (
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
    </main>
  );
}
