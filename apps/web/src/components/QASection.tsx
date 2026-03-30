"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

interface Question {
  id: string;
  title: string;
  content: string;
  user: { nickname: string | null; avatar: string | null };
  answerCount: number;
  createdAt: string;
}

interface QASectionProps {
  entityType: string;
  entityId: string;
}

export default function QASection({ entityType, entityId }: QASectionProps) {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId) return;
    fetch(`/api/questions?targetType=${entityType}&targetId=${entityId}&page=1&limit=3`)
      .then((r) => r.json() as Promise<{ items: Question[]; total: number }>)
      .then((res) => {
        setQuestions(Array.isArray(res.items) ? res.items : []);
      })
      .catch((err) => { console.error('Load Q&A failed:', err); })
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">
          {t("qa.title") || "旅行者问答"}
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-semibold text-gray-900">
            {t("qa.title") || "旅行者问答"}
          </h2>
          <Link
            href={`/community?tab=questions`}
            className="text-sm text-[#0066FF] hover:underline"
          >
            {t("qa.askQuestion") || "提问"}
          </Link>
        </div>
        <p className="text-sm text-gray-400 text-center py-6">
          {t("qa.noQuestions") || "暂无问答，成为第一个提问的人"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-serif font-semibold text-gray-900">
          {t("qa.title") || "旅行者问答"}
          <span className="ml-2 text-sm font-normal text-gray-400">({questions.length})</span>
        </h2>
        <Link
          href={`/community?tab=questions`}
          className="text-sm text-[#0066FF] hover:underline"
        >
          {t("qa.askQuestion") || "提问"}
        </Link>
      </div>

      <div className="space-y-3">
        {questions.map((q) => (
          <Link
            key={q.id}
            href={`/community/questions/${q.id}`}
            className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#0066FF]/10 flex items-center justify-center text-[#0066FF] text-sm font-bold flex-shrink-0">
              Q
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 line-clamp-1">{q.title}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span>{q.user.nickname ?? "Anonymous"}</span>
                <span>{q.answerCount} {t("qa.answers") || "个回答"}</span>
                <span>{q.createdAt.slice(0, 10)}</span>
              </div>
            </div>
            <svg className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
