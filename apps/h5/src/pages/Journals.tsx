import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchJournals, type JournalItem } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

const MOOD_MAP: Record<string, string> = {
  insight: "💡", joy: "😊", peace: "🕊️", awe: "🤩",
  awakening: "🧘", calm: "😌", touched: "🥹", excited: "🔥", devout: "🙏",
};

export default function Journals() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [items, setItems] = useState<JournalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    fetchJournals()
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError(t("journal.loadFailed")))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("journal.listTitle")} />

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="📝"
          message={t("journal.emptyTitle")}
          action={{ label: t("journal.writeFirst"), onClick: () => nav("/journals/create") }}
        />
      ) : (
        <div className="p-4 space-y-3">
          {items.map((j) => (
            <div
              key={j.id}
              onClick={() => nav(`/journals/${j.id}`)}
              className="bg-white rounded-xl p-4 shadow-sm active:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 text-sm flex-1 line-clamp-1">{j.title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${j.isPublic ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                  {j.isPublic ? t("journal.publicTag") : t("journal.private")}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{j.content}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span>{j.mood ? MOOD_MAP[j.mood] || j.mood : ""} {new Date(j.createdAt).toLocaleDateString()}</span>
                {j.images.length > 0 && <span>🖼 {j.images.length}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => nav("/journals/create")}
        className="fixed bottom-20 right-4 w-12 h-12 bg-[var(--color-primary)] text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-30"
      >
        +
      </button>
    </div>
  );
}
