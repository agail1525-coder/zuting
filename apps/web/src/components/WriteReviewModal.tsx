"use client";

import { useState, useEffect } from "react";
import StarRating from "@/components/StarRating";
import { createReview, type CreateReviewData } from "@/lib/api";

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
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setContent("");
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
        content: content.trim() || undefined,
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

            {/* Image upload placeholder */}
            <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center text-sm text-gray-400">
              <svg className="w-6 h-6 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              图片上传功能即将上线
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
