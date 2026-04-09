"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Patriarch } from "@/lib/api";
import InkAvatar from "@/app/zen-patriarchs/InkAvatar";

const SECTIONS = ["overview", "biography", "teachings", "achievements", "monasteries", "quotes", "works", "lineage"] as const;

const SECTION_LABELS: Record<string, string> = {
  overview: "概览",
  biography: "生平",
  teachings: "教义",
  achievements: "成就",
  monasteries: "寺院",
  quotes: "语录",
  works: "著作",
  lineage: "传承",
};

function SectionNav({ activeSection }: { activeSection: string }) {
  return (
    <nav className="flex gap-1 overflow-x-auto pb-2 mb-6 border-b border-[#7C3AED]/20 scrollbar-hide">
      {SECTIONS.map((s) => (
        <a key={s} href={`#${s}`} className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${activeSection === s ? "bg-[#7C3AED]/15 text-[#6D28D9] font-medium" : "text-[#4C1D95] hover:text-[#7C3AED]"}`}>
          {SECTION_LABELS[s]}
        </a>
      ))}
    </nav>
  );
}

function TeachingCard({ teaching }: { teaching: { title: string; content: string; source?: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-[#7C3AED]/20 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 bg-[#F5F3FF] hover:bg-[#7C3AED]/10 transition-colors text-left">
        <span className="font-serif font-medium text-[#2E1065]">{teaching.title}</span>
        <span className="text-[#7C3AED] text-sm">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="p-4 border-t border-[#7C3AED]/20">
          <p className="text-[#2E1065] font-serif italic leading-relaxed">{teaching.content}</p>
          {teaching.source && <p className="text-xs text-[#7C3AED] mt-3">出处: {teaching.source}</p>}
        </div>
      )}
    </div>
  );
}

export default function TibetanPatriarchDetailClient({ patriarch: p }: { patriarch: Patriarch }) {
  const { t } = useTranslation();
  void t;
  const [activeSection] = useState("overview");

  const koans = (p.koans ?? []) as { title: string; content: string; source?: string }[];
  const temples = (p.templeNames ?? []) as { name: string; nameEn?: string; role?: string; location?: string }[];
  const quotes = (p.classicQuotes ?? []) as string[];
  const works = (p.works ?? []) as { title: string; description?: string }[];
  const disciples = (p.disciples ?? []) as { id: string; name: string; generation?: number | null }[];

  return (
    <main className="min-h-screen bg-[#F5F3FF]">
      <MobileNav />
      <section className="bg-gradient-to-b from-[#2E1065] via-[#4C1D95] to-[#F5F3FF] pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/tibetan-patriarchs" className="text-[#C4B5FD] text-sm hover:underline mb-4 inline-block">← 返回藏传佛教文化大师</Link>
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#7C3AED]/30 to-[#6D28D9]/20 border-3 border-[#7C3AED]/40 flex items-center justify-center mb-4">
            {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" /> : <InkAvatar name={p.name} size={96} />}
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-1">{p.name}</h1>
          {p.nameEn && <p className="text-[#C4B5FD] text-sm mb-2">{p.nameEn}</p>}
          {p.title && <p className="text-[#A78BFA] text-sm font-medium">☸ {p.title}</p>}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl border border-[#7C3AED]/20 shadow-sm p-6 mb-6">
          <SectionNav activeSection={activeSection} />

          <div id="overview" className="grid grid-cols-2 gap-3 mb-8 p-4 bg-[#7C3AED]/5 rounded-lg">
            {p.dates && <div><span className="text-xs text-[#4C1D95]">生卒年份</span><p className="text-sm font-medium text-[#2E1065]">{p.dates}</p></div>}
            {p.school && <div><span className="text-xs text-[#4C1D95]">所属教派</span><p className="text-sm font-medium text-[#2E1065]">{p.school}</p></div>}
            {p.generation && <div><span className="text-xs text-[#4C1D95]">传承代数</span><p className="text-sm font-medium text-[#2E1065]">第{p.generation}代</p></div>}
            {p.teacher && <div><span className="text-xs text-[#4C1D95]">根本上师</span><Link href={`/tibetan-patriarchs/${p.teacher.id}`} className="text-sm font-medium text-[#7C3AED] hover:underline block">{p.teacher.name}</Link></div>}
          </div>

          {p.coreTeaching && (
            <div className="mb-8">
              <h2 className="text-lg font-serif font-bold text-[#2E1065] mb-3 flex items-center gap-2"><span className="text-[#7C3AED]">☸</span> 核心教义概述</h2>
              <p className="text-[#2E1065] leading-relaxed text-sm whitespace-pre-line">{p.coreTeaching}</p>
            </div>
          )}

          {p.biography && (
            <div id="biography" className="mb-8">
              <h2 className="text-lg font-serif font-bold text-[#2E1065] mb-3">生平传记</h2>
              <p className="text-[#2E1065] leading-relaxed text-sm whitespace-pre-line">{p.biography}</p>
            </div>
          )}

          {koans.length > 0 && (
            <div id="teachings" className="mb-8">
              <h2 className="text-lg font-serif font-bold text-[#2E1065] mb-3">核心教义</h2>
              <div className="space-y-3">
                {koans.map((k, i) => <TeachingCard key={i} teaching={{ title: k.title, content: (k as { title: string; content?: string; description?: string }).content || (k as { description?: string }).description || '', source: k.source }} />)}
              </div>
            </div>
          )}

          {p.achievements && (
            <div id="achievements" className="mb-8">
              <h2 className="text-lg font-serif font-bold text-[#2E1065] mb-3">主要成就</h2>
              <p className="text-[#2E1065] leading-relaxed text-sm whitespace-pre-line">{p.achievements}</p>
            </div>
          )}

          {temples.length > 0 && (
            <div id="monasteries" className="mb-8">
              <h2 className="text-lg font-serif font-bold text-[#2E1065] mb-3">相关寺院</h2>
              <div className="grid gap-3">
                {temples.map((tm, i) => (
                  <div key={i} className="p-3 bg-[#7C3AED]/5 rounded-lg border border-[#7C3AED]/15">
                    <div className="flex items-center gap-2"><span>🏔</span><span className="font-medium text-[#2E1065] text-sm">{tm.name}</span>{tm.nameEn && <span className="text-xs text-[#4C1D95]">({tm.nameEn})</span>}</div>
                    {tm.role && <p className="text-xs text-[#7C3AED] mt-1 ml-6">{tm.role}</p>}
                    {tm.location && <p className="text-xs text-[#4C1D95] mt-0.5 ml-6">📍 {tm.location}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {quotes.length > 0 && (
            <div id="quotes" className="mb-8">
              <h2 className="text-lg font-serif font-bold text-[#2E1065] mb-3">经典语录</h2>
              <div className="space-y-3">
                {quotes.map((q, i) => <blockquote key={i} className="border-l-3 border-[#7C3AED]/40 pl-4 py-2"><p className="text-[#2E1065] font-serif italic text-sm">&ldquo;{q}&rdquo;</p></blockquote>)}
              </div>
            </div>
          )}

          {works.length > 0 && (
            <div id="works" className="mb-8">
              <h2 className="text-lg font-serif font-bold text-[#2E1065] mb-3">主要著作</h2>
              <div className="space-y-3">
                {works.map((w, i) => <div key={i} className="p-3 bg-[#F5F3FF] rounded-lg"><span className="font-medium text-[#2E1065] text-sm">📖 {w.title}</span>{w.description && <p className="text-xs text-[#4C1D95] mt-1">{w.description}</p>}</div>)}
              </div>
            </div>
          )}

          <div id="lineage" className="mb-4">
            <h2 className="text-lg font-serif font-bold text-[#2E1065] mb-3">传承脉络</h2>
            <div className="space-y-2">
              {p.teacher && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#4C1D95]">根本上师:</span>
                  <Link href={`/tibetan-patriarchs/${p.teacher.id}`} className="text-[#7C3AED] hover:underline font-medium">{p.teacher.name}</Link>
                </div>
              )}
              {disciples.length > 0 && (
                <div>
                  <span className="text-sm text-[#4C1D95]">传承弟子 ({disciples.length}):</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {disciples.map((d) => <Link key={d.id} href={`/tibetan-patriarchs/${d.id}`} className="px-2 py-1 bg-[#7C3AED]/10 text-[#7C3AED] text-xs rounded hover:bg-[#7C3AED]/20 transition-colors">{d.name}</Link>)}
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
