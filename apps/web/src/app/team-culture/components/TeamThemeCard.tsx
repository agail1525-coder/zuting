"use client";

import Link from "next/link";
import type { TeamCultureTheme } from "@/lib/api/team-culture";

export default function TeamThemeCard({ theme }: { theme: TeamCultureTheme }) {
  const priceYuan = theme.priceFrom ? Math.round(theme.priceFrom / 100) : null;
  return (
    <Link
      href={`/team-culture/themes/${theme.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#D4A855]/60 transition"
    >
      <div
        className="h-48 bg-cover bg-center relative"
        style={{
          backgroundImage: theme.coverUrl
            ? `url(${theme.coverUrl})`
            : `linear-gradient(135deg, ${theme.color}88, #0f172a)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/30 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
          <div>
            <div
              className="text-3xl mb-1"
              style={{ color: theme.color }}
              aria-hidden
            >
              {theme.icon || "✦"}
            </div>
            <h3 className="text-xl font-bold text-white">{theme.title}</h3>
          </div>
        </div>
      </div>
      <div className="p-5">
        {theme.subtitle && (
          <p className="text-white/70 text-sm mb-3">{theme.subtitle}</p>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {theme.keywords.slice(0, 3).map((k) => (
            <span
              key={k}
              className="px-2.5 py-1 text-xs rounded-full bg-white/10 text-white/80"
            >
              {k}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">
            {theme.durationDays ? `${theme.durationDays} 天` : ""}
          </span>
          {priceYuan && (
            <span className="text-[#D4A855] font-semibold">
              ¥{priceYuan.toLocaleString()} 起 / 人
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
