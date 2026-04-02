"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Religion, Patriarch } from "@/lib/api";
import InkAvatar from "@/app/zen-patriarchs/InkAvatar";

// ── Christian Traditions Data ───────────────────────────────────────────
const CHRISTIAN_TRADITIONS = [
  { key: "apostles", name: "耶稣与使徒", nameEn: "Jesus & Apostles", founder: "耶稣基督 (前4-30)", status: "foundational", temple: "伯利恒主诞堂 · 圣墓教堂 · 梵蒂冈", method: "福音宣讲 · 十字架救赎 · 复活见证" },
  { key: "fathers", name: "教父与神学家", nameEn: "Church Fathers", founder: "奥古斯丁 · 阿奎那 · 巴西尔", status: "historical", temple: "帕维亚 · 图卢兹 · 君士坦丁堡", method: "恩典神学 · 经院哲学 · 圣经注释" },
  { key: "reformers", name: "宗教改革家", nameEn: "Reformers", founder: "马丁·路德 (1483-1546)", status: "historical", temple: "维滕贝格 · 日内瓦 · 苏黎世", method: "唯独圣经 · 因信称义 · 万民皆祭司" },
  { key: "mystics", name: "神秘主义与灵修", nameEn: "Mystics & Spirituality", founder: "亚西西的方济各 (1181-1226)", status: "active", temple: "亚西西 · 阿维拉 · 客西马尼", method: "神贫精神 · 灵魂暗夜 · 默观祈祷" },
  { key: "modern", name: "近现代影响者", nameEn: "Modern Influencers", founder: "德蕾莎修女 · C.S.路易斯", status: "active", temple: "加尔各答 · 牛津 · 梵蒂冈", method: "社会福音 · 护教文学 · 和平正义" },
];

// ── School name mapping ─────────────────────────────────────────────────
const schoolNameMap: Record<string, string> = {
  apostles: "耶稣与使徒",
  fathers: "教父与神学家",
  reformers: "宗教改革家",
  mystics: "神秘主义与灵修",
  modern: "近现代影响者",
};

// ── Patriarch Card ───────────────────────────────────────────────────────
function ChristianCard({ p, t }: { p: Patriarch; t: (k: string) => string }) {
  return (
    <Link
      href={`/christian-patriarchs/${p.id}`}
      className="block rounded-xl bg-white border border-[#3B82F6]/20 p-5 hover:shadow-lg hover:border-[#3B82F6]/50 transition-all group"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#3B82F6]/20 to-[#2563EB]/10 border-2 border-[#3B82F6]/30 flex items-center justify-center text-2xl flex-shrink-0">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <InkAvatar name={p.name} size={56} />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-bold text-[#2C1810] group-hover:text-[#3B82F6] transition-colors">
              {p.name}
            </h3>
            {p.generation && (
              <span className="px-2 py-0.5 bg-[#3B82F6]/10 text-[#3B82F6] text-xs rounded-full font-medium">
                {t("christian.card.generation").replace("{n}", String(p.generation))}
              </span>
            )}
          </div>
          {p.nameEn && (
            <p className="text-xs text-[#6B5C4D] mt-0.5">{p.nameEn}</p>
          )}
        </div>
      </div>

      {p.dates && (
        <p className="text-xs text-[#8B6914] mb-2">📅 {p.dates}</p>
      )}
      {p.title && (
        <p className="text-sm text-[#3B82F6] font-medium mb-2">✝ {p.title}</p>
      )}
      {p.coreTeaching && (
        <p className="text-xs text-[#6B5C4D] line-clamp-2 mb-3">
          {p.coreTeaching.slice(0, 100)}...
        </p>
      )}

      {/* Churches/Holy Sites */}
      {Array.isArray(p.templeNames) && p.templeNames.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(p.templeNames as { name: string }[]).slice(0, 2).map((tm, i) => (
            <span key={i} className="px-2 py-0.5 bg-[#3B82F6]/5 text-[#3B82F6] text-xs rounded border border-[#3B82F6]/20">
              ⛪ {tm.name}
            </span>
          ))}
        </div>
      )}

      {/* Classic Quotes */}
      {Array.isArray(p.classicQuotes) && p.classicQuotes.length > 0 && (
        <p className="text-xs text-[#6B5C4D] italic border-l-2 border-[#3B82F6]/30 pl-2 line-clamp-1">
          &ldquo;{(p.classicQuotes as string[])[0]}&rdquo;
        </p>
      )}

      <div className="mt-3 text-xs text-[#3B82F6] font-medium group-hover:underline">
        {t("christian.card.viewDetail")} →
      </div>
    </Link>
  );
}

