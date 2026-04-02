"use client";

import type { LegendItem } from "./atlas-types";

interface Props {
  title: string;
  items: LegendItem[];
  themeColor?: string;
}

export default function AtlasLegend({ title, items, themeColor = "#C4A265" }: Props) {
  return (
    <div
      className="absolute bottom-6 left-4 z-[1000] bg-[#0f172a]/90 backdrop-blur border rounded-lg p-3"
      style={{ borderColor: themeColor + "33" }}
    >
      <h4 className="text-xs font-bold mb-2" style={{ color: themeColor }}>
        {title}
      </h4>
      <div className="space-y-1">
        {items.map((item) => (
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
