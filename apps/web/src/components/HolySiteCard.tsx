import Link from "next/link";
import OptimizedImage from "./OptimizedImage";
import type { HolySite } from "@/lib/api";

export default function HolySiteCard({ site }: { site: HolySite }) {
  return (
    <Link href={`/holy-sites/${site.id}`}>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col">
        <div className="h-44 relative overflow-hidden">
          {site.imageUrl ? (
            <OptimizedImage
              src={site.imageUrl}
              alt={site.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">
                {site.religion?.symbol || "🏛"}
              </span>
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="text-xs px-2 py-1 rounded-full bg-white/90 text-gray-700 backdrop-blur-sm shadow-sm font-medium">
              {site.country}
            </span>
            {site.religion && (
              <span
                className="text-xs px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm font-medium"
                style={{ color: site.religion.color ?? '#0066FF' }}
              >
                {site.religion.symbol} {site.religion.name}
              </span>
            )}
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors">
            {site.name}
          </h3>
          <p className="text-gray-400 text-sm mt-1">{site.nameEn}</p>
          <p className="text-gray-500 text-sm mt-2 line-clamp-2 flex-1">
            {site.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
