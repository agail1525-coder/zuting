"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Religion, Patriarch } from "@/lib/api";
import InkAvatar from "@/app/zen-patriarchs/InkAvatar";

// ── Sikh Schools Data ──────────────────────────────────────────────
const SIKH_SCHOOLS = [
  { key: "first5", name: "前五代古鲁", nameEn: "First Five Gurus", founder: "那纳克古鲁 (1469-1539)", status: "foundational", gurdwara: "黄金神庙 · 卡尔塔尔普尔 · 戈因达瓦尔", method: "凡提卡 · 一神论 · 平等服务" },
  { key: "last5", name: "后五代古鲁", nameEn: "Last Five Gurus", founder: "哈尔·戈宾德古鲁 (1595-1644)", status: "historical", gurdwara: "阿卡尔-达哈特 · 斯利赫尔戈宾德普尔", method: "米里和皮里 · 战士精神 · 圣典传承" },
  { key: "martyrs", name: "殉道英雄", nameEn: "Sikh Martyrs", founder: "阿尔琼古鲁 (1563-1606)", status: "historical", gurdwara: "胡兹尔萨希布 · 拉霍尔 · 阿南特普尔", method: "殉道精神 · 信仰坚守 · 牺牲精神" },
  { key: "scholars", name: "学者圣人", nameEn: "Scholar Saints", founder: "班达·辛格·巴哈杜尔 (1670-1716)", status: "historical", gurdwara: "帕翁塔·萨希布 · 塔克特·斯利·达姆达玛", method: "圣典诠释 · 神学研究 · 锡克文学" },
  { key: "modern", name: "近现代领袖", nameEn: "Modern Leaders", founder: "哈尔宾德·辛格 (1917-2008)", status: "active", gurdwara: "全球各地锡克教会堂 · 旁遮普 · 不列颠哥伦比亚", method: "社区服务 · 兰格尔免费厨房 · 全球传播" },
];

const schoolNameMap: Record<string, string> = {
  first5: "前五代古鲁",
  last5: "后五代古鲁",
  martyrs: "殉道英雄",
  scholars: "学者圣人",
  modern: "近现代领袖",
};

function SikhCard({ p, t }: { p: Patriarch; t: (k: string) => string }) {
  return (
    <Link
      href={`/sikh-gurus/${p.id}`}
      className="block rounded-xl bg-white border border-[#EA580C]/20 p-5 hover:shadow-lg hover:border-[#EA580C]/50 transition-all group"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#EA580C]/20 to-[#C2410C]/10 border-2 border-[#EA580C]/30 flex items-center justify-center text-2xl flex-shrink-0">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <InkAvatar name={p.name} size={56} />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-bold text-[#431407] group-hover:text-[#EA580C] transition-colors">
              {p.name}
            </h3>
            {p.generation && (
              <span className="px-2 py-0.5 bg-[#EA580C]/10 text-[#EA580C] text-xs rounded-full font-medium">
                第{p.generation}代
              </span>
            )}
          </div>
          {p.nameEn && <p className="text-xs text-[#7C2D12] mt-0.5">{p.nameEn}</p>}
        </div>
      </div>
      {p.dates && <p className="text-xs text-[#9A3412] mb-2">📅 {p.dates}</p>}
      {p.title && <p className="text-sm text-[#EA580C] font-medium mb-2">☬ {p.title}</p>}
      {p.coreTeaching && <p className="text-xs text-[#7C2D12] line-clamp-2 mb-3">{p.coreTeaching.slice(0, 100)}...</p>}
      {Array.isArray(p.templeNames) && p.templeNames.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(p.templeNames as { name: string }[]).slice(0, 2).map((tm, i) => (
            <span key={i} className="px-2 py-0.5 bg-[#EA580C]/5 text-[#EA580C] text-xs rounded border border-[#EA580C]/20">🙏 {tm.name}</span>
          ))}
        </div>
      )}
      {Array.isArray(p.classicQuotes) && p.classicQuotes.length > 0 && (
        <p className="text-xs text-[#7C2D12] italic border-l-2 border-[#EA580C]/30 pl-2 line-clamp-1">&ldquo;{(p.classicQuotes as string[])[0]}&rdquo;</p>
      )}
      <div className="mt-3 text-xs text-[#EA580C] font-medium group-hover:underline">{t("patriarch.viewDetail") || "查看详情"} →</div>
    </Link>
  );
}

