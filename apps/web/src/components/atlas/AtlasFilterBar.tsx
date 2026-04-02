"use client";

import Link from "next/link";
import type { AtlasConfig } from "./atlas-types";

interface Props {
  config: AtlasConfig;
  activeFilter: string;
  onFilterChange: (key: string) => void;
  showLineage: boolean;
  onToggleLineage: () => void;
}

export default function AtlasFilterBar({
  config,
  activeFilter,
  onFilterChange,
  showLineage,
  onToggleLineage,
}: Props) {
  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center gap-2 flex-wrap">
      <Link
        href={config.backUrl}
        className="px-3 py-2 bg-[#0f172a]/90 backdrop-blur border rounded-lg text-sm hover:bg-[#1e293b] transition-colors flex-shrink-0"
        style={{ borderColor: config.themeColor + "33", color: config.themeColor }}
      >
        ← 返回
      </Link>

      <div
        className="flex items-center gap-1 bg-[#0f172a]/90 backdrop-blur border rounded-lg px-2 py-1 overflow-x-auto flex-shrink-0"
        style={{ borderColor: config.themeColor + "33" }}
      >
        {config.filters.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap"
            style={{
              background: activeFilter === f.key ? f.color + "33" : "transparent",
              color: activeFilter === f.key ? f.color : "#94a3b8",
              border: activeFilter === f.key ? `1px solid ${f.color}55` : "1px solid transparent",
            }}
          >
            {f.name}
          </button>
        ))}
      </div>

      <button
        onClick={onToggleLineage}
        className="px-3 py-2 bg-[#0f172a]/90 backdrop-blur border rounded-lg text-xs transition-colors flex-shrink-0"
        style={{
          color: showLineage ? config.themeColor : "#64748b",
          borderColor: showLineage ? config.themeColor + "55" : config.themeColor + "33",
        }}
      >
        ⛓ 师承
      </button>
    </div>
  );
}
