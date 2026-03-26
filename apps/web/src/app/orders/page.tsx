"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getAccessToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

interface OrderItem {
  id: string;
  orderNo: string;
  amount: number;
  status: string;
  tripId: string;
  trip?: {
    id: string;
    title: string;
  };
  createdAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  PENDING: {
    label: "待支付",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  PAID: {
    label: "已支付",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  CANCELLED: {
    label: "已取消",
    color: "text-temple-400",
    bg: "bg-temple-600/10",
    border: "border-temple-600/20",
  },
  REFUNDING: {
    label: "退款中",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  REFUNDED: {
    label: "已退款",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  COMPLETED: {
    label: "已完成",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
};

function getStatusConfig(status: string) {
  const upper = status?.toUpperCase() || "";
  return (
    STATUS_CONFIG[upper] || {
      label: status,
      color: "text-temple-400",
      bg: "bg-temple-600/10",
      border: "border-temple-600/20",
    }
  );
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const token = getAccessToken();
        const res = await fetch(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("订单加载失败");
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-3" />
          <p className="text-temple-400 text-sm font-serif">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">📋</div>
        <h1 className="text-2xl font-serif font-bold text-gradient-gold">
          我的订单
        </h1>
        <p className="text-temple-400 text-sm mt-2">查看您的全部订单记录</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!error && orders.length === 0 && (
        <div className="card-glow rounded-2xl bg-temple-800/50 p-12 text-center">
          <div className="text-5xl mb-4">🏛</div>
          <h2 className="text-xl font-serif text-temple-200 mb-3">暂无订单</h2>
          <p className="text-temple-400 text-sm mb-6">
            开始规划您的祖庭朝圣之旅吧
          </p>
          <Link
            href="/trips"
            className="inline-block px-6 py-3 rounded-xl bg-gold/20 border border-gold/40 text-gold font-semibold hover:bg-gold/30 transition-colors"
          >
            浏览行程
          </Link>
        </div>
      )}

      {/* Orders List */}
      {orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const sc = getStatusConfig(order.status);
            return (
              <Link
                key={order.id}
                href={order.tripId ? `/trips/${order.tripId}` : "#"}
                className="block card-glow rounded-2xl bg-temple-800/50 p-5 hover:bg-temple-800/70 transition-colors border border-transparent hover:border-gold/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-temple-100 truncate">
                      {order.trip?.title || `订单 ${order.orderNo}`}
                    </h3>
                    <p className="text-xs text-temple-500 font-mono mt-1">
                      {order.orderNo}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 ml-3 px-3 py-1 rounded-full text-xs font-medium border ${sc.color} ${sc.bg} ${sc.border}`}
                  >
                    {sc.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gold">
                    ¥{(order.amount || 0).toFixed(2)}
                  </span>
                  <span className="text-xs text-temple-500">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
