import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
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
}

export default function PersonalGrowth() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/personal-growth/themes?limit=20`)
      .then((r) => r.json())
      .then((r) => setItems(r.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("page.personalGrowth.title")} subtitle={t("page.personalGrowth.subtitle")} />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {loading ? <LoadingSpinner /> : items.map((t) => (
          <Link key={t.id} to={`/personal-growth/${t.slug}`}
            className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {t.coverUrl && (
              <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${t.coverUrl})` }} />
            )}
            <div className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: `${t.color || "#8B6914"}20` }}>
                {t.icon || "🌅"}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{t.title}</h3>
                {t.subtitle && <p className="text-sm text-gray-600 mt-0.5">{t.subtitle}</p>}
                {t.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{t.description}</p>}
                {t.keywords && t.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.keywords.slice(0, 4).map((k) => (
                      <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{k}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
