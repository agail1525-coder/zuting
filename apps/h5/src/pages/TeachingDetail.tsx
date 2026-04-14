import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchTeaching, fetchTeachings, type Teaching } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import FAQSection from "@/components/FAQSection";

export default function TeachingDetail() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [teaching, setTeaching] = useState<Teaching | null>(null);
  const [related, setRelated] = useState<Teaching[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const tc = await fetchTeaching(id!);
        if (cancelled) return;
        setTeaching(tc);
        // Load same-religion teachings
        if (tc.religionId) {
          const all = await fetchTeachings(tc.religionId).catch(() => []);
          if (!cancelled) setRelated(all.filter((x) => x.id !== tc.id));
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
  if (error || !teaching) return <><PageHeader title="" /><ErrorState message={error ?? undefined} /></>;

  const religionName = teaching.religion?.name || "";

  const insights = [
    { icon: "💎", text: t("teachingDetail.insightCore", { religion: religionName }) },
    { icon: "📿", text: t("teachingDetail.insightRecite") },
    { icon: "📝", text: t("teachingDetail.insightJournal") },
  ];

  const faqItems = [
    { question: t("teachingDetail.faqCoreMeaning", { name: teaching.name }), answer: t("teachingDetail.faqCoreMeaningAnswer", { religion: religionName }) },
    { question: t("teachingDetail.faqPractice"), answer: t("teachingDetail.faqPracticeAnswer") },
    { question: t("teachingDetail.faqSuggestions"), answer: t("teachingDetail.faqSuggestionsAnswer") },
    { question: t("teachingDetail.faqRecord"), answer: t("teachingDetail.faqRecordAnswer") },
  ];

  return (
    <div className="pb-20">
      <PageHeader title={teaching.name} />

      {/* Title card */}
      <div className="mx-4 mt-4 p-5 bg-gradient-to-br from-[#3264ff]/5 to-[#3264ff]/10 rounded-xl">
        <h1 className="text-lg font-bold text-gray-900 text-center">{teaching.name}</h1>
        {teaching.religion && (
          <div className="flex justify-center mt-2">
            <span
              className="text-xs px-2.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: teaching.religion.color || "#666" }}
            >
              {teaching.religion.symbol} {teaching.religion.name}
            </span>
          </div>
        )}
      </div>

      {/* Original text */}
      <section className="px-4 mt-5">
        <h2 className="font-bold text-sm text-gray-900 mb-3">{t("teachingDetail.source")}</h2>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-50">
          <p className="text-base text-gray-800 leading-relaxed whitespace-pre-line font-serif">{teaching.originalText}</p>
        </div>
      </section>

      {/* Source */}
      {teaching.sourceText && (
        <div className="px-4 mt-3">
          <div className="p-3 bg-gray-50 rounded-lg border-l-2 border-[#3264ff]">
            <p className="text-sm text-gray-600">— {teaching.sourceText}</p>
          </div>
        </div>
      )}

      {/* Translation */}
      {teaching.translationCn && (
        <section className="px-4 mt-5">
          <h2 className="font-bold text-sm text-gray-900 mb-2">{t("teachingDetail.tradition")}</h2>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-50">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{teaching.translationCn}</p>
          </div>
        </section>
      )}

      {/* Practice insights */}
      <section className="px-4 mt-5">
        <h2 className="font-bold text-sm text-gray-900 mb-3">{t("teachingDetail.practiceInsights")}</h2>
        <div className="space-y-3">
          {insights.map((item, i) => (
            <div key={i} className="flex gap-3 items-start bg-amber-50 rounded-xl p-3">
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <p className="text-xs text-gray-700 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Journal CTA */}
      <div className="mx-4 mt-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white">
        <h3 className="text-sm font-bold">{t("teachingDetail.recordInsights")}</h3>
        <p className="text-xs text-white/70 mt-1">{t("teachingDetail.recordInsightsDesc")}</p>
        <button
          onClick={() => nav("/journals/new")}
          className="mt-3 px-4 py-2 bg-white rounded-full text-sm font-medium text-amber-600 active:opacity-80"
        >
          {t("teachingDetail.writeJournal")}
        </button>
      </div>

      {/* AI CTA */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white">
        <h3 className="text-sm font-bold">{t("teachingDetail.askAiAbout")}</h3>
        <button
          onClick={() => nav("/chat")}
          className="mt-3 px-4 py-2 bg-white rounded-full text-sm font-medium text-indigo-600 active:opacity-80"
        >
          {t("teachingDetail.askAiAbout")}
        </button>
      </div>

      {/* Related teachings */}
      {related.length > 0 && (
        <section className="mt-6">
          <h2 className="font-bold text-sm text-gray-900 px-4 mb-3">{t("teachingDetail.sameSeriesTeachings")}</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
            {related.slice(0, 6).map((tc) => (
              <Link
                key={tc.id}
                to={`/teachings/${tc.id}`}
                className="flex-shrink-0 w-48 p-3 bg-white rounded-xl shadow-sm border border-gray-50"
              >
                <h3 className="text-xs font-semibold text-gray-900 line-clamp-1">{tc.name}</h3>
                <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{tc.originalText}</p>
                {tc.sourceText && <p className="text-[10px] text-gray-400 mt-1">— {tc.sourceText}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <FAQSection title={t("teachingDetail.faq")} items={faqItems} />
    </div>
  );
}
