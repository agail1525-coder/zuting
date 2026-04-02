"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import WorldMapDynamic from "@/components/WorldMapDynamic";
import OptimizedImage from "@/components/OptimizedImage";
import type { Religion, HolySite, Temple } from "@/lib/api";
import DataLoadError from "@/components/DataLoadError";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";

type MapMarker = {
  id: string;
  name: string;
  nameEn: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  imageUrl: string | null;
  religionId: string;
  religion?: Religion;
  type: "site" | "temple";
};

type ViewMode = "map" | "list";
type LayerType = "sites" | "temples" | "all";

interface Props {
  religions: Religion[];
  holySites: HolySite[];
  temples: Temple[];
  error?: boolean;
}

export default function MapClient({ religions, holySites, temples, error }: Props) {
  const { t } = useTranslation();
  const [selectedReligions, setSelectedReligions] = useState<Set<string>>(new Set());
  const [selectedSite, setSelectedSite] = useState<HolySite | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [activeLayer, setActiveLayer] = useState<LayerType>("all");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  // Combine holy sites and temples as map markers
  const allMarkers = useMemo(() => {
    const siteMarkers: MapMarker[] = holySites.map((s) => ({ ...s, type: "site" as const }));
    const templeMarkers: MapMarker[] = temples.map((t) => ({
      id: t.id,
      name: t.name,
      nameEn: t.nameEn,
      country: t.country,
      latitude: t.latitude,
      longitude: t.longitude,
      description: t.description,
      imageUrl: t.imageUrl,
      religionId: t.religionId,
      religion: t.religion,
      type: "temple" as const,
    }));
    return [...siteMarkers, ...templeMarkers];
  }, [holySites, temples]);

  // Stats
  const stats = useMemo(() => {
    const countries = new Set([
      ...holySites.map((s) => s.country),
      ...temples.map((t) => t.country),
    ]);
    return {
      sites: holySites.length,
      temples: temples.length,
      countries: countries.size,
      traditions: religions.length,
    };
  }, [holySites, temples, religions]);

  // Filter by religion + layer + search
  const filteredSites = useMemo(() => {
    let result = holySites as HolySite[];
    if (activeLayer === "temples") return [];
    if (selectedReligions.size > 0) {
      result = result.filter((s) => selectedReligions.has(s.religionId));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.nameEn && s.nameEn.toLowerCase().includes(q)) ||
          s.country.toLowerCase().includes(q)
      );
    }
    return result;
  }, [holySites, selectedReligions, searchQuery, activeLayer]);

  // For list view: combined and filtered
  const filteredAll = useMemo(() => {
    let result = allMarkers;
    if (activeLayer === "sites") result = result.filter((m) => m.type === "site");
    if (activeLayer === "temples") result = result.filter((m) => m.type === "temple");
    if (selectedReligions.size > 0) {
      result = result.filter((m) => selectedReligions.has(m.religionId));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.nameEn && m.nameEn.toLowerCase().includes(q)) ||
          m.country.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allMarkers, selectedReligions, searchQuery, activeLayer]);

  const toggleReligion = useCallback((id: string) => {
    setSelectedReligions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = () => setSelectedReligions(new Set());

  const handleSiteClick = useCallback((site: HolySite) => {
    setSelectedSite(site);
    setSidebarOpen(true);
    setMobileDetailOpen(true);
  }, []);

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
    <div className="fixed inset-0 top-16 flex flex-col">
      {/* Top Stats & Controls Bar */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200 px-4 py-2 flex items-center gap-3 z-20 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("map.searchPlaceholder")}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]/50"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {/* Layer Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs">
          {(["all", "sites", "temples"] as LayerType[]).map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-3 py-1 rounded-md transition-all ${
                activeLayer === layer
                  ? "bg-white text-[#0066FF] shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {layer === "all" ? t("map.layerAll") : layer === "sites" ? t("map.layerSites") : t("map.layerTemples")}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("map")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "map" ? "bg-white shadow-sm text-[#0066FF]" : "text-gray-400"}`}
            title={t("map.viewMap")}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-[#0066FF]" : "text-gray-400"}`}
            title={t("map.viewList")}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </button>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 ml-auto">
          <span><strong className="text-gray-900">{stats.sites}</strong> {t("map.statSites")}</span>
          <span><strong className="text-gray-900">{stats.temples}</strong> {t("map.statTemples")}</span>
          <span><strong className="text-gray-900">{stats.countries}</strong> {t("map.statCountries")}</span>
          <span><strong className="text-gray-900">{stats.traditions}</strong> {t("map.statTraditions")}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {viewMode === "map" ? (
          <>
            {/* Sidebar - Desktop */}
            <div
              className={`hidden md:flex ${
                sidebarOpen ? "w-80" : "w-0"
              } transition-all duration-300 overflow-hidden bg-white/95 backdrop-blur-xl border-r border-gray-200 flex-col z-10`}
            >
              <div className="flex-1 overflow-y-auto p-5">
                {/* Header */}
                <div className="mb-5">
                  <h1 className="text-xl font-serif font-bold text-[#0066FF] mb-1">
                    {t("map.title")}
                  </h1>
                  <p className="text-gray-500 text-sm">
                    {t("map.holySiteCount")
                      .replace("{filtered}", String(filteredSites.length + (activeLayer !== "sites" ? temples.filter((tt) => selectedReligions.size === 0 || selectedReligions.has(tt.religionId)).length : 0)))
                      .replace("{total}", String(holySites.length + temples.length))}
                  </p>
                </div>

                {/* Religion filters */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("map.filterByFaith")}
                    </h3>
                    <button onClick={selectAll} className="text-xs text-[#0066FF]/60 hover:text-[#0066FF] transition-colors">
                      {t("map.showAll")}
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    {religions.map((r) => {
                      const isActive = selectedReligions.size === 0 || selectedReligions.has(r.id);
                      const siteCount = holySites.filter((s) => s.religionId === r.id).length;
                      const templeCount = temples.filter((tt) => tt.religionId === r.id).length;
                      return (
                        <button
                          key={r.id}
                          onClick={() => toggleReligion(r.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left transition-all ${
                            isActive ? "bg-[#0066FF]/8 text-gray-900" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: isActive ? r.color || "#0066FF" : "#CBD5E1" }} />
                          <span className="flex-1 text-sm truncate">{r.symbol || ""} {r.name}</span>
                          <span className="text-xs text-gray-400">{siteCount + templeCount}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected site detail */}
                {selectedSite && <SiteDetailCard site={selectedSite} t={t} onClose={() => setSelectedSite(null)} />}
              </div>

              {/* Bottom links */}
              <div className="p-3 border-t border-gray-200 space-y-2">
                <Link href="/holy-sites" className="block text-center px-4 py-2 bg-[#0066FF]/10 text-[#0066FF] rounded-lg hover:bg-[#0066FF]/20 transition-all text-sm font-medium">
                  {t("map.viewAllSites")}
                </Link>
                <Link href="/temples" className="block text-center px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-all text-sm font-medium">
                  {t("map.viewAllTemples")}
                </Link>
              </div>
            </div>

            {/* Toggle sidebar button - Desktop */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:block absolute top-3 z-20 bg-white/90 backdrop-blur-sm border border-gray-200 text-[#0066FF] p-2 rounded-lg hover:bg-gray-50 transition-all"
              style={{ left: sidebarOpen ? "330px" : "12px" }}
            >
              <svg className={`w-4 h-4 transition-transform ${sidebarOpen ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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

              {/* Mobile Stats Pill */}
              <div className="md:hidden absolute top-3 left-3 right-3 flex justify-center z-10">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs text-gray-600 shadow-sm border border-gray-200 flex gap-3">
                  <span><strong>{stats.sites}</strong> {t("map.statSites")}</span>
                  <span><strong>{stats.temples}</strong> {t("map.statTemples")}</span>
                  <span><strong>{stats.countries}</strong> {t("map.statCountries")}</span>
                </div>
              </div>
            </div>

            {/* Mobile Bottom Sheet */}
            {selectedSite && mobileDetailOpen && (
              <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 animate-slide-up">
                <div className="bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 max-h-[60vh] overflow-y-auto">
                  <div className="flex justify-center pt-2 pb-1">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                  </div>
                  <div className="px-4 pb-4">
                    <SiteDetailCard site={selectedSite} t={t} onClose={() => { setSelectedSite(null); setMobileDetailOpen(false); }} />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* List View */
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-5xl mx-auto p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif font-bold text-gray-900">
                  {filteredAll.length} {t("map.results")}
                </h2>
                {/* Religion pills for list view */}
                <div className="hidden sm:flex gap-1 flex-wrap">
                  {religions.slice(0, 6).map((r) => {
                    const isActive = selectedReligions.size === 0 || selectedReligions.has(r.id);
                    return (
                      <button
                        key={r.id}
                        onClick={() => toggleReligion(r.id)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-all border ${
                          isActive
                            ? "border-current text-gray-900 font-medium"
                            : "border-gray-200 text-gray-400"
                        }`}
                        style={isActive ? { borderColor: r.color || "#0066FF", color: r.color || "#0066FF" } : undefined}
                      >
                        {r.symbol} {r.name}
                      </button>
                    );
                  })}
                  {religions.length > 6 && (
                    <button onClick={selectAll} className="px-2.5 py-1 rounded-full text-xs border border-gray-200 text-gray-400 hover:text-gray-600">
                      +{religions.length - 6}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAll.map((marker) => (
                  <Link
                    key={`${marker.type}-${marker.id}`}
                    href={marker.type === "site" ? `/holy-sites/${marker.id}` : `/temples/${marker.id}`}
                    className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all"
                  >
                    <div className="relative h-36">
                      {marker.imageUrl ? (
                        <OptimizedImage src={marker.imageUrl} alt={marker.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-3xl opacity-30">{marker.religion?.symbol || "🌍"}</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          marker.type === "site"
                            ? "bg-blue-500/90 text-white"
                            : "bg-amber-500/90 text-white"
                        }`}>
                          {marker.type === "site" ? t("map.tagSite") : t("map.tagTemple")}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3">
                        <h3 className="text-white font-serif font-bold text-sm truncate">{marker.name}</h3>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-gray-500 text-xs mb-1">{marker.nameEn}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{marker.country}</span>
                        {marker.religion && (
                          <>
                            <span>·</span>
                            <span style={{ color: marker.religion.color || undefined }}>{marker.religion.symbol} {marker.religion.name}</span>
                          </>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs mt-2 line-clamp-2">{marker.description}</p>
                      {marker.latitude && marker.longitude && (
                        <p className="text-gray-300 text-[10px] mt-1">{marker.latitude.toFixed(2)}, {marker.longitude.toFixed(2)}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {filteredAll.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-sm">{t("map.noResults")}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <MobileNav />
    </div>
  );
}

/* Site Detail Card - shared between sidebar and mobile bottom sheet */
function SiteDetailCard({ site, t, onClose }: { site: HolySite; t: (key: string) => string; onClose: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t("map.siteDetail")}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs">
          {t("map.close")}
        </button>
      </div>
      <div className="shadow-sm border border-gray-100 rounded-xl bg-white overflow-hidden">
        {site.imageUrl && (
          <div className="relative h-32 w-full">
            <OptimizedImage src={site.imageUrl} alt={site.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80" />
          </div>
        )}
        <div className="p-4">
          <h4 className="text-lg font-serif font-bold mb-1" style={{ color: site.religion?.color || "#0066FF" }}>
            {site.name}
          </h4>
          <p className="text-gray-500 text-sm mb-1">{site.nameEn}</p>
          <p className="text-gray-400 text-xs mb-3">
            {site.country}
            {site.religion ? ` · ${site.religion.name}` : ""}
          </p>
          <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-3">
            {site.description}
          </p>
          <div className="text-gray-400 text-xs mb-4">
            {site.latitude?.toFixed(4)}, {site.longitude?.toFixed(4)}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/holy-sites/${site.id}`}
              className="flex-1 text-center px-4 py-2 text-sm bg-[#0066FF] text-white rounded-full hover:bg-[#0055DD] transition-all font-medium"
            >
              {t("map.viewDetail")} &rarr;
            </Link>
            <Link
              href={`/routes?site=${site.id}`}
              className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 transition-all"
            >
              {t("map.findRoutes")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
