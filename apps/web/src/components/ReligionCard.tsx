import Link from "next/link";
import type { Religion } from "@/lib/api";

export default function ReligionCard({ religion }: { religion: Religion }) {
  const color = religion.color || "#0066FF";

  return (
    <Link href={`/religions/${religion.slug}`}>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col items-center justify-center text-center gap-3 min-h-[160px]">
        {religion.symbol && (
          <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
            {religion.symbol}
          </span>
        )}
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors">
            {religion.name}
          </h3>
          <p className="text-gray-400 text-sm mt-1">{religion.nameEn}</p>
        </div>
        <div
          className="w-8 h-1 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: color }}
        />
      </div>
    </Link>
  );
}
