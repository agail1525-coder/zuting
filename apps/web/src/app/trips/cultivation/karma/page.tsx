"use client";

import { useEffect, useState } from "react";
import {
  fetchKarmaTimeline,
  createKarmaEvent,
  deleteKarmaEvent,
  type KarmaEvent,
} from "@/lib/api";

export default function KarmaPage() {
  const [items, setItems] = useState<KarmaEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [eventAt, setEventAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [visibility, setVisibility] = useState<"PRIVATE" | "FRIENDS" | "PUBLIC">("PRIVATE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => fetchKarmaTimeline(1, 50).then((r) => setItems(r.items)).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      setError("标题和正文不能为空");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createKarmaEvent({
        title: title.trim(),
        body: body.trim(),
        eventAt: new Date(eventAt).toISOString(),
        visibility,
      });
      setTitle("");
      setBody("");
      setShowForm(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("删除这条因缘?")) return;
    await deleteKarmaEvent(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-100 mb-1">因缘日志</h1>
          <p className="text-amber-200/60">AI 自动标注因果链 (Wave 2 接入 NLP)</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
        >
          {showForm ? "取消" : "+ 记一笔"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6 space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="事件标题"
            className="w-full rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-500"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            maxLength={5000}
            placeholder="详细描述这件事的经过、感受、思考..."
            className="w-full rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="datetime-local"
              value={eventAt}
              onChange={(e) => setEventAt(e.target.value)}
              className="rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500"
            />
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as typeof visibility)}
              className="rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-500"
            >
              <option value="PRIVATE">仅自己</option>
              <option value="FRIENDS">同修可见</option>
              <option value="PUBLIC">公开</option>
            </select>
          </div>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg disabled:opacity-50"
          >
            {submitting ? "保存中..." : "保存"}
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-center py-12 text-amber-200/40">还没有因缘记录</div>
        )}
        {items.map((ev) => (
          <div
            key={ev.id}
            className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-5 hover:border-amber-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-bold text-amber-100 flex-1">{ev.title}</h3>
              <button
                onClick={() => onDelete(ev.id)}
                className="text-rose-300/60 hover:text-rose-300 text-xs"
              >
                删除
              </button>
            </div>
            <p className="text-sm text-amber-100/70 leading-relaxed mb-3 whitespace-pre-wrap">
              {ev.body}
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-200/40">
              <span>{new Date(ev.eventAt).toLocaleString()}</span>
              <span>·</span>
              <span>{ev.visibility}</span>
              {ev.aiRealmTag && (
                <>
                  <span>·</span>
                  <span className="text-amber-300">境界: {ev.aiRealmTag}</span>
                </>
              )}
            </div>
            {ev.aiAdvice && (
              <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-400/30 px-3 py-2 text-xs text-amber-200">
                AI 建议：{ev.aiAdvice}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
