import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/lib/toast";

interface Answer {
  id: string;
  content: string;
  user?: { nickname?: string };
  createdAt: string;
}

interface Question {
  id: string;
  title: string;
  content?: string;
  user?: { nickname?: string };
  createdAt: string;
  answers?: Answer[];
}

interface Props {
  targetType: "HOLY_SITE" | "TEMPLE" | "ROUTE";
  targetId: string;
}

export default function QASection({ targetType, targetId }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/questions?targetType=${targetType}&targetId=${targetId}&limit=10`)
      .then((r) => r.json())
      .then((r) => setItems(r.items || r.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [targetType, targetId]);

  const submit = async () => {
    if (!user) { toast.warning("请先登录"); return; }
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_BASE}/api/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetType, targetId, title, content }),
      });
      if (!res.ok) throw new Error("submit fail");
      const q: Question = await res.json();
      setItems([q, ...items]);
      setTitle("");
      setContent("");
      toast.success("问题已提交");
    } catch {
      toast.error("提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-xl p-4 my-3">
      <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
        <span>❓</span> 问答
        <span className="text-xs text-gray-400 font-normal">({items.length})</span>
      </h3>

      {user && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="提出你的问题..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#3264ff]"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="补充说明（可选）"
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#3264ff]"
          />
          <button
            onClick={submit}
            disabled={submitting || !title.trim()}
            className="px-4 py-1.5 bg-[#3264ff] text-white rounded-lg text-sm disabled:opacity-50"
          >
            {submitting ? "..." : "提问"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4 text-gray-400 text-sm">加载中...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">暂无问答</div>
      ) : (
        <div className="space-y-3">
          {items.map((q) => (
            <div key={q.id} className="border-b border-gray-100 pb-3 last:border-0">
              <p className="text-sm font-semibold text-gray-900">{q.title}</p>
              {q.content && <p className="text-xs text-gray-600 mt-1">{q.content}</p>}
              <div className="text-[10px] text-gray-400 mt-1">
                {q.user?.nickname || "匿名"} · {new Date(q.createdAt).toLocaleDateString()} · {q.answers?.length || 0} 回答
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
