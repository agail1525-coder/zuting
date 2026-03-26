import Link from "next/link";
import type { Patriarch } from "@/lib/api";

export default function PatriarchCard({ patriarch }: { patriarch: Patriarch }) {
  return (
    <Link href={`/patriarchs/${patriarch.id}`}>
      <div className="card-glow rounded-xl overflow-hidden bg-temple-800/50 group cursor-pointer h-full flex flex-col">
        <div className="h-32 bg-gradient-to-br from-temple-700 to-temple-800 flex items-center justify-center">
          <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">👤</span>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-serif font-bold text-white group-hover:text-gold transition-colors">
            {patriarch.name}
          </h3>
          {patriarch.nameEn && (
            <p className="text-temple-400 text-sm mt-1">{patriarch.nameEn}</p>
          )}
          {patriarch.title && (
            <p className="text-gold/70 text-xs mt-1">{patriarch.title}</p>
          )}
          {patriarch.dates && (
            <p className="text-temple-500 text-xs mt-1">{patriarch.dates}</p>
          )}
          <p className="text-temple-500 text-sm mt-2 line-clamp-2 flex-1">
            {patriarch.coreTeaching}
          </p>
        </div>
      </div>
    </Link>
  );
}
