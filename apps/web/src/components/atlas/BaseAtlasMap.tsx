"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Patriarch } from "@/lib/api";
import type { PatriarchMapData, AtlasConfig, WaypointType } from "./atlas-types";
import { getSchoolColorFromConfig, WAYPOINT_TYPE_COLORS } from "./atlas-types";

interface Props {
  patriarchs: Patriarch[];
  journeyMap: Map<string, PatriarchMapData>;
  selectedId: string | null;
  activeFilter: string;
  showLineage: boolean;
  activeWaypointIndex: number | null;
  onPatriarchClick: (id: string) => void;
  config: AtlasConfig;
}

export default function BaseAtlasMap({
  patriarchs,
  journeyMap,
  selectedId,
  activeFilter,
  showLineage,
  activeWaypointIndex,
  onPatriarchClick,
  config,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const journeyLayerRef = useRef<L.LayerGroup | null>(null);
  const lineageLayerRef = useRef<L.LayerGroup | null>(null);

  const isPatriarchVisible = useCallback(
    (p: Patriarch) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "overseas") {
        return (config.overseasSchools ?? []).includes(p.school ?? "");
      }
      return p.school === activeFilter;
    },
    [activeFilter, config.overseasSchools]
  );

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: config.defaultCenter,
      zoom: config.defaultZoom,
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
      minZoom: 2,
      maxZoom: 18,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    journeyLayerRef.current = L.layerGroup().addTo(map);
    lineageLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [config.defaultCenter, config.defaultZoom]);

  // Render patriarch markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    patriarchs.forEach((p) => {
      const data = journeyMap.get(p.name);
      if (!data) return;

      const visible = isPatriarchVisible(p);
      const isSelected = selectedId === p.id;
      const color = getSchoolColorFromConfig(
        p.school ?? "",
        config.schoolColors,
        config.themeColor
      );
      const isFounder = p.generation === 1;

      const marker = L.circleMarker([data.primaryLat, data.primaryLng], {
        radius: isSelected ? 12 : isFounder ? 9 : 7,
        fillColor: color,
        color: isSelected ? "#fff" : color,
        weight: isSelected ? 3 : 2,
        opacity: visible ? (selectedId && !isSelected ? 0.2 : 1) : 0,
        fillOpacity: visible ? (selectedId && !isSelected ? 0.15 : 0.8) : 0,
        interactive: visible,
      }).addTo(map);

      marker.bindTooltip(
        `<div style="font-family:'Noto Serif SC',serif;min-width:100px">
          <div style="font-weight:700;color:${color};font-size:13px">${p.name}</div>
          <div style="color:#94a3b8;font-size:11px">${p.nameEn ?? ""}</div>
          <div style="color:#64748b;font-size:10px;margin-top:2px">${p.dates ?? ""} · ${p.school ?? ""}</div>
        </div>`,
        {
          className: "atlas-tooltip",
          direction: "top",
          offset: [0, -8],
        }
      );

      marker.on("click", () => onPatriarchClick(p.id));
      markersRef.current.set(p.id, marker);
    });
  }, [patriarchs, journeyMap, selectedId, activeFilter, isPatriarchVisible, onPatriarchClick, config.schoolColors, config.themeColor]);

  // Render journey route when patriarch selected
  useEffect(() => {
    const map = mapRef.current;
    const layer = journeyLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    if (!selectedId) return;

    const p = patriarchs.find((x) => x.id === selectedId);
    if (!p) return;
    const data = journeyMap.get(p.name);
    if (!data || data.journeyWaypoints.length === 0) {
      map.flyTo([data?.primaryLat ?? 30, data?.primaryLng ?? 115], 8, {
        duration: 1.2,
      });
      return;
    }

    const waypoints = data.journeyWaypoints;
    const color = getSchoolColorFromConfig(
      p.school ?? "",
      config.schoolColors,
      config.themeColor
    );

    const coords: L.LatLngExpression[] = waypoints.map((w) => [w.lat, w.lng]);
    if (coords.length > 1) {
      L.polyline(coords, {
        color,
        weight: 3,
        opacity: 0.8,
        dashArray: "8, 4",
      }).addTo(layer);
    }

    waypoints.forEach((wp, idx) => {
      const wpColor = WAYPOINT_TYPE_COLORS[wp.type as WaypointType] || "#94a3b8";
      const isActive = activeWaypointIndex === idx;

      const icon = L.divIcon({
        className: "journey-marker",
        html: `<div style="
          width:${isActive ? 32 : 26}px;
          height:${isActive ? 32 : 26}px;
          border-radius:50%;
          background:${isActive ? wpColor : wpColor + "cc"};
          color:#fff;
          display:flex;align-items:center;justify-content:center;
          font-size:${isActive ? 13 : 11}px;
          font-weight:700;
          border:2px solid ${isActive ? "#fff" : wpColor};
          box-shadow:0 2px 8px ${wpColor}44${isActive ? ",0 0 16px " + wpColor + "66" : ""};
          transition:all 0.3s;
        ">${idx + 1}</div>`,
        iconSize: [isActive ? 32 : 26, isActive ? 32 : 26],
        iconAnchor: [isActive ? 16 : 13, isActive ? 16 : 13],
      });

      const yearStr = wp.year
        ? wp.yearEnd ? `${wp.year}-${wp.yearEnd}` : `${wp.year}`
        : "";
      const typeLabel = config.typeLabels[wp.type as WaypointType] || "事件";

      L.marker([wp.lat, wp.lng], { icon })
        .addTo(layer)
        .bindPopup(
          `<div style="
            font-family:'Noto Serif SC',serif;
            min-width:200px;
            background:#0f172a;
            color:#e2e8f0;
            padding:12px;
            border-radius:8px;
            border:1px solid ${wpColor}33;
          ">
            <div style="font-size:12px;color:${wpColor};font-weight:700;margin-bottom:4px">
              ${yearStr} · ${typeLabel}
            </div>
            <div style="font-size:12px;color:#cbd5e1;line-height:1.6">
              ${wp.event}
            </div>
          </div>`,
          {
            className: "dark-popup",
            closeButton: false,
            offset: [0, -12],
          }
        );
    });

    const bounds = L.latLngBounds(coords);
    map.flyToBounds(bounds, { padding: [80, 80], maxZoom: 8, duration: 1.2 });
  }, [selectedId, patriarchs, journeyMap, activeWaypointIndex, config.schoolColors, config.themeColor, config.typeLabels]);

  // Pan to active waypoint
  useEffect(() => {
    const map = mapRef.current;
    if (!map || activeWaypointIndex == null || !selectedId) return;

    const p = patriarchs.find((x) => x.id === selectedId);
    if (!p) return;
    const data = journeyMap.get(p.name);
    if (!data || !data.journeyWaypoints[activeWaypointIndex]) return;

    const wp = data.journeyWaypoints[activeWaypointIndex];
    map.panTo([wp.lat, wp.lng], { animate: true, duration: 0.5 });
  }, [activeWaypointIndex, selectedId, patriarchs, journeyMap]);

  // Render lineage lines
  useEffect(() => {
    const map = mapRef.current;
    const layer = lineageLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    if (!showLineage || selectedId) return;

    patriarchs.forEach((p) => {
      if (!p.teacherId || !isPatriarchVisible(p)) return;
      const teacher = patriarchs.find((t) => t.id === p.teacherId);
      if (!teacher || !isPatriarchVisible(teacher)) return;

      const pData = journeyMap.get(p.name);
      const tData = journeyMap.get(teacher.name);
      if (!pData || !tData) return;

      const color = getSchoolColorFromConfig(
        p.school ?? "",
        config.schoolColors,
        config.themeColor
      );
      L.polyline(
        [
          [tData.primaryLat, tData.primaryLng],
          [pData.primaryLat, pData.primaryLng],
        ],
        {
          color,
          weight: 1,
          opacity: 0.25,
          dashArray: "4, 6",
        }
      ).addTo(layer);
    });
  }, [showLineage, selectedId, patriarchs, journeyMap, activeFilter, isPatriarchVisible, config.schoolColors, config.themeColor]);

  return (
    <>
      <style>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: #0f172a; color: #e2e8f0;
          border: 1px solid ${config.themeColor}33;
          border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); padding: 0;
        }
        .dark-popup .leaflet-popup-content { margin: 0; }
        .dark-popup .leaflet-popup-tip {
          background: #0f172a; border: 1px solid ${config.themeColor}33;
          border-top: none; border-right: none;
        }
        .atlas-tooltip {
          background: #0f172a !important; color: #e2e8f0 !important;
          border: 1px solid ${config.themeColor}33 !important;
          border-radius: 8px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
          padding: 8px 10px !important;
        }
        .atlas-tooltip::before { border-top-color: #0f172a !important; }
        .leaflet-control-attribution {
          background: rgba(15,23,42,0.8) !important;
          color: #475569 !important; font-size: 10px !important;
        }
        .leaflet-control-attribution a { color: #64748b !important; }
        .leaflet-control-zoom a {
          background: #1e293b !important; color: ${config.themeColor} !important;
          border-color: ${config.themeColor}33 !important;
        }
        .leaflet-control-zoom a:hover { background: #334155 !important; }
        .journey-marker { background: none !important; border: none !important; }
      `}</style>
      <div ref={containerRef} className="w-full h-full" />
    </>
  );
}
