import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchSeal, type Seal } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import PageHeader from "@/components/PageHeader";

const seriesAccent: Record<string, string> = {
  CHUYIN: "text-cyan-600 border-cyan-200 bg-cyan-50",
  ZHONGYIN: "text-blue-600 border-blue-200 bg-blue-50",
  YINGUOYIN: "text-purple-600 border-purple-200 bg-purple-50",
  CHENGDAOYIN: "text-red-600 border-red-200 bg-red-50",
  GUIYUANYIN: "text-amber-600 border-amber-200 bg-amber-50",
};

export default function SealDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [seal, setSeal] = useState<Seal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchSeal(Number(id))
      .then(setSeal)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <><PageHeader title="" /><LoadingSpinner /></>;
  if (error || !seal) return <><PageHeader title="" /><ErrorState message={error} onRetry={() => window.location.reload()} /></>;

  const accent = seriesAccent[seal.series] || seriesAccent.CHUYIN;

  const sections = [
    { label: t("seal.poem"), content: seal.poem },
    { label: t("seal.essence"), content: seal.essence },
    { label: t("seal.practice"), content: seal.practice },
    { label: t("seal.vow"), content: seal.vow },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={seal.name} />

      {/* Header */}
      <div className={`mx-4 mt-3 rounded-xl p-5 text-center ${accent}`}>
        <span className="inline-block px-3 py-1 text-[10px] font-medium rounded-full border mb-3">
          {t(`seal.series.${seal.series}`)}
        </span>
        <h1 className="text-2xl font-bold">{seal.name}</h1>
      </div>

      {/* Sections */}
      <div className="px-4 mt-4 space-y-4 pb-8">
        {sections.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-2">{s.label}</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
