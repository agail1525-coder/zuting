import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "朝圣者社区",
  description:
    "分享旅行故事，探索宗教文化，结识同路人。游记攻略、问答互助、照片墙、排行榜。",
  openGraph: {
    title: "朝圣者社区 | Joinus",
    description: "分享旅行故事，探索宗教文化，结识同路人",
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
