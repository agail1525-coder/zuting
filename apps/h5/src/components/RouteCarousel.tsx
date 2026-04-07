import { useNavigate } from "react-router-dom";
import type { Route } from "@/lib/api";

interface Props {
  title: string;
  routes: Route[];
}

export default function RouteCarousel({ title, routes }: Props) {
  const nav = useNavigate();

  if (routes.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-base font-bold text-gray-900 mx-4 mb-3">{title}</h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
        {routes.map((r) => (
          <div
            key={r.id ?? r.slug}
            onClick={() => nav(`/routes/${r.slug}`)}
            className="flex-shrink-0 w-56 bg-white rounded-xl shadow-sm overflow-hidden active:opacity-80"
          >
            {r.coverImage ? (
              <img src={r.coverImage} alt={r.title} className="w-full h-28 object-cover" />
            ) : (
              <div className="w-full h-28 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-2xl">
                🗺️
              </div>
            )}
            <div className="p-3">
              <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{r.title}</h4>
              <p className="text-xs text-gray-500 mt-1">
                {r.duration}天 · {r.difficulty || "EASY"}
              </p>
              <p className="text-sm font-bold text-orange-600 mt-1">
                ¥{r.priceFrom?.toLocaleString()}<span className="text-xs font-normal text-gray-400">/人起</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
