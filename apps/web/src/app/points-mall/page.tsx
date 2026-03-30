"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import {
  fetchPointsProducts,
  fetchMyMembership,
  exchangeProduct,
  type PointsProductItem,
  type MembershipData,
} from "@/lib/api";

function getCategories(t: (key: string) => string) {
  return [
    { key: "", label: t("pointsMall.catAll") },
    { key: "COUPON", label: t("pointsMall.catCoupon") },
    { key: "DISCOUNT", label: t("pointsMall.catDiscount") },
    { key: "EXPERIENCE", label: t("pointsMall.catExperience") },
    { key: "BADGE", label: t("pointsMall.catBadge") },
  ];
}

function formatPrice(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`;
}

interface ConfirmModalProps {
  product: PointsProductItem;
  available: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function ConfirmModal({ product, available, onConfirm, onCancel, loading }: ConfirmModalProps) {
  const { t } = useTranslation();
  const canAfford = available >= product.pointsCost;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{t("pointsMall.confirmTitle")}</h3>
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-gray-800 mb-1">{product.name}</p>
          {product.description && (
            <p className="text-xs text-gray-500">{product.description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-gray-600">{t("pointsMall.exchangeCost")}</span>
            <span className="text-lg font-bold text-red-500">{product.pointsCost.toLocaleString()} {t("pointsMall.points")}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-gray-600">{t("pointsMall.currentPoints")}</span>
            <span className={`text-sm font-semibold ${canAfford ? "text-green-600" : "text-red-500"}`}>
              {available.toLocaleString()}
            </span>
          </div>
        </div>
        {!canAfford && (
          <p className="text-xs text-red-500 mb-3 text-center">{t("pointsMall.insufficientPoints")}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            {t("pointsMall.cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || !canAfford}
            className="flex-1 py-2.5 rounded-xl bg-[#0066FF] text-white font-semibold text-sm hover:bg-[#0052CC] transition-colors disabled:opacity-60"
          >
            {loading ? t("pointsMall.exchanging") : t("pointsMall.confirmExchange")}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: PointsProductItem;
  onExchange: (p: PointsProductItem) => void;
}

function ProductCard({ product, onExchange }: ProductCardProps) {
  const { t } = useTranslation();
  const isSoldOut = product.stock <= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Image */}
      <div className="relative w-full aspect-square bg-gray-100">
        {product.coverImage ? (
          <Image
            src={product.coverImage}
            alt={product.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>
        )}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full">{t("pointsMall.soldOut")}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2">{product.name}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-lg font-bold text-red-500">{product.pointsCost.toLocaleString()}</span>
          <span className="text-xs text-red-400">{t("pointsMall.points")}</span>
        </div>
        {product.originalPrice != null && (
          <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
        )}
        <p className="text-xs text-gray-400">{t("pointsMall.stock")} {product.stock}</p>
        <button
          onClick={() => onExchange(product)}
          disabled={isSoldOut}
          className="mt-auto w-full py-2 rounded-lg bg-[#0066FF] text-white text-sm font-semibold hover:bg-[#0052CC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSoldOut ? t("pointsMall.soldOut") : t("pointsMall.exchangeNow")}
        </button>
      </div>
    </div>
  );
}

export default function PointsMallPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<PointsProductItem[]>([]);
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmProduct, setConfirmProduct] = useState<PointsProductItem | null>(null);
  const [exchanging, setExchanging] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [prods, mem] = await Promise.all([
        fetchPointsProducts(category || undefined, 1),
        fetchMyMembership(),
      ]);
      setProducts(Array.isArray(prods.items) ? prods.items : []);
      setMembership(mem);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pointsMall.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const handleExchange = async () => {
    if (!confirmProduct) return;
    setExchanging(true);
    try {
      await exchangeProduct(confirmProduct.id);
      setSuccessMsg(t("pointsMall.exchangeSuccess", { name: confirmProduct.name }));
      setConfirmProduct(null);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pointsMall.exchangeFailed"));
      setConfirmProduct(null);
    } finally {
      setExchanging(false);
    }
  };

  // Client-side search
  const displayProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const inStock = products.filter((p) => p.stock > 0).length;
    const cheapest = products.reduce((min, p) => Math.min(min, p.pointsCost), Infinity);
    return { total: products.length, inStock, cheapest: cheapest === Infinity ? 0 : cheapest };
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0066FF]">{t("pointsMall.title")}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {t("pointsMall.subtitle")}
            {products.length > 0 && (
              <span className="ml-2 text-gray-400">· {stats.inStock} 件可兑 · {stats.cheapest} 积分起</span>
            )}
          </p>
        </div>
        {membership && (
          <div className="text-right">
            <p className="text-xs text-gray-500">{t("pointsMall.availablePoints")}</p>
            <p className="text-2xl font-bold text-[#D4A855]">{membership.availablePoints.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Points Balance Card */}
      {membership && (
        <div className="mb-6 bg-gradient-to-r from-[#D4A855] to-amber-500 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">可用积分</p>
              <p className="text-3xl font-bold mt-1">{membership.availablePoints.toLocaleString()}</p>
              <p className="text-white/60 text-xs mt-1">{membership.levelName} · 累计 {membership.totalPoints.toLocaleString()} 积分</p>
            </div>
            <Link href="/membership" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors border border-white/30">
              赚取积分 →
            </Link>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索商品名称..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
          <span>✓</span> {successMsg}
          <button className="ml-auto text-green-500 hover:text-green-700" onClick={() => setSuccessMsg("")}>✕</button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {getCategories(t).map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === c.key
                ? "bg-[#0066FF] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{t("pointsMall.loading")}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <div className="text-5xl mb-4">🛍️</div>
          <p className="text-sm">{t("pointsMall.noProducts")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {displayProducts.map((p) => (
              <ProductCard key={p.id} product={p} onExchange={setConfirmProduct} />
            ))}
          </div>
          {searchQuery && displayProducts.length === 0 && products.length > 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <p>没有找到匹配的商品</p>
              <button onClick={() => setSearchQuery("")} className="mt-2 text-sm text-[#0066FF] hover:underline">清除搜索</button>
            </div>
          )}
        </>
      )}

      {/* Bottom CTA */}
      {!loading && products.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-[#D4A855]/10 to-amber-50 rounded-2xl p-6 border border-[#D4A855]/20 text-center">
          <span className="text-2xl block mb-2">🏆</span>
          <h3 className="text-base font-semibold text-gray-900">积分不够？轻松赚取更多</h3>
          <p className="text-gray-500 text-xs mt-1">每日签到、写日志、发评价都能获得积分</p>
          <Link
            href="/membership"
            className="inline-block mt-4 px-6 py-2.5 bg-[#D4A855] text-white font-semibold rounded-xl text-sm hover:bg-[#C4983F] transition-colors"
          >
            查看赚分攻略 →
          </Link>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmProduct && (
        <ConfirmModal
          product={confirmProduct}
          available={membership?.availablePoints ?? 0}
          onConfirm={handleExchange}
          onCancel={() => setConfirmProduct(null)}
          loading={exchanging}
        />
      )}
      </div>
      <MobileNav />
    </div>
  );
}
