"use client";

import { useEffect, useState } from "react";
import { fetchThreeLives, updateThreeLives, type ThreeLifeVision } from "@/lib/api";

export default function ThreeLivesPage() {
  const [data, setData] = useState<ThreeLifeVision | null>(null);
  const [personalGoal, setPersonalGoal] = useState("");
  const [familyGoal, setFamilyGoal] = useState("");
  const [businessGoal, setBusinessGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchThreeLives()
      .then((v) => {
        setData(v);
        setPersonalGoal(v.personalGoal ?? "");
        setFamilyGoal(v.familyGoal ?? "");
        setBusinessGoal(v.businessGoal ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"));
  }, []);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateThreeLives({ personalGoal, familyGoal, businessGoal });
      setData(updated);
      setSuccess("已保存");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const fields: {
    key: "personalGoal" | "familyGoal" | "businessGoal";
    icon: string;
    label: string;
    placeholder: string;
    color: string;
    value: string;
    setter: (v: string) => void;
  }[] = [
    {
      key: "personalGoal",
      icon: "🧘",
      label: "个人圆满",
      color: "from-indigo-500 to-indigo-700",
      placeholder: "我想成为怎样的人？心性、修为、健康...",
      value: personalGoal,
      setter: setPersonalGoal,
    },
    {
      key: "familyGoal",
      icon: "👨‍👩‍👧",
      label: "家庭幸福",
      color: "from-rose-500 to-rose-700",
      placeholder: "我想给家人怎样的生活？亲密关系、传承...",
      value: familyGoal,
      setter: setFamilyGoal,
    },
    {
      key: "businessGoal",
      icon: "🏢",
      label: "事业兴旺",
      color: "from-emerald-500 to-emerald-700",
      placeholder: "我想为众生创造什么价值？事业、布施...",
      value: businessGoal,
      setter: setBusinessGoal,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-amber-100 mb-1">三生愿景</h1>
        <p className="text-amber-200/60">个人 · 家庭 · 事业 — 起大愿，发大财，布施众生</p>
      </div>

      {data?.reviewedAt && (
        <div className="text-xs text-amber-200/40">
          上次更新：{new Date(data.reviewedAt).toLocaleString()}
        </div>
      )}

      <div className="space-y-5">
        {fields.map((f) => (
          <div key={f.key} className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl shadow-lg`}
              >
                {f.icon}
              </div>
              <h2 className="text-lg font-bold text-amber-100">{f.label}</h2>
            </div>
            <textarea
              value={f.value}
              onChange={(e) => f.setter(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder={f.placeholder}
              className="w-full rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-500"
            />
            <div className="text-right text-xs text-amber-100/30 mt-1">{f.value.length} / 1000</div>
          </div>
        ))}
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
      >
        {saving ? "保存中..." : "保存三生愿景"}
      </button>

      {success && (
        <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-emerald-200 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
