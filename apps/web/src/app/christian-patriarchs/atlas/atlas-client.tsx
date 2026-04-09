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

const CHRISTIAN_TYPE_LABELS = {
  birth: "诞生",
  ordination: "受洗",
  dharma: "蒙召",
  teaching: "传道",
  founding: "建堂",
  pilgrimage: "文化之旅",
  exile: "流放",
  death: "殉道",
  other: "事件",
} as const;

const CHRISTIAN_ATLAS_CONFIG: AtlasConfig = {
  religionKey: "christian",
  title: "基督教文化先贤大图谱",
  subtitle: "使徒足迹 · 福音传承",
  themeColor: "#3B82F6",
  backUrl: "/christian-patriarchs",
  detailUrlPrefix: "/christian-patriarchs",
  defaultCenter: [35, 35],
  defaultZoom: 4,
  filters: [
    { key: "all", name: "全部", color: "#3B82F6" },
    { key: "天主教", name: "天主教", color: SCHOOL_COLORS["天主教"] },
    { key: "东正教", name: "东正教", color: SCHOOL_COLORS["东正教"] },
    { key: "新教", name: "新教", color: SCHOOL_COLORS["新教"] },
    { key: "早期教会", name: "早期教会", color: SCHOOL_COLORS["早期教会"] },
  ],
  legendItems: [
    { name: "天主教", color: SCHOOL_COLORS["天主教"] },
    { name: "东正教", color: SCHOOL_COLORS["东正教"] },
    { name: "新教", color: SCHOOL_COLORS["新教"] },
    { name: "早期教会", color: SCHOOL_COLORS["早期教会"] },
  ],
  schoolColors: SCHOOL_COLORS,
  typeLabels: CHRISTIAN_TYPE_LABELS,
  loadingText: "正在加载基督教文化先贤大图谱...",
};

const AtlasMapDynamic = createAtlasMapDynamic(CHRISTIAN_ATLAS_CONFIG);

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
        config={CHRISTIAN_ATLAS_CONFIG}
      />

      <AtlasFilterBar
        config={CHRISTIAN_ATLAS_CONFIG}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showLineage={showLineage}
        onToggleLineage={() => setShowLineage((v) => !v)}
      />

      {!selectedId && (
        <AtlasLegend
          title="基督教文化教派传承"
          items={CHRISTIAN_ATLAS_CONFIG.legendItems}
          themeColor={CHRISTIAN_ATLAS_CONFIG.themeColor}
        />
      )}

      {selectedPatriarch && (
        <AtlasSidePanel
          patriarch={selectedPatriarch}
          mapData={selectedMapData}
          activeWaypointIndex={activeWaypointIndex}
          onWaypointClick={handleWaypointClick}
          onClose={handleClose}
          config={CHRISTIAN_ATLAS_CONFIG}
        />
      )}

      {!selectedId && (
        <div className="absolute bottom-6 right-4 z-[999] text-right pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-bold text-[#3B82F6]/80 tracking-wider"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            基督教文化先贤大图谱
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {patriarchs.length}位先贤 · 使徒足迹 · 福音传承
          </p>
        </div>
      )}
    </div>
  );
}
