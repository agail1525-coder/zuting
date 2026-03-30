import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "会员中心",
  description: "管理你的会员等级、积分、签到记录和专属权益。",
};

export default function MembershipLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
