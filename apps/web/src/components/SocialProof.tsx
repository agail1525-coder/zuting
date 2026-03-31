"use client";

import { useTranslation } from "@/lib/i18n";

interface SocialProofProps {
  entityType: string;
  entityId: string;
  variant?: "inline" | "banner";
}

/**
 * SocialProof — displays a static "popular destination" trust badge.
 *
 * Previously this component fabricated visitor counts from a hash of entityId.
 * Since there is no public-facing page-view tracking API, we now show an honest
 * static badge without fake numbers.  When a real analytics endpoint becomes
 * available for public page-view counts, this component should be updated to
 * consume it.
 */
export default function SocialProof({ entityType, entityId: _entityId, variant = "inline" }: SocialProofProps) {
  const { t } = useTranslation();

  const label = t("socialProof.popular") || "热门目的地";

  if (variant === "banner") {
    return (
      <div className="flex items-center gap-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
        <span className="flex items-center gap-1.5 text-amber-700 font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200 font-medium">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        {label}
      </span>
    </div>
  );
}
