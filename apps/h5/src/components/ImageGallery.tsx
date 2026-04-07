import { useState } from "react";

interface Props {
  images: string[];
  alt?: string;
}

export default function ImageGallery({ images, alt = "" }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      {/* Thumbnail strip */}
      <div className="mx-4 mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${alt} ${i + 1}`}
            onClick={() => setLightbox(i)}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0 active:opacity-80 cursor-pointer"
          />
        ))}
      </div>

      {/* Lightbox overlay */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/80 text-2xl z-10"
          >
            ✕
          </button>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightbox + 1} / {images.length}
          </div>

          <img
            src={images[lightbox]}
            alt={`${alt} ${lightbox + 1}`}
            className="max-w-full max-h-[80vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {lightbox > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xl"
            >
              ‹
            </button>
          )}
          {lightbox < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xl"
            >
              ›
            </button>
          )}

          {/* Thumbnail strip at bottom */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto">
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                className={`w-12 h-12 rounded object-cover flex-shrink-0 cursor-pointer transition-opacity ${
                  i === lightbox ? "ring-2 ring-white opacity-100" : "opacity-50"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
