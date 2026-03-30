"use client";

import dynamic from "next/dynamic";

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

interface RouteMapInnerProps {
  sites: RouteSite[];
  height?: string;
}

const RouteMapInner = dynamic(() => import("./RouteMapInner"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center bg-gray-100 rounded-xl border border-gray-200"
      style={{ height: "400px" }}
    >
      <div className="text-center">
        <div className="text-3xl mb-3 animate-pulse">🗺</div>
        <p className="text-gray-400 text-sm">加载地图中...</p>
      </div>
    </div>
  ),
});

export default function RouteMap(props: RouteMapInnerProps) {
  return <RouteMapInner {...props} />;
}
