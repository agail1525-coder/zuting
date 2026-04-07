"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import {
  fetchSharedCollection,
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

function SharedItemCard({
  item,
  t,
}: {
  item: CollectionItem;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const link = `${ENTITY_TYPE_LINKS[item.entityType]}/${item.entityId}`;

  return (
    <Link href={link} className="block group">
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all">
        <span
          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${ENTITY_TYPE_COLORS[item.entityType]}`}
        >
          {t(ENTITY_TYPE_I18N_KEYS[item.entityType])}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate transition-colors">
            {item.entityId}
          </p>
          {item.note && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{item.note}</p>
          )}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          className="shrink-0 group-hover:stroke-blue-500 transition-colors"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </Link>
  );
}

export default function SharedCollectionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { t, locale } = useTranslation();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchSharedCollection(token)
      .then(setCollection)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-700 mb-2">{t("collections.shared.notFoundTitle")}</h2>
          <p className="text-sm text-gray-400 mb-6">{t("collections.shared.notFoundDesc")}</p>
          <Link href="/" className="text-blue-600 hover:underline text-sm">{t("collections.shared.backHome")}</Link>
        </div>
      </div>
    );
  }

  const itemsArr = Array.isArray(collection.items) ? collection.items : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 pb-24">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{collection.name}</h1>
                <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">{t("collections.shared.publicBadge")}</span>
              </div>
              {collection.description && (
                <p className="text-sm text-gray-500 mt-2">{collection.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {t("collections.shared.itemsAndDate", {
                  count: itemsArr.length,
                  date: new Date(collection.updatedAt).toLocaleDateString(locale),
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        {itemsArr.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">{t("collections.shared.emptyContent")}</p>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {itemsArr.map((item) => (
              <SharedItemCard key={item.id} item={item} t={t} />
            ))}
          </div>
        )}

        {/* CTA for non-logged-in users */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 text-center">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{t("collections.shared.ctaTitle")}</h3>
          <p className="text-sm text-gray-500 mb-4">{t("collections.shared.ctaDesc")}</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/register"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {t("collections.shared.register")}
            </Link>
            <Link
              href="/login"
              className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm rounded-xl transition-colors"
            >
              {t("collections.shared.login")}
            </Link>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
