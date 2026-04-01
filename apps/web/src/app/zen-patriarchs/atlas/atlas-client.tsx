"use client";

import { useState, useMemo, useCallback } from "react";
import type { Patriarch } from "@/lib/api";
import { PATRIARCH_JOURNEYS } from "./patriarch-journeys";
import AtlasMapDynamic from "./components/AtlasMapDynamic";
import SchoolFilterBar from "./components/SchoolFilterBar";
import MapLegend from "./components/MapLegend";
import PatriarchSidePanel from "./components/PatriarchSidePanel";

interface Props {
  patriarchs: Patriarch[];
}

export default function AtlasClient({ patriarchs }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showLineage, setShowLineage] = useState(false);
  const [activeWaypointIndex, setActiveWaypointIndex] = useState<number | null>(null);

  // Build name → journey data map for O(1) lookups
  const journeyMap = useMemo(() => {
    const m = new Map<string, (typeof PATRIARCH_JOURNEYS)[number]>();
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
      {/* Full-screen map */}
      <AtlasMapDynamic
        patriarchs={patriarchs}
        journeyMap={journeyMap}
        selectedId={selectedId}
        activeFilter={activeFilter}
        showLineage={showLineage}
        activeWaypointIndex={activeWaypointIndex}
        onPatriarchClick={handlePatriarchClick}
      />

      {/* Floating filter bar */}
      <SchoolFilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showLineage={showLineage}
        onToggleLineage={() => setShowLineage((v) => !v)}
      />

      {/* Legend */}
      {!selectedId && <MapLegend />}

      {/* Side panel */}
      {selectedPatriarch && (
        <PatriarchSidePanel
          patriarch={selectedPatriarch}
          mapData={selectedMapData}
          activeWaypointIndex={activeWaypointIndex}
          onWaypointClick={handleWaypointClick}
          onClose={handleClose}
        />
      )}

      {/* Title overlay */}
      {!selectedId && (
        <div className="absolute bottom-6 right-4 z-[999] text-right pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-bold text-[#C4A265]/80 tracking-wider"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            禅宗祖师大图谱
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {patriarchs.length}位祖师 · 五家七宗 · 千年法脉
          </p>
        </div>
      )}
    </div>
  );
}
