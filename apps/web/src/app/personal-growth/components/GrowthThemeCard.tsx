"use client";

import Link from "next/link";
import type { PersonalGrowthTheme } from "@/lib/api/personal-growth";

export default function GrowthThemeCard({ theme }: { theme: PersonalGrowthTheme }) {
  const priceYuan = theme.priceFrom ? Math.round(theme.priceFrom / 100) : null;
  return (
    <Link
      href={`/personal-growth/themes/${theme.slug}`}
      className="group block rounded-2xl overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-900/20 shadow-sm hover:shadow-xl hover:shadow-amber-900/10 hover:border-[#D4A855]/40 hover:-translate-y-1 transition-all"
    >
      <div
        className="h-48 bg-cover bg-center relative"
        style={{
          backgroundImage: theme.coverUrl
            ? `url(${theme.coverUrl})`
            : `linear-gradient(135deg, ${theme.color || "#D4A855"}, #8B6914)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/30 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
          <div>
            <div className="text-3xl mb-1 text-white drop-shadow-lg" aria-hidden>
              {theme.icon || "🧘"}
            </div>
            <h3 className="text-xl font-bold text-white drop-shadow-md">{theme.title}</h3>
          </div>
        </div>
      </div>
      <div className="p-5">
        {theme.subtitle && (
          <p className="text-amber-100/70 text-sm mb-3 line-clamp-2">{theme.subtitle}</p>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {theme.keywords.slice(0, 3).map((k) => (
            <span
              key={k}
              className="px-2.5 py-1 text-xs rounded-full bg-amber-900/30 text-[#D4A855] font-medium border border-amber-800/30"
            >
              {k}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {theme.durationDays ? `${theme.durationDays} 天` : ""}
          </span>
          {priceYuan && (
            <span className="text-[#D4A855] font-bold">
              ¥{priceYuan.toLocaleString()} 起 / 人
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
