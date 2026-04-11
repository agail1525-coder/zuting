"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { fetchCultivationMine, type CultivationMineResponse } from "@/lib/api";

const NAV_ITEMS: { href: string; label: string; icon: string }[] = [
  { href: "/trips/cultivation", label: "总观", icon: "☸" },
  { href: "/trips/cultivation/ox-path", label: "愿行", icon: "🐂" },
  { href: "/trips/cultivation/daily-practice", label: "每日功课", icon: "🪷" },
  { href: "/trips/cultivation/wisdom", label: "融通", icon: "💬" },
  { href: "/trips/cultivation/karma", label: "因缘", icon: "📖" },
  { href: "/trips/cultivation/three-lives", label: "修行库", icon: "🏠" },
  { href: "/trips/cultivation/scriptures", label: "经论", icon: "📜" },
];

export default function CultivationLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mine, setMine] = useState<CultivationMineResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/trips/cultivation");
      return;
    }
    if (!user) return;
    fetchCultivationMine()
      .then((res) => {
        setMine(res);
        if (!res.hasAccess && pathname !== "/trips/cultivation/apply") {
          router.replace("/trips/cultivation/apply");
        }
      })
      .catch(() => router.replace("/trips/cultivation/apply"))
      .finally(() => setLoading(false));
  }, [authLoading, user, router, pathname]);

  // Apply page handles its own UI
  if (pathname === "/trips/cultivation/apply") return <>{children}</>;

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-amber-200/60">
        加载修行圈中...
      </div>
    );
  }
  if (!mine?.hasAccess) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a06] via-[#1a1410] to-[#0f0a06] text-amber-50">
      {/* Top bar */}
      <div className="sticky top-16 z-30 border-b border-amber-900/40 bg-[#0f0a06]/85 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/trips" className="text-amber-300/60 text-sm hover:text-amber-300 shrink-0">
            ← 行程
          </Link>
          <span className="text-amber-200/40 text-sm shrink-0">|</span>
          <span className="font-bold text-amber-100 shrink-0">圆满之路</span>
          <span className="ml-auto text-xs px-2 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 shrink-0">
            {mine.role}
          </span>
        </div>
        {/* Tab nav */}
        <div className="max-w-5xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-amber-500/20 text-amber-200 border border-amber-400/40"
                    : "text-amber-200/50 hover:text-amber-200 hover:bg-amber-950/40"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 pb-24">{children}</div>
    </div>
  );
}
