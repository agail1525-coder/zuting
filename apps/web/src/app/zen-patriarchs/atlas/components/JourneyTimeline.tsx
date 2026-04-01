"use client";

import type { JourneyWaypoint, WaypointType } from "../patriarch-journeys";

const TYPE_COLORS: Record<WaypointType, string> = {
  birth: "#22c55e",
  ordination: "#3b82f6",
  dharma: "#eab308",
  teaching: "#C4A265",
  founding: "#C4A265",
  pilgrimage: "#a855f7",
  exile: "#64748b",
  death: "#6b7280",
  other: "#94a3b8",
};

const TYPE_LABELS: Record<WaypointType, string> = {
  birth: "出生",
  ordination: "剃度",
  dharma: "得法",
  teaching: "弘法",
  founding: "开山",
  pilgrimage: "行脚",
  exile: "隐修",
  death: "圆寂",
  other: "事件",
};

interface Props {
  waypoints: JourneyWaypoint[];
  activeIndex: number | null;
  onWaypointClick: (index: number) => void;
}

export default function JourneyTimeline({
  waypoints,
  activeIndex,
  onWaypointClick,
}: Props) {
  if (waypoints.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        <p className="mb-1">轨迹数据待补充</p>
        <p className="text-xs text-slate-600">未来将逐步完善每位祖师的修行路线</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[#C4A265]/20" />

      <div className="space-y-4">
        {waypoints.map((wp, idx) => {
          const isActive = activeIndex === idx;
          const color = TYPE_COLORS[wp.type];
          const yearStr = wp.year
            ? wp.yearEnd
              ? `${wp.year}-${wp.yearEnd}`
              : `${wp.year}`
            : "年代不详";

          return (
            <button
              key={idx}
              onClick={() => onWaypointClick(idx)}
              className={`relative flex items-start gap-3 text-left w-full group transition-all rounded-lg px-2 py-1.5 -ml-2 ${
                isActive
                  ? "bg-white/5"
                  : "hover:bg-white/3"
              }`}
            >
              {/* Node circle */}
              <div
                className={`relative z-10 w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all ${
                  isActive ? "scale-125" : "group-hover:scale-110"
                }`}
                style={{
                  borderColor: color,
                  backgroundColor: isActive ? color : color + "33",
                  boxShadow: isActive ? `0 0 12px ${color}44` : undefined,
                }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-xs font-bold"
                    style={{ color }}
                  >
                    {yearStr}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full border"
                    style={{
                      color,
                      borderColor: color + "44",
                      backgroundColor: color + "11",
                    }}
                  >
                    {TYPE_LABELS[wp.type]}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${
                  isActive ? "text-slate-200" : "text-slate-400"
                }`}>
                  {wp.event}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
