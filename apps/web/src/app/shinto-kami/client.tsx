"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Religion, Patriarch } from "@/lib/api";
import InkAvatar from "@/app/zen-patriarchs/InkAvatar";

// ── Shinto Schools Data ──────────────────────────────────────────────
const SHINTO_SCHOOLS = [
  { key: "amatsukami", name: "天津神", nameEn: "Heavenly Deities", founder: "天照大神", status: "foundational", shrine: "伊势神宫 · 宫崎神宫 · 出云大社", method: "创世神话 · 天孙降临 · 皇统神圣" },
  { key: "kunitsukami", name: "国津神", nameEn: "Earthly Deities", founder: "大国主命", status: "foundational", shrine: "出云大社 · 大神神社 · 三嶋大社", method: "国土创建 · 农业丰收 · 姻缘缔结" },
  { key: "founders", name: "神社创建者", nameEn: "Shrine Founders", founder: "役小角 (634-701)", status: "historical", shrine: "金峯山寺 · 吉野山 · 大峰山", method: "修验道 · 山岳信仰 · 神佛习合" },
  { key: "thinkers", name: "神道思想家", nameEn: "Shinto Thinkers", founder: "本居宣长 (1730-1801)", status: "historical", shrine: "松阪 · 京都 · 江户", method: "国学 · 古道 · 排佛论 · 皇国思想" },
  { key: "sectarian", name: "教派神道", nameEn: "Sectarian Shinto", founder: "黑住宗忠 (1780-1850)", status: "active", shrine: "金光教 · 天理教 · 黑住教", method: "民间信仰 · 神道宗派 · 现世利益" },
];

const schoolNameMap: Record<string, string> = {
  amatsukami: "天津神",
  kunitsukami: "国津神",
  founders: "神社创建者",
  thinkers: "神道思想家",
  sectarian: "教派神道",
};

function ShintoCard({ p, t }: { p: Patriarch; t: (k: string) => string }) {
  return (
    <Link
      href={`/shinto-kami/${p.id}`}
      className="block rounded-xl bg-white border border-[#E11D48]/20 p-5 hover:shadow-lg hover:border-[#E11D48]/50 transition-all group"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E11D48]/20 to-[#BE123C]/10 border-2 border-[#E11D48]/30 flex items-center justify-center text-2xl flex-shrink-0">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <InkAvatar name={p.name} size={56} />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-bold text-[#4C0519] group-hover:text-[#E11D48] transition-colors">
              {p.name}
            </h3>
            {p.generation && (
              <span className="px-2 py-0.5 bg-[#E11D48]/10 text-[#E11D48] text-xs rounded-full font-medium">
                第{p.generation}代
              </span>
            )}
          </div>
          {p.nameEn && <p className="text-xs text-[#881337] mt-0.5">{p.nameEn}</p>}
        </div>
      </div>
      {p.dates && <p className="text-xs text-[#9F1239] mb-2">📅 {p.dates}</p>}
      {p.title && <p className="text-sm text-[#E11D48] font-medium mb-2">⛩ {p.title}</p>}
      {p.coreTeaching && <p className="text-xs text-[#881337] line-clamp-2 mb-3">{p.coreTeaching.slice(0, 100)}...</p>}
      {Array.isArray(p.templeNames) && p.templeNames.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(p.templeNames as { name: string }[]).slice(0, 2).map((tm, i) => (
            <span key={i} className="px-2 py-0.5 bg-[#E11D48]/5 text-[#E11D48] text-xs rounded border border-[#E11D48]/20">⛩ {tm.name}</span>
          ))}
        </div>
      )}
      {Array.isArray(p.classicQuotes) && p.classicQuotes.length > 0 && (
        <p className="text-xs text-[#881337] italic border-l-2 border-[#E11D48]/30 pl-2 line-clamp-1">&ldquo;{(p.classicQuotes as string[])[0]}&rdquo;</p>
      )}
      <div className="mt-3 text-xs text-[#E11D48] font-medium group-hover:underline">{t("patriarch.viewDetail") || "查看详情"} →</div>
    </Link>
  );
}

