"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Religion, Patriarch } from "@/lib/api";
import InkAvatar from "@/app/zen-patriarchs/InkAvatar";

// ── Tibetan Buddhist Schools Data ──────────────────────────────────────────────
const TIBETAN_SCHOOLS = [
  { key: "nyingma", name: "宁玛派", nameEn: "Nyingma School", founder: "莲花生大士 (约8世纪)", status: "foundational", monastery: "桑耶寺 · 敏珠林寺 · 白玉寺", method: "大圆满 · 伏藏教法 · 空行法门" },
  { key: "kagyu", name: "噶举派", nameEn: "Kagyu School", founder: "马尔巴 (1012-1097)", status: "active", monastery: "楚布寺 · 隆德寺 · 达隆寺", method: "大手印 · 那若六法 · 口耳传承" },
  { key: "sakya", name: "萨迦派", nameEn: "Sakya School", founder: "贡觉杰布 (1034-1102)", status: "active", monastery: "萨迦寺 · 夏鲁寺 · 纳唐寺", method: "道果法 · 喜金刚 · 显密双修" },
  { key: "gelug", name: "格鲁派", nameEn: "Gelug School", founder: "宗喀巴 (1357-1419)", status: "active", monastery: "甘丹寺 · 色拉寺 · 哲蚌寺", method: "菩提道次第 · 密宗道次第 · 戒律严明" },
  { key: "rime", name: "利美运动", nameEn: "Rimé Movement", founder: "蒋扬钦哲旺波 (1820-1892)", status: "active", monastery: "德格印经院 · 竹庆寺 · 噶陀寺", method: "无派别主义 · 综合传承 · 保存传统" },
];

const schoolNameMap: Record<string, string> = {
  nyingma: "宁玛派",
  kagyu: "噶举派",
  sakya: "萨迦派",
  gelug: "格鲁派",
  rime: "利美运动",
};

function TibetanCard({ p, t }: { p: Patriarch; t: (k: string) => string }) {
  return (
    <Link
      href={`/tibetan-patriarchs/${p.id}`}
      className="block rounded-xl bg-white border border-[#7C3AED]/20 p-5 hover:shadow-lg hover:border-[#7C3AED]/50 transition-all group"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7C3AED]/20 to-[#6D28D9]/10 border-2 border-[#7C3AED]/30 flex items-center justify-center text-2xl flex-shrink-0">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <InkAvatar name={p.name} size={56} />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-bold text-[#2E1065] group-hover:text-[#7C3AED] transition-colors">
              {p.name}
            </h3>
            {p.generation && (
              <span className="px-2 py-0.5 bg-[#7C3AED]/10 text-[#7C3AED] text-xs rounded-full font-medium">
                第{p.generation}代
              </span>
            )}
          </div>
          {p.nameEn && <p className="text-xs text-[#4C1D95] mt-0.5">{p.nameEn}</p>}
        </div>
      </div>
      {p.dates && <p className="text-xs text-[#5B21B6] mb-2">📅 {p.dates}</p>}
      {p.title && <p className="text-sm text-[#7C3AED] font-medium mb-2">☸ {p.title}</p>}
      {p.coreTeaching && <p className="text-xs text-[#4C1D95] line-clamp-2 mb-3">{p.coreTeaching.slice(0, 100)}...</p>}
      {Array.isArray(p.templeNames) && p.templeNames.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(p.templeNames as { name: string }[]).slice(0, 2).map((tm, i) => (
            <span key={i} className="px-2 py-0.5 bg-[#7C3AED]/5 text-[#7C3AED] text-xs rounded border border-[#7C3AED]/20">🏔 {tm.name}</span>
          ))}
        </div>
      )}
      {Array.isArray(p.classicQuotes) && p.classicQuotes.length > 0 && (
        <p className="text-xs text-[#4C1D95] italic border-l-2 border-[#7C3AED]/30 pl-2 line-clamp-1">&ldquo;{(p.classicQuotes as string[])[0]}&rdquo;</p>
      )}
      <div className="mt-3 text-xs text-[#7C3AED] font-medium group-hover:underline">{t("patriarch.viewDetail") || "查看详情"} →</div>
    </Link>
  );
}

