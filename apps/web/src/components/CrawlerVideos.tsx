"use client";
import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

interface VideoItem {
  id: string;
  title: string;
  url: string;
  thumbnail: string | null;
  videoId: string | null;
  channelTitle: string | null;
  publishedAt: string | null;
}

export default function CrawlerVideos({
  targetType,
  targetId,
  limit = 12,
}: {
  targetType: "holySite" | "religion";
  targetId: string;
  limit?: number;
}) {
  const { t } = useTranslation();
  const [items, setItems] = useState<VideoItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const url = `${API_BASE}/api/crawlers/videos?targetType=${targetType}&targetId=${encodeURIComponent(targetId)}&limit=${limit}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (!aborted) setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        if (!aborted) setError(e instanceof Error ? e.message : "error");
      }
    })();
    return () => {
      aborted = true;
    };
  }, [targetType, targetId, limit]);

  if (error || (items !== null && items.length === 0)) return null;

  return (
    <section className="mt-6">
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-base font-bold text-[#0f294d]">
          {t("videos.title") || "相关视频"}
          <span className="ml-2 text-xs font-normal text-[#4a6b96]">
            {t("videos.subtitle") || "来自 YouTube 官方频道 · 每日更新"}
          </span>
        </h2>
      </div>
      {items === null ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video bg-slate-200/50 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((v) => (
            <a
              key={v.id}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg overflow-hidden border border-slate-200 hover:shadow-md transition"
            >
              <div className="relative aspect-video bg-slate-100">
                {v.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                  />
                )}
                <span className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100">
                  <span className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                </span>
              </div>
              <div className="p-2.5 bg-white">
                <div className="text-xs font-semibold text-[#0f294d] line-clamp-2 leading-snug">{v.title}</div>
                {v.channelTitle && (
                  <div className="mt-1 text-[11px] text-[#4a6b96] truncate">{v.channelTitle}</div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
