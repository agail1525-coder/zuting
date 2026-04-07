import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import type { Locale } from "@/lib/i18n";

const QUICK_ACTIONS = [
  { key: "trips", icon: "🗺️", labelKey: "profile.myTrips", descKey: "profile.myTripsDesc", path: "/trips" },
  { key: "orders", icon: "📋", labelKey: "nav.orders", descKey: "profile.myTripsDesc", path: "/orders" },
  { key: "journals", icon: "📝", labelKey: "nav.journals", descKey: "profile.myJournalsDesc", path: "/journals" },
  { key: "collections", icon: "⭐", labelKey: "profile.myCollections", descKey: "profile.myCollectionsDesc", path: "/collections" },
  { key: "coupons", icon: "🎫", labelKey: "profile.myCoupons", descKey: "profile.myCouponsDesc", path: "/coupons" },
  { key: "membership", icon: "👑", labelKey: "profile.myMembership", descKey: "profile.myMembershipDesc", path: "/membership" },
  { key: "messages", icon: "💬", labelKey: "profile.myMessages", descKey: "profile.myMessagesDesc", path: "/messages" },
  { key: "about", icon: "ℹ️", labelKey: "profile.aboutLabel", descKey: "profile.aboutDesc", path: "/about" },
];

const LOCALES: { code: Locale; label: string }[] = [
  { code: "zh-CN", label: "中文" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "th", label: "ไทย" },
  { code: "hi", label: "हिन्दी" },
  { code: "ar", label: "العربية" },
];

export default function Profile() {
  const { t, locale, setLocale } = useTranslation();
  const { user, loading, logout } = useAuth();
  const nav = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-3xl mb-4">
          👤
        </div>
        <p className="text-gray-500 text-sm mb-6">{t("profile.loginPrompt")}</p>
        <button
          onClick={() => nav("/login")}
          className="px-8 py-2.5 bg-[var(--color-primary)] text-white rounded-full text-sm font-medium"
        >
          {t("auth.login")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Profile card */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-5 pt-12 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30">
            {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : user.nickname[0]}
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">{user.nickname}</h2>
            <p className="text-white/70 text-xs mt-0.5">{t("profile.pilgrim")}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          {[
            { label: t("profile.stats.trips"), count: user._count.trips },
            { label: t("profile.stats.orders"), count: user._count.orders },
            { label: t("profile.stats.journals"), count: user._count.journals },
            { label: t("profile.stats.practices"), count: user._count.practices },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-white font-bold text-lg">{s.count}</p>
              <p className="text-white/60 text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-50">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.key}
              onClick={() => nav(a.path)}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50"
            >
              <span className="text-lg">{a.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">{t(a.labelKey)}</p>
                <p className="text-[10px] text-gray-400">{t(a.descKey)}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Language switcher */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm font-medium text-gray-900 mb-3">{t("profile.language")}</p>
          <div className="flex flex-wrap gap-2">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLocale(l.code)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  locale === l.code
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 mt-4">
        <button
          onClick={async () => { await logout(); nav("/"); }}
          className="w-full py-3 bg-white rounded-xl shadow-sm text-red-500 text-sm font-medium"
        >
          {t("auth.logout")}
        </button>
      </div>

      <p className="text-center text-[10px] text-gray-300 mt-6">{t("profile.version")} 1.0.0</p>
    </div>
  );
}
