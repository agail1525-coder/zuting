"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Religion, Patriarch } from "@/lib/api";
import InkAvatar from "@/app/zen-patriarchs/InkAvatar";

// ── Indigenous Schools Data ──────────────────────────────────────────────
const INDIGENOUS_SCHOOLS = [
  { key: "australian", name: "澳洲原住民", nameEn: "Australian Aboriginal", founder: "梦时代祖先", status: "foundational", sacredSite: "乌鲁鲁 · 卡卡杜 · 金伯利", method: "梦时代 · 土地连接 · 仪式传唱" },
  { key: "northamerican", name: "北美原住民", nameEn: "Native American", founder: "伟大精神导师", status: "foundational", sacredSite: "布莱克山 · 斯通黑德 · 梅萨维德", method: "图腾崇拜 · 神圣烟草 · 汗屋仪式" },
  { key: "latinamerican", name: "中南美传统", nameEn: "Latin American Traditions", founder: "基切玛雅先知", status: "historical", sacredSite: "马丘比丘 · 奇琴伊察 · 特奥蒂瓦坎", method: "玛雅历法 · 印加宇宙观 · 萨满医疗" },
  { key: "african", name: "非洲传统", nameEn: "African Traditional", founder: "祖先灵魂守护者", status: "active", sacredSite: "神圣丛林 · 约鲁巴圣城 · 科马圣地", method: "祖先崇拜 · 奥里萨仪式 · 扶乩通灵" },
  { key: "shamanic", name: "萨满传统", nameEn: "Shamanic Traditions", founder: "西伯利亚萨满祖先", status: "active", sacredSite: "贝加尔湖 · 阿尔泰山 · 蒙古草原", method: "灵魂之旅 · 鼓击冥想 · 植物智慧" },
];

const schoolNameMap: Record<string, string> = {
  australian: "澳洲原住民",
  northamerican: "北美原住民",
  latinamerican: "中南美传统",
  african: "非洲传统",
  shamanic: "萨满传统",
};

function IndigenousCard({ p, t }: { p: Patriarch; t: (k: string) => string }) {
  return (
    <Link
      href={`/indigenous-spirits/${p.id}`}
      className="block rounded-xl bg-white border border-[#78716C]/20 p-5 hover:shadow-lg hover:border-[#78716C]/50 transition-all group"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#78716C]/20 to-[#57534E]/10 border-2 border-[#78716C]/30 flex items-center justify-center text-2xl flex-shrink-0">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <InkAvatar name={p.name} size={56} />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-bold text-[#1C1917] group-hover:text-[#78716C] transition-colors">
              {p.name}
            </h3>
            {p.generation && (
              <span className="px-2 py-0.5 bg-[#78716C]/10 text-[#78716C] text-xs rounded-full font-medium">
                第{p.generation}代
              </span>
            )}
          </div>
          {p.nameEn && <p className="text-xs text-[#44403C] mt-0.5">{p.nameEn}</p>}
        </div>
      </div>
      {p.dates && <p className="text-xs text-[#57534E] mb-2">📅 {p.dates}</p>}
      {p.title && <p className="text-sm text-[#78716C] font-medium mb-2">◉ {p.title}</p>}
      {p.coreTeaching && <p className="text-xs text-[#44403C] line-clamp-2 mb-3">{p.coreTeaching.slice(0, 100)}...</p>}
      {Array.isArray(p.templeNames) && p.templeNames.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(p.templeNames as { name: string }[]).slice(0, 2).map((tm, i) => (
            <span key={i} className="px-2 py-0.5 bg-[#78716C]/5 text-[#78716C] text-xs rounded border border-[#78716C]/20">🌿 {tm.name}</span>
          ))}
        </div>
      )}
      {Array.isArray(p.classicQuotes) && p.classicQuotes.length > 0 && (
        <p className="text-xs text-[#44403C] italic border-l-2 border-[#78716C]/30 pl-2 line-clamp-1">&ldquo;{(p.classicQuotes as string[])[0]}&rdquo;</p>
      )}
      <div className="mt-3 text-xs text-[#78716C] font-medium group-hover:underline">{t("patriarch.viewDetail") || "查看详情"} →</div>
    </Link>
  );
}

