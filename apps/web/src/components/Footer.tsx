"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer role="contentinfo" className="border-t border-gold/10 bg-temple-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏛</span>
              <span className="text-gradient-gold font-serif font-bold text-lg">
                {t("site.title")}
              </span>
            </div>
            <p className="text-temple-400 text-sm leading-relaxed">
              {t("footer.mission")}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-gold font-semibold mb-4">Explore</h3>
            <div className="flex flex-col gap-2">
              <Link href="/religions" className="text-temple-400 hover:text-gold text-sm transition-colors">{t("nav.religions")}</Link>
              <Link href="/holy-sites" className="text-temple-400 hover:text-gold text-sm transition-colors">{t("nav.holySites")}</Link>
              <Link href="/temples" className="text-temple-400 hover:text-gold text-sm transition-colors">{t("nav.temples")}</Link>
              <Link href="/seals" className="text-temple-400 hover:text-gold text-sm transition-colors">{t("nav.seals")}</Link>
            </div>
          </div>

          {/* Legal & Info */}
          <div>
            <h3 className="text-gold font-semibold mb-4">{t("footer.about")}</h3>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-temple-400 hover:text-gold text-sm transition-colors" aria-label="关于我们 - About us">关于我们</Link>
              <Link href="/terms" className="text-temple-400 hover:text-gold text-sm transition-colors" aria-label="用户协议 - Terms of service">用户协议</Link>
              <Link href="/privacy" className="text-temple-400 hover:text-gold text-sm transition-colors" aria-label="隐私政策 - Privacy policy">隐私政策</Link>
            </div>
          </div>
        </div>

        <div className="divider-gold mt-8 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-temple-500 text-sm">
            &copy; {new Date().getFullYear()} {t("site.title")}. {t("footer.rights")}.
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-temple-600 text-xs">
            粤ICP备XXXXXXXX号
          </p>
        </div>
      </div>
    </footer>
  );
}
