import type { Metadata } from "next";
import { listThemes } from "@/lib/api/personal-growth";
import GrowthThemeCard from "../components/GrowthThemeCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "成长主题 | 个人圆满 | Joinus",
  description: "六大企业家心灵成长主题：觉醒·定力·格局·重生·慈悲·传灯",
};

export default async function Page() {
  const res = await listThemes(1, 20).catch(() => ({ items: [] as never[] }));
  const themes = Array.isArray(res) ? res : (res?.items ?? []);

  return (
    <main className="min-h-screen bg-[#FFFBF0] text-gray-900">
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="mb-4">
          <Link href="/personal-growth" className="text-[#8B6914] hover:text-[#A67C1E] text-sm">
            ← 个人圆满
          </Link>
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">
          成长主题
        </h1>
        <p className="text-gray-500 mb-12 max-w-2xl">
          每个主题对应企业家不同人生阶段的核心挑战，由深度文化智慧驱动
        </p>
        {themes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🧘</div>
            <p className="text-gray-500">主题包即将上线</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((th) => (
              <GrowthThemeCard key={th.id} theme={th} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
