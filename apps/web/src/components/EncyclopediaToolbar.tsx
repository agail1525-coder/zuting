"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Religion } from "@/lib/api";

interface EncyclopediaToolbarProps {
  religions: Religion[];
  selectedReligionId: string | null;
  onReligionChange: (id: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortValue: string;
  onSortChange: (sort: string) => void;
  sortOptions: { value: string; label: string }[];
  resultCount: number;
  placeholder?: string;
}

export default function EncyclopediaToolbar({
  religions,
  selectedReligionId,
  onReligionChange,
  searchQuery,
  onSearchChange,
  sortValue,
  onSortChange,
  sortOptions,
  resultCount,
  placeholder = "搜索...",
}: EncyclopediaToolbarProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setLocalQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearchChange(value), 300);
    },
    [onSearchChange]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={localQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-colors"
          />
          {localQuery && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] cursor-pointer"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Result count */}
        <div className="flex items-center px-4 py-2.5 bg-[#0066FF]/5 text-[#0066FF] rounded-xl text-sm font-medium whitespace-nowrap">
          {resultCount} 条结果
        </div>
      </div>

      {/* Religion filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onReligionChange(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            !selectedReligionId
              ? "bg-[#0066FF] text-white border-[#0066FF]"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          全部
        </button>
        {religions.map((r) => (
          <button
            key={r.id}
            onClick={() => onReligionChange(r.id === selectedReligionId ? null : r.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              r.id === selectedReligionId
                ? "text-white border-transparent"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
            style={
              r.id === selectedReligionId
                ? { backgroundColor: r.color ?? "#0066FF", borderColor: r.color ?? "#0066FF" }
                : undefined
            }
          >
            {r.symbol} {r.name}
          </button>
        ))}
      </div>
    </div>
  );
}
