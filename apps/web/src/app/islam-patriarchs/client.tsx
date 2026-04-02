"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Religion, Patriarch } from "@/lib/api";
import InkAvatar from "@/app/zen-patriarchs/InkAvatar";

// ── Islamic Schools Data ────────────────────────────────────────────────
const ISLAM_SCHOOLS = [
  { key: "rashidun", name: "正统哈里发", nameEn: "Rashidun Caliphs", founder: "先知穆罕默德 (570-632)", status: "foundational", temple: "麦加禁寺 · 麦地那先知寺", method: "先知传承 · 正统治理 · 古兰经与圣训" },
  { key: "madhab", name: "四大教法学派", nameEn: "Four Madhabs", founder: "阿布·哈尼法 · 马立克 · 沙斐仪 · 罕百勒", status: "active", temple: "巴格达 · 麦地那 · 开罗", method: "教法推理 · 圣训解读 · 类比判断" },
  { key: "sufi", name: "苏菲派", nameEn: "Sufism", founder: "哈桑·巴士里 (642-728)", status: "active", temple: "科尼亚 · 大马士革 · 巴格达", method: "神圣之爱 · 内心净化 · 灵性合一" },
  { key: "shia", name: "什叶派伊玛目", nameEn: "Shia Imams", founder: "阿里·本·阿比·塔利卜", status: "active", temple: "纳杰夫 · 卡尔巴拉 · 马什哈德", method: "伊玛目传承 · 先知家族 · 殉难精神" },
  { key: "scholars", name: "学者与旅行家", nameEn: "Scholars & Travelers", founder: "布哈里 · 伊本·西那 · 鲁米", status: "historical", temple: "布哈拉 · 科尔多瓦 · 丹吉尔", method: "圣训学 · 哲学 · 医学 · 旅行" },
];

// ── School name mapping ──────────────────────────────────────────────────
const schoolNameMap: Record<string, string> = {
  rashidun: "正统哈里发",
  madhab: "四大教法学派",
  sufi: "苏菲派",
  shia: "什叶派伊玛目",
  scholars: "学者与旅行家",
};

// ── Patriarch Card ────────────────────────────────────────────────────────
function IslamCard({ p, t }: { p: Patriarch; t: (k: string) => string }) {
  return (
    <Link
      href={`/islam-patriarchs/${p.id}`}
      className="block rounded-xl bg-white border border-[#059669]/20 p-5 hover:shadow-lg hover:border-[#059669]/50 transition-all group"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#059669]/20 to-[#047857]/10 border-2 border-[#059669]/30 flex items-center justify-center text-2xl flex-shrink-0">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <InkAvatar name={p.name} size={56} />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-bold text-[#2C1810] group-hover:text-[#059669] transition-colors">
              {p.name}
            </h3>
            {p.generation && (
              <span className="px-2 py-0.5 bg-[#059669]/10 text-[#059669] text-xs rounded-full font-medium">
                {t("islam.card.generation").replace("{n}", String(p.generation))}
              </span>
            )}
          </div>
          {p.nameEn && (
            <p className="text-xs text-[#6B5C4D] mt-0.5">{p.nameEn}</p>
          )}
        </div>
      </div>

      {p.dates && (
        <p className="text-xs text-[#8B6914] mb-2">📅 {p.dates}</p>
      )}
      {p.title && (
        <p className="text-sm text-[#059669] font-medium mb-2">☪ {p.title}</p>
      )}
      {p.coreTeaching && (
        <p className="text-xs text-[#6B5C4D] line-clamp-2 mb-3">
          {p.coreTeaching.slice(0, 100)}...
        </p>
      )}

      {/* Mosques/Holy Sites */}
      {Array.isArray(p.templeNames) && p.templeNames.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(p.templeNames as { name: string }[]).slice(0, 2).map((tm, i) => (
            <span key={i} className="px-2 py-0.5 bg-[#059669]/5 text-[#059669] text-xs rounded border border-[#059669]/20">
              🕌 {tm.name}
            </span>
          ))}
        </div>
      )}

      {/* Classic Quotes */}
      {Array.isArray(p.classicQuotes) && p.classicQuotes.length > 0 && (
        <p className="text-xs text-[#6B5C4D] italic border-l-2 border-[#059669]/30 pl-2 line-clamp-1">
          &ldquo;{(p.classicQuotes as string[])[0]}&rdquo;
        </p>
      )}

      <div className="mt-3 text-xs text-[#059669] font-medium group-hover:underline">
        {t("islam.card.viewDetail")} →
      </div>
    </Link>
  );
}

