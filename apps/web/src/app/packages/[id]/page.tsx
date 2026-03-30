"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import ShareButton from "@/components/ShareButton";
import { fetchPackage, bookPackage, type PackageItem } from "@/lib/api";
import MobileNav from "@/components/MobileNav";

function formatPrice(cents: number) {
  return `¥${(cents / 100).toFixed(0)}`;
}

const INCLUDE_ICONS: Record<string, { icon: string; label: string }> = {
  hotel: { icon: "🏨", label: "住宿" },
  transport: { icon: "🚗", label: "交通" },
  guide: { icon: "👤", label: "导游" },
  meals: { icon: "🍽", label: "餐饮" },
};

export default function PackageDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [pkg, setPkg] = useState<PackageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking form
  const [persons, setPersons] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchPackage(id)
      .then(setPkg)
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!startDate) {
      setBookError("请选择出发日期");
      return;
    }
    setBooking(true);
    setBookError("");
    try {
      await bookPackage(id, {
        persons,
        startDate,
        contactName: contactName || undefined,
        contactPhone: contactPhone || undefined,
      });
      router.push("/profile?tab=bookings");
    } catch (e) {
      setBookError(e instanceof Error ? e.message : "预订失败");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">{error || "套餐不存在"}</p>
        <Link href="/packages" className="text-[#0066FF] hover:underline text-sm">
          返回套餐列表
        </Link>
      </div>
    );
  }

  const totalPrice = pkg.basePrice * persons;
  const memberTotalPrice = pkg.memberPrice != null ? pkg.memberPrice * persons : null;
  const minDate = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-4 flex items-center gap-2">
        <Link href="/packages" className="hover:text-[#0066FF] transition-colors">套餐</Link>
        <span>/</span>
        <span className="text-gray-700 truncate">{pkg.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Hero Image */}
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-gray-100">
            {pkg.coverImage ? (
              <Image
                src={pkg.coverImage}
                alt={pkg.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🌏</div>
            )}
            <div className="absolute top-4 right-4 bg-black/60 text-white text-sm font-medium px-3 py-1.5 rounded-full">
              {pkg.duration}天{pkg.duration - 1}晚
            </div>
          </div>

          {/* Title & Pricing */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{pkg.name}</h1>
              <ShareButton
                title={pkg.name}
                description={pkg.description ?? undefined}
                url={`/packages/${pkg.id || id}`}
                entityType="PACKAGE"
                entityId={pkg.id || id}
              />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(pkg.basePrice)}<span className="text-sm text-gray-500 font-normal">/人起</span></p>
              </div>
              {pkg.memberPrice != null && (
                <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-xl">
                  <span className="text-xs text-yellow-600">会员价</span>
                  <span className="text-lg font-bold text-[#D4A855]">{formatPrice(pkg.memberPrice)}<span className="text-xs font-normal">/人</span></span>
                </div>
              )}
            </div>
          </div>

          {/* Includes */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">套餐包含</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(INCLUDE_ICONS).map(([key, info]) => {
                const included = pkg.includes?.[key];
                return (
                  <div
                    key={key}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${
                      included
                        ? "border-green-200 bg-green-50"
                        : "border-gray-100 bg-gray-50 opacity-40"
                    }`}
                  >
                    <span className="text-2xl">{info.icon}</span>
                    <span className="text-xs font-medium text-gray-700">{info.label}</span>
                    {included ? (
                      <span className="text-xs text-green-600 font-medium">已包含</span>
                    ) : (
                      <span className="text-xs text-gray-400">未包含</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          {pkg.description && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">套餐介绍</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{pkg.description}</p>
            </div>
          )}

          {/* Additional info */}
          <div className="flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <span>👥</span>
              <span>最多 {pkg.maxPersons} 人</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>📅</span>
              <span>{pkg.duration} 天行程</span>
            </div>
          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="lg:col-span-2">
          <div className="sticky top-20 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">立即预订</h2>

            <div className="space-y-4">
              {/* Persons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">出行人数</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPersons(Math.max(1, persons - 1))}
                    className="w-9 h-9 rounded-xl border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                  >
                    -
                  </button>
                  <span className="text-lg font-bold text-gray-900 w-6 text-center">{persons}</span>
                  <button
                    onClick={() => setPersons(Math.min(pkg.maxPersons, persons + 1))}
                    className="w-9 h-9 rounded-xl border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                  >
                    +
                  </button>
                  <span className="text-xs text-gray-400">最多 {pkg.maxPersons} 人</span>
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">出发日期</label>
                <input
                  type="date"
                  value={startDate}
                  min={minDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
                />
              </div>

              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">联系人姓名（选填）</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="请输入联系人姓名"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">联系电话（选填）</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="请输入联系电话"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
                />
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">原价 × {persons}人</span>
                  <span className="text-gray-700">{formatPrice(totalPrice)}</span>
                </div>
                {memberTotalPrice != null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#D4A855] font-medium">会员价 × {persons}人</span>
                    <span className="text-[#D4A855] font-bold">{formatPrice(memberTotalPrice)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">合计</span>
                  <span className="text-lg font-bold text-[#0066FF]">
                    {formatPrice(memberTotalPrice ?? totalPrice)}
                  </span>
                </div>
              </div>

              {bookError && (
                <p className="text-xs text-red-500">{bookError}</p>
              )}

              <button
                onClick={handleBook}
                disabled={booking || authLoading}
                className="w-full py-3 bg-[#0066FF] text-white font-bold rounded-xl hover:bg-[#0052CC] transition-colors disabled:opacity-60 text-sm"
              >
                {booking ? "提交中..." : user ? "立即预订" : "登录后预订"}
              </button>

              <p className="text-xs text-gray-400 text-center">预订后将由客服与您确认行程详情</p>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
