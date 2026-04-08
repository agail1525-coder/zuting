import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
  experimental: {},
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_INTERNAL_URL || "http://localhost:3002"}/api/:path*`,
      },
    ];
  },
  // Ensure Leaflet CSS and images are handled correctly
  serverExternalPackages: ["leaflet"],
};

export default nextConfig;
