"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";

interface SocialProofProps {
  entityType: string;
  entityId: string;
  variant?: "inline" | "banner";
}

export default function SocialProof({ entityType, entityId, variant = "inline" }: SocialProofProps) {
  const { t } = useTranslation();
  const [monthlyVisitors, setMonthlyVisitors] = useState(0);
  const [viewingNow, setViewingNow] = useState(0);

  useEffect(() => {
    // Simulated social proof data based on entity hash for consistent display
    const hash = entityId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    setMonthlyVisitors(120 + (hash % 380));
    setViewingNow(3 + (hash % 12));
  }, [entityId]);

  if (variant === "banner") {
    return (
      <div className="flex items-center gap-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
        <span className="flex items-center gap-1.5 text-amber-700 font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {monthlyVisitors} {t("socialProof.pilgrims") || "位朝圣者本月到访"}
        </span>
        <span className="flex items-center gap-1.5 text-green-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {viewingNow} {t("socialProof.viewing") || "人正在浏览"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200 font-medium">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {monthlyVisitors} {t("socialProof.pilgrims") || "位朝圣者本月到访"}
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-200">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        {viewingNow} {t("socialProof.viewing") || "人正在浏览"}
      </span>
    </div>
  );
}
