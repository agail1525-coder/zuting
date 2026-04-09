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

const HINDU_ATLAS_CONFIG: AtlasConfig = {
  religionKey: "hindu",
  title: "印度教文化圣贤大图谱",
  subtitle: "吠檀多 · 虔信 · 瑜伽",
  themeColor: "#F97316",
  backUrl: "/hindu-sages",
  detailUrlPrefix: "/hindu-sages",
  defaultCenter: [20, 78],
  defaultZoom: 5,
  filters: [
    { key: "all", name: "全部", color: "#F97316" },
    { key: "吠檀多", name: "吠檀多", color: SCHOOL_COLORS["吠檀多"] },
    { key: "毗湿奴派", name: "毗湿奴派", color: SCHOOL_COLORS["毗湿奴派"] },
    { key: "湿婆派", name: "湿婆派", color: SCHOOL_COLORS["湿婆派"] },
    { key: "近代改革", name: "近代改革", color: SCHOOL_COLORS["近代改革"] },
  ],
  legendItems: [
    { name: "吠檀多", color: SCHOOL_COLORS["吠檀多"] },
    { name: "毗湿奴派", color: SCHOOL_COLORS["毗湿奴派"] },
    { name: "湿婆派", color: SCHOOL_COLORS["湿婆派"] },
    { name: "瑜伽派", color: SCHOOL_COLORS["瑜伽派"] },
    { name: "近代改革", color: SCHOOL_COLORS["近代改革"] },
  ],
  schoolColors: SCHOOL_COLORS,
  typeLabels: {
    birth: "降世",
    ordination: "出家",
    dharma: "证悟",
    teaching: "弘法",
    founding: "建院",
    pilgrimage: "文化之旅",
    exile: "苦行",
    death: "涅槃",
    other: "事件",
  },
  loadingText: "正在加载印度教文化圣贤大图谱...",
};

const AtlasMapDynamic = createAtlasMapDynamic(HINDU_ATLAS_CONFIG);

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
        config={HINDU_ATLAS_CONFIG}
      />

      <AtlasFilterBar
        config={HINDU_ATLAS_CONFIG}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showLineage={showLineage}
        onToggleLineage={() => setShowLineage((v) => !v)}
      />

      {!selectedId && (
        <AtlasLegend
          title="印度教文化主要流派"
          items={HINDU_ATLAS_CONFIG.legendItems}
          themeColor={HINDU_ATLAS_CONFIG.themeColor}
        />
      )}

      {selectedPatriarch && (
        <AtlasSidePanel
          patriarch={selectedPatriarch}
          mapData={selectedMapData}
          activeWaypointIndex={activeWaypointIndex}
          onWaypointClick={handleWaypointClick}
          onClose={handleClose}
          config={HINDU_ATLAS_CONFIG}
        />
      )}

      {!selectedId && (
        <div className="absolute bottom-6 right-4 z-[999] text-right pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-bold text-[#F97316]/80 tracking-wider"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            印度教文化圣贤大图谱
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {patriarchs.length}位圣贤 · 吠檀多 · 虔信 · 瑜伽
          </p>
        </div>
      )}
    </div>
  );
}
