import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchCollections, createCollection, type Collection } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function Collections() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [items, setItems] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    fetchCollections()
      .then(setItems)
      .catch(() => setError(t("common.error")))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createCollection({ name: newName.trim() });
      setNewName("");
      setShowCreate(false);
      load();
    } catch {
      /* ignore */
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={t("collections.title")}
        right={
          <button onClick={() => setShowCreate(true)} className="text-[var(--color-primary)] text-xl font-light">+</button>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="⭐"
          message={t("collections.empty")}
          action={{ label: t("collections.create"), onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="p-4 grid grid-cols-2 gap-3">
          {items.map((c) => (
            <div
              key={c.id}
              onClick={() => nav(`/collections/${c.id}`)}
              className="bg-white rounded-xl overflow-hidden shadow-sm active:bg-gray-50"
            >
              <div className="h-28 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                {c.coverImage ? (
                  <img src={c.coverImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">📁</span>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-gray-900 truncate">{c.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {c._count?.items ?? c.items?.length ?? 0} {t("collections.items")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setShowCreate(false)}>
          <div className="w-full bg-white rounded-t-2xl p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-base mb-4">{t("collections.create")}</h3>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("collections.namePlaceholder")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="w-full mt-4 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {creating ? t("collections.creating") : t("collections.create")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
