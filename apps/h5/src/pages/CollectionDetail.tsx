import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchCollection, type Collection } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

const ENTITY_ICONS: Record<string, string> = {
  HOLY_SITE: "🏛️", TEMPLE: "⛩️", ROUTE: "🗺️", PATRIARCH: "👤", SEAL: "🔮",
};

export default function CollectionDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [col, setCol] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    if (!id) return;
    setLoading(true);
    setError("");
    fetchCollection(id)
      .then(setCol)
      .catch(() => setError(t("collections.notFound")))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleShare = async () => {
    if (!col?.shareToken) return;
    const url = `${window.location.origin}/collections/shared/${col.shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  };

  if (loading) return <><PageHeader title="" /><LoadingSpinner /></>;
  if (error || !col) return <><PageHeader title="" /><ErrorState message={error} onRetry={load} /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={col.name}
        right={
          <button onClick={handleShare} className="text-[var(--color-primary)] text-sm">
            {t("collections.share")}
          </button>
        }
      />

      {/* Info card */}
      <div className="mx-4 mt-3 bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-gray-900">{col.name}</h2>
            {col.description && <p className="text-xs text-gray-500 mt-1">{col.description}</p>}
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${col.isPublic ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
            {col.isPublic ? t("collections.public") : t("collections.private")}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {col.items.length} {t("collections.items")} · {new Date(col.updatedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Items */}
      {col.items.length === 0 ? (
        <EmptyState icon="📭" message={t("collections.noItems")} action={{ label: t("collections.addItems"), onClick: () => nav("/holy-sites") }} />
      ) : (
        <div className="p-4 space-y-2">
          {col.items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
              <span className="text-xl">{ENTITY_ICONS[item.entityType] || "📌"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{t(`collections.entityType.${item.entityType}`)}</p>
                {item.note && <p className="text-xs text-gray-400 truncate">{item.note}</p>}
              </div>
              <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
