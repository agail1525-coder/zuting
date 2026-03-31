"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { fetchHomepageRecommendations, type RecommendationItem } from "@/lib/api";

const TYPE_LABEL: Record<string, string> = {
  HOLY_SITE: "圣地",
  "holy-site": "圣地",
  TEMPLE: "祖庭",
  temple: "祖庭",
  PATRIARCH: "祖师",
  patriarch: "祖师",
};

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

function RecommendCard({ item }: { item: RecommendationItem }) {
  return (
    <Link href={getDetailHref(item)} className="group">
      <div className="bg-white rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
        {/* Image */}
        <div className="relative h-44 overflow-hidden bg-gray-100">
          {item.imageUrl ? (
            <OptimizedImage
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
          )}
          {/* Type badge */}
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm">
            {TYPE_LABEL[item.type] ?? item.type}
          </span>
        </div>
        {/* Info */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm">
            {item.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            {item.country && (
              <span className="text-xs text-gray-400">{item.country}</span>
            )}
            {item.religionName && (
              <span
                className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  backgroundColor: item.religionColor ? `${item.religionColor}20` : "#2563EB20",
                  color: item.religionColor ?? "#2563EB",
                }}
              >
                {item.religionName}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="h-44 bg-gray-100" />
        <div className="p-4 space-y-2">
          <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
          <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function HomepageRecommendations() {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPersonalized, setHasPersonalized] = useState(false);
  const [offset, setOffset] = useState(0);

  const BATCH_SIZE = 12;

  const load = useCallback(async (currentOffset: number) => {
    setLoading(true);
    try {
      const res = await fetchHomepageRecommendations(BATCH_SIZE);
      // Rotate items based on offset for "换一批" functionality
      const allItems = res?.items || [];
      const rotated = [...allItems.slice(currentOffset % Math.max(allItems.length, 1)), ...allItems.slice(0, currentOffset % Math.max(allItems.length, 1))];
      setItems(rotated.slice(0, BATCH_SIZE));
      setHasPersonalized(allItems.length > 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(0);
  }, [load]);

  const handleRefresh = () => {
    const newOffset = (offset + 4) % BATCH_SIZE;
    setOffset(newOffset);
    load(newOffset);
  };

  if (!loading && items.length === 0) return null;

  return (
    <section className="mt-14 md:mt-20 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {hasPersonalized ? "为你推荐" : "热门推荐"}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {hasPersonalized ? "根据你的兴趣精选" : "全球最受欢迎的文化圣地"}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-[#2563EB] hover:text-[#0052CC] font-medium transition-colors disabled:opacity-50"
          title="换一批"
        >
          <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          换一批
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : items.slice(0, 8).map((item) => (
              <RecommendCard key={`${item.type}-${item.id}`} item={item} />
            ))}
      </div>
    </section>
  );
}
