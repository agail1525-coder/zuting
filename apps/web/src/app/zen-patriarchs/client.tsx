"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import type { Religion, Patriarch } from "@/lib/api";

// ── Five Zen Schools Data ──────────────────────────────────────────────────
const ZEN_SCHOOLS = [
  { key: "caodong", name: "曹洞宗", nameEn: "Caodong/Soto", founder: "洞山良价 + 曹山本寂", status: "active", temple: "洞山普利禅寺", method: "默照禅 · 五位君臣" },
  { key: "linji", name: "临济宗", nameEn: "Linji/Rinzai", founder: "临济义玄", status: "active", temple: "临济寺(河北正定)", method: "棒喝 · 看话禅" },
  { key: "yunmen", name: "云门宗", nameEn: "Yunmen", founder: "云门文偃", status: "merged", temple: "云门山大觉禅寺", method: "一字关 · 函盖乾坤" },
  { key: "fayan", name: "法眼宗", nameEn: "Fayan", founder: "法眼文益", status: "merged", temple: "清凉寺(南京)", method: "华严禅 · 六相圆融" },
  { key: "guiyang", name: "沩仰宗", nameEn: "Guiyang", founder: "沩山灵祐 + 仰山慧寂", status: "merged", temple: "沩山密印寺", method: "圆相 · 暗机" },
];

// ── Lineage Tree Node ──────────────────────────────────────────────────────
interface TreeNode {
  patriarch: Patriarch;
  children: TreeNode[];
}

