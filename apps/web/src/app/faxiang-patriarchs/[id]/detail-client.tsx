"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Patriarch } from "@/lib/api";
import InkAvatar from "@/app/zen-patriarchs/InkAvatar";

const SECTIONS = ["overview", "biography", "teachings", "achievements", "temples", "quotes", "works", "lineage"] as const;

function SectionNav({ activeSection, t }: { activeSection: string; t: (k: string) => string }) {
  return (
    <nav className="flex gap-1 overflow-x-auto pb-2 mb-6 border-b border-[#D4C5A0]/30 scrollbar-hide">
      {SECTIONS.map((s) => (
        <a key={s} href={`#${s}`} className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${activeSection === s ? "bg-[#C4A265]/15 text-[#8B6914] font-medium" : "text-[#6B5C4D] hover:text-[#8B6914]"}`}>
          {t(`faxiang.detail.${s}`)}
        </a>
      ))}
    </nav>
  );
}

function TeachingCard({ teaching, t }: { teaching: { title: string; content: string; source?: string }; t: (k: string) => string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-[#D4C5A0]/40 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 bg-[#F5F0E8] hover:bg-[#C4A265]/10 transition-colors text-left">
        <span className="font-serif font-medium text-[#2C1810]">{teaching.title}</span>
        <span className="text-[#8B6914] text-sm">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="p-4 border-t border-[#D4C5A0]/30">
          <p className="text-[#2C1810] font-serif italic leading-relaxed">{teaching.content}</p>
          {teaching.source && <p className="text-xs text-[#8B6914] mt-3">{t("faxiang.detail.teachingSource")}: {teaching.source}</p>}
        </div>
      )}
    </div>
  );
}

export default function FaxiangPatriarchDetailClient({ patriarch: p }: { patriarch: Patriarch }) {
  const { t } = useTranslation();
  const [activeSection] = useState("overview");

  const koans = (p.koans ?? []) as { title: string; content: string; source?: string }[];
  const temples = (p.templeNames ?? []) as { name: string; nameEn?: string; role?: string; location?: string }[];
  const quotes = (p.classicQuotes ?? []) as string[];
  const works = (p.works ?? []) as { title: string; description?: string }[];
  const disciples = (p.disciples ?? []) as { id: string; name: string; generation?: number | null }[];

  return (
    <main className="min-h-screen bg-[#F5F0E8]">
      <div className="bg-gradient-to-b from-[#2C1810] via-[#3D2B1F] to-[#F5F0E8] pt-16 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-[#D4C5A0] mb-6">
            <Link href="/" className="hover:text-[#C4A265]">首页</Link><span>/</span>
            <Link href="/faxiang-patriarchs" className="hover:text-[#C4A265]">{t("faxiang.title")}</Link><span>/</span>
            <span className="text-[#F5F0E8]">{p.name}</span>
          </div>
          <SectionNav activeSection={activeSection} t={t} />
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#C4A265]/30 to-[#8B6914]/10 border-3 border-[#C4A265]/40 flex items-center justify-center text-5xl">
              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" /> : <InkAvatar name={p.name} size={128} />}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#F5F0E8] tracking-wide">{p.name}</h1>
              {p.nameEn && <p className="text-[#D4C5A0] text-sm mt-1">{p.nameEn}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                {p.generation && <span className="px-3 py-1 rounded-full bg-[#C4A265]/20 text-[#C4A265] text-xs border border-[#C4A265]/40">{t("faxiang.lineage.generation").replace("{n}", String(p.generation))}</span>}
                {p.title && <span className="px-3 py-1 rounded-full bg-white/10 text-[#D4C5A0] text-xs border border-white/20">{p.title}</span>}
                {p.dates && <span className="px-3 py-1 rounded-full bg-white/10 text-[#D4C5A0] text-xs border border-white/20">{p.dates}</span>}
                {p.school && <span className="px-3 py-1 rounded-full bg-[#C4A265]/20 text-[#C4A265] text-xs border border-[#C4A265]/40">{p.school}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section id="overview" className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6 shadow-sm"><h2 className="text-lg font-serif font-bold text-[#2C1810] mb-4">{t("faxiang.detail.overview")}</h2>{p.coreTeaching && <blockquote className="pl-4 border-l-3 border-[#C4A265]/40 italic text-[#2C1810] font-serif leading-relaxed">{p.coreTeaching}</blockquote>}</section>
            {p.biography && <section id="biography" className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6 shadow-sm"><h2 className="text-lg font-serif font-bold text-[#2C1810] mb-4">{t("faxiang.detail.biography")}</h2><p className="text-[#2C1810] leading-relaxed whitespace-pre-line">{p.biography}</p></section>}
            {koans.length > 0 && <section id="teachings" className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6 shadow-sm"><h2 className="text-lg font-serif font-bold text-[#2C1810] mb-4">{t("faxiang.detail.teachings")}</h2><div className="space-y-3">{koans.map((k, i) => <TeachingCard key={i} teaching={k} t={t} />)}</div></section>}
            {p.achievements && <section id="achievements" className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6 shadow-sm"><h2 className="text-lg font-serif font-bold text-[#2C1810] mb-4">{t("faxiang.detail.achievements")}</h2><p className="text-[#2C1810] leading-relaxed">{p.achievements}</p></section>}
            {temples.length > 0 && <section id="temples" className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6 shadow-sm"><h2 className="text-lg font-serif font-bold text-[#2C1810] mb-4">{t("faxiang.detail.temples")}</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{temples.map((temple) => (<div key={temple.name} className="p-4 rounded-lg bg-[#F5F0E8] border border-[#D4C5A0]/30"><h3 className="font-serif font-bold text-[#2C1810] text-sm">{temple.name}</h3>{temple.nameEn && <p className="text-xs text-[#6B5C4D]">{temple.nameEn}</p>}<div className="flex gap-2 mt-2">{temple.location && <span className="text-xs px-1.5 py-0.5 rounded bg-[#C4A265]/10 text-[#8B6914]">{temple.location}</span>}{temple.role && <span className="text-xs px-1.5 py-0.5 rounded bg-[#2C1810]/5 text-[#6B5C4D]">{temple.role}</span>}</div></div>))}</div></section>}
            {quotes.length > 0 && <section id="quotes" className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6 shadow-sm"><h2 className="text-lg font-serif font-bold text-[#2C1810] mb-4">{t("faxiang.detail.quotes")}</h2><div className="space-y-3">{quotes.map((q, i) => <blockquote key={i} className="pl-4 py-2 border-l-2 border-[#C4A265]/30 text-[#2C1810] font-serif italic">「{q}」</blockquote>)}</div></section>}
            {works.length > 0 && <section id="works" className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6 shadow-sm"><h2 className="text-lg font-serif font-bold text-[#2C1810] mb-4">{t("faxiang.detail.works")}</h2><div className="space-y-3">{works.map((w) => <div key={w.title} className="p-3 rounded-lg bg-[#F5F0E8]"><h3 className="font-serif font-medium text-[#2C1810]">📖 {w.title}</h3>{w.description && <p className="text-xs text-[#6B5C4D] mt-1">{w.description}</p>}</div>)}</div></section>}
            <section id="lineage" className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6 shadow-sm">
              <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-4">{t("faxiang.detail.lineage")}</h2>
              <div className="flex flex-col items-center gap-3">
                {p.teacher && (<><Link href={`/faxiang-patriarchs/${p.teacher.id}`} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#F5F0E8] border border-[#D4C5A0]/30 hover:border-[#C4A265]/60 transition-colors w-full max-w-sm"><div className="w-10 h-10 rounded-full flex items-center justify-center"><InkAvatar name={p.teacher.name} size={40} /></div><div><p className="text-xs text-[#8B6914]">{t("faxiang.detail.teacher")}</p><p className="font-serif font-bold text-[#2C1810]">{p.teacher.name}</p></div></Link><div className="w-px h-6 bg-[#C4A265]/40" /><span className="text-xs text-[#8B6914]">▼</span></>)}
                <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-[#C4A265]/10 border-2 border-[#C4A265]/40 w-full max-w-sm"><div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-[#C4A265]/40"><InkAvatar name={p.name} size={48} /></div><div><p className="text-xs text-[#8B6914] font-medium">{p.school} · {t("faxiang.card.generation").replace("{n}", String(p.generation ?? "?"))}</p><p className="font-serif font-bold text-[#2C1810] text-lg">{p.name}</p></div></div>
                {disciples.length > 0 && (<><span className="text-xs text-[#8B6914]">▼</span><div className="w-px h-4 bg-[#C4A265]/40" /><div className="w-full max-w-md space-y-2"><p className="text-xs text-[#8B6914] text-center">{t("faxiang.detail.disciples")} ({disciples.length})</p>{disciples.map((d) => (<Link key={d.id} href={`/faxiang-patriarchs/${d.id}`} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#F5F0E8] border border-[#D4C5A0]/30 hover:border-[#C4A265]/60 transition-colors"><div className="w-8 h-8 rounded-full flex items-center justify-center"><InkAvatar name={d.name} size={32} /></div><div className="min-w-0"><p className="font-serif font-medium text-[#2C1810] text-sm">{d.name}</p>{d.generation && <p className="text-xs text-[#8B6914]">{t("faxiang.card.generation").replace("{n}", String(d.generation))}</p>}</div></Link>))}</div></>)}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <div className="bg-white rounded-xl border border-[#D4C5A0]/40 p-5 shadow-sm">
                <h3 className="font-serif font-bold text-[#2C1810] mb-3">{t("faxiang.detail.quickInfo")}</h3>
                <dl className="space-y-2 text-sm">
                  {p.title && <div className="flex justify-between"><dt className="text-[#6B5C4D]">{t("faxiang.detail.titleLabel")}</dt><dd className="text-[#2C1810] font-medium">{p.title}</dd></div>}
                  {p.dates && <div className="flex justify-between"><dt className="text-[#6B5C4D]">{t("faxiang.detail.dates")}</dt><dd className="text-[#2C1810]">{p.dates}</dd></div>}
                  {p.school && <div className="flex justify-between"><dt className="text-[#6B5C4D]">{t("faxiang.detail.school")}</dt><dd className="text-[#8B6914]">{p.school}</dd></div>}
                  {p.generation && <div className="flex justify-between"><dt className="text-[#6B5C4D]">{t("faxiang.detail.generationLabel")}</dt><dd className="text-[#8B6914]">{t("faxiang.lineage.generation").replace("{n}", String(p.generation))}</dd></div>}
                  {p.teacher && <div className="flex justify-between"><dt className="text-[#6B5C4D]">{t("faxiang.detail.teacher")}</dt><dd><Link href={`/faxiang-patriarchs/${p.teacher.id}`} className="text-[#8B6914] hover:underline">{p.teacher.name}</Link></dd></div>}
                  {disciples.length > 0 && <div className="flex justify-between"><dt className="text-[#6B5C4D]">{t("faxiang.detail.disciples")}</dt><dd className="text-[#2C1810]">{disciples.length}{t("faxiang.detail.discipleUnit")}</dd></div>}
                  {temples.length > 0 && <div className="flex justify-between"><dt className="text-[#6B5C4D]">{t("faxiang.detail.mainTemple")}</dt><dd className="text-[#2C1810] text-right">{temples[0].name}</dd></div>}
                </dl>
              </div>
              <Link href={`/chat?q=${encodeURIComponent("请介绍法相宗祖师" + p.name + "的生平教义和唯识思想")}`} className="block w-full text-center px-5 py-3 bg-[#C4A265] hover:bg-[#B39255] text-white font-medium rounded-xl transition-colors text-sm">🔮 {t("faxiang.detail.aiChat")}</Link>
              <Link href="/faxiang-patriarchs" className="block w-full text-center px-5 py-3 bg-white border border-[#D4C5A0]/40 hover:border-[#C4A265]/60 text-[#6B5C4D] hover:text-[#8B6914] font-medium rounded-xl transition-colors text-sm">← {t("faxiang.detail.backToList")}</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur border-t border-[#D4C5A0]/40 px-4 py-3 flex items-center justify-between z-40">
        <span className="font-serif font-bold text-[#2C1810] text-sm truncate">{p.name}</span>
        <Link href={`/chat?q=${encodeURIComponent("请介绍" + p.name)}`} className="px-4 py-2 bg-[#C4A265] text-white text-xs rounded-lg">🔮 {t("faxiang.detail.aiChat")}</Link>
      </div>
      <MobileNav />
    </main>
  );
}
