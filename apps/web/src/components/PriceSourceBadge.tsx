"use client";

/**
 * PriceSourceBadge · 价格数据来源透明标注
 *
 * 对应 PRD: docs/prd/M24-v2-PRD-价格工具数据对齐重构.md §1.1/§5
 * 规则 PRC-01: 价格数字必须伴随"数据来源标识"。
 */
type Source = "baseline" | "crawler" | "official";

type Props = {
  source?: Source;
  updatedAt?: string | Date | null;
  sampleCount?: number;
  className?: string;
};

const LABELS: Record<Source, { title: string; hint: string; color: string }> = {
  baseline: {
    title: "基线模拟数据",
    hint: "基于路线起价 + 季节/周末权重生成,供参考。真实比价数据源(Amadeus/携程)将于 Wave B 接入。",
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
  crawler: {
    title: "爬虫采集数据",
    hint: "由爬虫++ PRICE 域从官网/OTA 定期采集。",
    color: "text-blue-700 bg-blue-50 border-blue-200",
  },
  official: {
    title: "官方合作数据",
    hint: "由官方合作伙伴 API 实时推送。",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
};

function formatTime(t: string | Date | null | undefined): string {
  if (!t) return "—";
  const d = typeof t === "string" ? new Date(t) : t;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PriceSourceBadge({
  source = "baseline",
  updatedAt,
  sampleCount,
  className = "",
}: Props) {
  const cfg = LABELS[source];
  return (
    <div
      className={`mt-6 rounded-xl border px-4 py-3 text-xs leading-relaxed ${cfg.color} ${className}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-semibold">数据来源 · {cfg.title}</span>
        {updatedAt && (
          <span className="opacity-70">· 更新 {formatTime(updatedAt)}</span>
        )}
        {typeof sampleCount === "number" && sampleCount >= 0 && (
          <span className="opacity-70">· 样本 {sampleCount}</span>
        )}
      </div>
      <div className="opacity-80">{cfg.hint}</div>
    </div>
  );
}
