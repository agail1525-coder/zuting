"use client";

import StarRating from "@/components/StarRating";

interface RatingSummaryProps {
  averageRating: number;
  totalCount: number;
  distribution: Record<number, number>;
}

export default function RatingSummary({
  averageRating,
  totalCount,
  distribution,
}: RatingSummaryProps) {
  return (
    <div className="flex items-start gap-6 p-5 rounded-xl bg-gray-50 border border-gray-200">
      {/* Left: average score */}
      <div className="flex flex-col items-center justify-center min-w-[72px]">
        <span className="text-4xl font-bold text-[#0066FF] leading-none">
          {averageRating.toFixed(1)}
        </span>
        <StarRating value={averageRating} size="sm" readonly />
        <span className="text-xs text-gray-400 mt-1">{totalCount} 条评价</span>
      </div>

      {/* Right: distribution bars */}
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] ?? 0;
          const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 w-4 text-right shrink-0">{star}</span>
              <svg className="w-3.5 h-3.5 text-yellow-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-gray-400 w-6 text-right shrink-0">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
