"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Religion, Patriarch } from "@/lib/api";
import InkAvatar from "@/app/zen-patriarchs/InkAvatar";

// ── Confucian Schools Data ──────────────────────────────────────────────
const CONFUCIAN_SCHOOLS = [
  { key: "preqin", name: "先秦儒学", nameEn: "Pre-Qin Confucianism", founder: "孔子 (前551-前479)", status: "foundational", temple: "曲阜孔庙 · 邹城孟庙", method: "仁礼中庸 · 有教无类 · 性善性恶" },
  { key: "hantang", name: "汉唐经学", nameEn: "Han-Tang Classics", founder: "董仲舒 (前179-前104)", status: "historical", temple: "太学 · 国子监 · 书院", method: "独尊儒术 · 遍注群经 · 道统说" },
  { key: "songming", name: "宋明理学", nameEn: "Neo-Confucianism", founder: "周敦颐 (1017-1073)", status: "historical", temple: "白鹿洞书院 · 岳麓书院 · 嵩阳书院", method: "格物穷理 · 天理人欲 · 四书集注" },
  { key: "yangming", name: "阳明心学", nameEn: "Yangming School", founder: "王阳明 (1472-1529)", status: "active", temple: "阳明洞 · 天泉桥 · 蕺山书院", method: "心即理 · 知行合一 · 致良知" },
  { key: "modern", name: "近现代新儒学", nameEn: "New Confucianism", founder: "熊十力 (1885-1968)", status: "active", temple: "北京大学 · 新亚书院", method: "返本开新 · 体用不二 · 花果飘零" },
];

const schoolNameMap: Record<string, string> = {
  preqin: "先秦儒学",
  hantang: "汉唐经学",
  songming: "宋明理学",
  yangming: "阳明心学",
  modern: "近现代新儒学",
};

function ConfucianCard({ p, t }: { p: Patriarch; t: (k: string) => string }) {
  return (
    <Link
      href={`/confucian-patriarchs/${p.id}`}
      className="block rounded-xl bg-white border border-[#DC2626]/20 p-5 hover:shadow-lg hover:border-[#DC2626]/50 transition-all group"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#DC2626]/20 to-[#B91C1C]/10 border-2 border-[#DC2626]/30 flex items-center justify-center text-2xl flex-shrink-0">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <InkAvatar name={p.name} size={56} />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-bold text-[#2C1810] group-hover:text-[#DC2626] transition-colors">
              {p.name}
            </h3>
            {p.generation && (
              <span className="px-2 py-0.5 bg-[#DC2626]/10 text-[#DC2626] text-xs rounded-full font-medium">
                {t("confucian.card.generation").replace("{n}", String(p.generation))}
              </span>
            )}
          </div>
          {p.nameEn && <p className="text-xs text-[#6B5C4D] mt-0.5">{p.nameEn}</p>}
        </div>
      </div>
      {p.dates && <p className="text-xs text-[#8B6914] mb-2">📅 {p.dates}</p>}
      {p.title && <p className="text-sm text-[#DC2626] font-medium mb-2">儒 {p.title}</p>}
      {p.coreTeaching && <p className="text-xs text-[#6B5C4D] line-clamp-2 mb-3">{p.coreTeaching.slice(0, 100)}...</p>}
      {Array.isArray(p.templeNames) && p.templeNames.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(p.templeNames as { name: string }[]).slice(0, 2).map((tm, i) => (
            <span key={i} className="px-2 py-0.5 bg-[#DC2626]/5 text-[#DC2626] text-xs rounded border border-[#DC2626]/20">🏛️ {tm.name}</span>
          ))}
        </div>
      )}
      {Array.isArray(p.classicQuotes) && p.classicQuotes.length > 0 && (
        <p className="text-xs text-[#6B5C4D] italic border-l-2 border-[#DC2626]/30 pl-2 line-clamp-1">&ldquo;{(p.classicQuotes as string[])[0]}&rdquo;</p>
      )}
      <div className="mt-3 text-xs text-[#DC2626] font-medium group-hover:underline">{t("confucian.card.viewDetail")} →</div>
    </Link>
  );
}

