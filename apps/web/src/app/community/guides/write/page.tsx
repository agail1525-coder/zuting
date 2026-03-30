"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createGuide, publishGuide } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import MarkdownEditor from "@/components/MarkdownEditor";
import OptimizedImage from "@/components/OptimizedImage";

export default function WriteGuidePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const GUIDE_CATEGORIES = [
    { value: "", label: t("community.guide.categorySelect") },
    { value: "pilgrimage-diary", label: t("community.guide.categoryPilgrimageDiary") },
    { value: "travel-tips", label: t("community.guide.categoryTravelTips") },
    { value: "cultural-insight", label: t("community.guide.categoryCulturalInsight") },
    { value: "route-review", label: t("community.guide.categoryRouteReview") },
  ];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/community/guides/write");
    }
  }, [user, loading, router]);

  function parseTags(): string[] {
    return tagsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function handleSaveDraft() {
    if (!title.trim() || !content.trim()) {
      setMessage({ type: "error", text: t("community.guide.titleContentRequired") });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const guide = await createGuide({
        title: title.trim(),
        content: content.trim(),
        coverImage: coverImage.trim() || undefined,
        tags: parseTags(),
      });
      setSavedId(guide.id);
      setMessage({ type: "success", text: t("community.guide.draftSaved") });
    } catch {
      setMessage({ type: "error", text: t("community.guide.saveFailed") });
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!title.trim() || !content.trim()) {
      setMessage({ type: "error", text: t("community.guide.titleContentRequired") });
      return;
    }
    setPublishing(true);
    setMessage(null);
    try {
      let id = savedId;
      if (!id) {
        const guide = await createGuide({
          title: title.trim(),
          content: content.trim(),
          coverImage: coverImage.trim() || undefined,
          tags: parseTags(),
        });
        id = guide.id;
        setSavedId(id);
      }
      await publishGuide(id);
      setMessage({ type: "success", text: t("community.guide.publishSuccess") });
      setTimeout(() => router.push(`/community/guides/${id}`), 1200);
    } catch {
      setMessage({ type: "error", text: t("community.guide.publishFailed") });
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-gray-400">{t("community.loading")}</div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t("community.guide.write")}</h1>
          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving || publishing}
              className="px-5 py-2 rounded-full text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              {saving ? t("community.guide.saving") : t("community.guide.saveDraft")}
            </button>
            <button
              onClick={handlePublish}
              disabled={saving || publishing}
              className="px-5 py-2 rounded-full text-sm font-semibold bg-[#0066FF] text-white hover:bg-[#0052CC] disabled:opacity-40 transition-colors shadow-sm"
            >
              {publishing ? t("community.guide.publishing") : t("community.guide.publish")}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("community.guide.title")}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("community.guide.titlePlaceholder")}
              maxLength={100}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] text-lg font-medium"
            />
            <div className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("community.guide.coverImage")}</label>
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/cover.jpg"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
            />
            {coverImage && (
              <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt={t("community.guide.coverPreview")}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("community.guide.category")}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] cursor-pointer"
            >
              {GUIDE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("community.guide.tags")}</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={t("community.guide.tagsPlaceholder")}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
            />
            {parseTags().length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {parseTags().map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Content (Markdown Editor) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("community.guide.content")} <span className="text-gray-400 font-normal">{t("community.guide.contentMarkdown")}</span></label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder={t("community.guide.contentPlaceholder")}
              rows={20}
            />
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            className="px-6 py-3 rounded-full text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            {saving ? t("community.guide.saving") : t("community.guide.saveDraft")}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || publishing}
            className="px-6 py-3 rounded-full text-sm font-semibold bg-[#0066FF] text-white hover:bg-[#0052CC] disabled:opacity-40 transition-colors shadow-md"
          >
            {publishing ? t("community.guide.publishing") : t("community.guide.publishNow")}
          </button>
        </div>
      </div>
    </main>
  );
}
