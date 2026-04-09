"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Religion, Patriarch } from "@/lib/api";
import InkAvatar from "@/app/zen-patriarchs/InkAvatar";

// ── Taoist Traditions Data ──────────────────────────────────────────────
const TAOIST_TRADITIONS = [
  { key: "philosophy", name: "老庄哲学", nameEn: "Philosophical Daoism", founder: "老子 (约前571-前471)", status: "foundational", temple: "楼观台 · 太清宫 · 濠梁", method: "道法自然 · 无为而治 · 逍遥齐物" },
  { key: "zhengyi", name: "天师正一", nameEn: "Celestial Masters/Zhengyi", founder: "张道陵 (34-156)", status: "active", temple: "龙虎山 · 鹤鸣山 · 青城山", method: "符箓科仪 · 正一盟威 · 驱邪度亡" },
  { key: "shangqing", name: "上清灵宝", nameEn: "Shangqing & Lingbao", founder: "魏华存 (252-334)", status: "historical", temple: "茅山 · 庐山 · 天台山", method: "存思内观 · 经法科仪 · 三洞体系" },
  { key: "quanzhen", name: "全真派", nameEn: "Quanzhen", founder: "王重阳 (1112-1170)", status: "active", temple: "白云观 · 重阳宫 · 昆嵛山", method: "三教合一 · 性命双修 · 苦行炼心" },
  { key: "neidan", name: "内丹养生", nameEn: "Inner Alchemy", founder: "葛洪 (283-343)", status: "active", temple: "罗浮山 · 武当山 · 武夷山", method: "金丹大道 · 炼精化气 · 太极养生" },
];

// ── School name mapping ─────────────────────────────────────────────────
const schoolNameMap: Record<string, string> = {
  philosophy: "老庄哲学",
  zhengyi: "天师正一",
  shangqing: "上清灵宝",
  quanzhen: "全真派",
  neidan: "内丹养生",
};

// ── Patriarch Card ───────────────────────────────────────────────────────
function TaoistCard({ p, t }: { p: Patriarch; t: (k: string) => string }) {
  return (
    <Link
      href={`/taoist-patriarchs/${p.id}`}
      className="block rounded-xl bg-white border border-[#10B981]/20 p-5 hover:shadow-lg hover:border-[#10B981]/50 transition-all group"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/10 border-2 border-[#10B981]/30 flex items-center justify-center text-2xl flex-shrink-0">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <InkAvatar name={p.name} size={56} />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-bold text-[#2C1810] group-hover:text-[#10B981] transition-colors">
              {p.name}
            </h3>
            {p.generation && (
              <span className="px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] text-xs rounded-full font-medium">
                {t("taoist.card.generation").replace("{n}", String(p.generation))}
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
        <p className="text-sm text-[#10B981] font-medium mb-2">☯ {p.title}</p>
      )}
      {p.coreTeaching && (
        <p className="text-xs text-[#6B5C4D] line-clamp-2 mb-3">
          {p.coreTeaching.slice(0, 100)}...
        </p>
      )}

      {/* Temples/Holy Sites */}
      {Array.isArray(p.templeNames) && p.templeNames.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(p.templeNames as { name: string }[]).slice(0, 2).map((tm, i) => (
            <span key={i} className="px-2 py-0.5 bg-[#10B981]/5 text-[#10B981] text-xs rounded border border-[#10B981]/20">
              🏔️ {tm.name}
            </span>
          ))}
        </div>
      )}

      {/* Classic Quotes */}
      {Array.isArray(p.classicQuotes) && p.classicQuotes.length > 0 && (
        <p className="text-xs text-[#6B5C4D] italic border-l-2 border-[#10B981]/30 pl-2 line-clamp-1">
          &ldquo;{(p.classicQuotes as string[])[0]}&rdquo;
        </p>
      )}

      <div className="mt-3 text-xs text-[#10B981] font-medium group-hover:underline">
        {t("taoist.card.viewDetail")} →
      </div>
    </Link>
  );
}

