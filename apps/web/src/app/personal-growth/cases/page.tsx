import type { Metadata } from "next";
import Link from "next/link";
import { listCases } from "@/lib/api/personal-growth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "蜕变案例 | 企业家个人圆满 | Joinus",
  description: "真实企业家的蜕变故事——从迷茫到觉醒、从焦虑到定力",
};

export default async function Page() {
  const res = await listCases(1, 20).catch(() => ({ items: [] as never[] }));
  const cases = Array.isArray(res) ? res : (res?.items ?? []);

  return (
    <main className="min-h-screen bg-[#FFFBF0] text-gray-900">
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="mb-4">
          <Link href="/personal-growth" className="text-[#8B6914] hover:text-[#A67C1E] text-sm">
            ← 个人成长
          </Link>
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">蜕变案例</h1>
        <p className="text-gray-500 mb-12">真实企业家的觉醒故事</p>

        {cases.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📖</div>
            <p className="text-gray-500">案例即将上线</p>
            <Link
              href="/personal-growth"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#8B6914] text-white rounded-lg font-semibold hover:bg-[#A67C1E] transition-all"
            >
              返回个人成长 →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {cases.map((c) => (
              <Link
                key={c.id}
                href={`/personal-growth/cases/${c.slug}`}
                className="block p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#8B6914]/30 transition-all"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">{c.teamName}</h3>
                <p className="text-gray-500 text-sm line-clamp-3 mb-4">{c.story}</p>
                {c.theme && (
                  <span className="px-2 py-1 text-xs rounded bg-amber-50 text-[#8B6914]">
                    {c.theme.title}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