export default function ShintoKamiClient({
  patriarchs, religions,
}: { patriarchs: Patriarch[]; religions: Religion[] }) {
  const { t } = useTranslation();
  const [activeSchool, setActiveSchool] = useState("amatsukami");
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
    <main className="min-h-screen bg-[#FFF1F2]">
      <MobileNav />
      <section className="relative bg-gradient-to-b from-[#4C0519] via-[#9F1239] to-[#FFF1F2] pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-5xl block mb-3">⛩</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">神道教文化神灵与思想家</h1>
          <p className="text-[#FDA4AF] text-sm mb-6">从天照大神到出云神话，探索日本精神的根源</p>
          <Link href="/shinto-kami/atlas" className="inline-flex items-center gap-3 px-6 py-3 mt-2 mb-4 rounded-2xl text-base font-bold transition-all duration-300 group bg-gradient-to-r from-[#E11D48] via-[#F43F5E] to-[#E11D48] text-white hover:from-[#F43F5E] hover:via-[#FB7185] hover:to-[#F43F5E] shadow-lg shadow-[#E11D48]/20 hover:shadow-[#E11D48]/40">
            <span className="text-xl">🗺</span>
            <span><span className="block text-left">神道教文化先贤大图谱</span><span className="block text-xs font-normal opacity-70 text-left">全球法脉地图 · 追寻先贤足迹</span></span>
            <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <div className="flex justify-center gap-8 text-white/90 text-sm">
            <div className="text-center"><div className="text-2xl font-bold">{totalPatriarchs}</div><div className="text-xs text-[#FDA4AF]">神灵圣贤</div></div>
            <div className="text-center"><div className="text-2xl font-bold">5</div><div className="text-xs text-[#FDA4AF]">传承类别</div></div>
            <div className="text-center"><div className="text-2xl font-bold">2000+</div><div className="text-xs text-[#FDA4AF]">传承年载</div></div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl border border-[#E11D48]/20 p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#881337] mb-3">五大传承类别</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {SHINTO_SCHOOLS.map((s) => (
              <button key={s.key} onClick={() => setActiveSchool(s.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeSchool === s.key ? "bg-[#E11D48]/15 border-[#E11D48] text-[#BE123C]" : "bg-[#FFF1F2] border-[#FECDD3]/30 text-[#881337] hover:border-[#E11D48]/50"}`}>
                <span className="block">{s.name}</span>
                <span className="block text-xs opacity-70 mt-0.5">{s.status === "active" ? "当代传承" : s.status === "foundational" ? "神话传承" : "历史传承"}</span>
              </button>
            ))}
          </div>
          {(() => {
            const school = SHINTO_SCHOOLS.find((s) => s.key === activeSchool);
            return (
              <div className="mt-4 p-4 bg-[#E11D48]/5 rounded-lg border border-[#E11D48]/20">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-lg">⛩</span>
                  <div><span className="font-medium text-[#4C0519]">{school?.name} ({school?.nameEn})</span><span className="text-[#881337] ml-2">{school?.method}</span></div>
                </div>
                <p className="text-xs text-[#E11D48] mt-2 ml-8">代表: {school?.founder} · 主要神社: {school?.shrine}</p>
              </div>
            );
          })()}
        </div>

        <div className="mb-6">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索神道神灵与思想家..."
            className="w-full px-4 py-3 rounded-xl border border-[#FECDD3]/40 bg-white text-sm placeholder:text-[#A07A7A] focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]/30 outline-none" />
          <p className="text-xs text-[#881337] mt-2">找到 {filtered.length} 位神灵/思想家</p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">⛩</span>
            <h3 className="text-lg font-serif font-bold text-[#4C0519] mb-1">暂无记录</h3>
            <p className="text-sm text-[#881337]">该传承的资料正在整理中</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filtered.sort((a, b) => (a.generation ?? 99) - (b.generation ?? 99)).map((p) => (<ShintoCard key={p.id} p={p} t={t} />))}
          </div>
        )}

        <div className="bg-gradient-to-r from-[#4C0519] to-[#9F1239] rounded-2xl p-8 text-center mb-12">
          <h3 className="text-xl font-serif font-bold text-white mb-2">探索日本神道文化圣地文化之旅</h3>
          <p className="text-[#FDA4AF] text-sm mb-5">踏访伊势神宫，感受神道的千年灵气</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/chat" className="px-6 py-3 bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold rounded-xl transition-colors text-sm">咨询小鸿AI</Link>
            <Link href="/patriarchs" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20 text-sm">浏览所有先贤</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
