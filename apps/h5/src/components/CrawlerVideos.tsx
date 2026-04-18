import { useEffect, useState } from "react";
import { fetchCrawlerVideos, type CrawlerVideo } from "@/lib/api";

function fmtDuration(sec: number | null): string {
  if (!sec || sec <= 0) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function fmtViews(count: number | null): string {
  if (!count) return "";
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万次`;
  return `${count.toLocaleString()}次`;
}

interface Props {
  targetType: "holySite" | "religion";
  targetId: string;
  limit?: number;
}

export default function CrawlerVideos({ targetType, targetId, limit = 8 }: Props) {
  const [videos, setVideos] = useState<CrawlerVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCrawlerVideos(targetType, targetId, limit)
      .then((v) => {
        if (!cancelled) setVideos(v);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetType, targetId, limit]);

  if (loading || videos.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl p-4 mb-4">
      <header className="flex items-center gap-2 mb-3 px-2">
        <svg viewBox="0 0 24 24" fill="#b91c1c" className="w-5 h-5">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
        <h3 className="text-base font-bold text-gray-900 flex-1">相关视频</h3>
        <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">YouTube</span>
      </header>
      <div className="flex gap-3 overflow-x-auto pb-2 px-2 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
        {videos.map((v) => (
          <a
            key={v.id}
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-[200px] snap-start"
          >
            <div className="relative mb-2">
              {v.thumbnailUrl ? (
                <img src={v.thumbnailUrl} alt={v.title} className="w-[200px] h-[112px] rounded-lg object-cover bg-gray-100" />
              ) : (
                <div className="w-[200px] h-[112px] rounded-lg bg-gray-200 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="#9ca3af" className="w-8 h-8">
                    <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V4h-4z" />
                  </svg>
                </div>
              )}
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/65 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="#fff" className="w-3.5 h-3.5 ml-0.5"><path d="M8 5v14l11-7z" /></svg>
              </span>
              {v.durationSec ? (
                <span className="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-[10px] font-bold px-1 rounded">
                  {fmtDuration(v.durationSec)}
                </span>
              ) : null}
            </div>
            <p className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">{v.title}</p>
            <div className="mt-1 flex justify-between items-center gap-1.5">
              {v.channel ? <span className="text-[11px] text-brand flex-1 truncate">{v.channel}</span> : <span />}
              {v.viewCount ? <span className="text-[10px] text-gray-400">{fmtViews(v.viewCount)}</span> : null}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
