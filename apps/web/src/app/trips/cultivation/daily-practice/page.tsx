"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  applyLiturgyTemplate,
  coachDailyPracticeSlot,
  createDailyPracticeSlot,
  deleteDailyPracticeSlot,
  getDailyPracticeStreak,
  getDailyPracticeTimeline,
  listLiturgyTemplates,
  logDailyPracticeSlot,
  updateDailyPracticeSchedule,
  type CoachSlotResponse,
  type DailyPracticeLog,
  type DailyPracticeSlot,
  type DailyPracticeTimeline,
  type LiturgyTemplate,
} from "@/lib/api";

const TRADITION_LABEL: Record<string, string> = {
  ZEN: "汉传禅宗",
  BUDDHISM: "净土 · 佛教",
  TIBETAN: "藏传佛教",
  TAOISM: "道教",
  CONFUCIANISM: "儒家",
  CHRISTIANITY: "基督文化",
  ISLAM: "伊斯兰文化",
  HINDUISM: "印度教",
  JUDAISM: "犹太文化",
  SIKHISM: "锡克文化",
  BAHAI: "巴哈伊文化",
  SHINTO: "神道",
  INDIGENOUS: "原住民文化",
};

const KIND_ICON: Record<string, string> = {
  MORNING_LITURGY: "🌅",
  EVENING_LITURGY: "🌙",
  NOON_CHANT: "☀",
  SITTING: "🧘",
  SCRIPTURE_READ: "📖",
  PRAYER: "🙏",
  DEDICATION: "✨",
  SEAL_PRACTICE: "🪷",
  CUSTOM: "·",
};

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

type TabKey = "today" | "schedule" | "templates";

