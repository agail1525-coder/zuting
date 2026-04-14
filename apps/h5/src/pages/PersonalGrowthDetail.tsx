import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";

interface Theme {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  color?: string;
  icon?: string;
  coverUrl?: string;
  keywords?: string[];
  rituals?: Array<{ name: string; description?: string; durationMin?: number }>;
  richContent?: {
    philosophy?: { title?: string; body?: string; quotes?: Array<{ text: string; source?: string; translation?: string }> };
    testimonials?: Array<{ name: string; role?: string; company?: string; before?: string; after?: string; quote?: string }>;
  };
}

export default function PersonalGrowthDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_BASE}/api/personal-growth/themes/${slug}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="p-8 text-center text-gray-500">未找到<Link to="/personal-growth" className="text-[#3264ff] ml-2">返回</Link></div>;

  const color = data.color || "#8B6914";

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={data.title} subtitle={data.subtitle} />
      {data.coverUrl && (
        <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${data.coverUrl})` }} />
      )}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {data.description && (
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-gray-700 leading-relaxed">{data.description}</p>
          </div>
        )}

        {data.richContent?.philosophy && (
          <section className="rounded-xl p-4" style={{ backgroundColor: `${color}10` }}>
            <h3 className="font-semibold text-base mb-2" style={{ color }}>
              {data.richContent.philosophy.title || "哲学底蕴"}
            </h3>
            {data.richContent.philosophy.body && (
              <p className="text-sm text-gray-700 leading-relaxed">{data.richContent.philosophy.body}</p>
            )}
            {data.richContent.philosophy.quotes && data.richContent.philosophy.quotes.length > 0 && (
              <div className="mt-3 space-y-2">
                {data.richContent.philosophy.quotes.map((q, i) => (
                  <blockquote key={i} className="pl-3 border-l-2 text-xs text-gray-600 italic" style={{ borderColor: color }}>
                    "{q.text}"
                    {q.source && <div className="text-[10px] text-gray-400 mt-1 not-italic">— {q.source}</div>}
                  </blockquote>
                ))}
              </div>
            )}
          </section>
        )}

        {data.rituals && data.rituals.length > 0 && (
          <section className="bg-white rounded-xl p-4">
            <h3 className="font-semibold text-base mb-3">🧘 七日仪轨</h3>
            <div className="space-y-2">
              {data.rituals.map((r, i) => (
                <div key={i} className="border-l-2 pl-3" style={{ borderColor: color }}>
                  <p className="font-medium text-sm text-gray-900">{r.name}
                    {r.durationMin && <span className="text-xs text-gray-400 ml-2">{r.durationMin}分钟</span>}
                  </p>
                  {r.description && <p className="text-xs text-gray-600 mt-1">{r.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.richContent?.testimonials && data.richContent.testimonials.length > 0 && (
          <section className="bg-white rounded-xl p-4">
            <h3 className="font-semibold text-base mb-3">💬 学员见证</h3>
            <div className="space-y-3">
              {data.richContent.testimonials.map((t, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">{t.name}
                    {t.role && <span className="text-xs text-gray-500 font-normal"> · {t.role}</span>}
                  </p>
                  {t.quote && <p className="text-sm text-gray-700 italic mt-2">"{t.quote}"</p>}
                  {t.after && <p className="text-xs text-gray-600 mt-1">改变：{t.after}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
