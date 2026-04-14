"use client";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-4">
              <Image src="/logo-dark.png" alt="Joinus 佳绩之旅" width={180} height={40} className="h-10 w-auto" />
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              {t("footer.mission") || "加入我们，探索世界。发现全球文化遗产，体验千年智慧之旅。"}
            </p>
          </div>

          {/* Explore Column */}
          <div>
            <h3 className="text-gray-900 font-semibold text-sm mb-4">{t("footer.explore") || "探索"}</h3>
            <div className="flex flex-col gap-2.5">
              <Link href="/holy-sites" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors">目的地</Link>
              <Link href="/religions" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors">文化百科</Link>
              <Link href="/chat" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors">AI助手</Link>
              <Link href="/map" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors">地图</Link>
            </div>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-gray-900 font-semibold text-sm mb-4">{t("footer.support") || "支持"}</h3>
            <div className="flex flex-col gap-2.5">
              <Link href="/about" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors">关于我们</Link>
              <Link href="/terms" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors">用户协议</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors">隐私政策</Link>
            </div>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-gray-900 font-semibold text-sm mb-4">{t("footer.contact") || "联系"}</h3>
            <div className="flex flex-col gap-2.5">
              <span className="text-gray-500 text-sm">support@joinus.com</span>
              <div className="flex gap-3 mt-2">
                {/* Social icons as simple text links */}
                <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#0066FF] hover:text-white transition-colors cursor-pointer text-xs">微</span>
                <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#0066FF] hover:text-white transition-colors cursor-pointer text-xs">博</span>
                <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#0066FF] hover:text-white transition-colors cursor-pointer text-xs">X</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Joinus.com. {t("footer.rights") || "All rights reserved"}.
            </p>
            <p className="text-gray-400 text-xs">备案审核中</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
