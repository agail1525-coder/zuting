import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchJournal, type JournalDetail as JournalDetailType } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const MOOD_MAP: Record<string, string> = {
  insight: "💡", joy: "😊", peace: "🕊️", awe: "🤩",
  awakening: "🧘", calm: "😌", touched: "🥹", excited: "🔥", devout: "🙏",
};

export default function JournalDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [journal, setJournal] = useState<JournalDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    if (!id) return;
    setLoading(true);
    setError("");
    fetchJournal(id)
      .then(setJournal)
      .catch(() => setError(t("journal.notFound")))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <><PageHeader title="" /><LoadingSpinner /></>;
  if (error || !journal) return <><PageHeader title="" /><ErrorState message={error} onRetry={load} /></>;

  const moodEmoji = journal.mood ? MOOD_MAP[journal.mood] || journal.mood : null;
  const moodLabel = journal.mood ? t(`journal.mood.${journal.mood}`) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={t("journal.listTitle")}
        right={
          <button onClick={() => nav(`/journals/${id}/edit`)} className="text-[var(--color-primary)] text-sm">
            {t("journal.edit")}
          </button>
        }
      />

      <div className="p-4">
        {/* Header */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            {moodEmoji && <span className="text-xl">{moodEmoji}</span>}
            <h1 className="font-bold text-lg text-gray-900 flex-1">{journal.title}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            {moodLabel && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{moodLabel}</span>}
            <span>{new Date(journal.createdAt).toLocaleDateString()}</span>
            <span className={journal.isPublic ? "text-green-500" : "text-gray-400"}>
              {journal.isPublic ? t("journal.publicTag") : t("journal.private")}
            </span>
          </div>
        </div>

        {/* Images */}
        {(journal.images?.length ?? 0) > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {journal.images.map((img, i) => (
              <img key={i} src={img} alt="" className="h-40 rounded-xl object-cover flex-shrink-0" />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-xl p-5 shadow-sm mt-3">
          <MarkdownRenderer content={journal.content || ""} />
        </div>

        {/* Linked trip */}
        {journal.trip && (
          <div
            onClick={() => nav(`/trips/${journal.trip!.id}`)}
            className="bg-white rounded-xl p-4 shadow-sm mt-3 flex items-center gap-3 active:bg-gray-50"
          >
            <span className="text-lg">🗺️</span>
            <div>
              <p className="text-xs text-gray-400">{t("journal.linkedTrip")}</p>
              <p className="text-sm font-medium text-gray-900">{journal.trip.title}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
