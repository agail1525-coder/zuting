import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-[#0f172a] text-white/80 mt-8">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="col-span-2 md:col-span-1">
            <img src="/logo-dark.png" alt="Joinus 佳绩之旅" className="h-10 w-auto mb-3 bg-white/95 px-2 py-1 rounded" />
            <p className="text-white/60 text-sm leading-relaxed">
              {t("footer.mission") || "加入我们，探索世界"}
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">{t("footer.explore") || "探索"}</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/holy-sites" className="text-white/60 hover:text-white transition-colors">{t("nav.destinations")}</Link>
              <Link to="/religions" className="text-white/60 hover:text-white transition-colors">{t("nav.wiki")}</Link>
              <Link to="/chat" className="text-white/60 hover:text-white transition-colors">{t("nav.aiPlanner")}</Link>
              <Link to="/map" className="text-white/60 hover:text-white transition-colors">{t("nav.map")}</Link>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">{t("footer.support") || "支持"}</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/about" className="text-white/60 hover:text-white transition-colors">{t("footer.about")}</Link>
              <Link to="/terms" className="text-white/60 hover:text-white transition-colors">{t("footer.terms")}</Link>
              <Link to="/privacy" className="text-white/60 hover:text-white transition-colors">{t("footer.privacy")}</Link>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">{t("footer.contact") || "联系"}</h3>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <span>support@joinus.com</span>
              <div className="flex gap-2 mt-1">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#3264ff] transition-colors cursor-pointer text-xs">微</span>
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#3264ff] transition-colors cursor-pointer text-xs">博</span>
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#3264ff] transition-colors cursor-pointer text-xs">X</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/50 text-xs">
            © {new Date().getFullYear()} JOINUS.COM — {t("footer.mission") || "加入我们，探索世界"}
          </p>
          <p className="text-white/40 text-xs">{t("footer.rights") || "版权所有"}</p>
        </div>
      </div>
    </footer>
  );
}
