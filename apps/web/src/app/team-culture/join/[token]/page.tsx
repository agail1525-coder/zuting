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
    <main className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full p-10 rounded-2xl bg-white border border-gray-200 shadow-lg text-center">
        {state === "joining" && <p className="text-gray-600">正在加入团队...</p>}
        {state === "ok" && teamId && (
          <>
            <div className="text-5xl text-[#3264ff] mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">已成功加入团队</h2>
            <Link
              href={`/team-culture/dashboard/${teamId}`}
              className="inline-block mt-4 px-6 py-3 bg-[#3264ff] text-white font-semibold rounded-lg hover:bg-[#1e4dcc] shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
            >
              进入团队工作台
            </Link>
          </>
        )}
        {state === "error" && (
          <>
            <div className="text-5xl text-red-500 mb-4">✕</div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">加入失败</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link
              href="/team-culture"
              className="inline-block text-[#3264ff] hover:text-[#1e4dcc] hover:underline font-medium"
            >
              返回团队文化首页
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
