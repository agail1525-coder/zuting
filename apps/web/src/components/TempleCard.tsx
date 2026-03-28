import Link from "next/link";
import OptimizedImage from "./OptimizedImage";
import type { Temple } from "@/lib/api";

export default function TempleCard({ temple }: { temple: Temple }) {
  return (
    <Link href={`/temples/${temple.id}`}>
      <div className="card-glow rounded-xl overflow-hidden bg-temple-800/50 group cursor-pointer h-full flex flex-col">
        <div className="h-40 relative overflow-hidden">
          {temple.imageUrl ? (
            <OptimizedImage
              src={temple.imageUrl}
              alt={temple.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-temple-700 to-temple-800 flex items-center justify-center">
              <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">🏛</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-temple-900/80 via-transparent to-transparent" />
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-serif font-bold text-white group-hover:text-gold transition-colors">
            {temple.name}
          </h3>
          {temple.nameEn && (
            <p className="text-temple-400 text-sm mt-1">{temple.nameEn}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold/80">
              {temple.country}
            </span>
            {temple.foundingDate && (
              <span className="text-xs text-temple-500">{temple.foundingDate}</span>
            )}
          </div>
          <p className="text-temple-500 text-sm mt-2 line-clamp-2 flex-1">
            {temple.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
