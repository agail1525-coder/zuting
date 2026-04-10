"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  fetchCultivationMine,
  submitCultivationApplication,
  redeemCultivationInvite,
  type CultivationMineResponse,
} from "@/lib/api";

const TRADITIONS = [
  { value: "ZEN", label: "禅宗" },
  { value: "TIBETAN", label: "藏传" },
  { value: "TAOISM", label: "道家" },
  { value: "CONFUCIANISM", label: "儒家" },
  { value: "HINDUISM", label: "印度" },
  { value: "SIKHISM", label: "锡克" },
  { value: "CHRISTIANITY", label: "基督" },
  { value: "JUDAISM", label: "犹太" },
  { value: "ISLAM", label: "伊斯兰" },
  { value: "BAHAI", label: "巴哈伊" },
  { value: "SHINTO", label: "神道" },
  { value: "INDIGENOUS", label: "原住民" },
];

export default function CultivationApplyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mine, setMine] = useState<CultivationMineResponse | null>(null);
  const [tab, setTab] = useState<"apply" | "invite">("apply");
  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");
  const [primaryTradition, setPrimaryTradition] = useState("ZEN");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login?redirect=/trips/cultivation/apply");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetchCultivationMine().then(setMine).catch(() => setMine(null));
  }, [user]);

  // Already has access — redirect to compass
  useEffect(() => {
    if (mine?.hasAccess) router.replace("/trips/cultivation");
  }, [mine, router]);

  const onSubmitApply = async () => {
    setError(null);
    setSuccess(null);
    if (motivation.trim().length < 50) {
      setError("修行动机至少需要 50 字");
      return;
    }
    setSubmitting(true);
    try {
      await submitCultivationApplication({
        motivation: motivation.trim(),
        experience: experience.trim() || undefined,
        primaryTradition,
      });
      setSuccess("申请已提交，请耐心等待管理员审核");
      const fresh = await fetchCultivationMine();
      setMine(fresh);
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  const onRedeem = async () => {
    setError(null);
    setSuccess(null);
    if (!code.trim()) {
      setError("请输入邀请码");
      return;
    }
    setSubmitting(true);
    try {
      const res = await redeemCultivationInvite(code.trim());
      setSuccess(`兑换成功！已获得 ${res.role} 角色，正在跳转...`);
      setTimeout(() => router.push("/trips/cultivation"), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "兑换失败");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        加载中...
      </div>
    );
  }

  const pendingApp = mine?.application?.status === "PENDING" ? mine.application : null;
  const rejectedApp = mine?.application?.status === "REJECTED" ? mine.application : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a06] via-[#1a1410] to-[#0f0a06] text-amber-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-24">
        <Link href="/trips" className="text-amber-300/60 text-sm hover:text-amber-300">
          ← 返回行程
        </Link>

        <div className="mt-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">☸</span>
            <h1 className="text-3xl font-bold">圆满之路 · 修行圈</h1>
          </div>
          <p className="text-amber-100/60 leading-relaxed">
            这是一个需要管理员授权或导师邀请的深度修行子系统。以禅宗为主线，融通 12
            文化传统，七境界×十牛图陪你走完圆满之路。
          </p>
        </div>

        {pendingApp && (
          <div className="mb-6 rounded-2xl border border-blue-400/30 bg-blue-500/10 p-5">
            <div className="font-semibold text-blue-200 mb-1">⏳ 申请审核中</div>
            <p className="text-blue-100/70 text-sm leading-relaxed">
              你已于 {new Date(pendingApp.createdAt).toLocaleDateString()} 提交申请，管理员将在 1-3
              个工作日内审核。审核通过后会通过站内信通知你。
            </p>
          </div>
        )}

        {rejectedApp && (
          <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-5">
            <div className="font-semibold text-rose-200 mb-1">未通过</div>
            <p className="text-rose-100/70 text-sm leading-relaxed">
              {rejectedApp.rejectionReason || "申请未通过，可在 30 天后重新提交"}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-amber-950/40 border border-amber-900/50">
          <button
            onClick={() => setTab("apply")}
            disabled={!!pendingApp}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === "apply"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow"
                : "text-amber-200/60 hover:text-amber-200 disabled:opacity-30"
            }`}
          >
            提交申请
          </button>
          <button
            onClick={() => setTab("invite")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === "invite"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow"
                : "text-amber-200/60 hover:text-amber-200"
            }`}
          >
            兑换邀请码
          </button>
        </div>

        {tab === "apply" && !pendingApp && (
          <div className="space-y-5 rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6">
            <div>
              <label className="block text-sm font-semibold text-amber-200 mb-2">
                修行动机 <span className="text-amber-400">*</span>
                <span className="ml-2 text-xs text-amber-100/40 font-normal">≥50 字</span>
              </label>
              <textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="请说明你为什么希望加入修行圈..."
                className="w-full rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-500"
              />
              <div className="text-right text-xs text-amber-100/30 mt-1">
                {motivation.length} / 2000
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-200 mb-2">
                既往修行经验 <span className="text-amber-100/40 text-xs font-normal">(可选)</span>
              </label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="例如：禅坐 3 年、读过《坛经》..."
                className="w-full rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-200 mb-2">主修文化</label>
              <div className="grid grid-cols-3 gap-2">
                {TRADITIONS.map((tr) => (
                  <button
                    key={tr.value}
                    type="button"
                    onClick={() => setPrimaryTradition(tr.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      primaryTradition === tr.value
                        ? "bg-amber-500/30 border border-amber-400 text-amber-100"
                        : "bg-amber-950/30 border border-amber-900/50 text-amber-100/60 hover:border-amber-700"
                    }`}
                  >
                    {tr.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onSubmitApply}
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
            >
              {submitting ? "提交中..." : "提交申请"}
            </button>
          </div>
        )}

        {tab === "invite" && (
          <div className="space-y-5 rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6">
            <div>
              <label className="block text-sm font-semibold text-amber-200 mb-2">邀请码</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="例如：ZEN-A1B2C3"
                maxLength={32}
                className="w-full rounded-xl bg-amber-950/40 border border-amber-900/50 px-4 py-3 text-amber-50 text-lg tracking-widest font-mono placeholder-amber-100/30 focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-xs text-amber-100/50 leading-relaxed">
              邀请码由修行导师 (MENTOR) 或祖师 (MASTER) 生成，每月限发 5 张。兑换成功后立即获得对应角色。
            </p>
            <button
              onClick={onRedeem}
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
            >
              {submitting ? "兑换中..." : "立即兑换"}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-emerald-200 text-sm">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
