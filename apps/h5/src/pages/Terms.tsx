import { useTranslation } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";

const SECTIONS = [
  { titleKey: "terms.acceptance.title", contentKey: "terms.acceptance.content" },
  { titleKey: "terms.services.title", contentKey: "terms.services.content" },
  { titleKey: "terms.accounts.title", contentKey: "terms.accounts.content" },
  { titleKey: "terms.booking.title", contentKey: "terms.booking.content" },
  { titleKey: "terms.payment.title", contentKey: "terms.payment.content" },
  { titleKey: "terms.cancellation.title", contentKey: "terms.cancellation.content" },
  { titleKey: "terms.content.title", contentKey: "terms.content.content" },
  { titleKey: "terms.liability.title", contentKey: "terms.liability.content" },
  { titleKey: "terms.disputes.title", contentKey: "terms.disputes.content" },
  { titleKey: "terms.changes.title", contentKey: "terms.changes.content" },
];

export default function Terms() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title={t("auth.termsOfService")} />
      <div className="px-4 py-5 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{t("auth.termsOfService")}</h1>
        <p className="text-xs text-gray-400 mb-5">{t("site.title")} - Joinus.com</p>
        {SECTIONS.map((s, i) => {
          const title = t(s.titleKey);
          const content = t(s.contentKey);
          const hasContent = content !== s.contentKey;
          return (
            <section key={i} className="mb-5">
              <h2 className="text-base font-semibold text-gray-900 mb-2">{title !== s.titleKey ? title : `${i + 1}. Section ${i + 1}`}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {hasContent ? content : `This section outlines the ${title !== s.titleKey ? title.toLowerCase() : `section ${i + 1}`} of our terms. By using Joinus.com, you agree to these terms. Our platform connects travelers with cultural heritage and pilgrimage experiences worldwide. Please read all terms carefully. For questions, contact support@joinus.com.`}
              </p>
            </section>
          );
        })}
        <p className="text-xs text-gray-400 mt-6 text-center">{t("about.icp")}</p>
      </div>
    </div>
  );
}