export default function DailyPracticePage() {
  const [timeline, setTimeline] = useState<DailyPracticeTimeline | null>(null);
  const [streak, setStreak] = useState<{ streakDays: number; karmaPoints: number; totalLogs: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("today");
  const [selectedSlot, setSelectedSlot] = useState<DailyPracticeSlot | null>(null);
  const [coach, setCoach] = useState<CoachSlotResponse | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [logForm, setLogForm] = useState<{ durationSec: number; repetitionsDone: number; reflection: string }>({
    durationSec: 0,
    repetitionsDone: 0,
    reflection: "",
  });
  const [logging, setLogging] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [tl, st] = await Promise.all([
        getDailyPracticeTimeline(),
        getDailyPracticeStreak().catch(() => null),
      ]);
      setTimeline(tl);
      if (st) setStreak({ streakDays: st.streakDays, karmaPoints: st.karmaPoints, totalLogs: st.totalLogs });
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const logMap = useMemo(() => {
    const m = new Map<string, DailyPracticeLog>();
    if (timeline) for (const l of timeline.todayLogs) if (l.slotId) m.set(l.slotId, l);
    return m;
  }, [timeline]);

  const openSlot = (slot: DailyPracticeSlot) => {
    setSelectedSlot(slot);
    setCoach(null);
    const log = logMap.get(slot.id);
    setLogForm({
      durationSec: log?.durationSec ?? slot.durationMin * 60,
      repetitionsDone: log?.repetitionsDone ?? slot.repetitions ?? 0,
      reflection: log?.reflection ?? "",
    });
  };

  const askCoach = async (slotId: string) => {
    setCoachLoading(true);
    try {
      const res = await coachDailyPracticeSlot(slotId);
      setCoach(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "小鸿暂时无法陪伴");
    } finally {
      setCoachLoading(false);
    }
  };

  const onLog = async () => {
    if (!selectedSlot) return;
    setLogging(true);
    try {
      await logDailyPracticeSlot(selectedSlot.id, {
        durationSec: logForm.durationSec,
        repetitionsDone: logForm.repetitionsDone || undefined,
        reflection: logForm.reflection.trim() || undefined,
        status: "DONE",
      });
      await load();
      setSelectedSlot(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "打卡失败");
    } finally {
      setLogging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-amber-200/60">
        正在加载每日功课...
      </div>
    );
  }

  if (error && !timeline) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="text-red-400">{error}</div>
        <button onClick={load} className="px-4 py-2 rounded-lg bg-amber-800/40 hover:bg-amber-700/50">
          重试
        </button>
      </div>
    );
  }

  if (!timeline) return null;

  const { practice, slots } = timeline;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // 时间轴范围: 以 wakeTime~sleepTime 为主, 跨越午夜则扩到 05:00-23:59
  const wakeMin = toMinutes(practice.wakeTime);
  const sleepMin = toMinutes(practice.sleepTime);
  const startMin = Math.min(wakeMin - 30, 300);
  const endMin = Math.max(sleepMin + 30, 1410);
  const rangeMin = endMin - startMin;
  const pctOf = (m: number) => ((m - startMin) / rangeMin) * 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/trips/cultivation" className="text-amber-400/60 text-sm hover:text-amber-300">
          ← 修行圆满之路
        </Link>
        <div className="mt-2 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-amber-100">每日功课</h1>
            <div className="mt-1 text-amber-300/70 text-sm">
              {TRADITION_LABEL[practice.tradition] ?? practice.tradition} · 贯穿 24 小时的修行节奏
            </div>
          </div>
          {streak && (
            <div className="text-right text-amber-200/80 text-sm">
              <div>🔥 {streak.streakDays} 天连</div>
              <div className="text-amber-400/70">累计 {streak.totalLogs} 次 · {streak.karmaPoints} 因缘点</div>
            </div>
          )}
        </div>
        {/* 免责 banner */}
        <div className="mt-4 rounded-lg border border-amber-900/60 bg-amber-950/40 p-3 text-amber-200/80 text-xs leading-relaxed">
          ⚠️ {practice.disclaimer}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-amber-900/40">
        {([
          { key: "today", label: "今日时间轴" },
          { key: "schedule", label: "作息设置" },
          { key: "templates", label: "礼仪模板库" },
        ] as Array<{ key: TabKey; label: string }>).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm transition-colors ${
              tab === t.key
                ? "text-amber-200 border-b-2 border-amber-400"
                : "text-amber-400/60 hover:text-amber-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-950/40 border border-red-900/60 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {tab === "today" && (
        <TimelineView
          slots={slots}
          logMap={logMap}
          nowMin={nowMin}
          startMin={startMin}
          rangeMin={rangeMin}
          pctOf={pctOf}
          onSlotClick={openSlot}
        />
      )}

      {tab === "schedule" && (
        <ScheduleView
          practice={practice}
          slots={slots}
          onChanged={load}
        />
      )}

      {tab === "templates" && <TemplatesView currentTradition={practice.tradition} onApplied={load} />}

      {/* Slot Drawer */}
      {selectedSlot && (
        <SlotDrawer
          slot={selectedSlot}
          log={logMap.get(selectedSlot.id)}
          coach={coach}
          coachLoading={coachLoading}
          logForm={logForm}
          setLogForm={setLogForm}
          onClose={() => setSelectedSlot(null)}
          onAskCoach={() => askCoach(selectedSlot.id)}
          onLog={onLog}
          logging={logging}
        />
      )}
    </div>
  );
}

// ── 时间轴 ──────────────────────────────────────

