import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import { toast } from "@/lib/toast";

interface ReferralData {
  code?: string;
  totalInvited?: number;
  totalRewards?: number;
  pendingRewards?: number;
}

export default function Referral() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const token = localStorage.getItem("token") || "";
    Promise.allSettled([
      fetch(`${API_BASE}/api/referral/my-code`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_BASE}/api/referral/stats`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([codeRes, statsRes]) => {
      const code = codeRes.status === "fulfilled" ? codeRes.value : null;
      const stats = statsRes.status === "fulfilled" ? statsRes.value : null;
      setData({ code: code?.code, ...(stats || {}) });
    }).finally(() => setLoading(false));
  }, [user]);

  const copyLink = () => {
    if (!data?.code) return;
    const link = `${window.location.origin}/register?ref=${data.code}`;
    navigator.clipboard.writeText(link).then(() => toast.success("邀请链接已复制"));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title={t("page.referral.title")} subtitle={t("page.referral.subtitle")} />
        <div className="p-8 text-center text-gray-500">
          请先<Link to="/login" className="text-[#3264ff] ml-1">登录</Link>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t("page.referral.title")} subtitle={t("page.referral.subtitle")} />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="bg-gradient-to-br from-[#3264ff] to-[#2850cc] rounded-2xl p-6 text-white">
          <p className="text-sm text-white/80 mb-1">我的邀请码</p>
          <p className="text-3xl font-mono font-bold tracking-wider">{data?.code || "—"}</p>
          <button onClick={copyLink}
            className="mt-4 px-4 py-2 bg-white text-[#3264ff] rounded-full font-semibold text-sm">
            复制邀请链接 📋
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{data?.totalInvited ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">已邀请</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-[#3264ff]">{data?.totalRewards ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">累计佣金</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-500">{data?.pendingRewards ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">待结算</p>
          </div>
        </div>

        <section className="bg-white rounded-xl p-4">
          <h3 className="font-semibold text-base mb-2">🎁 分销规则</h3>
          <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-5">
            <li>好友通过你的邀请链接注册，自动建立分销关系</li>
            <li>好友完成首单，你将获得订单金额 5% 的佣金</li>
            <li>每邀请一位好友注册，奖励 50 积分</li>
            <li>佣金满 100 元可申请提现</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
