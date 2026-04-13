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
      <stop stop-color="#F0F0F0" offset="20%" />
      <stop stop-color="#E0E0E0" offset="50%" />
      <stop stop-color="#F0F0F0" offset="80%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#F0F0F0" />
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
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
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
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z"
          />
        </svg>
      </div>
    );
  }

  const blurW = width ?? 400;
  const blurH = height ?? 300;

  // 生产服务器位于中国,无法访问 upload.wikimedia.org 做 Next 图片优化(500/504)
  // 远程维基/Commons 图直接让浏览器加载,绕过服务端优化
  const isRemoteCDN = /^https?:\/\/(upload|commons)\.wikimedia\.org/i.test(src);

  const imageProps: Partial<ImageProps> = {
    src,
    alt,
    className,
    priority,
    unoptimized: isRemoteCDN,
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
