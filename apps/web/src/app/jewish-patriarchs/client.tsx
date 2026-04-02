"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Religion, Patriarch } from "@/lib/api";
import InkAvatar from "@/app/zen-patriarchs/InkAvatar";

// ── Jewish Schools Data ──────────────────────────────────────────────
const JEWISH_SCHOOLS = [
  { key: "prophets", name: "圣经先知", nameEn: "Biblical Prophets", founder: "摩西 (约前1300)", status: "foundational", synagogue: "耶路撒冷圣殿山 · 哭墙 · 伯利恒", method: "启示录 · 律法颁布 · 先知书" },
  { key: "rabbis", name: "拉比传统", nameEn: "Rabbinic Tradition", founder: "约哈南·本·扎凯 (约30-90)", status: "historical", synagogue: "犹太会堂 · 叶史瓦学院 · 维尔纳", method: "塔木德注释 · 哈拉卡 · 米示拿" },
  { key: "kabbalah", name: "卡巴拉神秘主义", nameEn: "Kabbalah Mysticism", founder: "西缅·巴尔·约海 (约2世纪)", status: "active", synagogue: "撒法德 · 梅隆山 · 耶路撒冷旧城", method: "生命之树 · 十个质点 · 创世奥秘" },
  { key: "hasidism", name: "哈西迪运动", nameEn: "Hasidic Movement", founder: "巴尔·谢姆·托夫 (1698-1760)", status: "active", synagogue: "乌曼 · 梅泽博兹 · 维兹尼茨", method: "神的欢乐 · 内在虔诚 · 故事传道" },
  { key: "modern", name: "近现代思想", nameEn: "Modern Jewish Thought", founder: "摩西·门德尔松 (1729-1786)", status: "active", synagogue: "华沙 · 纽约 · 特拉维夫", method: "启蒙运动 · 犹太复国主义 · 存在主义" },
];

const schoolNameMap: Record<string, string> = {
  prophets: "圣经先知",
  rabbis: "拉比传统",
  kabbalah: "卡巴拉神秘主义",
  hasidism: "哈西迪运动",
  modern: "近现代思想",
};

function JewishCard({ p, t }: { p: Patriarch; t: (k: string) => string }) {
  return (
    <Link
      href={`/jewish-patriarchs/${p.id}`}
      className="block rounded-xl bg-white border border-[#6366F1]/20 p-5 hover:shadow-lg hover:border-[#6366F1]/50 transition-all group"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6366F1]/20 to-[#4F46E5]/10 border-2 border-[#6366F1]/30 flex items-center justify-center text-2xl flex-shrink-0">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <InkAvatar name={p.name} size={56} />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-bold text-[#1E1B4B] group-hover:text-[#6366F1] transition-colors">
              {p.name}
            </h3>
            {p.generation && (
              <span className="px-2 py-0.5 bg-[#6366F1]/10 text-[#6366F1] text-xs rounded-full font-medium">
                第{p.generation}代
              </span>
            )}
          </div>
          {p.nameEn && <p className="text-xs text-[#312E81] mt-0.5">{p.nameEn}</p>}
        </div>
      </div>
      {p.dates && <p className="text-xs text-[#3730A3] mb-2">📅 {p.dates}</p>}
      {p.title && <p className="text-sm text-[#6366F1] font-medium mb-2">✡ {p.title}</p>}
      {p.coreTeaching && <p className="text-xs text-[#312E81] line-clamp-2 mb-3">{p.coreTeaching.slice(0, 100)}...</p>}
      {Array.isArray(p.templeNames) && p.templeNames.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(p.templeNames as { name: string }[]).slice(0, 2).map((tm, i) => (
            <span key={i} className="px-2 py-0.5 bg-[#6366F1]/5 text-[#6366F1] text-xs rounded border border-[#6366F1]/20">🕍 {tm.name}</span>
          ))}
        </div>
      )}
      {Array.isArray(p.classicQuotes) && p.classicQuotes.length > 0 && (
        <p className="text-xs text-[#312E81] italic border-l-2 border-[#6366F1]/30 pl-2 line-clamp-1">&ldquo;{(p.classicQuotes as string[])[0]}&rdquo;</p>
      )}
      <div className="mt-3 text-xs text-[#6366F1] font-medium group-hover:underline">{t("patriarch.viewDetail") || "查看详情"} →</div>
    </Link>
  );
}

