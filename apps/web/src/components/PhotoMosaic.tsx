"use client";

import { useState } from "react";
import OptimizedImage from "./OptimizedImage";

interface PhotoMosaicProps {
  images: string[];
  alt: string;
}

export default function PhotoMosaic({ images, alt }: PhotoMosaicProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) return null;

  const displayImages = images.slice(0, 5);
  const remaining = images.length - 5;

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  const handlePrev = () => setSelectedIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const handleNext = () => setSelectedIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <>
      {/* Mosaic Grid: 1 large + 4 small */}
      <div className="rounded-lg overflow-hidden cursor-pointer relative">
        {displayImages.length === 1 ? (
          <div className="relative h-[368px]" onClick={() => openLightbox(0)}>
            <OptimizedImage src={displayImages[0]} alt={`${alt} 1`} fill className="object-cover" />
          </div>
        ) : displayImages.length <= 3 ? (
          <div className="grid grid-cols-2 gap-0.5 h-[368px]">
            <div className="relative" onClick={() => openLightbox(0)}>
              <OptimizedImage src={displayImages[0]} alt={`${alt} 1`} fill className="object-cover" />
            </div>
            <div className="grid gap-0.5">
              {displayImages.slice(1).map((img, i) => (
                <div key={i} className="relative" onClick={() => openLightbox(i + 1)}>
                  <OptimizedImage src={img} alt={`${alt} ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 grid-rows-2 gap-0.5 h-[368px]">
            {/* Large left image spanning 2 rows + 2 cols */}
            <div className="col-span-2 row-span-2 relative" onClick={() => openLightbox(0)}>
              <OptimizedImage src={displayImages[0]} alt={`${alt} 1`} fill className="object-cover hover:brightness-95 transition-all" />
            </div>
            {/* 4 smaller images on right */}
            {displayImages.slice(1, 5).map((img, i) => (
              <div key={i} className="relative" onClick={() => openLightbox(i + 1)}>
                <OptimizedImage src={img} alt={`${alt} ${i + 2}`} fill className="object-cover hover:brightness-95 transition-all" />
                {/* "See more" overlay on last image */}
                {i === 3 && remaining > 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">+{remaining} 张</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Trip.com style "See more" button */}
        {images.length > 1 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute right-2 bottom-2 px-3 py-1 text-xs font-medium text-white bg-[rgba(15,41,77,0.7)] rounded hover:bg-[rgba(15,41,77,0.85)] transition-colors"
          >
            See more &gt;
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl transition-colors z-10"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            ✕
          </button>

          <div className="relative w-full h-full max-w-5xl max-h-[80vh] m-8" onClick={(e) => e.stopPropagation()}>
            <OptimizedImage
              src={images[selectedIndex]}
              alt={`${alt} ${selectedIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl transition-colors"
                aria-label="Previous"
              >
                &#8249;
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl transition-colors"
                aria-label="Next"
              >
                &#8250;
              </button>
            </>
          )}

          {/* Counter + thumbnail strip */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            <div className="flex gap-1.5 overflow-x-auto max-w-[90vw] pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(i); }}
                  className={`relative w-14 h-10 rounded-md overflow-hidden flex-shrink-0 transition-all ${
                    i === selectedIndex ? "ring-2 ring-white opacity-100" : "opacity-40 hover:opacity-70"
                  }`}
                >
                  <OptimizedImage src={img} alt={`thumb ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
            <span className="px-4 py-1.5 rounded-full bg-black/50 text-white text-sm backdrop-blur-sm">
              {selectedIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
