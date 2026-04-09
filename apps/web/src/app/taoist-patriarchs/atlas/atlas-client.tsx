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

const TAOIST_TYPE_LABELS = {
  birth: "降世",
  ordination: "入道",
  dharma: "悟道",
  teaching: "弘道",
  founding: "开派",
  pilgrimage: "云游",
  exile: "隐修",
  death: "飞升",
  other: "事件",
} as const;

const TAOIST_ATLAS_CONFIG: AtlasConfig = {
  religionKey: "taoist",
  title: "道教文化先贤大图谱",
  subtitle: "仙踪道迹 · 洞天福地",
  themeColor: "#10B981",
  backUrl: "/taoist-patriarchs",
  detailUrlPrefix: "/taoist-patriarchs",
  defaultCenter: [33, 108],
  defaultZoom: 5,
  filters: [
    { key: "all", name: "全部", color: "#10B981" },
    { key: "道家", name: "道家", color: SCHOOL_COLORS["道家"] },
    { key: "天师道", name: "天师道", color: SCHOOL_COLORS["天师道"] },
    { key: "全真道", name: "全真道", color: SCHOOL_COLORS["全真道"] },
    { key: "正一道", name: "正一道", color: SCHOOL_COLORS["正一道"] },
  ],
  legendItems: [
    { name: "道家", color: SCHOOL_COLORS["道家"] },
    { name: "天师道", color: SCHOOL_COLORS["天师道"] },
    { name: "全真道", color: SCHOOL_COLORS["全真道"] },
    { name: "正一道", color: SCHOOL_COLORS["正一道"] },
  ],
  schoolColors: SCHOOL_COLORS,
  typeLabels: TAOIST_TYPE_LABELS,
  loadingText: "正在加载道教文化先贤大图谱...",
};

const AtlasMapDynamic = createAtlasMapDynamic(TAOIST_ATLAS_CONFIG);

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
        config={TAOIST_ATLAS_CONFIG}
      />

      <AtlasFilterBar
        config={TAOIST_ATLAS_CONFIG}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showLineage={showLineage}
        onToggleLineage={() => setShowLineage((v) => !v)}
      />

      {!selectedId && (
        <AtlasLegend
          title="道教文化法脉传承"
          items={TAOIST_ATLAS_CONFIG.legendItems}
          themeColor={TAOIST_ATLAS_CONFIG.themeColor}
        />
      )}

      {selectedPatriarch && (
        <AtlasSidePanel
          patriarch={selectedPatriarch}
          mapData={selectedMapData}
          activeWaypointIndex={activeWaypointIndex}
          onWaypointClick={handleWaypointClick}
          onClose={handleClose}
          config={TAOIST_ATLAS_CONFIG}
        />
      )}

      {!selectedId && (
        <div className="absolute bottom-6 right-4 z-[999] text-right pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-bold text-[#10B981]/80 tracking-wider"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            道教文化先贤大图谱
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {patriarchs.length}位先贤 · 仙踪道迹 · 洞天福地
          </p>
        </div>
      )}
    </div>
  );
}
