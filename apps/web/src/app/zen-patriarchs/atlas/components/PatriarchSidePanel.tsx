"use client";

import Link from "next/link";
import type { Patriarch } from "@/lib/api";
import type { PatriarchMapData } from "../patriarch-journeys";
import { getSchoolColor } from "../patriarch-journeys";
import JourneyTimeline from "./JourneyTimeline";

interface Props {
  patriarch: Patriarch;
  mapData: PatriarchMapData | null;
  activeWaypointIndex: number | null;
  onWaypointClick: (index: number) => void;
  onClose: () => void;
}

export default function PatriarchSidePanel({
  patriarch,
  mapData,
  activeWaypointIndex,
  onWaypointClick,
  onClose,
}: Props) {
  const color = getSchoolColor(patriarch.school ?? "");
  const waypoints = mapData?.journeyWaypoints ?? [];

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[1001] md:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed z-[1002] bg-[#0f172a]/95 backdrop-blur-lg border-l border-[#C4A265]/20 overflow-y-auto
        md:top-0 md:right-0 md:w-[400px] md:h-full
        bottom-0 left-0 right-0 max-h-[70vh] md:max-h-none rounded-t-2xl md:rounded-none
        animate-in slide-in-from-bottom md:slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0f172a]/95 backdrop-blur-lg z-10 p-4 border-b border-[#C4A265]/10">
          {/* Mobile drag handle */}
          <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-3 md:hidden" />

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-100">
                {patriarch.name}
              </h2>
              <p className="text-sm text-slate-400">{patriarch.nameEn}</p>
              <div className="flex items-center gap-2 mt-1.5">
                {patriarch.dates && (
                  <span className="text-xs text-slate-500">
                    {patriarch.dates}
                  </span>
                )}
                {patriarch.school && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full border"
                    style={{
                      color,
                      borderColor: color + "44",
                      backgroundColor: color + "11",
                    }}
                  >
                    {patriarch.school}
                  </span>
                )}
                {patriarch.generation != null && (
                  <span className="text-[10px] text-slate-500">
                    第{patriarch.generation}代
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-[#C4A265] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Title & Core Teaching */}
        {patriarch.title && (
          <div className="px-4 pt-3">
            <p className="text-sm text-[#C4A265] font-medium">
              {patriarch.title}
            </p>
          </div>
        )}

        {patriarch.coreTeaching && (
          <div className="px-4 pt-3">
            <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">
              核心教义
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
              {patriarch.coreTeaching}
            </p>
          </div>
        )}

        {/* Journey Timeline */}
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-3">
            {waypoints.length > 0 ? "修行轨迹" : "修行轨迹"}
          </h3>
          <JourneyTimeline
            waypoints={waypoints}
            activeIndex={activeWaypointIndex}
            onWaypointClick={onWaypointClick}
          />
        </div>

        {/* Teacher & Disciples */}
        {(patriarch.teacher || (patriarch.disciples && patriarch.disciples.length > 0)) && (
          <div className="px-4 pt-3 pb-2 border-t border-[#C4A265]/10">
            <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-2">
              师承法脉
            </h3>
            {patriarch.teacher && (
              <div className="mb-2">
                <span className="text-[10px] text-slate-600">师承: </span>
                <Link
                  href={`/zen-patriarchs/${patriarch.teacher.id}`}
                  className="text-xs text-[#C4A265] hover:underline"
                >
                  {patriarch.teacher.name}
                </Link>
              </div>
            )}
            {patriarch.disciples && patriarch.disciples.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-600">弟子: </span>
                <span className="text-xs text-slate-400">
                  {patriarch.disciples.map((d, i) => (
                    <span key={d.id}>
                      {i > 0 && "、"}
                      <Link
                        href={`/zen-patriarchs/${d.id}`}
                        className="text-[#C4A265]/80 hover:text-[#C4A265] hover:underline"
                      >
                        {d.name}
                      </Link>
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="px-4 py-4 border-t border-[#C4A265]/10">
          <Link
            href={`/zen-patriarchs/${patriarch.id}`}
            className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: color + "22",
              color,
              border: `1px solid ${color}44`,
            }}
          >
            查看详情 →
          </Link>
        </div>
      </div>
    </>
  );
}
