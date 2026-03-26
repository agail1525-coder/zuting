"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "首页", icon: "🏠", isCenter: false },
  { href: "/holy-sites", label: "圣地", icon: "⛰", isCenter: false },
  { href: "/chat", label: "AI助手", icon: "🏛", isCenter: true },
  { href: "/trips", label: "行程", icon: "🗺", isCenter: false },
  { href: "/orders", label: "订单", icon: "📋", isCenter: false },
  { href: "/profile", label: "我的", icon: "👤", isCenter: false },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-temple-900/95 backdrop-blur-xl border-t border-gold/10" role="navigation" aria-label="Mobile navigation">
      <div className="flex items-end justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-4 relative"
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-xl border-2 transition-all ${
                    isActive
                      ? "bg-gold/20 border-gold shadow-[0_0_20px_rgba(212,168,85,0.3)]"
                      : "bg-temple-800 border-gold/20 hover:border-gold/40"
                  }`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                </div>
                <span
                  className={`text-[10px] mt-1 pb-2 ${
                    isActive ? "text-gold font-semibold" : "text-temple-500"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center pt-2 pb-2 px-3"
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
            >
              <span
                className={`text-lg transition-all ${
                  isActive ? "scale-110" : ""
                }`}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span
                className={`text-[10px] mt-1 ${
                  isActive ? "text-gold font-semibold" : "text-temple-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
