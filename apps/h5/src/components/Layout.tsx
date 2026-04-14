import { useState } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import Footer from "./Footer";

const NAV_LINKS = [
  { key: "nav.destinations", to: "/holy-sites" },
  { key: "nav.merchants", to: "/merchants" },
  { key: "nav.prices", to: "/prices" },
  { key: "nav.map", to: "/map" },
  { key: "nav.wiki", to: "/religions" },
  { key: "nav.cultureLife", to: "/culture-life" },
  { key: "nav.community", to: "/community" },
  { key: "nav.aiPlanner", to: "/chat", highlight: true },
  {
    key: "nav.faithPractice",
    to: "/faith-assessment",
    highlight: true,
    dropdown: [
      { key: "nav.faithAssessment", to: "/faith-assessment", icon: "🔮" },
      { key: "nav.personalGrowth", to: "/personal-growth", icon: "🧘" },
      { key: "nav.familyHappiness", to: "/family-harmony", icon: "🏠" },
      { key: "nav.enterpriseEvergreen", to: "/team-culture", icon: "🏢" },
    ],
  },
  { key: "nav.myTrips", to: "/trips" },
] as const;

const TAB_ITEMS = [
  { path: "/", icon: "home", labelKey: "nav.home" },
  { path: "/holy-sites", icon: "holySites", labelKey: "nav.holySites" },
  { path: "/chat", icon: "chat", labelKey: "nav.chat" },
  { path: "/profile", icon: "profile", labelKey: "nav.profile" },
] as const;

