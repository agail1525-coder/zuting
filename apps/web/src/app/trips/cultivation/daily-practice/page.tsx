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
  type CulturalFestival,
  type DailyPracticeLog,
  type DailyPracticeSlot,
  type DailyPracticeTimeline,
  type LiturgyTemplate,
  type SealProgress,
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

const TAG_POOL: Record<string, string[]> = {
  COMMON: ["清净", "散乱", "欢喜", "疑情", "困倦", "法喜", "感恩", "精进"],
  ZEN: ["见性", "参话头", "公案", "破执"],
  BUDDHISM: ["念佛", "往生", "回向", "空观"],
  TAOISM: ["守静", "抱一", "炼气", "自然"],
  CONFUCIANISM: ["反省", "仁爱", "中庸", "克己"],
  CHRISTIANITY: ["祷告", "恩典", "悔改", "感恩"],
  ISLAM: ["顺服", "敬畏", "记念", "慈悲"],
  HINDUISM: ["奉爱", "梵我", "业报", "解脱"],
  JUDAISM: ["敬畏", "律法", "记念", "感恩"],
  SIKHISM: ["Naam", "Sewa", "Simran", "一体"],
  BAHAI: ["合一", "祷告", "服务", "德行"],
  SHINTO: ["感恩", "洁净", "敬畏", "自然"],
  TIBETAN: ["菩提心", "观想", "上师相应", "回向"],
  INDIGENOUS: ["感恩", "大地", "祖灵", "自然"],
};

const REFLECTION_PLACEHOLDER: Record<string, string> = {
  ZEN: "今日对此印的参悟 ... 至少 10 字方可计入印证",
  BUDDHISM: "今日念佛感应 / 经义领受 ...",
  TIBETAN: "今日观想与菩提心生起 ...",
  TAOISM: "今日守静抱一的体会 ...",
  CONFUCIANISM: "今日反省与仁爱之行 ...",
  CHRISTIANITY: "今日祷告心得与恩典 ...",
  ISLAM: "今日顺服与记念 ...",
  HINDUISM: "今日奉爱与梵我一如 ...",
  JUDAISM: "今日律法记念与感恩 ...",
  SIKHISM: "Today's Naam / Sewa ...",
  BAHAI: "今日祷告与服务的收获 ...",
  SHINTO: "今日的洁净与感恩 ...",
  INDIGENOUS: "今日与大地/祖灵的连接 ...",
};

