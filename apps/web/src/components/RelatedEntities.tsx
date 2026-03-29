"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { fetchRelatedItems, type RecommendationItem } from "@/lib/api";

function getDetailHref(item: RecommendationItem): string {
  switch (item.type) {
    case "HOLY_SITE":
    case "holy-site":
      return `/holy-sites/${item.id}`;
    case "TEMPLE":
    case "temple":
      return `/temples/${item.id}`;
    case "PATRIARCH":
    case "patriarch":
      return `/patriarchs/${item.id}`;
    default:
      return `/holy-sites/${item.id}`;
  }
}

function EntityCard({ item }: { item: RecommendationItem }) {
  return (
    <Link href={getDetailHref(item)} className="group shrink-0 w-44">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        {/* Image */}
        <div className="relative h-28 overflow-hidden bg-gray-100">
          {item.imageUrl ? (
            <OptimizedImage
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <span className="text-3xl opacity-30">🏛</span>
            </div>
          )}
          {/* Religion badge */}
          {item.religionName && (
            <span
              className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium text-white backdrop-blur-sm"
              style={{ backgroundColor: item.religionColor ? `${item.religionColor}cc` : "#0066FFcc" }}
            >
              {item.religionName}
            </span>
          )}
        </div>
        {/* Info */}
        <div className="p-3">
          <h4 className="text-sm font-semibold text-gray-800 group-hover:text-[#0066FF] transition-colors line-clamp-1">
            {item.name}
          </h4>
          {item.country && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.country}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="shrink-0 w-44 animate-pulse">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-28 bg-gray-100" />
        <div className="p-3 space-y-2">
          <div className="h-3 bg-gray-100 rounded-full w-3/4" />
          <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
        </div>
      </div>
    </div>
  );
}

interface RelatedEntitiesProps {
  entityType: string;
  entityId: string;
  title?: string;
}

export default function RelatedEntities({
  entityType,
  entityId,
  title = "相关推荐",
}: RelatedEntitiesProps) {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!entityId) return;
    setLoading(true);
    fetchRelatedItems(entityType, entityId, 8)
      .then((res) => setItems(res.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
  };

  if (!loading && items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-serif font-semibold text-gray-900">{title}</h2>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
            aria-label="向左滚动"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
            aria-label="向右滚动"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item) => <EntityCard key={`${item.type}-${item.id}`} item={item} />)}
      </div>
    </div>
  );
}
