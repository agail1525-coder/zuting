"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchTodayQuiz,
  submitQuizAnswer,
  fetchQuizProgress,
  type ZenQuizResponse,
  type ZenQuizAnswer,
  type QuizProgressResponse,
} from "@/lib/api";

export default function ZenQuizPage() {
  const [quiz, setQuiz] = useState<ZenQuizResponse | null>(null);
  const [progress, setProgress] = useState<QuizProgressResponse | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    passed: boolean;
    score: number;
    feedback: string;
    encouragement: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchTodayQuiz(), fetchQuizProgress()])
      .then(([q, p]) => {
        setQuiz(q);
        setProgress(p);
        // 跳到第一个未回答的题
        const answered = (q.answers ?? []).map((a: ZenQuizAnswer) => a.index);
        const firstUnanswered = q.questions.findIndex(
          (_, i) => !answered.includes(i)
        );
        if (firstUnanswered >= 0) setCurrentIdx(firstUnanswered);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!quiz || !answer.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitQuizAnswer({
        quizId: quiz.id,
        questionIndex: currentIdx,
        answer: answer.trim(),
      });
      setFeedback(res);
      // 更新本地 quiz 状态
      const newAnswer: ZenQuizAnswer = {
        index: currentIdx,
        userAnswer: answer.trim(),
        aiScore: res.score,
        aiFeedback: res.feedback,
        encouragement: res.encouragement,
        passed: res.passed,
      };
      setQuiz((prev) =>
        prev
          ? {
              ...prev,
              answers: [...(prev.answers ?? []), newAnswer],
              answeredCount: res.answeredCount,
              passedCount: res.passedCount,
              status: res.quizStatus as ZenQuizResponse["status"],
            }
          : prev
      );
      // 刷新进度
      fetchQuizProgress().then(setProgress).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    if (!quiz) return;
    setFeedback(null);
    setAnswer("");
    const answered = (quiz.answers ?? []).map((a) => a.index);
    const next = quiz.questions.findIndex(
      (_, i) => i > currentIdx && !answered.includes(i)
    );
    if (next >= 0) {
      setCurrentIdx(next);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-amber-200/60">
        正在准备今日禅修考核...
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
          {error}
        </div>
        <Link
          href="/trips/cultivation/ox-path"
          className="text-amber-300/70 text-sm hover:text-amber-300"
        >
          ← 返回十牛图
        </Link>
      </div>
    );
  }

  if (!quiz) return null;

  const isComplete = quiz.status !== "IN_PROGRESS";
  const answeredSet = new Set((quiz.answers ?? []).map((a) => a.index));
  const currentQ = quiz.questions[currentIdx];
  const currentAnswer = (quiz.answers ?? []).find((a) => a.index === currentIdx);

  // ── 完成页 ──────────────────────────────────────────
  if (isComplete) {
    return (
      <div className="space-y-6">
        <Link
          href="/trips/cultivation/ox-path"
          className="text-amber-300/70 text-sm hover:text-amber-300"
        >
          ← 返回十牛图
        </Link>

        <div
          className={`rounded-2xl border p-8 text-center ${
            quiz.status === "PASSED"
              ? "border-emerald-400/40 bg-emerald-500/10"
              : "border-rose-400/40 bg-rose-500/10"
          }`}
        >
          <div className="text-5xl mb-4">
            {quiz.status === "PASSED" ? "🪷" : "🌑"}
          </div>
          <h2
            className={`text-2xl font-bold mb-2 ${
              quiz.status === "PASSED" ? "text-emerald-200" : "text-rose-200"
            }`}
          >
            {quiz.status === "PASSED"
              ? "今日修行圆满"
              : "今日修行未通过"}
          </h2>
          <p className="text-amber-200/60 mb-4">
            {quiz.status === "PASSED"
              ? `通过 ${quiz.passedCount}/${quiz.totalQuestions} 题，功不唐捐`
              : `通过 ${quiz.passedCount}/${quiz.totalQuestions} 题，明日再来，精进不已`}
          </p>
          {progress && (
            <div className="inline-block px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-400/30">
              <span className="text-amber-300 font-bold">
                连续通过 {progress.quizPassedStreak} / 21 天
              </span>
            </div>
          )}
        </div>

        {/* 回顾所有回答 */}
        <div className="space-y-3">
          <h3 className="text-amber-100 font-bold">回顾</h3>
          {(quiz.answers ?? [])
            .sort((a, b) => a.index - b.index)
            .map((a) => {
              const q = quiz.questions[a.index];
              return (
                <div
                  key={a.index}
                  className={`rounded-xl border p-4 ${
                    a.passed
                      ? "border-emerald-900/40 bg-emerald-950/20"
                      : "border-rose-900/40 bg-rose-950/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        a.passed
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {a.passed ? "通过" : "未通过"} · {a.aiScore}分
                    </span>
                    <span className="text-xs text-amber-200/40">
                      第 {a.index + 1} 题 · {q?.questionType}
                    </span>
                  </div>
                  <p className="text-amber-100/80 text-sm mb-2">{q?.question}</p>
                  <p className="text-amber-200/50 text-xs italic">{a.aiFeedback}</p>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  // ── 答题页 ──────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/trips/cultivation/ox-path"
          className="text-amber-300/70 text-sm hover:text-amber-300"
        >
          ← 十牛图
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-amber-200/50 text-sm">
            {quiz.answeredCount}/{quiz.totalQuestions}
          </span>
          {/* 进度点 */}
          <div className="flex gap-1">
            {quiz.questions.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  answeredSet.has(i)
                    ? (quiz.answers ?? []).find((a) => a.index === i)?.passed
                      ? "bg-emerald-400"
                      : "bg-rose-400"
                    : i === currentIdx
                    ? "bg-amber-400 ring-2 ring-amber-400/40"
                    : "bg-amber-900/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
          {error}
        </div>
      )}

      {/* 题目卡片 */}
      <div className="rounded-2xl border border-amber-900/50 bg-gradient-to-br from-amber-950/40 to-amber-950/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300 font-bold text-sm">
            {currentIdx + 1}
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300/70 border border-amber-400/20">
            {currentQ?.questionType === "KOAN"
              ? "公案参究"
              : currentQ?.questionType === "MEDITATION"
              ? "禅定体验"
              : currentQ?.questionType === "SCRIPTURE"
              ? "经文理解"
              : "日常应用"}
          </span>
          <span className="text-xs text-amber-200/30 ml-auto">
            {currentQ?.stageName}
          </span>
        </div>
        <p className="text-amber-100 text-lg leading-relaxed">
          {currentQ?.question}
        </p>
      </div>

      {/* 已回答过的题目 → 显示反馈 */}
      {currentAnswer ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4">
            <p className="text-amber-200/70 text-sm">{currentAnswer.userAnswer}</p>
          </div>
          <div
            className={`rounded-xl border p-4 ${
              currentAnswer.passed
                ? "border-emerald-400/30 bg-emerald-500/10"
                : "border-rose-400/30 bg-rose-500/10"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold">
                {currentAnswer.passed ? "✓ 通过" : "✗ 未通过"}
              </span>
              <span className="text-xs text-amber-200/40">
                {currentAnswer.aiScore}分
              </span>
            </div>
            <p className="text-sm text-amber-100/80">{currentAnswer.aiFeedback}</p>
            <p className="text-xs text-amber-300/60 mt-2 italic">
              {currentAnswer.encouragement}
            </p>
          </div>
        </div>
      ) : feedback ? (
        /* 刚提交的反馈 */
        <div className="space-y-4">
          <div
            className={`rounded-xl border p-5 ${
              feedback.passed
                ? "border-emerald-400/30 bg-emerald-500/10"
                : "border-rose-400/30 bg-rose-500/10"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-lg font-bold ${
                  feedback.passed ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {feedback.passed ? "✓ 通过" : "✗ 未通过"}
              </span>
              <span className="text-sm text-amber-200/50">
                {feedback.score}分
              </span>
            </div>
            <p className="text-amber-100/80 leading-relaxed mb-3">
              {feedback.feedback}
            </p>
            <p className="text-amber-300/60 text-sm italic">
              {feedback.encouragement}
            </p>
          </div>
          {quiz.answeredCount < quiz.totalQuestions && (
            <button
              onClick={goNext}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
            >
              下一题 →
            </button>
          )}
        </div>
      ) : (
        /* 答题区 */
        <div className="space-y-4">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="静心思考，用心作答...（至少10字）"
            rows={6}
            maxLength={2000}
            className="w-full rounded-xl border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-amber-100 placeholder:text-amber-200/30 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-200/30">
              {answer.length}/2000
            </span>
            <button
              onClick={handleSubmit}
              disabled={submitting || answer.trim().length < 10}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "禅师正在品味你的回答..." : "提交回答"}
            </button>
          </div>
        </div>
      )}

      {/* 题号导航 */}
      <div className="flex gap-2 justify-center flex-wrap">
        {quiz.questions.map((_, i) => {
          const a = (quiz.answers ?? []).find((a) => a.index === i);
          return (
            <button
              key={i}
              onClick={() => {
                setCurrentIdx(i);
                setFeedback(null);
                setAnswer("");
              }}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                i === currentIdx
                  ? "bg-amber-500 text-white"
                  : a
                  ? a.passed
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                  : "bg-amber-950/30 text-amber-200/40 border border-amber-900/30"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
