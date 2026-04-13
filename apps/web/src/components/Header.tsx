"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";

const navLinks = [
  { key: "nav.destinations", href: "/holy-sites", highlight: false },
  { key: "nav.merchants", href: "/merchants", highlight: false },
  { key: "nav.prices", href: "/prices", highlight: false },
  { key: "nav.map", href: "/map", highlight: false },
  { key: "nav.wiki", href: "/religions", highlight: false },
  { key: "nav.cultureLife", href: "/culture-life", highlight: false },
  { key: "nav.community", href: "/community", highlight: false },
  { key: "nav.aiPlanner", href: "/chat", highlight: true },
  { key: "nav.faithPractice", href: "/faith-assessment", highlight: true, dropdown: [
    { key: "nav.faithAssessment", href: "/faith-assessment", icon: "🔮" },
    { key: "nav.personalGrowth", href: "/personal-growth", icon: "🧘" },
    { key: "nav.familyHappiness", href: "/family-harmony", icon: "🏠" },
    { key: "nav.enterpriseEvergreen", href: "/team-culture", icon: "🏢" },
  ] },
  { key: "nav.myTrips", href: "/trips", highlight: false },
] as const;

export default function Header() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faithOpen, setFaithOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#3264ff] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 bg-white rounded-md px-3 py-1.5" aria-label="Joinus 佳绩之旅">
            <Image src="/logo.png" alt="Joinus 佳绩之旅" width={160} height={36} priority className="h-8 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5" role="navigation" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

              if ('dropdown' in link && link.dropdown) {
                const dropdownActive = link.dropdown.some(
                  (d) => pathname === d.href || pathname.startsWith(d.href + "/"),
                );
                return (
                  <div
                    key={link.key}
                    className="relative"
                    onMouseEnter={() => setFaithOpen(true)}
                    onMouseLeave={() => setFaithOpen(false)}
                  >
                    <button
                      className={`px-3 py-2 text-sm transition-colors rounded-lg flex items-center gap-1 ${
                        dropdownActive
                          ? "text-white font-semibold bg-white/15 border border-white/30"
                          : "text-white font-semibold hover:bg-white/15 border border-white/30 hover:border-white/50"
                      }`}
                    >
                      {t(link.key)} <span className="text-[10px]">▾</span>
                    </button>
                    {faithOpen && (
                      <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        {link.dropdown.map((d) => {
                          const subActive = pathname === d.href || pathname.startsWith(d.href + "/");
                          return (
                            <Link
                              key={d.href}
                              href={d.href}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                subActive
                                  ? "bg-blue-50 text-[#3264ff] font-medium"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <span>{d.icon}</span>
                              {t(d.key)}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-3 py-2 text-sm transition-colors rounded-lg ${
                    link.highlight
                      ? "text-white font-semibold hover:bg-white/15 border border-white/30 hover:border-white/50"
                      : isActive
                        ? "text-white font-semibold bg-white/15"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <Link
              href="/messages"
              className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10 relative"
              aria-label="Messages"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
            <NotificationBell />
            <LanguageSwitcher />
            {!loading && user && user.role === 'ADMIN' && (
              <a
                href="/admin/"
                className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#D4A855] text-[#141414] hover:bg-[#e5bb68] transition-colors"
                title="管理后台"
              >
                🛠 后台
              </a>
            )}
            {!loading && (
              <Link
                href={user ? "/profile" : "/login"}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/10"
              >
                {user ? (
                  <>
                    <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs text-[#3264ff] font-medium">
                      {user.nickname.charAt(0)}
                    </span>
                    <span className="text-white hidden sm:inline">{user.nickname}</span>
                  </>
                ) : (
                  <span className="px-4 py-1.5 bg-white text-[#3264ff] rounded-full text-sm font-medium hover:bg-white/90 transition-colors">
                    {t("nav.login")}
                  </span>
                )}
              </Link>
            )}
            <button
              className="lg:hidden p-2 text-white/90 hover:text-white"
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
        <div className="lg:hidden bg-[#3264ff] border-t border-white/10">
          <nav className="px-4 py-3 flex flex-col gap-0.5" role="navigation" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              if ('dropdown' in link && link.dropdown) {
                return (
                  <div key={link.key}>
                    <div className="px-3 py-2 text-xs text-white/50 font-semibold uppercase tracking-wider mt-2">
                      {t(link.key)}
                    </div>
                    {link.dropdown.map((d) => {
                      const subActive = pathname === d.href || pathname.startsWith(d.href + "/");
                      return (
                        <Link
                          key={d.href}
                          href={d.href}
                          className={`px-3 py-2.5 pl-6 flex items-center gap-2 transition-colors rounded-lg ${
                            subActive
                              ? "text-white font-semibold bg-white/15"
                              : "text-white/85 hover:text-white hover:bg-white/10"
                          }`}
                          onClick={() => setMobileOpen(false)}
                        >
                          <span>{d.icon}</span> {t(d.key)}
                        </Link>
                      );
                    })}
                  </div>
                );
              }
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-3 py-2.5 transition-colors rounded-lg ${
                    link.highlight
                      ? "text-white font-semibold hover:bg-white/15"
                      : isActive
                        ? "text-white font-semibold bg-white/15"
                        : "text-white/85 hover:text-white hover:bg-white/10"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {t(link.key)}
                </Link>
              );
            })}
            <Link
              href="/search"
              className="px-3 py-2.5 transition-colors rounded-lg text-white/85 hover:text-white hover:bg-white/10 flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t("common.search") || "搜索"}
            </Link>
            <Link
              href={user ? "/profile" : "/login"}
              className="px-3 py-2.5 transition-colors rounded-lg text-white font-semibold hover:bg-white/15 border-t border-white/15 mt-1 pt-3"
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
