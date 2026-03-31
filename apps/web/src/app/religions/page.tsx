import { fetchReligions, fetchHolySites, fetchTemples, fetchPatriarchs, type Religion, type HolySite, type Temple, type Patriarch } from "@/lib/api";
import Link from "next/link";
import ReligionCard from "@/components/ReligionCard";
import MobileNav from "@/components/MobileNav";
import DataLoadError from "@/components/DataLoadError";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "十二大信仰 - 探索全球12大宗教文化",
  description:
    "探索佛教、道教、基督教、伊斯兰教、印度教、犹太教、儒教、锡克教、神道教、藏传佛教、原住民灵性、巴哈伊教等十二大信仰传统。",
  openGraph: {
    title: "十二大信仰 - 全球12大宗教文化 | 祖庭之旅",
    description: "探索佛教、道教、基督教、伊斯兰教等十二大信仰传统，了解各信仰的起源、发展与核心教义。",
    url: "https://zuting.fszyl.top/religions",
  },
  alternates: { canonical: "https://zuting.fszyl.top/religions" },
};

export default async function ReligionsPage() {
  let religions: Religion[] = [];
  let holySites: HolySite[] = [];
  let temples: Temple[] = [];
  let patriarchs: Patriarch[] = [];
  let error = false;
  try {
    const results = await Promise.all([
      fetchReligions(),
      fetchHolySites(),
      fetchTemples(),
      fetchPatriarchs(),
    ]);
    religions = Array.isArray(results[0]) ? results[0] : [];
    holySites = Array.isArray(results[1]) ? results[1] : [];
    temples = Array.isArray(results[2]) ? results[2] : [];
    patriarchs = Array.isArray(results[3]) ? results[3] : [];
  } catch {
    error = true;
  }

  // Stats per religion
  const religionStats = religions.map((r) => ({
    ...r,
    siteCount: holySites.filter((s) => s.religionId === r.id).length,
    templeCount: temples.filter((t) => t.religionId === r.id).length,
    patriarchCount: patriarchs.filter((p) => p.religionId === r.id).length,
  }));

  const totalSites = holySites.length;
  const totalTemples = temples.length;
  const totalPatriarchs = patriarchs.length;
  const totalCountries = [...new Set(holySites.map((s) => s.country).filter(Boolean))].length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="hero-bg text-white pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-blue-200 text-sm font-medium tracking-widest uppercase mb-3">Twelve Great Faiths</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">十二大信仰</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            跨越千年时空，探索塑造人类文明的12大宗教传统。从东方禅意到西方灵修，每一种信仰都是智慧的结晶。
          </p>
          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            <div>
              <p className="text-3xl font-bold">{religions.length}</p>
              <p className="text-blue-200 text-sm">大信仰传统</p>
            </div>
            <div className="w-px bg-blue-400/30 hidden sm:block" />
            <div>
              <p className="text-3xl font-bold">{totalSites}</p>
              <p className="text-blue-200 text-sm">文化圣地</p>
            </div>
            <div className="w-px bg-blue-400/30 hidden sm:block" />
            <div>
              <p className="text-3xl font-bold">{totalTemples}</p>
              <p className="text-blue-200 text-sm">历史祖庭</p>
            </div>
            <div className="w-px bg-blue-400/30 hidden sm:block" />
            <div>
              <p className="text-3xl font-bold">{totalPatriarchs}</p>
              <p className="text-blue-200 text-sm">历代祖师</p>
            </div>
            <div className="w-px bg-blue-400/30 hidden sm:block" />
            <div>
              <p className="text-3xl font-bold">{totalCountries}</p>
              <p className="text-blue-200 text-sm">覆盖国家</p>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 -mt-10 relative z-10 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">深度文化解读</h3>
              <p className="text-sm text-gray-500">每种信仰配备专业的历史溯源、核心教义和文化影响分析</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">全球圣地网络</h3>
              <p className="text-sm text-gray-500">覆盖{totalCountries}个国家的{totalSites}处朝圣圣地，精准GPS定位</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">朝圣路线规划</h3>
              <p className="text-sm text-gray-500">精心设计的文化路线，串联各信仰核心圣地与祖庭</p>
            </div>
          </div>
        </div>
      </section>

      {/* Religion Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">探索十二大信仰</h2>
            <p className="text-gray-500 text-sm mt-1">点击任一信仰，深入了解其历史、圣地与祖师</p>
          </div>
          <Link href="/map" className="text-sm text-[#0066FF] hover:text-[#0052CC] font-medium flex items-center gap-1">
            地图浏览
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {error ? (
          <DataLoadError />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {religionStats.map((r) => (
              <Link key={r.id} href={`/religions/${r.slug}`}>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer h-full flex flex-col items-center justify-center text-center gap-3 min-h-[180px]">
                  {r.symbol && (
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {r.symbol}
                    </span>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors">
                      {r.name}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">{r.nameEn}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {r.siteCount > 0 && <span>{r.siteCount}圣地</span>}
                    {r.templeCount > 0 && <span>{r.templeCount}祖庭</span>}
                    {r.patriarchCount > 0 && <span>{r.patriarchCount}祖师</span>}
                  </div>
                  <div
                    className="w-8 h-1 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: r.color || "#0066FF" }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Religion Detail Table */}
      {religions.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">信仰概览</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-4 font-semibold text-gray-700">信仰</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">圣地</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">祖庭</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">祖师</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {religionStats.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{r.symbol}</span>
                          <div>
                            <p className="font-medium text-gray-900">{r.name}</p>
                            <p className="text-xs text-gray-400">{r.nameEn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-blue-50 text-[#0066FF] font-medium text-xs">
                          {r.siteCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-green-50 text-green-600 font-medium text-xs">
                          {r.templeCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-medium text-xs">
                          {r.patriarchCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/religions/${r.slug}`} className="text-[#0066FF] hover:text-[#0052CC] text-sm font-medium">
                          探索 →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* FAQ / Knowledge Section */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">常见问题</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { q: "十二大信仰是如何选定的？", a: "基于全球信徒数量、历史影响力和文化遗产丰富度，涵盖佛教、道教、基督教、伊斯兰教、印度教、犹太教、儒教、锡克教、神道教、藏传佛教、原住民灵性及巴哈伊教。" },
            { q: "什么是祖庭？", a: "祖庭是各宗教宗派的发源地或祖师曾经弘法的核心道场，是信仰传承的根据地，承载着宗派最纯正的法脉传承。" },
            { q: "如何规划朝圣之旅？", a: "可以通过我们的AI智能规划师，根据您的信仰偏好、时间预算和体力状况，自动生成最优朝圣路线。也可以直接选择我们精心设计的精品路线。" },
            { q: "平台支持哪些语言？", a: "目前支持中文、英文、日文、韩文、泰文、印地文和阿拉伯文共7种语言，覆盖全球主要朝圣群体。" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="hero-bg rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">开始你的信仰探索之旅</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            加入全球100,000+朝圣者，探索千年智慧，走进世界各地的神圣殿堂
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/routes" className="px-8 py-3 bg-white text-[#0066FF] rounded-xl font-bold hover:bg-blue-50 transition-colors">
              浏览朝圣路线
            </Link>
            <Link href="/chat" className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/20">
              AI智能规划
            </Link>
          </div>
        </div>
      </section>

      <MobileNav />
    </div>
  );
}
