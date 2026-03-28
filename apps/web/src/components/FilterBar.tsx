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
            ? "bg-gold text-temple-900 font-semibold shadow-lg shadow-gold/20"
            : "bg-temple-800/60 text-temple-300 hover:bg-temple-700/60 border border-temple-600/50"
        }`}
      >
        {t("filter.all")}
      </button>
      {religions.map((r) => {
        const isActive = selectedId === r.id;
        const color = r.color ?? "#D4A855";
        return (
          <button
            key={r.id}
            onClick={() => onChange(r.id)}
            className={`px-4 py-2 rounded-full text-sm transition-all inline-flex items-center gap-1.5 ${
              isActive
                ? "font-semibold shadow-lg border"
                : "bg-temple-800/60 text-temple-300 hover:bg-temple-700/60 border border-temple-600/50"
            }`}
            style={isActive ? {
              backgroundColor: `${color}25`,
              color: color,
              borderColor: `${color}50`,
              boxShadow: `0 4px 14px ${color}15`,
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
