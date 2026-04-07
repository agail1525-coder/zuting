import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchGuides, fetchQuestions, fetchLeaderboard, type GuideItem, type QuestionItem, type LeaderboardEntry } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

const TABS = ["guides", "questions", "leaderboard"] as const;
type Tab = (typeof TABS)[number];

export default function Community() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("guides");
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTab = useCallback(async (t: Tab) => {
    setLoading(true);
    setError("");
    try {
      if (t === "guides") {
        const res = await fetchGuides({ limit: 20 });
        setGuides(Array.isArray(res.items) ? res.items : []);
      } else if (t === "questions") {
        const res = await fetchQuestions({ page: 1 });
        setQuestions(Array.isArray(res.items) ? res.items : []);
      } else {
        const res = await fetchLeaderboard("points", "monthly");
        setLeaders(Array.isArray(res) ? res : []);
      }
    } catch {
      setError(t === "guides" ? "Failed to load" : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTab(tab); }, [tab, loadTab]);

  const tabLabels: Record<Tab, string> = {
    guides: t("community.guides"),
    questions: t("community.questions"),
    leaderboard: t("community.leaderboard"),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("nav.community")} />

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white px-2">
        {TABS.map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === key ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]" : "text-gray-500"
            }`}
          >
            {tabLabels[key]}
          </button>
        ))}
      </div>

      <div className="p-4">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadTab(tab)} />
        ) : tab === "guides" && guides.length === 0 ? (
          <EmptyState icon="📝" message={t("community.noGuides")} />
        ) : tab === "questions" && questions.length === 0 ? (
          <EmptyState icon="❓" message={t("community.noQuestions")} />
        ) : tab === "leaderboard" && leaders.length === 0 ? (
          <EmptyState icon="🏆" message={t("common.noData")} />
        ) : (
          <div className="space-y-3">
            {tab === "guides" && guides.map((g) => (
              <div key={g.id} className="bg-white rounded-xl p-4 shadow-sm" onClick={() => nav(`/community`)}>
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{g.title}</h3>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <span>{g.user?.nickname ?? t("common.anonymousUser")} · {new Date(g.createdAt).toLocaleDateString()}</span>
                  <span>👁 {g.viewCount ?? 0} · ❤️ {g.likeCount ?? 0}</span>
                </div>
              </div>
            ))}

            {tab === "questions" && questions.map((q) => (
              <div key={q.id} className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{q.title}</h3>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                  <span>{q.answerCount ?? 0} {t("community.question.answers")}</span>
                </div>
              </div>
            ))}

            {tab === "leaderboard" && leaders.map((l, i) => (
              <div key={l.userId} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                  i < 3 ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"
                }`}>{i + 1}</span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                  {(l.nickname || "?")[0]}
                </div>
                <span className="flex-1 font-medium text-sm text-gray-900">{l.nickname || t("common.anonymousUser")}</span>
                <span className="text-xs text-amber-500 font-semibold">{l.count} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
