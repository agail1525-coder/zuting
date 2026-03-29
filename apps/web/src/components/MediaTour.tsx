"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import { fetchMediaByEntity } from "@/lib/api";
import type { MediaContent } from "@/lib/api";

interface MediaTourProps {
  entityType: string;
  entityId: string;
}

type TabKey = "VIDEO" | "PANORAMA" | "AUDIO";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ---------- Video Modal ---------- */
function VideoModal({
  media,
  onClose,
}: {
  media: MediaContent;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl mx-4 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
        >
          &times;
        </button>
        <video
          src={media.url}
          poster={media.thumbnailUrl ?? undefined}
          controls
          autoPlay
          className="w-full aspect-video"
        />
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg">{media.title}</h3>
          {media.description && (
            <p className="text-gray-400 text-sm mt-1">{media.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Panorama Modal ---------- */
function PanoramaModal({
  media,
  onClose,
}: {
  media: MediaContent;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    scrollStart.current = containerRef.current?.scrollLeft ?? 0;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const dx = e.clientX - startX.current;
    containerRef.current.scrollLeft = scrollStart.current - dx;
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
        >
          &times;
        </button>
        <div
          ref={containerRef}
          className="overflow-hidden cursor-grab active:cursor-grabbing h-[60vh] select-none"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Wide panoramic image — user drags to explore */}
          <img
            src={media.url}
            alt={media.title}
            className="h-full w-auto max-w-none pointer-events-none"
            draggable={false}
          />
        </div>
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg">{media.title}</h3>
          {media.description && (
            <p className="text-gray-400 text-sm mt-1">{media.description}</p>
          )}
          <p className="text-gray-500 text-xs mt-2">
            Drag to explore the panorama
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Audio Player ---------- */
function AudioPlayer({ media }: { media: MediaContent }) {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      el.play();
    }
    setPlaying(!playing);
  }, [playing]);

  const onTimeUpdate = useCallback(() => {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    setProgress((el.currentTime / el.duration) * 100);
    setCurrentTime(el.currentTime);
  }, []);

  const onSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    el.currentTime = ratio * el.duration;
  }, []);

  const onEnded = useCallback(() => setPlaying(false), []);

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl border border-blue-100 p-4 hover:shadow-md transition-shadow">
      <audio
        ref={audioRef}
        src={media.url}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
      />
      <button
        onClick={toggle}
        className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        aria-label={playing ? (t("media.pause") || "Pause") : (t("media.play") || "Play")}
      >
        {playing ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 font-medium text-sm truncate">
          {media.title}
        </p>
        <div
          className="mt-2 h-1.5 bg-blue-100 rounded-full cursor-pointer"
          onClick={onSeek}
        >
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums">
        {formatDuration(currentTime)} / {formatDuration(media.duration)}
      </span>
    </div>
  );
}

/* ---------- Main MediaTour Component ---------- */
export default function MediaTour({ entityType, entityId }: MediaTourProps) {
  const { t } = useTranslation();
  const [media, setMedia] = useState<MediaContent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("VIDEO");
  const [videoModal, setVideoModal] = useState<MediaContent | null>(null);
  const [panoramaModal, setPanoramaModal] = useState<MediaContent | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMediaByEntity(entityType, entityId)
      .then((data) => {
        if (!cancelled) {
          setMedia(Array.isArray(data) ? data.filter((m) => m.isActive) : []);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [entityType, entityId]);

  if (!loaded) return null;

  const grouped: Record<TabKey, MediaContent[]> = {
    VIDEO: media.filter((m) => m.mediaType === "VIDEO"),
    PANORAMA: media.filter((m) => m.mediaType === "PANORAMA"),
    AUDIO: media.filter((m) => m.mediaType === "AUDIO"),
  };

  const allTabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "VIDEO" as const, label: t("media.video") || "视频", icon: "🎬" },
    { key: "PANORAMA" as const, label: t("media.panorama") || "全景", icon: "🌐" },
    { key: "AUDIO" as const, label: t("media.audio") || "音频讲解", icon: "🎧" },
  ];
  const tabs = allTabs.filter((tab) => grouped[tab.key].length > 0);

  if (tabs.length === 0) return null;

  // Ensure activeTab is valid
  const currentTab = tabs.find((t) => t.key === activeTab) ? activeTab : tabs[0].key;
  const items = grouped[currentTab];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
      <h2 className="text-[#0066FF] font-serif font-bold text-xl mb-4">
        {t("media.tour") || "多媒体导览"}
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentTab === tab.key
                ? "bg-blue-500 text-white shadow-md"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
          >
            {tab.icon} {tab.label} ({grouped[tab.key].length})
          </button>
        ))}
      </div>

      {/* Video Grid */}
      {currentTab === "VIDEO" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setVideoModal(item)}
              className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-video text-left"
            >
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center">
                  <span className="text-4xl">🎬</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {/* Play icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <svg
                    className="w-5 h-5 text-blue-600 ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
              </div>
              {/* Duration badge */}
              {item.duration && (
                <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md">
                  {formatDuration(item.duration)}
                </span>
              )}
              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-sm font-medium truncate">
                  {item.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Panorama Grid */}
      {currentTab === "PANORAMA" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setPanoramaModal(item)}
              className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-[2/1] text-left"
            >
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-200 to-blue-400 flex items-center justify-center">
                  <span className="text-4xl">🌐</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-xl">🌐</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-sm font-medium truncate">
                  {item.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Audio List */}
      {currentTab === "AUDIO" && (
        <div className="space-y-3">
          {items.map((item) => (
            <AudioPlayer key={item.id} media={item} />
          ))}
        </div>
      )}

      {/* Video Modal */}
      {videoModal && (
        <VideoModal media={videoModal} onClose={() => setVideoModal(null)} />
      )}

      {/* Panorama Modal */}
      {panoramaModal && (
        <PanoramaModal
          media={panoramaModal}
          onClose={() => setPanoramaModal(null)}
        />
      )}
    </div>
  );
}
