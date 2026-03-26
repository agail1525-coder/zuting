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
            ? "bg-gold text-temple-900 font-semibold"
            : "bg-temple-800 text-temple-300 hover:bg-temple-700 border border-temple-600"
        }`}
      >
        {t("filter.all")}
      </button>
      {religions.map((r) => (
        <button
          key={r.id}
          onClick={() => onChange(r.id)}
          className={`px-4 py-2 rounded-full text-sm transition-all ${
            selectedId === r.id
              ? "bg-gold text-temple-900 font-semibold"
              : "bg-temple-800 text-temple-300 hover:bg-temple-700 border border-temple-600"
          }`}
        >
          {r.symbol && <span className="mr-1">{r.symbol}</span>}
          {r.name}
        </button>
      ))}
    </div>
  );
}
