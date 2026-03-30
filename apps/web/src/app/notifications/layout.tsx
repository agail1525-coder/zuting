import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "通知",
  description: "查看系统通知、行程提醒、评价回复和促销活动通知。",
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
