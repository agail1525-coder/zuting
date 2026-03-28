import Link from "next/link";
import OptimizedImage from "./OptimizedImage";
import type { Patriarch } from "@/lib/api";

export default function PatriarchCard({ patriarch }: { patriarch: Patriarch }) {
  return (
    <Link href={`/patriarchs/${patriarch.id}`}>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col">
        <div className="h-36 relative overflow-hidden">
          {patriarch.imageUrl ? (
            <OptimizedImage
              src={patriarch.imageUrl}
              alt={patriarch.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">👤</span>
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors">
            {patriarch.name}
          </h3>
          {patriarch.nameEn && (
            <p className="text-gray-400 text-sm mt-1">{patriarch.nameEn}</p>
          )}
          {patriarch.title && (
            <p className="text-[#0066FF]/70 text-xs mt-1 font-medium">{patriarch.title}</p>
          )}
          {patriarch.dates && (
            <p className="text-gray-400 text-xs mt-1">{patriarch.dates}</p>
          )}
          <p className="text-gray-500 text-sm mt-2 line-clamp-2 flex-1">
            {patriarch.coreTeaching}
          </p>
        </div>
      </div>
    </Link>
  );
}
