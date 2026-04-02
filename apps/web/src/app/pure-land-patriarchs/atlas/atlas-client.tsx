"use client";

import { useState, useMemo, useCallback } from "react";
import type { Patriarch } from "@/lib/api";
import { PATRIARCH_JOURNEYS, SCHOOL_COLORS } from "./journeys";
import { AtlasFilterBar, AtlasLegend, AtlasSidePanel, createAtlasMapDynamic, DEFAULT_TYPE_LABELS } from "@/components/atlas";
import type { AtlasConfig, PatriarchMapData } from "@/components/atlas";

const CONFIG: AtlasConfig = {
  religionKey: "pure-land",
  title: "净土宗祖师大图谱",
  subtitle: "十三祖 · 千年念佛法脉",
  themeColor: "#C4A265",
  backUrl: "/pure-land-patriarchs",
  detailUrlPrefix: "/pure-land-patriarchs",
  defaultCenter: [30, 115],
  defaultZoom: 5,
  filters: [{ key: "all", name: "全部", color: "#C4A265" }],
  legendItems: [{ name: "净土宗", color: "#C4A265" }],
  schoolColors: SCHOOL_COLORS,
  typeLabels: DEFAULT_TYPE_LABELS,
  loadingText: "正在加载净土宗祖师大图谱...",
};

const AtlasMapDynamic = createAtlasMapDynamic(CONFIG);

export default function AtlasClient({ patriarchs }: { patriarchs: Patriarch[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showLineage, setShowLineage] = useState(false);
  const [activeWaypointIndex, setActiveWaypointIndex] = useState<number | null>(null);

  const journeyMap = useMemo(() => {
    const m = new Map<string, PatriarchMapData>();
    for (const j of PATRIARCH_JOURNEYS) m.set(j.name, j);
    return m;
  }, []);

  const selectedPatriarch = useMemo(() => patriarchs.find((p) => p.id === selectedId) ?? null, [patriarchs, selectedId]);
  const selectedMapData = useMemo(() => selectedPatriarch ? journeyMap.get(selectedPatriarch.name) ?? null : null, [selectedPatriarch, journeyMap]);

  const handlePatriarchClick = useCallback((id: string) => { setSelectedId((prev) => (prev === id ? null : id)); setActiveWaypointIndex(null); }, []);
  const handleClose = useCallback(() => { setSelectedId(null); setActiveWaypointIndex(null); }, []);
  const handleWaypointClick = useCallback((index: number) => { setActiveWaypointIndex((prev) => (prev === index ? null : index)); }, []);

  return (
    <div className="fixed inset-0 bg-[#0f172a]">
      <AtlasMapDynamic patriarchs={patriarchs} journeyMap={journeyMap} selectedId={selectedId} activeFilter={activeFilter} showLineage={showLineage} activeWaypointIndex={activeWaypointIndex} onPatriarchClick={handlePatriarchClick} config={CONFIG} />
      <AtlasFilterBar config={CONFIG} activeFilter={activeFilter} onFilterChange={setActiveFilter} showLineage={showLineage} onToggleLineage={() => setShowLineage((v) => !v)} />
      {!selectedId && <AtlasLegend title="净土宗" items={CONFIG.legendItems} themeColor={CONFIG.themeColor} />}
      {selectedPatriarch && <AtlasSidePanel patriarch={selectedPatriarch} mapData={selectedMapData} activeWaypointIndex={activeWaypointIndex} onWaypointClick={handleWaypointClick} onClose={handleClose} config={CONFIG} />}
      {!selectedId && (
        <div className="absolute bottom-6 right-4 z-[999] text-right pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-bold text-[#C4A265]/80 tracking-wider" style={{ fontFamily: "'Noto Serif SC', serif" }}>净土宗祖师大图谱</h1>
          <p className="text-xs text-slate-500 mt-1">{patriarchs.length}位祖师 · 念佛法门 · 千年净土</p>
        </div>
      )}
    </div>
  );
}
