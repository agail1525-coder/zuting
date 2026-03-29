"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  fetchMyInviteCode,
  fetchReferralStats,
  fetchMyTeam,
  fetchMyRewards,
  type InviteCodeData,
  type ReferralStats,
  type TeamMember,
  type ReferralRewardItem,
} from "@/lib/api";

function formatDate(str: string) {
  return new Date(str).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatPrice(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`;
}

type TabKey = "level1" | "level2" | "rewards";

export default function ReferralPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [inviteCode, setInviteCode] = useState<InviteCodeData | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [level1, setLevel1] = useState<TeamMember[]>([]);
  const [level2, setLevel2] = useState<TeamMember[]>([]);
  const [rewards, setRewards] = useState<ReferralRewardItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("level1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [code, st, team, rew] = await Promise.all([
        fetchMyInviteCode(),
        fetchReferralStats(),
        fetchMyTeam(),
        fetchMyRewards(1),
      ]);
      setInviteCode(code);
      setStats(st);
      setLevel1(Array.isArray(team.level1) ? team.level1 : []);
      setLevel2(Array.isArray(team.level2) ? team.level2 : []);
      setRewards(Array.isArray(rew.items) ? rew.items : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const handleCopy = () => {
    if (!inviteCode?.code) return;
    navigator.clipboard.writeText(inviteCode.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    if (!inviteCode?.code) return;
    const text = `我正在使用JOINUS探索世界祖庭圣地，邀请你加入！邀请码：${inviteCode.code}`;
    if (navigator.share) {
      navigator.share({ title: "加入JOINUS", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#0066FF]/30 border-t-[#0066FF] rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "level1", label: "一级下线", count: level1.length || undefined },
    { key: "level2", label: "二级下线", count: level2.length || undefined },
    { key: "rewards", label: "奖励记录", count: rewards.length || undefined },
  ];

  const statusColor: Record<string, string> = {
    PENDING: "text-yellow-600 bg-yellow-50",
    SETTLED: "text-green-600 bg-green-50",
    CANCELLED: "text-gray-500 bg-gray-100",
  };
  const statusLabel: Record<string, string> = {
    PENDING: "待结算",
    SETTLED: "已结算",
    CANCELLED: "已取消",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">分销中心</h1>
        <p className="text-gray-500 text-sm mt-1">邀请好友，共享收益</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
      )}

      {/* Invite Code Hero */}
      <div className="bg-gradient-to-br from-[#0066FF] to-[#0052CC] rounded-2xl p-6 text-white">
        <p className="text-blue-100 text-sm mb-2">我的专属邀请码</p>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl font-bold tracking-widest text-[#D4A855]">
            {inviteCode?.code ?? "------"}
          </span>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors border border-white/30"
          >
            {copied ? "已复制" : "复制"}
          </button>
          <button
            onClick={handleShare}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors border border-white/30"
          >
            分享
          </button>
        </div>
        <p className="text-xs text-blue-200">分享给好友，好友注册填写邀请码即可建立分销关系</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "总邀请人数", value: stats.totalInvites, unit: "人" },
            { label: "一级下线", value: stats.level1Count, unit: "人" },
            { label: "二级下线", value: stats.level2Count, unit: "人" },
            { label: "累计收益", value: formatPrice(stats.totalRewards), unit: "" },
            { label: "本月收益", value: formatPrice(stats.monthlyRewards), unit: "", accent: true },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.accent ? "text-[#D4A855]" : "text-gray-900"}`}>
                {s.value}{s.unit}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Team Tabs */}
      <div>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white text-[#0066FF] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span className="ml-1.5 text-xs bg-[#0066FF] text-white rounded-full px-1.5 py-0.5">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Level 1 */}
        {activeTab === "level1" && (
          <div className="space-y-2">
            {level1.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
                暂无一级下线，快去邀请好友吧
              </div>
            ) : (
              level1.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0066FF]/10 flex items-center justify-center text-[#0066FF] font-bold text-sm">
                      {m.inviteeId.slice(-2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">用户 {m.inviteeId.slice(0, 8)}</p>
                      <p className="text-xs text-gray-400">加入于 {formatDate(m.createdAt)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">一级</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Level 2 */}
        {activeTab === "level2" && (
          <div className="space-y-2">
            {level2.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
                暂无二级下线
              </div>
            ) : (
              level2.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-sm">
                      {m.inviteeId.slice(-2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">用户 {m.inviteeId.slice(0, 8)}</p>
                      <p className="text-xs text-gray-400">加入于 {formatDate(m.createdAt)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">二级</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Rewards */}
        {activeTab === "rewards" && (
          <div className="space-y-2">
            {rewards.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
                暂无奖励记录
              </div>
            ) : (
              rewards.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {r.level === 1 ? "一级" : "二级"}返佣 · 订单 {r.orderId.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-green-600">+{formatPrice(r.amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[r.status] ?? "text-gray-500 bg-gray-100"}`}>
                      {statusLabel[r.status] ?? r.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