export default function IslamPatriarchsClient({
  patriarchs,
  religions,
}: {
  patriarchs: Patriarch[];
  religions: Religion[];
}) {
  const { t } = useTranslation();
  const [activeSchool, setActiveSchool] = useState("rashidun");
  const [search, setSearch] = useState("");

  // Filter patriarchs by active school
  const activePatriarchs = useMemo(() => {
    const schoolName = schoolNameMap[activeSchool];
    return patriarchs.filter((p) => p.school === schoolName);
  }, [activeSchool, patriarchs]);

  // Search filter
  const filtered = useMemo(() => {
    if (!search) return activePatriarchs;
    const q = search.toLowerCase();
    return activePatriarchs.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.nameEn?.toLowerCase().includes(q)) ||
        (p.title?.toLowerCase().includes(q)) ||
        (p.dates?.toLowerCase().includes(q))
    );
  }, [search, activePatriarchs]);

  // Stats
  const totalPatriarchs = patriarchs.length;

  return (
    <main className="min-h-screen bg-[#F5F0E8]">
      <MobileNav />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-[#064E3B] via-[#065F46] to-[#F5F0E8] pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-5xl block mb-3">☪</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
            {t("islam.title")}
          </h1>
          <p className="text-[#A7F3D0] text-sm mb-6">
            {t("islam.heroSubtitle")}
          </p>
          <Link href="/islam-patriarchs/atlas" className="inline-flex items-center gap-3 px-6 py-3 mt-4 mb-4 rounded-2xl text-base font-bold transition-all duration-300 group bg-gradient-to-r from-[#059669] via-[#10B981] to-[#059669] text-white hover:from-[#10B981] hover:via-[#34D399] hover:to-[#10B981] shadow-lg shadow-[#059669]/20 hover:shadow-[#059669]/40">
            <span className="text-xl">🗺</span>
            <span><span className="block text-left">伊斯兰先贤大图谱</span><span className="block text-xs font-normal opacity-70 text-left">全球法脉地图 · 追寻先贤足迹</span></span>
            <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          {/* Stats */}
          <div className="flex justify-center gap-8 text-white/90 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalPatriarchs}</div>
              <div className="text-xs text-[#A7F3D0]">{t("islam.stats.patriarchs")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">5</div>
              <div className="text-xs text-[#A7F3D0]">{t("islam.stats.schools")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1400+</div>
              <div className="text-xs text-[#A7F3D0]">{t("islam.stats.years")}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* School Tabs */}
        <div className="bg-white rounded-xl border border-[#059669]/20 p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#6B5C4D] mb-3">{t("islam.schools.title")}</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {ISLAM_SCHOOLS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSchool(s.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  activeSchool === s.key
                    ? "bg-[#059669]/15 border-[#059669] text-[#047857]"
                    : "bg-[#F5F0E8] border-[#D4C5A0]/30 text-[#6B5C4D] hover:border-[#059669]/50"
                }`}
              >
                <span className="block">{s.name}</span>
                <span className="block text-xs opacity-70 mt-0.5">
                  {s.status === "active" ? t("islam.schools.active") : s.status === "foundational" ? t("islam.schools.foundational") : t("islam.schools.historical")}
                </span>
              </button>
            ))}
          </div>

          {/* School detail */}
          {(() => {
            const school = ISLAM_SCHOOLS.find((s) => s.key === activeSchool);
            return (
              <div className="mt-4 p-4 bg-[#059669]/5 rounded-lg border border-[#059669]/20">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-lg">☪</span>
                  <div>
                    <span className="font-medium text-[#2C1810]">{school?.name} ({school?.nameEn})</span>
                    <span className="text-[#6B5C4D] ml-2">{school?.method}</span>
                  </div>
                </div>
                <p className="text-xs text-[#059669] mt-2 ml-8">
                  {t(`islam.schools.${activeSchool}Desc`)}
                </p>
              </div>
            );
          })()}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("islam.searchPlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-[#D4C5A0]/40 bg-white text-sm placeholder:text-[#A09080] focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 outline-none"
          />
          <p className="text-xs text-[#6B5C4D] mt-2">
            {t("islam.foundCount").replace("{count}", String(filtered.length))}
          </p>
        </div>

        {/* Patriarchs Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">☪</span>
            <h3 className="text-lg font-serif font-bold text-[#2C1810] mb-1">
              {t("islam.empty.title")}
            </h3>
            <p className="text-sm text-[#6B5C4D]">{t("islam.empty.subtitle")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filtered
              .sort((a, b) => (a.generation ?? 99) - (b.generation ?? 99))
              .map((p) => (
                <IslamCard key={p.id} p={p} t={t} />
              ))}
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#064E3B] to-[#065F46] rounded-2xl p-8 text-center mb-12">
          <h3 className="text-xl font-serif font-bold text-white mb-2">
            {t("islam.cta.title")}
          </h3>
          <p className="text-[#A7F3D0] text-sm mb-5">{t("islam.cta.subtitle")}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/chat"
              className="px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white font-semibold rounded-xl transition-colors text-sm"
            >
              {t("islam.cta.aiChat")}
            </Link>
            <Link
              href="/patriarchs"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20 text-sm"
            >
              {t("islam.cta.browseAll")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
