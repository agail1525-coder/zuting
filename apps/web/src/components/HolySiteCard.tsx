"use client";

import Link from "next/link";
import OptimizedImage from "./OptimizedImage";
import SaveButton from "./SaveButton";
import { useTranslation } from "@/lib/i18n";
import type { HolySite } from "@/lib/api";

interface HolySiteCardProps {
  site: HolySite;
  compareMode?: boolean;
  isCompared?: boolean;
  onToggleCompare?: (id: string) => void;
}

export default function HolySiteCard({ site, compareMode, isCompared, onToggleCompare }: HolySiteCardProps) {
  const { t } = useTranslation();

  const rating = site.reviewStats?.averageRating;
  const reviewCount = site.reviewStats?.reviewCount;
  const isTravelersChoice = (rating ?? 0) >= 4.5 && (reviewCount ?? 0) >= 3;

  return (
    <div className="relative group">
      {/* Compare checkbox overlay */}
      {compareMode && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleCompare?.(site.id); }}
          className={`absolute top-3 left-3 z-20 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
            isCompared
              ? "bg-[#0066FF] border-[#0066FF] text-white"
              : "bg-white/90 border-gray-300 text-transparent hover:border-[#0066FF]"
          }`}
        >
          {isCompared && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      )}
      <Link href={`/holy-sites/${site.id}`}>
        <div className={`bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col ${
          isCompared ? "border-[#0066FF] ring-2 ring-[#0066FF]/20" : "border-gray-100"
        }`}>
          <div className="h-44 relative overflow-hidden">
            {site.imageUrl ? (
              <OptimizedImage
                src={site.imageUrl}
                alt={site.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">
                  {site.religion?.symbol || "🏛"}
                </span>
              </div>
            )}
            {/* Travelers' Choice badge */}
            {isTravelersChoice && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-green-700">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                {t("holySites.travelersRecommend")}
              </div>
            )}
            {/* Rating badge */}
            {rating != null && rating > 0 && (
              <div className="absolute top-3 right-12 z-10">
                <span className="px-2 py-1 rounded-md bg-[#0066FF] text-white text-[10px] font-bold shadow-sm">
                  ★ {rating.toFixed(1)}
                </span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="text-xs px-2 py-1 rounded-full bg-white/90 text-gray-700 backdrop-blur-sm shadow-sm font-medium">
                {site.country}
              </span>
              {site.religion && (
                <span
                  className="text-xs px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm font-medium"
                  style={{ color: site.religion.color ?? '#0066FF' }}
                >
                  {site.religion.symbol} {site.religion.name}
                </span>
              )}
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors">
              {site.name}
            </h3>
            <p className="text-gray-400 text-sm mt-1">{site.nameEn}</p>
            <p className="text-gray-500 text-sm mt-2 line-clamp-2 flex-1">
              {site.description}
            </p>
            {/* Meta row: reviews, price, duration */}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
              {reviewCount != null && reviewCount > 0 && (
                <span>★ {(rating ?? 0).toFixed(1)} ({reviewCount} {t("holySites.reviews")})</span>
              )}
              {site.ticketPrice != null && (
                <span>
                  {site.ticketPrice === 0
                    ? t("holySites.free")
                    : `¥${site.ticketPrice}`}
                </span>
              )}
              {site.visitDuration && (
                <span>{site.visitDuration}</span>
              )}
            </div>
            {/* Quick info tags */}
            {site.bestSeason && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">
                  {t("holySites.bestSeason")}: {site.bestSeason}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
      {/* SaveButton overlay */}
      <div className="absolute top-3 right-3 z-10">
        <SaveButton entityType="HOLY_SITE" entityId={site.id} size="sm" />
      </div>
    </div>
  );
}
