import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "我的收藏夹",
  description: "收藏圣地、祖庭和祖师，规划你的文化之旅。管理你的心愿清单。",
};

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
