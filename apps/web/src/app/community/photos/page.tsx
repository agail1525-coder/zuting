"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { fetchPhotoWall, type PhotoItem } from "@/lib/api";
import OptimizedImage from "@/components/OptimizedImage";

const PAGE_SIZE = 18;

export default function PhotoWallPage() {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<PhotoItem | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPhotoWall({ page, limit: PAGE_SIZE })
      .then((res) => {
        if (page === 1) {
          setPhotos(res.items ?? []);
        } else {
          setPhotos((prev) => [...prev, ...(res.items ?? [])]);
        }
        setTotal(res.total ?? 0);
      })
      .catch(() => setError(t("community.loadError")))
      .finally(() => setLoading(false));
  }, [page]);

  const hasMore = photos.length < total;

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t("community.photos.title")}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("community.photos.subtitle")}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="text-center py-20 text-red-400">{error}</div>
        )}

        {/* Empty */}
        {!loading && !error && photos.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📷</div>
            <div>{t("community.emptyPhotos")}</div>
          </div>
        )}

        {/* Masonry Grid */}
        {photos.length > 0 && (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="break-inside-avoid cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                onClick={() => setExpanded(photo)}
              >
                <OptimizedImage
                  src={photo.url}
                  alt=""
                  width={400}
                  height={300}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="bg-white px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                      {photo.userAvatar ? (
                        <OptimizedImage src={photo.userAvatar} alt="" width={20} height={20} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        photo.userName?.charAt(0) || "?"
                      )}
                    </div>
                    <span className="text-xs text-gray-500 truncate">{photo.userName}</span>
                  </div>
                  {photo.entityType && (
                    <div className="mt-1 text-xs text-blue-500"># {photo.entityType}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        {!error && (
          <div className="mt-10 text-center">
            {loading ? (
              <div className="text-gray-400 text-sm">{t("community.loading")}</div>
            ) : hasMore ? (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-8 py-3 bg-white shadow-sm rounded-full text-sm text-[#0066FF] font-medium hover:shadow-md transition-shadow border border-gray-100"
              >
                {t("community.photos.loadMore")}
              </button>
            ) : photos.length > 0 ? (
              <div className="text-gray-400 text-sm">{t("community.photos.showAll").replace("{total}", String(total))}</div>
            ) : null}
          </div>
        )}
      </div>

      {/* Expanded Modal */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
          onClick={() => setExpanded(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setExpanded(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-2xl"
            >
              ✕
            </button>
            <OptimizedImage
              src={expanded.url}
              alt=""
              width={800}
              height={600}
              className="w-full rounded-2xl shadow-2xl object-contain max-h-[80vh]"
            />
            <div className="bg-white rounded-b-2xl px-5 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                {expanded.userName?.charAt(0) || "?"}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{expanded.userName}</div>
                {expanded.entityType && (
                  <div className="text-xs text-blue-500"># {expanded.entityType}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
