"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchJournal, updateJournal, deleteJournal, type JournalDetail, type UpdateJournalData } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import OptimizedImage from "@/components/OptimizedImage";
import MobileNav from "@/components/MobileNav";

export const dynamic = "force-dynamic";

const MOOD_KEYS: Record<string, { emoji: string; key: string }> = {
  "感悟": { emoji: "💡", key: "journal.mood.insight" },
  "喜悦": { emoji: "😊", key: "journal.mood.joy" },
  "平静": { emoji: "🕊️", key: "journal.mood.calm" },
  "震撼": { emoji: "⚡", key: "journal.mood.awe" },
  "觉悟": { emoji: "🪷", key: "journal.mood.awakening" },
  "感动": { emoji: "🙏", key: "journal.mood.touched" },
  "振奋": { emoji: "⚡", key: "journal.mood.excited" },
  "虔诚": { emoji: "🪷", key: "journal.mood.devout" },
};

export default function JournalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();
  const { t, locale } = useTranslation();

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
          setError(msg || t("journal.loadFailed"));
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
      toast.success(t("journal.saveSuccess") || "保存成功");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("journal.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!journal || !confirm(t("journal.deleteConfirm"))) return;
    setDeleting(true);
    try {
      await deleteJournal(journal.id);
      toast.success(t("journal.deleteSuccess") || "删除成功");
      router.push("/journals");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("journal.deleteFailed"));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-serif">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error === "not_found" || (!journal && !error)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📖</div>
        <h1 className="text-2xl font-serif text-gray-700 mb-4">
          {t("journal.notFound")}
        </h1>
        <Link
          href="/journals"
          className="text-[#0066FF] hover:text-[#0052CC] transition-colors"
        >
          {t("journal.backToList")}
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-serif text-gray-700 mb-4">{error}</h1>
        <Link
          href="/journals"
          className="text-[#0066FF] hover:text-[#0052CC] transition-colors"
        >
          {t("journal.backToList")}
        </Link>
      </div>
    );
  }

  if (!journal) return null;

  const mood = journal.mood ? MOOD_KEYS[journal.mood] : null;
  const date = new Date(journal.createdAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/journals"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0066FF] transition-colors mb-6"
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
        {t("journal.backToList")}
      </Link>

      {/* Article */}
      <article className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 md:p-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#0066FF] mb-3">
              {journal.title}
            </h1>
            {isOwner && !editing && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1.5 text-xs rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:text-[#0066FF] hover:border-[#0066FF]/30 transition-colors"
                >
                  {t("journal.edit")}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 text-xs rounded-lg bg-red-900/10 border border-red-800/20 text-red-400 hover:text-red-300 hover:border-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? t("journal.deleting") : t("journal.delete")}
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap text-sm">
            <span className="text-gray-400">{date}</span>
            {mood && (
              <span className="px-2 py-0.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 text-[#0066FF]/80 text-xs">
                {mood.emoji} {t(mood.key)}
              </span>
            )}
            {journal.trip && (
              <Link
                href={`/trips/${journal.trip.id}`}
                className="px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-xs hover:text-[#0066FF] transition-colors"
              >
                {journal.trip.title}
              </Link>
            )}
            {journal.holySite && (
              <span className="px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-xs">
                {journal.holySite.name}
              </span>
            )}
            {journal.user && (
              <span className="text-gray-400 text-xs">
                {journal.user.nickname}
              </span>
            )}
          </div>
        </header>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">{t("journal.labelTitle")}</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={200}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 focus:border-[#0066FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">{t("journal.labelContent")}</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 focus:border-[#0066FF] focus:outline-none resize-y"
              />
            </div>
            <div className="flex gap-4 items-center">
              <div>
                <label className="block text-sm text-gray-500 mb-1">{t("journal.labelMood")}</label>
                <select
                  value={editMood}
                  onChange={(e) => setEditMood(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 focus:border-[#0066FF] focus:outline-none"
                >
                  <option value="">{t("journal.moodNone")}</option>
                  {Object.entries(MOOD_KEYS).map(([key, v]) => (
                    <option key={key} value={key}>{v.emoji} {t(v.key)}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-500 mt-5">
                <input
                  type="checkbox"
                  checked={editIsPublic}
                  onChange={(e) => setEditIsPublic(e.target.checked)}
                  className="rounded border-gray-200"
                />
                {t("journal.publicVisible")}
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !editTitle.trim() || !editContent.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-[#0066FF]/10 border border-[#0066FF]/20 text-[#0066FF] hover:bg-[#0066FF]/20 transition-colors disabled:opacity-50"
              >
                {saving ? t("journal.saving") : t("journal.save")}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-700 transition-colors disabled:opacity-50"
              >
                {t("journal.cancel")}
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
                    className="rounded-xl overflow-hidden border border-gray-200"
                  >
                    <OptimizedImage
                      src={img}
                      alt={`${journal.title} - ${i + 1}`}
                      width={800}
                      height={600}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="prose max-w-none">
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {journal.content}
              </div>
            </div>
          </>
        )}
      </article>
      <MobileNav />
    </div>
  );
}