export default function JewishPatriarchsClient({
  patriarchs, religions,
}: { patriarchs: Patriarch[]; religions: Religion[] }) {
  const { t } = useTranslation();
  const [activeSchool, setActiveSchool] = useState("prophets");
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
    <main className="min-h-screen bg-[#EEF2FF]">
      <MobileNav />
      <section className="relative bg-gradient-to-b from-[#312E81] via-[#4338CA] to-[#EEF2FF] pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-5xl block mb-3">✡</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">犹太教先贤传承</h1>
          <p className="text-[#A5B4FC] text-sm mb-6">从摩西律法到拉比智慧、从卡巴拉奥秘到哈西迪喜乐</p>
          <Link href="/jewish-patriarchs/atlas" className="inline-flex items-center gap-3 px-6 py-3 mt-2 mb-4 rounded-2xl text-base font-bold transition-all duration-300 group bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#6366F1] text-white hover:from-[#818CF8] hover:via-[#A5B4FC] hover:to-[#818CF8] shadow-lg shadow-[#6366F1]/20 hover:shadow-[#6366F1]/40">
            <span className="text-xl">🗺</span>
            <span><span className="block text-left">犹太教先贤大图谱</span><span className="block text-xs font-normal opacity-70 text-left">全球法脉地图 · 追寻先贤足迹</span></span>
            <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <div className="flex justify-center gap-8 text-white/90 text-sm">
            <div className="text-center"><div className="text-2xl font-bold">{totalPatriarchs}</div><div className="text-xs text-[#A5B4FC]">先知先贤</div></div>
            <div className="text-center"><div className="text-2xl font-bold">5</div><div className="text-xs text-[#A5B4FC]">传承学派</div></div>
            <div className="text-center"><div className="text-2xl font-bold">3500+</div><div className="text-xs text-[#A5B4FC]">传承年载</div></div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl border border-[#6366F1]/20 p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#312E81] mb-3">五大传承学派</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {JEWISH_SCHOOLS.map((s) => (
              <button key={s.key} onClick={() => setActiveSchool(s.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeSchool === s.key ? "bg-[#6366F1]/15 border-[#6366F1] text-[#4F46E5]" : "bg-[#EEF2FF] border-[#C7D2FE]/30 text-[#312E81] hover:border-[#6366F1]/50"}`}>
                <span className="block">{s.name}</span>
                <span className="block text-xs opacity-70 mt-0.5">{s.status === "active" ? "当代传承" : s.status === "foundational" ? "奠基传承" : "历史传承"}</span>
              </button>
            ))}
          </div>
          {(() => {
            const school = JEWISH_SCHOOLS.find((s) => s.key === activeSchool);
            return (
              <div className="mt-4 p-4 bg-[#6366F1]/5 rounded-lg border border-[#6366F1]/20">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-lg">✡</span>
                  <div><span className="font-medium text-[#1E1B4B]">{school?.name} ({school?.nameEn})</span><span className="text-[#312E81] ml-2">{school?.method}</span></div>
                </div>
                <p className="text-xs text-[#6366F1] mt-2 ml-8">创始: {school?.founder} · 主要会堂: {school?.synagogue}</p>
              </div>
            );
          })()}
        </div>

        <div className="mb-6">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索犹太教先贤..."
            className="w-full px-4 py-3 rounded-xl border border-[#C7D2FE]/40 bg-white text-sm placeholder:text-[#818CF8] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 outline-none" />
          <p className="text-xs text-[#312E81] mt-2">找到 {filtered.length} 位先贤</p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">✡</span>
            <h3 className="text-lg font-serif font-bold text-[#1E1B4B] mb-1">暂无先贤记录</h3>
            <p className="text-sm text-[#312E81]">该传统的先贤资料正在整理中</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filtered.sort((a, b) => (a.generation ?? 99) - (b.generation ?? 99)).map((p) => (<JewishCard key={p.id} p={p} t={t} />))}
          </div>
        )}

        <div className="bg-gradient-to-r from-[#312E81] to-[#4338CA] rounded-2xl p-8 text-center mb-12">
          <h3 className="text-xl font-serif font-bold text-white mb-2">探索犹太教圣地朝圣之旅</h3>
          <p className="text-[#A5B4FC] text-sm mb-5">踏访耶路撒冷圣城，感受千年信仰传承</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/chat" className="px-6 py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold rounded-xl transition-colors text-sm">咨询小鸿AI</Link>
            <Link href="/patriarchs" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20 text-sm">浏览所有先贤</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
