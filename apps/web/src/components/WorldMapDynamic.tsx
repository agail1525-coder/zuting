"use client";

import dynamic from "next/dynamic";
import type { HolySite, Religion } from "@/lib/api";

const WorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center bg-temple-800/50 rounded-xl border border-gold/10"
      style={{ height: "500px" }}
    >
      <div className="text-center">
        <div className="text-3xl mb-3 animate-pulse">🗺</div>
        <p className="text-temple-400 text-sm">加载地图中...</p>
      </div>
    </div>
  ),
});

interface Props {
  holySites: HolySite[];
  religions?: Religion[];
  height?: string;
  selectedSiteId?: string | null;
  onSiteClick?: (site: HolySite) => void;
  interactive?: boolean;
}

export default function WorldMapDynamic(props: Props) {
  return <WorldMap {...props} />;
}
