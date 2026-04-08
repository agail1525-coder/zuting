"use client";

import Link from "next/link";
import type { FamilyHarmonyTheme } from "@/lib/api/family-harmony";

export default function FamilyThemeCard({ theme }: { theme: FamilyHarmonyTheme }) {
  const priceYuan = theme.priceFrom ? Math.round(theme.priceFrom / 100) : null;
  return (
    <Link
      href={`/family-harmony/themes/${theme.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100/30 hover:border-[#2D8B6F]/40 hover:-translate-y-1 transition-all"
    >
      <div
        className="h-48 bg-cover bg-center relative"
        style={{
          backgroundImage: theme.coverUrl
            ? `url(${theme.coverUrl})`
            : `linear-gradient(135deg, ${theme.color || "#2D8B6F"}, #1B5E4A)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
          <div>
            <div className="text-3xl mb-1 drop-shadow-lg" aria-hidden>
              {theme.icon || "🏠"}
            </div>
            <h3 className="text-xl font-bold text-gray-900 drop-shadow-sm">{theme.title}</h3>
          </div>
        </div>
      </div>
      <div className="p-5">
        {theme.subtitle && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{theme.subtitle}</p>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {theme.keywords.slice(0, 3).map((k) => (
            <span
              key={k}
              className="px-2.5 py-1 text-xs rounded-full bg-emerald-50 text-[#2D8B6F] font-medium"
            >
              {k}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            {theme.durationDays ? `${theme.durationDays} 天` : ""}
          </span>
          {priceYuan && (
            <span className="text-[#2D8B6F] font-bold">
              ¥{priceYuan.toLocaleString()} 起
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
