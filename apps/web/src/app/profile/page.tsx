"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import { updateProfile } from "@/lib/api";
import { toast as globalToast } from "@/lib/toast";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";

export default function ProfilePage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const { t } = useTranslation();

  const MENU_ITEMS = [
    {
      icon: "🗺",
      label: t("profile.myTrips"),
      desc: t("profile.myTripsDesc"),
      href: "/trips",
      color: "from-[#0066FF]/20 to-[#0066FF]/5",
    },
    {
      icon: "📿",
      label: t("profile.myPractice"),
      desc: t("profile.myPracticeDesc"),
      href: "/seals",
      color: "from-purple-500/20 to-purple-500/5",
    },
    {
      icon: "📖",
      label: t("profile.myJournals"),
      desc: t("profile.myJournalsDesc"),
      href: "/journals",
      color: "from-emerald-500/20 to-emerald-500/5",
    },
    {
      icon: "ℹ️",
      label: t("profile.aboutLabel"),
      desc: t("profile.aboutDesc"),
      href: "/about",
      color: "from-orange-500/20 to-orange-500/5",
    },
  ];

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nickname: "", avatar: "", phone: "" });

  const openEdit = () => {
    if (!user) return;
    setForm({
      nickname: user.nickname || "",
      avatar: user.avatar || "",
      phone: user.phone || "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (form.nickname.length < 2 || form.nickname.length > 20) {
      globalToast.error(t("profile.nicknameInvalid"));
      return;
    }
    if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) {
      globalToast.error(t("profile.phoneInvalid"));
      return;
    }
    if (form.avatar && form.avatar.length > 500) {
      globalToast.error(t("profile.avatarTooLong"));
      return;
    }

    setSaving(true);
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
      globalToast.success(t("profile.updateSuccess"));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("profile.updateFailed");
      globalToast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="text-gray-500 text-sm">{t("common.loading")}</div>
      </div>
    );
  }

  const EXTRA_LINKS = [
    { icon: "🎫", label: t("nav.coupons") || "优惠券", href: "/coupons", desc: "查看可用优惠" },
    { icon: "📦", label: t("profile.myOrders"), href: "/orders", desc: t("profile.myOrdersDesc") },
    { icon: "❤️", label: t("profile.myCollections"), href: "/collections", desc: t("profile.myCollectionsDesc") },
    { icon: "💬", label: t("profile.messages"), href: "/messages", desc: t("profile.messagesDesc") },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
      {/* User Info */}
      <div className="text-center mb-8 relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0066FF]/30 to-[#0066FF]/10 border-2 border-[#0066FF]/20 flex items-center justify-center text-3xl mx-auto mb-4">
          {user?.avatar ? (
            <OptimizedImage src={user.avatar} alt={user.nickname} width={80} height={80} className="w-full h-full rounded-full object-cover" />
          ) : (
            "🏛"
          )}
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#0066FF]">
          {user ? user.nickname : t("profile.pilgrim")}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {t("profile.motto")}
        </p>
        {user && !editing && (
          <button
            onClick={openEdit}
            className="mt-3 px-4 py-1.5 bg-[#0066FF]/10 border border-[#0066FF]/20 text-[#0066FF] rounded-full text-xs font-medium hover:bg-[#0066FF]/20 transition-colors"
          >
            {t("profile.editProfile")}
          </button>
        )}
      </div>

      {/* Edit Form */}
      {editing && user && (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-gray-900 font-medium mb-4">{t("profile.editTitle")}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-500 text-xs mb-1">{t("profile.nicknameLabel")}</label>
              <input
                type="text"
                value={form.nickname}
                onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                maxLength={20}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#0066FF]"
                placeholder={t("profile.nicknamePlaceholder")}
              />
            </div>
            <div>
              <label className="block text-gray-500 text-xs mb-1">{t("profile.avatarLabel")}</label>
              <input
                type="url"
                value={form.avatar}
                onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#0066FF]"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-xs mb-1">{t("profile.phoneLabel")}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#0066FF]"
                placeholder="13800138000"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 bg-[#0066FF] text-white rounded-full text-sm font-medium hover:bg-[#0052CC] transition-colors disabled:opacity-50"
            >
              {saving ? t("profile.saving") : t("common.save")}
            </button>
            <button
              onClick={() => { setEditing(false); }}
              className="px-6 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-full text-sm hover:bg-gray-100 transition-colors"
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Stats Row */}
      {user && (
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { value: user._count.trips, label: t("profile.stats.trips") },
            { value: user._count.orders, label: t("profile.stats.orders") },
            { value: user._count.journals, label: t("profile.stats.journals") },
            { value: user._count.practices, label: t("profile.stats.practices") },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center rounded-xl bg-white shadow-sm border border-gray-100 py-4 px-2"
            >
              <div className="text-2xl font-bold text-[#0066FF]">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
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
            className="rounded-xl bg-white shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all group"
          >
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform`}
            >
              {item.icon}
            </div>
            <h3 className="text-gray-900 font-medium text-sm">
              {item.label}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Quick Links (对标Trip.com/Agoda) */}
      {user && (
        <div className="grid grid-cols-2 gap-3 mb-8">
          {EXTRA_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl bg-white shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <h3 className="text-gray-900 font-medium text-sm">{item.label}</h3>
                  <p className="text-gray-400 text-xs">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Membership CTA */}
      {user && (
        <Link href="/membership" className="block mb-8 group">
          <div className="bg-gradient-to-r from-[#D4A855] to-amber-500 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs">会员中心</p>
                <p className="text-lg font-bold mt-1 group-hover:translate-x-1 transition-transform">查看会员权益 →</p>
                <p className="text-white/60 text-xs mt-1">签到赚积分 · 专属折扣 · 积分商城</p>
              </div>
              <span className="text-4xl">👑</span>
            </div>
          </div>
        </Link>
      )}

      {/* Auth Section */}
      {user ? (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-gray-600 text-sm mb-3">
            {t("profile.loggedInAs")} <span className="text-[#0066FF]">{user.nickname}</span>
            {user.phone && <span className="text-gray-400 ml-2">({user.phone})</span>}
          </p>
          <button
            onClick={logout}
            className="px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            {t("auth.logout")}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-gray-600 text-sm mb-3">
            {t("profile.syncPrompt")}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-6 py-2.5 bg-[#0066FF]/10 border border-[#0066FF]/20 text-[#0066FF] rounded-full text-sm font-medium hover:bg-[#0066FF]/20 transition-colors"
            >
              {t("auth.login")}
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              {t("auth.register")}
            </Link>
          </div>
        </div>
      )}
      </div>
      <MobileNav />
    </div>
  );
}
