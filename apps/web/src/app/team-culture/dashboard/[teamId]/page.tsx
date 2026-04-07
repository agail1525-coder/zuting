"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getAccessToken } from "@/lib/auth";
import {
  getTeam,
  listTeamMembers,
  listTeamCertificates,
  inviteMember,
  type TeamSummary,
} from "@/lib/api/team-culture";

export default function TeamWorkspacePage() {
  const { teamId } = useParams<{ teamId: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const token = typeof window !== "undefined" ? getAccessToken() : null;

  const [team, setTeam] = useState<TeamSummary | null>(null);
  const [members, setMembers] = useState<Array<{ id: string; role: string; joinedAt: string; user: { id: string; nickname: string; avatar: string | null } }>>([]);
  const [certs, setCerts] = useState<Array<{ id: string; title: string; serialNo: string; issuedAt: string; pdfUrl: string | null; imageUrl: string | null }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "members" | "certificates">("overview");

  useEffect(() => {
    if (loading) return;
    if (!user || !token) {
      router.replace(`/login?redirect=${encodeURIComponent(`/team-culture/dashboard/${teamId}`)}`);
      return;
    }
    setFetching(true);
    Promise.all([
      getTeam(token, teamId),
      listTeamMembers(token, teamId),
      listTeamCertificates(token, teamId),
    ])
      .then(([t, m, c]) => {
        setTeam(t);
        setMembers(m);
        setCerts(c);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"))
      .finally(() => setFetching(false));
  }, [teamId, user, token, loading, router]);

  async function handleInvite() {
    if (!token) return;
    try {
      const res = await inviteMember(token, teamId, "MEMBER");
      const url = `${window.location.origin}/team-culture/join/${res.token}`;
      setInviteLink(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成邀请失败");
    }
  }

  if (loading || fetching) {
    return (
      <main className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        <div className="text-white/60">加载中...</div>
      </main>
    );
  }

  if (error || !team) {
    return (
      <main className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        <div className="text-red-300">{error || "团队不存在"}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <section className="py-12 max-w-6xl mx-auto px-6">
        <Link
          href="/team-culture/dashboard"
          className="text-[#D4A855] hover:underline mb-6 inline-block"
        >
          ← 返回我的团队
        </Link>

        <div className="flex items-center gap-5 mb-10">
          {team.logoUrl ? (
            <img src={team.logoUrl} alt={team.name} className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[#D4A855]/20 flex items-center justify-center text-3xl text-[#D4A855] font-bold">
              {team.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold mb-1">{team.name}</h1>
            <div className="text-white/60 text-sm">
              {team.orgType} · {team._count.members} 成员 · {team._count.certificates} 证书
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 mb-8">
          {(
            [
              { k: "overview", l: "概览" },
              { k: "members", l: "成员" },
              { k: "certificates", l: "证书" },
            ] as const
          ).map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`px-5 py-3 font-medium transition ${
                tab === t.k
                  ? "text-[#D4A855] border-b-2 border-[#D4A855]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid md:grid-cols-3 gap-5">
            <StatCard num={team._count.members} label="团队成员" />
            <StatCard num={team._count.certificates} label="文化证书" />
            <StatCard num={team.size || 0} label="组织规模" />
          </div>
        )}

        {tab === "members" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">团队成员 ({members.length})</h2>
              <button
                onClick={handleInvite}
                className="px-5 py-2 bg-[#D4A855] text-[#0f172a] font-semibold rounded-lg"
              >
                邀请成员
              </button>
            </div>
            {inviteLink && (
              <div className="mb-5 p-4 rounded-lg bg-[#D4A855]/10 border border-[#D4A855]/30">
                <p className="text-sm mb-2">邀请链接 (24h 有效):</p>
                <input
                  readOnly
                  value={inviteLink}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full px-3 py-2 rounded bg-[#0f172a] border border-white/10 text-white text-xs"
                />
              </div>
            )}
            <div className="space-y-3">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4"
                >
                  {m.user.avatar ? (
                    <img src={m.user.avatar} alt="" className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      {m.user.nickname[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{m.user.nickname}</div>
                    <div className="text-xs text-white/50">
                      加入于 {new Date(m.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-sm text-[#D4A855]">{m.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "certificates" && (
          <div>
            <h2 className="text-xl font-bold mb-5">文化证书 ({certs.length})</h2>
            {certs.length === 0 ? (
              <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center text-white/50">
                还没有证书。完成一次朝圣之旅后，由平台签发文化证书。
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {certs.map((c) => (
                  <div
                    key={c.id}
                    className="p-6 rounded-2xl bg-gradient-to-br from-[#D4A855]/10 to-transparent border border-[#D4A855]/30"
                  >
                    <div className="text-2xl text-[#D4A855] mb-2">✦</div>
                    <h3 className="font-bold mb-2">{c.title}</h3>
                    <div className="text-xs text-white/50 mb-3">
                      编号 {c.serialNo}
                    </div>
                    <div className="text-xs text-white/60">
                      签发于 {new Date(c.issuedAt).toLocaleDateString()}
                    </div>
                    {c.pdfUrl && (
                      <a
                        href={c.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-[#D4A855] hover:underline text-sm"
                      >
                        下载 PDF →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ num, label }: { num: number; label: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="text-4xl font-bold text-[#D4A855] mb-2">{num}</div>
      <div className="text-white/60">{label}</div>
    </div>
  );
}
