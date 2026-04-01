"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Religion, Patriarch } from "@/lib/api";
import InkAvatar from "@/app/zen-patriarchs/InkAvatar";

// ── Hindu Schools Data ──────────────────────────────────────────────
const HINDU_SCHOOLS = [
  { key: "vedanta", name: "吠檀多哲学", nameEn: "Vedanta Philosophy", founder: "商羯罗 (788-820)", status: "foundational", temple: "斯林格里·沙拉达·皮塔姆 · 德瓦尔卡", method: "不二论 · 梵我一如 · 幻相说" },
  { key: "yoga", name: "瑜伽修行", nameEn: "Yoga Practice", founder: "帕坦伽利 (约前200)", status: "foundational", temple: "瑞诗凯诗 · 迈索尔 · 哈里德瓦尔", method: "八支瑜伽 · 三摩地 · 调息" },
  { key: "bhakti", name: "虔信运动", nameEn: "Bhakti Movement", founder: "罗摩努阇 (1017-1137)", status: "active", temple: "布林达班 · 马杜赖 · 普里", method: "虔爱奉献 · 神圣之爱 · 诗歌颂神" },
  { key: "darshana", name: "经典六派", nameEn: "Six Darshanas", founder: "迦毗罗 (约前600)", status: "historical", temple: "瓦拉纳西 · 那烂陀 · 普纳", method: "数论 · 胜论 · 正理 · 弥曼差 · 瑜伽 · 吠檀多" },
  { key: "modern", name: "近现代复兴", nameEn: "Modern Revival", founder: "辨喜 (1863-1902)", status: "active", temple: "贝鲁尔修道院 · 达克西内斯瓦尔 · 班加罗尔", method: "实践吠檀多 · 服务即礼拜 · 宗教和谐" },
];

const schoolNameMap: Record<string, string> = {
  vedanta: "吠檀多哲学",
  yoga: "瑜伽修行",
  bhakti: "虔信运动",
  darshana: "经典六派",
  modern: "近现代复兴",
};

function HinduCard({ p, t }: { p: Patriarch; t: (k: string) => string }) {
  return (
    <Link
      href={`/hindu-sages/${p.id}`}
      className="block rounded-xl bg-white border border-[#F97316]/20 p-5 hover:shadow-lg hover:border-[#F97316]/50 transition-all group"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F97316]/20 to-[#EA580C]/10 border-2 border-[#F97316]/30 flex items-center justify-center text-2xl flex-shrink-0">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <InkAvatar name={p.name} size={56} />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-bold text-[#1C0A00] group-hover:text-[#F97316] transition-colors">
              {p.name}
            </h3>
            {p.generation && (
              <span className="px-2 py-0.5 bg-[#F97316]/10 text-[#F97316] text-xs rounded-full font-medium">
                第{p.generation}代
              </span>
            )}
          </div>
          {p.nameEn && <p className="text-xs text-[#78350F] mt-0.5">{p.nameEn}</p>}
        </div>
      </div>
      {p.dates && <p className="text-xs text-[#92400E] mb-2">📅 {p.dates}</p>}
      {p.title && <p className="text-sm text-[#F97316] font-medium mb-2">🕉 {p.title}</p>}
      {p.coreTeaching && <p className="text-xs text-[#78350F] line-clamp-2 mb-3">{p.coreTeaching.slice(0, 100)}...</p>}
      {Array.isArray(p.templeNames) && p.templeNames.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(p.templeNames as { name: string }[]).slice(0, 2).map((tm, i) => (
            <span key={i} className="px-2 py-0.5 bg-[#F97316]/5 text-[#F97316] text-xs rounded border border-[#F97316]/20">🏛️ {tm.name}</span>
          ))}
        </div>
      )}
      {Array.isArray(p.classicQuotes) && p.classicQuotes.length > 0 && (
        <p className="text-xs text-[#78350F] italic border-l-2 border-[#F97316]/30 pl-2 line-clamp-1">&ldquo;{(p.classicQuotes as string[])[0]}&rdquo;</p>
      )}
      <div className="mt-3 text-xs text-[#F97316] font-medium group-hover:underline">{t("patriarch.viewDetail") || "查看详情"} →</div>
    </Link>
  );
}