const CALENDAR_LABEL: Record<string, string> = {
  SOLAR: "公历",
  LUNAR: "农历",
  ISLAMIC_HIJRI: "伊斯兰历",
  HEBREW: "希伯来历",
  TIBETAN: "藏历",
  COMPUTED: "推算",
  FIXED_WEEK: "固定周",
};

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shiftDate(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
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
  const [logForm, setLogForm] = useState<{
    durationSec: number;
    repetitionsDone: number;
    reflection: string;
    tags: string[];
    skipSealCredit: boolean;
  }>({
    durationSec: 0,
    repetitionsDone: 0,
    reflection: "",
    tags: [],
    skipSealCredit: false,
  });
  const [logging, setLogging] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [festivalOpen, setFestivalOpen] = useState<CulturalFestival | null>(null);

  const loadFor = useCallback(async (dateArg: string) => {
    setError(null);
    try {
      const [tl, st] = await Promise.all([
        getDailyPracticeTimeline(dateArg),
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

  const load = useCallback(() => loadFor(selectedDate), [loadFor, selectedDate]);

  useEffect(() => {
    load();
  }, [load]);

  const changeDate = useCallback(
    (d: string) => {
      setSelectedDate(d);
      setLoading(true);
      loadFor(d);
    },
    [loadFor],
  );

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
      tags: log?.tags ?? [],
      skipSealCredit: false,
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
        tags: logForm.tags.length > 0 ? logForm.tags : undefined,
        skipSealCredit: logForm.skipSealCredit || undefined,
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

      {/* 日期导航 + 圣日 */}
      <DateNavigator
        selectedDate={selectedDate}
        onChange={changeDate}
        festivals={timeline.festivals ?? []}
        onFestivalClick={setFestivalOpen}
      />

      {/* 三十印进度 (仅 ZEN) */}
      {practice.tradition === "ZEN" && timeline.sealProgress && (
        <SealProgressCard progress={timeline.sealProgress} />
      )}

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
          tradition={practice.tradition}
          sealProgress={timeline.sealProgress ?? null}
          onClose={() => setSelectedSlot(null)}
          onAskCoach={() => askCoach(selectedSlot.id)}
          onLog={onLog}
          logging={logging}
        />
      )}

      {festivalOpen && (
        <FestivalModal festival={festivalOpen} onClose={() => setFestivalOpen(null)} />
      )}
    </div>
  );
}

// ── 日期导航 ──────────────────────────────────────

function DateNavigator({
  selectedDate,
  onChange,
  festivals,
  onFestivalClick,
}: {
  selectedDate: string;
  onChange: (d: string) => void;
  festivals: CulturalFestival[];
  onFestivalClick: (f: CulturalFestival) => void;
}) {
  const today = todayStr();
  const isToday = selectedDate === today;
  const [y, m, d] = selectedDate.split("-").map(Number);
  const labelCn = `${y}年${m}月${d}日`;
  return (
    <div className="mb-4 rounded-xl border border-amber-900/50 bg-slate-900/50 p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onChange(shiftDate(selectedDate, -1))}
          className="px-3 py-1.5 rounded-lg bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 text-sm"
        >
          ← 昨天
        </button>
        <button
          onClick={() => onChange(today)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            isToday
              ? "bg-amber-700 text-slate-900"
              : "bg-amber-950/40 text-amber-300 hover:bg-amber-900/60"
          }`}
        >
          今天
        </button>
        <button
          onClick={() => onChange(shiftDate(selectedDate, 1))}
          className="px-3 py-1.5 rounded-lg bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 text-sm"
        >
          明天 →
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onChange(e.target.value)}
          className="ml-1 bg-slate-950 border border-amber-900/60 rounded px-2 py-1.5 text-amber-100 text-sm"
        />
        <span className="ml-2 text-amber-200/90 text-sm">{labelCn}</span>
      </div>
      {festivals.length > 0 && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-amber-400/70">今日圣日:</span>
          {festivals.map((f) => (
            <button
              key={f.id}
              onClick={() => onFestivalClick(f)}
              className="px-2.5 py-1 rounded-full border border-amber-700/60 bg-amber-950/40 text-amber-200 text-xs hover:bg-amber-900/60 transition-colors"
            >
              🪷 {f.name}
              <span className="ml-1 text-amber-400/70">· {TRADITION_LABEL[f.tradition] ?? f.tradition}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 三十印进度卡 ──────────────────────────────────

function SealProgressCard({ progress }: { progress: SealProgress }) {
  const [expanded, setExpanded] = useState(false);
  if (progress.graduated || !progress.seal) {
    return (
      <div className="mb-4 rounded-xl border border-yellow-700/60 bg-yellow-950/30 p-4 text-center">
        <div className="text-yellow-200 font-medium">🎉 三十印圆满成就</div>
        <div className="mt-1 text-xs text-yellow-300/70">
          曹溪三十印 21 天印证已全数完成, 归源印圆。
        </div>
      </div>
    );
  }
  const { seal, day, total, todayDone } = progress;
  const pct = Math.min(100, (day / total) * 100);
  return (
    <div
      className="mb-4 rounded-xl border border-purple-800/60 bg-purple-950/30 p-4"
      style={{ borderColor: seal.color ?? undefined }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-purple-200 font-medium">
              第 {seal.id} 印 · {seal.name}
            </span>
            <span className="text-xs text-purple-400/70">{seal.series}</span>
            {todayDone && <span className="text-xs text-emerald-400">✓ 今日已印证</span>}
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-slate-950/60 overflow-hidden">
            <div
              className="h-full transition-all"
              style={{ width: `${pct}%`, background: seal.color ?? "#a855f7" }}
            />
          </div>
          <div className="mt-1 text-xs text-purple-300/70">
            第 {day} / {total} 天 · 距圆满 {total - day} 天
          </div>
        </div>
        <span className="text-purple-300 text-sm">{expanded ? "收起" : "展开"}</span>
      </button>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-purple-900/60 space-y-2 text-sm">
          {seal.poem && (
            <div className="text-purple-100 whitespace-pre-wrap italic">{seal.poem}</div>
          )}
          {seal.essence && (
            <div>
              <span className="text-purple-400/80 text-xs">本旨: </span>
              <span className="text-purple-100">{seal.essence}</span>
            </div>
          )}
          {seal.practice && (
            <div>
              <span className="text-purple-400/80 text-xs">修习: </span>
              <span className="text-purple-100">{seal.practice}</span>
            </div>
          )}
          {seal.vow && (
            <div>
              <span className="text-purple-400/80 text-xs">大愿: </span>
              <span className="text-purple-100">{seal.vow}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 圣日详情弹窗 ───────────────────────────────────

function FestivalModal({
  festival,
  onClose,
}: {
  festival: CulturalFestival;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-w-lg w-full rounded-2xl border border-amber-800/60 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-amber-100">🪷 {festival.name}</h2>
            {festival.nameEn && (
              <div className="text-xs text-amber-400/70 mt-0.5">{festival.nameEn}</div>
            )}
          </div>
          <button onClick={onClose} className="text-amber-400 hover:text-amber-200 text-xl">
            ✕
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-3 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-900/60">
            {TRADITION_LABEL[festival.tradition] ?? festival.tradition}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-950/60 text-amber-300 border border-amber-900/60">
            {CALENDAR_LABEL[festival.calendar] ?? festival.calendar} · {festival.month}月{festival.day}日
          </span>
        </div>
        <div className="text-amber-200 text-sm leading-relaxed whitespace-pre-wrap">
          {festival.description}
        </div>
        <div className="mt-4 pt-3 border-t border-amber-900/40 text-xs text-amber-500/70">
          📜 出处: {festival.source}
        </div>
      </div>
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

type LogFormShape = {
  durationSec: number;
  repetitionsDone: number;
  reflection: string;
  tags: string[];
  skipSealCredit: boolean;
};

function SlotDrawer({
  slot,
  log,
  coach,
  coachLoading,
  logForm,
  setLogForm,
  tradition,
  sealProgress,
  onClose,
  onAskCoach,
  onLog,
  logging,
}: {
  slot: DailyPracticeSlot;
  log?: { status: string; reflection: string | null; aiEncouragement: string | null };
  coach: CoachSlotResponse | null;
  coachLoading: boolean;
  logForm: LogFormShape;
  setLogForm: (v: LogFormShape) => void;
  tradition: string;
  sealProgress: SealProgress | null;
  onClose: () => void;
  onAskCoach: () => void;
  onLog: () => void;
  logging: boolean;
}) {
  const isZen = tradition === "ZEN";
  const tagPool = Array.from(
    new Set([...(TAG_POOL[tradition] ?? []), ...TAG_POOL.COMMON]),
  );
  const [customTag, setCustomTag] = useState("");
  const toggleTag = (t: string) => {
    const has = logForm.tags.includes(t);
    const next = has ? logForm.tags.filter((x) => x !== t) : [...logForm.tags, t].slice(0, 10);
    setLogForm({ ...logForm, tags: next });
  };
  const addCustomTag = () => {
    const t = customTag.trim().slice(0, 24);
    if (!t || logForm.tags.includes(t)) {
      setCustomTag("");
      return;
    }
    setLogForm({ ...logForm, tags: [...logForm.tags, t].slice(0, 10) });
    setCustomTag("");
  };
  const reflectionOk = logForm.reflection.trim().length >= 10;
  const willSeal =
    isZen &&
    !logForm.skipSealCredit &&
    reflectionOk &&
    sealProgress &&
    !sealProgress.graduated &&
    !sealProgress.todayDone &&
    sealProgress.seal;
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
          {/* ZEN 三十印印证提示 */}
          {isZen && sealProgress && !sealProgress.graduated && sealProgress.seal && (
            <div
              className={`rounded-lg border p-2 text-xs ${
                willSeal
                  ? "border-purple-700/60 bg-purple-950/40 text-purple-200"
                  : "border-amber-900/60 bg-amber-950/30 text-amber-300/80"
              }`}
            >
              {willSeal ? (
                <>
                  🪷 本次打卡将印证 <b>第 {sealProgress.seal.id} 印 · {sealProgress.seal.name}</b> ·
                  <b> 第 {sealProgress.day + 1} / {sealProgress.total} 天</b>
                </>
              ) : sealProgress.todayDone ? (
                <>今日已完成印证 (第 {sealProgress.day} / {sealProgress.total} 天)</>
              ) : logForm.skipSealCredit ? (
                <>已选择跳过印证, 本次打卡不计入三十印进度</>
              ) : (
                <>写下 ≥ 10 字感悟即可计入第 {sealProgress.seal.id} 印印证</>
              )}
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
            <div className="text-amber-400/70 mb-1">
              感悟 / 参悟 <span className="text-amber-500/60">({logForm.reflection.length} 字)</span>
            </div>
            <textarea
              value={logForm.reflection}
              onChange={(e) => setLogForm({ ...logForm, reflection: e.target.value })}
              rows={3}
              placeholder={REFLECTION_PLACEHOLDER[tradition] ?? "今日心得 ..."}
              className="w-full bg-slate-950 border border-amber-900/60 rounded px-2 py-1.5 text-amber-100"
            />
          </label>
          {/* 标签多选 */}
          <div className="text-sm">
            <div className="text-amber-400/70 mb-1.5">
              心境标签 <span className="text-amber-500/60">({logForm.tags.length}/10)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tagPool.map((t) => {
                const active = logForm.tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                      active
                        ? "bg-amber-700 text-slate-900 border border-amber-500"
                        : "bg-slate-950 border border-amber-900/60 text-amber-300 hover:bg-amber-950/60"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
              {logForm.tags
                .filter((t) => !tagPool.includes(t))
                .map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className="px-2.5 py-1 rounded-full text-xs bg-amber-700 text-slate-900 border border-amber-500"
                  >
                    {t} ✕
                  </button>
                ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                maxLength={24}
                placeholder="自定义标签(回车确认)"
                className="flex-1 bg-slate-950 border border-amber-900/60 rounded px-2 py-1 text-xs text-amber-100"
              />
              <button
                type="button"
                onClick={addCustomTag}
                disabled={!customTag.trim()}
                className="px-3 py-1 rounded bg-amber-950/60 border border-amber-900/60 text-amber-300 text-xs hover:bg-amber-900/60 disabled:opacity-50"
              >
                添加
              </button>
            </div>
          </div>
          {/* ZEN: 跳过印证 */}
          {isZen && sealProgress && !sealProgress.graduated && (
            <label className="flex items-center gap-2 text-xs text-amber-300/80">
              <input
                type="checkbox"
                checked={logForm.skipSealCredit}
                onChange={(e) => setLogForm({ ...logForm, skipSealCredit: e.target.checked })}
              />
              <span>仅机械打卡, 不计入三十印印证 (适合无参悟时)</span>
            </label>
          )}
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
