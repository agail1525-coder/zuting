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

const INDIGENOUS_ATLAS_CONFIG: AtlasConfig = {
  religionKey: "indigenous",
  title: "原住民灵性大图谱",
  subtitle: "大地之声 · 万族传承",
  themeColor: "#78716C",
  backUrl: "/indigenous-spirits",
  detailUrlPrefix: "/indigenous-spirits",
  defaultCenter: [10, 20],
  defaultZoom: 2,
  filters: [
    { key: "all", name: "全部", color: "#78716C" },
    { key: "北美原住民", name: "北美", color: SCHOOL_COLORS["北美原住民"] },
    { key: "中美原住民", name: "中美", color: SCHOOL_COLORS["中美原住民"] },
    { key: "南美原住民", name: "南美", color: SCHOOL_COLORS["南美原住民"] },
    { key: "非洲传统", name: "非洲", color: SCHOOL_COLORS["非洲传统"] },
    { key: "大洋洲原住民", name: "大洋洲", color: SCHOOL_COLORS["大洋洲原住民"] },
  ],
  legendItems: [
    { name: "北美原住民", color: SCHOOL_COLORS["北美原住民"] },
    { name: "中美原住民", color: SCHOOL_COLORS["中美原住民"] },
    { name: "南美原住民", color: SCHOOL_COLORS["南美原住民"] },
    { name: "非洲传统", color: SCHOOL_COLORS["非洲传统"] },
    { name: "大洋洲原住民", color: SCHOOL_COLORS["大洋洲原住民"] },
  ],
  schoolColors: SCHOOL_COLORS,
  typeLabels: {
    birth: "诞生",
    ordination: "受命",
    dharma: "觉醒",
    teaching: "传承",
    founding: "创立",
    pilgrimage: "迁徙",
    exile: "抵抗",
    death: "归灵",
    other: "事件",
  },
  loadingText: "正在加载原住民灵性大图谱...",
};

const AtlasMapDynamic = createAtlasMapDynamic(INDIGENOUS_ATLAS_CONFIG);

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
        config={INDIGENOUS_ATLAS_CONFIG}
      />

      <AtlasFilterBar
        config={INDIGENOUS_ATLAS_CONFIG}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showLineage={showLineage}
        onToggleLineage={() => setShowLineage((v) => !v)}
      />

      {!selectedId && (
        <AtlasLegend
          title="全球原住民传统"
          items={INDIGENOUS_ATLAS_CONFIG.legendItems}
          themeColor={INDIGENOUS_ATLAS_CONFIG.themeColor}
        />
      )}

      {selectedPatriarch && (
        <AtlasSidePanel
          patriarch={selectedPatriarch}
          mapData={selectedMapData}
          activeWaypointIndex={activeWaypointIndex}
          onWaypointClick={handleWaypointClick}
          onClose={handleClose}
          config={INDIGENOUS_ATLAS_CONFIG}
        />
      )}

      {!selectedId && (
        <div className="absolute bottom-6 right-4 z-[999] text-right pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-bold text-[#78716C]/80 tracking-wider"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            原住民灵性大图谱
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {patriarchs.length}位先知 · 大地之声 · 万族传承
          </p>
        </div>
      )}
    </div>
  );
}
