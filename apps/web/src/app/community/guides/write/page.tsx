"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createGuide, publishGuide, aiDraftGuide } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/lib/toast";
import MarkdownEditor from "@/components/MarkdownEditor";
import ImageUpload from "@/components/ImageUpload";
import MobileNav from "@/components/MobileNav";

/**
 * AI-native 游记写作三阶段流程：
 *  1. 素材收集 — 大白话 + 语音转写 + 多图上传
 *  2. AI 草稿审阅 — AI 结构化结果可编辑
 *  3. 发布成功
 */
type Stage = "collect" | "review" | "done";

const CATEGORIES = [
  { value: "", label: "选择分类（可选）" },
  { value: "pilgrimage-diary", label: "朝圣日记" },
  { value: "travel-tips", label: "旅行贴士" },
  { value: "cultural-insight", label: "文化感悟" },
  { value: "route-review", label: "路线测评" },
];

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export default function WriteGuidePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("collect");

  // Stage 1: collect
  const [rawNotes, setRawNotes] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [coverIdx, setCoverIdx] = useState(-1);
  const [category, setCategory] = useState("");
  const [entityName, setEntityName] = useState("");
  const [generating, setGenerating] = useState(false);

  // 语音输入
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Stage 2: review
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [saving, setSaving] = useState(false);

  // Auth redirect
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/community/guides/write");
    }
  }, [user, loading, router]);

  // 初始化 Web Speech API
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!SR) return;
    setSpeechSupported(true);
    const r = new SR();
    r.continuous = true;
    r.interimResults = false;
    r.lang = "zh-CN";
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0]?.transcript ?? "";
        if (t) {
          setRawNotes((prev) => (prev.trim() ? `${prev}\n${t}` : t));
        }
      }
    };
    r.onerror = (e) => {
      toast.error(`语音识别错误：${e.error}`);
      setListening(false);
    };
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    return () => {
      try {
        r.stop();
      } catch {}
    };
  }, []);

  function toggleListening() {
    const r = recognitionRef.current;
    if (!r) return;
    if (listening) {
      r.stop();
      setListening(false);
    } else {
      try {
        r.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  }

  /** 阶段 1 → 2：调 AI 生成草稿 */
  async function handleGenerate() {
    if (rawNotes.trim().length < 10) {
      toast.error("请先写点素材（至少 10 字）");
      return;
    }
    setGenerating(true);
    try {
      const draft = await aiDraftGuide({
        rawNotes: rawNotes.trim(),
        imageUrls: images,
        category: category || undefined,
        entityName: entityName.trim() || undefined,
      });
      setTitle(draft.title);
      setContent(draft.content);
      setTags(draft.tags);
      if (draft.suggestedCoverIdx >= 0) setCoverIdx(draft.suggestedCoverIdx);
      else if (images.length > 0) setCoverIdx(0);
      setStage("review");
      toast.success("AI 已生成草稿，可以继续编辑");
    } catch (e) {
      toast.error((e as Error).message || "AI 服务暂不可用，可点击下方直接手写");
    } finally {
      setGenerating(false);
    }
  }

  /** 跳过 AI 直接手写 */
  function handleSkipToManual() {
    if (images.length > 0 && coverIdx < 0) setCoverIdx(0);
    setStage("review");
  }

  function addTag() {
    const t = tagDraft.trim();
    if (!t || tags.includes(t) || tags.length >= 10) {
      setTagDraft("");
      return;
    }
    setTags([...tags, t]);
    setTagDraft("");
  }

  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t));
  }

  /** 阶段 2：保存+发布 */
  async function handlePublish() {
    if (!title.trim() || !content.trim()) {
      toast.error("标题和内容不能为空");
      return;
    }
    setSaving(true);
    try {
      const guide = await createGuide({
        title: title.trim(),
        content: content.trim(),
        coverImage: coverIdx >= 0 ? images[coverIdx] : undefined,
        tags,
      });
      await publishGuide(guide.id);
      toast.success("发布成功！");
      setStage("done");
      setTimeout(() => router.push(`/community/guides/${guide.id}`), 1000);
    } catch {
      toast.error("发布失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  /** 阶段 2：仅保存草稿 */
  async function handleSaveDraft() {
    if (!title.trim() || !content.trim()) {
      toast.error("标题和内容不能为空");
      return;
    }
    setSaving(true);
    try {
      await createGuide({
        title: title.trim(),
        content: content.trim(),
        coverImage: coverIdx >= 0 ? images[coverIdx] : undefined,
        tags,
      });
      toast.success("草稿已保存");
    } catch {
      toast.error("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </main>
    );
  }
  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* 顶部进度 */}
        <div className="flex items-center gap-3 mb-8">
          <StepBadge active={stage === "collect"} done={stage !== "collect"} label="素材" n={1} />
          <div className="flex-1 h-px bg-gray-200" />
          <StepBadge
            active={stage === "review"}
            done={stage === "done"}
            label="AI 润色"
            n={2}
          />
          <div className="flex-1 h-px bg-gray-200" />
          <StepBadge active={stage === "done"} done={false} label="发布" n={3} />
        </div>

        {stage === "collect" && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">分享你的旅行故事</h1>
              <p className="text-sm text-gray-500 mt-1">
                大白话写下你的见闻——AI 会帮你整理成结构清晰的游记，你随时可以修改。
              </p>
            </div>

            {/* 素材文本框 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  旅行素材 <span className="text-gray-400 font-normal">（去了哪、看到什么、感受、建议都行）</span>
                </label>
                {speechSupported ? (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      listening
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : "bg-blue-50 text-[#0066FF] border border-blue-200 hover:bg-blue-100"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${listening ? "bg-red-500 animate-pulse" : "bg-[#0066FF]"}`} />
                    {listening ? "停止录音" : "🎙 语音输入"}
                  </button>
                ) : (
                  <span className="text-xs text-gray-400" title="Web Speech API 不支持">
                    语音需 Chrome/Edge
                  </span>
                )}
              </div>
              <textarea
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                placeholder="例：今天凌晨四点爬武当山看日出，金顶的云海比照片里还壮观。遇到一位道长聊了半小时，他说..."
                rows={10}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] resize-none"
              />
              <div className="text-xs text-gray-400 mt-1 text-right">{rawNotes.length}/5000</div>
            </div>

            {/* 图片上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                旅行照片 <span className="text-gray-400 font-normal">（最多 9 张，AI 会智能建议封面）</span>
              </label>
              <ImageUpload
                value={images}
                onChange={setImages}
                coverIdx={coverIdx}
                onCoverChange={setCoverIdx}
                maxFiles={9}
              />
            </div>

            {/* 分类 & 关联地点 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">关联地点 <span className="text-gray-400 font-normal">(可选)</span></label>
                <input
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="如：武当山 / 曲阜孔庙"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
                />
              </div>
            </div>

            {/* 操作 */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || rawNotes.trim().length < 10}
                className="flex-1 px-6 py-3.5 rounded-full text-base font-semibold bg-gradient-to-r from-[#0066FF] to-indigo-600 text-white hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {generating ? "AI 正在整理..." : "✨ 让 AI 帮我整理成游记"}
              </button>
              <button
                type="button"
                onClick={handleSkipToManual}
                disabled={generating}
                className="px-6 py-3.5 rounded-full text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                跳过 AI 手写
              </button>
            </div>
          </div>
        )}

        {stage === "review" && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">审阅并编辑草稿</h1>
                <p className="text-sm text-gray-500 mt-1">AI 已经帮你整理好了——所有内容你都可以继续修改。</p>
              </div>
              <button
                type="button"
                onClick={() => setStage("collect")}
                className="text-sm text-[#0066FF] hover:underline"
              >
                ← 返回重填
              </button>
            </div>

            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="一个吸引人的标题"
                maxLength={120}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] text-lg font-medium"
              />
              <div className="text-xs text-gray-400 mt-1 text-right">{title.length}/120</div>
            </div>

            {/* 图片 gallery + 封面切换 */}
            {images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  照片 <span className="text-gray-400 font-normal">（点击角标设为封面）</span>
                </label>
                <ImageUpload
                  value={images}
                  onChange={setImages}
                  coverIdx={coverIdx}
                  onCoverChange={setCoverIdx}
                  maxFiles={9}
                />
              </div>
            )}

            {/* 正文 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                正文 <span className="text-gray-400 font-normal">(支持 Markdown)</span>
              </label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="..."
                rows={18}
              />
            </div>

            {/* 标签 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
                  >
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-blue-800">
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="添加标签，回车确认"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  添加
                </button>
              </div>
            </div>

            {/* 操作 */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving}
                className="flex-1 px-6 py-3 rounded-full text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                {saving ? "保存中..." : "仅保存草稿"}
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="flex-1 px-6 py-3 rounded-full text-sm font-semibold bg-[#0066FF] text-white hover:bg-[#0052CC] disabled:opacity-40 transition-colors shadow-md"
              >
                {saving ? "发布中..." : "立即发布"}
              </button>
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">游记发布成功</h2>
            <p className="text-sm text-gray-500 mt-2">即将跳转到游记详情页...</p>
          </div>
        )}
      </div>
      <MobileNav />
    </main>
  );
}

function StepBadge({ active, done, label, n }: { active: boolean; done: boolean; label: string; n: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          done
            ? "bg-green-500 text-white"
            : active
            ? "bg-[#0066FF] text-white"
            : "bg-gray-200 text-gray-400"
        }`}
      >
        {done ? "✓" : n}
      </div>
      <span
        className={`text-sm font-medium ${
          active || done ? "text-gray-900" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