export default function ConfucianPatriarchsClient({
  patriarchs, religions,
}: { patriarchs: Patriarch[]; religions: Religion[] }) {
  const { t } = useTranslation();
  const [activeSchool, setActiveSchool] = useState("preqin");
  const [search, setSearch] = useState("");

  const activePatriarchs = useMemo(() => {
    const schoolName = schoolNameMap[activeSchool];
    return patriarchs.filter((p) => p.school === schoolName);
  }, [activeSchool, patriarchs]);

  const filtered = useMemo(() => {
    if (!search) return activePatriarchs;
    const q = search.toLowerCase();
    return activePatriarchs.filter((p) =>
      p.name.toLowerCase().includes(q) || (p.nameEn?.toLowerCase().includes(q)) || (p.title?.toLowerCase().includes(q)) || (p.dates?.toLowerCase().includes(q))
    );
  }, [search, activePatriarchs]);

  const totalPatriarchs = patriarchs.length;

  return (
    <main className="min-h-screen bg-[#F5F0E8]">
      <MobileNav />
      <section className="relative bg-gradient-to-b from-[#7F1D1D] via-[#991B1B] to-[#F5F0E8] pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-5xl block mb-3">儒</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">{t("confucian.title")}</h1>
          <p className="text-[#FCA5A5] text-sm mb-6">{t("confucian.heroSubtitle")}</p>
          <div className="flex justify-center gap-8 text-white/90 text-sm">
            <div className="text-center"><div className="text-2xl font-bold">{totalPatriarchs}</div><div className="text-xs text-[#FCA5A5]">{t("confucian.stats.patriarchs")}</div></div>
            <div className="text-center"><div className="text-2xl font-bold">5</div><div className="text-xs text-[#FCA5A5]">{t("confucian.stats.schools")}</div></div>
            <div className="text-center"><div className="text-2xl font-bold">2500+</div><div className="text-xs text-[#FCA5A5]">{t("confucian.stats.years")}</div></div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl border border-[#DC2626]/20 p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#6B5C4D] mb-3">{t("confucian.schools.title")}</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CONFUCIAN_SCHOOLS.map((s) => (
              <button key={s.key} onClick={() => setActiveSchool(s.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeSchool === s.key ? "bg-[#DC2626]/15 border-[#DC2626] text-[#B91C1C]" : "bg-[#F5F0E8] border-[#D4C5A0]/30 text-[#6B5C4D] hover:border-[#DC2626]/50"}`}>
                <span className="block">{s.name}</span>
                <span className="block text-xs opacity-70 mt-0.5">{s.status === "active" ? t("confucian.schools.active") : s.status === "foundational" ? t("confucian.schools.foundational") : t("confucian.schools.historical")}</span>
              </button>
            ))}
          </div>
          {(() => {
            const school = CONFUCIAN_SCHOOLS.find((s) => s.key === activeSchool);
            return (
              <div className="mt-4 p-4 bg-[#DC2626]/5 rounded-lg border border-[#DC2626]/20">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-lg">儒</span>
                  <div><span className="font-medium text-[#2C1810]">{school?.name} ({school?.nameEn})</span><span className="text-[#6B5C4D] ml-2">{school?.method}</span></div>
                </div>
                <p className="text-xs text-[#DC2626] mt-2 ml-8">{t(`confucian.schools.${activeSchool}Desc`)}</p>
              </div>
            );
          })()}
        </div>

        <div className="mb-6">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("confucian.searchPlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-[#D4C5A0]/40 bg-white text-sm placeholder:text-[#A09080] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]/30 outline-none" />
          <p className="text-xs text-[#6B5C4D] mt-2">{t("confucian.foundCount").replace("{count}", String(filtered.length))}</p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">儒</span>
            <h3 className="text-lg font-serif font-bold text-[#2C1810] mb-1">{t("confucian.empty.title")}</h3>
            <p className="text-sm text-[#6B5C4D]">{t("confucian.empty.subtitle")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filtered.sort((a, b) => (a.generation ?? 99) - (b.generation ?? 99)).map((p) => (<ConfucianCard key={p.id} p={p} t={t} />))}
          </div>
        )}

        <div className="bg-gradient-to-r from-[#7F1D1D] to-[#991B1B] rounded-2xl p-8 text-center mb-12">
          <h3 className="text-xl font-serif font-bold text-white mb-2">{t("confucian.cta.title")}</h3>
          <p className="text-[#FCA5A5] text-sm mb-5">{t("confucian.cta.subtitle")}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/chat" className="px-6 py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold rounded-xl transition-colors text-sm">{t("confucian.cta.aiChat")}</Link>
            <Link href="/patriarchs" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20 text-sm">{t("confucian.cta.browseAll")}</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
