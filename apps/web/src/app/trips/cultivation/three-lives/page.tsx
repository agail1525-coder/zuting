"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPkbOverview,
  updatePkbVows,
  fetchPkbEntries,
  submitPkbStruggle,
  fetchPkbRecommendations,
  updatePkbRecommendation,
  sharePkbEntry,
  draftPkbVow,
  type PkbOverview,
  type PkbEntry,
  type PkbRecommendation,
  type PkbRecommendationStatus,
  type PkbCategory,
} from "@/lib/api";

type Tab = "vows" | "struggle" | "journal" | "recs";

const CATEGORY_LABEL: Record<PkbCategory, string> = {
  PERSONAL: "个人",
  FAMILY: "家庭",
  CAREER: "事业",
  DAILY_STRUGGLE: "当下烦恼",
  GENERAL: "通用",
};

const STATUS_LABEL: Record<PkbRecommendationStatus, string> = {
  PENDING: "未读",
  READ: "已读",
  PRACTICING: "实践中",
  DONE: "已完成",
  DISMISSED: "已忽略",
};

export default function CultivationPkbPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("vows");

  const overviewQuery = useQuery({
    queryKey: ["cultivation", "pkb", "overview"],
    queryFn: fetchPkbOverview,
    staleTime: 5 * 60 * 1000,
  });
  const overview = overviewQuery.data ?? null;
  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["cultivation", "pkb"] }),
    [queryClient],
  );

  if (overviewQuery.isLoading && !overview) {
    return <div className="text-amber-200/60 py-20 text-center">加载修行库中…</div>;
  }
  if (overviewQuery.error && !overview) {
    const msg = overviewQuery.error instanceof Error ? overviewQuery.error.message : "加载失败";
    return <div className="text-rose-300 py-20 text-center">{msg}</div>;
  }
  if (!overview) return null;

  const pkb = overview.pkb;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-amber-100 mb-1">修行库</h1>
        <p className="text-amber-200/60">三生愿景 · 小鸿引经据典 · 个人修行史</p>
      </div>

      <PkbHeroStats pkb={pkb} />

      <div className="flex gap-2 border-b border-amber-900/40">
        {([
          ["vows", "愿景"],
          ["struggle", "当下烦恼"],
          ["journal", "修行日志"],
          ["recs", "推荐"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              tab === k
                ? "text-amber-100 border-b-2 border-amber-400"
                : "text-amber-200/50 hover:text-amber-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "vows" && <VowsTab overview={overview} onSaved={refresh} />}
      {tab === "struggle" && <StruggleTab onSubmitted={refresh} />}
      {tab === "journal" && <JournalTab />}
      {tab === "recs" && <RecsTab onChanged={refresh} />}
    </div>
  );
}

// ── 统计横幅 ─────────────────────────────────

function PkbHeroStats({ pkb }: { pkb: PkbOverview["pkb"] }) {
  const stats = [
    { label: "修行条目", value: pkb.entryCount },
    { label: "洞见积累", value: pkb.insightCount },
    { label: "十牛图阶段", value: `${pkb.currentOxStage}/10` },
    { label: "最近活跃", value: pkb.lastActiveAt ? new Date(pkb.lastActiveAt).toLocaleDateString() : "—" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-amber-900/40 bg-amber-950/20 px-4 py-3">
          <div className="text-xs text-amber-200/50">{s.label}</div>
          <div className="text-xl font-bold text-amber-100 mt-1">{s.value}</div>
        </div>
      ))}
    </div>
  );
}

// ── 愿景 Tab ─────────────────────────────────

type VowCat = "PERSONAL" | "FAMILY" | "CAREER";

const VOW_GUIDE_TAGS: Record<VowCat, string[]> = {
  PERSONAL: ["觉察心念", "定力", "健康长寿", "心性修养", "读书求知", "情绪自在", "独处静心", "诚实无欺", "勇气与担当", "慈悲柔软"],
  FAMILY: ["高质量陪伴", "倾听家人", "亲密关系", "教养子女", "孝敬父母", "家风传承", "情感联结", "共同成长", "化解冲突", "仪式感"],
  CAREER: ["服务众生", "创造价值", "长期主义", "诚信经营", "团队幸福", "客户至上", "布施利他", "格局与远见", "专业精进", "财富正念"],
};

const VOW_META: Record<VowCat, { icon: string; label: string; color: string; placeholder: string }> = {
  PERSONAL: { icon: "🧘", label: "个人圆满", color: "from-indigo-500 to-indigo-700", placeholder: "我想成为怎样的人？心性、修为、健康…" },
  FAMILY: { icon: "👨‍👩‍👧", label: "家庭幸福", color: "from-rose-500 to-rose-700", placeholder: "我想给家人怎样的生活？亲密关系、传承…" },
  CAREER: { icon: "🏢", label: "事业兴旺", color: "from-emerald-500 to-emerald-700", placeholder: "我想为众生创造什么价值？事业、布施…" },
};

