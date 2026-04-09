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

const TIBETAN_ATLAS_CONFIG: AtlasConfig = {
  religionKey: "tibetan",
  title: "藏传佛教文化祖师大图谱",
  subtitle: "雪域法脉 · 密教传承",
  themeColor: "#7C3AED",
  backUrl: "/tibetan-patriarchs",
  detailUrlPrefix: "/tibetan-patriarchs",
  defaultCenter: [30, 90],
  defaultZoom: 5,
  filters: [
    { key: "all", name: "全部", color: "#7C3AED" },
    { key: "宁玛派", name: "宁玛", color: SCHOOL_COLORS["宁玛派"] },
    { key: "噶举派", name: "噶举", color: SCHOOL_COLORS["噶举派"] },
    { key: "萨迦派", name: "萨迦", color: SCHOOL_COLORS["萨迦派"] },
    { key: "格鲁派", name: "格鲁", color: SCHOOL_COLORS["格鲁派"] },
  ],
  legendItems: [
    { name: "宁玛派", color: SCHOOL_COLORS["宁玛派"] },
    { name: "噶举派", color: SCHOOL_COLORS["噶举派"] },
    { name: "萨迦派", color: SCHOOL_COLORS["萨迦派"] },
    { name: "格鲁派", color: SCHOOL_COLORS["格鲁派"] },
    { name: "苯教", color: SCHOOL_COLORS["苯教"] },
  ],
  schoolColors: SCHOOL_COLORS,
  typeLabels: {
    birth: "降世",
    ordination: "出家",
    dharma: "灌顶",
    teaching: "弘法",
    founding: "建寺",
    pilgrimage: "文化之旅",
    exile: "流亡",
    death: "圆寂",
    other: "事件",
  },
  loadingText: "正在加载藏传佛教文化祖师大图谱...",
};

const AtlasMapDynamic = createAtlasMapDynamic(TIBETAN_ATLAS_CONFIG);

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
        config={TIBETAN_ATLAS_CONFIG}
      />

      <AtlasFilterBar
        config={TIBETAN_ATLAS_CONFIG}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showLineage={showLineage}
        onToggleLineage={() => setShowLineage((v) => !v)}
      />

      {!selectedId && (
        <AtlasLegend
          title="藏传佛教文化诸派"
          items={TIBETAN_ATLAS_CONFIG.legendItems}
          themeColor={TIBETAN_ATLAS_CONFIG.themeColor}
        />
      )}

      {selectedPatriarch && (
        <AtlasSidePanel
          patriarch={selectedPatriarch}
          mapData={selectedMapData}
          activeWaypointIndex={activeWaypointIndex}
          onWaypointClick={handleWaypointClick}
          onClose={handleClose}
          config={TIBETAN_ATLAS_CONFIG}
        />
      )}

      {!selectedId && (
        <div className="absolute bottom-6 right-4 z-[999] text-right pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-bold text-[#7C3AED]/80 tracking-wider"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            藏传佛教文化祖师大图谱
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {patriarchs.length}位祖师 · 雪域法脉 · 密教传承
          </p>
        </div>
      )}
    </div>
  );
}
