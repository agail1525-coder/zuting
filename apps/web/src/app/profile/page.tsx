"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { updateProfile } from "@/lib/api";

const MENU_ITEMS = [
  {
    icon: "🗺",
    label: "我的行程",
    desc: "朝圣旅行规划",
    href: "/trips",
    color: "from-gold/20 to-gold/5",
  },
  {
    icon: "📿",
    label: "修行记录",
    desc: "三十印修行进度",
    href: "/seals",
    color: "from-lotus/20 to-lotus/5",
  },
  {
    icon: "📖",
    label: "朝圣日记",
    desc: "心灵感悟记录",
    href: "/journals",
    color: "from-jade/20 to-jade/5",
  },
  {
    icon: "ℹ️",
    label: "关于",
    desc: "全球祖庭旅行平台",
    href: "/about",
    color: "from-incense/20 to-incense/5",
  },
];

export default function ProfilePage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [form, setForm] = useState({ nickname: "", avatar: "", phone: "" });

  const openEdit = () => {
    if (!user) return;
    setForm({
      nickname: user.nickname || "",
      avatar: user.avatar || "",
      phone: user.phone || "",
    });
    setEditing(true);
    setToast(null);
  };

  const handleSave = async () => {
    if (form.nickname.length < 2 || form.nickname.length > 20) {
      setToast({ type: "error", msg: "昵称需要2-20个字符" });
      return;
    }
    if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) {
      setToast({ type: "error", msg: "请输入有效的手机号" });
      return;
    }
    if (form.avatar && form.avatar.length > 500) {
      setToast({ type: "error", msg: "头像URL过长" });
      return;
    }

    setSaving(true);
    setToast(null);
    try {
      const data: Record<string, string> = {};
      if (form.nickname !== (user?.nickname || "")) data.nickname = form.nickname;
      if (form.avatar !== (user?.avatar || "")) data.avatar = form.avatar;
      if (form.phone !== (user?.phone || "")) data.phone = form.phone;

      if (Object.keys(data).length === 0) {
        setEditing(false);
        return;
      }

      await updateProfile(data);
      await refreshUser();
      setEditing(false);
      setToast({ type: "success", msg: "资料更新成功" });
      setTimeout(() => setToast(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "更新失败，请稍后重试";
      setToast({ type: "error", msg: message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="text-temple-400 text-sm">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-sm font-medium shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-green-500/90 text-white"
              : "bg-red-500/90 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* User Info */}
      <div className="text-center mb-8 relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border-2 border-gold/20 flex items-center justify-center text-3xl mx-auto mb-4">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.nickname} className="w-full h-full rounded-full object-cover" />
          ) : (
            "🏛"
          )}
        </div>
        <h1 className="text-2xl font-serif font-bold text-gradient-gold">
          {user ? user.nickname : "朝圣者"}
        </h1>
        <p className="text-temple-400 text-sm mt-1">
          愿以朝圣之心，行和平之路
        </p>
        {user && !editing && (
          <button
            onClick={openEdit}
            className="mt-3 px-4 py-1.5 bg-gold/10 border border-gold/20 text-gold rounded-full text-xs font-medium hover:bg-gold/20 transition-colors"
          >
            编辑资料
          </button>
        )}
      </div>

      {/* Edit Form */}
      {editing && user && (
        <div className="card-glow rounded-2xl bg-temple-800/50 p-6 mb-8">
          <h2 className="text-temple-100 font-medium mb-4">编辑个人资料</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-temple-400 text-xs mb-1">昵称 (2-20字符)</label>
              <input
                type="text"
                value={form.nickname}
                onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                maxLength={20}
                className="w-full px-3 py-2 bg-temple-900/50 border border-temple-600/30 rounded-lg text-temple-100 text-sm placeholder-temple-500 focus:outline-none focus:border-gold/40"
                placeholder="输入昵称"
              />
            </div>
            <div>
              <label className="block text-temple-400 text-xs mb-1">头像URL</label>
              <input
                type="url"
                value={form.avatar}
                onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))}
                className="w-full px-3 py-2 bg-temple-900/50 border border-temple-600/30 rounded-lg text-temple-100 text-sm placeholder-temple-500 focus:outline-none focus:border-gold/40"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div>
              <label className="block text-temple-400 text-xs mb-1">手机号</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-temple-900/50 border border-temple-600/30 rounded-lg text-temple-100 text-sm placeholder-temple-500 focus:outline-none focus:border-gold/40"
                placeholder="13800138000"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 bg-gold/20 border border-gold/30 text-gold rounded-full text-sm font-medium hover:bg-gold/30 transition-colors disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              onClick={() => { setEditing(false); setToast(null); }}
              className="px-6 py-2.5 bg-temple-700/50 border border-temple-600/30 text-temple-300 rounded-full text-sm hover:bg-temple-700/70 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Stats Row */}
      {user && (
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { value: user._count.trips, label: "行程" },
            { value: user._count.orders, label: "订单" },
            { value: user._count.journals, label: "日记" },
            { value: user._count.practices, label: "修行" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center card-glow rounded-xl bg-temple-800/50 py-4 px-2"
            >
              <div className="text-2xl font-bold text-gold">{stat.value}</div>
              <div className="text-xs text-temple-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="card-glow rounded-xl bg-temple-800/50 p-4 hover:bg-temple-800/70 transition-all group"
          >
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform`}
            >
              {item.icon}
            </div>
            <h3 className="text-temple-100 font-medium text-sm">
              {item.label}
            </h3>
            <p className="text-temple-500 text-xs mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Auth Section */}
      {user ? (
        <div className="card-glow rounded-2xl bg-temple-800/50 p-6 text-center">
          <p className="text-temple-300 text-sm mb-3">
            已登录为 <span className="text-gold">{user.nickname}</span>
            {user.phone && <span className="text-temple-500 ml-2">({user.phone})</span>}
          </p>
          <button
            onClick={logout}
            className="px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            退出登录
          </button>
        </div>
      ) : (
        <div className="card-glow rounded-2xl bg-temple-800/50 p-6 text-center">
          <p className="text-temple-300 text-sm mb-3">
            登录以同步您的朝圣数据
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-6 py-2.5 bg-gold/15 border border-gold/30 text-gold rounded-full text-sm font-medium hover:bg-gold/25 transition-colors"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 bg-temple-700/50 border border-temple-600/30 text-temple-200 rounded-full text-sm font-medium hover:bg-temple-700/70 transition-colors"
            >
              注册
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
