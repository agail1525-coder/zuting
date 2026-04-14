import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";

interface Perspective {
  id: string;
  religionName: string;
  religionColor?: string;
  religionSymbol?: string;
  masterQuote?: string;
  scriptureQuote?: string;
  summary?: string;
}

interface QuestionDetail {
  id: string;
  code: string;
  title: string;
  question: string;
  philosophicalDepth?: string;
  perspectives: Perspective[];
}

export default function CultureLifeDetail() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    fetch(`${API_BASE}/api/culture-life/questions/${code}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="p-8 text-center text-gray-500">未找到<Link to="/culture-life" className="text-[#3264ff] ml-2">返回</Link></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={data.title} subtitle={data.question} />
      <div className="max-w-2xl mx-auto px-4 py-4">
        {data.philosophicalDepth && (
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 mb-4 border border-blue-100">
            <p className="text-sm text-gray-700 leading-relaxed">{data.philosophicalDepth}</p>
          </div>
        )}
        <h3 className="font-semibold text-gray-900 mb-2">12 文化的视角</h3>
        <div className="space-y-3">
          {(data.perspectives || []).map((p) => (
            <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{p.religionSymbol}</span>
                <span className="font-semibold text-sm" style={{ color: p.religionColor || "#3264ff" }}>{p.religionName}</span>
              </div>
              {p.summary && <p className="text-sm text-gray-700 leading-relaxed">{p.summary}</p>}
              {p.scriptureQuote && (
                <blockquote className="mt-2 pl-3 border-l-2 border-gray-200 text-xs text-gray-500 italic">{p.scriptureQuote}</blockquote>
              )}
              {p.masterQuote && (
                <p className="mt-2 text-xs text-gray-600">🧘 {p.masterQuote}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
