"use client";

import Link from "next/link";
import { SCHOOL_COLORS } from "../patriarch-journeys";

interface SchoolFilter {
  key: string;
  name: string;
  color: string;
}

const FILTERS: SchoolFilter[] = [
  { key: "all", name: "全部", color: "#C4A265" },
  { key: "曹洞宗", name: "曹洞", color: SCHOOL_COLORS["曹洞宗"] },
  { key: "临济宗", name: "临济", color: SCHOOL_COLORS["临济宗"] },
  { key: "云门宗", name: "云门", color: SCHOOL_COLORS["云门宗"] },
  { key: "法眼宗", name: "法眼", color: SCHOOL_COLORS["法眼宗"] },
  { key: "沩仰宗", name: "沩仰", color: SCHOOL_COLORS["沩仰宗"] },
  { key: "overseas", name: "海外", color: "#FF6B8A" },
];

const OVERSEAS_SCHOOLS = ["日本曹洞宗", "日本临济宗", "韩国禅宗", "越南禅宗", "西方禅宗"];

interface Props {
  activeFilter: string;
  onFilterChange: (key: string) => void;
  showLineage: boolean;
  onToggleLineage: () => void;
}

export default function SchoolFilterBar({
  activeFilter,
  onFilterChange,
  showLineage,
  onToggleLineage,
}: Props) {
  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center gap-2 flex-wrap">
      <Link
        href="/zen-patriarchs"
        className="px-3 py-2 bg-[#0f172a]/90 backdrop-blur border border-[#C4A265]/20 rounded-lg text-[#C4A265] text-sm hover:bg-[#1e293b] transition-colors flex-shrink-0"
      >
        ← 返回
      </Link>

      <div className="flex items-center gap-1 bg-[#0f172a]/90 backdrop-blur border border-[#C4A265]/20 rounded-lg px-2 py-1 overflow-x-auto flex-shrink-0">
        {FILTERS.map((f) => (
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
        className="px-3 py-2 bg-[#0f172a]/90 backdrop-blur border border-[#C4A265]/20 rounded-lg text-xs transition-colors flex-shrink-0"
        style={{
          color: showLineage ? "#C4A265" : "#64748b",
          borderColor: showLineage ? "#C4A26555" : undefined,
        }}
      >
        {showLineage ? "⛓ 师承" : "⛓ 师承"}
      </button>
    </div>
  );
}

export { OVERSEAS_SCHOOLS };