export default function TaoistPatriarchsClient({
  patriarchs,
  religions,
}: {
  patriarchs: Patriarch[];
  religions: Religion[];
}) {
  const { t } = useTranslation();
  const [activeTradition, setActiveTradition] = useState("philosophy");
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
      <section className="relative bg-gradient-to-b from-[#064E3B] via-[#065F46] to-[#F5F0E8] pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-5xl block mb-3">☯</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
            {t("taoist.title")}
          </h1>
          <p className="text-[#6EE7B7] text-sm mb-6">
            {t("taoist.heroSubtitle")}
          </p>
          <Link href="/taoist-patriarchs/atlas" className="inline-flex items-center gap-3 px-6 py-3 mt-4 mb-4 rounded-2xl text-base font-bold transition-all duration-300 group bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#10B981] text-white hover:from-[#34D399] hover:via-[#6EE7B7] hover:to-[#34D399] shadow-lg shadow-[#10B981]/20 hover:shadow-[#10B981]/40">
            <span className="text-xl">🗺</span>
            <span><span className="block text-left">道教文化祖师大图谱</span><span className="block text-xs font-normal opacity-70 text-left">全球法脉地图 · 追寻祖师足迹</span></span>
            <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          {/* Stats */}
          <div className="flex justify-center gap-8 text-white/90 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalPatriarchs}</div>
              <div className="text-xs text-[#6EE7B7]">{t("taoist.stats.patriarchs")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">5</div>
              <div className="text-xs text-[#6EE7B7]">{t("taoist.stats.traditions")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2500+</div>
              <div className="text-xs text-[#6EE7B7]">{t("taoist.stats.years")}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* Tradition Tabs */}
        <div className="bg-white rounded-xl border border-[#10B981]/20 p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#6B5C4D] mb-3">{t("taoist.traditions.title")}</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TAOIST_TRADITIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveTradition(s.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  activeTradition === s.key
                    ? "bg-[#10B981]/15 border-[#10B981] text-[#047857]"
                    : "bg-[#F5F0E8] border-[#D4C5A0]/30 text-[#6B5C4D] hover:border-[#10B981]/50"
                }`}
              >
                <span className="block">{s.name}</span>
                <span className="block text-xs opacity-70 mt-0.5">
                  {s.status === "active" ? t("taoist.traditions.active") : s.status === "foundational" ? t("taoist.traditions.foundational") : t("taoist.traditions.historical")}
                </span>
              </button>
            ))}
          </div>

          {/* Tradition detail */}
          {(() => {
            const tradition = TAOIST_TRADITIONS.find((s) => s.key === activeTradition);
            return (
              <div className="mt-4 p-4 bg-[#10B981]/5 rounded-lg border border-[#10B981]/20">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-lg">☯</span>
                  <div>
                    <span className="font-medium text-[#2C1810]">{tradition?.name} ({tradition?.nameEn})</span>
                    <span className="text-[#6B5C4D] ml-2">{tradition?.method}</span>
                  </div>
                </div>
                <p className="text-xs text-[#10B981] mt-2 ml-8">
                  {t(`taoist.traditions.${activeTradition}Desc`)}
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
            placeholder={t("taoist.searchPlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-[#D4C5A0]/40 bg-white text-sm placeholder:text-[#A09080] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 outline-none"
          />
          <p className="text-xs text-[#6B5C4D] mt-2">
            {t("taoist.foundCount").replace("{count}", String(filtered.length))}
          </p>
        </div>

        {/* Patriarchs Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">☯</span>
            <h3 className="text-lg font-serif font-bold text-[#2C1810] mb-1">
              {t("taoist.empty.title")}
            </h3>
            <p className="text-sm text-[#6B5C4D]">{t("taoist.empty.subtitle")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filtered
              .sort((a, b) => (a.generation ?? 99) - (b.generation ?? 99))
              .map((p) => (
                <TaoistCard key={p.id} p={p} t={t} />
              ))}
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#064E3B] to-[#065F46] rounded-2xl p-8 text-center mb-12">
          <h3 className="text-xl font-serif font-bold text-white mb-2">
            {t("taoist.cta.title")}
          </h3>
          <p className="text-[#6EE7B7] text-sm mb-5">{t("taoist.cta.subtitle")}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/chat"
              className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-xl transition-colors text-sm"
            >
              {t("taoist.cta.aiChat")}
            </Link>
            <Link
              href="/patriarchs"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20 text-sm"
            >
              {t("taoist.cta.browseAll")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
