"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";

const navLinks = [
  { key: "nav.routes", href: "/routes", highlight: false },
  { key: "nav.destinations", href: "/holy-sites", highlight: false },
  { key: "nav.map", href: "/map", highlight: false },
  { key: "nav.wiki", href: "/religions", highlight: false },
  { key: "nav.aiPlanner", href: "/chat", highlight: true },
  { key: "nav.myTrips", href: "/trips", highlight: false },
];

export default function Header() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-temple-900/80 backdrop-blur-xl border-b border-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl" aria-hidden="true">🏛</span>
            <span className="text-gradient-gold font-serif font-bold text-lg hidden sm:block">
              {t("site.title")}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-3 py-2 text-sm transition-colors rounded-lg ${
                    link.highlight
                      ? "text-gold font-semibold hover:bg-gold/10 border border-gold/20 hover:border-gold/40"
                      : "text-temple-300 hover:text-gold hover:bg-gold/5"
                  }`}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="p-2 text-temple-300 hover:text-gold transition-colors rounded-lg hover:bg-gold/5"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <NotificationBell />
            <LanguageSwitcher />
            {!loading && (
              <Link
                href={user ? "/profile" : "/login"}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-gold/10"
              >
                {user ? (
                  <>
                    <span className="w-6 h-6 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-xs text-gold">
                      {user.nickname.charAt(0)}
                    </span>
                    <span className="text-temple-200 hidden sm:inline">{user.nickname}</span>
                  </>
                ) : (
                  <span className="text-gold">登录</span>
                )}
              </Link>
            )}
            <button
              className="lg:hidden p-2 text-temple-300 hover:text-gold"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
            >
              <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-temple-900/95 backdrop-blur-xl border-b border-gold/10">
          <nav className="px-4 py-3 flex flex-col gap-1" role="navigation" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-3 py-2.5 transition-colors rounded-lg ${
                    link.highlight
                      ? "text-gold font-semibold hover:bg-gold/10"
                      : "text-temple-300 hover:text-gold hover:bg-gold/5"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {t(link.key)}
                </Link>
              );
            })}
            <Link
              href="/search"
              className="px-3 py-2.5 transition-colors rounded-lg text-temple-300 hover:text-gold hover:bg-gold/5 flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              搜索
            </Link>
            <Link
              href={user ? "/profile" : "/login"}
              className="px-3 py-2.5 transition-colors rounded-lg text-gold font-semibold hover:bg-gold/10 border-t border-gold/10 mt-1 pt-3"
              onClick={() => setMobileOpen(false)}
            >
              {user ? `${user.nickname} - 个人中心` : "登录 / 注册"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
