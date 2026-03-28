import Link from "next/link";
import OptimizedImage from "./OptimizedImage";
import type { HolySite } from "@/lib/api";

const RELIGION_GRADIENT: Record<string, string> = {
  buddhism: "from-amber-800/40 to-amber-950/60",
  taoism: "from-emerald-800/40 to-emerald-950/60",
  christianity: "from-blue-800/40 to-blue-950/60",
  islam: "from-green-800/40 to-green-950/60",
  hinduism: "from-orange-800/40 to-orange-950/60",
  judaism: "from-indigo-800/40 to-indigo-950/60",
  confucianism: "from-red-800/40 to-red-950/60",
  sikhism: "from-orange-800/40 to-orange-950/60",
  shinto: "from-rose-800/40 to-rose-950/60",
  "tibetan-buddhism": "from-purple-800/40 to-purple-950/60",
  indigenous: "from-stone-800/40 to-stone-950/60",
  bahai: "from-cyan-800/40 to-cyan-950/60",
};

export default function HolySiteCard({ site }: { site: HolySite }) {
  const gradient = RELIGION_GRADIENT[site.religion?.slug || ""] || "from-temple-700 to-temple-800";

  return (
    <Link href={`/holy-sites/${site.id}`}>
      <div className="card-glow rounded-xl overflow-hidden bg-temple-800/50 group cursor-pointer h-full flex flex-col">
        <div className="h-44 relative overflow-hidden">
          {site.imageUrl ? (
            <OptimizedImage
              src={site.imageUrl}
              alt={site.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-5xl opacity-40 group-hover:opacity-60 transition-opacity">
                {site.religion?.symbol || "🕌"}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-temple-900/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="text-xs px-2 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm border border-white/10">
              {site.country}
            </span>
            {site.religion && (
              <span
                className="text-xs px-2 py-1 rounded-full backdrop-blur-sm border border-white/10"
                style={{ backgroundColor: `${site.religion.color ?? '#D4A855'}30`, color: site.religion.color ?? '#D4A855' }}
              >
                {site.religion.symbol} {site.religion.name}
              </span>
            )}
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
