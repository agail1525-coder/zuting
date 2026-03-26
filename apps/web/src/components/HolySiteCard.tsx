import Link from "next/link";
import type { HolySite } from "@/lib/api";

export default function HolySiteCard({ site }: { site: HolySite }) {
  return (
    <Link href={`/holy-sites/${site.id}`}>
      <div className="card-glow rounded-xl overflow-hidden bg-temple-800/50 group cursor-pointer h-full flex flex-col">
        {/* Image placeholder */}
        <div className="h-40 bg-gradient-to-br from-temple-700 to-temple-800 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-temple-900/60 to-transparent" />
          <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">🕌</span>
          <div className="absolute bottom-3 left-3 right-3">
            <span className="text-xs px-2 py-1 rounded-full bg-gold/20 text-gold border border-gold/20">
              {site.country}
            </span>
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-serif font-bold text-white group-hover:text-gold transition-colors">
            {site.name}
          </h3>
          <p className="text-temple-400 text-sm mt-1">{site.nameEn}</p>
          <p className="text-temple-500 text-sm mt-2 line-clamp-2 flex-1">
            {site.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
