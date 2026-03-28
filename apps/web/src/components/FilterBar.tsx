"use client";

import { useTranslation } from "@/lib/i18n";
import type { Religion } from "@/lib/api";

interface FilterBarProps {
  religions: Religion[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
}

export default function FilterBar({ religions, selectedId, onChange }: FilterBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-2 rounded-full text-sm transition-all ${
          selectedId === null
            ? "bg-[#0066FF] text-white font-semibold shadow-lg shadow-blue-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
        }`}
      >
        {t("filter.all")}
      </button>
      {religions.map((r) => {
        const isActive = selectedId === r.id;
        const color = r.color ?? "#0066FF";
        return (
          <button
            key={r.id}
            onClick={() => onChange(r.id)}
            className={`px-4 py-2 rounded-full text-sm transition-all inline-flex items-center gap-1.5 ${
              isActive
                ? "font-semibold shadow-md border"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
            }`}
            style={isActive ? {
              backgroundColor: `${color}15`,
              color: color,
              borderColor: `${color}40`,
              boxShadow: `0 4px 14px ${color}20`,
            } : undefined}
          >
            {r.symbol && <span>{r.symbol}</span>}
            {r.name}
          </button>
        );
      })}
    </div>
  );
}
