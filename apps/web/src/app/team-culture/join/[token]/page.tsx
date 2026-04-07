"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getAccessToken } from "@/lib/auth";
import { acceptInvite } from "@/lib/api/team-culture";

export default function JoinPage() {
  const { token: inviteToken } = useParams<{ token: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const token = typeof window !== "undefined" ? getAccessToken() : null;
  const [state, setState] = useState<"idle" | "joining" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || !token) {
      router.replace(
        `/login?redirect=${encodeURIComponent(`/team-culture/join/${inviteToken}`)}`,
      );
      return;
    }
    setState("joining");
    acceptInvite(token, inviteToken)
      .then((res) => {
        setTeamId(res.teamId);
        setState("ok");
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "加入失败");
        setState("error");
      });
  }, [user, token, loading, inviteToken, router]);

  return (
    <main className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full p-10 rounded-2xl bg-white/5 border border-white/10 text-center">
        {state === "joining" && <p className="text-white/70">正在加入团队...</p>}
        {state === "ok" && teamId && (
          <>
            <div className="text-5xl text-[#D4A855] mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-3">已成功加入团队</h2>
            <Link
              href={`/team-culture/dashboard/${teamId}`}
              className="inline-block mt-4 px-6 py-3 bg-[#D4A855] text-[#0f172a] font-semibold rounded-lg"
            >
              进入团队工作台
            </Link>
          </>
        )}
        {state === "error" && (
          <>
            <div className="text-5xl text-red-400 mb-4">✕</div>
            <h2 className="text-2xl font-bold mb-3">加入失败</h2>
            <p className="text-white/60 mb-4">{error}</p>
            <Link
              href="/team-culture"
              className="inline-block text-[#D4A855] hover:underline"
            >
              返回团队文化首页
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
