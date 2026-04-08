import type { Metadata } from "next";
import Link from "next/link";
import { listCases } from "@/lib/api/family-harmony";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "家庭故事 | 家庭和谐 | Joinus",
  description: "真实家庭的和谐故事——从疏离到亲密、从冲突到和解",
};

export default async function Page() {
  const res = await listCases(1, 20).catch(() => ({ items: [] as never[] }));
  const cases = Array.isArray(res) ? res : (res?.items ?? []);

  return (
    <main className="min-h-screen bg-[#FEFAF3] text-gray-900">
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="mb-4">
          <Link href="/family-harmony" className="text-[#2D8B6F] hover:text-[#1B5E4A] text-sm">
            ← 家庭和谐
          </Link>
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">家庭故事</h1>
        <p className="text-gray-500 mb-12">真实家庭的和谐故事</p>

        {cases.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📖</div>
            <p className="text-gray-500">家庭故事即将上线</p>
            <Link
              href="/family-harmony"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#2D8B6F] text-white rounded-lg font-semibold hover:bg-[#247259] transition-all"
            >
              返回家庭和谐 →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {cases.map((c) => (
              <Link
                key={c.id}
                href={`/family-harmony/cases/${c.slug}`}
                className="block p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#2D8B6F]/30 transition-all"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">{c.teamName}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{c.story}</p>
                {c.theme && (
                  <span className="px-2 py-1 text-xs rounded bg-emerald-50 text-[#2D8B6F]">
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
