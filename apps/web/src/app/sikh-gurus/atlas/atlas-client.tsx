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

const SIKH_ATLAS_CONFIG: AtlasConfig = {
  religionKey: "sikh",
  title: "锡克教古鲁大图谱",
  subtitle: "十大古鲁 · 卡尔萨 · 信仰之路",
  themeColor: "#EA580C",
  backUrl: "/sikh-gurus",
  detailUrlPrefix: "/sikh-gurus",
  defaultCenter: [31, 75],
  defaultZoom: 5,
  filters: [
    { key: "all", name: "全部", color: "#EA580C" },
    { key: "十大古鲁", name: "十大古鲁", color: SCHOOL_COLORS["十大古鲁"] },
    { key: "殉道者", name: "殉道者", color: SCHOOL_COLORS["殉道者"] },
    { key: "圣徒", name: "圣徒", color: SCHOOL_COLORS["圣徒"] },
  ],
  legendItems: [
    { name: "十大古鲁", color: SCHOOL_COLORS["十大古鲁"] },
    { name: "殉道者", color: SCHOOL_COLORS["殉道者"] },
    { name: "圣徒", color: SCHOOL_COLORS["圣徒"] },
    { name: "近现代", color: SCHOOL_COLORS["近现代"] },
  ],
  schoolColors: SCHOOL_COLORS,
  typeLabels: {
    birth: "诞生",
    ordination: "受戒",
    dharma: "感悟",
    teaching: "弘道",
    founding: "建寺",
    pilgrimage: "朝圣",
    exile: "殉道",
    death: "升天",
    other: "事件",
  },
  loadingText: "正在加载锡克教古鲁大图谱...",
};

const AtlasMapDynamic = createAtlasMapDynamic(SIKH_ATLAS_CONFIG);

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
        config={SIKH_ATLAS_CONFIG}
      />

      <AtlasFilterBar
        config={SIKH_ATLAS_CONFIG}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showLineage={showLineage}
        onToggleLineage={() => setShowLineage((v) => !v)}
      />

      {!selectedId && (
        <AtlasLegend
          title="锡克教主要类别"
          items={SIKH_ATLAS_CONFIG.legendItems}
          themeColor={SIKH_ATLAS_CONFIG.themeColor}
        />
      )}

      {selectedPatriarch && (
        <AtlasSidePanel
          patriarch={selectedPatriarch}
          mapData={selectedMapData}
          activeWaypointIndex={activeWaypointIndex}
          onWaypointClick={handleWaypointClick}
          onClose={handleClose}
          config={SIKH_ATLAS_CONFIG}
        />
      )}

      {!selectedId && (
        <div className="absolute bottom-6 right-4 z-[999] text-right pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-bold text-[#EA580C]/80 tracking-wider"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            锡克教古鲁大图谱
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {patriarchs.length}位古鲁 · 十大古鲁 · 卡尔萨 · 信仰之路
          </p>
        </div>
      )}
    </div>
  );
}
