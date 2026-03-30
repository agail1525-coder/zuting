import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "朝圣日志",
  description: "记录你的朝圣之旅，分享旅途感悟，回顾修行足迹。",
};

export default function JournalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
