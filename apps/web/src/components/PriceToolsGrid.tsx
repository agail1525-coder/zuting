"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

interface Tool {
  labelKey: string;
  href: string;
  descKey: string;
  icon: React.ReactNode;
  accent: string;
}

const TOOLS: Tool[] = [
  {
    labelKey: "prices.hub.calendar",
    href: "/prices/calendar",
    descKey: "prices.hub.calendarDesc",
    accent: "from-blue-500 to-blue-600",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    labelKey: "prices.hub.compare",
    href: "/prices/compare",
    descKey: "prices.hub.compareDesc",
    accent: "from-emerald-500 to-emerald-600",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  {
    labelKey: "prices.hub.alerts",
    href: "/prices/alerts",
    descKey: "prices.hub.alertsDesc",
    accent: "from-amber-500 to-amber-600",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    labelKey: "prices.hub.trend",
    href: "/prices/trend",
    descKey: "prices.hub.trendDesc",
    accent: "from-purple-500 to-purple-600",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

export default function PriceToolsGrid() {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {TOOLS.map((tool) => (
        <Link
          key={tool.href}
          href={tool.href}
          className="group relative bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden"
        >
          <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${tool.accent} opacity-10 group-hover:opacity-20 transition-opacity`} />
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.accent} text-white flex items-center justify-center mb-3 shadow-sm`}>
            {tool.icon}
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-[#3264ff] transition-colors">{t(tool.labelKey as Parameters<typeof t>[0])}</h3>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{t(tool.descKey as Parameters<typeof t>[0])}</p>
        </Link>
      ))}
    </div>
  );
}
