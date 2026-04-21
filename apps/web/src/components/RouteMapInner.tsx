"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RouteSite {
  id: string;
  day: number;
  order: number;
  duration: string | null;
  site: {
    id: string;
    name: string;
    nameEn: string;
    country: string;
    latitude: number;
    longitude: number;
    imageUrl: string | null;
  };
}

interface Props {
  sites: RouteSite[];
  height?: string;
}

const DAY_COLORS = [
  { primary: "#D4A855", secondary: "#8B6914", label: "#2A1F0E" }, // Day 1 gold
  { primary: "#3264ff", secondary: "#1E3A8A", label: "#FFFFFF" }, // Day 2 blue
  { primary: "#10B981", secondary: "#064E3B", label: "#FFFFFF" }, // Day 3 green
];

export default function RouteMapInner({ sites, height = "420px" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || sites.length === 0) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const validSites = sites.filter(
      (s) => s.site.latitude != null && s.site.longitude != null,
    );
    if (validSites.length === 0) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    });

    // Premium tile: Voyager (carto) — more detail, warm palette, suits cultural routes
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      },
    ).addTo(map);

    const sorted = [...validSites].sort(
      (a, b) => a.day - b.day || a.order - b.order,
    );

    // Group by day to render each day's route in its own color
    const byDay = new Map<number, typeof sorted>();
    for (const rs of sorted) {
      if (!byDay.has(rs.day)) byDay.set(rs.day, []);
      byDay.get(rs.day)!.push(rs);
    }

    // Draw per-day polylines (solid, layered with glow)
    const allCoords: L.LatLngExpression[] = [];
    Array.from(byDay.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([day, dayStops]) => {
        const color = DAY_COLORS[(day - 1) % DAY_COLORS.length];
        const dayCoords: L.LatLngExpression[] = dayStops.map((s) => [
          s.site.latitude,
          s.site.longitude,
        ]);
        if (dayCoords.length >= 2) {
          // Glow halo
          L.polyline(dayCoords, {
            color: color.primary,
            weight: 12,
            opacity: 0.18,
            lineJoin: "round",
            lineCap: "round",
          }).addTo(map);
          // Main solid line
          L.polyline(dayCoords, {
            color: color.primary,
            weight: 4,
            opacity: 0.92,
            lineJoin: "round",
            lineCap: "round",
          }).addTo(map);
        }
        allCoords.push(...dayCoords);
      });

    // Cross-day connector (from last of day N to first of day N+1) — dashed, subtle
    const days = Array.from(byDay.keys()).sort((a, b) => a - b);
    for (let i = 0; i < days.length - 1; i++) {
      const thisDay = byDay.get(days[i])!;
      const nextDay = byDay.get(days[i + 1])!;
      if (thisDay.length && nextDay.length) {
        const from = thisDay[thisDay.length - 1];
        const to = nextDay[0];
        L.polyline(
          [
            [from.site.latitude, from.site.longitude],
            [to.site.latitude, to.site.longitude],
          ],
          {
            color: "#64748B",
            weight: 2,
            opacity: 0.55,
            dashArray: "6, 10",
            lineCap: "round",
          },
        ).addTo(map);
      }
    }

    // Premium numbered markers — gold/blue drop pins with site name labels
    let globalIdx = 0;
    Array.from(byDay.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([day, dayStops]) => {
        const color = DAY_COLORS[(day - 1) % DAY_COLORS.length];
        dayStops.forEach((rs) => {
          globalIdx++;
          const n = globalIdx;
          const icon = L.divIcon({
            className: "route-marker-premium",
            html: `
              <div style="position:relative;">
                <div style="
                  width:44px;height:44px;
                  background:linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%);
                  border-radius:50% 50% 50% 0;
                  transform:rotate(-45deg);
                  border:3px solid #fff;
                  box-shadow:0 6px 16px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.2);
                  position:absolute;
                  top:-44px;left:-22px;
                ">
                  <div style="
                    transform:rotate(45deg);
                    width:100%;height:100%;
                    display:flex;align-items:center;justify-content:center;
                    color:${color.label};
                    font-weight:800;
                    font-size:15px;
                    letter-spacing:-0.5px;
                    font-family:'SF Pro Display',-apple-system,system-ui,sans-serif;
                  ">${n}</div>
                </div>
                <div style="
                  position:absolute;
                  top:4px;left:-46px;
                  white-space:nowrap;
                  background:rgba(20,20,20,0.86);
                  color:#fff;
                  padding:3px 9px;
                  border-radius:12px;
                  font-size:11px;
                  font-weight:600;
                  letter-spacing:0.3px;
                  box-shadow:0 2px 6px rgba(0,0,0,0.25);
                  backdrop-filter:blur(6px);
                ">Day ${day} · ${rs.site.name}</div>
              </div>`,
            iconSize: [44, 44],
            iconAnchor: [0, 0],
          });

          L.marker([rs.site.latitude, rs.site.longitude], { icon })
            .addTo(map)
            .bindPopup(
              `<div style="min-width:200px;font-family:'PingFang SC',system-ui,sans-serif;">
                <div style="font-size:11px;color:${color.primary};font-weight:700;letter-spacing:1px;margin-bottom:3px;">DAY ${day} · STOP ${n}</div>
                <div style="font-size:15px;font-weight:700;color:#1f2937;margin-bottom:4px;">${rs.site.name}</div>
                <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">${rs.site.nameEn ?? ""}</div>
                <div style="display:flex;gap:8px;font-size:12px;color:#4b5563;">
                  <span>📍 ${rs.site.country}</span>
                  ${rs.duration ? `<span>⏱ ${rs.duration}</span>` : ""}
                </div>
              </div>`,
              { closeButton: false, maxWidth: 260 },
            );
        });
      });

    // Fit bounds with generous padding
    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 });
    }

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [sites]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        style={{ height, width: "100%" }}
        className="rounded-2xl overflow-hidden border border-[#e5e7eb] shadow-lg"
      />
      {/* Legend — day color guide + hint */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-xl px-3 py-2 shadow-md border border-gray-100 text-[11px] space-y-1 pointer-events-none z-[400]">
        <div className="font-bold text-gray-800 text-[12px] mb-1">行程路线图</div>
        {Array.from(new Set(sites.map((s) => s.day)))
          .sort((a, b) => a - b)
          .map((d) => {
            const color = DAY_COLORS[(d - 1) % DAY_COLORS.length];
            return (
              <div key={d} className="flex items-center gap-2 text-gray-700">
                <span
                  className="inline-block w-6 h-1 rounded-full"
                  style={{ background: color.primary }}
                />
                <span>Day {d}</span>
              </div>
            );
          })}
      </div>
      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded-md pointer-events-none z-[400]">
        滚轮缩放已关闭 · 按住拖动查看
      </div>
    </div>
  );
}
