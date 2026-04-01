"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Patriarch } from "@/lib/api";
import InkAvatar from "@/app/zen-patriarchs/InkAvatar";

const SECTIONS = ["overview", "biography", "teachings", "achievements", "churches", "quotes", "works", "lineage"] as const;

function SectionNav({ activeSection, t }: { activeSection: string; t: (k: string) => string }) {
  return (
    <nav className="flex gap-1 overflow-x-auto pb-2 mb-6 border-b border-[#3B82F6]/20 scrollbar-hide">
      {SECTIONS.map((s) => (
        <a key={s} href={`#${s}`} className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${activeSection === s ? "bg-[#3B82F6]/15 text-[#1D4ED8] font-medium" : "text-[#6B5C4D] hover:text-[#3B82F6]"}`}>
          {t(`christian.detail.${s}`)}
        </a>
      ))}
    </nav>
  );
}

function TeachingCard({ teaching, t }: { teaching: { title: string; content: string; source?: string }; t: (k: string) => string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-[#3B82F6]/20 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 bg-[#F5F0E8] hover:bg-[#3B82F6]/10 transition-colors text-left">
        <span className="font-serif font-medium text-[#2C1810]">{teaching.title}</span>
        <span className="text-[#3B82F6] text-sm">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="p-4 border-t border-[#3B82F6]/20">
          <p className="text-[#2C1810] font-serif italic leading-relaxed">{teaching.content}</p>
          {teaching.source && <p className="text-xs text-[#3B82F6] mt-3">{t("christian.detail.teachingSource")}: {teaching.source}</p>}
        </div>
      )}
    </div>
  );
}

export default function ChristianPatriarchDetailClient({ patriarch: p }: { patriarch: Patriarch }) {
  const { t } = useTranslation();
  const [activeSection] = useState("overview");

  const koans = (p.koans ?? []) as { title: string; content: string; source?: string }[];
  const temples = (p.templeNames ?? []) as { name: string; nameEn?: string; role?: string; location?: string }[];
  const quotes = (p.classicQuotes ?? []) as string[];
  const works = (p.works ?? []) as { title: string; description?: string }[];
  const disciples = (p.disciples ?? []) as { id: string; name: string; generation?: number | null }[];

  return (
    <main className="min-h-screen bg-[#F5F0E8]">
      <MobileNav />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#1E3A5F] via-[#1E40AF] to-[#F5F0E8] pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/christian-patriarchs" className="text-[#93C5FD] text-sm hover:underline mb-4 inline-block">
            ← {t("christian.detail.backToList")}
          </Link>

          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#3B82F6]/30 to-[#2563EB]/20 border-3 border-[#3B82F6]/40 flex items-center justify-center mb-4">
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <InkAvatar name={p.name} size={96} />
            )}
          </div>

          <h1 className="text-3xl font-serif font-bold text-white mb-1">{p.name}</h1>
          {p.nameEn && <p className="text-[#93C5FD] text-sm mb-2">{p.nameEn}</p>}
          {p.title && <p className="text-[#60A5FA] text-sm font-medium">✝ {p.title}</p>}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl border border-[#3B82F6]/20 shadow-sm p-6 mb-6">
          <SectionNav activeSection={activeSection} t={t} />

          {/* Quick Info */}
          <div id="overview" className="grid grid-cols-2 gap-3 mb-8 p-4 bg-[#3B82F6]/5 rounded-lg">
            {p.dates && (
              <div><span className="text-xs text-[#6B5C4D]">{t("christian.detail.dates")}</span><p className="text-sm font-medium text-[#2C1810]">{p.dates}</p></div>
            )}
            {p.school && (
              <div><span className="text-xs text-[#6B5C4D]">{t("christian.detail.tradition")}</span><p className="text-sm font-medium text-[#2C1810]">{p.school}</p></div>
            )}
            {p.generation && (
              <div><span className="text-xs text-[#6B5C4D]">{t("christian.detail.generationLabel")}</span><p className="text-sm font-medium text-[#2C1810]">第{p.generation}位</p></div>
            )}
            {p.teacher && (
              <div><span className="text-xs text-[#6B5C4D]">{t("christian.detail.teacher")}</span><Link href={`/christian-patriarchs/${p.teacher.id}`} className="text-sm font-medium text-[#3B82F6] hover:underline block">{p.teacher.name}</Link></div>
            )}
          </div>

          {/* Core Teaching */}
          {p.coreTeaching && (
            <div className="mb-8">
              <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-3 flex items-center gap-2">
                <span className="text-[#3B82F6]">✝</span> {t("christian.detail.overview")}
              </h2>
              <p className="text-[#2C1810] leading-relaxed text-sm whitespace-pre-line">{p.coreTeaching}</p>
            </div>
          )}

          {/* Biography */}
          {p.biography && (
            <div id="biography" className="mb-8">
              <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-3">{t("christian.detail.biography")}</h2>
              <p className="text-[#2C1810] leading-relaxed text-sm whitespace-pre-line">{p.biography}</p>
            </div>
          )}

          {/* Teachings */}
          {koans.length > 0 && (
            <div id="teachings" className="mb-8">
              <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-3">{t("christian.detail.teachings")}</h2>
              <div className="space-y-3">
                {koans.map((k, i) => (
                  <TeachingCard key={i} teaching={{ title: k.title, content: (k as { title: string; content?: string; description?: string }).content || (k as { description?: string }).description || '', source: k.source }} t={t} />
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {p.achievements && (
            <div id="achievements" className="mb-8">
              <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-3">{t("christian.detail.achievements")}</h2>
              <p className="text-[#2C1810] leading-relaxed text-sm whitespace-pre-line">{p.achievements}</p>
            </div>
          )}

          {/* Churches / Holy Sites */}
          {temples.length > 0 && (
            <div id="churches" className="mb-8">
              <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-3">{t("christian.detail.churches")}</h2>
              <div className="grid gap-3">
                {temples.map((tm, i) => (
                  <div key={i} className="p-3 bg-[#3B82F6]/5 rounded-lg border border-[#3B82F6]/15">
                    <div className="flex items-center gap-2">
                      <span>⛪</span>
                      <span className="font-medium text-[#2C1810] text-sm">{tm.name}</span>
                      {tm.nameEn && <span className="text-xs text-[#6B5C4D]">({tm.nameEn})</span>}
                    </div>
                    {tm.role && <p className="text-xs text-[#3B82F6] mt-1 ml-6">{tm.role}</p>}
                    {tm.location && <p className="text-xs text-[#6B5C4D] mt-0.5 ml-6">📍 {tm.location}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Classic Quotes */}
          {quotes.length > 0 && (
            <div id="quotes" className="mb-8">
              <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-3">{t("christian.detail.quotes")}</h2>
              <div className="space-y-3">
                {quotes.map((q, i) => (
                  <blockquote key={i} className="border-l-3 border-[#3B82F6]/40 pl-4 py-2">
                    <p className="text-[#2C1810] font-serif italic text-sm">&ldquo;{q}&rdquo;</p>
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {/* Works */}
          {works.length > 0 && (
            <div id="works" className="mb-8">
              <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-3">{t("christian.detail.works")}</h2>
              <div className="space-y-3">
                {works.map((w, i) => (
                  <div key={i} className="p-3 bg-[#F5F0E8] rounded-lg">
                    <span className="font-medium text-[#2C1810] text-sm">📖 {w.title}</span>
                    {w.description && <p className="text-xs text-[#6B5C4D] mt-1">{w.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lineage */}
          <div id="lineage" className="mb-4">
            <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-3">{t("christian.detail.lineage")}</h2>
            <div className="space-y-2">
              {p.teacher && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#6B5C4D]">{t("christian.detail.teacher")}:</span>
                  <Link href={`/christian-patriarchs/${p.teacher.id}`} className="text-[#3B82F6] hover:underline font-medium">
                    {p.teacher.name}
                  </Link>
                </div>
              )}
              {disciples.length > 0 && (
                <div>
                  <span className="text-sm text-[#6B5C4D]">{t("christian.detail.disciples")} ({disciples.length}):</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {disciples.map((d) => (
                      <Link key={d.id} href={`/christian-patriarchs/${d.id}`} className="px-2 py-1 bg-[#3B82F6]/10 text-[#3B82F6] text-xs rounded hover:bg-[#3B82F6]/20 transition-colors">
                        {d.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
