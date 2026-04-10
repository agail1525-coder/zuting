"use client";

import { useEffect, useState } from "react";
import { fetchLiveDharmaSchedule, type DharmaLiveSession } from "@/lib/api";

export default function LiveDharmaPage() {
  const [items, setItems] = useState<DharmaLiveSession[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveDharmaSchedule()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-amber-100 mb-1">活佛直播堂</h1>
        <p className="text-amber-200/60">真人 + AI 大师 · 未来 7 日排期</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20 text-amber-200/40">
          <div className="text-6xl mb-4">📺</div>
          <p>未来 7 日暂无排期</p>
          <p className="text-xs mt-2">Wave 2 接入直播内容种子</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-5 hover:border-amber-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-3xl shadow-lg">
                  {s.masterType === 'AI_AVATAR' ? "🤖" : "🧎"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-amber-100">{s.topic}</h3>
                    {s.masterType === 'AI_AVATAR' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40">
                        AI
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-amber-100/70 mb-2">
                    {s.masterName} · {s.tradition}
                  </div>
                  <div className="text-xs text-amber-200/40">
                    {new Date(s.startAt).toLocaleString()} · {s.durationMin} 分钟
                  </div>
                </div>
                {s.streamUrl && (
                  <a
                    href={s.streamUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                  >
                    进入
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
