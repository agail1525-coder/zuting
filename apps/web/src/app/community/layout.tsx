import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "旅行者社区",
  description:
    "探索祖庭圣地，分享旅途故事，结识同路人。旅行攻略、问答互助、照片墙、排行榜。",
  openGraph: {
    title: "旅行者社区 | Joinus",
    description: "探索祖庭圣地，分享旅途故事，结识同路人",
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
