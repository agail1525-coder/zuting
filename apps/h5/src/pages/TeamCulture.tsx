import { useEffect, useState } from "react";
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
}

export default function TeamCulture() {
  const [items, setItems] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/team-culture/themes?limit=20`)
      .then((r) => r.json())
      .then((r) => setItems(r.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="团队文化" subtitle="企业兴旺 · 文化落地" />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {loading ? <LoadingSpinner /> : items.map((t) => (
          <div key={t.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
            {t.coverUrl && (
              <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${t.coverUrl})` }} />
            )}
            <div className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: `${t.color || "#3264ff"}20` }}>
                {t.icon || "🏢"}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{t.title}</h3>
                {t.subtitle && <p className="text-sm text-gray-600 mt-0.5">{t.subtitle}</p>}
                {t.description && <p className="text-xs text-gray-500 mt-2 line-clamp-3">{t.description}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
