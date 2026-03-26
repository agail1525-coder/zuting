import Link from "next/link";
import type { Religion } from "@/lib/api";

const defaultColors: Record<string, string> = {
  buddhism: "from-amber-600/20 to-amber-900/20",
  taoism: "from-emerald-600/20 to-emerald-900/20",
  christianity: "from-blue-600/20 to-blue-900/20",
  islam: "from-green-600/20 to-green-900/20",
  hinduism: "from-orange-600/20 to-orange-900/20",
  judaism: "from-indigo-600/20 to-indigo-900/20",
  confucianism: "from-red-600/20 to-red-900/20",
  sikhism: "from-yellow-600/20 to-yellow-900/20",
  shintoism: "from-rose-600/20 to-rose-900/20",
  "tibetan-buddhism": "from-purple-600/20 to-purple-900/20",
  "indigenous-spirituality": "from-teal-600/20 to-teal-900/20",
  bahai: "from-cyan-600/20 to-cyan-900/20",
};

export default function ReligionCard({ religion }: { religion: Religion }) {
  const gradient = defaultColors[religion.slug] || "from-gold/20 to-temple-800";

  return (
    <Link href={`/religions/${religion.slug}`}>
      <div className={`card-glow rounded-xl p-6 bg-gradient-to-br ${gradient} backdrop-blur-sm group cursor-pointer h-full flex flex-col items-center justify-center text-center gap-3 min-h-[160px]`}>
        {religion.symbol && (
          <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
            {religion.symbol}
          </span>
        )}
        <div>
          <h3 className="text-lg font-serif font-bold text-white group-hover:text-gold transition-colors">
            {religion.name}
          </h3>
          <p className="text-temple-400 text-sm mt-1">{religion.nameEn}</p>
        </div>
      </div>
    </Link>
  );
}
