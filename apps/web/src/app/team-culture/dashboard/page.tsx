"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getAccessToken } from "@/lib/auth";
import { getMyTeams, createTeam, type TeamSummary } from "@/lib/api/team-culture";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const token = typeof window !== "undefined" ? getAccessToken() : null;
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [orgType, setOrgType] = useState("ENTERPRISE");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !token) {
      router.replace(`/login?redirect=${encodeURIComponent("/team-culture/dashboard")}`);
      return;
    }
    setFetching(true);
    getMyTeams(token)
      .then((list) => setTeams(list))
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"))
      .finally(() => setFetching(false));
  }, [user, token, loading, router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token || submitting) return;
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const t = await createTeam(token, { name: name.trim(), orgType });
      setTeams((prev) => [{ ...t, role: "OWNER", _count: { members: 1, certificates: 0 } } as TeamSummary, ...prev]);
      setShowCreate(false);
      setName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "创建失败");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || fetching) {
    return (
      <main className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        <div className="text-white/60">加载中...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <section className="py-16 max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">我的团队</h1>
            <p className="text-white/60">管理你创建或加入的所有朝圣团队</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-[#D4A855] text-[#0f172a] font-semibold rounded-lg hover:bg-[#E5B968] transition"
          >
            + 创建团队
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
            {error}
          </div>
        )}

        {teams.length === 0 ? (
          <div className="p-16 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-6xl mb-4">☸</div>
            <h3 className="text-xl font-bold mb-2">还没有团队</h3>
            <p className="text-white/60 mb-6">
              创建第一个团队，开启团队文化之旅
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-[#D4A855] text-[#0f172a] font-semibold rounded-lg"
            >
              创建团队
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((t) => (
              <Link
                key={t.id}
                href={`/team-culture/dashboard/${t.id}`}
                className="block p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4A855]/60 transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  {t.logoUrl ? (
                    <img
                      src={t.logoUrl}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#D4A855]/20 flex items-center justify-center text-[#D4A855] font-bold">
                      {t.name[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold">{t.name}</h3>
                    <div className="text-xs text-white/50">{t.orgType}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span>{t._count.members} 成员</span>
                  <span>{t._count.certificates} 证书</span>
                  <span className="ml-auto text-[#D4A855]">{t.role}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {showCreate && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="w-full max-w-md p-8 rounded-2xl bg-[#0f172a] border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-6">创建团队</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <label className="block">
                <span className="block text-sm text-white/70 mb-2">团队名称</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#020617] border border-white/10 text-white focus:border-[#D4A855] focus:outline-none"
                  maxLength={80}
                  required
                />
              </label>
              <label className="block">
                <span className="block text-sm text-white/70 mb-2">组织类型</span>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#020617] border border-white/10 text-white focus:border-[#D4A855] focus:outline-none"
                >
                  <option value="ENTERPRISE">企业</option>
                  <option value="SCHOOL">学校</option>
                  <option value="RELIGIOUS">宗教组织</option>
                  <option value="FAMILY">家族</option>
                  <option value="NGO">公益</option>
                  <option value="GOVERNMENT">政府</option>
                  <option value="OTHER">其他</option>
                </select>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-lg border border-white/20 text-white/80 hover:bg-white/5"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#D4A855] text-[#0f172a] font-semibold rounded-lg disabled:opacity-50"
                >
                  {submitting ? "创建中..." : "创建"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
