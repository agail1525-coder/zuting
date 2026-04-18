import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPgCase, type PersonalGrowthCase } from "@/lib/api";

const GOLD = "#8B6914";

export default function PersonalGrowthCaseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PersonalGrowthCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchPgCase(slug)
      .then(setData)
      .catch(() => setError("案例不存在"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#8B6914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-sm text-red-600">{error ?? "未找到"}</p>
        <Link to="/personal-growth" className="text-xs text-[#8B6914]">返回列表</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf5] pb-24">
      <div
        className="px-5 pt-6 pb-6 text-white"
        style={{ background: `linear-gradient(135deg, #1A1200 0%, ${GOLD} 100%)` }}
      >
        <p className="text-[11px] font-bold tracking-[2px] text-[#D4A855]">PERSONAL GROWTH · CASE</p>
        <h1 className="text-2xl font-bold mt-2">{data.teamName}</h1>
        <p className="text-xs text-white/80 mt-1">
          🏢 {data.orgType}
          {data.industry ? ` · ${data.industry}` : ""}
          {data.headcount ? ` · ${data.headcount}人团队` : ""}
        </p>
        {data.theme && (
          <Link
            to={`/personal-growth/${data.theme.slug}`}
            className="inline-block mt-3 px-3 py-1 bg-white/15 rounded-lg text-xs font-semibold"
          >
            相关主题：{data.theme.title}
          </Link>
        )}
      </div>

      <div className="p-4 space-y-4">
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-2">蜕变故事</h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{data.story}</p>
        </section>

        {data.highlights && data.highlights.length > 0 && (
          <section className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3">关键收获</h3>
            <ul className="space-y-2">
              {data.highlights.map((h, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span style={{ color: GOLD }}>✓</span>
                  <span className="leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.testimonial && (
          <section className="bg-[#fefbf5] border border-[#f3e8d0] rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">学员见证</h3>
            <p className="text-sm text-gray-700 italic leading-relaxed">"{data.testimonial}"</p>
          </section>
        )}

        {data.photos && data.photos.length > 0 && (
          <section className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3">案例图片</h3>
            <div className="grid grid-cols-2 gap-2">
              {data.photos.map((p, i) => (
                <img key={i} src={p} alt="" className="w-full aspect-[4/3] object-cover rounded-lg bg-gray-100" />
              ))}
            </div>
          </section>
        )}

        {data.videoUrl && (
          <section className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-2">视频回顾</h3>
            <a
              href={data.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 text-white rounded-lg text-sm font-semibold"
              style={{ backgroundColor: GOLD }}
            >
              ▶️ 观看视频
            </a>
          </section>
        )}
      </div>
    </div>
  );
}
