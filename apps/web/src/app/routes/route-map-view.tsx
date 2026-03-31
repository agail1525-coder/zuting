"use client";

import { useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import type { Route } from "@/lib/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RouteMarker {
  routeId: string;
  slug: string;
  title: string;
  lat: number;
  lng: number;
  price: string;
  duration: number;
  category: string;
}

const CATEGORY_MARKER_COLORS: Record<string, string> = {
  ZEN: "#78716c",
  BUDDHIST: "#d97706",
  TAOIST: "#059669",
  CHRISTIAN: "#2563eb",
  ISLAMIC: "#16a34a",
  CROSS_CULTURAL: "#7c3aed",
  HINDU: "#ea580c",
};

interface Props {
  routes: Route[];
  t: (key: string) => string;
}

export default function RouteMapView({ routes, t }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract markers from routes (use first site's coordinates as start point)
  const markers: RouteMarker[] = useMemo(() => {
    const result: RouteMarker[] = [];
    for (const route of routes) {
      const sites = route.sites ?? [];
      // Find the first site with coordinates
      const firstSite = sites.find((s) => s.site.latitude && s.site.longitude);
      if (firstSite) {
        result.push({
          routeId: route.id,
          slug: route.slug,
          title: route.title,
          lat: firstSite.site.latitude,
          lng: firstSite.site.longitude,
          price: (route.priceFrom / 100).toLocaleString(),
          duration: route.duration,
          category: route.category,
        });
      }
    }
    return result;
  }, [routes]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: [25, 105],
      zoom: 3,
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
      minZoom: 2,
      maxZoom: 16,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    const leafletMarkers: L.CircleMarker[] = [];

    for (const marker of markers) {
      const color = CATEGORY_MARKER_COLORS[marker.category] ?? "#D4A855";
      const circleMarker = L.circleMarker([marker.lat, marker.lng], {
        radius: 8,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(map);

      circleMarker.bindPopup(
        `<div style="font-family:system-ui;min-width:160px">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px">${marker.title}</div>
          <div style="color:#666;font-size:12px">${marker.duration}${t("routes.duration.short").replace("1-3", "")} · ¥${marker.price}/人</div>
          <a href="/routes/${marker.slug}" style="display:inline-block;margin-top:8px;padding:4px 12px;background:#0066FF;color:#fff;border-radius:6px;font-size:12px;text-decoration:none">查看详情 →</a>
        </div>`,
        { maxWidth: 250, closeButton: false }
      );

      leafletMarkers.push(circleMarker);
    }

    // Fit bounds if markers exist
    if (markers.length > 0) {
      const group = L.featureGroup(leafletMarkers);
      map.fitBounds(group.getBounds().pad(0.15));
    }

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [markers, t]);

  if (markers.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <span className="text-5xl block mb-4">🗺️</span>
        <p className="text-lg">{t("routes.mapView.noSites")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <div ref={containerRef} style={{ height: "500px", width: "100%" }} />
      </div>
      {/* Route list sidebar below map on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {routes.slice(0, 6).map((route) => (
          <Link
            key={route.id}
            href={`/routes/${route.slug}`}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-[#0066FF]/30 hover:shadow-sm transition-all"
          >
            <div
              className="w-2 h-10 rounded-full shrink-0"
              style={{ backgroundColor: CATEGORY_MARKER_COLORS[route.category] ?? "#D4A855" }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{route.title}</p>
              <p className="text-xs text-gray-500">{route.duration}天 · ¥{(route.priceFrom / 100).toLocaleString()}/人</p>
            </div>
            {route.rating && (
              <span className="text-xs font-bold text-[#0066FF] shrink-0">★ {route.rating.toFixed(1)}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
