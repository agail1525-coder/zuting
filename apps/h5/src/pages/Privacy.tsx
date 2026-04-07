import { useTranslation } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";

const SECTIONS = [
  { titleKey: "privacy.collect.title", contentKey: "privacy.collect.content" },
  { titleKey: "privacy.use.title", contentKey: "privacy.use.content" },
  { titleKey: "privacy.share.title", contentKey: "privacy.share.content" },
  { titleKey: "privacy.security.title", contentKey: "privacy.security.content" },
  { titleKey: "privacy.cookies.title", contentKey: "privacy.cookies.content" },
  { titleKey: "privacy.rights.title", contentKey: "privacy.rights.content" },
  { titleKey: "privacy.children.title", contentKey: "privacy.children.content" },
  { titleKey: "privacy.changes.title", contentKey: "privacy.changes.content" },
  { titleKey: "privacy.contact.title", contentKey: "privacy.contact.content" },
];

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title={t("auth.privacyPolicy")} />
      <div className="px-4 py-5 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{t("auth.privacyPolicy")}</h1>
        <p className="text-xs text-gray-400 mb-5">{t("site.title")} - Joinus.com</p>
        {SECTIONS.map((s, i) => {
          const title = t(s.titleKey);
          const content = t(s.contentKey);
          // If the i18n key is missing (returns the key itself), show a generic placeholder
          const hasContent = content !== s.contentKey;
          return (
            <section key={i} className="mb-5">
              <h2 className="text-base font-semibold text-gray-900 mb-2">{title !== s.titleKey ? title : `${i + 1}. Section ${i + 1}`}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {hasContent ? content : `This section covers the ${title !== s.titleKey ? title.toLowerCase() : `section ${i + 1}`} of our privacy practices. We are committed to protecting your personal information and being transparent about how we collect, use, and safeguard your data. Please contact us at support@joinus.com for any privacy-related inquiries.`}
              </p>
            </section>
          );
        })}
        <p className="text-xs text-gray-400 mt-6 text-center">{t("about.icp")}</p>
      </div>
    </div>
  );
}
