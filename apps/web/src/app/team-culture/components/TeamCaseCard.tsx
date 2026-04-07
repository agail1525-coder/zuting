"use client";

import Link from "next/link";
import type { TeamCase } from "@/lib/api/team-culture";

export default function TeamCaseCard({ item }: { item: TeamCase }) {
  return (
    <Link
      href={`/team-culture/cases/${item.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#D4A855]/60 transition"
    >
      {item.photos[0] && (
        <div
          className="h-56 bg-cover bg-center"
          style={{ backgroundImage: `url(${item.photos[0]})` }}
        />
      )}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3 text-xs text-white/60">
          {item.theme && (
            <span
              className="px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: `${item.theme.color}22`,
                color: item.theme.color,
              }}
            >
              {item.theme.title}
            </span>
          )}
          <span>{item.headcount} 人</span>
          {item.industry && <span>{item.industry}</span>}
        </div>
        <h3 className="text-lg font-bold mb-3 text-white group-hover:text-[#D4A855] transition">
          {item.teamName}
        </h3>
        <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
          {item.story}
        </p>
        {item.testimonial && (
          <p className="mt-4 text-[#D4A855]/90 text-sm italic border-l-2 border-[#D4A855]/40 pl-3">
            "{item.testimonial}"
          </p>
        )}
      </div>
    </Link>
  );
}
