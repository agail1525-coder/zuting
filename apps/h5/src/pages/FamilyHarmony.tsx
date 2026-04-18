import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchFhThemes,
  fetchFhCases,
  type FamilyHarmonyTheme,
  type FamilyHarmonyCase,
} from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";

const JADE = "#2D8B6F";
const JADE_LIGHT = "#6EBFA4";

type Tab = "themes" | "cases";

export default function FamilyHarmony() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("themes");
  const [themes, setThemes] = useState<FamilyHarmonyTheme[]>([]);
  const [cases, setCases] = useState<FamilyHarmonyCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchFhThemes(1, 12).catch(() => null), fetchFhCases(1, 12).catch(() => null)])
      .then(([th, cs]) => {
        setThemes(th?.items ?? []);
        setCases(cs?.items ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <PageHeader title={t("page.familyHarmony.title")} subtitle={t("page.familyHarmony.subtitle")} />

      <div
        className="px-5 pt-5 pb-6 text-center"
        style={{ background: `linear-gradient(135deg, #0D2E22 0%, #1C4A3A 100%)` }}
      >
        <p className="text-[11px] font-bold tracking-[2px]" style={{ color: JADE_LIGHT }}>
          M35 · FAMILY HARMONY
        </p>
        <h2 className="text-2xl font-bold text-white mt-2">
          家庭<span style={{ color: JADE_LIGHT }}>幸福</span>
        </h2>
        <p className="text-xs text-white/80 mt-2 leading-relaxed">
          家族之道六境<br />同心 · 传家 · 和解 · 感恩 · 守护 · 归根
        </p>
      </div>

      <div className="flex gap-2 px-4 py-3 bg-white border-b border-gray-100 sticky top-14 z-10">
        {(["themes", "cases"] as Tab[]).map((k) => {
          const active = tab === k;
          return (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                active ? "text-white" : "bg-gray-100 text-gray-700"
              }`}
              style={active ? { backgroundColor: JADE } : undefined}
            >
              {k === "themes" ? "六大主题" : "家族案例"}
            </button>
          );
        })}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <LoadingSpinner />
        ) : tab === "themes" ? (
          themes.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">暂无主题</div>
          ) : (
            themes.map((th) => (
              <Link
                key={th.id}
                to={`/family-harmony/${th.slug}`}
                className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                style={{ borderLeft: `4px solid ${th.color || JADE}` }}
              >
                {th.coverUrl && (
                  <div
                    className="h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url(${th.coverUrl})` }}
                  />
                )}
                <div className="p-4 flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: `${th.color || JADE}20` }}
                  >
                    {th.icon || "🌿"}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{th.title}</h3>
                    {th.subtitle && <p className="text-sm text-gray-600 mt-0.5">{th.subtitle}</p>}
                    {th.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{th.description}</p>
                    )}
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      {th.durationDays ? <span>⏱ {th.durationDays}天</span> : null}
                      {th.priceFrom ? (
                        <span className="font-semibold" style={{ color: JADE }}>
                          ￥{th.priceFrom.toLocaleString()}起
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )
        ) : cases.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">暂无案例</div>
        ) : (
          cases.map((c) => (
            <Link
              key={c.id}
              to={`/family-harmony/cases/${c.slug}`}
              className="block bg-[#f0fbf6] border border-[#cde7dd] rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold" style={{ color: JADE }}>
                  🏡 {c.orgType}
                </span>
                {c.theme && (
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-bold"
                    style={{ backgroundColor: `${c.theme.color || JADE}22`, color: c.theme.color || JADE }}
                  >
                    {c.theme.title}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-gray-900">{c.teamName}</h3>
              <p className="text-sm text-gray-600 mt-1.5 line-clamp-3 leading-relaxed">{c.story}</p>
              {c.highlights && c.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {c.highlights.slice(0, 3).map((h, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white border border-[#cde7dd] rounded text-[11px]"
                      style={{ color: JADE }}
                    >
                      ✓ {h}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
