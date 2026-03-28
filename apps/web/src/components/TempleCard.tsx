import Link from "next/link";
import OptimizedImage from "./OptimizedImage";
import type { Temple } from "@/lib/api";

export default function TempleCard({ temple }: { temple: Temple }) {
  return (
    <Link href={`/temples/${temple.id}`}>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col">
        <div className="h-40 relative overflow-hidden">
          {temple.imageUrl ? (
            <OptimizedImage
              src={temple.imageUrl}
              alt={temple.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">🏛</span>
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors">
            {temple.name}
          </h3>
          {temple.nameEn && (
            <p className="text-gray-400 text-sm mt-1">{temple.nameEn}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {temple.country}
            </span>
            {temple.foundingDate && (
              <span className="text-xs text-gray-400">{temple.foundingDate}</span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-2 line-clamp-2 flex-1">
            {temple.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
