import { useState } from "react";

export interface MediaItem {
  id: string;
  type: "VIDEO" | "AUDIO" | "PANORAMA" | "IMAGE";
  title: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
}

interface Props {
  items: MediaItem[];
}

export default function MediaTour({ items }: Props) {
  const [selected, setSelected] = useState<MediaItem | null>(null);
  if (!items?.length) return null;

  return (
    <section className="bg-white rounded-xl p-4 my-3">
      <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
        <span>🎬</span> 多媒体导览
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m)}
            className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group"
          >
            {m.thumbnailUrl ? (
              <img src={m.thumbnailUrl} alt={m.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {m.type === "VIDEO" ? "▶️" : m.type === "AUDIO" ? "🎧" : m.type === "PANORAMA" ? "🌐" : "🖼️"}
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-end p-2">
              <span className="text-white text-xs font-medium line-clamp-1">{m.title}</span>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-white text-2xl"
          >
            ✕
          </button>
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {selected.type === "VIDEO" && (
              <video src={selected.url} controls autoPlay className="w-full max-h-[80vh]" />
            )}
            {selected.type === "AUDIO" && (
              <audio src={selected.url} controls autoPlay className="w-full" />
            )}
            {(selected.type === "PANORAMA" || selected.type === "IMAGE") && (
              <img src={selected.url} alt={selected.title} className="w-full max-h-[80vh] object-contain" />
            )}
            <div className="mt-3 text-center">
              <p className="text-white font-medium">{selected.title}</p>
              {selected.description && <p className="text-white/60 text-sm mt-1">{selected.description}</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
