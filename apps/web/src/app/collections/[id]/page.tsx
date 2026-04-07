"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import {
  fetchCollection,
  updateCollection,
  removeFromCollection,
  generateShareLink,
  type Collection,
  type CollectionItem,
  type CollectionEntityType,
} from "@/lib/api";
import MobileNav from "@/components/MobileNav";

const ENTITY_TYPE_I18N_KEYS: Record<CollectionEntityType, string> = {
  HOLY_SITE: "collections.entityType.holySite",
  TEMPLE: "collections.entityType.temple",
  PATRIARCH: "collections.entityType.patriarch",
  TRIP: "collections.entityType.trip",
  ROUTE: "collections.entityType.route",
};

const ENTITY_TYPE_COLORS: Record<CollectionEntityType, string> = {
  HOLY_SITE: "bg-amber-100 text-amber-700",
  TEMPLE: "bg-blue-100 text-blue-700",
  PATRIARCH: "bg-purple-100 text-purple-700",
  TRIP: "bg-green-100 text-green-700",
  ROUTE: "bg-cyan-100 text-cyan-700",
};

const ENTITY_TYPE_LINKS: Record<CollectionEntityType, string> = {
  HOLY_SITE: "/holy-sites",
  TEMPLE: "/temples",
  PATRIARCH: "/patriarchs",
  TRIP: "/trips",
  ROUTE: "/holy-sites#routes",
};

function CollectionItemCard({
  item,
  onRemove,
  t,
  locale,
}: {
  item: CollectionItem;
  onRemove: (id: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: string;
}) {
  const [removing, setRemoving] = useState(false);
  const link = `${ENTITY_TYPE_LINKS[item.entityType]}/${item.entityId}`;

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);
    onRemove(item.id);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all group">
      {/* Type badge */}
      <span
        className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${ENTITY_TYPE_COLORS[item.entityType]}`}
      >
        {t(ENTITY_TYPE_I18N_KEYS[item.entityType])}
      </span>

      {/* Entity info */}
      <div className="flex-1 min-w-0">
        <Link
          href={link}
          className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block transition-colors"
        >
          {item.entityId}
        </Link>
        {item.note && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{item.note}</p>
        )}
        <p className="text-xs text-gray-300 mt-0.5">
          {new Date(item.createdAt).toLocaleDateString(locale)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={link}
          className="text-xs text-blue-600 hover:text-blue-800 transition-colors opacity-0 group-hover:opacity-100"
        >
          {t("collections.detail.view")}
        </Link>
        <button
          onClick={handleRemove}
          disabled={removing}
          className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
          aria-label={t("collections.detail.removeLabel")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ShareModal({
  shareUrl,
  onClose,
  t,
}: {
  shareUrl: string;
  onClose: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{t("collections.share.title")}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">{t("collections.share.desc")}</p>

        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              copied
                ? "bg-green-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {copied ? t("collections.share.copied") : t("collections.share.copy")}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({
  collection,
  onClose,
  onUpdate,
  t,
}: {
  collection: Collection;
  onClose: () => void;
  onUpdate: (updated: Collection) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description ?? "");
  const [isPublic, setIsPublic] = useState(collection.isPublic);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError(t("collections.edit.nameRequired")); return; }
    setLoading(true);
    setError(null);
    try {
      const updated = await updateCollection(collection.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
      });
      onUpdate(updated);
    } catch {
      setError(t("collections.edit.updateFailed"));
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{t("collections.edit.title")}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("collections.edit.nameLabel")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("collections.edit.descLabel")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={200}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-10 h-6 rounded-full transition-colors ${isPublic ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? "translate-x-5" : "translate-x-1"}`} />
            </button>
            <span className="text-sm text-gray-700">{t("collections.edit.publicToggle")}</span>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">{t("collections.edit.cancel")}</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50">
              {loading ? t("collections.edit.saving") : t("collections.edit.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharingLoading, setSharingLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !id) return;
    fetchCollection(id)
      .then((c) => {
        setCollection(c);
        setItems(c.items);
      })
      .catch((err) => { console.error('Fetch collection detail failed:', err); })
      .finally(() => setLoading(false));
  }, [user, id]);

  const handleRemoveItem = async (itemId: string) => {
    if (!collection) return;
    try {
      await removeFromCollection(collection.id, itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch {
      /* ignore */
    }
  };

  const handleShare = async () => {
    if (!collection) return;
    if (shareUrl) { setShareUrl(shareUrl); return; }
    setSharingLoading(true);
    try {
      const result = await generateShareLink(collection.id);
      setShareUrl(result.shareUrl);
    } catch {
      /* ignore */
    } finally {
      setSharingLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{t("collections.detail.notFound")}</p>
          <Link href="/collections" className="text-blue-600 hover:underline text-sm">{t("collections.detail.backToCollections")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 pb-24">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/collections" className="hover:text-blue-600 transition-colors">{t("collections.detail.breadcrumb")}</Link>
            <span>/</span>
            <span className="text-gray-600">{collection.name}</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{collection.name}</h1>
                {collection.isPublic && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">{t("collections.card.public")}</span>
                )}
              </div>
              {collection.description && (
                <p className="text-sm text-gray-500 mt-2">{collection.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">{t("collections.card.items", { count: items.length })}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                {t("collections.detail.edit")}
              </button>
              <button
                onClick={handleShare}
                disabled={sharingLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                {sharingLoading ? t("collections.detail.sharing") : t("collections.detail.share")}
              </button>
            </div>
          </div>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-700 mb-2">{t("collections.detail.emptyTitle")}</h2>
            <p className="text-sm text-gray-400 mb-6">{t("collections.detail.emptyDesc")}</p>
            <div className="flex gap-3">
              <Link href="/holy-sites" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">{t("collections.detail.browseHolySites")}</Link>
              <Link href="/temples" className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm rounded-lg transition-colors">{t("collections.detail.browseTemples")}</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <CollectionItemCard
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
                t={t}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>

      {showEditModal && (
        <EditModal
          collection={collection}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updated) => {
            setCollection(updated);
            setShowEditModal(false);
          }}
          t={t}
        />
      )}

      {shareUrl && (
        <ShareModal
          shareUrl={shareUrl}
          onClose={() => setShareUrl(null)}
          t={t}
        />
      )}
      <MobileNav />
    </div>
  );
}
