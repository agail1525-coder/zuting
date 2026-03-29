"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import {
  fetchPointsProducts,
  fetchMyMembership,
  exchangeProduct,
  type PointsProductItem,
  type MembershipData,
} from "@/lib/api";

const CATEGORIES = [
  { key: "", label: "全部" },
  { key: "COUPON", label: "优惠券" },
  { key: "DISCOUNT", label: "行程折扣" },
  { key: "EXPERIENCE", label: "专属体验" },
  { key: "BADGE", label: "虚拟勋章" },
];

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
  const canAfford = available >= product.pointsCost;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">确认兑换</h3>
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-gray-800 mb-1">{product.name}</p>
          {product.description && (
            <p className="text-xs text-gray-500">{product.description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-gray-600">兑换消耗</span>
            <span className="text-lg font-bold text-red-500">{product.pointsCost.toLocaleString()} 积分</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-gray-600">当前可用积分</span>
            <span className={`text-sm font-semibold ${canAfford ? "text-green-600" : "text-red-500"}`}>
              {available.toLocaleString()}
            </span>
          </div>
        </div>
        {!canAfford && (
          <p className="text-xs text-red-500 mb-3 text-center">积分不足，无法兑换</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || !canAfford}
            className="flex-1 py-2.5 rounded-xl bg-[#0066FF] text-white font-semibold text-sm hover:bg-[#0052CC] transition-colors disabled:opacity-60"
          >
            {loading ? "兑换中..." : "确认兑换"}
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
            <span className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full">已售罄</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2">{product.name}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-lg font-bold text-red-500">{product.pointsCost.toLocaleString()}</span>
          <span className="text-xs text-red-400">积分</span>
        </div>
        {product.originalPrice != null && (
          <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
        )}
        <p className="text-xs text-gray-400">库存 {product.stock}</p>
        <button
          onClick={() => onExchange(product)}
          disabled={isSoldOut}
          className="mt-auto w-full py-2 rounded-lg bg-[#0066FF] text-white text-sm font-semibold hover:bg-[#0052CC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSoldOut ? "已售罄" : "立即兑换"}
        </button>
      </div>
    </div>
  );
}

export default function PointsMallPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<PointsProductItem[]>([]);
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmProduct, setConfirmProduct] = useState<PointsProductItem | null>(null);
  const [exchanging, setExchanging] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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
      setError(e instanceof Error ? e.message : "加载失败");
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
      setSuccessMsg(`兑换成功！已获得 ${confirmProduct.name}`);
      setConfirmProduct(null);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "兑换失败");
      setConfirmProduct(null);
    } finally {
      setExchanging(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">积分商城</h1>
          <p className="text-gray-500 text-sm mt-0.5">用积分兑换专属权益与好礼</p>
        </div>
        {membership && (
          <div className="text-right">
            <p className="text-xs text-gray-500">可用积分</p>
            <p className="text-2xl font-bold text-[#D4A855]">{membership.availablePoints.toLocaleString()}</p>
          </div>
        )}
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
        {CATEGORIES.map((c) => (
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
          <p className="text-gray-400 text-sm">加载中...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <div className="text-5xl mb-4">🛍️</div>
          <p className="text-sm">暂无商品</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onExchange={setConfirmProduct} />
          ))}
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
  );
}
