import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { fetchMyMembership, checkin, fetchLevels, type MembershipData, type LevelInfo } from "@/lib/api";
import { toast } from "@/lib/toast";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";

const LEVEL_GRADIENTS = [
  "from-gray-400 to-gray-500",
  "from-blue-400 to-blue-600",
  "from-purple-400 to-purple-600",
  "from-amber-400 to-amber-600",
  "from-rose-400 to-rose-600",
];

export default function Membership() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const nav = useNavigate();
  const [data, setData] = useState<MembershipData | null>(null);
  const [levels, setLevels] = useState<LevelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkinLoading, setCheckinLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [m, l] = await Promise.all([fetchMyMembership(), fetchLevels()]);
      setData(m);
      setLevels(l);
    } catch {
      setError(t("membership.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCheckin = async () => {
    setCheckinLoading(true);
    try {
      const res = await checkin();
      const msg = t("membership.checkinSuccess", { points: String(res.points) })
        + (res.bonus > 0 ? t("membership.checkinBonus", { streak: String(res.streak), bonus: String(res.bonus) }) : "");
      toast.success(msg);
      load();
    } catch {
      toast.error(t("membership.checkinFailed"));
    } finally {
      setCheckinLoading(false);
    }
  };

  if (loading) return <><PageHeader title={t("membership.myLevel")} /><LoadingSpinner /></>;
  if (error) return <><PageHeader title={t("membership.myLevel")} /><ErrorState message={error} onRetry={load} /></>;

  const nextLevel = levels.find(l => l.level === (data?.level ?? 0) + 1);
  const currentLevel = levels.find(l => l.level === data?.level);
  const progress = nextLevel ? Math.min(100, ((data?.totalPoints ?? 0) / nextLevel.minPoints) * 100) : 100;
  const gradient = LEVEL_GRADIENTS[Math.min((data?.level ?? 0), LEVEL_GRADIENTS.length - 1)];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("membership.myLevel")} />

      {/* Level card */}
      <div className={`mx-4 mt-3 rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">{user?.nickname ?? t("common.anonymousUser")}</p>
            <p className="text-2xl font-bold mt-1">{currentLevel?.name ?? `Lv.${data?.level ?? 0}`}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">{t("membership.availablePoints")}</p>
            <p className="text-3xl font-extrabold">{data?.availablePoints ?? 0}</p>
          </div>
        </div>
        {nextLevel && (
          <div className="mt-4">
            <div className="flex justify-between text-xs opacity-80 mb-1">
              <span>{t("membership.pointsToNext", { n: String(nextLevel.minPoints - (data?.totalPoints ?? 0)), level: nextLevel.name })}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Check-in */}
      <div className="mx-4 mt-4">
        <button
          onClick={handleCheckin}
          disabled={checkinLoading}
          className="w-full py-3 bg-[var(--color-primary)] text-white font-semibold rounded-xl disabled:opacity-50"
        >
          {checkinLoading ? t("membership.checkingIn") : t("membership.dailyCheckin")}
        </button>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mx-4 mt-4">
        {[
          { label: t("membership.pointsHistory"), icon: "📊", path: "/membership" },
          { label: t("membership.pointsMall"), icon: "🎁", path: "/points-mall" },
          { label: t("membership.inviteFriends"), icon: "👥", path: "/membership" },
        ].map((a) => (
          <button key={a.label} onClick={() => a.path && nav(a.path)} className="bg-white rounded-xl p-3 text-center shadow-sm">
            <span className="text-2xl">{a.icon}</span>
            <p className="text-xs text-gray-600 mt-1">{a.label}</p>
          </button>
        ))}
      </div>

      {/* Level perks */}
      {levels.length > 0 && (
        <div className="mx-4 mt-5">
          <h3 className="font-semibold text-gray-900 mb-3">{t("membership.levelPerks")}</h3>
          <div className="space-y-2">
            {levels.map(l => (
              <div key={l.level} className={`bg-white rounded-xl p-3 border ${l.level === data?.level ? "border-[var(--color-primary)]" : "border-transparent"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{l.name}</span>
                  {l.level === data?.level && <span className="text-xs bg-[var(--color-primary)] text-white px-2 py-0.5 rounded-full">{t("membership.current")}</span>}
                </div>
                <p className="text-xs text-gray-400 mt-1">{t("membership.requiredPoints")}: {l.minPoints}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {l.perks.map((p, i) => <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-6" />
    </div>
  );
}
