"use client";

import { useState } from "react";

const RATING_LABELS: Record<number, string> = {
  1: "很差",
  2: "较差",
  3: "一般",
  4: "满意",
  5: "极好",
};

const SIZE_MAP = {
  sm: { star: "w-4 h-4", text: "text-xs" },
  md: { star: "w-5 h-5", text: "text-sm" },
  lg: { star: "w-7 h-7", text: "text-base" },
} as const;

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  showLabel?: boolean;
}

export default function StarRating({
  value,
  onChange,
  size = "md",
  readonly = false,
  showLabel = false,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const { star } = SIZE_MAP[size];
  const active = hover || Math.round(value);

  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star_num) => {
        const filled = star_num <= active;
        return (
          <button
            key={star_num}
            type="button"
            disabled={readonly}
            onClick={readonly ? undefined : () => onChange?.(star_num)}
            onMouseEnter={readonly ? undefined : () => setHover(star_num)}
            onMouseLeave={readonly ? undefined : () => setHover(0)}
            className={`inline-flex items-center justify-center transition-transform ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            }`}
            aria-label={`${star_num}星 — ${RATING_LABELS[star_num]}`}
          >
            <svg
              className={`${star} transition-colors ${
                filled ? "text-yellow-400" : "text-gray-300"
              }`}
              viewBox="0 0 24 24"
              fill={filled ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={filled ? 0 : 1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        );
      })}
      {showLabel && active > 0 && (
        <span className={`ml-1 text-gray-500 ${SIZE_MAP[size].text}`}>
          {RATING_LABELS[active]}
        </span>
      )}
    </span>
  );
}
