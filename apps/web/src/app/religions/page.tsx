import { fetchReligions, type Religion } from "@/lib/api";
import ReligionCard from "@/components/ReligionCard";
import MobileNav from "@/components/MobileNav";
import DataLoadError from "@/components/DataLoadError";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "十二大信仰 - 探索全球12大宗教文化",
  description:
    "探索佛教、道教、基督教、伊斯兰教、印度教、犹太教、儒教、锡克教、神道教、藏传佛教、原住民灵性、巴哈伊教等十二大信仰传统。Explore 12 world faiths including Buddhism, Taoism, Christianity, Islam, and more.",
  openGraph: {
    title: "十二大信仰 - 全球12大宗教文化 | 祖庭之旅",
    description:
      "探索佛教、道教、基督教、伊斯兰教等十二大信仰传统，了解各信仰的起源、发展与核心教义。",
    url: "https://zuting.fszyl.top/religions",
  },
  alternates: {
    canonical: "https://zuting.fszyl.top/religions",
  },
};

export default async function ReligionsPage() {
  let religions: Religion[] = [];
  let error = false;
  try {
    religions = await fetchReligions();
  } catch {
    error = true;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-temple-800 via-temple-900 to-temple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold mb-4">
            十二大信仰
          </h1>
          <p className="text-temple-400 text-lg">Twelve Great Faiths of the World</p>
        </div>

        {error ? (
          <DataLoadError />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {religions.map((r) => (
              <ReligionCard key={r.id} religion={r} />
            ))}
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
