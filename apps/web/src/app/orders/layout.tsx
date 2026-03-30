import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "我的订单",
  description: "查看和管理你的朝圣行程订单、支付状态和退款记录。",
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
