"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  fetchScriptureCategories,
  fetchScriptures,
  fetchScriptureRecommended,
  type ScriptureCategory,
  type ScriptureItem,
} from "@/lib/api";

const RING_LABELS = ["", "禅宗核心", "佛教宗派", "信仰传统"];
const RING_COLORS = ["", "from-amber-400 to-yellow-600", "from-cyan-400 to-blue-600", "from-purple-400 to-pink-600"];
const RING_BORDERS = ["", "border-amber-500/60", "border-cyan-500/50", "border-purple-500/50"];
const RING_BG = ["", "bg-amber-500/10", "bg-cyan-500/10", "bg-purple-500/10"];

const TRADITION_ICONS: Record<string, string> = {
  ZEN: "🪷", BUDDHISM: "☸", TAOISM: "☯", CONFUCIANISM: "📖", CHRISTIANITY: "✝",
  ISLAM: "☪", HINDUISM: "🕉", JUDAISM: "✡", SIKHISM: "🪯", TIBETAN: "🏔",
  SHINTO: "⛩", INDIGENOUS: "🌿", BAHAI: "✴",
};

export default function ScripturesPage() {
  const [categories, setCategories] = useState<ScriptureCategory[]>([]);
  const [recommended, setRecommended] = useState<ScriptureItem[]>([]);
  const [allItems, setAllItems] = useState<ScriptureItem[]>([]);
  const [activeRing, setActiveRing] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchScriptureCategories(),
      fetchScriptureRecommended(),
      fetchScriptures({ page: 1 }),
    ])
      .then(([cats, rec, list]) => {
        setCategories(cats);
        setRecommended(Array.isArray(rec) ? rec : []);
        setAllItems(Array.isArray(list) ? list : list?.items ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Search
  useEffect(() => {
    if (!search.trim()) return;
    const t = setTimeout(() => {
      fetchScriptures({ search: search.trim() }).then((r) =>
        setAllItems(Array.isArray(r) ? r : r?.items ?? []),
      );
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Filtered by ring
  const filtered = useMemo(() => {
    if (activeRing === 0) return allItems;
    return allItems.filter((s) => s.ring === activeRing);
  }, [allItems, activeRing]);

  // Build ring-grouped categories for the knowledge graph
  const ringGroups = useMemo(() => {
    const groups: Record<number, ScriptureCategory[]> = { 1: [], 2: [], 3: [] };
    for (const cat of categories) {
      if (cat.ring >= 1 && cat.ring <= 3 && !cat.parentId) {
        groups[cat.ring].push(cat);
      }
    }
    return groups;
  }, [categories]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-amber-200/60">
        加载经论体系...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rotating ring keyframes — plain <style> for App Router compatibility */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scripture-ring-cw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes scripture-ring-ccw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        .scripture-ring-outer { animation: scripture-ring-cw 120s linear infinite; }
        .scripture-ring-outer-counter { animation: scripture-ring-ccw 120s linear infinite; }
        .scripture-ring-mid   { animation: scripture-ring-ccw 80s linear infinite; }
        .scripture-ring-mid-counter { animation: scripture-ring-cw 80s linear infinite; }
        .scripture-ring-inner { animation: scripture-ring-cw 50s linear infinite; }
        .scripture-ring-inner-counter { animation: scripture-ring-ccw 50s linear infinite; }
        .scripture-ring-outer:hover,
        .scripture-ring-mid:hover,
        .scripture-ring-inner:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .scripture-ring-outer, .scripture-ring-outer-counter,
          .scripture-ring-mid, .scripture-ring-mid-counter,
          .scripture-ring-inner, .scripture-ring-inner-counter { animation: none; }
        }
      ` }} />

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-amber-100 mb-2">
          <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
            愿财双圆 · 经论大系统
          </span>
        </h1>
        <p className="text-amber-200/60 max-w-xl mx-auto">
          起大愿 · 发大财 · 布施众生 — 以禅宗一花五叶为核心，佛教八大宗派为脉络，十二大信仰传统为全景
        </p>
      </div>

      {/* ── Knowledge Graph: Concentric Rings (Rotating) ── */}
      <div className="relative mx-auto" style={{ maxWidth: 600 }}>
        <div className="relative aspect-square">
          {/* Ambient glow pulse */}
          <div className="absolute inset-[10%] rounded-full bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5 blur-2xl pointer-events-none" />

          {/* Ring 3 (outer) */}
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 bg-purple-500/5" />
          <div className="absolute inset-0 p-3 scripture-ring-outer" style={{ transformOrigin: "50% 50%" }}>
            {ringGroups[3]?.map((cat, i) => {
              const total = ringGroups[3].length;
              const angle = (i / total) * 360 - 90;
              const r = 46;
              const x = 50 + r * Math.cos((angle * Math.PI) / 180);
              const y = 50 + r * Math.sin((angle * Math.PI) / 180);
              return (
                <Link
                  key={cat.id}
                  href={`/trips/cultivation/scriptures?cat=${cat.slug}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={cat.name}
                >
                  <div
                    className="scripture-ring-outer-counter flex flex-col items-center"
                    style={{ transformOrigin: "50% 50%" }}
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-sm sm:text-base group-hover:bg-purple-500/40 group-hover:scale-110 transition-all cursor-pointer">
                      {cat.icon || TRADITION_ICONS[cat.tradition] || "📚"}
                    </div>
                    <span className="mt-0.5 text-[9px] sm:text-[10px] text-purple-300/70 whitespace-nowrap group-hover:text-purple-200">
                      {cat.name.replace("经典", "")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Ring 2 (middle) */}
          <div className="absolute inset-[18%] rounded-full border-2 border-cyan-500/30 bg-cyan-500/5" />
          <div className="absolute inset-[18%] scripture-ring-mid" style={{ transformOrigin: "50% 50%" }}>
            {ringGroups[2]?.map((cat, i) => {
              const total = ringGroups[2].length;
              const angle = (i / total) * 360 - 90;
              const r = 42;
              const x = 50 + r * Math.cos((angle * Math.PI) / 180);
              const y = 50 + r * Math.sin((angle * Math.PI) / 180);
              return (
                <Link
                  key={cat.id}
                  href={`/trips/cultivation/scriptures?cat=${cat.slug}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={cat.name}
                >
                  <div
                    className="scripture-ring-mid-counter flex flex-col items-center"
                    style={{ transformOrigin: "50% 50%" }}
                  >
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-sm sm:text-lg group-hover:bg-cyan-500/40 group-hover:scale-110 transition-all cursor-pointer">
                      {cat.icon || "☸"}
                    </div>
                    <span className="mt-0.5 text-[9px] sm:text-[10px] text-cyan-300/70 whitespace-nowrap group-hover:text-cyan-200">
                      {cat.name.replace("经典", "")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Ring 1 (inner) — Zen core */}
          <div className="absolute inset-[36%] rounded-full border-2 border-amber-500/50 bg-amber-500/10" />
          <div className="absolute inset-[36%] scripture-ring-inner" style={{ transformOrigin: "50% 50%" }}>
            {ringGroups[1]?.map((cat, i) => {
              const total = ringGroups[1].length;
              const angle = (i / total) * 360 - 90;
              const r = 38;
              const x = 50 + r * Math.cos((angle * Math.PI) / 180);
              const y = 50 + r * Math.sin((angle * Math.PI) / 180);
              return (
                <Link
                  key={cat.id}
                  href={`/trips/cultivation/scriptures?cat=${cat.slug}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={cat.name}
                >
                  <div
                    className="scripture-ring-inner-counter flex flex-col items-center"
                    style={{ transformOrigin: "50% 50%" }}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-base sm:text-xl group-hover:bg-amber-500/40 group-hover:scale-110 transition-all cursor-pointer shadow-lg shadow-amber-500/10">
                      {cat.icon || "🪷"}
                    </div>
                    <span className="mt-0.5 text-[10px] sm:text-xs text-amber-300/80 whitespace-nowrap font-medium group-hover:text-amber-200">
                      {cat.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Center — Platform Sutra (pulsing, 愿财双圆) */}
          <Link
            href="/trips/cultivation/scriptures/platform-sutra"
            className="absolute inset-[44%] rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-xl shadow-amber-500/40 flex flex-col items-center justify-center text-center hover:scale-110 transition-transform cursor-pointer z-10 animate-pulse"
          >
            <span className="text-2xl sm:text-3xl">🪷</span>
            <span className="text-[10px] sm:text-xs font-bold text-amber-950 leading-tight mt-0.5">愿财双圆</span>
          </Link>
        </div>

        {/* Ring labels */}
        <div className="flex justify-center gap-4 mt-4">
          {[1, 2, 3].map((ring) => (
            <div key={ring} className="flex items-center gap-1.5 text-xs text-amber-200/50">
              <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${RING_COLORS[ring]}`} />
              {RING_LABELS[ring]}
            </div>
          ))}
        </div>
      </div>

      {/* ── Recommended ── */}
      {recommended.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-amber-100 mb-3">为你推荐</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recommended.map((s) => (
              <ScriptureCard key={s.id} item={s} />
            ))}
          </div>
        </section>
      )}

      {/* ── Filter tabs + Search ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((ring) => (
            <button
              key={ring}
              onClick={() => {
                setActiveRing(ring);
                if (ring === 0) {
                  fetchScriptures({ page: 1 }).then((r) =>
                    setAllItems(Array.isArray(r) ? r : r?.items ?? []),
                  );
                } else {
                  fetchScriptures({ ring, page: 1 }).then((r) =>
                    setAllItems(Array.isArray(r) ? r : r?.items ?? []),
                  );
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeRing === ring
                  ? "bg-amber-500/20 text-amber-200 border border-amber-400/40"
                  : "text-amber-200/50 hover:text-amber-200 hover:bg-amber-950/40"
              }`}
            >
              {ring === 0 ? "全部" : RING_LABELS[ring]}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="搜索经论/作者..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-3 py-1.5 rounded-lg bg-amber-950/30 border border-amber-900/50 text-amber-100 placeholder-amber-200/30 text-sm focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {/* ── Scripture list ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((s) => (
          <ScriptureCard key={s.id} item={s} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-amber-200/40">
          <div className="text-5xl mb-3">📜</div>
          <p>暂无匹配的经论</p>
        </div>
      )}
    </div>
  );
}

function ScriptureCard({ item }: { item: ScriptureItem }) {
  return (
    <Link
      href={`/trips/cultivation/scriptures/${item.slug}`}
      className={`block rounded-2xl border ${RING_BORDERS[item.ring] || "border-amber-900/50"} ${RING_BG[item.ring] || "bg-amber-950/20"} p-4 hover:scale-[1.02] transition-all`}
    >
      <div className="flex items-start gap-3">
        <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${RING_COLORS[item.ring] || RING_COLORS[1]} flex items-center justify-center text-lg shadow`}>
          {item.category?.icon || TRADITION_ICONS[item.tradition] || "📜"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-amber-100 truncate">{item.title}</h3>
          <div className="text-xs text-amber-200/50 mt-0.5">
            {item.author && <span>{item.author}</span>}
            {item.era && <span> · {item.era}</span>}
            {item.chapterCount > 0 && <span> · {item.chapterCount}章</span>}
          </div>
          <p className="text-xs text-amber-200/40 mt-1 line-clamp-2">{item.summary}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${RING_BG[item.ring]} border ${RING_BORDERS[item.ring]} text-amber-300/70`}>
          {RING_LABELS[item.ring]}
        </span>
        {item.difficulty > 0 && (
          <span className="text-[10px] text-amber-200/40">
            {"★".repeat(item.difficulty)}{"☆".repeat(5 - item.difficulty)}
          </span>
        )}
        <span className="ml-auto text-[10px] text-amber-200/30">{item.viewCount} 阅读</span>
      </div>
    </Link>
  );
}
