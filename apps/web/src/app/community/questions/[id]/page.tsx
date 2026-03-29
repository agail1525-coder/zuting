"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  fetchQuestion,
  addAnswer,
  acceptAnswer,
  voteAnswer,
  type QuestionDetail,
  type AnswerItem,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function AnswerCard({
  answer,
  isOwner,
  questionId,
  onAccept,
  onVote,
}: {
  answer: AnswerItem;
  isOwner: boolean;
  questionId: string;
  onAccept: (answerId: string) => void;
  onVote: (answerId: string) => void;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 ${answer.isAccepted ? "ring-2 ring-green-400" : ""}`}>
      <div className="flex gap-4">
        {/* Vote */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <button
            onClick={() => onVote(answer.id)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-blue-50 hover:text-[#0066FF] transition-colors text-gray-500"
          >
            ▲
          </button>
          <div className="text-sm font-bold text-gray-700">{answer.voteCount}</div>
          {answer.isAccepted && (
            <div className="text-green-500 text-xl">✓</div>
          )}
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          {answer.isAccepted && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium mb-3">
              ✓ 已采纳
            </div>
          )}
          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-4">
            {answer.content}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">{formatDate(answer.createdAt)}</div>
            {isOwner && !answer.isAccepted && (
              <button
                onClick={() => onAccept(answer.id)}
                className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors font-medium"
              >
                采纳为最佳答案
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();

  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchQuestion(id)
      .then((q) => setQuestion(q))
      .catch(() => setError("加载失败，请稍后再试"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmitAnswer() {
    if (!user || !answerText.trim()) return;
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const ans = await addAnswer(id, answerText.trim());
      setQuestion((prev) => prev ? { ...prev, answers: [...(prev.answers ?? []), ans], answerCount: (prev.answerCount ?? 0) + 1 } : prev);
      setAnswerText("");
      setSubmitMsg("回答已提交！");
    } catch {
      setSubmitMsg("提交失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAccept(answerId: string) {
    if (!question) return;
    try {
      await acceptAnswer(id, answerId);
      setQuestion((prev) => prev ? {
        ...prev,
        answers: prev.answers.map((a) => ({ ...a, isAccepted: a.id === answerId })),
      } : prev);
    } catch { /* silent */ }
  }

  async function handleVote(answerId: string) {
    if (!user) return;
    try {
      await voteAnswer(id, answerId);
      setQuestion((prev) => prev ? {
        ...prev,
        answers: prev.answers.map((a) =>
          a.id === answerId ? { ...a, voteCount: a.voteCount + 1 } : a
        ),
      } : prev);
    } catch { /* silent */ }
  }

  const isOwner = user && question && user.id === question.userId;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </main>
    );
  }

  if (error || !question) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center text-red-400">
          <div className="text-5xl mb-4">⚠️</div>
          <div>{error || "问题不存在"}</div>
          <Link href="/community/questions" className="mt-4 inline-block text-[#0066FF] hover:underline">返回问答广场</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/community" className="hover:text-[#0066FF]">社区</Link>
          {" > "}
          <Link href="/community/questions" className="hover:text-[#0066FF]">问答</Link>
          {" > "}
          <span className="text-gray-700 line-clamp-1">{question.title}</span>
        </nav>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-4">{question.title}</h1>
          <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap mb-5">{question.content}</div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {question.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full">{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-100 pt-4">
            <span>💬 {question.answerCount} 回答</span>
            <span>👁 {question.viewCount} 浏览</span>
            <span>{formatDate(question.createdAt)}</span>
          </div>
        </div>

        {/* Answers */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {question.answers?.length || 0} 个回答
          </h2>
          {!question.answers || question.answers.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-xl shadow-sm">
              <div className="text-4xl mb-3">💬</div>
              <div>暂无回答，来第一个回答吧！</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Accepted answer first */}
              {[...question.answers]
                .sort((a, b) => (b.isAccepted ? 1 : 0) - (a.isAccepted ? 1 : 0) || b.voteCount - a.voteCount)
                .map((ans) => (
                  <AnswerCard
                    key={ans.id}
                    answer={ans}
                    isOwner={!!isOwner}
                    questionId={id}
                    onAccept={handleAccept}
                    onVote={handleVote}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Answer form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">发表回答</h3>
          {user ? (
            <>
              {submitMsg && (
                <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm ${submitMsg.includes("失败") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {submitMsg}
                </div>
              )}
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="分享你的知识和经验..."
                rows={6}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] mb-4"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!answerText.trim() || submitting}
                  className="px-6 py-2.5 bg-[#0066FF] text-white rounded-full text-sm font-semibold disabled:opacity-40 hover:bg-[#0052CC] transition-colors"
                >
                  {submitting ? "提交中..." : "提交回答"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-sm text-blue-700 bg-blue-50 rounded-xl">
              <Link href="/login" className="font-semibold hover:underline">登录</Link> 后才能发表回答
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