function VowCard({
  category,
  value,
  onChange,
}: {
  category: VowCat;
  value: string;
  onChange: (v: string) => void;
}) {
  const meta = VOW_META[category];
  const [selected, setSelected] = useState<string[]>([]);
  const [drafting, setDrafting] = useState(false);
  const [draftMsg, setDraftMsg] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const onDraft = async () => {
    setDrafting(true);
    setDraftMsg(null);
    try {
      const res = await draftPkbVow({
        category,
        keywords: selected,
        currentDraft: value || undefined,
      });
      onChange(res.vow);
      setDraftMsg(
        res.source === "llm"
          ? `✨ 小鸿已为你起草 — ${res.rationale}`
          : `⚠️ ${res.rationale}`,
      );
    } catch (e) {
      setDraftMsg(e instanceof Error ? e.message : "起草失败");
    } finally {
      setDrafting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-2xl shadow-lg`}>
          {meta.icon}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-amber-100">{meta.label}</h2>
          <div className="text-xs text-amber-200/50">选择关键词 → 小鸿帮你起草</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {VOW_GUIDE_TAGS[category].map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 rounded-full text-xs border transition-all ${
              selected.includes(tag)
                ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                : "border-amber-900/50 text-amber-200/70 hover:border-amber-500"
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onDraft}
          disabled={drafting}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
        >
          {drafting ? "小鸿思考中…" : selected.length > 0 ? `🔮 让小鸿基于 ${selected.length} 个关键词起草` : "🔮 让小鸿帮我起草"}
        </button>
        {value && (
          <button
            onClick={() => onChange("")}
            className="text-xs text-amber-300/50 hover:text-amber-200"
          >
            清空
          </button>
        )}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        maxLength={2000}
        placeholder={meta.placeholder}
        className="w-full rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-500"
      />
      <div className="flex justify-between items-center mt-1">
        <div className="text-xs text-amber-200/50">
          {draftMsg ?? "💡 点击关键词组合你的方向，小鸿会为你起草一段可编辑的愿景"}
        </div>
        <div className="text-xs text-amber-100/30">{value.length} / 2000</div>
      </div>
    </div>
  );
}

function VowsTab({ overview, onSaved }: { overview: PkbOverview; onSaved: () => void }) {
  const pkb = overview.pkb;
  const [personalVow, setPersonalVow] = useState(pkb.personalVow ?? "");
  const [familyVow, setFamilyVow] = useState(pkb.familyVow ?? "");
  const [careerVow, setCareerVow] = useState(pkb.careerVow ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await updatePkbVows({ personalVow, familyVow, careerVow });
      setMsg("已保存 — 小鸿正在为你生成经论推荐…");
      setTimeout(onSaved, 1500);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const vowRecs = overview.activeRecs.filter((r) => ["PERSONAL", "FAMILY", "CAREER"].includes(r.category));

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 flex items-start gap-3">
        <div className="text-2xl">🔮</div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-indigo-200">小鸿主导觉门 · AI 方便法门</div>
          <div className="text-xs text-indigo-100/60 mt-1">
            选择你最在意的关键词，让小鸿为你起草一段诚恳可践行的愿景文字 — 你可以随时编辑或让小鸿重新起草。
          </div>
        </div>
      </div>

      <VowCard category="PERSONAL" value={personalVow} onChange={setPersonalVow} />
      <VowCard category="FAMILY" value={familyVow} onChange={setFamilyVow} />
      <VowCard category="CAREER" value={careerVow} onChange={setCareerVow} />

      <button
        onClick={onSave}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
      >
        {saving ? "保存中…" : "保存三生愿景 → 触发小鸿经论推荐"}
      </button>
      {msg && <div className="text-sm text-amber-200/70 text-center">{msg}</div>}

      {vowRecs.length > 0 && (
        <div className="rounded-2xl border border-amber-900/40 bg-amber-950/10 p-5 space-y-3">
          <div className="text-sm font-semibold text-amber-100">📖 小鸿为你挑选的经论</div>
          {vowRecs.slice(0, 6).map((r) => (
            <div key={r.id} className="rounded-lg bg-amber-950/30 border border-amber-900/30 p-3">
              <div className="text-xs text-amber-200/50">{CATEGORY_LABEL[r.category]}</div>
              <div className="text-amber-100 font-medium">{r.title}</div>
              <div className="text-xs text-amber-200/60 mt-1">{r.reason}</div>
              {r.scriptureSlug && (
                <a href={`/trips/cultivation/scriptures/${r.scriptureSlug}`} className="text-xs text-amber-400 hover:text-amber-300 mt-2 inline-block">查看经论 →</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 烦恼 Tab ─────────────────────────────────

function StruggleTab({ onSubmitted }: { onSubmitted: () => void }) {
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<PkbCategory>("DAILY_STRUGGLE");
  const [tags, setTags] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [reply, setReply] = useState<{ text: string; dailyPractice: string; cited: Array<{ slug: string; title: string; tradition: string | null; summary?: string | null }> } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const quickTags = ["焦虑", "迷茫", "愤怒", "关系", "工作", "金钱", "健康", "存在感"];

  const onSend = async () => {
    if (message.trim().length < 5) {
      setErr("请详细描述你的烦恼 (至少 5 个字)");
      return;
    }
    setSending(true);
    setErr(null);
    setReply(null);
    try {
      const res = await submitPkbStruggle({ message, category, tags });
      setReply({ text: res.reply, dailyPractice: res.dailyPractice, cited: res.citedScriptures.map((c) => ({ slug: c.slug, title: c.title, tradition: c.tradition, summary: c.summary })) });
      onSubmitted();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "发送失败");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-5">
        <label className="text-sm font-semibold text-amber-100 mb-2 block">告诉小鸿你的困惑</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="最近困扰你的事情… 可以是一件小事，也可以是一个长期的挣扎"
          className="w-full rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-500"
        />
        <div className="text-right text-xs text-amber-100/30 mt-1">{message.length} / 2000</div>

        <div className="mt-3 flex flex-wrap gap-2">
          {quickTags.map((t) => (
            <button
              key={t}
              onClick={() => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
              className={`px-3 py-1 rounded-full text-xs border transition-all ${
                tags.includes(t)
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "border-amber-900/50 text-amber-200/70 hover:border-amber-500"
              }`}
            >
              #{t}
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-2 items-center">
          <span className="text-xs text-amber-200/50">维度</span>
          {(["DAILY_STRUGGLE", "PERSONAL", "FAMILY", "CAREER"] as PkbCategory[]).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-xs border ${
                category === c ? "bg-amber-900/40 border-amber-500 text-amber-100" : "border-amber-900/40 text-amber-200/60"
              }`}
            >
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        <button
          onClick={onSend}
          disabled={sending}
          className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
        >
          {sending ? "小鸿思考中… (最多 3 分钟)" : "送给小鸿 · 引经据典回应"}
        </button>
        {err && <div className="mt-3 text-sm text-rose-300">{err}</div>}
      </div>

      {reply && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-5 space-y-4">
          <div className="text-sm font-semibold text-emerald-200">🙏 小鸿的回应</div>
          <div className="whitespace-pre-wrap text-amber-50 text-sm leading-relaxed">{reply.text}</div>
          {reply.dailyPractice && (
            <div className="rounded-xl bg-amber-950/30 border border-amber-500/30 px-4 py-3">
              <div className="text-xs text-amber-400/80 mb-1">📿 今日功课</div>
              <div className="text-amber-100">{reply.dailyPractice}</div>
            </div>
          )}
          {reply.cited.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-amber-200/50">📖 引经据典</div>
              {reply.cited.map((c) => (
                <a
                  key={c.slug}
                  href={`/trips/cultivation/scriptures/${c.slug}`}
                  className="block rounded-lg bg-amber-950/30 border border-amber-900/40 p-3 hover:border-amber-500/50"
                >
                  <div className="text-amber-100 font-medium">《{c.title}》</div>
                  {c.tradition && <div className="text-xs text-amber-200/50">{c.tradition}</div>}
                  {c.summary && <div className="text-xs text-amber-200/70 mt-1 line-clamp-2">{c.summary}</div>}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 日志 Tab ─────────────────────────────────

function JournalTab() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<PkbCategory | "ALL">("ALL");

  const entriesQuery = useQuery({
    queryKey: ["cultivation", "pkb", "entries", filter],
    queryFn: () =>
      fetchPkbEntries({
        category: filter === "ALL" ? undefined : filter,
        pageSize: 30,
      }),
    staleTime: 60 * 1000,
  });
  const items: PkbEntry[] = entriesQuery.data?.items ?? [];
  const loading = entriesQuery.isLoading;
  const err = entriesQuery.error instanceof Error ? entriesQuery.error.message : null;

  const onShare = async (id: string) => {
    try {
      await sharePkbEntry(id, {});
      queryClient.setQueryData<{ items: PkbEntry[] } | undefined>(
        ["cultivation", "pkb", "entries", filter],
        (prev) =>
          prev
            ? { ...prev, items: prev.items.map((e) => (e.id === id ? { ...e, isShared: true } : e)) }
            : prev,
      );
      alert("已标记为可分享");
    } catch (e) {
      alert(e instanceof Error ? e.message : "分享失败");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(["ALL", "DAILY_STRUGGLE", "PERSONAL", "FAMILY", "CAREER"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1 text-xs rounded-full border ${
              filter === c ? "bg-amber-900/40 border-amber-500 text-amber-100" : "border-amber-900/40 text-amber-200/60"
            }`}
          >
            {c === "ALL" ? "全部" : CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      {loading && <div className="text-amber-200/60 py-8 text-center">加载中…</div>}
      {err && <div className="text-rose-300 py-4">{err}</div>}
      {!loading && items.length === 0 && <div className="text-amber-200/50 py-8 text-center">暂无修行条目，去「当下烦恼」提一个问题开始</div>}

      <div className="space-y-3">
        {items.map((e) => (
          <div key={e.id} className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-amber-900/30 text-amber-300">{CATEGORY_LABEL[e.category]}</span>
                <span className="text-xs text-amber-200/40">{new Date(e.createdAt).toLocaleString()}</span>
              </div>
              {!e.isShared && e.kind === "CHAT" && (
                <button onClick={() => onShare(e.id)} className="text-xs text-amber-400 hover:text-amber-300">
                  分享到社区
                </button>
              )}
              {e.isShared && <span className="text-xs text-emerald-400">已分享</span>}
            </div>
            <div className="text-amber-100 font-medium">{e.title}</div>
            <div className="text-sm text-amber-200/70 mt-1 line-clamp-3 whitespace-pre-wrap">{e.content}</div>
            {e.mood && <div className="text-xs text-amber-300/70 mt-2">心境: {e.mood}</div>}
            {Array.isArray(e.citedChapterRefs) && e.citedChapterRefs.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {e.citedChapterRefs.map((r, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-amber-950/50 text-amber-300/80 border border-amber-900/40">
                    《{r.title ?? "经论"}》
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 推荐 Tab ─────────────────────────────────

function RecsTab({ onChanged }: { onChanged: () => void }) {
  const queryClient = useQueryClient();
  const recsQuery = useQuery({
    queryKey: ["cultivation", "pkb", "recs"],
    queryFn: fetchPkbRecommendations,
    staleTime: 60 * 1000,
  });
  const recs: PkbRecommendation[] = recsQuery.data ?? [];
  const loading = recsQuery.isLoading;

  const update = async (id: string, status: PkbRecommendationStatus) => {
    try {
      await updatePkbRecommendation(id, status);
      await queryClient.invalidateQueries({ queryKey: ["cultivation", "pkb"] });
      onChanged();
    } catch (e) {
      alert(e instanceof Error ? e.message : "更新失败");
    }
  };

  const columns: PkbRecommendationStatus[] = ["PENDING", "READ", "PRACTICING", "DONE"];

  if (loading) return <div className="text-amber-200/60 py-8 text-center">加载中…</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {columns.map((col) => {
        const list = recs.filter((r) => r.status === col);
        return (
          <div key={col} className="rounded-2xl border border-amber-900/40 bg-amber-950/10 p-3 min-h-[200px]">
            <div className="text-xs font-bold text-amber-200 mb-3 px-1">{STATUS_LABEL[col]} ({list.length})</div>
            <div className="space-y-2">
              {list.map((r) => (
                <div key={r.id} className="rounded-lg bg-amber-950/40 border border-amber-900/40 p-3">
                  <div className="text-xs text-amber-200/50">{CATEGORY_LABEL[r.category]}</div>
                  <div className="text-amber-100 font-medium text-sm">{r.title}</div>
                  <div className="text-xs text-amber-200/60 mt-1 line-clamp-2">{r.reason}</div>
                  {r.scriptureSlug && (
                    <a href={`/trips/cultivation/scriptures/${r.scriptureSlug}`} className="text-xs text-amber-400 hover:text-amber-300 mt-2 inline-block">
                      前往经论 →
                    </a>
                  )}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {col === "PENDING" && (
                      <button onClick={() => update(r.id, "READ")} className="text-[10px] px-2 py-0.5 rounded border border-amber-900/50 text-amber-200 hover:bg-amber-900/30">
                        已读
                      </button>
                    )}
                    {col === "READ" && (
                      <button onClick={() => update(r.id, "PRACTICING")} className="text-[10px] px-2 py-0.5 rounded border border-amber-900/50 text-amber-200 hover:bg-amber-900/30">
                        开始实践
                      </button>
                    )}
                    {col === "PRACTICING" && (
                      <button onClick={() => update(r.id, "DONE")} className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/30">
                        完成
                      </button>
                    )}
                    {col !== "DONE" && (
                      <button onClick={() => update(r.id, "DISMISSED")} className="text-[10px] px-2 py-0.5 rounded border border-amber-900/40 text-amber-200/50 hover:text-amber-200">
                        忽略
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