export default function ChristianPatriarchsClient({
  patriarchs,
  religions,
}: {
  patriarchs: Patriarch[];
  religions: Religion[];
}) {
  const { t } = useTranslation();
  const [activeTradition, setActiveTradition] = useState("apostles");
  const [search, setSearch] = useState("");

  // Filter patriarchs by active tradition
  const activePatriarchs = useMemo(() => {
    const schoolName = schoolNameMap[activeTradition];
    return patriarchs.filter((p) => p.school === schoolName);
  }, [activeTradition, patriarchs]);

  // Search filter
  const filtered = useMemo(() => {
    if (!search) return activePatriarchs;
    const q = search.toLowerCase();
    return activePatriarchs.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.nameEn?.toLowerCase().includes(q)) ||
        (p.title?.toLowerCase().includes(q)) ||
        (p.dates?.toLowerCase().includes(q))
    );
  }, [search, activePatriarchs]);

  // Stats
  const totalPatriarchs = patriarchs.length;

  return (
    <main className="min-h-screen bg-[#F5F0E8]">
      <MobileNav />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-[#1E3A5F] via-[#1E40AF] to-[#F5F0E8] pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-5xl block mb-3">✝</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
            {t("christian.title")}
          </h1>
          <p className="text-[#93C5FD] text-sm mb-6">
            {t("christian.heroSubtitle")}
          </p>
          <Link href="/christian-patriarchs/atlas" className="inline-flex items-center gap-3 px-6 py-3 mt-4 mb-4 rounded-2xl text-base font-bold transition-all duration-300 group bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#3B82F6] text-white hover:from-[#60A5FA] hover:via-[#93C5FD] hover:to-[#60A5FA] shadow-lg shadow-[#3B82F6]/20 hover:shadow-[#3B82F6]/40">
            <span className="text-xl">🗺</span>
            <span><span className="block text-left">基督教先贤大图谱</span><span className="block text-xs font-normal opacity-70 text-left">全球法脉地图 · 追寻先贤足迹</span></span>
            <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          {/* Stats */}
          <div className="flex justify-center gap-8 text-white/90 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalPatriarchs}</div>
              <div className="text-xs text-[#93C5FD]">{t("christian.stats.patriarchs")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">5</div>
              <div className="text-xs text-[#93C5FD]">{t("christian.stats.traditions")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2000+</div>
              <div className="text-xs text-[#93C5FD]">{t("christian.stats.years")}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* Tradition Tabs */}
        <div className="bg-white rounded-xl border border-[#3B82F6]/20 p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#6B5C4D] mb-3">{t("christian.traditions.title")}</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CHRISTIAN_TRADITIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveTradition(s.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  activeTradition === s.key
                    ? "bg-[#3B82F6]/15 border-[#3B82F6] text-[#1D4ED8]"
                    : "bg-[#F5F0E8] border-[#D4C5A0]/30 text-[#6B5C4D] hover:border-[#3B82F6]/50"
                }`}
              >
                <span className="block">{s.name}</span>
                <span className="block text-xs opacity-70 mt-0.5">
                  {s.status === "active" ? t("christian.traditions.active") : s.status === "foundational" ? t("christian.traditions.foundational") : t("christian.traditions.historical")}
                </span>
              </button>
            ))}
          </div>

          {/* Tradition detail */}
          {(() => {
            const tradition = CHRISTIAN_TRADITIONS.find((s) => s.key === activeTradition);
            return (
              <div className="mt-4 p-4 bg-[#3B82F6]/5 rounded-lg border border-[#3B82F6]/20">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-lg">✝</span>
                  <div>
                    <span className="font-medium text-[#2C1810]">{tradition?.name} ({tradition?.nameEn})</span>
                    <span className="text-[#6B5C4D] ml-2">{tradition?.method}</span>
                  </div>
                </div>
                <p className="text-xs text-[#3B82F6] mt-2 ml-8">
                  {t(`christian.traditions.${activeTradition}Desc`)}
                </p>
              </div>
            );
          })()}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("christian.searchPlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-[#D4C5A0]/40 bg-white text-sm placeholder:text-[#A09080] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 outline-none"
          />
          <p className="text-xs text-[#6B5C4D] mt-2">
            {t("christian.foundCount").replace("{count}", String(filtered.length))}
          </p>
        </div>

        {/* Patriarchs Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">✝</span>
            <h3 className="text-lg font-serif font-bold text-[#2C1810] mb-1">
              {t("christian.empty.title")}
            </h3>
            <p className="text-sm text-[#6B5C4D]">{t("christian.empty.subtitle")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filtered
              .sort((a, b) => (a.generation ?? 99) - (b.generation ?? 99))
              .map((p) => (
                <ChristianCard key={p.id} p={p} t={t} />
              ))}
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#1E3A5F] to-[#1E40AF] rounded-2xl p-8 text-center mb-12">
          <h3 className="text-xl font-serif font-bold text-white mb-2">
            {t("christian.cta.title")}
          </h3>
          <p className="text-[#93C5FD] text-sm mb-5">{t("christian.cta.subtitle")}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/chat"
              className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold rounded-xl transition-colors text-sm"
            >
              {t("christian.cta.aiChat")}
            </Link>
            <Link
              href="/patriarchs"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20 text-sm"
            >
              {t("christian.cta.browseAll")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