const ICONS: Record<string, (active: boolean) => React.ReactNode> = {
  home: (a) => (
    <svg className="w-6 h-6" fill={a ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  holySites: (a) => (
    <svg className="w-6 h-6" fill={a ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  chat: (a) => (
    <svg className="w-6 h-6" fill={a ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75c1.764 0 3.42-.468 4.852-1.286l4.148 1.286-1.286-4.148A9.713 9.713 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75z" />
    </svg>
  ),
  profile: (a) => (
    <svg className="w-6 h-6" fill={a ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
};

function IconBtn({ to, label, children }: { to: string; label: string; children: React.ReactNode }) {
  return (
    <NavLink to={to} aria-label={label}
      className="p-2 text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
      {children}
    </NavLink>
  );
}

export default function Layout() {
  const { t, locale, setLocale } = useTranslation();
  const { user, loading } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [faithOpen, setFaithOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const hideTabBar = ["/login", "/checkout", "/chat"].some((p) =>
    location.pathname.startsWith(p) && p !== "/"
  );

  const LOCALES: Array<{ code: typeof locale; label: string }> = [
    { code: "zh-CN", label: "简体中文" },
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
    { code: "ko", label: "한국어" },
    { code: "ar", label: "العربية" },
    { code: "hi", label: "हिन्दी" },
    { code: "th", label: "ไทย" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-40 bg-[#3264ff] shadow-md">
        <div className="max-w-6xl mx-auto px-3">
          {/* Brand bar */}
          <div className="flex items-center justify-between h-11">
            <Link to="/" className="flex items-center shrink-0" aria-label="Joinus 佳绩之旅">
              <img src="/logo.png" alt="Joinus 佳绩之旅" className="h-4 w-auto" />
            </Link>
            <div className="flex items-center gap-1">
              <IconBtn to="/search" label="Search">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </IconBtn>
              <IconBtn to="/messages" label="Messages">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </IconBtn>
              <IconBtn to="/notifications" label="Notifications">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </IconBtn>
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="p-2 text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Language">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 000 18M12.5 3a17 17 0 010 18" />
                  </svg>
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                    {LOCALES.map((L) => (
                      <button
                        key={L.code}
                        onClick={() => { setLocale(L.code); setLangOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          locale === L.code ? "bg-blue-50 text-[#3264ff] font-medium" : "text-gray-700 hover:bg-gray-50"
                        }`}>
                        {L.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {!loading && (
                <Link to={user ? "/profile" : "/login"}
                  className="ml-1 flex items-center px-2.5 py-1 rounded-full text-xs transition-colors">
                  {user ? (
                    <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#3264ff] font-medium">
                      {user.nickname.charAt(0)}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-white text-[#3264ff] rounded-full font-medium hover:bg-white/90 transition-colors">
                      {t("nav.login")}
                    </span>
                  )}
                </Link>
              )}
              <button
                className="lg:hidden p-2 text-white/90 hover:text-white"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          {/* Main nav - horizontal scroll on mobile, flex on lg */}
          <nav className="hidden lg:flex items-center gap-0.5 h-11 -mt-1 pb-1 overflow-x-auto no-scrollbar">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + "/");
              if ("dropdown" in link && link.dropdown) {
                const dropdownActive = link.dropdown.some(
                  (d) => location.pathname === d.to || location.pathname.startsWith(d.to + "/")
                );
                return (
                  <div key={link.key} className="relative"
                    onMouseEnter={() => setFaithOpen(true)}
                    onMouseLeave={() => setFaithOpen(false)}>
                    <button className={`whitespace-nowrap px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 transition-colors ${
                      dropdownActive
                        ? "text-white font-semibold bg-white/15 border border-white/30"
                        : "text-white font-semibold hover:bg-white/15 border border-white/30 hover:border-white/50"
                    }`}>
                      {t(link.key)} <span className="text-[10px]">▾</span>
                    </button>
                    {faithOpen && (
                      <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        {link.dropdown.map((d) => (
                          <Link key={d.to} to={d.to}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <span>{d.icon}</span>
                            {t(d.key)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link key={link.to} to={link.to}
                  className={`whitespace-nowrap px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    "highlight" in link && link.highlight
                      ? "text-white font-semibold hover:bg-white/15 border border-white/30 hover:border-white/50"
                      : isActive
                        ? "text-white font-semibold bg-white/15"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}>
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>
          {/* Mobile: horizontal scroll nav */}
          <nav className="lg:hidden flex items-center gap-1 h-10 overflow-x-auto no-scrollbar -mt-1 pb-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + "/");
              return (
                <Link key={link.key} to={link.to}
                  className={`whitespace-nowrap px-2.5 py-1 text-xs rounded-md transition-colors ${
                    isActive ? "text-white font-semibold bg-white/20" : "text-white/85 hover:bg-white/10"
                  }`}>
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>
        </div>
        {menuOpen && (
          <div className="lg:hidden bg-[#3264ff] border-t border-white/10">
            <nav className="px-4 py-3 flex flex-col gap-0.5">
              {NAV_LINKS.map((link) => {
                if ("dropdown" in link && link.dropdown) {
                  return (
                    <div key={link.key}>
                      <div className="px-3 py-2 text-xs text-white/50 font-semibold uppercase tracking-wider mt-2">
                        {t(link.key)}
                      </div>
                      {link.dropdown.map((d) => (
                        <Link key={d.to} to={d.to}
                          onClick={() => setMenuOpen(false)}
                          className="px-3 py-2.5 pl-6 flex items-center gap-2 text-white/85 hover:text-white hover:bg-white/10 rounded-lg">
                          <span>{d.icon}</span> {t(d.key)}
                        </Link>
                      ))}
                    </div>
                  );
                }
                return (
                  <Link key={link.to} to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 text-white/85 hover:text-white hover:bg-white/10 rounded-lg">
                    {t(link.key)}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <main className={`flex-1 ${hideTabBar ? "" : "pb-safe"}`}>
        <Outlet />
      </main>

      <Footer />

      {!hideTabBar && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex items-center justify-around px-2 lg:hidden"
          style={{ paddingBottom: "var(--safe-area-bottom)", height: "calc(56px + var(--safe-area-bottom))" }}>
          {TAB_ITEMS.map((tab) => {
            const isActive = tab.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(tab.path);
            return (
              <NavLink key={tab.path} to={tab.path}
                className="flex flex-col items-center justify-center py-1 min-w-[64px]">
                <span className={isActive ? "text-[var(--color-primary)]" : "text-gray-400"}>
                  {ICONS[tab.icon](isActive)}
                </span>
                <span className={`text-[10px] mt-0.5 ${isActive ? "text-[var(--color-primary)] font-medium" : "text-gray-400"}`}>
                  {t(tab.labelKey)}
                </span>
              </NavLink>
            );
          })}
        </nav>
      )}
    </div>
  );
}
