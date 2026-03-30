"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import ShareButton from "@/components/ShareButton";
import OptimizedImage from "@/components/OptimizedImage";
import { fetchMerchantDetail, type Merchant } from "@/lib/api";
import MobileNav from "@/components/MobileNav";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-gray-600 ml-1 font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function MerchantDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const id = params?.id as string;

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchMerchantDetail(id)
      .then(setMerchant)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-64 bg-gray-200 rounded-xl mb-6" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !merchant) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{t("common.error") || "Failed to load"}</p>
          <Link href="/merchants" className="text-[#0066FF] hover:underline">&larr; {t("common.back") || "Back"}</Link>
        </div>
      </main>
    );
  }

  const typeLabel = t(`merchant.type.${merchant.type}`) || merchant.type;

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/merchants" className="text-blue-200 hover:text-white text-sm mb-4 inline-flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {t("merchant.title")}
          </Link>

          <div className="flex flex-col sm:flex-row items-start gap-6 mt-4">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shrink-0">
              {merchant.logo ? (
                <OptimizedImage src={merchant.logo} alt={merchant.name} width={120} height={120} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">
                  {merchant.type === "TEMPLE" ? "🏛️" : merchant.type === "GUIDE" ? "🧭" : merchant.type === "ACCOMMODATION" ? "🏨" : "🚐"}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold">{merchant.name}</h1>
                <span className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">{typeLabel}</span>
              </div>
              <div className="mt-2">
                <StarRating rating={merchant.rating} />
              </div>
              {merchant.address && (
                <div className="flex items-center gap-1.5 mt-2 text-blue-100 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {merchant.address}
                </div>
              )}
            </div>
            <div className="shrink-0">
              <ShareButton
                title={merchant.name}
                description={merchant.description || ""}
                url={typeof window !== "undefined" ? window.location.href : ""}
                entityType="merchant"
                entityId={merchant.id}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Description */}
        {merchant.description && (
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t("common.description") || "Description"}</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{merchant.description}</p>
          </section>
        )}

        {/* Services */}
        {merchant.services && merchant.services.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("merchant.services") || "Services"}</h2>
            <div className="divide-y divide-gray-100">
              {merchant.services.filter(s => s.isActive).map((svc) => (
                <div key={svc.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{svc.name}</h3>
                    {svc.description && (
                      <p className="text-gray-500 text-sm mt-1">{svc.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      {svc.duration != null && <span>{svc.duration} min</span>}
                      {svc.maxPersons != null && <span>Max {svc.maxPersons} pax</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-[#0066FF]">&yen;{svc.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact Info */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("merchant.contact") || "Contact"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {merchant.contactPhone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">{t("merchant.phone") || "Phone"}</p>
                  <p className="text-gray-900">{merchant.contactPhone}</p>
                </div>
              </div>
            )}
            {merchant.contactEmail && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">{t("merchant.email") || "Email"}</p>
                  <p className="text-gray-900">{merchant.contactEmail}</p>
                </div>
              </div>
            )}
            {merchant.address && (
              <div className="flex items-center gap-3 sm:col-span-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">{t("merchant.address") || "Address"}</p>
                  <p className="text-gray-900">{merchant.address}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#0066FF]">{merchant.totalOrders}</p>
              <p className="text-gray-500 text-sm">{t("merchant.totalOrders") || "Total Orders"}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0066FF]">{merchant.rating.toFixed(1)}</p>
              <p className="text-gray-500 text-sm">{t("merchant.ratingLabel") || "Rating"}</p>
            </div>
          </div>
        </section>
      </div>
      <MobileNav />
    </main>
  );
}
