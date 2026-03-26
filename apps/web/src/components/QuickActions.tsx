"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const ACTIONS = [
  {
    href: "/map",
    icon: "🗺",
    label: "地图探索",
    labelEn: "Map",
  },
  {
    href: "/chat",
    icon: "💬",
    label: "AI助手",
    labelEn: "AI Chat",
  },
  {
    href: "/trips",
    icon: "✈",
    label: "行程规划",
    labelEn: "Trips",
  },
  {
    href: "/journals",
    icon: "📖",
    label: "朝圣日志",
    labelEn: "Journal",
  },
];

export default function QuickActions() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!scrolled) return null;

  return (
    <>
      {/* Desktop: floating bar on right side */}
      <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-3 animate-fade-in-up">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative flex items-center"
            aria-label={action.label}
          >
            {/* Tooltip */}
            <span className="absolute right-full mr-3 px-3 py-1.5 text-sm text-gold bg-temple-800 border border-gold/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
              {action.label}
            </span>
            {/* Button */}
            <span className="w-12 h-12 rounded-full bg-temple-800/90 backdrop-blur-sm border border-gold/20 flex items-center justify-center text-xl hover:border-gold/50 hover:bg-temple-800 hover:shadow-[0_0_16px_rgba(212,168,85,0.15)] transition-all">
              {action.icon}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
