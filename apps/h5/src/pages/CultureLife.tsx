import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";

interface Question {
  id: string;
  code: string;
  title: string;
  question: string;
  philosophicalDepth?: string;
}

export default function CultureLife() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/culture-life/questions?limit=30`)
      .then((r) => r.json())
      .then((r) => setItems(r.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("page.cultureLife.title")} subtitle={t("page.cultureLife.subtitle")} />
      <div className="max-w-2xl mx-auto px-4 py-4">
        {loading ? <LoadingSpinner /> : (
          <div className="grid gap-3">
            {items.map((q) => (
              <Link key={q.id} to={`/culture-life/${q.code}`}
                className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3264ff] to-[#2850cc] flex items-center justify-center text-white text-lg shrink-0">🌱</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{q.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 italic">"{q.question}"</p>
                    {q.philosophicalDepth && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{q.philosophicalDepth}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
