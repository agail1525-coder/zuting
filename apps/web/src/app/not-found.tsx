"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* 404 number */}
        <div className="text-[120px] md:text-[160px] font-bold leading-none bg-gradient-to-b from-[#D4A855] to-[#D4A855]/30 bg-clip-text text-transparent select-none">
          404
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-3">
          {t("notFound.title")}
        </h1>

        {/* Description */}
        <p className="text-gray-400 mb-8 text-base">
          {t("notFound.description")}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#D4A855] to-[#B8922E] text-temple-900 font-semibold rounded-lg hover:from-[#E0B86A] hover:to-[#D4A855] transition-all shadow-lg shadow-[#D4A855]/20"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {t("common.backHome")}
          </Link>

          <Link
            href="/religions"
            className="inline-flex items-center px-6 py-3 border border-[#D4A855]/30 text-[#D4A855] rounded-lg hover:bg-[#D4A855]/10 transition-all"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {t("notFound.exploreFaiths")}
          </Link>
        </div>

        {/* Suggested links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-500 text-sm mb-4">{t("notFound.suggestions")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/holy-sites", label: t("nav.holySites") },
              { href: "/temples", label: t("nav.temples") },
              { href: "/map", label: t("nav.map") },
              { href: "/trips", label: t("nav.trips") },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 hover:text-[#D4A855] transition-colors px-3 py-1.5 rounded-full border border-white/10 hover:border-[#D4A855]/30"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
