"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchJournal, updateJournal, deleteJournal, type JournalDetail, type UpdateJournalData } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const dynamic = "force-dynamic";

const MOOD_MAP: Record<string, { emoji: string; label: string }> = {
  "感悟": { emoji: "💡", label: "感悟" },
  "喜悦": { emoji: "😊", label: "喜悦" },
  "平静": { emoji: "🕊️", label: "平静" },
  "震撼": { emoji: "⚡", label: "震撼" },
  "觉悟": { emoji: "🪷", label: "觉悟" },
  "感动": { emoji: "🙏", label: "感动" },
  "振奋": { emoji: "⚡", label: "振奋" },
  "虔诚": { emoji: "🪷", label: "虔诚" },
};

export default function JournalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();

  const [journal, setJournal] = useState<JournalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = !!(user && journal?.userId && user.id === journal.userId);

  useEffect(() => {
    if (!id) return;
    const loadJournal = async () => {
      try {
        setJournal(await fetchJournal(id));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("404")) {
          setError("not_found");
        } else {
          setError(msg || "加载失败");
        }
      } finally {
        setLoading(false);
      }
    };
    loadJournal();
  }, [id]);

  const handleEdit = () => {
    if (!journal) return;
    setEditTitle(journal.title);
    setEditContent(journal.content);
    setEditMood(journal.mood ?? "");
    setEditIsPublic(journal.isPublic);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!journal) return;
    setSaving(true);
    try {
      const data: UpdateJournalData = {
        title: editTitle,
        content: editContent,
        mood: editMood || undefined,
        isPublic: editIsPublic,
      };
      const updated = await updateJournal(journal.id, data);
      setJournal(updated);
      setEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!journal || !confirm("确定删除这篇日志吗？此操作不可撤销。")) return;
    setDeleting(true);
    try {
      await deleteJournal(journal.id);
      router.push("/journals");
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-3" />
          <p className="text-temple-400 text-sm font-serif">加载中...</p>
        </div>
      </div>
    );
  }

  if (error === "not_found" || (!journal && !error)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📖</div>
        <h1 className="text-2xl font-serif text-temple-200 mb-4">
          日志未找到
        </h1>
        <Link
          href="/journals"
          className="text-gold hover:text-gold-light transition-colors"
        >
          返回日记列表
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-serif text-temple-200 mb-4">{error}</h1>
        <Link
          href="/journals"
          className="text-gold hover:text-gold-light transition-colors"
        >
          返回日记列表
        </Link>
      </div>
    );
  }

  if (!journal) return null;

  const mood = journal.mood ? MOOD_MAP[journal.mood] : null;
  const date = new Date(journal.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/journals"
        className="inline-flex items-center gap-1 text-sm text-temple-400 hover:text-gold transition-colors mb-6"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        返回日记列表
      </Link>

      {/* Article */}
      <article className="card-glow rounded-2xl bg-temple-800/50 p-6 md:p-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gradient-gold mb-3">
              {journal.title}
            </h1>
            {isOwner && !editing && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1.5 text-xs rounded-lg bg-temple-700/50 border border-temple-600 text-temple-300 hover:text-gold hover:border-gold/30 transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 text-xs rounded-lg bg-red-900/30 border border-red-800/50 text-red-400 hover:text-red-300 hover:border-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? "删除中..." : "删除"}
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap text-sm">
            <span className="text-temple-500">{date}</span>
            {mood && (
              <span className="px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-gold/80 text-xs">
                {mood.emoji} {mood.label}
              </span>
            )}
            {journal.trip && (
              <Link
                href={`/trips/${journal.trip.id}`}
                className="px-2 py-0.5 rounded-full bg-temple-700/50 border border-temple-600 text-temple-300 text-xs hover:text-gold transition-colors"
              >
                {journal.trip.title}
              </Link>
            )}
            {journal.holySite && (
              <span className="px-2 py-0.5 rounded-full bg-temple-700/50 border border-temple-600 text-temple-300 text-xs">
                {journal.holySite.name}
              </span>
            )}
            {journal.user && (
              <span className="text-temple-500 text-xs">
                {journal.user.nickname}
              </span>
            )}
          </div>
        </header>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-temple-400 mb-1">标题</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={200}
                className="w-full px-3 py-2 rounded-lg bg-temple-900/50 border border-temple-700 text-temple-200 focus:border-gold/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-temple-400 mb-1">内容</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 rounded-lg bg-temple-900/50 border border-temple-700 text-temple-200 focus:border-gold/50 focus:outline-none resize-y"
              />
            </div>
            <div className="flex gap-4 items-center">
              <div>
                <label className="block text-sm text-temple-400 mb-1">心情</label>
                <select
                  value={editMood}
                  onChange={(e) => setEditMood(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-temple-900/50 border border-temple-700 text-temple-200 focus:border-gold/50 focus:outline-none"
                >
                  <option value="">无</option>
                  {Object.entries(MOOD_MAP).map(([key, v]) => (
                    <option key={key} value={key}>{v.emoji} {v.label}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-temple-400 mt-5">
                <input
                  type="checkbox"
                  checked={editIsPublic}
                  onChange={(e) => setEditIsPublic(e.target.checked)}
                  className="rounded border-temple-700"
                />
                公开可见
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !editTitle.trim() || !editContent.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30 transition-colors disabled:opacity-50"
              >
                {saving ? "保存中..." : "保存"}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-temple-700/50 border border-temple-600 text-temple-300 hover:text-temple-200 transition-colors disabled:opacity-50"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Images */}
            {journal.images && journal.images.length > 0 && (
              <div className="mb-6 grid grid-cols-2 gap-3">
                {journal.images.map((img, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden border border-temple-700/50"
                  >
                    <img
                      src={img}
                      alt={`${journal.title} - ${i + 1}`}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <div className="text-temple-300 leading-relaxed whitespace-pre-wrap">
                {journal.content}
              </div>
            </div>
          </>
        )}
      </article>
    </div>
  );
}
