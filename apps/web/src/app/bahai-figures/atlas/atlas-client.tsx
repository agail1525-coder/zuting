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

const BAHAI_ATLAS_CONFIG: AtlasConfig = {
  religionKey: "bahai",
  title: "巴哈伊教文化圣贤大图谱",
  subtitle: "统一文化 · 世界和平",
  themeColor: "#0891B2",
  backUrl: "/bahai-figures",
  detailUrlPrefix: "/bahai-figures",
  defaultCenter: [32, 50],
  defaultZoom: 4,
  filters: [
    { key: "all", name: "全部", color: "#0891B2" },
    { key: "先知", name: "先知", color: SCHOOL_COLORS["先知"] },
    { key: "圣护", name: "圣护", color: SCHOOL_COLORS["圣护"] },
    { key: "杰出信徒", name: "杰出信徒", color: SCHOOL_COLORS["杰出信徒"] },
  ],
  legendItems: [
    { name: "先知", color: SCHOOL_COLORS["先知"] },
    { name: "圣护", color: SCHOOL_COLORS["圣护"] },
    { name: "万国正义院", color: SCHOOL_COLORS["万国正义院"] },
    { name: "杰出信徒", color: SCHOOL_COLORS["杰出信徒"] },
  ],
  schoolColors: SCHOOL_COLORS,
  typeLabels: {
    birth: "诞生",
    ordination: "受命",
    dharma: "启示",
    teaching: "宣教",
    founding: "立教",
    pilgrimage: "流放",
    exile: "囚禁",
    death: "升天",
    other: "事件",
  },
  loadingText: "正在加载巴哈伊教文化圣贤大图谱...",
};

const AtlasMapDynamic = createAtlasMapDynamic(BAHAI_ATLAS_CONFIG);

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
        config={BAHAI_ATLAS_CONFIG}
      />

      <AtlasFilterBar
        config={BAHAI_ATLAS_CONFIG}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showLineage={showLineage}
        onToggleLineage={() => setShowLineage((v) => !v)}
      />

      {!selectedId && (
        <AtlasLegend
          title="巴哈伊教文化体系"
          items={BAHAI_ATLAS_CONFIG.legendItems}
          themeColor={BAHAI_ATLAS_CONFIG.themeColor}
        />
      )}

      {selectedPatriarch && (
        <AtlasSidePanel
          patriarch={selectedPatriarch}
          mapData={selectedMapData}
          activeWaypointIndex={activeWaypointIndex}
          onWaypointClick={handleWaypointClick}
          onClose={handleClose}
          config={BAHAI_ATLAS_CONFIG}
        />
      )}

      {!selectedId && (
        <div className="absolute bottom-6 right-4 z-[999] text-right pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0891B2]/80 tracking-wider"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            巴哈伊教文化圣贤大图谱
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {patriarchs.length}位圣贤 · 统一文化 · 世界和平
          </p>
        </div>
      )}
    </div>
  );
}
