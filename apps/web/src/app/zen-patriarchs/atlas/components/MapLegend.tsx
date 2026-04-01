"use client";

import { SCHOOL_COLORS } from "../patriarch-journeys";

const LEGEND_ITEMS = [
  { name: "曹洞宗", color: SCHOOL_COLORS["曹洞宗"] },
  { name: "临济宗", color: SCHOOL_COLORS["临济宗"] },
  { name: "云门宗", color: SCHOOL_COLORS["云门宗"] },
  { name: "法眼宗", color: SCHOOL_COLORS["法眼宗"] },
  { name: "沩仰宗", color: SCHOOL_COLORS["沩仰宗"] },
  { name: "日本禅", color: "#FF6B8A" },
  { name: "韩国禅", color: "#4ECDC4" },
  { name: "越南禅", color: "#FFD93D" },
  { name: "西方禅", color: "#9B59B6" },
];

export default function MapLegend() {
  return (
    <div className="absolute bottom-6 left-4 z-[1000] bg-[#0f172a]/90 backdrop-blur border border-[#C4A265]/20 rounded-lg p-3">
      <h4 className="text-[#C4A265] text-xs font-bold mb-2">禅宗五家七宗</h4>
      <div className="space-y-1">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[10px] text-slate-400">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
