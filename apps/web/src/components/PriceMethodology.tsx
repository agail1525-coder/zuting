"use client";

export default function PriceMethodology() {
  return (
    <section className="max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-center gap-2.5 text-xs text-gray-500 flex-wrap">
        <span className="inline-flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>价格每整点自动校准</span>
        </span>
        <span className="text-gray-300">·</span>
        <span>日 04:20 刷新基线快照</span>
        <span className="text-gray-300">·</span>
        <span>180 天滚动窗口</span>
      </div>
    </section>
  );
}
