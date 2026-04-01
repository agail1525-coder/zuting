"use client";

import dynamic from "next/dynamic";

const AtlasMap = dynamic(() => import("./AtlasMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0f172a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-[#C4A265]/30 border-t-[#C4A265] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#C4A265]/60 text-sm">正在加载祖师大图谱...</p>
      </div>
    </div>
  ),
});

export default AtlasMap;
