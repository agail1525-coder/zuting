import type { Metadata } from "next";
import { listThemes } from "@/lib/api/family-harmony";
import FamilyThemeCard from "../components/FamilyThemeCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "和谐主题 | 家庭和谐 | Joinus",
  description: "六大家庭和谐主题：同心·传家·和解·感恩·守护·归根",
};

export default async function Page() {
  const res = await listThemes(1, 20).catch(() => ({ items: [] as never[] }));
  const themes = Array.isArray(res) ? res : (res?.items ?? []);

  return (
    <main className="min-h-screen bg-[#FEFAF3] text-gray-900">
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="mb-4">
          <Link href="/family-harmony" className="text-[#2D8B6F] hover:text-[#1B5E4A] text-sm">
            ← 家庭和谐
          </Link>
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">
          和谐主题
        </h1>
        <p className="text-gray-500 mb-12 max-w-2xl">
          每个主题由不同信仰智慧驱动，适合不同家庭关系的滋养与修复
        </p>
        {themes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏠</div>
            <p className="text-gray-500">主题包即将上线</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((th) => (
              <FamilyThemeCard key={th.id} theme={th} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
