"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Patriarch } from "@/lib/api";
import InkAvatar from "../InkAvatar";

// ── Section Nav ────────────────────────────────────────────────────────────
const SECTIONS = [
  "overview", "biography", "koans", "achievements",
  "temples", "quotes", "works", "lineage",
] as const;

function SectionNav({ activeSection, t }: { activeSection: string; t: (k: string) => string }) {
  return (
    <div className="sticky top-0 z-20 bg-[#F5F0E8]/95 backdrop-blur-sm border-b border-[#D4C5A0]/40">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
          {SECTIONS.map((s) => (
            <a
              key={s}
              href={`#${s}`}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activeSection === s
                  ? "bg-[#C4A265]/15 text-[#8B6914] font-medium"
                  : "text-[#6B5C4D] hover:text-[#2C1810]"
              }`}
            >
              {t(`zen.detail.${s}`)}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Koan Card ──────────────────────────────────────────────────────────────
function KoanCard({
  koan,
  index,
  t,
}: {
  koan: { title: string; content: string; source?: string };
  index: number;
  t: (k: string) => string;
}) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="border border-[#D4C5A0]/40 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#F5F0E8] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-[#C4A265]/15 text-[#8B6914] text-xs flex items-center justify-center font-medium">
            {index + 1}
          </span>
          <h3 className="font-serif font-medium text-[#2C1810]">{koan.title}</h3>
        </div>
        <span className="text-[#C4A265] text-sm">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[#D4C5A0]/20">
          <blockquote className="mt-3 pl-4 border-l-2 border-[#C4A265]/40 text-[#2C1810] text-sm leading-relaxed whitespace-pre-wrap font-serif italic">
            {koan.content}
          </blockquote>
          {koan.source && (
            <p className="mt-2 text-xs text-[#8B6914]">
              {t("zen.detail.koanSource")}: {koan.source}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Detail Component ──────────────────────────────────────────────────
export default function ZenPatriarchDetailClient({
  patriarch: p,
}: {
  patriarch: Patriarch;
}) {
  const { t } = useTranslation();
  const [activeSection] = useState("overview");

  const koans = (p.koans ?? []) as { title: string; content: string; source?: string }[];
  const temples = (p.templeNames ?? []) as { name: string; nameEn?: string; role?: string; location?: string }[];
  const quotes = (p.classicQuotes ?? []) as string[];
  const works = (p.works ?? []) as { title: string; description?: string }[];
  const disciples = p.disciples ?? [];

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-24">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2C1810] via-[#3D2B1F]/90 to-[#F5F0E8]" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-[#C4A265]/5 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#D4C5A0] mb-6">
            <Link href="/" className="hover:text-[#C4A265]">{t("nav.home")}</Link>
            <span>/</span>
            <Link href="/zen-patriarchs" className="hover:text-[#C4A265]">{t("zen.title")}</Link>
            <span>/</span>
            <span className="text-[#C4A265]">{p.name}</span>
          </nav>

          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#C4A265]/30 to-[#8B6914]/10 border-3 border-[#C4A265]/40 flex items-center justify-center text-5xl">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <InkAvatar name={p.name} size={128} />
              )}
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#F5F0E8] tracking-wide">
                {p.name}
              </h1>
              {p.nameEn && (
                <p className="text-[#D4C5A0] text-sm mt-1">{p.nameEn}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {p.generation && (
                  <span className="text-xs px-3 py-1 rounded-full bg-[#C4A265]/20 text-[#C4A265] border border-[#C4A265]/30">
                    {t("zen.card.generation").replace("{n}", String(p.generation))}
                  </span>
                )}
                {p.title && (
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-[#D4C5A0] border border-white/20">
                    {p.title}
                  </span>
                )}
                {p.dates && (
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-[#D4C5A0] border border-white/20">
                    {p.dates}
                  </span>
                )}
                {p.school && (
                  <span className="text-xs px-3 py-1 rounded-full bg-[#C4A265]/20 text-[#C4A265] border border-[#C4A265]/30">
                    {p.school}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section Nav ───────────────────────────────────────────────── */}
      <SectionNav activeSection={activeSection} t={t} />

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main Content ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview / Core Teaching */}
            <section id="overview" className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6">
              <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-3">
                {t("zen.detail.overview")}
              </h2>
              <blockquote className="pl-4 border-l-3 border-[#C4A265] bg-[#C4A265]/5 rounded-r-lg p-4 text-[#2C1810] font-serif italic">
                {p.coreTeaching}
              </blockquote>
            </section>

            {/* Biography */}
            <section id="biography" className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6">
              <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-3">
                {t("zen.detail.biography")}
              </h2>
              <div className="text-[#3D2B1F] text-sm leading-relaxed whitespace-pre-wrap">
                {p.biography}
              </div>
            </section>

            {/* Koans */}
            {koans.length > 0 && (
              <section id="koans" className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6">
                <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-4">
                  {t("zen.detail.koans")}
                  <span className="text-sm text-[#8B6914] font-normal ml-2">({koans.length})</span>
                </h2>
                <div className="space-y-3">
                  {koans.map((k, i) => (
                    <KoanCard key={i} koan={k} index={i} t={t} />
                  ))}
                </div>
              </section>
            )}

            {/* Achievements */}
            {p.achievements && (
              <section id="achievements" className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6">
                <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-3">
                  {t("zen.detail.achievements")}
                </h2>
                <div className="text-[#3D2B1F] text-sm leading-relaxed whitespace-pre-wrap">
                  {p.achievements}
                </div>
              </section>
            )}

            {/* Temples */}
            {temples.length > 0 && (
              <section id="temples" className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6">
                <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-4">
                  {t("zen.detail.temples")}
                </h2>
                <div className="space-y-3">
                  {temples.map((temple) => (
                    <div
                      key={temple.name}
                      className="flex items-start gap-3 p-4 rounded-lg bg-[#F5F0E8] border border-[#D4C5A0]/30"
                    >
                      <span className="text-2xl">🏛</span>
                      <div>
                        <h3 className="font-serif font-bold text-[#2C1810]">{temple.name}</h3>
                        {temple.nameEn && (
                          <p className="text-xs text-[#6B5C4D]">{temple.nameEn}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {temple.location && (
                            <span className="text-xs px-2 py-0.5 rounded bg-[#C4A265]/10 text-[#8B6914]">
                              📍 {temple.location}
                            </span>
                          )}
                          {temple.role && (
                            <span className="text-xs px-2 py-0.5 rounded bg-[#2C1810]/5 text-[#6B5C4D]">
                              {temple.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Classic Quotes */}
            {quotes.length > 0 && (
              <section id="quotes" className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6">
                <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-4">
                  {t("zen.detail.quotes")}
                </h2>
                <div className="space-y-3">
                  {quotes.map((q, i) => (
                    <blockquote
                      key={i}
                      className="pl-4 border-l-2 border-[#C4A265]/40 py-2 text-[#2C1810] font-serif italic text-sm"
                    >
                      「{q}」
                    </blockquote>
                  ))}
                </div>
              </section>
            )}

            {/* Works */}
            {works.length > 0 && (
              <section id="works" className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6">
                <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-4">
                  {t("zen.detail.works")}
                </h2>
                <div className="space-y-3">
                  {works.map((w) => (
                    <div
                      key={w.title}
                      className="p-4 rounded-lg bg-[#F5F0E8] border border-[#D4C5A0]/30"
                    >
                      <h3 className="font-serif font-bold text-[#2C1810]">📖 {w.title}</h3>
                      {w.description && (
                        <p className="text-sm text-[#6B5C4D] mt-1">{w.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Lineage */}
            <section id="lineage" className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6">
              <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-4">
                {t("zen.detail.lineage")}
              </h2>
              <div className="flex flex-col items-center gap-3">
                {/* Teacher */}
                {p.teacher && (
                  <>
                    <Link
                      href={`/zen-patriarchs/${p.teacher.id}`}
                      className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#F5F0E8] border border-[#D4C5A0]/30 hover:border-[#C4A265]/60 transition-colors w-full max-w-sm"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center"><InkAvatar name={p.teacher.name} size={40} /></div>
                      <div>
                        <p className="text-xs text-[#8B6914]">{t("zen.detail.teacher")}</p>
                        <p className="font-serif font-bold text-[#2C1810]">{p.teacher.name}</p>
                      </div>
                    </Link>
                    <div className="w-px h-6 bg-[#C4A265]/40" />
                    <span className="text-xs text-[#8B6914]">▼</span>
                  </>
                )}

                {/* Current */}
                <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-[#C4A265]/10 border-2 border-[#C4A265]/40 w-full max-w-sm">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-[#C4A265]/40">
                    <InkAvatar name={p.name} size={48} />
                  </div>
                  <div>
                    <p className="text-xs text-[#8B6914] font-medium">{p.school} · {t("zen.card.generation").replace("{n}", String(p.generation ?? "?"))}</p>
                    <p className="font-serif font-bold text-[#2C1810] text-lg">{p.name}</p>
                  </div>
                </div>

                {/* Disciples */}
                {disciples.length > 0 && (
                  <>
                    <span className="text-xs text-[#8B6914]">▼</span>
                    <div className="w-px h-4 bg-[#C4A265]/40" />
                    <div className="w-full max-w-md space-y-2">
                      <p className="text-xs text-[#8B6914] text-center">
                        {t("zen.detail.disciples")} ({disciples.length})
                      </p>
                      {disciples.map((d) => (
                        <Link
                          key={d.id}
                          href={`/zen-patriarchs/${d.id}`}
                          className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#F5F0E8] border border-[#D4C5A0]/30 hover:border-[#C4A265]/60 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center"><InkAvatar name={d.name} size={32} /></div>
                          <div className="min-w-0">
                            <p className="font-serif font-medium text-[#2C1810] text-sm">{d.name}</p>
                            {d.generation && (
                              <p className="text-xs text-[#8B6914]">
                                {t("zen.card.generation").replace("{n}", String(d.generation))}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Quick Info */}
            <div className="bg-white rounded-xl border border-[#D4C5A0]/40 p-5 sticky top-14">
              <h3 className="font-serif font-bold text-[#2C1810] mb-4">
                {t("zen.detail.quickInfo")}
              </h3>
              <div className="space-y-3 text-sm">
                {p.title && (
                  <div>
                    <span className="text-[#8B6914] text-xs">{t("zen.detail.titleLabel")}</span>
                    <p className="text-[#2C1810] font-medium">{p.title}</p>
                  </div>
                )}
                {p.dates && (
                  <div>
                    <span className="text-[#8B6914] text-xs">{t("zen.detail.dates")}</span>
                    <p className="text-[#2C1810] font-medium">{p.dates}</p>
                  </div>
                )}
                {p.school && (
                  <div>
                    <span className="text-[#8B6914] text-xs">{t("zen.detail.school")}</span>
                    <p className="text-[#2C1810] font-medium">{p.school}</p>
                  </div>
                )}
                {p.generation && (
                  <div>
                    <span className="text-[#8B6914] text-xs">{t("zen.detail.generationLabel")}</span>
                    <p className="text-[#2C1810] font-medium">
                      {t("zen.card.generation").replace("{n}", String(p.generation))}
                    </p>
                  </div>
                )}
                {p.teacher && (
                  <div>
                    <span className="text-[#8B6914] text-xs">{t("zen.detail.teacher")}</span>
                    <Link href={`/zen-patriarchs/${p.teacher.id}`} className="text-[#8B6914] font-medium hover:underline block">
                      {p.teacher.name}
                    </Link>
                  </div>
                )}
                {disciples.length > 0 && (
                  <div>
                    <span className="text-[#8B6914] text-xs">{t("zen.detail.disciples")}</span>
                    <p className="text-[#2C1810] font-medium">{disciples.length}{t("zen.detail.discipleUnit")}</p>
                  </div>
                )}
                {temples.length > 0 && (
                  <div>
                    <span className="text-[#8B6914] text-xs">{t("zen.detail.mainTemple")}</span>
                    <p className="text-[#2C1810] font-medium">{temples[0].name}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-2">
                <Link
                  href={`/chat?q=${encodeURIComponent(`请介绍禅宗祖师${p.name}的生平和教义`)}`}
                  className="block w-full py-2.5 text-center bg-[#C4A265] hover:bg-[#B39255] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  ✨ {t("zen.detail.aiChat")}
                </Link>
                <Link
                  href="/zen-patriarchs"
                  className="block w-full py-2.5 text-center bg-[#F5F0E8] hover:bg-[#E8E0D0] text-[#2C1810] rounded-lg text-sm font-medium transition-colors border border-[#D4C5A0]/40"
                >
                  ← {t("zen.detail.backToList")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Bar ─────────────────────────────────────────── */}
      <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-[#D4C5A0]/40 p-3 flex items-center justify-between lg:hidden z-30">
        <div>
          <p className="font-serif font-bold text-[#2C1810] text-sm">{p.name}</p>
          <p className="text-xs text-[#8B6914]">{p.school} · {p.title}</p>
        </div>
        <Link
          href={`/chat?q=${encodeURIComponent(`介绍${p.name}`)}`}
          className="px-4 py-2 bg-[#C4A265] text-white rounded-lg text-sm font-medium"
        >
          AI{t("zen.detail.aiChat")}
        </Link>
      </div>

      <MobileNav />
    </div>
  );
}
