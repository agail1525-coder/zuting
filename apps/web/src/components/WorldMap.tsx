"use client";

import { useEffect, useRef } from "react";
import type { HolySite, Religion } from "@/lib/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface WorldMapProps {
  holySites: HolySite[];
  religions?: Religion[];
  height?: string;
  selectedSiteId?: string | null;
  onSiteClick?: (site: HolySite) => void;
  interactive?: boolean;
}

const DEFAULT_COLOR = "#D4A855";

function getSiteColor(site: HolySite): string {
  return site.religion?.color || DEFAULT_COLOR;
}

export default function WorldMap({
  holySites,
  height = "500px",
  selectedSiteId,
  onSiteClick,
  interactive = true,
}: WorldMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent double init
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: [20, 40],
      zoom: 2,
      zoomControl: interactive,
      scrollWheelZoom: interactive,
      dragging: interactive,
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

    const markers: L.CircleMarker[] = [];

    holySites.forEach((site) => {
      if (site.latitude == null || site.longitude == null) return;

      const color = getSiteColor(site);
      const isSelected = selectedSiteId === site.id;

      const marker = L.circleMarker([site.latitude, site.longitude], {
        radius: isSelected ? 10 : 7,
        fillColor: color,
        color: isSelected ? "#fff" : color,
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: isSelected ? 0.9 : 0.7,
      }).addTo(map);

      const religionName = site.religion?.name || "";
      const popupContent = `
        <div style="
          font-family: 'Noto Serif SC', Georgia, serif;
          min-width: 180px;
          background: #0f172a;
          color: #e2e8f0;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid ${color}33;
        ">
          <div style="
            font-size: 14px;
            font-weight: bold;
            color: ${color};
            margin-bottom: 4px;
          ">${site.name}</div>
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 2px;">
            ${site.nameEn}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
            ${site.country}${religionName ? " · " + religionName : ""}
          </div>
          <a href="/holy-sites/${site.id}" style="
            display: inline-block;
            font-size: 11px;
            color: ${color};
            text-decoration: none;
            border: 1px solid ${color}44;
            padding: 3px 10px;
            border-radius: 12px;
            transition: all 0.2s;
          " onmouseover="this.style.background='${color}22'" onmouseout="this.style.background='transparent'">
            查看详情 &rarr;
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "dark-popup",
        closeButton: true,
        offset: [0, -4],
      });

      if (onSiteClick) {
        marker.on("click", () => onSiteClick(site));
      }

      markers.push(marker);
    });

    markersRef.current = markers;
    mapRef.current = map;

    // Force a resize after mount
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holySites, selectedSiteId, interactive]);

  return (
    <>
      <style>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: #0f172a;
          color: #e2e8f0;
          border: 1px solid rgba(212, 168, 85, 0.2);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          padding: 0;
        }
        .dark-popup .leaflet-popup-content {
          margin: 0;
        }
        .dark-popup .leaflet-popup-tip {
          background: #0f172a;
          border: 1px solid rgba(212, 168, 85, 0.2);
          border-top: none;
          border-right: none;
        }
        .dark-popup .leaflet-popup-close-button {
          color: #64748b !important;
          font-size: 18px !important;
          padding: 6px 8px !important;
        }
        .dark-popup .leaflet-popup-close-button:hover {
          color: #D4A855 !important;
        }
        .leaflet-control-attribution {
          background: rgba(15, 23, 42, 0.8) !important;
          color: #475569 !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #64748b !important;
        }
        .leaflet-control-zoom a {
          background: #1e293b !important;
          color: #D4A855 !important;
          border-color: rgba(212, 168, 85, 0.2) !important;
        }
        .leaflet-control-zoom a:hover {
          background: #334155 !important;
        }
      `}</style>
      <div
        ref={containerRef}
        style={{ height, width: "100%", borderRadius: "12px", overflow: "hidden" }}
      />
    </>
  );
}
