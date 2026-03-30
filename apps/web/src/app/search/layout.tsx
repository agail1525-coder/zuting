import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索全球圣地、祖庭、路线、攻略和更多文化旅行内容。",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
