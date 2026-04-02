"use client";

import dynamic from "next/dynamic";
import type { AtlasConfig } from "./atlas-types";

// Dynamic import wrapper — pass config.themeColor and config.loadingText
export function createAtlasMapDynamic(config: AtlasConfig) {
  return dynamic(() => import("./BaseAtlasMap"), {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-12 h-12 border-2 rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: config.themeColor + "4d",
              borderTopColor: config.themeColor,
            }}
          />
          <p className="text-sm" style={{ color: config.themeColor + "99" }}>
            {config.loadingText ?? "正在加载大图谱..."}
          </p>
        </div>
      </div>
    ),
  });
}
