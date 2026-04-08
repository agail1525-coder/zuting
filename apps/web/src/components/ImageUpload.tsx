"use client";

import { useState } from "react";
import { getAccessToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  /** 哪张是封面 (对应 value 中的索引) */
  coverIdx?: number;
  onCoverChange?: (idx: number) => void;
}

/**
 * 通用图片上传组件
 * - 拖拽/点选上传到 POST /api/uploads/image (multipart)
 * - 支持多图（默认最多 9 张）
 * - 支持标记封面（点击角标切换）
 * - 支持简单的左右排序
 */
export default function ImageUpload({
  value,
  onChange,
  maxFiles = 9,
  maxSizeMB = 5,
  coverIdx,
  onCoverChange,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadOne(file: File): Promise<string> {
    const token = getAccessToken();
    if (!token) throw new Error("请先登录");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API}/api/uploads/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new Error(`上传失败 (${res.status})`);
    const data = (await res.json()) as { url: string };
    return data.url;
  }

  async function handleFiles(files: FileList) {
    setError(null);
    const remaining = maxFiles - value.length;
    const list = Array.from(files).slice(0, remaining);
    if (list.length === 0) return;

    const tooBig = list.find((f) => f.size > maxSizeMB * 1024 * 1024);
    if (tooBig) {
      setError(`图片不能超过 ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    try {
      const urls = await Promise.all(list.map(uploadOne));
      onChange([...value, ...urls]);
    } catch (e) {
      setError((e as Error).message || "上传失败");
    } finally {
      setUploading(false);
    }
  }

  function remove(idx: number) {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
    if (onCoverChange && coverIdx !== undefined) {
      if (idx === coverIdx) onCoverChange(next.length > 0 ? 0 : -1);
      else if (idx < coverIdx) onCoverChange(coverIdx - 1);
    }
  }

  function move(idx: number, dir: -1 | 1) {
    const ni = idx + dir;
    if (ni < 0 || ni >= value.length) return;
    const next = [...value];
    [next[idx], next[ni]] = [next[ni], next[idx]];
    onChange(next);
    if (onCoverChange && coverIdx !== undefined) {
      if (coverIdx === idx) onCoverChange(ni);
      else if (coverIdx === ni) onCoverChange(idx);
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {value.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 group ${
              coverIdx === i
                ? "border-[#0066FF] ring-2 ring-[#0066FF]/20"
                : "border-gray-200"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />

            {/* 封面角标 */}
            {coverIdx === i && (
              <div className="absolute top-1.5 left-1.5 bg-[#0066FF] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow">
                封面
              </div>
            )}

            {/* 设为封面按钮 */}
            {onCoverChange && coverIdx !== i && (
              <button
                type="button"
                onClick={() => onCoverChange(i)}
                className="absolute top-1.5 left-1.5 bg-white/80 hover:bg-white text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              >
                设为封面
              </button>
            )}

            {/* 删除 */}
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white text-sm"
              aria-label="删除"
            >
              ×
            </button>

            {/* 左右移 */}
            <div className="absolute bottom-1 left-1 right-1 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="w-6 h-6 bg-black/60 rounded-full text-white text-xs disabled:opacity-30"
                aria-label="前移"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === value.length - 1}
                className="w-6 h-6 bg-black/60 rounded-full text-white text-xs disabled:opacity-30"
                aria-label="后移"
              >
                ›
              </button>
            </div>
          </div>
        ))}

        {value.length < maxFiles && (
          <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#0066FF]/40 hover:bg-[#0066FF]/5 transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              multiple
              disabled={uploading}
              onChange={(e) => {
                if (e.target.files) void handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            {uploading ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-[#0066FF] rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-gray-400 mt-1">添加图片</span>
                <span className="text-[10px] text-gray-300 mt-0.5">
                  {value.length}/{maxFiles}
                </span>
              </>
            )}
          </label>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
      <p className="text-xs text-gray-400">
        支持 JPG/PNG/WEBP/GIF，单张最大 {maxSizeMB}MB，最多 {maxFiles} 张
      </p>
    </div>
  );
}
