"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Religion, Patriarch } from "@/lib/api";
import InkAvatar from "@/app/zen-patriarchs/InkAvatar";

// ── Bahá'í Schools Data ──────────────────────────────────────────────
const BAHAI_SCHOOLS = [
  { key: "babi", name: "巴比运动先驱", nameEn: "Bábí Movement Precursors", founder: "巴孛 (1819-1850)", status: "foundational", holyPlace: "设拉子 · 伊斯法罕 · 大不里士", method: "先驱宣示 · 新约颁布 · 殉道精神" },
  { key: "covenant", name: "圣约中心", nameEn: "Center of the Covenant", founder: "巴哈欧拉 (1817-1892)", status: "foundational", holyPlace: "巴格达 · 阿卡 · 海法巴哈伊圣地", method: "天下一家 · 宗教统一 · 书面圣约" },
  { key: "holy_women", name: "巴哈伊圣女", nameEn: "Bahá'í Holy Women", founder: "塔希里赫 (1817-1852)", status: "historical", holyPlace: "卡兹文 · 巴格达 · 海法", method: "女性解放 · 新时代先声 · 殉道见证" },
  { key: "hands", name: "信仰之手", nameEn: "Hands of the Cause", founder: "阿博都-巴哈 (1844-1921)", status: "historical", holyPlace: "阿卡 · 伦敦 · 纽约 · 德黑兰", method: "教义传播 · 管理体制 · 世界旅行" },
  { key: "pioneers", name: "教务先驱", nameEn: "Administrative Pioneers", founder: "守基·阿芬第 (1897-1957)", status: "active", holyPlace: "海法世界中心 · 阿卡圣地 · 威尔梅特神殿", method: "行政秩序 · 九人院 · 世界中心建设" },
];

const schoolNameMap: Record<string, string> = {
  babi: "巴比运动先驱",
  covenant: "圣约中心",
  holy_women: "巴哈伊圣女",
  hands: "信仰之手",
  pioneers: "教务先驱",
};

function BahaiCard({ p, t }: { p: Patriarch; t: (k: string) => string }) {
  return (
    <Link
      href={`/bahai-figures/${p.id}`}
      className="block rounded-xl bg-white border border-[#0891B2]/20 p-5 hover:shadow-lg hover:border-[#0891B2]/50 transition-all group"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0891B2]/20 to-[#0E7490]/10 border-2 border-[#0891B2]/30 flex items-center justify-center text-2xl flex-shrink-0">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <InkAvatar name={p.name} size={56} />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-bold text-[#083344] group-hover:text-[#0891B2] transition-colors">
              {p.name}
            </h3>
            {p.generation && (
              <span className="px-2 py-0.5 bg-[#0891B2]/10 text-[#0891B2] text-xs rounded-full font-medium">
                第{p.generation}代
              </span>
            )}
          </div>
          {p.nameEn && <p className="text-xs text-[#155E75] mt-0.5">{p.nameEn}</p>}
        </div>
      </div>
      {p.dates && <p className="text-xs text-[#0E7490] mb-2">📅 {p.dates}</p>}
      {p.title && <p className="text-sm text-[#0891B2] font-medium mb-2">✦ {p.title}</p>}
      {p.coreTeaching && <p className="text-xs text-[#155E75] line-clamp-2 mb-3">{p.coreTeaching.slice(0, 100)}...</p>}
      {Array.isArray(p.templeNames) && p.templeNames.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(p.templeNames as { name: string }[]).slice(0, 2).map((tm, i) => (
            <span key={i} className="px-2 py-0.5 bg-[#0891B2]/5 text-[#0891B2] text-xs rounded border border-[#0891B2]/20">✦ {tm.name}</span>
          ))}
        </div>
      )}
      {Array.isArray(p.classicQuotes) && p.classicQuotes.length > 0 && (
        <p className="text-xs text-[#155E75] italic border-l-2 border-[#0891B2]/30 pl-2 line-clamp-1">&ldquo;{(p.classicQuotes as string[])[0]}&rdquo;</p>
      )}
      <div className="mt-3 text-xs text-[#0891B2] font-medium group-hover:underline">{t("patriarch.viewDetail") || "查看详情"} →</div>
    </Link>
  );
}