export default function TibetanPatriarchsClient({
  patriarchs, religions,
}: { patriarchs: Patriarch[]; religions: Religion[] }) {
  const { t } = useTranslation();
  const [activeSchool, setActiveSchool] = useState("nyingma");
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
    <main className="min-h-screen bg-[#F5F3FF]">
      <MobileNav />
      <section className="relative bg-gradient-to-b from-[#2E1065] via-[#4C1D95] to-[#F5F3FF] pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-5xl block mb-3">☸</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">藏传佛教大师传承</h1>
          <p className="text-[#C4B5FD] text-sm mb-6">从莲花生大士到当代仁波切，雪域高原的智慧传灯</p>
          <div className="flex justify-center gap-8 text-white/90 text-sm">
            <div className="text-center"><div className="text-2xl font-bold">{totalPatriarchs}</div><div className="text-xs text-[#C4B5FD]">成就大师</div></div>
            <div className="text-center"><div className="text-2xl font-bold">5</div><div className="text-xs text-[#C4B5FD]">传承教派</div></div>
            <div className="text-center"><div className="text-2xl font-bold">1200+</div><div className="text-xs text-[#C4B5FD]">传承年载</div></div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl border border-[#7C3AED]/20 p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#4C1D95] mb-3">五大传承教派</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TIBETAN_SCHOOLS.map((s) => (
              <button key={s.key} onClick={() => setActiveSchool(s.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeSchool === s.key ? "bg-[#7C3AED]/15 border-[#7C3AED] text-[#6D28D9]" : "bg-[#F5F3FF] border-[#DDD6FE]/30 text-[#4C1D95] hover:border-[#7C3AED]/50"}`}>
                <span className="block">{s.name}</span>
                <span className="block text-xs opacity-70 mt-0.5">{s.status === "active" ? "当代传承" : "奠基传承"}</span>
              </button>
            ))}
          </div>
          {(() => {
            const school = TIBETAN_SCHOOLS.find((s) => s.key === activeSchool);
            return (
              <div className="mt-4 p-4 bg-[#7C3AED]/5 rounded-lg border border-[#7C3AED]/20">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-lg">☸</span>
                  <div><span className="font-medium text-[#2E1065]">{school?.name} ({school?.nameEn})</span><span className="text-[#4C1D95] ml-2">{school?.method}</span></div>
                </div>
                <p className="text-xs text-[#7C3AED] mt-2 ml-8">创始: {school?.founder} · 主要寺院: {school?.monastery}</p>
              </div>
            );
          })()}
        </div>

        <div className="mb-6">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索藏传佛教大师..."
            className="w-full px-4 py-3 rounded-xl border border-[#DDD6FE]/40 bg-white text-sm placeholder:text-[#8B5CF6] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 outline-none" />
          <p className="text-xs text-[#4C1D95] mt-2">找到 {filtered.length} 位大师</p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">☸</span>
            <h3 className="text-lg font-serif font-bold text-[#2E1065] mb-1">暂无大师记录</h3>
            <p className="text-sm text-[#4C1D95]">该教派的大师资料正在整理中</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filtered.sort((a, b) => (a.generation ?? 99) - (b.generation ?? 99)).map((p) => (<TibetanCard key={p.id} p={p} t={t} />))}
          </div>
        )}

        <div className="bg-gradient-to-r from-[#2E1065] to-[#4C1D95] rounded-2xl p-8 text-center mb-12">
          <h3 className="text-xl font-serif font-bold text-white mb-2">探索西藏雪域朝圣之旅</h3>
          <p className="text-[#C4B5FD] text-sm mb-5">踏访布达拉宫，感受藏传佛法的无尽智慧</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/chat" className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl transition-colors text-sm">咨询小鸿AI</Link>
            <Link href="/patriarchs" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20 text-sm">浏览所有先贤</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
