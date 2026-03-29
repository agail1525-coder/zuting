"use client";

import { useState, useEffect } from "react";
import OptimizedImage from "./OptimizedImage";
import { useTranslation } from "@/lib/i18n";
import { fetchReviewsWithSort, type Review } from "@/lib/api";

interface UGCPhotoWallProps {
  targetType: string;
  targetId: string;
  maxPhotos?: number;
}

export default function UGCPhotoWall({ targetType, targetId, maxPhotos = 12 }: UGCPhotoWallProps) {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<{ url: string; userName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!targetId) return;
    fetchReviewsWithSort(targetType, targetId, 1, 50, "latest")
      .then((res) => {
        const collected: { url: string; userName: string }[] = [];
        for (const review of res.data) {
          if (review.images && review.images.length > 0) {
            for (const img of review.images) {
              collected.push({ url: img, userName: review.user.nickname ?? "Anonymous" });
              if (collected.length >= maxPhotos) break;
            }
          }
          if (collected.length >= maxPhotos) break;
        }
        setPhotos(collected);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [targetType, targetId, maxPhotos]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">
          {t("ugcPhotos.title") || "社区照片"}
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (photos.length === 0) return null;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-semibold text-gray-900">
            {t("ugcPhotos.title") || "社区照片"}
            <span className="ml-2 text-sm font-normal text-gray-400">({photos.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {photos.map((photo, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => setLightboxIndex(i)}
            >
              <OptimizedImage src={photo.url} alt={photo.userName} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="absolute bottom-1 left-1.5 text-white text-[10px] truncate max-w-full">
                  {photo.userName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl z-10"
            onClick={() => setLightboxIndex(null)}
          >
            ✕
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[80vh] m-8" onClick={(e) => e.stopPropagation()}>
            <OptimizedImage src={photos[lightboxIndex].url} alt="" fill className="object-contain" />
          </div>
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i === 0 ? photos.length - 1 : (i ?? 0) - 1)); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl"
              >
                &#8249;
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i === photos.length - 1 ? 0 : (i ?? 0) + 1)); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl"
              >
                &#8250;
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-1.5 rounded-full">
            {(lightboxIndex ?? 0) + 1} / {photos.length}
            <span className="ml-3 text-white/60">{photos[lightboxIndex].userName}</span>
          </div>
        </div>
      )}
    </>
  );
}
