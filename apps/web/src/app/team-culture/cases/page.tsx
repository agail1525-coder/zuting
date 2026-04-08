import type { Metadata } from "next";
import Link from "next/link";
import { listCases } from "@/lib/api/team-culture";
import TeamCaseCard from "../components/TeamCaseCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "成功案例 | 团队文化打造 | Joinus",
};

export default async function Page() {
  let cases: Awaited<ReturnType<typeof listCases>>["items"] = [];
  try {
    const res = await listCases(1, 24);
    cases = res.items;
  } catch {
    /* empty */
  }
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3264ff] via-[#4a7aff] to-[#1e4dcc]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-24">
          <Link
            href="/team-culture"
            className="text-white/90 hover:text-white mb-6 inline-block font-medium"
          >
            ← 返回团队文化
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">成功案例</h1>
          <p className="text-white/90 text-lg">
            真实组织、真实故事、真实改变
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-6">
        {cases.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-gray-200 shadow-sm text-center text-gray-500">
            暂无案例
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {cases.map((c) => (
              <TeamCaseCard key={c.id} item={c} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
