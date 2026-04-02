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

const CONFUCIAN_TYPE_LABELS = {
  birth: "诞生",
  ordination: "入学",
  dharma: "悟道",
  teaching: "讲学",
  founding: "立说",
  pilgrimage: "游历",
  exile: "贬谪",
  death: "辞世",
  other: "事件",
} as const;

const CONFUCIAN_ATLAS_CONFIG: AtlasConfig = {
  religionKey: "confucian",
  title: "儒教先贤大图谱",
  subtitle: "圣贤之道 · 书院薪传",
  themeColor: "#DC2626",
  backUrl: "/confucian-patriarchs",
  detailUrlPrefix: "/confucian-patriarchs",
  defaultCenter: [32, 117],
  defaultZoom: 5,
  filters: [
    { key: "all", name: "全部", color: "#DC2626" },
    { key: "先秦儒学", name: "先秦儒学", color: SCHOOL_COLORS["先秦儒学"] },
    { key: "宋明理学", name: "宋明理学", color: SCHOOL_COLORS["宋明理学"] },
    { key: "心学", name: "心学", color: SCHOOL_COLORS["心学"] },
    { key: "当代新儒学", name: "当代新儒学", color: SCHOOL_COLORS["当代新儒学"] },
  ],
  legendItems: [
    { name: "先秦儒学", color: SCHOOL_COLORS["先秦儒学"] },
    { name: "汉唐经学", color: SCHOOL_COLORS["汉唐经学"] },
    { name: "宋明理学", color: SCHOOL_COLORS["宋明理学"] },
    { name: "心学", color: SCHOOL_COLORS["心学"] },
  ],
  schoolColors: SCHOOL_COLORS,
  typeLabels: CONFUCIAN_TYPE_LABELS,
  loadingText: "正在加载儒教先贤大图谱...",
};

const AtlasMapDynamic = createAtlasMapDynamic(CONFUCIAN_ATLAS_CONFIG);

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
        config={CONFUCIAN_ATLAS_CONFIG}
      />

      <AtlasFilterBar
        config={CONFUCIAN_ATLAS_CONFIG}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showLineage={showLineage}
        onToggleLineage={() => setShowLineage((v) => !v)}
      />

      {!selectedId && (
        <AtlasLegend
          title="儒学学派传承"
          items={CONFUCIAN_ATLAS_CONFIG.legendItems}
          themeColor={CONFUCIAN_ATLAS_CONFIG.themeColor}
        />
      )}

      {selectedPatriarch && (
        <AtlasSidePanel
          patriarch={selectedPatriarch}
          mapData={selectedMapData}
          activeWaypointIndex={activeWaypointIndex}
          onWaypointClick={handleWaypointClick}
          onClose={handleClose}
          config={CONFUCIAN_ATLAS_CONFIG}
        />
      )}

      {!selectedId && (
        <div className="absolute bottom-6 right-4 z-[999] text-right pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-bold text-[#DC2626]/80 tracking-wider"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            儒教先贤大图谱
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {patriarchs.length}位先贤 · 圣贤之道 · 书院薪传
          </p>
        </div>
      )}
    </div>
  );
}
