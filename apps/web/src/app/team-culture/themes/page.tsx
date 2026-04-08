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
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3264ff] via-[#4a7aff] to-[#1e4dcc]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-24">
          <Link
            href="/team-culture"
            className="text-white/90 hover:text-white mb-6 inline-block font-medium"
          >
            ← 返回团队文化
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">文化主题包</h1>
          <p className="text-white/90 max-w-2xl text-lg">
            6 大主题，每一个都有完整的共修仪式、推荐圣地、配套服务。选一个最契合你团队当下需要的。
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-6">
        {error ? (
          <div className="p-10 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-center">
            数据加载失败，请稍后重试
          </div>
        ) : themes.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-gray-200 shadow-sm text-center text-gray-500">
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
