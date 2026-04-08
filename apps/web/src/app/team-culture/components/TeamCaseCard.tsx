"use client";

import Link from "next/link";
import type { TeamCase } from "@/lib/api/team-culture";

export default function TeamCaseCard({ item }: { item: TeamCase }) {
  return (
    <Link
      href={`/team-culture/cases/${item.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:border-[#3264ff]/40 hover:-translate-y-1 transition-all"
    >
      {item.photos[0] && (
        <div
          className="h-56 bg-cover bg-center"
          style={{ backgroundImage: `url(${item.photos[0]})` }}
        />
      )}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
          {item.theme && (
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#3264ff] font-medium">
              {item.theme.title}
            </span>
          )}
          <span>{item.headcount} 人</span>
          {item.industry && <span>{item.industry}</span>}
        </div>
        <h3 className="text-lg font-bold mb-3 text-gray-900 group-hover:text-[#3264ff] transition">
          {item.teamName}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {item.story}
        </p>
        {item.testimonial && (
          <p className="mt-4 px-4 py-3 rounded-lg bg-blue-50/60 text-blue-800 text-sm italic border-l-4 border-[#3264ff]">
            &ldquo;{item.testimonial}&rdquo;
          </p>
        )}
      </div>
    </Link>
  );
}
