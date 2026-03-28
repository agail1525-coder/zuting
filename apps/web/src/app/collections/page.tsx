"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  fetchCollections,
  createCollection,
  deleteCollection,
  type Collection,
} from "@/lib/api";

const GRADIENT_PLACEHOLDERS = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-blue-600",
];

function CollectionCard({
  collection,
  onDelete,
}: {
  collection: Collection;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const gradientClass =
    GRADIENT_PLACEHOLDERS[
      collection.name.charCodeAt(0) % GRADIENT_PLACEHOLDERS.length
    ];
  const itemCount = collection._count?.items ?? collection.items.length;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      await deleteCollection(collection.id);
      onDelete(collection.id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Link href={`/collections/${collection.id}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-200">
        {/* Cover */}
        <div className="relative h-36 overflow-hidden">
          {collection.coverImage ? (
            <img
              src={collection.coverImage}
              alt={collection.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="white"
                opacity="0.5"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          )}
          {/* Public badge */}
          {collection.isPublic && (
            <span className="absolute top-2 left-2 bg-blue-600/90 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
              公开
            </span>
          )}
          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="absolute top-2 right-2 bg-black/50 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
            aria-label="删除收藏夹"
          >
            {confirmDelete ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {collection.name}
          </h3>
          {collection.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{collection.description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">
              {itemCount} 个收藏
            </span>
            <span className="text-xs text-gray-400">
              {new Date(collection.createdAt).toLocaleDateString("zh-CN")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CreateCollectionModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (collection: Collection) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("请输入收藏夹名称");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const collection = await createCollection({
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
      });
      onCreate(collection);
    } catch {
      setError("创建失败，请重试");
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
          <h2 className="text-lg font-bold text-gray-900">创建收藏夹</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：朝圣心愿清单"
              maxLength={50}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述（选填）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简短描述这个收藏夹..."
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
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? "translate-x-5" : "translate-x-1"}`}
              />
            </button>
            <span className="text-sm text-gray-700">公开收藏夹（他人可查看）</span>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {loading ? "创建中..." : "创建"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetchCollections()
      .then(setCollections)
      .catch(() => {/* ignore */})
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreate = (collection: Collection) => {
    setCollections((prev) => [collection, ...prev]);
    setShowCreateModal(false);
  };

  const handleDelete = (id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
  };

  if (authLoading || (!user && typeof window !== "undefined")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">我的收藏夹</h1>
            <p className="text-sm text-gray-500 mt-1">收藏圣地、祖庭和祖师，规划你的朝圣之旅</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            创建收藏夹
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-700 mb-2">还没有收藏夹</h2>
            <p className="text-sm text-gray-400 mb-6">创建一个开始收藏你喜欢的圣地和祖庭吧</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors"
            >
              创建第一个收藏夹
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateCollectionModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
