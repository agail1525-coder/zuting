"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import WorldMapDynamic from "@/components/WorldMapDynamic";
import OptimizedImage from "@/components/OptimizedImage";
import type { Religion, HolySite } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";
import { useTranslation } from "@/lib/i18n";

interface Props {
  religions: Religion[];
  holySites: HolySite[];
  error?: boolean;
}

export default function MapClient({ religions, holySites, error }: Props) {
  const { t } = useTranslation();
  const [selectedReligions, setSelectedReligions] = useState<Set<string>>(
    new Set()
  );
  const [selectedSite, setSelectedSite] = useState<HolySite | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredSites = useMemo(() => {
    if (selectedReligions.size === 0) return holySites;
    return holySites.filter((s) => selectedReligions.has(s.religionId));
  }, [holySites, selectedReligions]);

  const toggleReligion = (id: string) => {
    setSelectedReligions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedReligions(new Set());

  const handleSiteClick = (site: HolySite) => {
    setSelectedSite(site);
    setSidebarOpen(true);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-serif font-bold text-[#0066FF] mb-4">
            {t("map.title")}
          </h1>
        </div>
        <DataLoadError />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 overflow-hidden bg-white/95 backdrop-blur-xl border-r border-gray-200 flex flex-col z-10`}
      >
        <div className="flex-1 overflow-y-auto p-5">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-serif font-bold text-[#0066FF] mb-1">
              {t("map.title")}
            </h1>
            <p className="text-gray-500 text-sm">
              {t("map.holySiteCount").replace("{filtered}", String(filteredSites.length)).replace("{total}", String(holySites.length))}
            </p>
          </div>

          {/* Religion filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                {t("map.filterByFaith")}
              </h3>
              <button
                onClick={selectAll}
                className="text-xs text-[#0066FF]/60 hover:text-[#0066FF] transition-colors"
              >
                {t("map.showAll")}
              </button>
            </div>
            <div className="space-y-1">
              {religions.map((r) => {
                const isActive =
                  selectedReligions.size === 0 || selectedReligions.has(r.id);
                const count = holySites.filter(
                  (s) => s.religionId === r.id
                ).length;
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleReligion(r.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                      isActive
                        ? "bg-[#0066FF]/10 text-gray-900"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{
                        backgroundColor: isActive
                          ? r.color || "#0066FF"
                          : "#CBD5E1",
                      }}
                    />
                    <span className="flex-1 text-sm truncate">
                      {r.symbol || ""} {r.name}
                    </span>
                    <span className="text-xs text-gray-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected site detail */}
          {selectedSite && (
            <div className="border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  {t("map.siteDetail")}
                </h3>
                <button
                  onClick={() => setSelectedSite(null)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  {t("map.close")}
                </button>
              </div>
              <div className="shadow-sm border border-gray-100 rounded-xl bg-white overflow-hidden">
                {selectedSite.imageUrl && (
                  <div className="relative h-32 w-full">
                    <OptimizedImage src={selectedSite.imageUrl} alt={selectedSite.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80" />
                  </div>
                )}
                <div className="p-4">
                <h4
                  className="text-lg font-serif font-bold mb-1"
                  style={{
                    color: selectedSite.religion?.color || "#0066FF",
                  }}
                >
                  {selectedSite.name}
                </h4>
                <p className="text-gray-500 text-sm mb-1">
                  {selectedSite.nameEn}
                </p>
                <p className="text-gray-400 text-xs mb-3">
                  {selectedSite.country}
                  {selectedSite.religion
                    ? ` · ${selectedSite.religion.name}`
                    : ""}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-3">
                  {selectedSite.description}
                </p>
                <div className="text-gray-400 text-xs mb-4">
                  {selectedSite.latitude?.toFixed(4)},{" "}
                  {selectedSite.longitude?.toFixed(4)}
                </div>
                <Link
                  href={`/holy-sites/${selectedSite.id}`}
                  className="inline-block px-4 py-2 text-sm border border-[#0066FF]/30 text-[#0066FF] rounded-full hover:bg-[#0066FF]/10 transition-all"
                >
                  {t("map.viewDetail")} &rarr;
                </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom link */}
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/holy-sites"
            className="block text-center px-4 py-2.5 bg-[#0066FF]/10 text-[#0066FF] rounded-lg hover:bg-[#0066FF]/20 transition-all text-sm font-medium"
          >
            {t("map.viewAllSites")}
          </Link>
        </div>
      </div>

      {/* Toggle sidebar button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 z-20 bg-white/90 backdrop-blur-sm border border-gray-200 text-[#0066FF] p-2 rounded-lg hover:bg-gray-50 transition-all"
        style={{ left: sidebarOpen ? "330px" : "12px" }}
      >
        <svg
          className={`w-5 h-5 transition-transform ${
            sidebarOpen ? "" : "rotate-180"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Map */}
      <div className="flex-1 relative">
        <WorldMapDynamic
          holySites={filteredSites}
          height="100%"
          selectedSiteId={selectedSite?.id}
          onSiteClick={handleSiteClick}
          interactive
        />
      </div>
    </div>
  );
}
