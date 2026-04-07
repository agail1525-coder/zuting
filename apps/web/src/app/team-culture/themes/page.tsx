import type { Metadata } from "next";
import Link from "next/link";
import { listThemes } from "@/lib/api/team-culture";
import TeamThemeCard from "../components/TeamThemeCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "文化主题包 | 团队文化打造 | Joinus",
  description: "6 大文化主题包：同心 / 感恩 / 传承 / 匠心 / 慈悲 / 坚毅",
};

export default async function Page() {
  let themes: Awaited<ReturnType<typeof listThemes>>["items"] = [];
  let error = false;
  try {
    const res = await listThemes(1, 24);
    themes = res.items;
  } catch {
    error = true;
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
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">文化主题包</h1>
        <p className="text-white/60 mb-10 max-w-2xl">
          6 大主题，每一个都有完整的共修仪式、推荐圣地、配套服务。选一个最契合你团队当下需要的。
        </p>
        {error ? (
          <div className="p-10 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
            数据加载失败，请稍后重试
          </div>
        ) : themes.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white/5 border border-white/10 text-center text-white/50">
            暂无主题包
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((th) => (
              <TeamThemeCard key={th.id} theme={th} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
