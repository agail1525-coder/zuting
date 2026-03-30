import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "小鸿 AI 助手",
  description:
    "AI 旅行助手小鸿，为您解答宗教文化问题、推荐朝圣路线、规划行程。",
  openGraph: {
    title: "小鸿 AI 助手 | Joinus",
    description: "AI 旅行助手，解答宗教文化问题，推荐朝圣路线",
  },
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
