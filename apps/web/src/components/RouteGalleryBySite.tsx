"use client";

import { useMemo, useState } from "react";
import OptimizedImage from "./OptimizedImage";
import type { RouteCoverGalleryItem } from "@/lib/api";

interface RouteGalleryBySiteProps {
  gallery: RouteCoverGalleryItem[];
  coverImage?: string | null;
  routeTitle: string;
}

type GroupedGallery = {
  key: string;
  day: number;
  order: number;
  siteName: string;
  items: RouteCoverGalleryItem[];
};

export default function RouteGalleryBySite({
  gallery,
  coverImage,
  routeTitle,
}: RouteGalleryBySiteProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { groups, flatItems } = useMemo(() => {
    const withSite = gallery.filter((g) => g.url);
    const byKey = new Map<string, GroupedGallery>();
    for (const item of withSite) {
      const siteName = item.siteName || "岭南文化剪影";
      const day = item.day ?? 0;
      const order = item.order ?? 0;
      const key = `${day}-${order}-${siteName}`;
      if (!byKey.has(key)) {
        byKey.set(key, { key, day, order, siteName, items: [] });
      }
      byKey.get(key)!.items.push(item);
    }
    const groupsArr = Array.from(byKey.values()).sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.order - b.order;
    });
    const flat = groupsArr.flatMap((g) => g.items);
    return { groups: groupsArr, flatItems: flat };
  }, [gallery]);

  if (groups.length === 0) {
    return coverImage ? (
      <div className="rounded-xl overflow-hidden h-[370px] relative">
        <OptimizedImage src={coverImage} alt={routeTitle} fill className="object-cover" priority />
      </div>
    ) : null;
  }

  const openLightbox = (item: RouteCoverGalleryItem) => {
    const idx = flatItems.findIndex((i) => i.url === item.url && i.caption === item.caption);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () =>
    setLightboxIndex((i) => (i === null ? null : (i - 1 + flatItems.length) % flatItems.length));
  const next = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % flatItems.length));

  const current = lightboxIndex !== null ? flatItems[lightboxIndex] : null;

  return (
    <>
      <div className="space-y-5">
        {groups.map((g) => (
          <section key={g.key}>
            <div className="flex items-baseline gap-2 mb-2">
              {g.day > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-[#0f294d] text-white text-xs font-semibold">
                  Day {g.day}
                </span>
              )}
              <h3 className="text-base font-bold text-[#0f294d]">{g.siteName}</h3>
              <span className="text-xs text-gray-400">· {g.items.length} 张</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {g.items.map((item) => (
                <button
                  key={`${g.key}-${item.url}`}
                  type="button"
                  onClick={() => openLightbox(item)}
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 text-left"
                >
                  <OptimizedImage
                    src={item.url}
                    alt={item.caption || g.siteName}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-2">
                    <p className="text-white text-xs leading-snug line-clamp-2">
                      {item.caption || g.siteName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl z-10"
            aria-label="Close"
          >
            ✕
          </button>

          <div
            className="relative w-full h-full max-w-5xl max-h-[80vh] m-8"
            onClick={(e) => e.stopPropagation()}
          >
            <OptimizedImage src={current.url} alt={current.caption} fill className="object-contain" />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl"
            aria-label="Previous"
          >
            &#8249;
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl"
            aria-label="Next"
          >
            &#8250;
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 max-w-[90vw]">
            <div className="px-4 py-2 rounded-lg bg-black/60 text-white text-sm backdrop-blur-sm text-center">
              {current.day ? `Day ${current.day} · ` : ""}
              {current.siteName ? `${current.siteName}` : ""}
              {current.caption && current.caption !== current.siteName ? ` · ${current.caption}` : ""}
            </div>
            <div className="px-3 py-1 rounded-full bg-black/50 text-white text-xs">
              {(lightboxIndex ?? 0) + 1} / {flatItems.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