export default function HinduSagesClient({
  patriarchs, religions,
}: { patriarchs: Patriarch[]; religions: Religion[] }) {
  const { t } = useTranslation();
  const [activeSchool, setActiveSchool] = useState("vedanta");
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
    <main className="min-h-screen bg-[#FFF7ED]">
      <MobileNav />
      <section className="relative bg-gradient-to-b from-[#9A3412] via-[#C2410C] to-[#FFF7ED] pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-5xl block mb-3">🕉</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">印度教圣贤传承</h1>
          <p className="text-[#FDBA74] text-sm mb-6">从吠陀先知到近现代复兴大师的千年智慧传承</p>
          <div className="flex justify-center gap-8 text-white/90 text-sm">
            <div className="text-center"><div className="text-2xl font-bold">{totalPatriarchs}</div><div className="text-xs text-[#FDBA74]">圣贤先知</div></div>
            <div className="text-center"><div className="text-2xl font-bold">5</div><div className="text-xs text-[#FDBA74]">传承学派</div></div>
            <div className="text-center"><div className="text-2xl font-bold">5000+</div><div className="text-xs text-[#FDBA74]">传承年载</div></div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl border border-[#F97316]/20 p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#78350F] mb-3">五大传承学派</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {HINDU_SCHOOLS.map((s) => (
              <button key={s.key} onClick={() => setActiveSchool(s.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeSchool === s.key ? "bg-[#F97316]/15 border-[#F97316] text-[#EA580C]" : "bg-[#FFF7ED] border-[#FED7AA]/30 text-[#78350F] hover:border-[#F97316]/50"}`}>
                <span className="block">{s.name}</span>
                <span className="block text-xs opacity-70 mt-0.5">{s.status === "active" ? "当代传承" : s.status === "foundational" ? "奠基传承" : "历史传承"}</span>
              </button>
            ))}
          </div>
          {(() => {
            const school = HINDU_SCHOOLS.find((s) => s.key === activeSchool);
            return (
              <div className="mt-4 p-4 bg-[#F97316]/5 rounded-lg border border-[#F97316]/20">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-lg">🕉</span>
                  <div><span className="font-medium text-[#1C0A00]">{school?.name} ({school?.nameEn})</span><span className="text-[#78350F] ml-2">{school?.method}</span></div>
                </div>
                <p className="text-xs text-[#F97316] mt-2 ml-8">创始: {school?.founder} · 主要圣地: {school?.temple}</p>
              </div>
            );
          })()}
        </div>

        <div className="mb-6">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索印度教圣贤..."
            className="w-full px-4 py-3 rounded-xl border border-[#FED7AA]/40 bg-white text-sm placeholder:text-[#A0887A] focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 outline-none" />
          <p className="text-xs text-[#78350F] mt-2">找到 {filtered.length} 位圣贤</p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🕉</span>
            <h3 className="text-lg font-serif font-bold text-[#1C0A00] mb-1">暂无圣贤记录</h3>
            <p className="text-sm text-[#78350F]">该学派的圣贤资料正在整理中</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filtered.sort((a, b) => (a.generation ?? 99) - (b.generation ?? 99)).map((p) => (<HinduCard key={p.id} p={p} t={t} />))}
          </div>
        )}

        <div className="bg-gradient-to-r from-[#9A3412] to-[#C2410C] rounded-2xl p-8 text-center mb-12">
          <h3 className="text-xl font-serif font-bold text-white mb-2">探索印度教圣地朝圣之旅</h3>
          <p className="text-[#FDBA74] text-sm mb-5">跟随圣贤足迹，踏上心灵朝圣之路</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/chat" className="px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold rounded-xl transition-colors text-sm">咨询小鸿AI</Link>
            <Link href="/patriarchs" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20 text-sm">浏览所有先贤</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
