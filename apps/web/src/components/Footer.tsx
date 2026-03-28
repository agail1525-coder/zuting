"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer role="contentinfo" className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-[#0066FF]">Joinus</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 font-medium text-sm">
                {t("site.title")}
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t("footer.mission")}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t("footer.explore") || "探索"}</h3>
            <div className="flex flex-col gap-2">
              <Link href="/religions" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors">{t("nav.religions")}</Link>
              <Link href="/holy-sites" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors">{t("nav.holySites")}</Link>
              <Link href="/temples" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors">{t("nav.temples")}</Link>
              <Link href="/seals" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors">{t("nav.seals")}</Link>
            </div>
          </div>

          {/* Legal & Info */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t("footer.about")}</h3>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors" aria-label="关于我们 - About us">关于我们</Link>
              <Link href="/terms" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors" aria-label="用户协议 - Terms of service">用户协议</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors" aria-label="隐私政策 - Privacy policy">隐私政策</Link>
            </div>
          </div>
        </div>

        <div className="divider-gold mt-8 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Joinus.com. {t("footer.rights")}.
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-400 text-xs">
            备案审核中
          </p>
        </div>
      </div>
    </footer>
  );
}
