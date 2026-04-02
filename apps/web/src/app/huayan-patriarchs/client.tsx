"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Religion, Patriarch } from "@/lib/api";
import InkAvatar from "@/app/zen-patriarchs/InkAvatar";

// ── Huayan Schools Data ────────────────────────────────────────────────
const HUAYAN_SCHOOLS = [
  { key: "huayan", name: "华严宗", nameEn: "Huayan School", founder: "法藏大师 (643-712)", status: "active", temple: "西安华严寺", method: "法界缘起 · 四法界 · 十玄门" },
  { key: "japanese", name: "日本华严宗", nameEn: "Japanese Kegon", founder: "良辩 (689-773)", status: "derivative", temple: "奈良东大寺", method: "华严经学东传" },
];

interface EraGroup {
  era: string;
  eraKey: string;
  patriarchs: Patriarch[];
}

function groupByEra(patriarchs: Patriarch[]): EraGroup[] {
  const eraMap: Record<string, { key: string; pats: Patriarch[] }> = {
    "唐代": { key: "huayan.era.tang", pats: [] },
  };

  for (const p of patriarchs) {
    eraMap["唐代"].pats.push(p);
  }

  return Object.entries(eraMap)
    .filter(([, v]) => v.pats.length > 0)
    .map(([era, v]) => ({ era, eraKey: v.key, patriarchs: v.pats }));
}

