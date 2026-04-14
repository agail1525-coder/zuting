import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";

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
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75c1.764 0 3.42-.468 4.852-1.286l4.148 1.286-1.286-4.148A9.713 9.713 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75z" />
    </svg>
  ),
  profile: (a) => (
    <svg className="w-6 h-6" fill={a ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
};

export default function Layout() {
  const { t } = useTranslation();
  const location = useLocation();

  // Hide tab bar on certain pages
  const hideTabBar = ["/login", "/checkout", "/chat"].some((p) =>
    location.pathname.startsWith(p) && p !== "/"
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Brand top bar */}
      <header className="sticky top-0 z-40 bg-[#3264ff] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center">
          <NavLink to="/" aria-label="Joinus 佳绩之旅">
            <img src="/logo.png" alt="Joinus 佳绩之旅" className="h-4 w-auto" />
          </NavLink>
        </div>
      </header>

      {/* Page content */}
      <main className={`flex-1 ${hideTabBar ? "" : "pb-safe"}`}>
        <Outlet />
      </main>

      {/* Bottom tab bar */}
      {!hideTabBar && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex items-center justify-around px-2"
          style={{ paddingBottom: "var(--safe-area-bottom)", height: "calc(56px + var(--safe-area-bottom))" }}>
          {TAB_ITEMS.map((tab) => {
            const isActive = tab.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(tab.path);
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center justify-center py-1 min-w-[64px]"
              >
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
