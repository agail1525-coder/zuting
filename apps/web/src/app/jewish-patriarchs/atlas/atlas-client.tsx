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

const JEWISH_ATLAS_CONFIG: AtlasConfig = {
  religionKey: "jewish",
  title: "犹太教先知大图谱",
  subtitle: "圣约 · 律法 · 流散",
  themeColor: "#6366F1",
  backUrl: "/jewish-patriarchs",
  detailUrlPrefix: "/jewish-patriarchs",
  defaultCenter: [31, 35],
  defaultZoom: 5,
  filters: [
    { key: "all", name: "全部", color: "#6366F1" },
    { key: "圣经时代", name: "圣经时代", color: SCHOOL_COLORS["圣经时代"] },
    { key: "拉比时代", name: "拉比时代", color: SCHOOL_COLORS["拉比时代"] },
    { key: "中世纪", name: "中世纪", color: SCHOOL_COLORS["中世纪"] },
    { key: "哈西德派", name: "哈西德派", color: SCHOOL_COLORS["哈西德派"] },
  ],
  legendItems: [
    { name: "圣经时代", color: SCHOOL_COLORS["圣经时代"] },
    { name: "拉比时代", color: SCHOOL_COLORS["拉比时代"] },
    { name: "中世纪", color: SCHOOL_COLORS["中世纪"] },
    { name: "哈西德派", color: SCHOOL_COLORS["哈西德派"] },
    { name: "现代", color: SCHOOL_COLORS["现代正统"] },
  ],
  schoolColors: SCHOOL_COLORS,
  typeLabels: {
    birth: "诞生",
    ordination: "受膏",
    dharma: "蒙召",
    teaching: "训诫",
    founding: "立约",
    pilgrimage: "流散",
    exile: "流放",
    death: "安息",
    other: "事件",
  },
  loadingText: "正在加载犹太教先知大图谱...",
};

const AtlasMapDynamic = createAtlasMapDynamic(JEWISH_ATLAS_CONFIG);

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
        config={JEWISH_ATLAS_CONFIG}
      />

      <AtlasFilterBar
        config={JEWISH_ATLAS_CONFIG}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showLineage={showLineage}
        onToggleLineage={() => setShowLineage((v) => !v)}
      />

      {!selectedId && (
        <AtlasLegend
          title="犹太教历史时期"
          items={JEWISH_ATLAS_CONFIG.legendItems}
          themeColor={JEWISH_ATLAS_CONFIG.themeColor}
        />
      )}

      {selectedPatriarch && (
        <AtlasSidePanel
          patriarch={selectedPatriarch}
          mapData={selectedMapData}
          activeWaypointIndex={activeWaypointIndex}
          onWaypointClick={handleWaypointClick}
          onClose={handleClose}
          config={JEWISH_ATLAS_CONFIG}
        />
      )}

      {!selectedId && (
        <div className="absolute bottom-6 right-4 z-[999] text-right pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-bold text-[#6366F1]/80 tracking-wider"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            犹太教先知大图谱
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {patriarchs.length}位先知 · 圣约 · 律法 · 流散
          </p>
        </div>
      )}
    </div>
  );
}
