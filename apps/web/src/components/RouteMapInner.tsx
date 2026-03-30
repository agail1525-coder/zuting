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

export default function RouteMapInner({ sites, height = "400px" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || sites.length === 0) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const validSites = sites.filter(
      (s) => s.site.latitude != null && s.site.longitude != null
    );
    if (validSites.length === 0) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    const sorted = [...validSites].sort(
      (a, b) => a.day - b.day || a.order - b.order
    );

    const coords: L.LatLngExpression[] = sorted.map((s) => [
      s.site.latitude,
      s.site.longitude,
    ]);

    // Draw polyline connecting all sites
    if (coords.length > 1) {
      L.polyline(coords, {
        color: "#0066FF",
        weight: 3,
        opacity: 0.7,
        dashArray: "8, 8",
      }).addTo(map);
    }

    // Add numbered markers
    sorted.forEach((rs, idx) => {
      const icon = L.divIcon({
        className: "route-marker",
        html: `<div style="
          width:28px;height:28px;border-radius:50%;
          background:#0066FF;color:#fff;
          display:flex;align-items:center;justify-content:center;
          font-size:13px;font-weight:700;
          border:2px solid #fff;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
        ">${idx + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([rs.site.latitude, rs.site.longitude], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:160px">
            <strong>Day ${rs.day}: ${rs.site.name}</strong><br/>
            <span style="color:#666;font-size:12px">${rs.site.country}${rs.duration ? " · " + rs.duration : ""}</span>
          </div>`,
          { closeButton: false }
        );
    });

    // Fit bounds
    const group = L.latLngBounds(coords);
    map.fitBounds(group, { padding: [40, 40], maxZoom: 10 });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [sites]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%" }}
      className="rounded-xl overflow-hidden"
    />
  );
}