function HuayanCard({ p, t }: { p: Patriarch; t: (k: string) => string }) {
  return (
    <Link
      href={`/huayan-patriarchs/${p.id}`}
      className="block rounded-xl bg-white border border-[#D4C5A0]/40 p-5 hover:shadow-lg hover:border-[#C4A265]/60 transition-all group"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C4A265]/20 to-[#8B6914]/10 border-2 border-[#C4A265]/30 flex items-center justify-center text-2xl flex-shrink-0">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <InkAvatar name={p.name} size={56} />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-bold text-[#2C1810] group-hover:text-[#8B6914] transition-colors">{p.name}</h3>
            {p.generation && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#C4A265]/15 text-[#8B6914] border border-[#C4A265]/30">
                {t("huayan.card.generation").replace("{n}", String(p.generation))}
              </span>
            )}
          </div>
          <div className="text-xs text-[#6B5C4D] mt-0.5">
            {p.nameEn && <span>{p.nameEn}</span>}
            {p.dates && <span> · {p.dates}</span>}
          </div>
          {p.title && <span className="text-xs text-[#8B6914]/70">{p.title}</span>}
        </div>
      </div>
      {(p.classicQuotes as string[] | null)?.length ? (
        <p className="text-sm text-[#6B5C4D] italic font-serif line-clamp-2 mt-2">「{(p.classicQuotes as string[])[0]}」</p>
      ) : null}
      {(p.templeNames as { name: string }[] | null)?.length ? (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {(p.templeNames as { name: string }[]).slice(0, 2).map((t) => (
            <span key={t.name} className="text-xs px-1.5 py-0.5 rounded bg-[#C4A265]/10 text-[#8B6914]">🏛 {t.name}</span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}

export default function HuayanPatriarchsClient({
  patriarchs,
  allBuddhismPatriarchs: _allBuddhism,
  religions: _religions,
}: {
  patriarchs: Patriarch[];
  allBuddhismPatriarchs: Patriarch[];
  religions: Religion[];
}) {
  const { t } = useTranslation();
  const [activeSchool, setActiveSchool] = useState("huayan");
  const [viewMode, setViewMode] = useState<"timeline" | "grid">("timeline");
  const [search, setSearch] = useState("");

  const eraGroups = useMemo(() => groupByEra(patriarchs), [patriarchs]);
  const filtered = useMemo(() => {
    if (!search) return patriarchs;
    const q = search.toLowerCase();
    return patriarchs.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.nameEn ?? "").toLowerCase().includes(q) || (p.title ?? "").toLowerCase().includes(q) || (p.dates ?? "").includes(q)
    );
  }, [patriarchs, search]);

  return (
    <main className="min-h-screen bg-[#F5F0E8]">
      <div className="relative bg-gradient-to-b from-[#2C1810] via-[#3D2B1F] to-[#F5F0E8] pt-16 pb-12 px-4">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_40%,#C4A265_0%,transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative">
          <Link href="/patriarchs" className="text-[#D4C5A0] text-sm hover:text-[#C4A265] mb-4 inline-block">← {t("huayan.cta.browseAll")}</Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🌸</span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#F5F0E8] tracking-wide">{t("huayan.title")}</h1>
          </div>
          <p className="text-[#D4C5A0] text-sm max-w-xl">{t("huayan.heroSubtitle")}</p>
          <Link href="/huayan-patriarchs/atlas" className="inline-flex items-center gap-3 px-6 py-3 mt-4 rounded-2xl text-base font-bold transition-all duration-300 group bg-gradient-to-r from-[#C4A265] via-[#D4B87A] to-[#C4A265] text-[#2C1810] hover:from-[#D4B87A] hover:via-[#E5C98A] hover:to-[#D4B87A] shadow-lg shadow-[#C4A265]/20 hover:shadow-[#C4A265]/40">
            <span className="text-xl">🗺</span>
            <span><span className="block text-left">华严宗祖师大图谱</span><span className="block text-xs font-normal opacity-70 text-left">全球法脉地图 · 追寻祖师足迹</span></span>
            <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <div className="flex gap-6 mt-6">
            {[
              { value: "5", label: t("huayan.stats.patriarchs") },
              { value: "300+", label: t("huayan.stats.years") },
              { value: "3", label: t("huayan.stats.temples") },
            ].map((s) => (
              <div key={s.label}>
                <span className="text-2xl font-bold text-[#C4A265]">{s.value}</span>
                <span className="text-xs text-[#D4C5A0] ml-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-xl border border-[#D4C5A0]/40 p-5 mb-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#6B5C4D] mb-3">{t("huayan.schools.title")}</h2>
          <div className="flex flex-wrap gap-2">
            {HUAYAN_SCHOOLS.map((s) => (
              <button key={s.key} onClick={() => setActiveSchool(s.key)}
                className={`px-4 py-2 rounded-lg text-sm transition-all border ${activeSchool === s.key ? "bg-[#C4A265]/15 border-[#C4A265] text-[#8B6914] font-medium" : "border-[#D4C5A0]/40 text-[#6B5C4D] hover:border-[#C4A265]/50"}`}>
                {s.name}
                <span className="ml-1.5 text-xs opacity-60">
                  {s.status === "active" ? t("huayan.schools.active") : t("huayan.schools.derivative")}
                </span>
              </button>
            ))}
          </div>
          {(() => {
            const school = HUAYAN_SCHOOLS.find((s) => s.key === activeSchool);
            return (
              <div className="mt-4 p-4 bg-[#C4A265]/5 rounded-lg border border-[#C4A265]/20">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-lg">🌸</span>
                  <div>
                    <span className="font-medium text-[#2C1810]">{school?.name} ({school?.nameEn})</span>
                    <span className="text-[#6B5C4D] ml-2">{school?.method}</span>
                  </div>
                </div>
                <p className="text-xs text-[#8B6914] mt-2 ml-8">{school?.founder} · {school?.temple}</p>
              </div>
            );
          })()}
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("huayan.searchPlaceholder")}
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg bg-white border border-[#D4C5A0]/40 text-[#2C1810] text-sm placeholder-[#A09080] focus:outline-none focus:border-[#C4A265]" />
          <div className="flex rounded-lg border border-[#D4C5A0]/40 bg-white overflow-hidden">
            <button onClick={() => setViewMode("timeline")} className={`px-3 py-2 text-sm ${viewMode === "timeline" ? "bg-[#C4A265]/15 text-[#8B6914]" : "text-[#6B5C4D]"}`}>{t("huayan.view.timeline")}</button>
            <button onClick={() => setViewMode("grid")} className={`px-3 py-2 text-sm ${viewMode === "grid" ? "bg-[#C4A265]/15 text-[#8B6914]" : "text-[#6B5C4D]"}`}>{t("huayan.view.grid")}</button>
          </div>
        </div>

        {activeSchool !== "huayan" ? (
          <div className="bg-white rounded-xl border border-[#D4C5A0]/40 p-8 mb-6 text-center">
            <span className="text-4xl block mb-3">🌸</span>
            <p className="text-[#6B5C4D] text-sm">{HUAYAN_SCHOOLS.find((s) => s.key === activeSchool)?.name} 祖师资料即将上线</p>
          </div>
        ) : (
          <>
            {viewMode === "timeline" && (
              <div className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6 mb-6 shadow-sm">
                <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-1">{t("huayan.lineage.title")}</h2>
                <p className="text-xs text-[#6B5C4D] mb-6">{t("huayan.lineage.subtitle")}</p>
                {eraGroups.length === 0 ? (
                  <div className="text-center py-10">
                    <span className="text-4xl block mb-2">🌸</span>
                    <p className="text-[#6B5C4D] text-sm">{t("huayan.empty.title")}</p>
                    <p className="text-xs text-[#A09080] mt-1">{t("huayan.empty.subtitle")}</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-[#C4A265]/30" />
                    {eraGroups.map((group) => (
                      <div key={group.era} className="mb-8 last:mb-0">
                        <div className="relative flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-[#C4A265]/15 border-2 border-[#C4A265]/40 flex items-center justify-center z-10">
                            <span className="text-xs font-bold text-[#8B6914]">{group.era}</span>
                          </div>
                          <div className="ml-3 h-px flex-1 bg-[#C4A265]/20" />
                        </div>
                        <div className="ml-14 space-y-3">
                          {group.patriarchs.map((p) => (
                            <Link key={p.id} href={`/huayan-patriarchs/${p.id}`}
                              className="flex items-start gap-4 p-4 rounded-xl bg-[#F5F0E8] border border-[#D4C5A0]/30 hover:border-[#C4A265]/60 hover:shadow-md transition-all group">
                              <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-[#C4A265]/30 overflow-hidden">
                                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <InkAvatar name={p.name} size={48} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-serif font-bold text-[#2C1810] group-hover:text-[#8B6914] transition-colors">{p.name}</span>
                                  {p.generation && <span className="text-xs px-2 py-0.5 rounded-full bg-[#C4A265]/15 text-[#8B6914] border border-[#C4A265]/30">{t("huayan.lineage.generation").replace("{n}", String(p.generation))}</span>}
                                  {p.title && <span className="text-xs text-[#8B6914]/70">{p.title}</span>}
                                </div>
                                <div className="text-xs text-[#6B5C4D] mt-0.5">
                                  {p.nameEn && <span>{p.nameEn}</span>}{p.dates && <span> · {p.dates}</span>}
                                </div>
                                {p.coreTeaching && <p className="text-xs text-[#6B5C4D] mt-1.5 line-clamp-2 font-serif italic">{p.coreTeaching.slice(0, 80)}{p.coreTeaching.length > 80 ? "..." : ""}</p>}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {viewMode === "grid" && (
              <div>
                <p className="text-sm text-[#6B5C4D] mb-4">{t("huayan.foundCount").replace("{count}", String(filtered.length))}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {filtered.map((p) => <HuayanCard key={p.id} p={p} t={t} />)}
                </div>
              </div>
            )}
          </>
        )}

        <div className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-1">{t("huayan.temples.title")}</h2>
          <p className="text-xs text-[#6B5C4D] mb-4">{t("huayan.temples.subtitle")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "西安华严寺", nameEn: "Huayan Temple", location: "陕西西安", significance: "华严宗祖庭" },
              { name: "五台山清凉寺", nameEn: "Qingliang Temple", location: "山西五台", significance: "澄观大师驻锡" },
              { name: "终南山至相寺", nameEn: "Zhixiang Temple", location: "陕西西安", significance: "智俨大师道场" },
            ].map((temple) => (
              <div key={temple.name} className="p-4 rounded-lg bg-[#F5F0E8] border border-[#D4C5A0]/30 hover:border-[#C4A265]/50 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏛</span>
                  <div className="min-w-0">
                    <h3 className="font-serif font-bold text-[#2C1810] text-sm">{temple.name}</h3>
                    <p className="text-xs text-[#6B5C4D]">{temple.nameEn}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[#C4A265]/10 text-[#8B6914]">{temple.location}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[#2C1810]/5 text-[#6B5C4D]">{temple.significance}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2C1810] to-[#3D2B1F] rounded-xl p-8 text-center relative overflow-hidden mb-6">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#C4A265]/10 rounded-full blur-3xl" />
          <div className="relative">
            <span className="text-4xl block mb-3">🌸</span>
            <h2 className="text-xl font-serif font-bold text-[#F5F0E8]">{t("huayan.cta.title")}</h2>
            <p className="text-[#D4C5A0] text-sm mt-2 max-w-md mx-auto">{t("huayan.cta.subtitle")}</p>
            <div className="flex gap-3 justify-center mt-5">
              <Link href="/chat" className="px-6 py-3 bg-[#C4A265] hover:bg-[#B39255] text-white font-medium rounded-xl transition-colors text-sm">{t("huayan.cta.aiChat")}</Link>
              <Link href="/patriarchs" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-[#F5F0E8] font-medium rounded-xl transition-colors border border-white/20 text-sm">{t("huayan.cta.browseAll")}</Link>
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </main>
  );
}