export default function IndigenousSpiritsClient({
  patriarchs, religions,
}: { patriarchs: Patriarch[]; religions: Religion[] }) {
  const { t } = useTranslation();
  const [activeSchool, setActiveSchool] = useState("australian");
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
    <main className="min-h-screen bg-[#F5F5F4]">
      <MobileNav />
      <section className="relative bg-gradient-to-b from-[#1C1917] via-[#292524] to-[#F5F5F4] pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-5xl block mb-3">◉</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">原住民灵性传承</h1>
          <p className="text-[#D6D3D1] text-sm mb-6">大地母亲的声音，祖先智慧的传承与回归</p>
          <Link href="/indigenous-spirits/atlas" className="inline-flex items-center gap-3 px-6 py-3 mt-2 mb-4 rounded-2xl text-base font-bold transition-all duration-300 group bg-gradient-to-r from-[#78716C] via-[#A8A29E] to-[#78716C] text-[#2C1810] hover:from-[#A8A29E] hover:via-[#D6D3D1] hover:to-[#A8A29E] shadow-lg shadow-[#78716C]/20 hover:shadow-[#78716C]/40">
            <span className="text-xl">🗺</span>
            <span><span className="block text-left">原住民灵性大图谱</span><span className="block text-xs font-normal opacity-70 text-left">全球法脉地图 · 追寻先贤足迹</span></span>
            <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <div className="flex justify-center gap-8 text-white/90 text-sm">
            <div className="text-center"><div className="text-2xl font-bold">{totalPatriarchs}</div><div className="text-xs text-[#D6D3D1]">灵性先知</div></div>
            <div className="text-center"><div className="text-2xl font-bold">5</div><div className="text-xs text-[#D6D3D1]">传承传统</div></div>
            <div className="text-center"><div className="text-2xl font-bold">40000+</div><div className="text-xs text-[#D6D3D1]">传承年载</div></div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl border border-[#78716C]/20 p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#44403C] mb-3">五大传承传统</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {INDIGENOUS_SCHOOLS.map((s) => (
              <button key={s.key} onClick={() => setActiveSchool(s.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeSchool === s.key ? "bg-[#78716C]/15 border-[#78716C] text-[#57534E]" : "bg-[#F5F5F4] border-[#D6D3D1]/30 text-[#44403C] hover:border-[#78716C]/50"}`}>
                <span className="block">{s.name}</span>
                <span className="block text-xs opacity-70 mt-0.5">{s.status === "active" ? "当代传承" : s.status === "foundational" ? "古老传承" : "历史传承"}</span>
              </button>
            ))}
          </div>
          {(() => {
            const school = INDIGENOUS_SCHOOLS.find((s) => s.key === activeSchool);
            return (
              <div className="mt-4 p-4 bg-[#78716C]/5 rounded-lg border border-[#78716C]/20">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-lg">◉</span>
                  <div><span className="font-medium text-[#1C1917]">{school?.name} ({school?.nameEn})</span><span className="text-[#44403C] ml-2">{school?.method}</span></div>
                </div>
                <p className="text-xs text-[#78716C] mt-2 ml-8">代表: {school?.founder} · 圣地: {school?.sacredSite}</p>
              </div>
            );
          })()}
        </div>

        <div className="mb-6">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索原住民灵性先知..."
            className="w-full px-4 py-3 rounded-xl border border-[#D6D3D1]/40 bg-white text-sm placeholder:text-[#A8A29E] focus:border-[#78716C] focus:ring-1 focus:ring-[#78716C]/30 outline-none" />
          <p className="text-xs text-[#44403C] mt-2">找到 {filtered.length} 位灵性先知</p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">◉</span>
            <h3 className="text-lg font-serif font-bold text-[#1C1917] mb-1">暂无先知记录</h3>
            <p className="text-sm text-[#44403C]">该传统的灵性先知资料正在整理中</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filtered.sort((a, b) => (a.generation ?? 99) - (b.generation ?? 99)).map((p) => (<IndigenousCard key={p.id} p={p} t={t} />))}
          </div>
        )}

        <div className="bg-gradient-to-r from-[#1C1917] to-[#292524] rounded-2xl p-8 text-center mb-12">
          <h3 className="text-xl font-serif font-bold text-white mb-2">探索原住民圣地文化之旅</h3>
          <p className="text-[#D6D3D1] text-sm mb-5">聆听大地的呼唤，感受远古智慧的力量</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/chat" className="px-6 py-3 bg-[#78716C] hover:bg-[#57534E] text-white font-semibold rounded-xl transition-colors text-sm">咨询小鸿AI</Link>
            <Link href="/patriarchs" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20 text-sm">浏览所有先贤</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
