"use client";

import { useState, useEffect } from "react";
import StarRating from "@/components/StarRating";
import { createReview, type CreateReviewData } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "";

async function uploadReviewImage(file: File): Promise<string> {
  const token = getAccessToken();
  if (!token) throw new Error("请先登录");
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API}/api/uploads/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error("图片上传失败");
  const data = await res.json();
  return data.url;
}

interface WriteReviewModalProps {
  targetType: string;
  targetId: string;
  onSuccess: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function WriteReviewModal({
  targetType,
  targetId,
  onSuccess,
  isOpen,
  onClose,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [subScores, setSubScores] = useState<Record<string, number>>({});
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const SUB_DIMENSIONS = [
    { key: "spiritual", label: "灵性氛围" },
    { key: "cultural", label: "文化深度" },
    { key: "accessibility", label: "可达性" },
    { key: "guideQuality", label: "导览质量" },
    { key: "authenticity", label: "历史真实性" },
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setSubScores({});
      setContent("");
      setImages([]);
      setError(null);
    }
  }, [isOpen]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("请先选择评分");
      return;
    }
    if (content.trim().length > 0 && content.trim().length < 10) {
      setError("评价内容至少需要10个字");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const data: CreateReviewData = {
        targetType: targetType as CreateReviewData["targetType"],
        targetId,
        rating,
        subScores: Object.keys(subScores).length > 0 ? subScores : undefined,
        content: content.trim() || undefined,
        images: images.length > 0 ? images : undefined,
      };
      await createReview(data);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2500);
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Toast */}
      {toastVisible && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white text-sm px-5 py-3 rounded-xl shadow-lg animate-fade-in">
          评价提交成功！感谢你的分享
        </div>
      )}

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">写评价</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="关闭"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Star rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                评分 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <StarRating
                  value={rating}
                  onChange={setRating}
                  size="lg"
                  showLabel
                />
              </div>
            </div>

            {/* Sub-dimension scores */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">细分评分 <span className="text-gray-400 font-normal">（选填）</span></label>
              <div className="grid grid-cols-1 gap-2">
                {SUB_DIMENSIONS.map((dim) => (
                  <div key={dim.key} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-gray-50">
                    <span className="text-xs text-gray-600 min-w-[72px]">{dim.label}</span>
                    <StarRating
                      value={subScores[dim.key] ?? 0}
                      onChange={(v) => setSubScores((prev) => ({ ...prev, [dim.key]: v }))}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                评价内容
                <span className="text-gray-400 font-normal ml-2">（选填，至少10字）</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="分享你的朝圣体验，帮助其他旅行者..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#0066FF]/50 focus:ring-2 focus:ring-[#0066FF]/10 resize-none"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{content.trim().length > 0 && content.trim().length < 10 ? <span className="text-amber-500">还需 {10 - content.trim().length} 字</span> : null}</span>
                <span>{content.length}/500</span>
              </div>
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                添加照片 <span className="text-gray-400 font-normal">（最多3张）</span>
              </label>
              <div className="flex gap-3 flex-wrap">
                {images.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {images.length < 3 && (
                  <label className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#0066FF]/40 hover:bg-[#0066FF]/5 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          setError("图片不能超过5MB");
                          return;
                        }
                        setUploading(true);
                        setError(null);
                        try {
                          const url = await uploadReviewImage(file);
                          setImages(prev => [...prev, url]);
                        } catch {
                          setError("图片上传失败，请重试");
                        } finally {
                          setUploading(false);
                          e.target.value = "";
                        }
                      }}
                    />
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-[#0066FF] rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs text-gray-400 mt-1">上传</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 pb-6">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="px-6 py-2.5 text-sm font-medium bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? "提交中..." : "提交评价"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