function buildLineageTree(patriarchs: Patriarch[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  patriarchs.forEach((p) => map.set(p.id, { patriarch: p, children: [] }));

  const roots: TreeNode[] = [];
  patriarchs.forEach((p) => {
    const node = map.get(p.id)!;
    if (p.teacherId && map.has(p.teacherId)) {
      map.get(p.teacherId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort children by generation
  const sortChildren = (node: TreeNode) => {
    node.children.sort(
      (a, b) => (a.patriarch.generation ?? 99) - (b.patriarch.generation ?? 99)
    );
    node.children.forEach(sortChildren);
  };
  roots.forEach(sortChildren);
  roots.sort(
    (a, b) => (a.patriarch.generation ?? 99) - (b.patriarch.generation ?? 99)
  );

  return roots;
}

// ── Tree Node Component ────────────────────────────────────────────────────
function LineageNode({
  node,
  depth,
  expanded,
  onToggle,
  t,
}: {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  t: (k: string) => string;
}) {
  const p = node.patriarch;
  const isOpen = expanded.has(p.id);
  const hasChildren = node.children.length > 0;

  return (
    <div className={depth > 0 ? "ml-6 sm:ml-10 relative" : "relative"}>
      {/* Vertical connector line */}
      {depth > 0 && (
        <div className="absolute -left-5 sm:-left-6 top-0 bottom-0 w-px bg-[#C4A265]/30" />
      )}
      {depth > 0 && (
        <div className="absolute -left-5 sm:-left-6 top-5 w-4 sm:w-5 h-px bg-[#C4A265]/30" />
      )}

      {/* Node card */}
      <div className="flex items-start gap-3 py-2 group">
        {/* Avatar circle */}
        <button
          onClick={() => hasChildren && onToggle(p.id)}
          className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
            hasChildren
              ? "border-[#C4A265] bg-[#C4A265]/10 hover:bg-[#C4A265]/20 cursor-pointer"
              : "border-[#D4C5A0]/50 bg-[#F5F0E8]"
          }`}
        >
          {p.imageUrl ? (
            <img
              src={p.imageUrl}
              alt={p.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-[#8B6914]">🧘</span>
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/zen-patriarchs/${p.id}`}
              className="text-[#2C1810] font-serif font-bold hover:text-[#8B6914] transition-colors"
            >
              {p.name}
            </Link>
            {p.generation && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#C4A265]/15 text-[#8B6914] border border-[#C4A265]/30">
                {t("zen.lineage.generation").replace("{n}", String(p.generation))}
              </span>
            )}
            {p.title && (
              <span className="text-xs text-[#8B6914]/70">{p.title}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B5C4D] mt-0.5">
            {p.nameEn && <span>{p.nameEn}</span>}
            {p.dates && <span>· {p.dates}</span>}
          </div>
          {hasChildren && (
            <button
              onClick={() => onToggle(p.id)}
              className="text-xs text-[#8B6914] hover:underline mt-1"
            >
              {isOpen
                ? `▾ ${t("zen.lineage.collapse")}`
                : `▸ ${t("zen.lineage.expand")} (${node.children.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {isOpen &&
        node.children.map((child) => (
          <LineageNode
            key={child.patriarch.id}
            node={child}
            depth={depth + 1}
            expanded={expanded}
            onToggle={onToggle}
            t={t}
          />
        ))}
    </div>
  );
}

// ── Patriarch Card ─────────────────────────────────────────────────────────
function ZenPatriarchCard({ p, t }: { p: Patriarch; t: (k: string) => string }) {
  return (
    <Link
      href={`/zen-patriarchs/${p.id}`}
      className="block rounded-xl bg-white border border-[#D4C5A0]/40 p-5 hover:shadow-lg hover:border-[#C4A265]/60 transition-all group"
    >
      {/* Avatar + Gen badge */}
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C4A265]/20 to-[#8B6914]/10 border-2 border-[#C4A265]/30 flex items-center justify-center text-2xl flex-shrink-0">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            "🧘"
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-serif font-bold text-[#2C1810] text-lg group-hover:text-[#8B6914] transition-colors">
            {p.name}
          </h3>
          {p.nameEn && <p className="text-xs text-[#6B5C4D]">{p.nameEn}</p>}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {p.generation && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#C4A265]/15 text-[#8B6914] border border-[#C4A265]/30">
            {t("zen.card.generation").replace("{n}", String(p.generation))}
          </span>
        )}
        {p.title && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#2C1810]/5 text-[#6B5C4D]">
            {p.title}
          </span>
        )}
        {p.dates && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#2C1810]/5 text-[#6B5C4D]">
            {p.dates}
          </span>
        )}
      </div>

      {/* Quote or teaching preview */}
      {p.classicQuotes && Array.isArray(p.classicQuotes) && p.classicQuotes.length > 0 && (
        <p className="text-sm text-[#6B5C4D] italic border-l-2 border-[#C4A265]/40 pl-3 mb-3 line-clamp-2">
          「{(p.classicQuotes as string[])[0]}」
        </p>
      )}

      {/* Temple tags */}
      {p.templeNames && Array.isArray(p.templeNames) && (p.templeNames as { name: string }[]).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {(p.templeNames as { name: string; location?: string }[]).map((t2) => (
            <span
              key={t2.name}
              className="text-xs px-2 py-0.5 rounded bg-[#F5F0E8] text-[#8B6914] border border-[#D4C5A0]/30"
            >
              🏛 {t2.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function ZenPatriarchsClient({
  patriarchs,
  allBuddhismPatriarchs: _allBuddhism,
  religions: _religions,
}: {
  patriarchs: Patriarch[];
  allBuddhismPatriarchs: Patriarch[];
  religions: Religion[];
}) {
  const { t } = useTranslation();
  const [activeSchool, setActiveSchool] = useState("caodong");
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // Auto-expand first 3 generations
    const ids = new Set<string>();
    patriarchs.forEach((p) => {
      if ((p.generation ?? 99) <= 3) ids.add(p.id);
    });
    return ids;
  });
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");
  const [search, setSearch] = useState("");

  // Build lineage tree
  const tree = useMemo(() => buildLineageTree(patriarchs), [patriarchs]);

  // Filtered patriarchs for grid view
  const filtered = useMemo(() => {
    if (!search) return patriarchs;
    const q = search.toLowerCase();
    return patriarchs.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.nameEn ?? "").toLowerCase().includes(q) ||
        (p.title ?? "").toLowerCase().includes(q) ||
        (p.dates ?? "").includes(q)
    );
  }, [patriarchs, search]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpanded(new Set(patriarchs.map((p) => p.id)));
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  // Stats
  const maxGen = patriarchs.reduce(
    (max, p) => Math.max(max, p.generation ?? 0),
    0
  );
  const templeCount = new Set(
    patriarchs.flatMap((p) =>
      Array.isArray(p.templeNames)
        ? (p.templeNames as { name: string }[]).map((t2) => t2.name)
        : []
    )
  ).size;

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-24">
      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Ink wash mountain silhouette background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2C1810]/90 via-[#3D2B1F]/80 to-[#F5F0E8]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F5F0E8] to-transparent" />
        {/* Decorative brush strokes */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-[#C4A265]/5 rounded-full blur-3xl" />
        <div className="absolute top-20 left-10 w-48 h-48 bg-[#8B6914]/5 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
          <div className="text-[#C4A265] text-5xl mb-4">☸</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#F5F0E8] mb-3 tracking-wider">
            {t("zen.title")}
          </h1>
          <p className="text-[#D4C5A0] text-sm sm:text-base max-w-lg mx-auto mb-6">
            {t("zen.heroSubtitle")}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 text-[#D4C5A0]">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#C4A265]">{maxGen || 52}</div>
              <div className="text-xs">{t("zen.stats.generations")}</div>
            </div>
            <div className="w-px h-8 bg-[#C4A265]/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[#C4A265]">{patriarchs.length}</div>
              <div className="text-xs">{t("zen.stats.patriarchs")}</div>
            </div>
            <div className="w-px h-8 bg-[#C4A265]/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[#C4A265]">1200+</div>
              <div className="text-xs">{t("zen.stats.years")}</div>
            </div>
            <div className="w-px h-8 bg-[#C4A265]/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[#C4A265]">{templeCount || 6}</div>
              <div className="text-xs">{t("zen.stats.temples")}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6">
        {/* ── Five Schools Navigator ──────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-[#D4C5A0]/40 p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#6B5C4D] mb-3">{t("zen.schools.title")}</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {ZEN_SCHOOLS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSchool(s.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  activeSchool === s.key
                    ? "bg-[#C4A265]/15 border-[#C4A265] text-[#8B6914]"
                    : "bg-[#F5F0E8] border-[#D4C5A0]/30 text-[#6B5C4D] hover:border-[#C4A265]/50"
                }`}
              >
                <span className="block">{s.name}</span>
                <span className="block text-xs opacity-70 mt-0.5">
                  {s.status === "active" ? t("zen.schools.active") : t("zen.schools.merged")}
                </span>
              </button>
            ))}
          </div>

          {/* School detail */}
          {activeSchool !== "caodong" ? (
            <div className="mt-4 p-4 bg-[#F5F0E8] rounded-lg text-center">
              <p className="text-[#6B5C4D] text-sm">{t("zen.schools.comingSoon")}</p>
              <p className="text-xs text-[#8B6914] mt-1">
                {ZEN_SCHOOLS.find((s) => s.key === activeSchool)?.founder} · {ZEN_SCHOOLS.find((s) => s.key === activeSchool)?.temple}
              </p>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-[#C4A265]/5 rounded-lg border border-[#C4A265]/20">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-lg">☸</span>
                <div>
                  <span className="font-medium text-[#2C1810]">{t("zen.schools.caodong")}</span>
                  <span className="text-[#6B5C4D] ml-2">
                    {t("zen.schools.caodongDesc")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("zen.searchPlaceholder")}
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg bg-white border border-[#D4C5A0]/40 text-[#2C1810] text-sm placeholder-[#A09080] focus:outline-none focus:border-[#C4A265]"
          />
          <div className="flex rounded-lg border border-[#D4C5A0]/40 bg-white overflow-hidden">
            <button
              onClick={() => setViewMode("tree")}
              className={`px-3 py-2 text-sm ${viewMode === "tree" ? "bg-[#C4A265]/15 text-[#8B6914]" : "text-[#6B5C4D]"}`}
            >
              {t("zen.view.tree")}
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 text-sm ${viewMode === "grid" ? "bg-[#C4A265]/15 text-[#8B6914]" : "text-[#6B5C4D]"}`}
            >
              {t("zen.view.grid")}
            </button>
          </div>
          {viewMode === "tree" && (
            <div className="flex gap-1">
              <button
                onClick={expandAll}
                className="px-3 py-2 text-xs rounded-lg bg-white border border-[#D4C5A0]/40 text-[#6B5C4D] hover:text-[#8B6914]"
              >
                {t("zen.lineage.expandAll")}
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-2 text-xs rounded-lg bg-white border border-[#D4C5A0]/40 text-[#6B5C4D] hover:text-[#8B6914]"
              >
                {t("zen.lineage.collapseAll")}
              </button>
            </div>
          )}
        </div>

        {/* ── Lineage Tree View ───────────────────────────────────────── */}
        {viewMode === "tree" && activeSchool === "caodong" && (
          <div className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-1">
              {t("zen.lineage.title")}
            </h2>
            <p className="text-xs text-[#6B5C4D] mb-6">
              {t("zen.lineage.subtitle")}
            </p>

            {tree.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-4xl block mb-2">🧘</span>
                <p className="text-[#6B5C4D] text-sm">{t("zen.empty.title")}</p>
                <p className="text-xs text-[#A09080] mt-1">{t("zen.empty.subtitle")}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {tree.map((root) => (
                  <LineageNode
                    key={root.patriarch.id}
                    node={root}
                    depth={0}
                    expanded={expanded}
                    onToggle={toggleExpand}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Grid View ───────────────────────────────────────────────── */}
        {viewMode === "grid" && (
          <div>
            <p className="text-sm text-[#6B5C4D] mb-4">
              {t("zen.foundCount").replace("{count}", String(filtered.length))}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filtered.map((p) => (
                <ZenPatriarchCard key={p.id} p={p} t={t} />
              ))}
            </div>
          </div>
        )}

        {/* ── Ancestral Temples Section ────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-[#D4C5A0]/40 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-serif font-bold text-[#2C1810] mb-1">
            {t("zen.temples.title")}
          </h2>
          <p className="text-xs text-[#6B5C4D] mb-4">{t("zen.temples.subtitle")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "洞山普利禅寺", nameEn: "Dongshan Puli Temple", location: "江西宜丰", founded: "869", founder: "洞山良价", significance: "曹洞宗祖庭" },
              { name: "曹山宝积寺", nameEn: "Caoshan Baoji Temple", location: "江西宜黄", founded: "870", founder: "曹山本寂", significance: "曹洞宗祖庭" },
              { name: "云居山真如禅寺", nameEn: "Yunju Zhenru Temple", location: "江西永修", founded: "870", founder: "云居道膺", significance: "曹洞宗重镇·虚云晚年驻锡" },
              { name: "天童景德禅寺", nameEn: "Tiantong Temple", location: "浙江宁波", founded: "300", founder: "义兴", significance: "日本曹洞宗祖庭" },
              { name: "嵩山少林寺", nameEn: "Shaolin Temple", location: "河南登封", founded: "495", founder: "跋陀", significance: "曹洞宗北方重镇" },
              { name: "云门山大觉禅寺", nameEn: "Yunmen Temple", location: "广东乳源", founded: "923", founder: "云门文偃", significance: "云门宗祖庭·虚云重建" },
            ].map((temple) => (
              <div
                key={temple.name}
                className="p-4 rounded-lg bg-[#F5F0E8] border border-[#D4C5A0]/30 hover:border-[#C4A265]/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏛</span>
                  <div className="min-w-0">
                    <h3 className="font-serif font-bold text-[#2C1810] text-sm">{temple.name}</h3>
                    <p className="text-xs text-[#6B5C4D]">{temple.nameEn}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[#C4A265]/10 text-[#8B6914]">{temple.location}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[#2C1810]/5 text-[#6B5C4D]">{temple.significance}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ──────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#2C1810] to-[#3D2B1F] rounded-xl p-8 text-center relative overflow-hidden mb-6">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#C4A265]/10 rounded-full blur-3xl" />
          <div className="relative">
            <span className="text-4xl block mb-3">🧘‍♂️</span>
            <h2 className="text-xl font-serif font-bold text-[#F5F0E8]">{t("zen.cta.title")}</h2>
            <p className="text-[#D4C5A0] text-sm mt-2 max-w-md mx-auto">{t("zen.cta.subtitle")}</p>
            <div className="flex gap-3 justify-center mt-5">
              <Link
                href="/chat"
                className="px-6 py-3 bg-[#C4A265] hover:bg-[#B39255] text-white font-medium rounded-xl transition-colors text-sm"
              >
                {t("zen.cta.aiChat")}
              </Link>
              <Link
                href="/patriarchs"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-[#F5F0E8] font-medium rounded-xl transition-colors border border-white/20 text-sm"
              >
                {t("zen.cta.browseAll")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
