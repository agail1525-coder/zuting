"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
}

const shimmerSvg = (w: number, h: number) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#0f172a" offset="20%" />
      <stop stop-color="#1e293b" offset="50%" />
      <stop stop-color="#0f172a" offset="80%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#0f172a" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.5s" repeatCount="indefinite" />
</svg>`;

function toBase64(str: string) {
  return typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className = "",
  priority = false,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-temple-800/50 text-temple-500 ${className}`}
        style={!fill ? { width, height } : undefined}
        role="img"
        aria-label={alt}
      >
        <svg
          className="w-10 h-10 opacity-40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 14s1.5 2 4 2 4-2 4-2M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"
          />
        </svg>
      </div>
    );
  }

  const blurW = width ?? 400;
  const blurH = height ?? 300;

  const imageProps: Partial<ImageProps> = {
    src,
    alt,
    className,
    priority,
    onError: () => setHasError(true),
    placeholder: "blur" as const,
    blurDataURL: `data:image/svg+xml;base64,${toBase64(shimmerSvg(blurW, blurH))}`,
  };

  if (fill) {
    return <Image {...imageProps} src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />;
  }

  return (
    <Image
      {...imageProps}
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
    />
  );
}
