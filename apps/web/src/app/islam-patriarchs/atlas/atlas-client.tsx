"use client";

import { useState, useMemo, useCallback } from "react";
import type { Patriarch } from "@/lib/api";
import { PATRIARCH_JOURNEYS, SCHOOL_COLORS } from "./journeys";
import {
  AtlasFilterBar,
  AtlasLegend,
  AtlasSidePanel,
  createAtlasMapDynamic,
} from "@/components/atlas";
import type { AtlasConfig, PatriarchMapData } from "@/components/atlas";

const ISLAM_TYPE_LABELS = {
  birth: "诞生",
  ordination: "受命",
  dharma: "启示",
  teaching: "传教",
  founding: "建寺",
  pilgrimage: "迁徙",
  exile: "流亡",
  death: "归真",
  other: "事件",
} as const;

const ISLAM_ATLAS_CONFIG: AtlasConfig = {
  religionKey: "islam",
  title: "伊斯兰先贤大图谱",
  subtitle: "先知足迹 · 文明传承",
  themeColor: "#059669",
  backUrl: "/islam-patriarchs",
  detailUrlPrefix: "/islam-patriarchs",
  defaultCenter: [25, 45],
  defaultZoom: 4,
  filters: [
    { key: "all", name: "全部", color: "#059669" },
    { key: "逊尼派", name: "逊尼派", color: SCHOOL_COLORS["逊尼派"] },
    { key: "什叶派", name: "什叶派", color: SCHOOL_COLORS["什叶派"] },
    { key: "苏菲派", name: "苏菲派", color: SCHOOL_COLORS["苏菲派"] },
  ],
  legendItems: [
    { name: "逊尼派", color: SCHOOL_COLORS["逊尼派"] },
    { name: "什叶派", color: SCHOOL_COLORS["什叶派"] },
    { name: "苏菲派", color: SCHOOL_COLORS["苏菲派"] },
  ],
  schoolColors: SCHOOL_COLORS,
  typeLabels: ISLAM_TYPE_LABELS,
  loadingText: "正在加载伊斯兰先贤大图谱...",
};

const AtlasMapDynamic = createAtlasMapDynamic(ISLAM_ATLAS_CONFIG);

interface Props {
  patriarchs: Patriarch[];
}

export default function AtlasClient({ patriarchs }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showLineage, setShowLineage] = useState(false);
  const [activeWaypointIndex, setActiveWaypointIndex] = useState<number | null>(null);

  const journeyMap = useMemo(() => {
    const m = new Map<string, PatriarchMapData>();
    for (const j of PATRIARCH_JOURNEYS) {
      m.set(j.name, j);
    }
    return m;
  }, []);

  const selectedPatriarch = useMemo(
    () => patriarchs.find((p) => p.id === selectedId) ?? null,
    [patriarchs, selectedId]
  );

  const selectedMapData = useMemo(
    () =>
      selectedPatriarch ? journeyMap.get(selectedPatriarch.name) ?? null : null,
    [selectedPatriarch, journeyMap]
  );

  const handlePatriarchClick = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
    setActiveWaypointIndex(null);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
    setActiveWaypointIndex(null);
  }, []);

  const handleWaypointClick = useCallback((index: number) => {
    setActiveWaypointIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0f172a]">
      <AtlasMapDynamic
        patriarchs={patriarchs}
        journeyMap={journeyMap}
        selectedId={selectedId}
        activeFilter={activeFilter}
        showLineage={showLineage}
        activeWaypointIndex={activeWaypointIndex}
        onPatriarchClick={handlePatriarchClick}
        config={ISLAM_ATLAS_CONFIG}
      />

      <AtlasFilterBar
        config={ISLAM_ATLAS_CONFIG}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showLineage={showLineage}
        onToggleLineage={() => setShowLineage((v) => !v)}
      />

      {!selectedId && (
        <AtlasLegend
          title="伊斯兰学派传承"
          items={ISLAM_ATLAS_CONFIG.legendItems}
          themeColor={ISLAM_ATLAS_CONFIG.themeColor}
        />
      )}

      {selectedPatriarch && (
        <AtlasSidePanel
          patriarch={selectedPatriarch}
          mapData={selectedMapData}
          activeWaypointIndex={activeWaypointIndex}
          onWaypointClick={handleWaypointClick}
          onClose={handleClose}
          config={ISLAM_ATLAS_CONFIG}
        />
      )}

      {!selectedId && (
        <div className="absolute bottom-6 right-4 z-[999] text-right pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-bold text-[#059669]/80 tracking-wider"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            伊斯兰先贤大图谱
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {patriarchs.length}位先贤 · 先知足迹 · 文明传承
          </p>
        </div>
      )}
    </div>
  );
}