export default function SikhGurusClient({
  patriarchs, religions,
}: { patriarchs: Patriarch[]; religions: Religion[] }) {
  const { t } = useTranslation();
  const [activeSchool, setActiveSchool] = useState("first5");
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
      <section className="relative bg-gradient-to-b from-[#7C2D12] via-[#9A3412] to-[#FFF7ED] pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-5xl block mb-3">☬</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">锡克教文化古鲁传承</h1>
          <p className="text-[#FDBA74] text-sm mb-6">十位古鲁的神圣传承，旁遮普精神的永恒光辉</p>
          <Link href="/sikh-gurus/atlas" className="inline-flex items-center gap-3 px-6 py-3 mt-2 mb-4 rounded-2xl text-base font-bold transition-all duration-300 group bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#EA580C] text-white hover:from-[#F97316] hover:via-[#FB923C] hover:to-[#F97316] shadow-lg shadow-[#EA580C]/20 hover:shadow-[#EA580C]/40">
            <span className="text-xl">🗺</span>
            <span><span className="block text-left">锡克教文化古鲁大图谱</span><span className="block text-xs font-normal opacity-70 text-left">全球法脉地图 · 追寻先贤足迹</span></span>
            <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <div className="flex justify-center gap-8 text-white/90 text-sm">
            <div className="text-center"><div className="text-2xl font-bold">{totalPatriarchs}</div><div className="text-xs text-[#FDBA74]">古鲁圣人</div></div>
            <div className="text-center"><div className="text-2xl font-bold">5</div><div className="text-xs text-[#FDBA74]">传承类别</div></div>
            <div className="text-center"><div className="text-2xl font-bold">550+</div><div className="text-xs text-[#FDBA74]">传承年载</div></div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl border border-[#EA580C]/20 p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#7C2D12] mb-3">五大传承类别</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {SIKH_SCHOOLS.map((s) => (
              <button key={s.key} onClick={() => setActiveSchool(s.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeSchool === s.key ? "bg-[#EA580C]/15 border-[#EA580C] text-[#C2410C]" : "bg-[#FFF7ED] border-[#FED7AA]/30 text-[#7C2D12] hover:border-[#EA580C]/50"}`}>
                <span className="block">{s.name}</span>
                <span className="block text-xs opacity-70 mt-0.5">{s.status === "active" ? "当代传承" : s.status === "foundational" ? "奠基传承" : "历史传承"}</span>
              </button>
            ))}
          </div>
          {(() => {
            const school = SIKH_SCHOOLS.find((s) => s.key === activeSchool);
            return (
              <div className="mt-4 p-4 bg-[#EA580C]/5 rounded-lg border border-[#EA580C]/20">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-lg">☬</span>
                  <div><span className="font-medium text-[#431407]">{school?.name} ({school?.nameEn})</span><span className="text-[#7C2D12] ml-2">{school?.method}</span></div>
                </div>
                <p className="text-xs text-[#EA580C] mt-2 ml-8">代表: {school?.founder} · 主要圣地: {school?.gurdwara}</p>
              </div>
            );
          })()}
        </div>

        <div className="mb-6">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索锡克教文化古鲁..."
            className="w-full px-4 py-3 rounded-xl border border-[#FED7AA]/40 bg-white text-sm placeholder:text-[#A0887A] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]/30 outline-none" />
          <p className="text-xs text-[#7C2D12] mt-2">找到 {filtered.length} 位古鲁</p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">☬</span>
            <h3 className="text-lg font-serif font-bold text-[#431407] mb-1">暂无古鲁记录</h3>
            <p className="text-sm text-[#7C2D12]">该传承的古鲁资料正在整理中</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filtered.sort((a, b) => (a.generation ?? 99) - (b.generation ?? 99)).map((p) => (<SikhCard key={p.id} p={p} t={t} />))}
          </div>
        )}

        <div className="bg-gradient-to-r from-[#7C2D12] to-[#9A3412] rounded-2xl p-8 text-center mb-12">
          <h3 className="text-xl font-serif font-bold text-white mb-2">探索锡克教文化圣地文化之旅</h3>
          <p className="text-[#FDBA74] text-sm mb-5">踏访黄金神庙，感受古鲁的永恒光辉</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/chat" className="px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold rounded-xl transition-colors text-sm">咨询小鸿AI</Link>
            <Link href="/patriarchs" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20 text-sm">浏览所有先贤</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
