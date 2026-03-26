import Link from "next/link";
import type { Seal } from "@/lib/api";

const seriesColors: Record<string, string> = {
  CHUYIN: "from-blue-500/20 to-blue-900/20 border-blue-500/20",
  ZHONGYIN: "from-emerald-500/20 to-emerald-900/20 border-emerald-500/20",
  YINGUOYIN: "from-amber-500/20 to-amber-900/20 border-amber-500/20",
  CHENGDAOYIN: "from-purple-500/20 to-purple-900/20 border-purple-500/20",
  GUIYUANYIN: "from-rose-500/20 to-rose-900/20 border-rose-500/20",
};

const seriesNames: Record<string, string> = {
  CHUYIN: "初印系",
  ZHONGYIN: "中印系",
  YINGUOYIN: "印果印",
  CHENGDAOYIN: "成道印",
  GUIYUANYIN: "归源印",
};

const seriesDotColors: Record<string, string> = {
  CHUYIN: "bg-blue-400",
  ZHONGYIN: "bg-emerald-400",
  YINGUOYIN: "bg-amber-400",
  CHENGDAOYIN: "bg-purple-400",
  GUIYUANYIN: "bg-rose-400",
};

export default function SealCard({ seal }: { seal: Seal }) {
  const colorClass = seriesColors[seal.series] || "from-gold/20 to-temple-800 border-gold/20";
  const dotColor = seriesDotColors[seal.series] || "bg-gold";

  return (
    <Link href={`/seals/${seal.id}`}>
      <div className={`card-glow rounded-xl p-5 bg-gradient-to-br ${colorClass} group cursor-pointer h-full flex flex-col`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl font-serif font-bold text-gold/60 group-hover:text-gold transition-colors">
            {String(seal.id).padStart(2, "0")}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-temple-400">
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            {seriesNames[seal.series]}
          </span>
        </div>
        <h3 className="font-serif text-lg font-bold text-white group-hover:text-gold transition-colors">
          {seal.name}
        </h3>
        <p className="text-temple-400 text-sm mt-2 line-clamp-3 font-serif leading-relaxed flex-1">
          {seal.poem}
        </p>
      </div>
    </Link>
  );
}