function TimelineView({
  slots,
  logMap,
  nowMin,
  startMin,
  rangeMin,
  pctOf,
  onSlotClick,
}: {
  slots: DailyPracticeSlot[];
  logMap: Map<string, { status: string }>;
  nowMin: number;
  startMin: number;
  rangeMin: number;
  pctOf: (m: number) => number;
  onSlotClick: (s: DailyPracticeSlot) => void;
}) {
  const hours: number[] = [];
  for (let h = Math.floor(startMin / 60); h <= Math.ceil((startMin + rangeMin) / 60); h++) {
    hours.push(h);
  }

  return (
    <div className="relative">
      {slots.length === 0 && (
        <div className="rounded-xl border border-amber-900/50 bg-amber-950/30 p-8 text-center text-amber-300/60">
          今日功课还未安排, 前往「作息设置」或「礼仪模板库」添加你的第一堂功课
        </div>
      )}
      {slots.length > 0 && (
        <div className="relative pl-20 min-h-[500px]">
          {/* 刻度线 */}
          <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-amber-900/40">
            {hours.map((h) => {
              const top = ((h * 60 - startMin) / rangeMin) * 100;
              if (top < 0 || top > 100) return null;
              return (
                <div
                  key={h}
                  className="absolute text-xs text-amber-400/50"
                  style={{ top: `${top}%`, right: "8px" }}
                >
                  {h.toString().padStart(2, "0")}:00
                </div>
              );
            })}
          </div>
          {/* 当前时刻红线 */}
          {nowMin >= startMin && nowMin <= startMin + rangeMin && (
            <div
              className="absolute left-16 right-0 border-t-2 border-red-500/70 z-10 pointer-events-none"
              style={{ top: `${pctOf(nowMin)}%` }}
            >
              <span className="absolute -top-2 left-2 text-xs text-red-400 bg-slate-900 px-1">
                此刻 {String(Math.floor(nowMin / 60)).padStart(2, "0")}:{String(nowMin % 60).padStart(2, "0")}
              </span>
            </div>
          )}
          {/* Slots */}
          <div className="relative" style={{ minHeight: "500px" }}>
            {slots.map((s) => {
              const top = pctOf(toMinutes(s.time));
              const log = logMap.get(s.id);
              const done = log?.status === "DONE";
              return (
                <button
                  key={s.id}
                  onClick={() => onSlotClick(s)}
                  className={`absolute left-0 right-0 text-left rounded-xl p-3 border transition-all hover:border-amber-500 hover:bg-amber-950/40 ${
                    done
                      ? "border-emerald-800/60 bg-emerald-950/30"
                      : "border-amber-900/50 bg-slate-900/50"
                  }`}
                  style={{ top: `${Math.max(0, Math.min(95, top))}%` }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{KIND_ICON[s.kind] ?? "·"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-200 font-medium">{s.time}</span>
                        <span className="text-amber-100 truncate">{s.title}</span>
                        {done && <span className="text-emerald-400 text-xs">✓ 已完成</span>}
                      </div>
                      <div className="mt-0.5 text-xs text-amber-400/60">
                        {s.durationMin} 分钟
                        {s.repetitions ? ` · ${s.repetitions} 遍` : ""}
                        {s.sourceRef ? ` · ${s.sourceRef}` : ""}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 作息设置 ────────────────────────────────────

function ScheduleView({
  practice,
  slots,
  onChanged,
}: {
  practice: DailyPracticeTimeline["practice"];
  slots: DailyPracticeSlot[];
  onChanged: () => void;
}) {
  const [wakeTime, setWakeTime] = useState(practice.wakeTime);
  const [sleepTime, setSleepTime] = useState(practice.sleepTime);
  const [reminderEnabled, setReminderEnabled] = useState(practice.reminderEnabled);
  const [reminderLeadMin, setReminderLeadMin] = useState(practice.reminderLeadMin);
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState<{ time: string; title: string; durationMin: number; kind: string; repetitions: number }>({
    time: "12:00",
    title: "",
    durationMin: 15,
    kind: "CUSTOM",
    repetitions: 0,
  });

  const onSaveSchedule = async () => {
    setSaving(true);
    try {
      await updateDailyPracticeSchedule({ wakeTime, sleepTime, reminderEnabled, reminderLeadMin });
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const onAddSlot = async () => {
    if (!addForm.title.trim()) return;
    await createDailyPracticeSlot({
      time: addForm.time,
      durationMin: addForm.durationMin,
      kind: addForm.kind,
      title: addForm.title,
      repetitions: addForm.repetitions || undefined,
    });
    setAddForm({ ...addForm, title: "" });
    onChanged();
  };

  const onDeleteSlot = async (id: string) => {
    if (!confirm("确认删除这条功课?")) return;
    await deleteDailyPracticeSlot(id);
    onChanged();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-amber-900/50 bg-slate-900/50 p-5">
        <h2 className="text-amber-200 font-medium mb-4">作息与提醒</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <label className="text-sm">
            <div className="text-amber-400/70 mb-1">起床</div>
            <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)}
              className="w-full bg-slate-950 border border-amber-900/60 rounded px-2 py-1.5 text-amber-100" />
          </label>
          <label className="text-sm">
            <div className="text-amber-400/70 mb-1">就寝</div>
            <input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)}
              className="w-full bg-slate-950 border border-amber-900/60 rounded px-2 py-1.5 text-amber-100" />
          </label>
          <label className="text-sm flex items-end gap-2">
            <input type="checkbox" checked={reminderEnabled} onChange={(e) => setReminderEnabled(e.target.checked)} />
            <span className="text-amber-300">启用提醒</span>
          </label>
          <label className="text-sm">
            <div className="text-amber-400/70 mb-1">提前分钟</div>
            <input type="number" min={0} max={60} value={reminderLeadMin}
              onChange={(e) => setReminderLeadMin(Number(e.target.value))}
              className="w-full bg-slate-950 border border-amber-900/60 rounded px-2 py-1.5 text-amber-100" />
          </label>
        </div>
        <button onClick={onSaveSchedule} disabled={saving}
          className="mt-4 px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-slate-900 font-medium disabled:opacity-50">
          {saving ? "保存中..." : "保存作息"}
        </button>
      </section>

      <section className="rounded-xl border border-amber-900/50 bg-slate-900/50 p-5">
        <h2 className="text-amber-200 font-medium mb-4">当前功课槽位 ({slots.length})</h2>
        <div className="space-y-2">
          {slots.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-amber-900/40 bg-slate-950/60 px-3 py-2">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-xl">{KIND_ICON[s.kind] ?? "·"}</span>
                <div className="min-w-0">
                  <div className="text-amber-100 truncate">
                    <span className="text-amber-300 mr-2">{s.time}</span>{s.title}
                  </div>
                  <div className="text-xs text-amber-400/60 truncate">{s.durationMin}分{s.repetitions ? ` · ${s.repetitions}遍` : ""}</div>
                </div>
              </div>
              <button onClick={() => onDeleteSlot(s.id)} className="text-red-400/80 hover:text-red-300 text-sm">
                删除
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-amber-900/50 bg-slate-900/50 p-5">
        <h2 className="text-amber-200 font-medium mb-4">新增功课</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <label className="text-sm">
            <div className="text-amber-400/70 mb-1">时间</div>
            <input type="time" value={addForm.time} onChange={(e) => setAddForm({ ...addForm, time: e.target.value })}
              className="w-full bg-slate-950 border border-amber-900/60 rounded px-2 py-1.5 text-amber-100" />
          </label>
          <label className="text-sm col-span-2">
            <div className="text-amber-400/70 mb-1">标题</div>
            <input type="text" value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
              placeholder="如: 午间心经 3 遍"
              className="w-full bg-slate-950 border border-amber-900/60 rounded px-2 py-1.5 text-amber-100" />
          </label>
          <label className="text-sm">
            <div className="text-amber-400/70 mb-1">时长(分)</div>
            <input type="number" min={1} max={240} value={addForm.durationMin}
              onChange={(e) => setAddForm({ ...addForm, durationMin: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-amber-900/60 rounded px-2 py-1.5 text-amber-100" />
          </label>
          <label className="text-sm">
            <div className="text-amber-400/70 mb-1">类别</div>
            <select value={addForm.kind} onChange={(e) => setAddForm({ ...addForm, kind: e.target.value })}
              className="w-full bg-slate-950 border border-amber-900/60 rounded px-2 py-1.5 text-amber-100">
              <option value="CUSTOM">自定义</option>
              <option value="SCRIPTURE_READ">读经</option>
              <option value="SITTING">静坐</option>
              <option value="PRAYER">祈祷</option>
              <option value="DEDICATION">回向</option>
              <option value="NOON_CHANT">午课</option>
            </select>
          </label>
        </div>
        <button onClick={onAddSlot} disabled={!addForm.title.trim()}
          className="mt-4 px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-slate-900 font-medium disabled:opacity-50">
          + 新增功课
        </button>
      </section>
    </div>
  );
}

// ── 礼仪模板库 ──────────────────────────────────

function TemplatesView({
  currentTradition,
  onApplied,
}: {
  currentTradition: string;
  onApplied: () => void;
}) {
  const [tradition, setTradition] = useState(currentTradition);
  const [templates, setTemplates] = useState<LiturgyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listLiturgyTemplates({ tradition })
      .then((res) => setTemplates(res))
      .finally(() => setLoading(false));
  }, [tradition]);

  const onApply = async (t: LiturgyTemplate) => {
    if (!confirm(`将「${t.title}」应用为${t.session === "MORNING" ? "早课" : t.session === "EVENING" ? "晚课" : "功课"}? 该时段现有 slot 会被替换。`)) return;
    setApplying(t.id);
    try {
      await applyLiturgyTemplate({ templateId: t.id, session: t.session });
      onApplied();
      alert("已应用");
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-amber-300 text-sm">筛选传统:</span>
        {Object.entries(TRADITION_LABEL).map(([code, label]) => (
          <button
            key={code}
            onClick={() => setTradition(code)}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              tradition === code
                ? "bg-amber-700 text-slate-900"
                : "bg-amber-950/40 text-amber-300 hover:bg-amber-900/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-amber-300/60 py-8 text-center">加载中...</div>
      ) : templates.length === 0 ? (
        <div className="text-amber-300/60 py-8 text-center">该传统暂无官方模板</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="rounded-xl border border-amber-900/50 bg-slate-900/50 p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-amber-100 font-medium">{t.title}</h3>
                <span className="text-xs text-amber-400/70">{t.session}</span>
              </div>
              {t.subtitle && <div className="text-sm text-amber-300/70 mb-2">{t.subtitle}</div>}
              <div className="text-xs text-amber-400/60 mb-2">📜 {t.source}</div>
              {t.steps.length > 0 && (
                <ol className="text-xs text-amber-200/80 space-y-0.5 mb-3 max-h-40 overflow-y-auto">
                  {t.steps.map((s, i) => (
                    <li key={s.id}>
                      {i + 1}. {s.title}
                      {s.defaultRepetitions ? ` ×${s.defaultRepetitions}` : ""}
                    </li>
                  ))}
                </ol>
              )}
              {t.disclaimer && <div className="text-xs text-amber-500/60 italic mb-3">{t.disclaimer}</div>}
              <button
                onClick={() => onApply(t)}
                disabled={applying === t.id}
                className="w-full px-3 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-slate-900 font-medium disabled:opacity-50 text-sm"
              >
                {applying === t.id ? "应用中..." : `应用到${t.session === "MORNING" ? "早课" : t.session === "EVENING" ? "晚课" : "功课"}`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Slot Drawer ──────────────────────────────────

function SlotDrawer({
  slot,
  log,
  coach,
  coachLoading,
  logForm,
  setLogForm,
  onClose,
  onAskCoach,
  onLog,
  logging,
}: {
  slot: DailyPracticeSlot;
  log?: { status: string; reflection: string | null; aiEncouragement: string | null };
  coach: CoachSlotResponse | null;
  coachLoading: boolean;
  logForm: { durationSec: number; repetitionsDone: number; reflection: string };
  setLogForm: (v: { durationSec: number; repetitionsDone: number; reflection: string }) => void;
  onClose: () => void;
  onAskCoach: () => void;
  onLog: () => void;
  logging: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-amber-800/60 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-200">
              <span className="text-2xl">{KIND_ICON[slot.kind] ?? "·"}</span>
              <h2 className="text-xl font-bold">{slot.title}</h2>
            </div>
            <div className="mt-1 text-sm text-amber-400/70">
              {slot.time} · {slot.durationMin} 分钟
              {slot.repetitions ? ` · ${slot.repetitions} 遍` : ""}
            </div>
            {slot.sourceRef && (
              <div className="mt-1 text-xs text-amber-500/70">📜 {slot.sourceRef}</div>
            )}
          </div>
          <button onClick={onClose} className="text-amber-400 hover:text-amber-200 text-xl">✕</button>
        </div>

        {slot.description && (
          <div className="mb-4 rounded-lg bg-slate-950/60 border border-amber-900/40 p-3 text-sm text-amber-200 whitespace-pre-wrap">
            {slot.description}
          </div>
        )}

        {/* 小鸿学伴 */}
        <div className="mb-4">
          {!coach && (
            <button
              onClick={onAskCoach}
              disabled={coachLoading}
              className="w-full px-4 py-3 rounded-xl border border-sky-700/60 bg-sky-950/40 text-sky-200 hover:bg-sky-900/60 transition-colors disabled:opacity-50"
            >
              {coachLoading ? "小鸿正在思考..." : "🔮 让小鸿陪我做这堂功课"}
            </button>
          )}
          {coach && (
            <div className="rounded-xl border border-sky-800/60 bg-sky-950/30 p-4 space-y-3">
              <div className="text-sky-200 text-sm">
                <strong>小鸿:</strong> {coach.intro}
                {coach.source === "fallback" && (
                  <span className="ml-2 text-xs text-sky-400/60">(降级模式)</span>
                )}
              </div>
              <ol className="space-y-2">
                {coach.stepGuidance.map((g, i) => (
                  <li key={i} className="text-sky-100 text-sm">
                    <span className="text-sky-400 font-medium">第 {i + 1} 步</span>
                    <span className="ml-2 text-xs text-sky-400/60">{g.sec}秒</span>
                    <div className="mt-0.5">{g.text}</div>
                  </li>
                ))}
              </ol>
              {coach.dedicationText && (
                <div className="rounded-lg bg-sky-900/40 p-3 text-sm text-sky-100">
                  <div className="text-xs text-sky-400 mb-1">回向</div>
                  {coach.dedicationText}
                </div>
              )}
              {coach.reflectionQuestion && (
                <div className="text-sm text-sky-200 italic">💭 {coach.reflectionQuestion}</div>
              )}
            </div>
          )}
        </div>

        {/* 打卡表单 */}
        <div className="rounded-xl border border-amber-900/50 bg-slate-950/40 p-4 space-y-3">
          <h3 className="text-amber-200 font-medium">打卡</h3>
          {log?.aiEncouragement && (
            <div className="rounded-lg bg-emerald-950/40 border border-emerald-900/60 p-2 text-sm text-emerald-200">
              ✨ {log.aiEncouragement}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label>
              <div className="text-amber-400/70 mb-1">实际时长(秒)</div>
              <input
                type="number" min={0} value={logForm.durationSec}
                onChange={(e) => setLogForm({ ...logForm, durationSec: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-amber-900/60 rounded px-2 py-1.5 text-amber-100"
              />
            </label>
            <label>
              <div className="text-amber-400/70 mb-1">完成遍数</div>
              <input
                type="number" min={0} value={logForm.repetitionsDone}
                onChange={(e) => setLogForm({ ...logForm, repetitionsDone: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-amber-900/60 rounded px-2 py-1.5 text-amber-100"
              />
            </label>
          </div>
          <label className="block text-sm">
            <div className="text-amber-400/70 mb-1">心得(可选)</div>
            <textarea
              value={logForm.reflection}
              onChange={(e) => setLogForm({ ...logForm, reflection: e.target.value })}
              rows={3}
              className="w-full bg-slate-950 border border-amber-900/60 rounded px-2 py-1.5 text-amber-100"
            />
          </label>
          <button
            onClick={onLog}
            disabled={logging}
            className="w-full px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-slate-900 font-medium disabled:opacity-50"
          >
            {logging ? "提交中..." : log?.status === "DONE" ? "✓ 已完成 · 更新记录" : "完成打卡"}
          </button>
        </div>
      </div>
    </div>
  );
}
