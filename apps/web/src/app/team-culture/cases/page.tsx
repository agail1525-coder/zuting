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
    <main className="min-h-screen bg-[#0f172a] text-white">
      <section className="py-20 max-w-7xl mx-auto px-6">
        <Link
          href="/team-culture"
          className="text-[#D4A855] hover:underline mb-6 inline-block"
        >
          ← 返回团队文化
        </Link>
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">成功案例</h1>
        <p className="text-white/60 mb-10">
          真实组织、真实故事、真实改变
        </p>
        {cases.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white/5 border border-white/10 text-center text-white/50">
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
