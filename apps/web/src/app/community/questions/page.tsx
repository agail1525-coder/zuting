"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchQuestions, createQuestion, type QuestionItem } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const SORT_OPTIONS = [
  { key: "latest", label: "最新" },
  { key: "hot", label: "最热" },
  { key: "unanswered", label: "未回答" },
];

const POPULAR_TAGS = ["朝圣路线", "签证", "住宿", "交通", "佛教", "道教", "伊斯兰教", "印度教", "基督教", "朝圣礼仪"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays}天前`;
  return d.toLocaleDateString("zh-CN");
}

function QuestionCard({ q }: { q: QuestionItem }) {
  return (
    <Link href={`/community/questions/${q.id}`} className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 font-semibold mb-2 leading-snug hover:text-[#0066FF] transition-colors">
            {q.title}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">{q.content.slice(0, 120)}...</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {q.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full">{tag}</span>
            ))}
          </div>
          <div className="text-xs text-gray-400">{formatDate(q.createdAt)}</div>
        </div>
        <div className="shrink-0 flex flex-col items-center gap-1 ml-4">
          <div className={`text-2xl font-bold ${q.answerCount > 0 ? "text-[#0066FF]" : "text-gray-300"}`}>
            {q.answerCount}
          </div>
          <div className="text-xs text-gray-400">回答</div>
          <div className="mt-2 text-xs text-gray-300">{q.viewCount} 浏览</div>
        </div>
      </div>
    </Link>
  );
}

function AskModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (q: QuestionItem) => void }) {
  const [qTitle, setQTitle] = useState("");
  const [qContent, setQContent] = useState("");
  const [qTags, setQTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!qTitle.trim() || !qContent.trim()) {
      setError("标题和内容不能为空");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const tags = qTags.split(",").map((t) => t.trim()).filter(Boolean);
      const q = await createQuestion({ title: qTitle.trim(), content: qContent.trim(), tags });
      onSuccess(q);
    } catch {
      setError("提交失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">提问</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">✕</button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">问题标题 *</label>
            <input
              value={qTitle}
              onChange={(e) => setQTitle(e.target.value)}
              placeholder="简洁描述你的问题..."
              maxLength={120}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">问题详情 *</label>
            <textarea
              value={qContent}
              onChange={(e) => setQContent(e.target.value)}
              placeholder="详细描述你的问题，方便大家回答..."
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签（逗号分隔）</label>
            <input
              value={qTags}
              onChange={(e) => setQTags(e.target.value)}
              placeholder="朝圣, 佛教, 路线规划"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
            />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-200">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">取消</button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-full bg-[#0066FF] text-white text-sm font-semibold disabled:opacity-40 hover:bg-[#0052CC] transition-colors"
          >
            {submitting ? "提交中..." : "提交问题"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuestionsPage() {
  const { user } = useAuth();
  const [sort, setSort] = useState("latest");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAsk, setShowAsk] = useState(false);

  const PAGE_SIZE = 15;

  useEffect(() => {
    setLoading(true);
    setError(null);
    const status = sort === "unanswered" ? "unanswered" : undefined;
    const s = sort === "unanswered" ? "latest" : sort;
    fetchQuestions({ sort: s, status, tag: tag || undefined, page })
      .then((res) => {
        setQuestions(res.items ?? []);
        setTotal(res.total ?? 0);
      })
      .catch(() => setError("加载失败，请稍后再试"))
      .finally(() => setLoading(false));
  }, [sort, tag, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">问答广场</h1>
            <p className="text-gray-500 text-sm mt-1">向社区寻求帮助，分享你的知识</p>
          </div>
          <button
            onClick={() => {
              if (!user) {
                window.location.href = "/login";
                return;
              }
              setShowAsk(true);
            }}
            className="px-5 py-2.5 bg-[#0066FF] text-white rounded-full text-sm font-semibold hover:bg-[#0052CC] transition-colors shadow-sm"
          >
            ❓ 提问
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-gray-500 shrink-0">排序:</span>
            <div className="flex gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { setSort(opt.key); setPage(1); }}
                  className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                    sort === opt.key ? "bg-[#0066FF] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500 shrink-0">标签:</span>
            <button
              onClick={() => { setTag(""); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${!tag ? "bg-[#0066FF] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              全部
            </button>
            {POPULAR_TAGS.map((t) => (
              <button
                key={t}
                onClick={() => { setTag(t); setPage(1); }}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${tag === t ? "bg-[#0066FF] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">💬</div>
            <div>暂无问题，来提第一个问题吧！</div>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => <QuestionCard key={q.id} q={q} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white shadow-sm text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50"
            >
              上一页
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white shadow-sm text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        )}
      </div>

      {showAsk && (
        <AskModal
          onClose={() => setShowAsk(false)}
          onSuccess={(q) => {
            setQuestions((prev) => [q, ...prev]);
            setShowAsk(false);
          }}
        />
      )}
    </main>
  );
}