export default function BahaiFiguresClient({
  patriarchs, religions,
}: { patriarchs: Patriarch[]; religions: Religion[] }) {
  const { t } = useTranslation();
  const [activeSchool, setActiveSchool] = useState("babi");
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
    <main className="min-h-screen bg-[#ECFEFF]">
      <MobileNav />
      <section className="relative bg-gradient-to-b from-[#083344] via-[#0E7490] to-[#ECFEFF] pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-5xl block mb-3">✦</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">巴哈伊教人物传承</h1>
          <p className="text-[#A5F3FC] text-sm mb-6">从巴孛先声到巴哈欧拉启示，天下一家的世界宗教</p>
          <div className="flex justify-center gap-8 text-white/90 text-sm">
            <div className="text-center"><div className="text-2xl font-bold">{totalPatriarchs}</div><div className="text-xs text-[#A5F3FC]">先驱人物</div></div>
            <div className="text-center"><div className="text-2xl font-bold">5</div><div className="text-xs text-[#A5F3FC]">传承类别</div></div>
            <div className="text-center"><div className="text-2xl font-bold">180+</div><div className="text-xs text-[#A5F3FC]">传承年载</div></div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl border border-[#0891B2]/20 p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#155E75] mb-3">五大传承类别</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {BAHAI_SCHOOLS.map((s) => (
              <button key={s.key} onClick={() => setActiveSchool(s.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeSchool === s.key ? "bg-[#0891B2]/15 border-[#0891B2] text-[#0E7490]" : "bg-[#ECFEFF] border-[#A5F3FC]/30 text-[#155E75] hover:border-[#0891B2]/50"}`}>
                <span className="block">{s.name}</span>
                <span className="block text-xs opacity-70 mt-0.5">{s.status === "active" ? "当代传承" : s.status === "foundational" ? "奠基传承" : "历史传承"}</span>
              </button>
            ))}
          </div>
          {(() => {
            const school = BAHAI_SCHOOLS.find((s) => s.key === activeSchool);
            return (
              <div className="mt-4 p-4 bg-[#0891B2]/5 rounded-lg border border-[#0891B2]/20">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-lg">✦</span>
                  <div><span className="font-medium text-[#083344]">{school?.name} ({school?.nameEn})</span><span className="text-[#155E75] ml-2">{school?.method}</span></div>
                </div>
                <p className="text-xs text-[#0891B2] mt-2 ml-8">代表: {school?.founder} · 圣地: {school?.holyPlace}</p>
              </div>
            );
          })()}
        </div>

        <div className="mb-6">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索巴哈伊教人物..."
            className="w-full px-4 py-3 rounded-xl border border-[#A5F3FC]/40 bg-white text-sm placeholder:text-[#67E8F9] focus:border-[#0891B2] focus:ring-1 focus:ring-[#0891B2]/30 outline-none" />
          <p className="text-xs text-[#155E75] mt-2">找到 {filtered.length} 位人物</p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">✦</span>
            <h3 className="text-lg font-serif font-bold text-[#083344] mb-1">暂无人物记录</h3>
            <p className="text-sm text-[#155E75]">该传承的人物资料正在整理中</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filtered.sort((a, b) => (a.generation ?? 99) - (b.generation ?? 99)).map((p) => (<BahaiCard key={p.id} p={p} t={t} />))}
          </div>
        )}

        <div className="bg-gradient-to-r from-[#083344] to-[#0E7490] rounded-2xl p-8 text-center mb-12">
          <h3 className="text-xl font-serif font-bold text-white mb-2">探索巴哈伊圣地朝圣之旅</h3>
          <p className="text-[#A5F3FC] text-sm mb-5">踏访海法世界中心，感受天下一家的宏大愿景</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/chat" className="px-6 py-3 bg-[#0891B2] hover:bg-[#0E7490] text-white font-semibold rounded-xl transition-colors text-sm">咨询小鸿AI</Link>
            <Link href="/patriarchs" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20 text-sm">浏览所有先贤</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
