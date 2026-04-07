import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { fetchChatRooms, type ChatRoom } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function Messages() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const nav = useNavigate();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    fetchChatRooms()
      .then((res) => setRooms(Array.isArray(res) ? res : []))
      .catch(() => setError(t("messages.loadFailed")))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user) load(); else setLoading(false); }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title={t("messages.title")} />
        <EmptyState icon="🔒" message={t("auth.login")} action={{ label: t("auth.loginSubmit"), onClick: () => nav("/login") }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("messages.title")} />

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rooms.length === 0 ? (
        <EmptyState icon="💬" message={t("messages.empty")} />
      ) : (
        <div className="divide-y divide-gray-100">
          {rooms.map((c) => (
            <div key={c.id} onClick={() => nav(`/messages`)} className="px-4 py-3.5 flex items-center gap-3 bg-white active:bg-gray-50">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                  {c.name?.[0] || "?"}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{c.name}</h4>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                    {c.lastMessage?.createdAt ? new Date(c.lastMessage.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{c.lastMessage?.content || t("messages.noMessages")}</p>
              </div>
              {(c.unreadCount ?? 0) > 0 && (
                <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  {c.unreadCount}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
