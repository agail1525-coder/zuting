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

const SHINTO_ATLAS_CONFIG: AtlasConfig = {
  religionKey: "shinto",
  title: "神道教神灵大图谱",
  subtitle: "八百万神 · 神宫 · 国学",
  themeColor: "#E11D48",
  backUrl: "/shinto-kami",
  detailUrlPrefix: "/shinto-kami",
  defaultCenter: [36, 137],
  defaultZoom: 5,
  filters: [
    { key: "all", name: "全部", color: "#E11D48" },
    { key: "古代神道", name: "古代神道", color: SCHOOL_COLORS["古代神道"] },
    { key: "国学神道", name: "国学神道", color: SCHOOL_COLORS["国学神道"] },
    { key: "教派神道", name: "教派神道", color: SCHOOL_COLORS["教派神道"] },
    { key: "神社神道", name: "神社神道", color: SCHOOL_COLORS["神社神道"] },
  ],
  legendItems: [
    { name: "古代神道", color: SCHOOL_COLORS["古代神道"] },
    { name: "国学神道", color: SCHOOL_COLORS["国学神道"] },
    { name: "教派神道", color: SCHOOL_COLORS["教派神道"] },
    { name: "神社神道", color: SCHOOL_COLORS["神社神道"] },
  ],
  schoolColors: SCHOOL_COLORS,
  typeLabels: {
    birth: "降临",
    ordination: "神勅",
    dharma: "显现",
    teaching: "传承",
    founding: "创建",
    pilgrimage: "巡幸",
    exile: "隐世",
    death: "昇天",
    other: "事件",
  },
  loadingText: "正在加载神道教神灵大图谱...",
};

const AtlasMapDynamic = createAtlasMapDynamic(SHINTO_ATLAS_CONFIG);

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
        config={SHINTO_ATLAS_CONFIG}
      />

      <AtlasFilterBar
        config={SHINTO_ATLAS_CONFIG}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showLineage={showLineage}
        onToggleLineage={() => setShowLineage((v) => !v)}
      />

      {!selectedId && (
        <AtlasLegend
          title="神道教主要流派"
          items={SHINTO_ATLAS_CONFIG.legendItems}
          themeColor={SHINTO_ATLAS_CONFIG.themeColor}
        />
      )}

      {selectedPatriarch && (
        <AtlasSidePanel
          patriarch={selectedPatriarch}
          mapData={selectedMapData}
          activeWaypointIndex={activeWaypointIndex}
          onWaypointClick={handleWaypointClick}
          onClose={handleClose}
          config={SHINTO_ATLAS_CONFIG}
        />
      )}

      {!selectedId && (
        <div className="absolute bottom-6 right-4 z-[999] text-right pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-bold text-[#E11D48]/80 tracking-wider"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            神道教神灵大图谱
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {patriarchs.length}位神灵 · 八百万神 · 神宫 · 国学
          </p>
        </div>
      )}
    </div>
  );
}
