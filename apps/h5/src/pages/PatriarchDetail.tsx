import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchPatriarch, fetchTeachings, type Patriarch, type Teaching } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import StickyTabBar from "@/components/StickyTabBar";
import FAQSection from "@/components/FAQSection";

type Tab = "overview" | "biography" | "teaching" | "teachings" | "reviews" | "faq";

export default function PatriarchDetail() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [patriarch, setPatriarch] = useState<Patriarch | null>(null);
  const [relatedTeachings, setRelatedTeachings] = useState<Teaching[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedKoan, setExpandedKoan] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const p = await fetchPatriarch(id!);
        if (cancelled) return;
        setPatriarch(p);
        // Load related teachings from same religion
        if (p.religionId) {
          const tc = await fetchTeachings(p.religionId).catch(() => []);
          if (!cancelled) setRelatedTeachings(tc);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <><PageHeader title="" /><LoadingSpinner size="lg" /></>;
  if (error || !patriarch) return <><PageHeader title="" /><ErrorState message={error ?? undefined} /></>;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: t("patriarchDetail.navOverview") },
    { key: "biography", label: t("patriarchDetail.navBiography") },
    { key: "teaching", label: t("patriarchDetail.navCoreTeaching") },
    { key: "teachings", label: t("patriarchDetail.navRelatedTeachings") },
    { key: "reviews", label: t("patriarchDetail.navReviews") },
    { key: "faq", label: t("patriarchDetail.navFaq") },
  ];

  const faqItems = [
    { question: t("patriarchDetail.faqContribution", { name: patriarch.name }), answer: t("patriarchDetail.faqContributionAnswer", { name: patriarch.name }) },
    { question: t("patriarchDetail.faqVisitRelics"), answer: t("patriarchDetail.faqVisitRelicsAnswer") },
    { question: t("patriarchDetail.faqReadings"), answer: t("patriarchDetail.faqReadingsAnswer") },
    { question: t("patriarchDetail.faqDeepStudy"), answer: t("patriarchDetail.faqDeepStudyAnswer") },
  ];

  const quickInfo = [
    patriarch.title ? { label: t("patriarchDetail.titleLabel"), value: patriarch.title } : null,
    patriarch.dates ? { label: t("patriarchDetail.eraLabel"), value: patriarch.dates } : null,
    patriarch.religion ? { label: t("patriarchDetail.faithTradition"), value: `${patriarch.religion.symbol} ${patriarch.religion.name}` } : null,
    patriarch.school ? { label: t("patriarchDetail.schoolFounder"), value: patriarch.school } : null,
    patriarch.generation ? { label: t("patriarchDetail.lineage"), value: String(patriarch.generation) } : null,
  ].filter((x): x is { label: string; value: string } => x !== null);

  const learningPath = [
    { step: 1, icon: "📖", title: t("patriarchDetail.learnBio"), desc: t("patriarchDetail.learnBioDesc", { name: patriarch.name }) },
    { step: 2, icon: "🧠", title: t("patriarchDetail.learnTeaching"), desc: t("patriarchDetail.learnTeachingDesc") },
    { step: 3, icon: "🗺️", title: t("patriarchDetail.learnPilgrimage"), desc: t("patriarchDetail.learnPilgrimageDesc") },
  ];

  return (
    <div className="pb-20">
      <PageHeader title={patriarch.name} />

      {/* Profile header */}
      <div className="flex flex-col items-center px-4 pt-6 pb-4 bg-gradient-to-b from-gray-50 to-white">
        {patriarch.imageUrl ? (
          <img src={patriarch.imageUrl} alt={patriarch.name} className="w-24 h-24 rounded-full object-cover shadow-md" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center text-4xl shadow-md">🧘</div>
        )}
        <h1 className="text-xl font-bold text-gray-900 mt-3">{patriarch.name}</h1>
        {patriarch.nameEn && <p className="text-sm text-gray-500">{patriarch.nameEn}</p>}
        {patriarch.title && (
          <span className="mt-2 text-xs px-3 py-1 bg-[#3264ff]/10 text-[#3264ff] rounded-full font-medium">{patriarch.title}</span>
        )}
        {patriarch.dates && <p className="text-xs text-gray-400 mt-1">{patriarch.dates}</p>}
        <div className="flex items-center gap-2 mt-2">
          {patriarch.religion && (
            <span className="text-xs px-2.5 py-0.5 rounded-full text-white" style={{ backgroundColor: patriarch.religion.color || "#666" }}>
              {patriarch.religion.symbol} {patriarch.religion.name}
            </span>
          )}
          {patriarch.school && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">{patriarch.school}</span>
          )}
        </div>
      </div>

      {/* Sticky Tabs */}
      <StickyTabBar tabs={tabs} activeTab={tab} onTabChange={(k) => setTab(k as Tab)} />

      {/* Tab content */}
      <div className="mt-4">
        {tab === "overview" ? (
          <div>
            {/* Quick info card */}
            {quickInfo.length > 0 && (
              <div className="mx-4 bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">{t("patriarchDetail.quickOverview")}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickInfo.map((item, i) => (
                    <div key={i}>
                      <p className="text-[10px] text-gray-400">{item.label}</p>
                      <p className="text-xs font-medium text-gray-800 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Core teaching preview */}
            {patriarch.coreTeaching && (
              <section className="mx-4 mt-4 p-4 bg-[#3264ff]/5 rounded-xl border border-[#3264ff]/10">
                <h2 className="font-bold text-sm text-[#3264ff] mb-2">{t("patriarchDetail.coreTeaching")}</h2>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{patriarch.coreTeaching}</p>
                <button onClick={() => setTab("teaching")} className="text-xs text-blue-600 mt-1">{t("patriarchDetail.learnMore")}</button>
              </section>
            )}

            {/* Lineage: teacher → self → disciples */}
            {(patriarch.teacher || (patriarch.disciples && patriarch.disciples.length > 0)) && (
              <section className="px-4 mt-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">{t("patriarchDetail.lineage")}</h3>
                <div className="relative pl-6">
                  {/* Vertical line */}
                  <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-200" />

                  {/* Teacher */}
                  {patriarch.teacher && (
                    <div className="relative mb-4">
                      <div className="absolute -left-3.5 top-1 w-3 h-3 rounded-full bg-blue-400 border-2 border-white" />
                      <Link to={`/patriarchs/${patriarch.teacher.id}`} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        {patriarch.teacher.imageUrl ? (
                          <img src={patriarch.teacher.imageUrl} alt={patriarch.teacher.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">🧘</div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{patriarch.teacher.name}</p>
                          {patriarch.teacher.title && <p className="text-[10px] text-gray-500">{patriarch.teacher.title}</p>}
                        </div>
                        <span className="text-gray-400 ml-auto text-xs">›</span>
                      </Link>
                    </div>
                  )}

                  {/* Self */}
                  <div className="relative mb-4">
                    <div className="absolute -left-3.5 top-1 w-3 h-3 rounded-full bg-[#3264ff] border-2 border-white ring-2 ring-blue-200" />
                    <div className="p-2 bg-[#3264ff]/10 rounded-lg border border-[#3264ff]/20">
                      <p className="text-xs font-bold text-[#3264ff]">{patriarch.name}</p>
                      {patriarch.generation && <p className="text-[10px] text-gray-500">{t("patriarchDetail.lineage")} · {patriarch.generation}</p>}
                    </div>
                  </div>

                  {/* Disciples */}
                  {patriarch.disciples && patriarch.disciples.map((d) => (
                    <div key={d.id} className="relative mb-3">
                      <div className="absolute -left-3.5 top-1 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                      <Link to={`/patriarchs/${d.id}`} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        {d.imageUrl ? (
                          <img src={d.imageUrl} alt={d.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm">🧘</div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{d.name}</p>
                          {d.title && <p className="text-[10px] text-gray-500">{d.title}</p>}
                        </div>
                        <span className="text-gray-400 ml-auto text-xs">›</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Related temples */}
            {patriarch.templeNames && patriarch.templeNames.length > 0 && (
              <section className="px-4 mt-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">{t("templeDetail.sameReligionTemples")}</h3>
                <div className="space-y-2">
                  {patriarch.templeNames.map((tm, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white rounded-xl shadow-sm p-3">
                      <span className="text-xl">🏯</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">{tm.name}</p>
                        {tm.role && <p className="text-[10px] text-gray-500">{tm.role}</p>}
                        {tm.location && <p className="text-[10px] text-gray-400">{tm.location}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Learning path */}
            <section className="px-4 mt-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">{t("patriarchDetail.learningPath")}</h3>
              <div className="space-y-3">
                {learningPath.map((item) => (
                  <div key={item.step} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-[#3264ff] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <span>{item.icon}</span> {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* AI CTA */}
            <div className="mx-4 mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-center text-white">
              <h3 className="text-base font-bold">{t("patriarchDetail.aiDeepAnalysis")}</h3>
              <button
                onClick={() => nav("/chat")}
                className="mt-3 px-5 py-2 bg-white rounded-full text-sm font-medium text-indigo-600 active:opacity-80"
              >
                {t("patriarchDetail.aiDeepAnalysis")}
              </button>
            </div>
          </div>
        ) : tab === "biography" ? (
          <div className="px-4">
            {patriarch.biography ? (
              <div>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{patriarch.biography}</p>
                {/* Achievements */}
                {patriarch.achievements && (
                  <section className="mt-5">
                    <h3 className="font-bold text-sm text-gray-900 mb-2">{t("nav.patriarchs")}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{patriarch.achievements}</p>
                  </section>
                )}
                {/* Classic quotes */}
                {patriarch.classicQuotes && patriarch.classicQuotes.length > 0 && (
                  <section className="mt-5">
                    <h3 className="font-bold text-sm text-gray-900 mb-2">{t("nav.teachings")}</h3>
                    <div className="space-y-2">
                      {patriarch.classicQuotes.map((q, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg border-l-2 border-[#3264ff]">
                          <p className="text-sm text-gray-700 italic">{q}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {/* Works */}
                {patriarch.works && patriarch.works.length > 0 && (
                  <section className="mt-5">
                    <h3 className="font-bold text-sm text-gray-900 mb-2">{t("nav.teachings")}</h3>
                    <div className="space-y-2">
                      {patriarch.works.map((w, i) => (
                        <div key={i} className="p-3 bg-white rounded-lg shadow-sm border border-gray-50">
                          <h4 className="text-sm font-semibold text-gray-900">{w.title}</h4>
                          {w.description && <p className="text-xs text-gray-500 mt-1">{w.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <EmptyState icon="📖" />
            )}
          </div>
        ) : tab === "teaching" ? (
          <div className="px-4">
            {patriarch.coreTeaching ? (
              <div>
                <div className="p-4 bg-[#3264ff]/5 rounded-xl border border-[#3264ff]/10">
                  <p className="text-sm text-gray-700 leading-relaxed">{patriarch.coreTeaching}</p>
                </div>

                {/* Koans */}
                {patriarch.koans && patriarch.koans.length > 0 && (
                  <section className="mt-5">
                    <h3 className="font-bold text-sm text-gray-900 mb-3">{t("nav.teachings")}</h3>
                    <div className="space-y-3">
                      {patriarch.koans.map((koan, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-50 overflow-hidden">
                          <button
                            onClick={() => setExpandedKoan(expandedKoan === i ? null : i)}
                            className="w-full text-left p-4 flex items-center justify-between"
                          >
                            <h4 className="text-sm font-semibold text-gray-900">{koan.title}</h4>
                            <span className={`text-gray-400 text-sm transition-transform ${expandedKoan === i ? "rotate-180" : ""}`}>▼</span>
                          </button>
                          {expandedKoan === i && (
                            <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                              <p className="text-sm text-gray-600 leading-relaxed">{koan.content}</p>
                              {koan.source && <p className="text-[10px] text-gray-400 mt-2">— {koan.source}</p>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <EmptyState icon="🧠" />
            )}
          </div>
        ) : tab === "teachings" ? (
          <div className="px-4">
            {relatedTeachings.length === 0 ? (
              <EmptyState icon="📜" />
            ) : (
              <div className="space-y-3">
                {relatedTeachings.map((tc) => (
                  <Link key={tc.id} to={`/teachings/${tc.id}`} className="block p-4 bg-white rounded-xl shadow-sm border border-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{tc.name}</h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">{tc.originalText}</p>
                    {tc.sourceText && <p className="text-[10px] text-gray-400 mt-1">— {tc.sourceText}</p>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : tab === "reviews" ? (
          <div className="px-4">
            <EmptyState icon="⭐" />
          </div>
        ) : (
          <FAQSection title={t("patriarchDetail.faq")} items={faqItems} />
        )}
      </div>
    </div>
  );
}
